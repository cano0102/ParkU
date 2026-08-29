import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { createAppBackends, reservasSeed, vehiculosSeed } from '@/test/appFakeApi';
import { createTestQueryClient } from '@/test/queryWrapper';
import { useReservasPage } from './useReservasPage';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Un tercer vehículo (el 1 y el 2 del seed base ya se usan en otros escenarios, y el 1
// además está "estacionado" en controlSalidaSeed — no sirve para una solicitud que se
// espera aceptar).
vehiculosSeed.push({
  id: 3, placa: 'JKL321', tipo: 'CARRO', marca: 'Mazda', linea: '3', modelo: 2021, color: 'Gris',
  observaciones: '', estado: true,
  conductores: [{ id: 3, nombre_apellidos: 'Laura Gómez R.', DetallePropiedad: { es_principal: true } }],
  conductor_principal_id: 3, conductor_principal_nombre: 'Laura Gómez R.',
});

// Reserva ya aceptada en la celda 1 (2026-09-10, 08:00-12:00) contra la que se prueban
// los choques de horario, más dos solicitudes pendientes: una que se solapa con ella
// (celda 1, 10:00-14:00) y otra en una celda distinta sin conflicto.
reservasSeed.push(
  {
    id: 10, tipo_reserva: 'VEHICULO_SENA', celda_id: 1, conductor_id: 1, vehiculo_id: 1,
    motivo: 'Ya aceptada', fecha_hora_inicio: '2026-09-10T08:00:00.000Z', fecha_hora_fin: '2026-09-10T12:00:00.000Z',
    estado: 'ACEPTADA',
  },
  {
    id: 11, tipo_reserva: 'VEHICULO_SENA', celda_id: 1, conductor_id: 2, vehiculo_id: 2,
    motivo: 'Choca con la aceptada', fecha_hora_inicio: '2026-09-10T10:00:00.000Z', fecha_hora_fin: '2026-09-10T14:00:00.000Z',
    estado: 'PENDIENTE',
  },
  {
    id: 12, tipo_reserva: 'VEHICULO_SENA', celda_id: 2, conductor_id: 2, vehiculo_id: 2,
    motivo: 'Sin conflicto', fecha_hora_inicio: '2026-09-11T08:00:00.000Z', fecha_hora_fin: '2026-09-11T10:00:00.000Z',
    estado: 'PENDIENTE',
  },
  // Dos solicitudes pendientes que compiten por la misma celda/franja: al aceptar una,
  // la otra debe rechazarse automáticamente (no basta con bloquear, hay que resolver).
  {
    id: 14, tipo_reserva: 'VEHICULO_SENA', celda_id: 3, conductor_id: 3, vehiculo_id: 3,
    motivo: 'Se acepta esta', fecha_hora_inicio: '2026-09-12T08:00:00.000Z', fecha_hora_fin: '2026-09-12T10:00:00.000Z',
    estado: 'PENDIENTE',
  },
  {
    id: 15, tipo_reserva: 'VEHICULO_SENA', celda_id: 3, conductor_id: 2, vehiculo_id: 2,
    motivo: 'Debe rechazarse sola', fecha_hora_inicio: '2026-09-12T09:00:00.000Z', fecha_hora_fin: '2026-09-12T11:00:00.000Z',
    estado: 'PENDIENTE',
  },
);

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

function wrapper({ children }: { children: ReactNode }) {
  const client = createTestQueryClient();
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe('useReservasPage — solicitudes pendientes', () => {
  it('lista las solicitudes pendientes ordenadas por fecha', async () => {
    const { result } = renderHook(() => useReservasPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.solicitudesPendientes.map((r) => r.id)).toEqual(['11', '12', '14', '15']);
  });

  it('rechaza aceptar una solicitud que choca en horario con una reserva ya activa en la misma celda', async () => {
    const { result } = renderHook(() => useReservasPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const solicitudConflictiva = result.current.solicitudesPendientes.find((r) => r.id === '11')!;
    await act(async () => result.current.aceptarSolicitud(solicitudConflictiva));

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('choca'));
    await waitFor(() => {
      expect(result.current.reservas.find((r) => r.id === '11')?.estado).toBe('pendiente');
    });
  });

  it('acepta una solicitud sin conflicto y reserva la celda', async () => {
    const { result } = renderHook(() => useReservasPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const solicitudLibre = result.current.solicitudesPendientes.find((r) => r.id === '12')!;
    await act(async () => result.current.aceptarSolicitud(solicitudLibre));

    await waitFor(() => {
      expect(result.current.reservas.find((r) => r.id === '12')?.estado).toBe('activa');
    });
    await waitFor(() => {
      expect(result.current.getCelda('2')?.estado).toBe('reservada');
    });
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('aceptada'));
  });

  it('rechaza una solicitud sin tocar la celda', async () => {
    const { result } = renderHook(() => useReservasPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const solicitud = result.current.solicitudesPendientes.find((r) => r.id === '11')!;
    const celdaAntes = result.current.getCelda(solicitud.celdaId)?.estado;
    act(() => result.current.handleRechazar(solicitud));
    await act(async () => result.current.confirmRechazarAction('No hay disponibilidad en ese horario.'));

    await waitFor(() => {
      expect(result.current.reservas.find((r) => r.id === '11')?.estado).toBe('rechazada');
    });
    expect(result.current.reservas.find((r) => r.id === '11')?.motivoRechazo).toBe('No hay disponibilidad en ese horario.');
    expect(result.current.getCelda(solicitud.celdaId)?.estado).toBe(celdaAntes);
  });

  it('exige un motivo (el hook no envía nada si el motivo llega vacío)', async () => {
    const { result } = renderHook(() => useReservasPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const solicitud = result.current.solicitudesPendientes[0];
    const estadoAntes = result.current.reservas.find((r) => r.id === solicitud.id)?.estado;
    act(() => result.current.handleRechazar(solicitud));
    // El propio backend (real o fake) rechaza un motivo vacío — se propaga como error de mutación.
    await act(async () => result.current.confirmRechazarAction(''));

    // El estado no cambió: el rechazo nunca se confirmó.
    expect(result.current.reservas.find((r) => r.id === solicitud.id)?.estado).toBe(estadoAntes);
  });

  it('al aceptar una solicitud, rechaza automáticamente otras pendientes de la misma celda que se solapan en horario', async () => {
    const { result } = renderHook(() => useReservasPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const aAceptar = result.current.solicitudesPendientes.find((r) => r.id === '14')!;
    await act(async () => result.current.aceptarSolicitud(aAceptar));

    await waitFor(() => {
      expect(result.current.reservas.find((r) => r.id === '14')?.estado).toBe('activa');
    });
    await waitFor(() => {
      expect(result.current.reservas.find((r) => r.id === '15')?.estado).toBe('rechazada');
    });
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('rechazaron automáticamente'));
  });
});
