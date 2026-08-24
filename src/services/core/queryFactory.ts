/**
 * Fábrica de hooks de React Query reutilizada por cada dominio. Da caché,
 * estados de carga/error y revalidación automática (invalida la query de
 * lista tras cada mutación) sin que cada hook de dominio tenga que escribirlo
 * a mano.
 *
 * Ubicación provisional: la Fase 3 de la reestructuración reubica estos
 * hooks dentro de cada features/<dominio>/ — hoy viven junto a los servicios
 * porque routes.tsx todavía apunta a pages/, no a features/.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CrudService } from './crud';

export function createQueryHooks<T extends { id: string }>(queryKey: string, service: CrudService<T>) {
  const key = [queryKey] as const;

  function useList() {
    return useQuery({ queryKey: key, queryFn: service.getAll });
  }

  function useCreate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: Omit<T, 'id'>) => service.create(data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Omit<T, 'id'>> }) => service.update(id, data),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    });
  }

  function useRemove() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => service.remove(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
    });
  }

  return { queryKey: key, useList, useCreate, useUpdate, useRemove };
}
