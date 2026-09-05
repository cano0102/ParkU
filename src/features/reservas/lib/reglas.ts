/**
 * Reglas de tiempo de una reserva. Son las mismas que aplica el backend
 * (`src/config/reglasReserva.js` de la API); aquí se repiten para poder avisar mientras se
 * elige la hora, en vez de dejar que el formulario se rellene entero y el error llegue al
 * pulsar "Solicitar".
 *
 * - Se pide con al menos media hora de anticipación (para reservar a las 12:00 hay que
 *   hacerlo antes de las 11:30).
 * - Dura al menos una hora (a las 12:00 termina a las 13:00 o más tarde).
 * - Se cancela hasta media hora antes del inicio.
 */

export const ANTICIPACION_MINIMA_MINUTOS = 30;
export const DURACION_MINIMA_MINUTOS = 60;
export const MARGEN_CANCELACION_MINUTOS = 30;

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

/** Una franja por defecto que ya cumple las reglas: empieza dentro de la anticipación mínima. */
export function franjaSugerida(ahora: Date = new Date()): { fechaReserva: string; horaInicio: string; horaFin: string } {
  const inicio = aMinutos(horaMinimaDeInicio(hoy(ahora), ahora) ?? "00:00");
  return {
    fechaReserva: hoy(ahora),
    horaInicio: aHora(inicio),
    horaFin: aHora(inicio + DURACION_MINIMA_MINUTOS),
  };
}

/** Salto entre una hora ofrecida y la siguiente en los selectores. */
export const PASO_MINUTOS = 15;

/** La ventana en la que el parqueadero opera, en "HH:MM" (la conocen los módulos que la usan). */
export interface VentanaOperacion {
  desde: string;
  hasta: string;
}

/** Lista de horas de `desde` a `hasta` (ambas en minutos), de PASO_MINUTOS en PASO_MINUTOS. */
const _serie = (desde: number, hasta: number): string[] => {
  const primera = Math.ceil(desde / PASO_MINUTOS) * PASO_MINUTOS;
  const horas: string[] = [];
  for (let m = primera; m <= hasta; m += PASO_MINUTOS) horas.push(aHora(m));
  return horas;
};

/**
 * Horas de inicio que de verdad se pueden elegir: dentro del horario de operación, con la
 * anticipación mínima si la reserva es para hoy, y dejando sitio para la duración mínima
 * antes del cierre.
 *
 * Los formularios ofrecen exactamente esta lista, así que una hora inválida no se puede ni
 * seleccionar — antes se podía elegir y el aviso llegaba después, al intentar guardar.
 */
export function opcionesDeHoraInicio(fecha: string, ventana: VentanaOperacion, ahora: Date = new Date()): string[] {
  const minimaPorReloj = horaMinimaDeInicio(fecha, ahora);
  const desde = Math.max(aMinutos(ventana.desde), minimaPorReloj ? aMinutos(minimaPorReloj) : 0);
  // La última hora a la que se puede empezar es la que permite cumplir la duración mínima
  // antes de que el parqueadero cierre.
  return _serie(desde, aMinutos(ventana.hasta) - DURACION_MINIMA_MINUTOS);
}

/** Horas de fin posibles para un inicio dado: desde la duración mínima hasta el cierre. */
export function opcionesDeHoraFin(horaInicio: string, ventana: VentanaOperacion): string[] {
  if (!horaInicio) return [];
  return _serie(aMinutos(horaInicio) + DURACION_MINIMA_MINUTOS, aMinutos(ventana.hasta));
}

/**
 * Corrige una franja para que solo contenga horas que se pueden elegir. Se usa al cambiar la
 * fecha o la hora de inicio: si lo que había deja de ser válido (p. ej. se pasa la reserva de
 * mañana a hoy y las 06:00 ya no existen), se mueve a la primera opción posible en vez de
 * dejar el selector en blanco.
 */
export function ajustarFranja(
  franja: { fechaReserva: string; horaInicio: string; horaFin: string },
  ventana: VentanaOperacion,
  ahora: Date = new Date(),
): { fechaReserva: string; horaInicio: string; horaFin: string } {
  const inicios = opcionesDeHoraInicio(franja.fechaReserva, ventana, ahora);
  const horaInicio = inicios.includes(franja.horaInicio) ? franja.horaInicio : inicios[0] ?? "";
  const fines = opcionesDeHoraFin(horaInicio, ventana);
  const horaFin = fines.includes(franja.horaFin) ? franja.horaFin : fines[0] ?? "";
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
