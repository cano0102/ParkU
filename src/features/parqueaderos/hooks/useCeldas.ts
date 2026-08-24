import * as celdasService from '@/services/api/celdas';
import type { Celda } from '@/services/api/celdas';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Celda };

const hooks = createQueryHooks<Celda>('celdas', celdasService);

export const useCeldas = hooks.useList;
export const useCreateCelda = hooks.useCreate;
export const useUpdateCelda = hooks.useUpdate;
export const useRemoveCelda = hooks.useRemove;
