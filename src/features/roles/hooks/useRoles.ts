import { useQuery } from '@tanstack/react-query';
import * as rolesService from '@/services/api/roles';
import type { Rol } from '@/services/api/roles';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Rol };

const hooks = createQueryHooks<Rol>('roles', rolesService);

export const useRoles = hooks.useList;
export const useCreateRol = hooks.useCreate;
export const useUpdateRol = hooks.useUpdate;
export const useRemoveRol = hooks.useRemove;

/** Catálogo completo de permisos reales del backend (`/api/permisos`), agrupado por módulo
 *  — ver PermisosEditor.tsx. No cambia según el rol, así que se cachea aparte de `useRoles`. */
export function usePermisosCatalogo() {
  return useQuery({ queryKey: ['permisos-catalogo'], queryFn: rolesService.getPermisosCatalogo });
}

/** Ids de los permisos que un rol puntual tiene realmente asignados en `rol_permiso`.
 *  `enabled: !!rolId` porque un rol recién creado (sin id todavía) no tiene nada que consultar. */
export function usePermisosDeRol(rolId: string | null) {
  return useQuery({
    queryKey: ['permisos-de-rol', rolId],
    queryFn: () => rolesService.getPermisosDeRol(rolId as string),
    enabled: !!rolId,
  });
}
