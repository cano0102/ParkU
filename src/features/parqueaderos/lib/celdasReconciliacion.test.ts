import { describe, it, expect, vi } from "vitest";
import type { Celda } from "@/services/api/celdas";
import {
  siguienteNumeroCelda, agruparPorCategoria, reconciliarCategoria, reconciliarTodasLasCategorias,
  CATEGORIAS_CELDAS,
} from "./celdasReconciliacion";

function celda(overrides: Partial<Celda>): Celda {
  return {
    id: "id", parqueaderoId: "1", numero: "C-001", tipo: "carro", usabilidad: "general",
    estado: "disponible", ocupada: false, observaciones: "",
    ...overrides,
  };
}

describe("agruparPorCategoria", () => {
  it("separa movilidad reducida de carro normal aunque ambas tengan tipo carro", () => {
    const celdas = [
      celda({ id: "1", numero: "C-001", tipo: "carro", usabilidad: "general" }),
      celda({ id: "2", numero: "PMR-001", tipo: "carro", usabilidad: "movilidad_reducida" }),
      celda({ id: "3", numero: "M-001", tipo: "moto", usabilidad: "general" }),
    ];
    const { carros, motos, movilidadReducida } = agruparPorCategoria(celdas);
    expect(carros.map((c) => c.id)).toEqual(["1"]);
    expect(motos.map((c) => c.id)).toEqual(["3"]);
    expect(movilidadReducida.map((c) => c.id)).toEqual(["2"]);
  });
});

describe("siguienteNumeroCelda", () => {
  it("continúa después del número más alto ya usado", () => {
    const celdas = [celda({ numero: "C-001" }), celda({ numero: "C-002" }), celda({ numero: "C-005" })];
    expect(siguienteNumeroCelda(celdas, "C-")).toBe("C-006");
  });

  it("empieza en 001 cuando no hay ninguna celda de esa categoría", () => {
    expect(siguienteNumeroCelda([], "M-")).toBe("M-001");
  });

  it("no reutiliza el número de una celda inactiva (evita colisión al recrear)", () => {
    const celdas = [celda({ numero: "C-001", estado: "inactiva" }), celda({ numero: "C-002" })];
    expect(siguienteNumeroCelda(celdas, "C-")).toBe("C-003");
  });
});

function buildDeps() {
  let nextId = 100;
  const addCelda = vi.fn(async (data: Omit<Celda, "id">) => ({ ...data, id: String(nextId++) }) as Celda);
  const cambiarDisponibilidadCelda = vi.fn(async (id: string, estado: Celda["estado"]) =>
    celda({ id, estado })
  );
  return { parqueaderoId: "1", addCelda, cambiarDisponibilidadCelda };
}

describe("reconciliarCategoria — sin cambio", () => {
  it("no hace nada si la cantidad activa ya coincide con el objetivo", async () => {
    const deps = buildDeps();
    const celdas = [celda({ id: "1" }), celda({ id: "2", numero: "C-002" })];
    const r = await reconciliarCategoria(CATEGORIAS_CELDAS.carros, celdas, 2, deps);
    expect(r).toEqual({ ok: true, creadas: 0, reactivadas: 0, desactivadas: 0 });
    expect(deps.addCelda).not.toHaveBeenCalled();
    expect(deps.cambiarDisponibilidadCelda).not.toHaveBeenCalled();
  });
});

describe("reconciliarCategoria — aumentar", () => {
  it("crea únicamente las celdas adicionales (10 → 15 crea 5, no recrea las 10)", async () => {
    const deps = buildDeps();
    const celdas = Array.from({ length: 10 }, (_, i) => celda({ id: `c${i}`, numero: `C-${String(i + 1).padStart(3, "0")}` }));
    const r = await reconciliarCategoria(CATEGORIAS_CELDAS.carros, celdas, 15, deps);
    expect(r).toMatchObject({ ok: true, creadas: 5, reactivadas: 0 });
    expect(deps.addCelda).toHaveBeenCalledTimes(5);
    // Numeración continúa en 011..015, no repite 001..010.
    expect(deps.addCelda.mock.calls.map((c) => c[0].numero)).toEqual(["C-011", "C-012", "C-013", "C-014", "C-015"]);
  });

  it("reactiva celdas inactivas existentes antes de crear nuevas", async () => {
    const deps = buildDeps();
    const celdas = [
      celda({ id: "1", numero: "C-001" }),
      celda({ id: "2", numero: "C-002", estado: "inactiva" }),
      celda({ id: "3", numero: "C-003", estado: "inactiva" }),
    ];
    // 1 activa + 2 inactivas = 3 celdas en total; objetivo 3 activas -> reactiva las 2 inactivas, no crea ninguna.
    const r = await reconciliarCategoria(CATEGORIAS_CELDAS.carros, celdas, 3, deps);
    expect(r).toMatchObject({ ok: true, creadas: 0, reactivadas: 2 });
    expect(deps.cambiarDisponibilidadCelda).toHaveBeenCalledTimes(2);
    expect(deps.cambiarDisponibilidadCelda).toHaveBeenCalledWith("2", "disponible", "ajuste_operativo", expect.any(String));
    expect(deps.addCelda).not.toHaveBeenCalled();
  });

  it("reactiva lo que pueda y crea el resto cuando las inactivas no alcanzan", async () => {
    const deps = buildDeps();
    const celdas = [celda({ id: "1", numero: "C-001" }), celda({ id: "2", numero: "C-002", estado: "inactiva" })];
    // 1 activa + 1 inactiva; objetivo 5 -> reactiva la 1 inactiva, crea 3 nuevas.
    const r = await reconciliarCategoria(CATEGORIAS_CELDAS.carros, celdas, 5, deps);
    expect(r).toMatchObject({ ok: true, creadas: 3, reactivadas: 1 });
  });
});

describe("reconciliarCategoria — reducir", () => {
  it("desactiva únicamente celdas disponibles cuando alcanzan (10 → 7 desactiva 3 disponibles)", async () => {
    const deps = buildDeps();
    const celdas = Array.from({ length: 10 }, (_, i) => celda({ id: `c${i}`, numero: `C-${i}` }));
    const r = await reconciliarCategoria(CATEGORIAS_CELDAS.carros, celdas, 7, deps);
    expect(r).toMatchObject({ ok: true, desactivadas: 3, creadas: 0, reactivadas: 0 });
    expect(deps.cambiarDisponibilidadCelda).toHaveBeenCalledTimes(3);
    for (const call of deps.cambiarDisponibilidadCelda.mock.calls) {
      expect(call[1]).toBe("inactiva");
    }
  });

  it("rechaza la reducción completa si no hay suficientes celdas libres (ocupadas/reservadas de por medio)", async () => {
    const deps = buildDeps();
    const celdas = [
      celda({ id: "1", estado: "disponible" }),
      celda({ id: "2", estado: "no_disponible" }), // ocupada
      celda({ id: "3", estado: "reservada" }),
      celda({ id: "4", estado: "disponible" }),
      celda({ id: "5", estado: "disponible" }),
    ];
    // 5 activas, objetivo 2 -> hace falta desactivar 3, pero solo 3 están disponibles... probemos con un objetivo
    // que SÍ exceda lo disponible: objetivo 1 -> hace falta desactivar 4, solo 3 disponibles.
    const r = await reconciliarCategoria(CATEGORIAS_CELDAS.carros, celdas, 1, deps);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.motivo).toContain("ocupada");
      expect(r.motivo).toContain("2"); // las 2 ocupadas/reservadas que bloquean
    }
    // Nada se desactivó: la operación se rechaza completa, no queda a medias.
    expect(deps.cambiarDisponibilidadCelda).not.toHaveBeenCalled();
  });

  it("nunca elige una celda ocupada o reservada aunque sobren candidatas disponibles de más", async () => {
    const deps = buildDeps();
    const celdas = [
      celda({ id: "1", estado: "disponible" }),
      celda({ id: "2", estado: "no_disponible" }),
      celda({ id: "3", estado: "disponible" }),
    ];
    const r = await reconciliarCategoria(CATEGORIAS_CELDAS.carros, celdas, 2, deps);
    expect(r).toMatchObject({ ok: true, desactivadas: 1 });
    expect(deps.cambiarDisponibilidadCelda).toHaveBeenCalledWith("1", "inactiva", "ajuste_operativo", expect.any(String));
    expect(deps.cambiarDisponibilidadCelda).not.toHaveBeenCalledWith("2", expect.anything(), expect.anything(), expect.anything());
  });

  it("usa celdas en mantenimiento como candidato solo después de agotar las disponibles", async () => {
    const deps = buildDeps();
    const celdas = [
      celda({ id: "1", estado: "disponible" }),
      celda({ id: "2", estado: "mantenimiento" }),
    ];
    const r = await reconciliarCategoria(CATEGORIAS_CELDAS.carros, celdas, 0, deps);
    expect(r).toMatchObject({ ok: true, desactivadas: 2 });
    // La disponible se desactiva antes que la de mantenimiento (orden de las llamadas).
    expect(deps.cambiarDisponibilidadCelda.mock.calls[0][0]).toBe("1");
    expect(deps.cambiarDisponibilidadCelda.mock.calls[1][0]).toBe("2");
  });
});

describe("reconciliarTodasLasCategorias", () => {
  it("ajusta las categorías que puede aunque otra quede bloqueada por celdas ocupadas", async () => {
    const deps = buildDeps();
    const celdas = [
      celda({ id: "1", numero: "C-001", tipo: "carro", usabilidad: "general" }), // carros: 1 activa
      celda({ id: "2", numero: "M-001", tipo: "moto", usabilidad: "general", estado: "no_disponible" }), // motos: 1 ocupada
    ];
    const r = await reconciliarTodasLasCategorias(
      celdas, { carros: 3, motos: 0, movilidadReducida: 2 }, deps
    );
    expect(r.ok).toBe(false);
    expect(r.bloqueos).toHaveLength(1); // solo motos falla (reducir 1 ocupada a 0)
    expect(r.totalCreadas).toBe(3 - 1 + 2); // 2 carros nuevos + 2 PMR nuevas
  });

  it("reporta éxito total cuando las tres categorías se pueden ajustar", async () => {
    const deps = buildDeps();
    const r = await reconciliarTodasLasCategorias([], { carros: 2, motos: 1, movilidadReducida: 0 }, deps);
    expect(r.ok).toBe(true);
    expect(r.bloqueos).toEqual([]);
    expect(r.totalCreadas).toBe(3);
  });
});
