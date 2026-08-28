import { Fragment, type ReactNode } from "react";

export interface DataGridProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  /** Grid CSS de contenedor; por defecto tarjetas responsivas de min 320px. */
  gridTemplateColumns?: string;
  gap?: number;
}

/**
 * Contenedor de cuadrícula genérico: solo resuelve el layout y el `key` de
 * cada item El contenido de la tarjeta es responsabilidad de cada dominio
 * vía `ren.derCard` (render-prop), tal como pedía el diseño original — el
 * grid en sí no necesita saber nada de avatares, badges o acciones.
 *
 * Colapsa a una sola columna en pantallas angostas (antes esto solo lo tenía
 * el grid de Conductores, vía una media query en su styles.ts local).
 */
export function DataGrid<T>({
  items, getKey, renderCard,
  gridTemplateColumns = "repeat(auto-fill,minmax(320px,1fr))",
  gap = 12,
}: DataGridProps<T>) {
  return (
    <div className="data-grid" style={{ display: "grid", gridTemplateColumns, gap }}>
      <style>{`
        @media (max-width: 640px) {
          .data-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {items.map((item) => (
        <Fragment key={getKey(item)}>{renderCard(item)}</Fragment>
      ))}
    </div>
  );
}
