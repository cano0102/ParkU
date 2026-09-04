import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as rolesService from '@/services/api/roles';
import type { Rol } from '@/services/api/roles';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Rol };

const hooks = createQueryHooks<Rol>('roles', rolesService);

export const useRoles = hooks.useList;
export const useCreateRol = hooks.useCreate;
export const useUpdateRol = hooks.useUpdate;

/** A mano (no `hooks.useRemove`) para poder mostrar un mensaje específico de este dominio
 *  cuando el backend rechaza el borrado sin traer su propio `message` — el caso esperado es
 *  que el rol tenga usuarios asociados (el backend es la única fuente real de verdad para
 *  esto: `Usuario.rol` en el frontend solo resuelve fielmente los 3 roles fijos, así que un
 *  conteo local de usuarios por rol no sería confiable para un rol personalizado). Si el
 *  backend sí trae su propio mensaje, ese se usa tal cual (ver `apiFetch`/`extraerMensajeError`). */
export function useRemoveRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'No se puede eliminar este rol. Existen usuarios asociados a este rol.'),
  });
}

/** Catálogo completo de permisos reales del backend (`/api/permisos`), agrupado por módulo
 *  — ver PermisosEditor.tsx. No cambia según el rol, así que se cachea aparte de `useRoles`. */
export function usePermisosCatalogo() {
  return useQuery({ queryKey: ['permisos-catalogo'], queryFn: rolesService.getPermisosCatalogo });
}

/**
 * Guarda el conjunto de permisos de un rol (asigna los nuevos y quita los desmarcados).
 * Invalida la consulta de ese rol para que el formulario y la tarjeta reflejen lo guardado.
 */
export function useGuardarPermisosDeRol() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rolId, permisoIds }: { rolId: string; permisoIds: string[] }) =>
      rolesService.guardarPermisosDeRol(rolId, permisoIds),
    onSuccess: (_data, { rolId }) => {
      queryClient.invalidateQueries({ queryKey: ['permisos-de-rol', rolId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : 'No se pudieron guardar los permisos del rol.'),
  });
}

/** Permisos que un rol puntual tiene asignados (`permisoId -> idDeLaFila`).
 *  `enabled: !!rolId` porque un rol recién creado (sin id todavía) no tiene nada que consultar. */
export function usePermisosDeRol(rolId: string | null) {
  return useQuery({
    queryKey: ['permisos-de-rol', rolId],
    queryFn: () => rolesService.getPermisosDeRol(rolId as string),
    enabled: !!rolId,
  });
}
