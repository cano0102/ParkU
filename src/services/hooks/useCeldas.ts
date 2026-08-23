import * as celdasService from '../celdas';
import type { Celda } from '../celdas';
import { createQueryHooks } from './_factory';

export type { Celda };

const hooks = createQueryHooks<Celda>('celdas', celdasService);

export const useCeldas = hooks.useList;
export const useCreateCelda = hooks.useCreate;
export const useUpdateCelda = hooks.useUpdate;
export const useRemoveCelda = hooks.useRemove;
