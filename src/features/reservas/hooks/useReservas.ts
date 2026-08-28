import { useQueries, useQuery } from '@tanstack/react-query';
import * as reservasService from '@/services/api/reservas';
import type { Reserva } from '@/services/api/reservas';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Reserva };

const hooks = createQueryHooks<Reserva>('reservas', reservasService);

export const useReservas = hooks.useList;
export const useCreateReserva = hooks.useCreate;
export const useUpdateReserva = hooks.useUpdate;
export const useRemoveReserva = hooks.useRemove;

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
