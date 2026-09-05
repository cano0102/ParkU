import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { createAppBackends, reservasSeed, vehiculosSeed } from '@/test/appFakeApi';
import { createTestQueryClient } from '@/test/queryWrapper';
import { ROLES } from '@/services/core/roles';
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
// Un backend falso nuevo por prueba: hay pruebas que aceptan, rechazan o cancelan reservas,
// y compartir el mismo estado dejaba a las siguientes con datos ya cambiados.
beforeEach(() => {
  apiFetchMock.mockImplementation(createAppBackends().apiFetch);
  localStorage.clear();
});

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

  it('cancela una reserva y deja libre la celda que retenía', async () => {
    // Con sesión: quién puede cancelar depende del rol (y de si la reserva es suya).
    localStorage.setItem('parkuToken', 'fake-token-1');
    localStorage.setItem('parkUUser', JSON.stringify({
      id: '1', correo: 'admin@sena.edu.co', nombre: 'Administrador ParkU', numero: '', rol: ROLES.ADMIN,
    }));
    const { result } = renderHook(() => useReservasPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Se acepta la 12 (celda 2, libre): la celda queda retenida.
    const solicitud = result.current.solicitudesPendientes.find((r) => r.id === '12')!;
    await act(async () => result.current.aceptarSolicitud(solicitud));
    await waitFor(() => expect(result.current.getCelda('2')?.estado).toBe('reservada'));

    const aceptada = result.current.reservas.find((r) => r.id === '12')!;
    expect(result.current.puedeCancelar(aceptada)).toBe(true);

    act(() => result.current.handleCancelar(aceptada));
    await act(async () => result.current.confirmCancelarAction("El conductor avisó que ya no la necesita"));

    await waitFor(() => {
      expect(result.current.reservas.find((r) => r.id === '12')?.estado).toBe('cancelada');
    });
    // La celda se libera en el backend, y la vista se entera sin recargar.
    await waitFor(() => {
      expect(result.current.getCelda('2')?.estado).toBe('disponible');
    });
    expect(toast.success).toHaveBeenCalledWith('Reserva cancelada.');
  });

  it('cancelar NO libera una celda que tiene un vehículo dentro', async () => {
    localStorage.setItem('parkuToken', 'fake-token-1');
    localStorage.setItem('parkUUser', JSON.stringify({
      id: '1', correo: 'admin@sena.edu.co', nombre: 'Administrador ParkU', numero: '', rol: ROLES.ADMIN,
    }));
    const { result } = renderHook(() => useReservasPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // La reserva 10 está aceptada sobre la celda 1, que está OCUPADA en los datos semilla.
    // La página ya no toca la celda por su cuenta: antes la ponía "disponible" a mano, y
    // eso dejaba libre una celda con un vehículo dentro.
    const sobreCeldaOcupada = result.current.reservas.find((r) => r.id === '10')!;
    act(() => result.current.handleCancelar(sobreCeldaOcupada));
    await act(async () => result.current.confirmCancelarAction("El conductor avisó que ya no la necesita"));

    await waitFor(() => {
      expect(result.current.reservas.find((r) => r.id === '10')?.estado).toBe('cancelada');
    });
    expect(result.current.getCelda('1')?.estado).not.toBe('disponible');
  });

  it('no ofrece cancelar una reserva que ya terminó', async () => {
    localStorage.setItem('parkuToken', 'fake-token-1');
    localStorage.setItem('parkUUser', JSON.stringify({
      id: '1', correo: 'admin@sena.edu.co', nombre: 'Administrador ParkU', numero: '', rol: ROLES.ADMIN,
    }));
    const { result } = renderHook(() => useReservasPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const terminada = { ...result.current.reservas[0], estado: 'completada' as const };
    expect(result.current.puedeCancelar(terminada)).toBe(false);
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
    // `confirmRechazarAction` ahora se valida a sí mismo (defensa en profundidad: antes solo
    // `ConfirmRechazarReservaModal` bloqueaba un motivo vacío, una guarda solo de UI) — con
    // motivo vacío corta antes de llamar a la mutación, en vez de depender de que el backend
    // (real o fake) lo rechace.
    await act(async () => result.current.confirmRechazarAction(''));

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('motivo'));
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

describe('useReservasPage — eliminar reservas', () => {
  it('confirmDeleteAction rechaza eliminar una reserva que no está "pendiente" (defensa en profundidad: no basta con ocultar el botón)', async () => {
    const { result } = renderHook(() => useReservasPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Reserva id 10 del seed de este archivo ya está "activa" (ACEPTADA) — borrarla
    // destruiría el rastro de auditoría de una reserva ya gestionada.
    const reservaActiva = result.current.reservas.find((r) => r.id === '10')!;
    expect(reservaActiva.estado).toBe('activa');

    act(() => result.current.setConfirmDelete(reservaActiva));
    await act(async () => result.current.confirmDeleteAction());

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('pendientes'));
    // Sigue existiendo: la mutación de borrado nunca llegó a llamarse.
    expect(result.current.reservas.find((r) => r.id === '10')).toBeDefined();
  });
});

describe('useReservasPage — rol Conductor (Comunidad SENA)', () => {
  afterEach(() => localStorage.clear());

  it('arma su propio historial con getByVehiculo en vez de GET /reservas (403 para este rol) — la misma fuente que alimenta la validación de "reserva duplicada" de useSolicitarReserva', async () => {
    // conductoresSeed[0] (id 1) pertenece a usuario_id 2, y vehiculosSeed[0] (id 1, placa
    // ABC123) lo tiene como conductor principal — reserva id 10 del seed de este archivo ya
    // es justo la reserva de ese conductor/vehículo (celda 1, ACEPTADA -> 'activa').
    localStorage.setItem('parkuToken', 'fake-token-2');
    localStorage.setItem('parkUUser', JSON.stringify({
      id: '2', correo: 'ana.martinez@sena.edu.co', nombre: 'Ana Martínez R.', numero: '', rol: ROLES.CONDUCTOR,
    }));

    // Marca desde dónde contar las llamadas a apiFetch: el mock es compartido a nivel de
    // módulo con el resto de tests de este archivo, así que ya trae historial de llamadas
    // a `/reservas` (rol Admin/Vigilante) antes de que este test arranque.
    const llamadasPrevias = apiFetchMock.mock.calls.length;

    const { result } = renderHook(() => useReservasPage(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Ve su propia reserva...
    expect(result.current.reservas.map((r) => r.id)).toEqual(['10']);
    expect(result.current.reservasTodas.map((r) => r.id)).toEqual(['10']);

    // ...obtenida sin disparar el GET /reservas que el backend real rechaza con 403 para
    // este rol: solo debe aparecer /reservas/vehiculo/1 en las llamadas hechas por este test.
    const rutasLlamadas = apiFetchMock.mock.calls.slice(llamadasPrevias).map(([path]) => path);
    expect(rutasLlamadas).not.toContain('/reservas');
    expect(rutasLlamadas).toContain('/reservas/vehiculo/1');
  });
});
