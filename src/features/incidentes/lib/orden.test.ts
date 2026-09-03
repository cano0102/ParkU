import { describe, it, expect } from "vitest";
import type { Incidente } from "@/services/api/incidentes";
import { compararIncidentes } from "./orden";

function incidente(over: Partial<Incidente>): Incidente {
  return {
    id: "1",
    tipoNovedad: "otro",
    prioridad: "media",
    descripcion: "",
    parqueaderoId: "1",
    celdaId: "",
    vehiculoId: "",
    usuarioAsignadoId: "",
    fecha: "2025-06-01T10:00:00.000Z",
    estado: "pendiente",
    justificacionCierre: "",
    ...over,
  };
}

describe("features/incidentes/lib/orden", () => {
  it("deja los finalizados después de los abiertos aunque tengan más prioridad o sean más recientes", () => {
    const abiertoBaja = incidente({ id: "abierto", prioridad: "baja", fecha: "2025-01-01T10:00:00.000Z" });
    const resueltoCritico = incidente({ id: "resuelto", estado: "resuelto", prioridad: "critica", fecha: "2025-12-01T10:00:00.000Z" });
    const cerradoCritico = incidente({ id: "cerrado", estado: "cerrado", prioridad: "critica", fecha: "2025-12-31T10:00:00.000Z" });

    const orden = [resueltoCritico, cerradoCritico, abiertoBaja].sort(compararIncidentes).map((i) => i.id);

    expect(orden[0]).toBe("abierto");
    expect(orden.slice(1).sort()).toEqual(["cerrado", "resuelto"]);
  });

  it("ordena los abiertos por prioridad, de crítica a baja", () => {
    const orden = [
      incidente({ id: "baja", prioridad: "baja" }),
      incidente({ id: "critica", prioridad: "critica" }),
      incidente({ id: "media", prioridad: "media" }),
      incidente({ id: "alta", prioridad: "alta", estado: "en_proceso" }),
    ]
      .sort(compararIncidentes)
      .map((i) => i.id);

    expect(orden).toEqual(["critica", "alta", "media", "baja"]);
  });

  it("a igual estado y prioridad, muestra primero el más reciente", () => {
    const orden = [
      incidente({ id: "viejo", fecha: "2025-01-01T10:00:00.000Z" }),
      incidente({ id: "nuevo", fecha: "2025-09-01T10:00:00.000Z" }),
    ]
      .sort(compararIncidentes)
      .map((i) => i.id);

    expect(orden).toEqual(["nuevo", "viejo"]);
  });
});
