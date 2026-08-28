import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as vehiculosService from '@/services/api/vehiculos';
import type { Vehiculo } from '@/services/api/vehiculos';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Vehiculo };

const hooks = createQueryHooks<Vehiculo>('vehiculos', vehiculosService);

export const useVehiculos = hooks.useList;
export const useCreateVehiculo = hooks.useCreate;
export const useUpdateVehiculo = hooks.useUpdate;
export const useRemoveVehiculo = hooks.useRemove;

/** Vincula un conductor adicional como copropietario de un vehículo ya existente. */
export function useAgregarPropietarioVehiculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehiculoId, conductorId }: { vehiculoId: string; conductorId: string }) =>
      vehiculosService.agregarPropietario(vehiculoId, conductorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hooks.queryKey }),
    onError: (error) => toast.error(error instanceof Error ? error.message : 'No se pudo vincular el copropietario.'),
  });
}

/** Desvincula a un conductor como copropietario de un vehículo. */
export function useQuitarPropietarioVehiculo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehiculoId, conductorId }: { vehiculoId: string; conductorId: string }) =>
      vehiculosService.quitarPropietario(vehiculoId, conductorId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hooks.queryKey }),
    onError: (error) => toast.error(error instanceof Error ? error.message : 'No se pudo desvincular el copropietario.'),
  });
}
