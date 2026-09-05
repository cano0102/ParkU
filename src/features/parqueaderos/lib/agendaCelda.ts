import type { Reserva } from "@/services/api/reservas";

/**
 * La agenda de una celda: qué reservas tiene hoy, cuál está vigente, cuál viene después, y
 * qué se puede hacer con la celda en este momento.
 *
 * Una reserva aparta una FRANJA, no la celda entera (ver la migración 006 de la API). Así que
 * "¿está reservada?" dejó de ser una propiedad de la celda y pasó a ser una pregunta con
 * hora: reservada *ahora* es una cosa, con una reserva *dentro de cinco horas* es otra muy
 * distinta, y antes las dos dejaban la celda inservible el día entero.
 *
 * Los números son los mismos que aplica el backend (src/config/reglasReserva.js).
 */

/** Con cuánta antelación a la próxima reserva se admite ocupar la celda. */
export const MARGEN_ESTACIONAR_ANTES_MINUTOS = 120;

/** A qué hora, como muy tarde, tiene que haber salido quien ocupa una celda con reserva próxima. */
export const MARGEN_SALIDA_ANTES_MINUTOS = 30;

/** Cuándo se le avisa al vigilante para que contacte al conductor: 20 minutos antes del plazo. */
export const AVISO_DESALOJO_MINUTOS = MARGEN_SALIDA_ANTES_MINUTOS + 20;

/** Cuándo se avisa, durante una reserva, de que la siguiente está por empezar. */
export const AVISO_PROXIMA_RESERVA_MINUTOS = 30;

const MINUTO_MS = 60 * 1000;

/** Los estados que de verdad ocupan sitio en la agenda. */
const VIVAS = new Set(["pendiente", "activa"]);

export const inicioDe = (r: Pick<Reserva, "fechaReserva" | "horaInicio">) =>
  new Date(`${r.fechaReserva}T${r.horaInicio}`);
export const finDe = (r: Pick<Reserva, "fechaReserva" | "horaFin">) =>
  new Date(`${r.fechaReserva}T${r.horaFin}`);

/** "HH:MM" de un momento, para escribirlo en un aviso. */
export const comoHora = (fecha: Date) =>
  `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`;

export interface AgendaCelda {
  /** Reservas vivas de la celda (aceptadas y solicitudes), en orden de inicio. */
  reservas: Reserva[];
  /** La aceptada que cubre este instante, si la hay: manda sobre quién puede estar en la celda. */
  vigente: Reserva | null;
  /** La siguiente aceptada que aún no empieza. */
  proxima: Reserva | null;
  /** Minutos que faltan para `proxima`, o null si no hay ninguna. */
  minutosParaProxima: number | null;
  /** Hasta qué hora puede quedarse quien ocupe la celda ahora (media hora antes de `proxima`). */
  horaLimiteSalida: Date | null;
}

/** Arma la agenda de una celda a partir de la lista completa de reservas. */
export function agendaDeCelda(
  celdaId: string,
  reservas: Reserva[],
  ahora: Date = new Date(),
): AgendaCelda {
  // Solo lo que todavía tiene efecto: una reserva que ya terminó no ocupa la agenda ni
  // aporta nada al panel de la celda.
  const reservasCelda = reservas
    .filter((r) => r.celdaId === celdaId && VIVAS.has(r.estado) && finDe(r) > ahora)
    .sort((a, b) => inicioDe(a).getTime() - inicioDe(b).getTime());

  const aceptadas = reservasCelda.filter((r) => r.estado === "activa");
  const vigente = aceptadas.find((r) => inicioDe(r) <= ahora && finDe(r) > ahora) ?? null;
  const proxima = aceptadas.find((r) => inicioDe(r) > ahora) ?? null;

  const minutosParaProxima = proxima
    ? Math.round((inicioDe(proxima).getTime() - ahora.getTime()) / MINUTO_MS)
    : null;
  const horaLimiteSalida = proxima
    ? new Date(inicioDe(proxima).getTime() - MARGEN_SALIDA_ANTES_MINUTOS * MINUTO_MS)
    : null;

  return { reservas: reservasCelda, vigente, proxima, minutosParaProxima, horaLimiteSalida };
}

export interface PermisoDeEstacionar {
  /** true si se puede registrar un ingreso en la celda ahora mismo. */
  puede: boolean;
  /** Por qué no, cuando no se puede. */
  motivo?: string;
  /**
   * Lo que hay que aceptar antes de estacionar: la celda tiene una reserva más adelante, así
   * que quien la ocupe se compromete a sacar el vehículo antes de una hora concreta. Se
   * muestra como confirmación, no como bloqueo: la celda está libre y el ingreso es válido.
   */
  confirmacion?: { aviso: string; detalle: string };
}

/**
 * ¿Puede este vehículo ocupar la celda ahora?
 *
 * - Con una reserva vigente, solo el vehículo de esa reserva.
 * - Con la próxima reserva a menos del margen para estacionar, nadie más: no da tiempo a
 *   usar la celda y desalojarla con orden.
 * - Con la próxima reserva más lejos, se puede — avisando de hasta qué hora.
 */
export function puedeEstacionarEn(
  agenda: AgendaCelda,
  vehiculoId: string | null | undefined,
): PermisoDeEstacionar {
  if (agenda.vigente) {
    if (vehiculoId && agenda.vigente.vehiculoId === vehiculoId) return { puede: true };
    return {
      puede: false,
      motivo: `La celda está reservada hasta las ${comoHora(finDe(agenda.vigente))}. Solo puede ocuparla el vehículo de esa reserva.`,
    };
  }

  if (!agenda.proxima || agenda.minutosParaProxima === null) return { puede: true };

  // Quien tiene la próxima reserva puede llegar antes: la celda es suya.
  if (vehiculoId && agenda.proxima.vehiculoId === vehiculoId) return { puede: true };

  if (agenda.minutosParaProxima < MARGEN_ESTACIONAR_ANTES_MINUTOS) {
    return {
      puede: false,
      motivo: `Esta celda tiene una reserva a las ${comoHora(inicioDe(agenda.proxima))} y falta menos de ${MARGEN_ESTACIONAR_ANTES_MINUTOS / 60} horas: no da tiempo a usarla y desalojarla. Elige otra celda.`,
    };
  }

  return {
    puede: true,
    confirmacion: {
      aviso:
        "Pronto habrá una reserva. Si deseas estacionar el vehículo en esta celda debes asegurar " +
        `que el vehículo salga máximo ${MARGEN_SALIDA_ANTES_MINUTOS} min antes de la reserva.`,
      detalle:
        `La reserva empieza a las ${comoHora(inicioDe(agenda.proxima))}, así que el vehículo debe ` +
        `haber salido antes de las ${comoHora(agenda.horaLimiteSalida!)}.`,
    },
  };
}

/**
 * Lo que hay que pintar sobre una celda del plano por causa de sus reservas: el aviso (si
 * toca alguno) y a qué hora es la siguiente, para que se vea sin abrir la celda.
 */
export interface MarcaReserva {
  aviso: AvisoCelda | null;
  /** Hora de la próxima reserva aceptada ("HH:MM"), o null si no hay ninguna por delante. */
  proximaHora: string | null;
  /** true si ahora mismo hay una reserva en curso sobre la celda. */
  enCurso: boolean;
}

export type TonoAviso = "urgente" | "atencion";

export interface AvisoCelda {
  tono: TonoAviso;
  /** Texto corto para la celda del plano (tooltip). */
  titulo: string;
  /** Texto completo para el panel de la celda. */
  detalle: string;
}

/**
 * El aviso que corresponde a una celda ahora mismo, o `null` si no hay nada que decir.
 *
 * Son dos situaciones, y las dos existen para lo mismo: que el vigilante pueda contactar al
 * conductor con tiempo, en vez de descubrir el problema cuando llega quien reservó.
 *
 * - **Celda ocupada con reserva próxima**: se avisa cuando faltan {@link AVISO_DESALOJO_MINUTOS}
 *   minutos para la reserva, veinte antes del plazo máximo de salida.
 * - **Reserva en curso con otra detrás**: se avisa {@link AVISO_PROXIMA_RESERVA_MINUTOS}
 *   minutos antes de que empiece la siguiente.
 */
export function avisoDeCelda(
  agenda: AgendaCelda,
  celdaOcupada: boolean,
): AvisoCelda | null {
  const faltan = agenda.minutosParaProxima;
  if (faltan === null || !agenda.proxima) return null;

  const horaReserva = comoHora(inicioDe(agenda.proxima));

  if (agenda.vigente) {
    if (faltan > AVISO_PROXIMA_RESERVA_MINUTOS) return null;
    return {
      tono: "atencion",
      titulo: `Siguiente reserva a las ${horaReserva}`,
      detalle: `La reserva en curso termina y a las ${horaReserva} empieza la siguiente. Prepara el relevo de la celda.`,
    };
  }

  if (!celdaOcupada || faltan > AVISO_DESALOJO_MINUTOS) return null;

  const limite = comoHora(agenda.horaLimiteSalida!);
  return {
    tono: faltan <= MARGEN_SALIDA_ANTES_MINUTOS ? "urgente" : "atencion",
    titulo: `Debe desalojar antes de las ${limite}`,
    detalle:
      `Esta celda tiene una reserva a las ${horaReserva}. Contacta al conductor para que retire el vehículo ` +
      `antes de las ${limite}.`,
  };
}
