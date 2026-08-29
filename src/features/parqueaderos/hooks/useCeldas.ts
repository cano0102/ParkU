import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as celdasService from '@/services/api/celdas';
import type { Celda, MotivoDisponibilidad, GenerarLoteCantidades } from '@/services/api/celdas';
import { createQueryHooks } from '@/services/core/queryFactory';

export type { Celda };

const hooks = createQueryHooks<Celda>('celdas', celdasService);

export const useCeldas = hooks.useList;
export const useCreateCelda = hooks.useCreate;
export const useUpdateCelda = hooks.useUpdate;
export const useRemoveCelda = hooks.useRemove;

/** Único hook que de verdad cambia `estado` en el backend real — ver el porqué en
 *  `cambiarDisponibilidad` (services/api/celdas.ts). Solo para el ajuste manual de un
 *  Admin/Vigilante (mantenimiento, inactivar, reactivar, corregir una celda atascada). */
export function useCambiarDisponibilidadCelda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado, motivo, observacion }: { id: string; estado: Celda['estado']; motivo: MotivoDisponibilidad; observacion?: string }) =>
      celdasService.cambiarDisponibilidad(id, estado, motivo, observacion),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hooks.queryKey }),
    onError: (error) => toast.error(error instanceof Error ? error.message : 'No se pudo cambiar el estado de la celda.'),
  });
}

/** Genera en lote las celdas de un parqueadero recién creado — ver
 *  `services/api/celdas.ts#generarLote` para el porqué de un endpoint aparte
 *  (una sola transacción en vez de N creaciones sueltas). */
export function useGenerarLoteCeldas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ parqueaderoId, cantidades }: { parqueaderoId: string; cantidades: GenerarLoteCantidades }) =>
      celdasService.generarLote(parqueaderoId, cantidades),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: hooks.queryKey }),
    onError: (error) => toast.error(error instanceof Error ? error.message : 'No se pudieron generar las celdas del parqueadero.'),
  });
}
