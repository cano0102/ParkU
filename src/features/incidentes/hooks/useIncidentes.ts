import * as incidentesService from '@/services/api/incidentes';
import type { Incidente } from '@/services/api/incidentes';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Incidente };

const hooks = createQueryHooks<Incidente>('incidentes', incidentesService);

export const useIncidentes = hooks.useList;
export const useCreateIncidente = hooks.useCreate;
export const useUpdateIncidente = hooks.useUpdate;
export const useRemoveIncidente = hooks.useRemove;
