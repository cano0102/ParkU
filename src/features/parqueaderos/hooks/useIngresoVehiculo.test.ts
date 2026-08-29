import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Celda } from '@/services/api/celdas';
import type { Parqueadero } from '@/services/api/parqueaderos';
import type { Conductor } from '@/services/api/conductores';
import type { Vehiculo } from '@/services/api/vehiculos';
import type { ParqueaderosData } from './useParqueaderosData';
import { useIngresoVehiculo } from './useIngresoVehiculo';

const parqueadero: Parqueadero = {
  id: '4', nombre: 'Motos Torre Norte', ubicacion: '', acceso: 'regional', capacidadMaxima: 10,
  horaInicio: '06:00', horaFin: '22:00', estado: 'activo', zona: '', piso: '', descripcion: '', tipo: 'motos',
};

const celdaMoto: Celda = {
  id: '21', parqueaderoId: '4', numero: 'M-01', tipo: 'moto', usabilidad: 'general', estado: 'disponible', ocupada: false, observaciones: '',
};

// Reproduce la mezcla real encontrada en la API en vivo: un parqueadero "de motos" que
// también tiene un par de celdas de tipo bicicleta (no todas sus celdas son de moto).
const celdaBicicleta: Celda = {
  id: '28', parqueaderoId: '4', numero: 'BI-01', tipo: 'bicicleta', usabilidad: 'general', estado: 'disponible', ocupada: false, observaciones: '',
};

const conductorMaria: Conductor = {
  id: 'c1', usuarioId: '', tipoDocumento: 'CC', numeroDocumento: '123456', nombre: 'María Gómez',
  correo: 'maria@sena.edu.co', direccion: '', numeroTelefonico: '', tipoUsuarioId: '1', tipoUsuarioNombre: '',
  regionalFormacion: '', centroFormacion: '', programaFormacion: '', vigencia: '', movilidadReducida: false,
  tipoDiscapacidad: '', estado: 'activo',
};

const vehiculoDeMaria: Vehiculo = {
  id: 'v1', conductorId: 'c1', conductorNombre: 'María Gómez', placa: 'XYZ12D', tipo: 'moto',
  marca: 'Yamaha', linea: '', modelo: 2020, color: 'Roja', descripcion: '', estado: 'activo',
};

function buildData(overrides: Partial<ParqueaderosData> = {}): ParqueaderosData {
  return {
    conductores: [],
    vehiculos: [],
    controlesSalida: [],
    reservas: [],
    parqueaderos: [parqueadero],
    addVehiculo: vi.fn().mockResolvedValue('v1'),
    addControlSalida: vi.fn().mockResolvedValue(undefined),
    updateCelda: vi.fn().mockResolvedValue(undefined),
    updateReserva: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as ParqueaderosData;
}

describe('useIngresoVehiculo — celdas de tipo bicicleta/camión/bus (sin convención de placa)', () => {
  it('rechaza un carro en una celda de bicicleta con un mensaje claro, y no registra el ingreso', async () => {
    const data = buildData();
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaBicicleta, parqueadero, vi.fn()));

    let ok = false;
    await act(async () => {
      ok = await result.current.registrarEnCelda(celdaBicicleta, 'ABC123', 'Juan Pérez', false);
    });

    expect(ok).toBe(false);
    expect(result.current.placaError).toBe('Esta celda es exclusiva para bicicleta, no para automóviles.');
    expect(data.addControlSalida).not.toHaveBeenCalled();
  });

  it('rechaza también una moto en una celda de bicicleta', async () => {
    const data = buildData();
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaBicicleta, parqueadero, vi.fn()));

    let ok = false;
    await act(async () => {
      ok = await result.current.registrarEnCelda(celdaBicicleta, 'ABC12D', 'Juan Pérez', false);
    });

    expect(ok).toBe(false);
    expect(result.current.placaError).toBe('Esta celda es exclusiva para bicicleta, no para motocicletas.');
  });

  it('el indicador en vivo (ingresoPlacaOk) nunca es válido para una celda de bicicleta', () => {
    const data = buildData();
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaBicicleta, parqueadero, vi.fn()));

    act(() => result.current.setVehiculoForm((f) => ({ ...f, placa: 'ABC123' })));
    expect(result.current.ingresoPlacaOk).toBe(false);
    expect(result.current.ingresoPlacaHint).toContain('exclusiva para bicicleta');
  });

  it('sigue funcionando sin cambios para una celda de moto normal (no rompe el caso ya soportado)', async () => {
    const data = buildData();
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaMoto, parqueadero, vi.fn()));

    let ok = false;
    await act(async () => {
      ok = await result.current.registrarEnCelda(celdaMoto, 'ABC12D', 'Juan Pérez', false);
    });

    expect(ok).toBe(true);
    expect(data.addControlSalida).toHaveBeenCalled();
  });

  it('sigue rechazando un carro en una celda de moto con el mensaje original', async () => {
    const data = buildData();
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaMoto, parqueadero, vi.fn()));

    let ok = false;
    await act(async () => {
      ok = await result.current.registrarEnCelda(celdaMoto, 'ABC123', 'Juan Pérez', false);
    });

    expect(ok).toBe(false);
    expect(result.current.placaError).toBe('Esta celda es para motocicletas. La placa ingresada tiene formato de carro (ABC123).');
  });
});

describe('useIngresoVehiculo — asistente de búsqueda estructurada de conductor/vehículo', () => {
  it('sin conductor seleccionado, no exige/permite nada: ingresoConductorOk empieza en false', () => {
    const data = buildData();
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaMoto, parqueadero, vi.fn()));

    expect(result.current.conductorIdentificado).toBeNull();
    expect(result.current.ingresoConductorOk).toBe(false);
    expect(result.current.vehiculosConductor).toEqual([]);
  });

  it('seleccionarConductor identifica al conductor por id (no por texto) y acota sus vehículos', () => {
    const data = buildData({ conductores: [conductorMaria], vehiculos: [vehiculoDeMaria] });
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaMoto, parqueadero, vi.fn()));

    act(() => result.current.seleccionarConductor(conductorMaria));

    expect(result.current.conductorIdentificado?.id).toBe('c1');
    expect(result.current.ingresoConductorOk).toBe(true);
    expect(result.current.vehiculosConductor).toEqual([vehiculoDeMaria]);
    // Al elegir el conductor se limpia cualquier placa que hubiera quedado de una selección
    // anterior — todavía no hay un vehículo elegido.
    expect(result.current.vehiculoForm.placa).toBe('');
  });

  it('seleccionarVehiculo completa la placa y deja el formulario listo para enviar', () => {
    const data = buildData({ conductores: [conductorMaria], vehiculos: [vehiculoDeMaria] });
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaMoto, parqueadero, vi.fn()));

    act(() => result.current.seleccionarConductor(conductorMaria));
    act(() => result.current.seleccionarVehiculo(vehiculoDeMaria));

    expect(result.current.vehiculoForm.placa).toBe('XYZ12D');
    expect(result.current.ingresoPlacaOk).toBe(true);
    expect(result.current.ingresoValid).toBe(true);
  });

  it('cambiarConductor vuelve al paso de búsqueda y limpia la selección de vehículo', () => {
    const data = buildData({ conductores: [conductorMaria], vehiculos: [vehiculoDeMaria] });
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaMoto, parqueadero, vi.fn()));

    act(() => result.current.seleccionarConductor(conductorMaria));
    act(() => result.current.seleccionarVehiculo(vehiculoDeMaria));
    act(() => result.current.cambiarConductor());

    expect(result.current.conductorIdentificado).toBeNull();
    expect(result.current.vehiculoForm.conductor).toBe('');
    expect(result.current.vehiculoForm.placa).toBe('');
    expect(result.current.vehiculosConductor).toEqual([]);
  });

  it('dos conductores con el mismo nombre no se confunden: la selección se resuelve por id', () => {
    const conductorMariaOtra: Conductor = { ...conductorMaria, id: 'c2', numeroDocumento: '999999', correo: 'maria2@sena.edu.co' };
    const vehiculoDeLaOtraMaria: Vehiculo = { ...vehiculoDeMaria, id: 'v2', conductorId: 'c2', placa: 'AAA11B' };
    const data = buildData({
      conductores: [conductorMaria, conductorMariaOtra],
      vehiculos: [vehiculoDeMaria, vehiculoDeLaOtraMaria],
    });
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaMoto, parqueadero, vi.fn()));

    act(() => result.current.seleccionarConductor(conductorMariaOtra));

    expect(result.current.conductorIdentificado?.id).toBe('c2');
    expect(result.current.vehiculosConductor).toEqual([vehiculoDeLaOtraMaria]);
  });

  it('registrarVehiculo manda el id del conductor elegido, sin volver a resolverlo por nombre', async () => {
    const data = buildData({ conductores: [conductorMaria], vehiculos: [vehiculoDeMaria] });
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaMoto, parqueadero, vi.fn()));

    act(() => result.current.seleccionarConductor(conductorMaria));
    act(() => result.current.seleccionarVehiculo(vehiculoDeMaria));

    await act(async () => { await result.current.registrarVehiculo(); });

    expect(data.addControlSalida).toHaveBeenCalledWith(
      expect.objectContaining({ conductorId: 'c1', vehiculoId: 'v1' })
    );
  });

  it('una placa nueva (no registrada al conductor) exige marca y color antes de habilitar el envío', () => {
    const data = buildData({ conductores: [conductorMaria], vehiculos: [] });
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaMoto, parqueadero, vi.fn()));

    act(() => result.current.seleccionarConductor(conductorMaria));
    act(() => result.current.setVehiculoForm((f) => ({ ...f, placa: 'ABC12D' })));

    expect(result.current.ingresoPlacaOk).toBe(true);
    expect(result.current.ingresoValid).toBe(false);

    act(() => result.current.setVehiculoForm((f) => ({ ...f, marca: 'Suzuki', color: 'Negra' })));
    expect(result.current.ingresoValid).toBe(true);
  });

  it('un conductor inactivo sigue bloqueando el registro aunque esté seleccionado explícitamente', () => {
    const inactivo: Conductor = { ...conductorMaria, estado: 'inactivo' };
    const data = buildData({ conductores: [inactivo], vehiculos: [{ ...vehiculoDeMaria, conductorId: inactivo.id }] });
    const { result } = renderHook(() => useIngresoVehiculo(data, celdaMoto, parqueadero, vi.fn()));

    act(() => result.current.seleccionarConductor(inactivo));

    expect(result.current.ingresoConductorOk).toBe(false);
    expect(result.current.ingresoValid).toBe(false);
  });
});
