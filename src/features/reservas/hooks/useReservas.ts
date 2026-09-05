import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as reservasService from '@/services/api/reservas';
import type { Reserva } from '@/services/api/reservas';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Reserva };

const hooks = createQueryHooks<Reserva>('reservas', reservasService);

export const useReservas = hooks.useList;
export const useCreateReserva = hooks.useCreate;
export const useRemoveReserva = hooks.useRemove;

/**
 * Refresca las dos listas que toca una reserva. Aceptar, cancelar, rechazar o terminar mueve
 * también la CELDA (el backend la retiene o la suelta en la misma operación), así que
 * invalidar solo `reservas` dejaba el mapa de celdas mostrando el estado anterior hasta que
 * algo más lo refrescara.
 */
function useInvalidarReservasYCeldas() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: hooks.queryKey });
    queryClient.invalidateQueries({ queryKey: ['celdas'] });
  };
}

const avisarError = (accion: string) => (error: unknown) => {
  toast.error(error instanceof Error ? error.message : `No se pudo ${accion}.`);
};

export function useUpdateReserva() {
  const invalidar = useInvalidarReservasYCeldas();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Reserva, 'id'>> }) => reservasService.update(id, data),
    onSuccess: invalidar,
    onError: avisarError('actualizar la reserva'),
  });
}

/**
 * Cancelar la reserva propia. No usa la fábrica porque no es un CRUD genérico: es una acción
 * sobre un recurso (`PATCH /reservas/:id/cancelar`). Invalida la lista igual que el resto de
 * mutaciones para que la tabla se refresque sola.
 */
export function useCancelarReserva() {
  const invalidar = useInvalidarReservasYCeldas();
  return useMutation({
    mutationFn: (id: string) => reservasService.cancelar(id),
    onSuccess: invalidar,
    onError: avisarError('cancelar la reserva'),
  });
}

/**
 * Reservas de un vehículo puntual — a diferencia de `useReservas` (el listado
 * completo, solo Admin/Vigilante), esta consulta la puede hacer cualquier
 * usuario autenticado. La usa el Dashboard simplificado de Comunidad SENA.
 */
export function useReservasPorVehiculo(vehiculoId: string | null) {
  return useQuery({
    queryKey: ['reservas', 'vehiculo', vehiculoId],
    queryFn: () => reservasService.getByVehiculo(vehiculoId as string),
    enabled: !!vehiculoId,
  });
}

/** Igual que `useReservasPorVehiculo`, pero junta las reservas de varios vehículos
 *  (un conductor puede tener más de uno) en una sola lista ordenada. */
export function useReservasDeVehiculos(vehiculoIds: string[]) {
  const queries = useQueries({
    queries: vehiculoIds.map((id) => ({
      queryKey: ['reservas', 'vehiculo', id],
      queryFn: () => reservasService.getByVehiculo(id),
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const reservas = queries
    .flatMap((q) => q.data ?? [])
    .sort((a, b) => `${b.fechaReserva}T${b.horaInicio}`.localeCompare(`${a.fechaReserva}T${a.horaInicio}`));

  return { reservas, isLoading };
}
