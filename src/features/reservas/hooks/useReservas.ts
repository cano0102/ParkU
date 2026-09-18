import { useMutation, useQueries, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
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
function invalidarReservasYCeldas(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: hooks.queryKey });
  queryClient.invalidateQueries({ queryKey: ['celdas'] });
}

const avisarError = (accion: string) => (error: unknown) => {
  toast.error(error instanceof Error ? error.message : `No se pudo ${accion}.`);
};

/** Instantáneas de todas las listas de reservas en caché (la completa y las de cada vehículo). */
type ListasDeReservas = [readonly unknown[], Reserva[] | undefined][];

/**
 * Aplica un cambio a una reserva en todas las listas cacheadas que la contengan: la lista
 * completa (`['reservas']`) y las por vehículo (`['reservas', 'vehiculo', id]`, las que ve un
 * Conductor). Devuelve lo que había, para poder deshacerlo si el backend rechaza el cambio.
 */
function aplicarEnCache(queryClient: QueryClient, id: string, cambio: Partial<Reserva>): ListasDeReservas {
  const previas = queryClient.getQueriesData<Reserva[]>({ queryKey: hooks.queryKey });
  queryClient.setQueriesData<Reserva[]>({ queryKey: hooks.queryKey }, (lista) =>
    lista?.map((r) => (r.id === id ? { ...r, ...cambio } : r)),
  );
  return previas;
}

function restaurarCache(queryClient: QueryClient, previas: ListasDeReservas | undefined) {
  for (const [queryKey, datos] of previas ?? []) queryClient.setQueryData(queryKey, datos);
}

/**
 * Cambio de estado (aceptar, rechazar, terminar) o edición de una reserva.
 *
 * Es optimista: la fila cambia de estado en el mismo clic, antes de que el backend
 * responda. Sin esto, el clic parecía no hacer nada durante uno o dos segundos (la
 * petición, más el preflight, más el refetch de la lista) y la gente volvía a pulsar:
 * la segunda petición llegaba a una reserva ya rechazada y el backend respondía "ya no se
 * puede editar: forma parte del histórico". Si el backend rechaza el cambio, se deshace y
 * se avisa; si lo acepta, la respuesta (que ya trae el registro definitivo) reemplaza a la
 * copia optimista y las listas se refrescan por detrás para recoger lo que el backend haya
 * movido además (la celda, sobre todo).
 */
export function useUpdateReserva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Reserva, 'id'>> }) => reservasService.update(id, data),
    onMutate: async ({ id, data }) => {
      // Un refetch en vuelo que aterrizara después pisaría el cambio optimista con el estado viejo.
      await queryClient.cancelQueries({ queryKey: hooks.queryKey });
      return { previas: aplicarEnCache(queryClient, id, data) };
    },
    onSuccess: (actualizada) => aplicarEnCache(queryClient, actualizada.id, actualizada),
    onError: (error, _variables, contexto) => {
      restaurarCache(queryClient, contexto?.previas);
      avisarError('actualizar la reserva')(error);
    },
    onSettled: () => invalidarReservasYCeldas(queryClient),
  });
}

/**
 * Cancelar la reserva propia. No usa la fábrica porque no es un CRUD genérico: es una acción
 * sobre un recurso (`PATCH /reservas/:id/cancelar`). Optimista e invalida igual que
 * `useUpdateReserva`, por los mismos motivos.
 */
export function useCancelarReserva() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo: string }) => reservasService.cancelar(id, motivo),
    onMutate: async ({ id, motivo }) => {
      await queryClient.cancelQueries({ queryKey: hooks.queryKey });
      return { previas: aplicarEnCache(queryClient, id, { estado: 'cancelada', motivoRechazo: motivo }) };
    },
    onSuccess: (cancelada) => aplicarEnCache(queryClient, cancelada.id, cancelada),
    onError: (error, _variables, contexto) => {
      restaurarCache(queryClient, contexto?.previas);
      avisarError('cancelar la reserva')(error);
    },
    onSettled: () => invalidarReservasYCeldas(queryClient),
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
