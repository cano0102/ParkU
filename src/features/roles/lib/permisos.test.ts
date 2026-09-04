import { describe, it, expect } from "vitest";
import { etiquetaDePermiso } from "./permisos";

describe("features/roles/lib/etiquetaDePermiso", () => {
  it("usa la descripción del backend cuando el permiso la trae", () => {
    expect(
      etiquetaDePermiso({ nombre: "parqueaderos.gestionar", descripcion: "Gestionar parqueaderos y celdas" })
    ).toBe("Gestionar parqueaderos y celdas");
  });

  it("arma la etiqueta desde la clave técnica cuando no hay descripción", () => {
    expect(etiquetaDePermiso({ nombre: "reservas.consultar" })).toBe("Consultar reservas");
    expect(etiquetaDePermiso({ nombre: "incidentes.eliminar", descripcion: "  " })).toBe("Eliminar incidentes");
  });

  it("mantiene legible una acción que no está en la tabla de verbos", () => {
    expect(etiquetaDePermiso({ nombre: "celdas.exportar" })).toBe("Exportar celdas");
  });

  it("capitaliza un permiso sin punto en el nombre", () => {
    expect(etiquetaDePermiso({ nombre: "dashboard" })).toBe("Dashboard");
  });
});
