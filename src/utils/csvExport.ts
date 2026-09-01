/**
 * Exportación a CSV reutilizable — cubre las 6 historias que pedían "generar reporte"
 * (06.1.3, 06.1.8, 06.1.9, 07.1.7, 07.2.8, 08.1.*) sin depender del backend: los datos ya
 * están en memoria en cada pantalla, así que basta con volcar el array ya filtrado que se
 * ve en pantalla.
 *
 * Separador `;` (no `,`): Excel en configuración regional colombiana usa la coma como
 * separador DECIMAL, así que interpreta un CSV separado por comas como una sola columna por
 * fila — `;` es el separador que Excel en español sí reconoce como delimitador de campos.
 */

export interface CsvColumn<T> {
  header: string;
  /** Valor de la celda para una fila — ya en el formato final que debe verse en Excel. */
  value: (row: T) => string | number;
}

const SEPARADOR = ";";
// Excel en español no reconoce el CSV como UTF-8 sin este marcador al inicio del archivo —
// sin él, cualquier tilde o "ñ" se ve como caracteres corruptos al abrirlo.
const BOM_UTF8 = "﻿";

// Un valor que empieza con alguno de estos caracteres, Excel/Sheets lo interpreta como
// fórmula al abrir el CSV — como estos campos vienen de texto libre escrito por cualquier
// rol (motivo, nombre, descripción...), sin neutralizarlo alguien podría ejecutar código
// en la máquina de quien exporte y abra el archivo (CSV/Formula Injection, OWASP).
const EMPIEZA_COMO_FORMULA = /^[=+\-@\t\r]/;

/** Escapa un valor para una celda CSV: le antepone un apóstrofo si Excel lo leería como
 *  fórmula, y lo envuelve en comillas si contiene el separador, comillas o un salto de
 *  línea (regla estándar CSV). */
function escaparCampoCsv(valor: string): string {
  const seguro = EMPIEZA_COMO_FORMULA.test(valor) ? `'${valor}` : valor;
  if (/[";\r\n]/.test(seguro)) {
    return `"${seguro.replace(/"/g, '""')}"`;
  }
  return seguro;
}

/** Arma el contenido del CSV (con BOM) a partir de columnas + filas — separado de
 *  `exportarCsv` para poder probarlo sin tocar el DOM. */
export function construirContenidoCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const encabezado = columns.map((c) => escaparCampoCsv(c.header)).join(SEPARADOR);
  const lineas = rows.map((row) =>
    columns.map((c) => escaparCampoCsv(String(c.value(row)))).join(SEPARADOR)
  );
  return BOM_UTF8 + [encabezado, ...lineas].join("\r\n");
}

/** Nombre de archivo con la fecha de hoy (YYYY-MM-DD), para que dos exportaciones del mismo
 *  reporte en días distintos no se sobrescriban entre sí. */
export function nombreArchivoConFecha(base: string): string {
  const fecha = new Date().toISOString().slice(0, 10);
  return `${base}_${fecha}.csv`;
}

/** Dispara la descarga de un CSV en el navegador. `rows` debe ser el array YA filtrado que
 *  se ve en pantalla — este helper no filtra nada, solo exporta lo que se le pasa, así que
 *  quien lo llama controla si respeta los filtros activos. */
export function exportarCsv<T>(nombreBase: string, columns: CsvColumn<T>[], rows: T[]): void {
  const contenido = construirContenidoCsv(columns, rows);
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivoConFecha(nombreBase);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
