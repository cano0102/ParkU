import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as movimientosService from '../movimientos';
import * as controlSalidaService from '../controlSalida';
import * as vehiculosService from '../vehiculos';
import * as conductoresService from '../conductores';
import type { Movimiento } from '../movimientos';

export type { Movimiento };

/**
 * Replica el `useMemo` de movimientos derivados que tenía DataContext: la
 * lista de demo fija más una entrada (y, si aplica, una salida) sintetizada
 * por cada registro de controlSalida, ordenado por fecha descendente.
 *
 * Comparte query keys ('controlSalida', 'vehiculos', 'conductores') con
 * useControlSalida/useVehiculos/useConductores a propósito: React Query
 * deduplica por key, así que una mutación en cualquiera de esos hooks
 * invalida también los datos que usa este hook, sin refetch duplicado.
 */
export function useMovimientos() {
  const baseQuery = useQuery({ queryKey: ['movimientos-base'], queryFn: movimientosService.getBase });
  const controlSalidaQuery = useQuery({ queryKey: ['controlSalida'], queryFn: controlSalidaService.getAll });
  const vehiculosQuery = useQuery({ queryKey: ['vehiculos'], queryFn: vehiculosService.getAll });
  const conductoresQuery = useQuery({ queryKey: ['conductores'], queryFn: conductoresService.getAll });

  const isLoading =
    baseQuery.isLoading || controlSalidaQuery.isLoading || vehiculosQuery.isLoading || conductoresQuery.isLoading;
  const error = baseQuery.error ?? controlSalidaQuery.error ?? vehiculosQuery.error ?? conductoresQuery.error;

  const data = useMemo((): Movimiento[] | undefined => {
    if (!baseQuery.data || !controlSalidaQuery.data || !vehiculosQuery.data || !conductoresQuery.data) {
      return undefined;
    }
    const movs: Movimiento[] = [...baseQuery.data];
    for (const cs of controlSalidaQuery.data) {
      const veh = vehiculosQuery.data.find((v) => v.id === cs.vehiculoId);
      const cond = conductoresQuery.data.find((c) => c.id === veh?.conductorId);
      if (!veh || !cond) continue;
      movs.push({
        id: `mv-${cs.id}`,
        placa: veh.placa,
        tipo: 'entrada',
        fecha: cs.fechaEntrada,
        parqueaderoId: veh.parqueaderoId,
        conductorNombre: cond.nombre,
      });
      if (cs.fechaSalida) {
        movs.push({
          id: `mv-out-${cs.id}`,
          placa: veh.placa,
          tipo: 'salida',
          fecha: cs.fechaSalida,
          parqueaderoId: veh.parqueaderoId,
          conductorNombre: cond.nombre,
        });
      }
    }
    return movs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }, [baseQuery.data, controlSalidaQuery.data, vehiculosQuery.data, conductoresQuery.data]);

  return { data, isLoading, error };
}
