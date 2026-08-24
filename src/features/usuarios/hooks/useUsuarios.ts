import * as usuariosService from '@/services/api/usuarios';
import type { Usuario } from '@/services/api/usuarios';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Usuario };

const hooks = createQueryHooks<Usuario>('usuarios', usuariosService);

export const useUsuarios = hooks.useList;
export const useCreateUsuario = hooks.useCreate;
export const useUpdateUsuario = hooks.useUpdate;
export const useRemoveUsuario = hooks.useRemove;
