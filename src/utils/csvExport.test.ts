import { describe, it, expect, vi, afterEach } from "vitest";
import { construirContenidoCsv, nombreArchivoConFecha, exportarCsv, type CsvColumn } from "./csvExport";

interface Fila {
  nombre: string;
  ciudad: string;
  cantidad: number;
}

const columnas: CsvColumn<Fila>[] = [
  { header: "Nombre", value: (r) => r.nombre },
  { header: "Ciudad", value: (r) => r.ciudad },
  { header: "Cantidad", value: (r) => r.cantidad },
];

describe("construirContenidoCsv", () => {
  it("separa las columnas con ; (no con ,) para que Excel en español lo reconozca", () => {
    const csv = construirContenidoCsv(columnas, [{ nombre: "Ana", ciudad: "Medellín", cantidad: 3 }]);
    const lineas = csv.replace("﻿", "").split("\r\n");
    expect(lineas[0]).toBe("Nombre;Ciudad;Cantidad");
    expect(lineas[1]).toBe("Ana;Medellín;3");
  });

  it("empieza con el BOM de UTF-8 (necesario para que Excel no rompa las tildes)", () => {
    const csv = construirContenidoCsv(columnas, []);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("envuelve en comillas un valor que contiene el separador, y escapa las comillas internas", () => {
    const csv = construirContenidoCsv(columnas, [{ nombre: 'Restrepo; "El Jefe"', ciudad: "Bogotá", cantidad: 1 }]);
    const lineas = csv.split("\r\n");
    expect(lineas[1]).toBe('"Restrepo; ""El Jefe""";Bogotá;1');
  });

  it("no toca un valor que no necesita escape", () => {
    const csv = construirContenidoCsv(columnas, [{ nombre: "Ana", ciudad: "Cali", cantidad: 10 }]);
    expect(csv).toContain("Ana;Cali;10");
  });

  it("genera solo el encabezado cuando no hay filas (respeta un filtro que no arrojó resultados)", () => {
    const csv = construirContenidoCsv(columnas, []);
    expect(csv.slice(1)).toBe("Nombre;Ciudad;Cantidad");
  });

  it("antepone un apóstrofo a un valor que Excel interpretaría como fórmula (CSV Injection)", () => {
    const csv = construirContenidoCsv(columnas, [
      { nombre: "=SUM(A1:A2)", ciudad: "-2+3", cantidad: 1 },
    ]);
    const lineas = csv.split("\r\n");
    expect(lineas[1]).toBe("'=SUM(A1:A2);'-2+3;1");
  });

  it("combina el apóstrofo de fórmula con el escape de comillas cuando aplican los dos", () => {
    const csv = construirContenidoCsv(columnas, [
      { nombre: '=HYPERLINK("http://evil.com")', ciudad: "Cali", cantidad: 1 },
    ]);
    const lineas = csv.split("\r\n");
    expect(lineas[1]).toBe('"\'=HYPERLINK(""http://evil.com"")";Cali;1');
  });
});

describe("nombreArchivoConFecha", () => {
  it("arma el nombre con la fecha de hoy en formato YYYY-MM-DD", () => {
    const hoy = new Date().toISOString().slice(0, 10);
    expect(nombreArchivoConFecha("reservas")).toBe(`reservas_${hoy}.csv`);
  });
});

describe("exportarCsv", () => {
  afterEach(() => vi.restoreAllMocks());

  it("crea un enlace de descarga con el nombre de archivo correcto y lo dispara", () => {
    // jsdom intenta navegar de verdad al hacer click() en un <a href>: se mockea el click
    // para probar solo que se dispara, sin que jsdom se queje de "navigation not implemented".
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const createElementSpy = vi.spyOn(document, "createElement");
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const removeSpy = vi.spyOn(document.body, "removeChild");
    const createUrlSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    const revokeUrlSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    exportarCsv("mi-reporte", columnas, [{ nombre: "Ana", ciudad: "Cali", cantidad: 1 }]);

    const link = createElementSpy.mock.results.find((r) => (r.value as HTMLElement).tagName === "A")!.value as HTMLAnchorElement;
    expect(link.download).toMatch(/^mi-reporte_\d{4}-\d{2}-\d{2}\.csv$/);
    expect(link.href).toBe("blob:mock-url");
    expect(appendSpy).toHaveBeenCalledWith(link);
    expect(removeSpy).toHaveBeenCalledWith(link);
    expect(createUrlSpy).toHaveBeenCalled();
    expect(revokeUrlSpy).toHaveBeenCalledWith("blob:mock-url");
    expect(clickSpy).toHaveBeenCalled();
  });
});
