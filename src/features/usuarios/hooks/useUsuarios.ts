import * as usuariosService from '@/services/api/usuarios';
import type { Usuario } from '@/services/api/usuarios';
import { createQueryHooks, STALE_TIME } from '@/services/core/queryFactory';

export type { Usuario };

const hooks = createQueryHooks<Usuario>('usuarios', usuariosService, { staleTime: STALE_TIME.MAESTRO });

export const useUsuarios = hooks.useList;
export const useCreateUsuario = hooks.useCreate;
export const useUpdateUsuario = hooks.useUpdate;
export const useRemoveUsuario = hooks.useRemove;
