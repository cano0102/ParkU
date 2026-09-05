import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { withQueryClient } from '@/test/queryWrapper';
import { toast } from 'sonner';
import type { Conductor } from '@/services/api/conductores';
import type { Vehiculo } from '@/services/api/vehiculos';
import type { ConductoresData } from './useConductoresData';
import { useConductorForm } from './useConductorForm';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const conductorExistente: Conductor = {
  id: '1', usuarioId: '', tipoDocumento: 'CC', numeroDocumento: '1001234567', nombre: 'Andrés Torres',
  // Correo y teléfono son obligatorios al guardar un conductor (el backend resuelve/crea el
  // Usuario asociado con ellos), así que el conductor de referencia los trae completos.
  correo: 'andres.torres@sena.edu.co', direccion: '', numeroTelefonico: '3105551234', tipoUsuarioId: '1', tipoUsuarioNombre: 'Aprendiz',
  regionalFormacion: '', centroFormacion: '', programaFormacion: '', vigencia: '',
  movilidadReducida: false, tipoDiscapacidad: '', estado: 'activo',
};

const vehiculoExistente: Vehiculo = {
  id: 'v1', conductorId: '1', conductorNombre: 'Andrés Torres', placa: 'ABC123', tipo: 'carro',
  marca: 'Mazda', linea: '', modelo: null, color: 'Rojo', descripcion: '', estado: 'activo',
};

/** Construye un `ConductoresData` completo (el hook lo pide entero, no un `Pick`), con
 *  mocks razonables para las mutaciones que este archivo no ejercita. */
function buildData(overrides: Partial<ConductoresData> = {}): ConductoresData {
  const conductores = overrides.conductores ?? [conductorExistente];
  const vehiculos = overrides.vehiculos ?? [vehiculoExistente];
  return {
    conductores,
    usuarios: [],
    vehiculos,
    addConductor: vi.fn().mockResolvedValue({ ...conductorExistente, id: '2' }),
    updateConductor: vi.fn().mockResolvedValue(conductorExistente),
    addVehiculo: vi.fn().mockResolvedValue({ ...vehiculoExistente, id: 'v2' }),
    updateVehiculo: vi.fn().mockResolvedValue(vehiculoExistente),
    removeVehiculo: vi.fn().mockResolvedValue(undefined),
    agregarPropietario: vi.fn().mockResolvedValue(vehiculoExistente),
    quitarPropietario: vi.fn().mockResolvedValue(vehiculoExistente),
    getUsuario: () => undefined,
    getVehiculosConductor: (id: string) => vehiculos.filter((v) => v.conductorId === id),
    // La foto de perfil no viaja a la API (se guarda en el navegador): estos tests no la
    // ejercitan, así que basta con stubs neutros.
    fotoDeConductor: () => undefined,
    guardarFotoConductor: vi.fn(),
    totalActivos: conductores.filter((c) => c.estado === 'activo').length,
    totalVehiculos: vehiculos.length,
    totalConductores: conductores.length,
    totalCarros: vehiculos.filter((v) => v.tipo === 'carro').length,
    totalMotos: vehiculos.filter((v) => v.tipo === 'moto').length,
    isLoading: false,
    ...overrides,
  };
}

/** Completa el formulario con los campos obligatorios restantes, dejando `numeroDocumento`
 *  como lo haya dejado el test — así cada aserción prueba solo esa validación en aislamiento.
 *  `usuarioId` va puesto porque un conductor necesita cuenta salvo que sea visitante. */
function llenarCamposObligatorios(result: { current: ReturnType<typeof useConductorForm> }) {
  act(() => result.current.setFormData({
    ...result.current.formData,
    nombre: 'Nuevo Conductor', tipoUsuarioId: '1', usuarioId: '7',
    correo: 'nuevo.conductor@sena.edu.co', numeroTelefonico: '3105559876',
    placa: 'XYZ789', marca: 'Renault', color: 'Azul',
  }));
}

afterEach(() => vi.clearAllMocks());

describe('useConductorForm — validación de numeroDocumento', () => {
  it('rechaza un número de documento ya registrado en otro conductor con el mismo tipo de documento', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, tipoDocumento: 'CC', numeroDocumento: '1001234567' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroDocumento).toBe(
      'Ya existe un conductor registrado con este tipo y número de documento.'
    );
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('permite el mismo número de documento si el tipo de documento es distinto (p. ej. CC vs. CE)', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, tipoDocumento: 'CE', numeroDocumento: '1001234567' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroDocumento).toBeUndefined();
    expect(data.addConductor).toHaveBeenCalled();
  });

  it('no marca como duplicado el propio documento del conductor que se está editando', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openEdit(conductorExistente, vehiculoExistente));
    // El formulario ya carga con el numeroDocumento del propio conductor — no debería
    // autoinvalidarse contra sí mismo.
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroDocumento).toBeUndefined();
    expect(data.updateConductor).toHaveBeenCalled();
  });

  it('rechaza un número de documento con menos de 6 dígitos', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, numeroDocumento: '123' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroDocumento).toBe('El número de documento debe tener entre 6 y 10 dígitos.');
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('exige el número de documento', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroDocumento).toBe('El número de documento es obligatorio');
    expect(data.addConductor).not.toHaveBeenCalled();
  });
});

describe('useConductorForm — validación de numeroTelefonico', () => {
  // El teléfono es OPCIONAL, igual que en el resto del sistema: mucha gente no lo da, y
  // bloquear el alta por eso no protegía nada. Si se escribe, sí tiene que ser válido.
  it('es opcional: se puede guardar sin teléfono', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, numeroDocumento: '9998887776', numeroTelefonico: '' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroTelefonico).toBeUndefined();
    expect(data.addConductor).toHaveBeenCalled();
  });

  it('rechaza un teléfono con letras (antes ni siquiera se filtraban las teclas)', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({
      ...result.current.formData, numeroDocumento: '9998887776', numeroTelefonico: 'abc1234567',
    }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroTelefonico).toBe('Ingresa un número de teléfono colombiano válido (10 dígitos)');
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('rechaza un teléfono con menos de 10 dígitos', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({
      ...result.current.formData, numeroDocumento: '9998887776', numeroTelefonico: '12345',
    }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroTelefonico).toBe('Ingresa un número de teléfono colombiano válido (10 dígitos)');
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('acepta un teléfono colombiano válido de 10 dígitos', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({
      ...result.current.formData, numeroDocumento: '9998887776', numeroTelefonico: '3101234567',
    }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroTelefonico).toBeUndefined();
    expect(data.addConductor).toHaveBeenCalled();
  });
});

describe('useConductorForm — el vehículo va al crear, no al editar', () => {
  it('al CREAR se registra también el vehículo', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, numeroDocumento: '9998887776' }));
    await act(async () => result.current.handleSave());

    expect(data.addConductor).toHaveBeenCalled();
    expect(data.addVehiculo).toHaveBeenCalledWith(
      expect.objectContaining({ placa: 'XYZ789', marca: 'Renault', color: 'Azul' }),
    );
  });

  it('al CREAR, rechaza una placa ya registrada en otro vehículo', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({
      ...result.current.formData, numeroDocumento: '9998887776', placa: 'ABC123',
    }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.placa).toBe('Esta placa ya está registrada en otro vehículo');
    expect(data.addConductor).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('al EDITAR no se toca ningún vehículo: se gestiona desde su tarjeta', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openEdit(conductorExistente, vehiculoExistente));
    await act(async () => result.current.handleSave());

    expect(data.updateConductor).toHaveBeenCalled();
    expect(data.updateVehiculo).not.toHaveBeenCalled();
    expect(data.addVehiculo).not.toHaveBeenCalled();
  });
});

describe('useConductorForm — la cuenta de acceso', () => {
  it('sin cuenta y sin ser visitante, no deja guardar', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({
      ...result.current.formData, numeroDocumento: '9998887776', usuarioId: '',
    }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.usuarioId).toContain('cuenta');
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('con "no tengo usuario" exige contraseña y confirmación', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({
      ...result.current.formData, numeroDocumento: '9998887776', usuarioId: '', crearCuenta: true,
      password: '', confirmPassword: '',
    }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.password).toBeTruthy();
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('con contraseña válida, crea la cuenta junto al conductor', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({
      ...result.current.formData, numeroDocumento: '9998887776', usuarioId: '', crearCuenta: true,
      password: 'Prueba1234', confirmPassword: 'Prueba1234',
    }));
    await act(async () => result.current.handleSave());

    expect(data.addConductor).toHaveBeenCalledWith(
      expect.objectContaining({ modoCuenta: 'crear', password: 'Prueba1234' }),
    );
  });
});

describe('useConductorForm — validación de correo', () => {
  it('es obligatorio solo para CREAR la cuenta', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({
      ...result.current.formData, numeroDocumento: '9998887776', correo: '',
      usuarioId: '', crearCuenta: true, password: 'Prueba1234', confirmPassword: 'Prueba1234',
    }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.correo).toBe('El correo es obligatorio para crear la cuenta');
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('rechaza un correo con formato inválido', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, numeroDocumento: '9998887776', correo: 'no-es-un-correo' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.correo).toBe('Ingresa un correo electrónico válido');
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('acepta un correo válido y guarda', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data), { wrapper: withQueryClient() });

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, numeroDocumento: '9998887776', correo: 'valido@sena.edu.co' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.correo).toBeUndefined();
    expect(data.addConductor).toHaveBeenCalledWith(expect.objectContaining({ correo: 'valido@sena.edu.co' }));
  });
});
