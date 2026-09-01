import type { Reserva, EstadoReserva } from "@/services/api/reservas";

/**
 * Choque de horario: dos reservas de la MISMA celda se solapan si una empieza antes de que
 * la otra termine y termina después de que la otra empieza. Implementación de referencia
 * (antes vivía solo en `useReservasPage.ts`) — `useReservaCelda.ts` (crear una reserva desde
 * el plano de Parqueaderos) tenía su propio chequeo que ignoraba fecha/hora por completo
 * (bloqueaba con CUALQUIER reserva pendiente/activa de la celda, aunque fuera de otra semana),
 * así que ahora ambos importan esto en vez de mantener dos implementaciones divergentes.
 */
export function seSolapan(
  a: Pick<Reserva, "fechaReserva" | "horaInicio" | "horaFin">,
  b: Pick<Reserva, "fechaReserva" | "horaInicio" | "horaFin">
): boolean {
  const aInicio = new Date(`${a.fechaReserva}T${a.horaInicio}`).getTime();
  const aFin = new Date(`${a.fechaReserva}T${a.horaFin}`).getTime();
  const bInicio = new Date(`${b.fechaReserva}T${b.horaInicio}`).getTime();
  const bFin = new Date(`${b.fechaReserva}T${b.horaFin}`).getTime();
  return bInicio < aFin && bFin > aInicio;
}

export interface BuscarConflictoHorarioOpciones {
  /** Estados de reserva contra los que sí se considera un choque real. Por defecto solo
   *  `activa` (aceptada): dos solicitudes `pendiente` pueden competir por la misma franja
   *  sin problema — el conflicto real solo existe si se intenta aceptar/activar una segunda
   *  vez la misma franja de la misma celda. */
  estados?: EstadoReserva[];
  /** Id de la propia reserva a excluir de la búsqueda (al revisar una reserva ya existente
   *  contra el resto de la lista). Omitir al chequear una reserva nueva que aún no tiene id. */
  excludeId?: string;
}

/** Primera reserva de `reservas` que ocupa la misma celda que `candidata` y se solapa con
 *  su franja horaria, o `null` si no hay ninguna. */
export function buscarConflictoHorario(
  candidata: Pick<Reserva, "celdaId" | "fechaReserva" | "horaInicio" | "horaFin">,
  reservas: Reserva[],
  { estados = ["activa"], excludeId }: BuscarConflictoHorarioOpciones = {}
): Reserva | null {
  return (
    reservas.find(
      (r) =>
        r.id !== excludeId &&
        r.celdaId === candidata.celdaId &&
        estados.includes(r.estado) &&
        seSolapan(candidata, r)
    ) ?? null
  );
}
