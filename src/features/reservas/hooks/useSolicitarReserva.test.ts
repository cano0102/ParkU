import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import type { Celda } from '@/services/api/celdas';
import type { Parqueadero } from '@/services/api/parqueaderos';
import type { Vehiculo } from '@/services/api/vehiculos';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({
  apiFetch: apiFetchMock,
  crearConRespaldo: async (path: string, body: unknown, fetchTodosCrudo: () => Promise<any[]>) => {
    const creado = await apiFetchMock(path, { method: 'POST', body });
    if (creado) return creado;
    const todos = await fetchTodosCrudo();
    return todos.reduce((max: any, item: any) => (item.id > max.id ? item : max));
  },
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { createTestQueryClient, withQueryClient } from '@/test/queryWrapper';
import { useSolicitarReserva } from './useSolicitarReserva';

const miCarro: Vehiculo = {
  id: '1', conductorId: 'c1', conductorNombre: 'Andrés Torres', placa: 'ABC123', tipo: 'carro',
  marca: 'Chevrolet', linea: '', modelo: 2020, color: 'Rojo', descripcion: '', estado: 'activo',
};

const parqueadero: Parqueadero = {
  id: '1', nombre: 'Torre Sur', ubicacion: '', acceso: 'regional', capacidadMaxima: 10,
  horaInicio: '06:00', horaFin: '22:00', estado: 'activo', zona: '', piso: '', descripcion: '', tipo: 'general',
};

const celdaDisponibleCarro: Celda = {
  id: '1', parqueaderoId: '1', numero: 'A-01', tipo: 'carro', usabilidad: 'general', estado: 'disponible', ocupada: false, observaciones: '',
};
const celdaOcupada: Celda = { ...celdaDisponibleCarro, id: '2', numero: 'A-02', estado: 'no_disponible', ocupada: true };
const celdaDeMoto: Celda = { ...celdaDisponibleCarro, id: '3', numero: 'A-03', tipo: 'moto' };

afterEach(() => vi.clearAllMocks());

describe('useSolicitarReserva', () => {
  it('solo ofrece celdas disponibles y del mismo tipo que el vehículo elegido', () => {
    const { result } = renderHook(
      () => useSolicitarReserva([miCarro], [celdaDisponibleCarro, celdaOcupada, celdaDeMoto], [parqueadero], [miCarro], [], []),
      { wrapper: withQueryClient() }
    );

    act(() => result.current.abrir());
    expect(result.current.form.vehiculoId).toBe('1');

    act(() => result.current.setForm({ ...result.current.form, parqueaderoId: '1' }));
    expect(result.current.celdasDisponibles.map((c) => c.id)).toEqual(['1']);
  });

  it('rechaza enviar la solicitud sin celda seleccionada', async () => {
    const { result } = renderHook(
      () => useSolicitarReserva([miCarro], [celdaDisponibleCarro], [parqueadero], [miCarro], [], []),
      { wrapper: withQueryClient() }
    );

    act(() => result.current.abrir());
    act(() => result.current.setForm({ ...result.current.form, parqueaderoId: '1' }));
    await act(async () => result.current.enviarSolicitud());

    expect(result.current.error).toBe('Selecciona una celda disponible');
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it('crea la reserva como pendiente y no toca la celda (queda a la espera de aprobación)', async () => {
    apiFetchMock.mockResolvedValue({
      id: 99, tipo_reserva: 'VEHICULO_SENA', celda_id: 1, conductor_id: 1, vehiculo_id: 1,
      motivo: 'Clase', fecha_hora_inicio: '2027-01-01T08:00:00.000Z', fecha_hora_fin: '2027-01-01T10:00:00.000Z', estado: 'PENDIENTE',
    });
    const client = createTestQueryClient();
    const { result } = renderHook(
      () => useSolicitarReserva([miCarro], [celdaDisponibleCarro], [parqueadero], [miCarro], [], []),
      { wrapper: withQueryClient(client) }
    );

    act(() => result.current.abrir());
    act(() => result.current.setForm({
      ...result.current.form, parqueaderoId: '1', celdaId: '1',
      fechaReserva: '2027-01-01', horaInicio: '08:00', horaFin: '10:00', motivo: 'Clase',
    }));
    await act(async () => result.current.enviarSolicitud());

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Solicitud enviada')));
    expect(apiFetchMock).toHaveBeenCalledWith('/reservas', expect.objectContaining({ method: 'POST' }));
    // Ninguna llamada debe tocar /celdas: la solicitud no ocupa la celda hasta que se acepta.
    expect(apiFetchMock.mock.calls.some(([path]) => String(path).startsWith('/celdas'))).toBe(false);
    expect(result.current.open).toBe(false);
  });
});
