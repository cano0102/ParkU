import { describe, it, expect } from "vitest";
import { compararUsuariosPorRecientes } from "./helpers";

describe("features/usuarios/lib/compararUsuariosPorRecientes", () => {
  it("pone primero al creado más recientemente cuando la API envía la fecha", () => {
    const orden = [
      { id: "1", fechaCreacion: "2025-01-10T10:00:00.000Z" },
      { id: "2", fechaCreacion: "2026-03-01T10:00:00.000Z" },
      { id: "3", fechaCreacion: "2025-06-15T10:00:00.000Z" },
    ]
      .sort(compararUsuariosPorRecientes)
      .map((u) => u.id);

    expect(orden).toEqual(["2", "3", "1"]);
  });

  it("ordena por id descendente si el backend no envía fecha de creación", () => {
    const orden = [{ id: "4" }, { id: "12" }, { id: "7" }]
      .sort(compararUsuariosPorRecientes)
      .map((u) => u.id);

    expect(orden).toEqual(["12", "7", "4"]);
  });

  it("usa el id como desempate cuando dos cuentas comparten la misma fecha", () => {
    const misma = "2026-02-02T08:00:00.000Z";
    const orden = [
      { id: "5", fechaCreacion: misma },
      { id: "9", fechaCreacion: misma },
    ]
      .sort(compararUsuariosPorRecientes)
      .map((u) => u.id);

    expect(orden).toEqual(["9", "5"]);
  });

  it("no deja adelantarse a una cuenta sin fecha frente a otra con fecha antigua", () => {
    // Sin fecha en uno de los dos no se puede comparar por tiempo: se cae al id, que refleja
    // el orden de alta real en una tabla autoincremental.
    const orden = [
      { id: "2", fechaCreacion: "2020-01-01T00:00:00.000Z" },
      { id: "8" },
    ]
      .sort(compararUsuariosPorRecientes)
      .map((u) => u.id);

    expect(orden).toEqual(["8", "2"]);
  });
});
