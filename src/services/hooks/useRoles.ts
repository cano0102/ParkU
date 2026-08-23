import * as rolesService from '../roles';
import type { Rol } from '../roles';
import { createQueryHooks } from './_factory';

export type { Rol };

const hooks = createQueryHooks<Rol>('roles', rolesService);

export const useRoles = hooks.useList;
export const useCreateRol = hooks.useCreate;
export const useUpdateRol = hooks.useUpdate;
export const useRemoveRol = hooks.useRemove;
