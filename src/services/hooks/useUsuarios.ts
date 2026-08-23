import * as usuariosService from '../usuarios';
import type { Usuario } from '../usuarios';
import { createQueryHooks } from './_factory';

export type { Usuario };

const hooks = createQueryHooks<Usuario>('usuarios', usuariosService);

export const useUsuarios = hooks.useList;
export const useCreateUsuario = hooks.useCreate;
export const useUpdateUsuario = hooks.useUpdate;
export const useRemoveUsuario = hooks.useRemove;
