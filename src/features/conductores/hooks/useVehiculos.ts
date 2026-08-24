import * as vehiculosService from '@/services/api/vehiculos';
import type { Vehiculo } from '@/services/api/vehiculos';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Vehiculo };

const hooks = createQueryHooks<Vehiculo>('vehiculos', vehiculosService);

export const useVehiculos = hooks.useList;
export const useCreateVehiculo = hooks.useCreate;
export const useUpdateVehiculo = hooks.useUpdate;
export const useRemoveVehiculo = hooks.useRemove;
