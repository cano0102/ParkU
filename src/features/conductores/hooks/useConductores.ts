import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as conductoresService from '@/services/api/conductores';
import type { Conductor } from '@/services/api/conductores';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Conductor };

const hooks = createQueryHooks<Conductor>('conductores', conductoresService);

export const useConductores = hooks.useList;
export const useCreateConductor = hooks.useCreate;
export const useRemoveConductor = hooks.useRemove;

/**
 * Actualizar un conductor también debe invalidar `vehiculos`, no solo `conductores`:
 * `Vehiculo.conductorNombre` es un campo denormalizado que el backend ya resuelve en el GET de
 * vehículos (ver services/api/vehiculos.ts#toFrontend, `conductor_principal_nombre`) — si solo
 * se invalida la query de conductores, cualquier pantalla que muestre el dueño de un vehículo
 * (p. ej. "Dueño actual" en AgregarVehiculoModal.tsx) sigue mostrando el nombre viejo hasta que
 * algo más, sin relación, dispare un refetch de vehículos. El `useUpdate` genérico de
 * queryFactory.ts invalida a propósito solo la query de su propio dominio (no conoce esta
 * relación cruzada entre dominios) — esta invalidación extra es específica de
 * conductores↔vehículos, así que vive acá y no en la fábrica compartida.
 */
export function useUpdateConductor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Conductor, 'id'>> }) =>
      conductoresService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conductores'] });
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'No se pudo completar la operación.'),
  });
}
