import type { ReactNode } from "react";
import { theme } from "@/theme";

const COLORS = theme;

export interface DataListColumn<T> {
  header: string;
  render: (item: T) => ReactNode;
  /** Fragmento de grid-template-columns para esta columna, p. ej. "2fr" o "120px". */
  width: string;
  align?: "left" | "right";
}

export interface DataListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  columns: DataListColumn<T>[];
}

/**
 * Tabla/lista genérica: cabecera + filas alineadas por `columns`, con el
 * mismo `grid-template-columns` para el header y cada fila. El contenido de
 * cada celda lo decide el dominio vía `column.render`.
 */
export function DataList<T>({ items, getKey, columns }: DataListProps<T>) {
  const gridTemplateColumns = columns.map((c) => c.width).join(" ");

  return (
    <div className="data-list">
      <style>{`
        .data-list { display: flex; flex-direction: column; border: 1px solid ${COLORS.border}; border-radius: 14px; overflow: hidden; background: #fff; }
        .data-list-header, .data-list-row { display: grid; grid-template-columns: ${gridTemplateColumns}; gap: 12px; align-items: center; padding: 10px 14px; }
        .data-list-header { background: ${COLORS.bg}; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; color: ${COLORS.textLight}; }
        .data-list-row { border-top: 1px solid ${COLORS.border}; font-size: 12px; }
        .data-list-row:hover { background: ${COLORS.bg}; }
        @media (max-width: 780px) {
          .data-list-header { display: none !important; }
          .data-list-row { grid-template-columns: 1fr !important; grid-auto-flow: row; gap: 6px !important; }
        }
      `}</style>

      <div className="data-list-header">
        {columns.map((col) => (
          <span key={col.header} style={{ textAlign: col.align === "right" ? "right" : "left" }}>
            {col.header}
          </span>
        ))}
      </div>

      {items.map((item) => (
        <div key={getKey(item)} className="data-list-row">
          {columns.map((col) => (
            <div key={col.header} style={{ minWidth: 0, textAlign: col.align === "right" ? "right" : "left" }}>
              {col.render(item)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
