import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as parqueaderosService from '@/services/api/parqueaderos';
import type { Parqueadero } from '@/services/api/parqueaderos';
import { createQueryHooks } from '@/services/core/queryFactory';

/* Estas 3 mutaciones están hechas a mano (no con `hooks.useCreate/useUpdate/useRemove`, que sí
 * traen su propio `onError`) porque necesitan invalidar más de una query — por eso cada una
 * necesita repetir aquí el mismo aviso de error centralizado, o una mutación fallida quedaba
 * sin ningún toast (React Query 5 no tiene un `onError` global para mutaciones, solo para
 * queries vía `QueryCache` en App.tsx — confirmado ahí mismo). */
function avisarError(error: unknown, fallback: string) {
  toast.error(error instanceof Error ? error.message : fallback);
}

export type { Parqueadero };

const hooks = createQueryHooks<Parqueadero>('parqueaderos', parqueaderosService);

export const useParqueaderos = hooks.useList;

/* Desactivar un parqueadero hace que el backend registre salida a los vehículos ahí
 * estacionados y cancele por mantenimiento las reservas activas no completadas (ver el
 * mensaje de confirmación en useParqueaderoForm.ts) — eso deja obsoletas las celdas, los
 * controles de salida y las reservas ya cargadas, así que un `update` (no solo el
 * create/remove de abajo) también invalida esas tres queries, no solo 'parqueaderos'. */
export function useUpdateParqueadero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Parqueadero, 'id'>> }) => parqueaderosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parqueaderos'] });
      queryClient.invalidateQueries({ queryKey: ['celdas'] });
      queryClient.invalidateQueries({ queryKey: ['entradas-salidas'] });
      queryClient.invalidateQueries({ queryKey: ['reservas'] });
    },
    onError: (error) => avisarError(error, 'No se pudo actualizar el parqueadero.'),
  });
}

/* create/remove también dan de alta/baja las celdas del parqueadero (ver
 * services/parqueaderos.ts), así que invalidan ambas queries en vez de solo
 * 'parqueaderos' — si no, la lista de celdas quedaría con datos obsoletos. */
export function useCreateParqueadero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Parqueadero, 'id'>) => parqueaderosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parqueaderos'] });
      queryClient.invalidateQueries({ queryKey: ['celdas'] });
    },
    onError: (error) => avisarError(error, 'No se pudo crear el parqueadero.'),
  });
}

export function useRemoveParqueadero() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => parqueaderosService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parqueaderos'] });
      queryClient.invalidateQueries({ queryKey: ['celdas'] });
    },
    onError: (error) => avisarError(error, 'No se pudo eliminar el parqueadero.'),
  });
}
