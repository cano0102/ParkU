/**
 * Reglas de tiempo de una reserva. Son las mismas que aplica el backend
 * (`src/config/reglasReserva.js` de la API); aquí se repiten para poder avisar mientras se
 * elige la hora, en vez de dejar que el formulario se rellene entero y el error llegue al
 * pulsar "Solicitar".
 *
 * - Se pide con al menos dos horas de anticipación (a las 8:00, lo más pronto que se puede
 *   reservar es para las 10:00).
 * - Dura al menos una hora (a las 12:00 termina a las 13:00 o más tarde).
 * - No empieza después de las 19:30, aunque sí puede terminar hasta la hora de cierre.
 * - Se cancela hasta media hora antes del inicio.
 * - Una solicitud sin aprobar se rechaza sola a media hora del inicio.
 * - Los domingos el parqueadero no opera, así que no se reserva PARA un domingo. Pedir la
 *   reserva un domingo sí se puede: es justo cuando alguien organiza su semana.
 */

export const ANTICIPACION_MINIMA_MINUTOS = 120;
export const DURACION_MINIMA_MINUTOS = 60;
export const MARGEN_CANCELACION_MINUTOS = 30;
export const MARGEN_CONFIRMACION_MINUTOS = 30;

/** Última hora a la que puede EMPEZAR una reserva; el fin sí llega hasta el cierre. */
export const HORA_MAXIMA_INICIO = "19:30";

/**
 * Minutos que se le esperan al vehículo desde la hora de inicio. Pasados estos, la reserva
 * se cancela sola y la celda vuelve a estar disponible. Copia de src/config/reglasReserva.js
 * en la API, que es quien manda.
 */
export const MARGEN_LLEGADA_MINUTOS = 20;

/** Lo que queda escrito en la reserva cuando vence sola, para que se sepa por qué. */
export const MOTIVO_VENCIMIENTO_ACEPTADA = `Cancelada automáticamente: pasaron ${MARGEN_LLEGADA_MINUTOS} minutos desde la hora de inicio sin que el vehículo llegara, y la celda se liberó.`;
export const MOTIVO_SIN_CONFIRMAR = `Rechazada automáticamente: la solicitud no se aprobó a ${MARGEN_CONFIRMACION_MINUTOS} minutos de la hora de inicio.`;

/** Cuando un vehículo oficial ocupa una celda reservada: su reserva se cancela con esto. */
export const MOTIVO_OFICIAL_SENA = 'Oficial SENA estacionado, tiene prioridad en la operación del parqueadero.';

const MINUTO_MS = 60 * 1000;

/** "1 hora", "30 minutos" — para que los avisos se lean como los diría una persona. */
export function enPalabras(minutos: number): string {
  if (minutos % 60 === 0) {
    const horas = minutos / 60;
    return horas === 1 ? "1 hora" : `${horas} horas`;
  }
  return `${minutos} minutos`;
}

/** "HH:MM" a minutos desde medianoche. */
export const aMinutos = (hhmm: string): number => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** Minutos desde medianoche a "HH:MM", con el cero a la izquierda que espera <input type="time">. */
export const aHora = (minutos: number): string => {
  const total = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutos)));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

/**
 * ¿Esa fecha cae en domingo? Acepta tanto un `Date` como el "YYYY-MM-DD" de un campo de
 * fecha; el texto se interpreta como día local (con `new Date("2026-09-13")` a secas, el
 * navegador lo lee como UTC y en Colombia se corre un día).
 */
export function esDomingo(fecha: string | Date): boolean {
  const d = typeof fecha === "string" ? new Date(`${fecha}T12:00:00`) : fecha;
  return !Number.isNaN(d.getTime()) && d.getDay() === 0;
}

/** La fecha de hoy en el formato que usan los <input type="date"> y las reservas. */
export const hoy = (ahora: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}`;
};

/**
 * Primera hora que se puede elegir para un día dado. Para hoy es "ahora + la anticipación
 * mínima", redondeada hacia arriba a los siguientes 5 minutos (que es el salto natural de un
 * selector de hora); para cualquier día futuro, no hay límite inferior.
 *
 * Se usa como `min` del input, así que el propio selector ya no ofrece horas pasadas.
 * Si la anticipación se sale del día (reservar a las 22:00 para hoy ya no cabe), devuelve la
 * última hora del día y `rangoDeHoraInicio` se encarga de que no quede rango: ese día ya no
 * admite reservas y hay que elegir otro.
 */
export function horaMinimaDeInicio(fecha: string, ahora: Date = new Date()): string | undefined {
  if (fecha !== hoy(ahora)) return undefined;
  const minutos = ahora.getHours() * 60 + ahora.getMinutes() + ANTICIPACION_MINIMA_MINUTOS;
  return aHora(Math.ceil(minutos / 5) * 5);
}

/** Primera hora de fin válida: la de inicio más la duración mínima. */
export function horaMinimaDeFin(horaInicio: string): string | undefined {
  if (!horaInicio) return undefined;
  return aHora(aMinutos(horaInicio) + DURACION_MINIMA_MINUTOS);
}

/**
 * Una franja por defecto que ya cumple las reglas: empieza dentro de la anticipación mínima
 * y, si hoy es domingo, se va al lunes (ese día no se opera).
 */
export function franjaSugerida(ahora: Date = new Date()): { fechaReserva: string; horaInicio: string; horaFin: string } {
  if (esDomingo(ahora)) {
    const lunes = new Date(ahora);
    lunes.setDate(lunes.getDate() + 1);
    return { fechaReserva: hoy(lunes), horaInicio: "08:00", horaFin: "09:00" };
  }
  const inicio = aMinutos(horaMinimaDeInicio(hoy(ahora), ahora) ?? "00:00");
  return {
    fechaReserva: hoy(ahora),
    horaInicio: aHora(inicio),
    horaFin: aHora(inicio + DURACION_MINIMA_MINUTOS),
  };
}

/** La ventana en la que el parqueadero opera, en "HH:MM" (la conocen los módulos que la usan). */
export interface VentanaOperacion {
  desde: string;
  hasta: string;
}

/** Primera y última hora que admite un campo, para pasárselas como `min` y `max`. */
export interface RangoHorario {
  min: string;
  max: string;
}

/**
 * Horas de inicio admitidas: dentro del horario de operación, respetando la anticipación
 * mínima si la reserva es para hoy, y dejando sitio a la duración mínima antes del cierre.
 *
 * Va como `min`/`max` del campo de hora, así que el propio campo acota lo que se puede
 * elegir — a cualquier minuto, no de cuarto en cuarto — y lo que se escriba fuera de rango
 * se corrige al vuelo con `ajustarFranja`.
 */
export function rangoDeHoraInicio(fecha: string, ventana: VentanaOperacion, ahora: Date = new Date()): RangoHorario {
  const minimaPorReloj = horaMinimaDeInicio(fecha, ahora);
  const min = Math.max(aMinutos(ventana.desde), minimaPorReloj ? aMinutos(minimaPorReloj) : 0);
  // Dos topes: no empezar después de la hora máxima, y dejar sitio a la duración mínima
  // antes de que el parqueadero cierre. Manda el más temprano de los dos.
  const max = Math.min(aMinutos(HORA_MAXIMA_INICIO), aMinutos(ventana.hasta) - DURACION_MINIMA_MINUTOS);
  return { min: aHora(min), max: aHora(Math.max(min, max)) };
}

/** Horas de fin admitidas para un inicio dado: desde la duración mínima hasta el cierre. */
export function rangoDeHoraFin(horaInicio: string, ventana: VentanaOperacion): RangoHorario {
  const min = aMinutos(horaInicio || ventana.desde) + DURACION_MINIMA_MINUTOS;
  const max = aMinutos(ventana.hasta);
  return { min: aHora(min), max: aHora(Math.max(min, max)) };
}

/** Deja un valor dentro de un rango, sin moverlo si ya estaba dentro. */
const _dentroDe = (valor: string, { min, max }: RangoHorario): string => {
  if (!valor) return min;
  const m = aMinutos(valor);
  if (Number.isNaN(m)) return min;
  return aHora(Math.min(Math.max(m, aMinutos(min)), aMinutos(max)));
};

/**
 * Corrige una franja para que quede dentro de lo que se puede elegir. Se llama en cada
 * cambio de fecha o de hora: si lo que había deja de valer (se pasa la reserva de mañana a
 * hoy y las 06:00 ya quedaron atrás, o se mueve el inicio y el fin queda a menos de una
 * hora), el valor se acerca al límite más próximo en vez de quedarse en algo inválido.
 */
export function ajustarFranja(
  franja: { fechaReserva: string; horaInicio: string; horaFin: string },
  ventana: VentanaOperacion,
  ahora: Date = new Date(),
): { fechaReserva: string; horaInicio: string; horaFin: string } {
  const horaInicio = _dentroDe(franja.horaInicio, rangoDeHoraInicio(franja.fechaReserva, ventana, ahora));
  const horaFin = _dentroDe(franja.horaFin, rangoDeHoraFin(horaInicio, ventana));
  return { fechaReserva: franja.fechaReserva, horaInicio, horaFin };
}

/**
 * Comprueba las tres reglas sobre una franja concreta. Devuelve el aviso a mostrar, o `null`
 * si la franja sirve.
 */
export function validarFranja(
  { fechaReserva, horaInicio, horaFin }: { fechaReserva: string; horaInicio: string; horaFin: string },
  ahora: Date = new Date(),
): string | null {
  const inicio = new Date(`${fechaReserva}T${horaInicio}`);
  const fin = new Date(`${fechaReserva}T${horaFin}`);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return "La fecha y la hora no son válidas";

  // El parqueadero no abre los domingos: no hay nada que reservar ese día. El día en que se
  // PIDE la reserva da igual — pedirla un domingo para el lunes es perfectamente razonable.
  if (esDomingo(fechaReserva)) return "El parqueadero no opera los domingos: elige otro día";

  if (fin.getTime() <= inicio.getTime()) return "La hora de fin debe ser posterior a la de inicio";

  const faltan = (inicio.getTime() - ahora.getTime()) / MINUTO_MS;
  if (faltan < 0) return "No puedes reservar en una fecha u hora que ya pasó";
  if (faltan < ANTICIPACION_MINIMA_MINUTOS) {
    return `Reserva con al menos ${enPalabras(ANTICIPACION_MINIMA_MINUTOS)} de anticipación: la hora más próxima que puedes elegir hoy es las ${horaMinimaDeInicio(fechaReserva, ahora)}`;
  }

  const dura = (fin.getTime() - inicio.getTime()) / MINUTO_MS;
  if (dura < DURACION_MINIMA_MINUTOS) {
    return `La reserva debe durar al menos ${enPalabras(DURACION_MINIMA_MINUTOS)}: desde las ${horaInicio}, hasta las ${horaMinimaDeFin(horaInicio)} como mínimo`;
  }

  // Empezar pegado al cierre no tiene coherencia; terminar cerca del cierre sí.
  if (horaInicio > HORA_MAXIMA_INICIO) {
    return `Una reserva no puede empezar después de las ${HORA_MAXIMA_INICIO}: está muy cerca de la hora de cierre`;
  }

  return null;
}

/**
 * ¿Sigue a tiempo de cancelarse? Deja de estarlo media hora antes del inicio: a partir de
 * ahí la celda ya está apartada para esa persona y no da tiempo a que otra la use.
 */
export function estaATiempoDeCancelar(
  { fechaReserva, horaInicio }: { fechaReserva: string; horaInicio: string },
  ahora: Date = new Date(),
): boolean {
  const inicio = new Date(`${fechaReserva}T${horaInicio}`);
  if (Number.isNaN(inicio.getTime())) return false;
  return (inicio.getTime() - ahora.getTime()) / MINUTO_MS >= MARGEN_CANCELACION_MINUTOS;
}
