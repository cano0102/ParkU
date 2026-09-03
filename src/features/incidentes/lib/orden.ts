import type { Incidente, PrioridadNovedad } from "@/services/api/incidentes";
import { ESTADOS_ABIERTOS, type EstadoIncidente } from "./constants";

/** Peso de la prioridad para ordenar: a mayor peso, más arriba en la lista. */
const PESO_PRIORIDAD: Record<PrioridadNovedad, number> = {
  critica: 4,
  alta: 3,
  media: 2,
  baja: 1,
};

/** Los estados finalizados (resuelto/cerrado/cancelado) se muestran DESPUÉS de los
 *  abiertos, sin importar su prioridad ni su fecha. Reutiliza `ESTADOS_ABIERTOS`
 *  (lib/constants.tsx) para no tener dos definiciones de "incidente abierto". */
function grupoDeEstado(estado: EstadoIncidente): number {
  return ESTADOS_ABIERTOS.includes(estado) ? 0 : 1;
}

/**
 * Orden de gestión de la lista de incidentes:
 *
 *   1. Abiertos (pendiente / en proceso), de mayor a menor prioridad.
 *   2. Finalizados (resuelto / cerrado / cancelado), al final.
 *
 * Dentro de cada grupo se desempata por prioridad y, a igual prioridad, por fecha
 * más reciente primero (que era el único criterio anterior). Es la ÚNICA ordenación
 * que aplica el front: sustituye al `.sort()` por fecha que tenían las listas, no se
 * suma a él.
 */
export function compararIncidentes(a: Incidente, b: Incidente): number {
  const porGrupo = grupoDeEstado(a.estado) - grupoDeEstado(b.estado);
  if (porGrupo !== 0) return porGrupo;

  const porPrioridad = (PESO_PRIORIDAD[b.prioridad] ?? 0) - (PESO_PRIORIDAD[a.prioridad] ?? 0);
  if (porPrioridad !== 0) return porPrioridad;

  return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
}
