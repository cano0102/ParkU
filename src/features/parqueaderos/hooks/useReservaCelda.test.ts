import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Celda } from '@/services/api/celdas';
import type { Vehiculo } from '@/services/api/vehiculos';
import type { Reserva } from '@/services/api/reservas';
import { useReservaCelda } from './useReservaCelda';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), info: vi.fn(), error: vi.fn() } }));

type ReservaCeldaData = Parameters<typeof useReservaCelda>[0];

const celdaOcupada: Celda = {
  id: '5', parqueaderoId: '1', numero: 'C-005', tipo: 'carro', usabilidad: 'general',
  estado: 'no_disponible', ocupada: true, observaciones: '',
};

function buildData(overrides: Partial<{
  reservas: unknown[]; vehiculos: unknown[]; controlesSalida: unknown[];
  addReserva: ReturnType<typeof vi.fn>; updateReserva: ReturnType<typeof vi.fn>; updateCelda: ReturnType<typeof vi.fn>;
}> = {}) {
  return {
    reservas: [], vehiculos: [], controlesSalida: [],
    addReserva: vi.fn(),
    updateReserva: vi.fn().mockResolvedValue(undefined),
    updateCelda: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as any;
}

/* ============================================================
   handleCrearReserva — choque de horario real + horario de operación
============================================================ */
const celdaLibre: Celda = {
  id: '1', parqueaderoId: '1', numero: 'C-001', tipo: 'carro', usabilidad: 'general',
  estado: 'disponible', ocupada: false, observaciones: '',
};

const vehiculoNuevo: Vehiculo = {
  id: 'v-nuevo', conductorId: '', conductorNombre: '', placa: 'NEW123', tipo: 'carro',
  marca: 'Renault', linea: '', modelo: 2022, color: 'Blanco', descripcion: '', estado: 'activo',
};

const vehiculoConflicto: Vehiculo = {
  id: 'v-conflicto', conductorId: '', conductorNombre: '', placa: 'OLD999', tipo: 'carro',
  marca: 'Mazda', linea: '', modelo: 2019, color: 'Negro', descripcion: '', estado: 'activo',
};

// Reserva ya ACEPTADA ("activa") de otro vehículo en la MISMA celda, pero en una fecha vieja
// y sin ninguna relación con la que se va a crear en los tests — el bug (antes de la
// corrección) bloqueaba una reserva nueva de esa celda solo por existir esto, sin mirar si las
// fechas/horas realmente se solapan.
const reservaActivaVieja: Reserva = {
  id: 'r-vieja', tipoReserva: 'visitante', vehiculoId: 'v-conflicto', celdaId: '1', conductorId: '',
  motivo: '', motivoRechazo: '', fechaReserva: '2027-01-05', horaInicio: '08:00', horaFin: '10:00', estado: 'activa',
};

function buildDataConReservas(overrides: Partial<ReservaCeldaData> = {}): ReservaCeldaData {
  return {
    reservas: [reservaActivaVieja],
    vehiculos: [vehiculoNuevo, vehiculoConflicto],
    controlesSalida: [],
    addReserva: vi.fn().mockResolvedValue({ id: 'r-nueva' }),
    updateReserva: vi.fn().mockResolvedValue(undefined),
    updateCelda: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as ReservaCeldaData;
}

function setupCrearReserva(data: ReservaCeldaData) {
  return renderHook(() => useReservaCelda(data, celdaLibre, () => null, vi.fn(), vi.fn()));
}

describe('useReservaCelda — choque de horario real (no "cualquier pendiente/activa de la celda")', () => {
  it('no bloquea una reserva futura sin solape aunque exista una reserva activa vieja y ajena en la misma celda', async () => {
    const data = buildDataConReservas();
    const { result } = setupCrearReserva(data);

    act(() => result.current.setReservaForm((f) => ({
      ...f, vehiculoId: 'v-nuevo', celdaId: '1', fechaReserva: '2027-03-01', horaInicio: '08:00', horaFin: '10:00',
    })));

    await act(async () => { await result.current.handleCrearReserva(); });

    expect(result.current.reservaError).toBeNull();
    expect(data.addReserva).toHaveBeenCalled();
  });

  it('bloquea si la nueva reserva se solapa en fecha/hora con una reserva activa existente de la misma celda', async () => {
    const data = buildDataConReservas();
    const { result } = setupCrearReserva(data);

    act(() => result.current.setReservaForm((f) => ({
      ...f, vehiculoId: 'v-nuevo', celdaId: '1', fechaReserva: '2027-01-05', horaInicio: '09:00', horaFin: '11:00',
    })));

    await act(async () => { await result.current.handleCrearReserva(); });

    expect(result.current.reservaError).toContain('reserva activa en ese horario');
    expect(data.addReserva).not.toHaveBeenCalled();
  });
});

describe('useReservaCelda — horario de operación (05:00–21:00)', () => {
  it('rechaza crear una reserva fuera de la ventana de operación', async () => {
    const data = buildDataConReservas({ reservas: [] });
    const { result } = setupCrearReserva(data);

    act(() => result.current.setReservaForm((f) => ({
      ...f, vehiculoId: 'v-nuevo', celdaId: '1', fechaReserva: '2027-03-01', horaInicio: '22:00', horaFin: '23:00',
    })));

    await act(async () => { await result.current.handleCrearReserva(); });

    expect(result.current.reservaError).toContain('horario de operación');
    expect(data.addReserva).not.toHaveBeenCalled();
  });

  it('acepta un horario dentro de la ventana de operación', async () => {
    const data = buildDataConReservas({ reservas: [] });
    const { result } = setupCrearReserva(data);

    act(() => result.current.setReservaForm((f) => ({
      ...f, vehiculoId: 'v-nuevo', celdaId: '1', fechaReserva: '2027-03-01', horaInicio: '05:00', horaFin: '20:00',
    })));

    await act(async () => { await result.current.handleCrearReserva(); });

    expect(result.current.reservaError).toBeNull();
    expect(data.addReserva).toHaveBeenCalled();
  });
});

describe('useReservaCelda — handleRequestLiberar', () => {
  it('manda fechaSalida como ISO completo (con offset UTC "Z"), no truncado a minutos', async () => {
    const data = buildData();
    const getOcupante = vi.fn().mockReturnValue({ controlId: 'cs1' });
    const updateControlSalida = vi.fn().mockResolvedValue(undefined);
    const setOpenModal = vi.fn();

    const { result } = renderHook(() =>
      useReservaCelda(data, celdaOcupada, getOcupante, updateControlSalida, setOpenModal)
    );

    await act(async () => { await result.current.handleRequestLiberar(); });

    expect(updateControlSalida).toHaveBeenCalledTimes(1);
    const [id, patch] = updateControlSalida.mock.calls[0];
    expect(id).toBe('cs1');
    expect(patch.estado).toBe('finalizado');
    // El bug original truncaba con `.slice(0, 16)` ("2026-01-01T14:30", timezone-naive). El
    // fix manda el ISO completo tal cual lo produce `toISOString()`: fecha, hora con segundos
    // y milisegundos, y el offset UTC "Z" — si se trunca de nuevo, esta aserción falla.
    expect(patch.fechaSalida).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('libera la celda y cierra el modal después de registrar la salida', async () => {
    const data = buildData();
    const getOcupante = vi.fn().mockReturnValue({ controlId: 'cs1' });
    const updateControlSalida = vi.fn().mockResolvedValue(undefined);
    const setOpenModal = vi.fn();

    const { result } = renderHook(() =>
      useReservaCelda(data, celdaOcupada, getOcupante, updateControlSalida, setOpenModal)
    );

    await act(async () => { await result.current.handleRequestLiberar(); });

    expect(data.updateCelda).toHaveBeenCalledWith('5', { estado: 'disponible', ocupada: false });
    expect(setOpenModal).toHaveBeenCalledWith(null);
  });

  it('si la celda no tiene ocupante (dato inconsistente), no llama a updateControlSalida pero igual libera la celda', async () => {
    const data = buildData();
    const getOcupante = vi.fn().mockReturnValue(null);
    const updateControlSalida = vi.fn().mockResolvedValue(undefined);
    const setOpenModal = vi.fn();

    const { result } = renderHook(() =>
      useReservaCelda(data, celdaOcupada, getOcupante, updateControlSalida, setOpenModal)
    );

    await act(async () => { await result.current.handleRequestLiberar(); });

    expect(updateControlSalida).not.toHaveBeenCalled();
    expect(data.updateCelda).toHaveBeenCalledWith('5', { estado: 'disponible', ocupada: false });
  });
});
