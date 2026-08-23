import * as conductoresService from '../conductores';
import type { Conductor } from '../conductores';
import { createQueryHooks } from './_factory';

export type { Conductor };

const hooks = createQueryHooks<Conductor>('conductores', conductoresService);

export const useConductores = hooks.useList;
export const useCreateConductor = hooks.useCreate;
export const useUpdateConductor = hooks.useUpdate;
export const useRemoveConductor = hooks.useRemove;
