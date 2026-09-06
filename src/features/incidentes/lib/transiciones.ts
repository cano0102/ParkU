import type { EstadoIncidente } from "./constants";

/**
 * Estados finales de un incidente: una vez ahí, su estado ya no se puede cambiar
 * (ni siquiera para reabrirlo). "Resuelto" cierra la atención, "rechazado" dice que el
 * reporte no procedía y "cancelado" lo descarta — los tres son definitivos.
 *
 * Complementa a `ESTADOS_ABIERTOS` (lib/constants.tsx), que es justo el conjunto
 * contrario y ya se usaba para el orden de la lista y para detectar duplicados.
 */
export const ESTADOS_FINALES: EstadoIncidente[] = ["resuelto", "rechazado", "cancelado"];

/**
 * Estados en los que conviene tener un encargado: alguien a quien preguntarle por el
 * incidente. Es una recomendación, no un requisito — exigirlo paraba el trabajo real por un
 * dato administrativo, así que la aplicación lo sugiere al cambiar de estado y sigue.
 */
export const ESTADOS_CON_ENCARGADO: EstadoIncidente[] = ["en_proceso", "resuelto"];

/**
 * Desenlaces que exigen explicar por qué. Ese texto es lo que ve quien reportó el incidente
 * cuando entra a mirar qué pasó con él, así que sin motivo el reporte desaparecía sin
 * respuesta.
 */
export const ESTADOS_CON_MOTIVO: EstadoIncidente[] = ["rechazado", "cancelado"];

/** true si al pasar a `estado` conviene sugerir un encargado (no se exige). */
export function recomiendaEncargado(estado: EstadoIncidente): boolean {
  return ESTADOS_CON_ENCARGADO.includes(estado);
}

/** true si pasar a `estado` exige escribir un motivo. */
export function requiereMotivo(estado: EstadoIncidente): boolean {
  return ESTADOS_CON_MOTIVO.includes(estado);
}

export function esEstadoFinal(estado: EstadoIncidente): boolean {
  return ESTADOS_FINALES.includes(estado);
}

/**
 * Estados a los que se puede mover un incidente desde el suyo actual:
 *
 *   pendiente  → en proceso · resuelto · rechazado · cancelado
 *   en proceso → resuelto · rechazado · cancelado
 *   resuelto / rechazado / cancelado → (ninguno: son finales)
 *
 * El backend debe aplicar la misma regla; esto solo evita ofrecer en pantalla un
 * cambio que no corresponde.
 */
export function transicionesDe(estado: EstadoIncidente): EstadoIncidente[] {
  if (esEstadoFinal(estado)) return [];
  const destinos: EstadoIncidente[] = ["en_proceso", "resuelto", "rechazado", "cancelado"];
  return destinos.filter((e) => e !== estado);
}

/** true si `destino` es un cambio válido desde `origen`. */
export function puedeCambiarA(origen: EstadoIncidente, destino: EstadoIncidente): boolean {
  return transicionesDe(origen).includes(destino);
}
