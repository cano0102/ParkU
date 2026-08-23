import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as parqueaderosService from '../parqueaderos';
import type { Parqueadero } from '../parqueaderos';
import { createQueryHooks } from './_factory';

export type { Parqueadero };

const hooks = createQueryHooks<Parqueadero>('parqueaderos', parqueaderosService);

export const useParqueaderos = hooks.useList;
export const useUpdateParqueadero = hooks.useUpdate;

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
  });
}
