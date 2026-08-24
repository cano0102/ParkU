import * as controlSalidaService from '@/services/api/controlSalida';
import type { ControlSalida } from '@/services/api/controlSalida';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { ControlSalida };

const hooks = createQueryHooks<ControlSalida>('controlSalida', controlSalidaService);

export const useControlSalida = hooks.useList;
export const useCreateControlSalida = hooks.useCreate;
export const useUpdateControlSalida = hooks.useUpdate;
export const useRemoveControlSalida = hooks.useRemove;
