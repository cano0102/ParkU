import * as vehiculosService from '../vehiculos';
import type { Vehiculo } from '../vehiculos';
import { createQueryHooks } from './_factory';

export type { Vehiculo };

const hooks = createQueryHooks<Vehiculo>('vehiculos', vehiculosService);

export const useVehiculos = hooks.useList;
export const useCreateVehiculo = hooks.useCreate;
export const useUpdateVehiculo = hooks.useUpdate;
export const useRemoveVehiculo = hooks.useRemove;
