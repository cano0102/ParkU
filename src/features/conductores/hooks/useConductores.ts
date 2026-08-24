import * as conductoresService from '@/services/api/conductores';
import type { Conductor } from '@/services/api/conductores';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Conductor };

const hooks = createQueryHooks<Conductor>('conductores', conductoresService);

export const useConductores = hooks.useList;
export const useCreateConductor = hooks.useCreate;
export const useUpdateConductor = hooks.useUpdate;
export const useRemoveConductor = hooks.useRemove;
