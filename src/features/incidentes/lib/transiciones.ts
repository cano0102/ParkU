import type { EstadoIncidente } from "./constants";

/**
 * Estados finales de un incidente: una vez ahí, su estado ya no se puede cambiar
 * (ni siquiera para reabrirlo). "Resuelto" cierra la atención, "cerrado" la archiva
 * y "cancelado" descarta el reporte — los tres son definitivos.
 *
 * Complementa a `ESTADOS_ABIERTOS` (lib/constants.tsx), que es justo el conjunto
 * contrario y ya se usaba para el orden de la lista y para detectar duplicados.
 */
export const ESTADOS_FINALES: EstadoIncidente[] = ["resuelto", "cerrado", "cancelado"];

export function esEstadoFinal(estado: EstadoIncidente): boolean {
  return ESTADOS_FINALES.includes(estado);
}

/**
 * Estados a los que se puede mover un incidente desde el suyo actual:
 *
 *   pendiente  → en proceso · resuelto · cerrado · cancelado
 *   en proceso → resuelto · cerrado · cancelado
 *   resuelto / cerrado / cancelado → (ninguno: son finales)
 *
 * El backend debe aplicar la misma regla; esto solo evita ofrecer en pantalla un
 * cambio que no corresponde.
 */
export function transicionesDe(estado: EstadoIncidente): EstadoIncidente[] {
  if (esEstadoFinal(estado)) return [];
  const destinos: EstadoIncidente[] = ["en_proceso", "resuelto", "cerrado", "cancelado"];
  return destinos.filter((e) => e !== estado);
}

/** true si `destino` es un cambio válido desde `origen`. */
export function puedeCambiarA(origen: EstadoIncidente, destino: EstadoIncidente): boolean {
  return transicionesDe(origen).includes(destino);
}
