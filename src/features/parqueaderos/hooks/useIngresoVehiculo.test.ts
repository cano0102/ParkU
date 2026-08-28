import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Celda } from '@/services/api/celdas';
import type { Parqueadero } from '@/services/api/parqueaderos';
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
