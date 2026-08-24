import * as rolesService from '@/services/api/roles';
import type { Rol } from '@/services/api/roles';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Rol };

const hooks = createQueryHooks<Rol>('roles', rolesService);

export const useRoles = hooks.useList;
export const useCreateRol = hooks.useCreate;
export const useUpdateRol = hooks.useUpdate;
export const useRemoveRol = hooks.useRemove;
