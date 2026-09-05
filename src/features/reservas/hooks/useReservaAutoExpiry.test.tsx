import { describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { createAppBackends, reservasSeed } from '@/test/appFakeApi';
import { createTestQueryClient } from '@/test/queryWrapper';
import { ROLES } from '@/services/core/roles';
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
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));
const backends = createAppBackends();
apiFetchMock.mockImplementation(backends.apiFetch);
// La celda 4 arranca "reservada" para poder comprobar que se libera al vencer la activa.
backends.celdas.items.find((c: any) => c.id === 4)!.estado = 'RESERVADA';

// El hook ahora lee el rol de sesión (para desactivar su propia consulta de reservas si es
// Comunidad SENA, ver N1 del informe de auditoría) — necesita AuthProvider, no solo React Query.
function wrapper({ children }: { children: ReactNode }) {
  const client = createTestQueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe('useReservaAutoExpiry', () => {
  it('cancela una solicitud pendiente cuya hora de inicio ya pasó (sin esperar a la hora de fin)', async () => {
    renderHook(() => useReservaAutoExpiry(), { wrapper });

    await waitFor(() => {
      const actual = backends.reservas.items.find((r: any) => r.id === 20);
      expect(actual?.estado).toBe('CANCELADA');
    });
  });

  it('cancela una reserva activa cuya hora de fin ya pasó sin que el vehículo se estacionara, y libera la celda', async () => {
    renderHook(() => useReservaAutoExpiry(), { wrapper });

    await waitFor(() => {
      const actual = backends.reservas.items.find((r: any) => r.id === 21);
      expect(actual?.estado).toBe('CANCELADA');
    });
    await waitFor(() => {
      const celda = backends.celdas.items.find((c: any) => c.id === 4);
      expect(celda?.estado).toBe('DISPONIBLE');
    });
  });

  it('no dispara GET /reservas (403 para Comunidad SENA) cuando la sesión es de un Conductor', async () => {
    // Este hook se monta a nivel de layout para TODOS los roles en cada página (ver su propio
    // comentario) — antes disparaba igual el listado completo aunque Comunidad SENA no gestione
    // el vencimiento de nadie, y el nuevo toast global de error (ver App.tsx) lo hacía visible.
    localStorage.setItem('parkuToken', 'fake-token-3');
    localStorage.setItem('parkUUser', JSON.stringify({
      id: '3', correo: 'conductor@sena.edu.co', nombre: 'Un Conductor', numero: '', rol: ROLES.CONDUCTOR,
    }));
    const llamadasPrevias = apiFetchMock.mock.calls.length;

    renderHook(() => useReservaAutoExpiry(), { wrapper });

    // Para este rol el hook no consulta nada, así que no hay ninguna llamada que esperar:
    // se le da un respiro al ciclo de efectos y se comprueba que sigue sin pedir el listado.
    await act(async () => { await new Promise((r) => setTimeout(r, 60)); });

    const llamadasNuevas = apiFetchMock.mock.calls.slice(llamadasPrevias);
    expect(llamadasNuevas.some(([path]) => path === '/reservas')).toBe(false);

    localStorage.clear();
  });
});
