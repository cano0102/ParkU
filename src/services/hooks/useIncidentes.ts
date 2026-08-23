import * as incidentesService from '../incidentes';
import type { Incidente } from '../incidentes';
import { createQueryHooks } from './_factory';

export type { Incidente };

const hooks = createQueryHooks<Incidente>('incidentes', incidentesService);

export const useIncidentes = hooks.useList;
export const useCreateIncidente = hooks.useCreate;
export const useUpdateIncidente = hooks.useUpdate;
export const useRemoveIncidente = hooks.useRemove;
