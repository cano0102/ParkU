import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createAppBackends, reservasSeed } from '@/test/appFakeApi';
import { withQueryClient } from '@/test/queryWrapper';
import { useReservaAutoExpiry } from './useReservaAutoExpiry';

// Fecha claramente en el pasado respecto al reloj del entorno de test, para
// que el vencimiento automático corra apenas se monta el hook (no hace falta
// esperar al intervalo de 30s).
reservasSeed.push(
  {
    id: 20, tipo_reserva: 'VEHICULO_SENA', celda_id: 1, conductor_id: 1, vehiculo_id: 1,
    motivo: 'Pendiente vencida', fecha_hora_inicio: '2020-01-01T08:00:00.000Z', fecha_hora_fin: '2020-01-01T10:00:00.000Z',
    estado: 'PENDIENTE',
  },
  {
    id: 21, tipo_reserva: 'VEHICULO_SENA', celda_id: 4, conductor_id: 2, vehiculo_id: 2,
    motivo: 'Activa vencida', fecha_hora_inicio: '2020-01-01T08:00:00.000Z', fecha_hora_fin: '2020-01-01T10:00:00.000Z',
    estado: 'ACEPTADA',
  },
);

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock }));
const backends = createAppBackends();
apiFetchMock.mockImplementation(backends.apiFetch);
// La celda 4 arranca "reservada" para poder comprobar que se libera al vencer la activa.
backends.celdas.items.find((c: any) => c.id === 4)!.estado = 'RESERVADA';

describe('useReservaAutoExpiry', () => {
  it('cancela una solicitud pendiente cuya hora de inicio ya pasó (sin esperar a la hora de fin)', async () => {
    renderHook(() => useReservaAutoExpiry(), { wrapper: withQueryClient() });

    await waitFor(() => {
      const actual = backends.reservas.items.find((r: any) => r.id === 20);
      expect(actual?.estado).toBe('CANCELADA');
    });
  });

  it('completa una reserva activa cuya hora de fin ya pasó y libera la celda', async () => {
    renderHook(() => useReservaAutoExpiry(), { wrapper: withQueryClient() });

    await waitFor(() => {
      const actual = backends.reservas.items.find((r: any) => r.id === 21);
      expect(actual?.estado).toBe('TERMINADA');
    });
    await waitFor(() => {
      const celda = backends.celdas.items.find((c: any) => c.id === 4);
      expect(celda?.estado).toBe('DISPONIBLE');
    });
  });
});
