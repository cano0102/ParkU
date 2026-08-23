import * as controlSalidaService from '../controlSalida';
import type { ControlSalida } from '../controlSalida';
import { createQueryHooks } from './_factory';

export type { ControlSalida };

const hooks = createQueryHooks<ControlSalida>('controlSalida', controlSalidaService);

export const useControlSalida = hooks.useList;
export const useCreateControlSalida = hooks.useCreate;
export const useUpdateControlSalida = hooks.useUpdate;
export const useRemoveControlSalida = hooks.useRemove;
