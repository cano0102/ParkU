import type { Celda, EstadoCelda, MotivoDisponibilidad, TipoCelda, UsabilidadCelda } from "@/services/api/celdas";

/** Las tres categorías que el formulario de parqueadero deja configurar por cantidad —
 *  mismo agrupamiento que `generarLote()` ya usaba al crear, ahora reutilizado para editar. */
export interface CategoriaCeldas {
  prefijo: string;
  tipo: TipoCelda;
  usabilidad: UsabilidadCelda;
}

export const CATEGORIAS_CELDAS: Record<"carros" | "motos" | "movilidadReducida", CategoriaCeldas> = {
  carros: { prefijo: "C-", tipo: "carro", usabilidad: "general" },
  motos: { prefijo: "M-", tipo: "moto", usabilidad: "general" },
  movilidadReducida: { prefijo: "PMR-", tipo: "carro", usabilidad: "movilidad_reducida" },
};

/** Reparte las celdas de un parqueadero en las tres categorías configurables. Una celda de
 *  movilidad reducida siempre tiene `tipo: "carro"` en el modelo real (ver `generarLote`), así
 *  que se separa por `usabilidad` primero para no contarla dos veces como "carro" normal. */
export function agruparPorCategoria(celdasParqueadero: Celda[]) {
  const movilidadReducida = celdasParqueadero.filter((c) => c.usabilidad === "movilidad_reducida");
  const carros = celdasParqueadero.filter((c) => c.tipo === "carro" && c.usabilidad !== "movilidad_reducida");
  const motos = celdasParqueadero.filter((c) => c.tipo === "moto");
  return { carros, motos, movilidadReducida };
}

/** Siguiente número libre para un prefijo dado ("C-", "M-", "PMR-"), a partir de TODAS las
 *  celdas de esa categoría que ya existan (incluidas las inactivas) — nunca reutiliza un número
 *  ya asignado, así una celda desactivada y luego una nueva no terminan compartiendo número. */
export function siguienteNumeroCelda(celdasCategoria: Celda[], prefijo: string): string {
  const usados = celdasCategoria
    .map((c) => c.numero)
    .filter((n) => n.startsWith(prefijo))
    .map((n) => parseInt(n.slice(prefijo.length), 10))
    .filter((n) => !Number.isNaN(n));
  const siguiente = (usados.length ? Math.max(...usados) : 0) + 1;
  return `${prefijo}${String(siguiente).padStart(3, "0")}`;
}

export interface ReconciliarCategoriaDeps {
  parqueaderoId: string;
  addCelda: (data: Omit<Celda, "id">) => Promise<Celda>;
  cambiarDisponibilidadCelda: (
    id: string,
    estado: EstadoCelda,
    motivo: MotivoDisponibilidad,
    observacion?: string
  ) => Promise<Celda>;
}

export type ReconciliarCategoriaResultado =
  | { ok: true; creadas: number; reactivadas: number; desactivadas: number }
  | { ok: false; motivo: string };

/** Ajusta la cantidad de celdas ACTIVAS (estado != "inactiva") de una categoría a `objetivo`:
 *
 * - Si faltan, reactiva primero las que ya estén "inactiva" (evita crecimiento sin límite del
 *   número de filas en la tabla de celdas por un ciclo reducir→aumentar) y solo crea celdas
 *   nuevas para lo que sobre.
 * - Si sobran, SOLO desactiva ("inactiva", no elimina la fila — preserva el historial de
 *   ingresos/reservas que la referencien) celdas que estén genuinamente libres (`disponible` o
 *   `mantenimiento`, nunca `no_disponible`/`reservada`). Si no hay suficientes libres para
 *   llegar al objetivo, no desactiva ninguna y devuelve `ok:false` con el motivo — la reducción
 *   completa se rechaza en vez de dejar la cantidad a medio camino. */
export async function reconciliarCategoria(
  categoria: CategoriaCeldas,
  celdasCategoria: Celda[],
  objetivo: number,
  deps: ReconciliarCategoriaDeps
): Promise<ReconciliarCategoriaResultado> {
  const activas = celdasCategoria.filter((c) => c.estado !== "inactiva");
  const inactivas = celdasCategoria.filter((c) => c.estado === "inactiva");

  if (objetivo === activas.length) return { ok: true, creadas: 0, reactivadas: 0, desactivadas: 0 };

  if (objetivo > activas.length) {
    const faltan = objetivo - activas.length;
    const aReactivar = inactivas.slice(0, faltan);
    for (const c of aReactivar) {
      await deps.cambiarDisponibilidadCelda(c.id, "disponible", "ajuste_operativo", "Reactivada al aumentar la cantidad configurada del parqueadero.");
    }
    const numerando = [...celdasCategoria];
    const porCrear = faltan - aReactivar.length;
    for (let i = 0; i < porCrear; i++) {
      const numero = siguienteNumeroCelda(numerando, categoria.prefijo);
      const creada = await deps.addCelda({
        parqueaderoId: deps.parqueaderoId, numero, tipo: categoria.tipo, usabilidad: categoria.usabilidad,
        estado: "disponible", ocupada: false, observaciones: "",
      });
      numerando.push(creada);
    }
    return { ok: true, creadas: porCrear, reactivadas: aReactivar.length, desactivadas: 0 };
  }

  const sobran = activas.length - objetivo;
  // Disponibles primero; "mantenimiento" solo si no alcanzan — nunca ocupada/reservada.
  const candidatas = [
    ...activas.filter((c) => c.estado === "disponible"),
    ...activas.filter((c) => c.estado === "mantenimiento"),
  ];
  if (candidatas.length < sobran) {
    const noDisponibles = activas.length - candidatas.length;
    return {
      ok: false,
      motivo:
        `No se puede reducir a ${objetivo}: hay ${noDisponibles} celda(s) ocupada(s) o con una reserva activa ` +
        `que no se pueden desactivar. Libéralas primero o elige una cantidad mayor.`,
    };
  }
  const aDesactivar = candidatas.slice(0, sobran);
  for (const c of aDesactivar) {
    await deps.cambiarDisponibilidadCelda(c.id, "inactiva", "ajuste_operativo", "Desactivada al reducir la cantidad configurada del parqueadero.");
  }
  return { ok: true, creadas: 0, reactivadas: 0, desactivadas: aDesactivar.length };
}

export interface ReconciliarTodasResultado {
  ok: boolean;
  totalCreadas: number;
  totalReactivadas: number;
  totalDesactivadas: number;
  /** Un mensaje por cada categoría que no se pudo reducir (celdas ocupadas/reservadas de por medio). */
  bloqueos: string[];
}

/** Reconcilia las tres categorías configurables de una sola vez. Las categorías que sí se
 *  pueden ajustar se aplican aunque otra quede bloqueada (p. ej. si sobran motos ocupadas pero
 *  hay que agregar carros, los carros se crean igual) — solo la categoría bloqueada queda sin
 *  tocar, con su motivo devuelto en `bloqueos` para mostrarlo completo de una vez. */
export async function reconciliarTodasLasCategorias(
  celdasParqueadero: Celda[],
  objetivos: { carros: number; motos: number; movilidadReducida: number },
  deps: ReconciliarCategoriaDeps
): Promise<ReconciliarTodasResultado> {
  const grupos = agruparPorCategoria(celdasParqueadero);
  const resultado: ReconciliarTodasResultado = { ok: true, totalCreadas: 0, totalReactivadas: 0, totalDesactivadas: 0, bloqueos: [] };

  const entradas: [keyof typeof objetivos, CategoriaCeldas, Celda[]][] = [
    ["carros", CATEGORIAS_CELDAS.carros, grupos.carros],
    ["motos", CATEGORIAS_CELDAS.motos, grupos.motos],
    ["movilidadReducida", CATEGORIAS_CELDAS.movilidadReducida, grupos.movilidadReducida],
  ];

  for (const [clave, categoria, celdasCategoria] of entradas) {
    const r = await reconciliarCategoria(categoria, celdasCategoria, objetivos[clave], deps);
    if (!r.ok) {
      resultado.ok = false;
      resultado.bloqueos.push(r.motivo);
      continue;
    }
    resultado.totalCreadas += r.creadas;
    resultado.totalReactivadas += r.reactivadas;
    resultado.totalDesactivadas += r.desactivadas;
  }

  return resultado;
}
