import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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
    agregarPropietario: vi.fn().mockResolvedValue(vehiculoExistente),
    quitarPropietario: vi.fn().mockResolvedValue(vehiculoExistente),
    getUsuario: () => undefined,
    getVehiculosConductor: (id: string) => vehiculos.filter((v) => v.conductorId === id),
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
 *  como lo haya dejado el test — así cada aserción prueba solo esa validación en aislamiento. */
function llenarCamposObligatorios(result: { current: ReturnType<typeof useConductorForm> }) {
  act(() => result.current.setFormData({
    ...result.current.formData,
    nombre: 'Nuevo Conductor', tipoUsuarioId: '1',
    correo: 'nuevo.conductor@sena.edu.co', numeroTelefonico: '3105559876',
    placa: 'XYZ789', marca: 'Renault', color: 'Azul',
  }));
}

afterEach(() => vi.clearAllMocks());

describe('useConductorForm — validación de numeroDocumento', () => {
  it('rechaza un número de documento ya registrado en otro conductor con el mismo tipo de documento', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data));

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
    const { result } = renderHook(() => useConductorForm(data));

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, tipoDocumento: 'CE', numeroDocumento: '1001234567' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroDocumento).toBeUndefined();
    expect(data.addConductor).toHaveBeenCalled();
  });

  it('no marca como duplicado el propio documento del conductor que se está editando', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data));

    act(() => result.current.openEdit(conductorExistente, vehiculoExistente));
    // El formulario ya carga con el numeroDocumento del propio conductor — no debería
    // autoinvalidarse contra sí mismo.
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroDocumento).toBeUndefined();
    expect(data.updateConductor).toHaveBeenCalled();
  });

  it('rechaza un número de documento con menos de 6 dígitos', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data));

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, numeroDocumento: '123' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroDocumento).toBe('El número de documento debe tener entre 6 y 10 dígitos.');
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('exige el número de documento', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data));

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroDocumento).toBe('El número de documento es obligatorio');
    expect(data.addConductor).not.toHaveBeenCalled();
  });
});

describe('useConductorForm — validación de numeroTelefonico', () => {
  // El teléfono pasó de opcional a OBLIGATORIO: junto con el correo es el dato con el que el
  // backend resuelve (o crea) el Usuario asociado al conductor.
  it('es obligatorio: no deja guardar sin teléfono', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data));

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, numeroDocumento: '9998887776', numeroTelefonico: '' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.numeroTelefonico).toBe('El teléfono es obligatorio');
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('rechaza un teléfono con letras (antes ni siquiera se filtraban las teclas)', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data));

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
    const { result } = renderHook(() => useConductorForm(data));

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
    const { result } = renderHook(() => useConductorForm(data));

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

describe('useConductorForm — validación de placa (referencia, ya existente)', () => {
  it('rechaza una placa ya registrada en otro vehículo', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data));

    act(() => result.current.openCreate());
    act(() => result.current.setFormData({
      ...result.current.formData,
      nombre: 'Nuevo Conductor', tipoUsuarioId: '1', numeroDocumento: '9998887776',
      placa: 'ABC123', marca: 'Renault', color: 'Azul',
    }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.placa).toBe('Esta placa ya está registrada en otro vehículo');
    expect(data.addConductor).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});

describe('useConductorForm — validación de correo', () => {
  it('es obligatorio: no deja guardar sin correo', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data));

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, numeroDocumento: '9998887776', correo: '' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.correo).toBe('El correo es obligatorio');
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('rechaza un correo con formato inválido', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data));

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, numeroDocumento: '9998887776', correo: 'no-es-un-correo' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.correo).toBe('Ingresa un correo electrónico válido');
    expect(data.addConductor).not.toHaveBeenCalled();
  });

  it('acepta un correo válido y guarda', async () => {
    const data = buildData();
    const { result } = renderHook(() => useConductorForm(data));

    act(() => result.current.openCreate());
    llenarCamposObligatorios(result);
    act(() => result.current.setFormData({ ...result.current.formData, numeroDocumento: '9998887776', correo: 'valido@sena.edu.co' }));
    await act(async () => result.current.handleSave());

    expect(result.current.formErrors.correo).toBeUndefined();
    expect(data.addConductor).toHaveBeenCalledWith(expect.objectContaining({ correo: 'valido@sena.edu.co' }));
  });
});
