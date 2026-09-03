import { describe, it, expect } from "vitest";
import { esEstadoFinal, puedeCambiarA, transicionesDe } from "./transiciones";

describe("features/incidentes/lib/transiciones", () => {
  it("deja avanzar un incidente pendiente a cualquier otro estado", () => {
    expect(transicionesDe("pendiente")).toEqual(["en_proceso", "resuelto", "cerrado", "cancelado"]);
  });

  it("deja pasar de en proceso a resuelto", () => {
    expect(puedeCambiarA("en_proceso", "resuelto")).toBe(true);
    expect(transicionesDe("en_proceso")).not.toContain("en_proceso");
  });

  it("no deja cambiar el estado de un incidente resuelto, cerrado o cancelado", () => {
    for (const estado of ["resuelto", "cerrado", "cancelado"] as const) {
      expect(esEstadoFinal(estado)).toBe(true);
      expect(transicionesDe(estado)).toEqual([]);
      expect(puedeCambiarA(estado, "pendiente")).toBe(false);
      expect(puedeCambiarA(estado, "en_proceso")).toBe(false);
    }
  });
});
