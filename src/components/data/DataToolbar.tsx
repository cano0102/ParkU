import { Search, LayoutGrid, List, Plus, X } from "lucide-react";
import { theme } from "@/theme";

const COLORS = theme;

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 14px",
  borderRadius: 11,
  border: `1px solid ${COLORS.border}`,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  background: COLORS.bg,
  color: COLORS.text,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  width: "auto",
  appearance: "none",
  paddingRight: 28,
  cursor: "pointer",
};

export interface FilterConfig {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  options: { value: string; label: string }[];
}

export interface DataToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  searchAriaLabel: string;
  filters: FilterConfig[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  createLabel: string;
  onCreate: () => void;
  /** Barra opcional bajo la fila principal, con el conteo de resultados y un botón para limpiar filtros. */
  activeFiltersBar?: {
    activeFiltersCount: number;
    filteredCount: number;
    onClearFilters: () => void;
  };
}

/**
 * Barra de búsqueda + filtros + toggle grid/lista + botón crear, compartida
 * por las pantallas de gestión (antes duplicada entre ConductoresToolbar y
 * UsuariosToolbar, con pequeñas variaciones de estilo entre ambas que aquí
 * quedan unificadas).
 */
export function DataToolbar({
  search, onSearchChange, searchPlaceholder, searchAriaLabel,
  filters, viewMode, onViewModeChange, createLabel, onCreate, activeFiltersBar,
}: DataToolbarProps) {
  return (
    <>
      <style>{`
        .data-view-toggle-btn { transition: background .15s, color .15s, box-shadow .15s; }
        .data-view-toggle-btn.active { background: #fff; color: ${COLORS.primaryDark}; box-shadow: 0 1px 4px rgba(15,23,42,.1); }
        .data-view-toggle-btn:not(.active) { background: transparent; color: ${COLORS.textLight}; }
        .data-create-btn { transition: transform .15s ease, box-shadow .15s ease; }
        .data-create-btn:hover { transform: scale(1.02); box-shadow: 0 6px 20px rgba(57,169,0,.35); }
      `}</style>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative", minWidth: 180 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: COLORS.textLight,
            }}
          />
          <input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 36 }}
            aria-label={searchAriaLabel}
          />
        </div>

        {filters.map((filter) => (
          <select
            key={filter.ariaLabel}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            style={selectStyle}
            aria-label={filter.ariaLabel}
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}

        <div
          style={{
            display: "flex",
            gap: 2,
            padding: 3,
            borderRadius: 11,
            border: `1px solid ${COLORS.border}`,
            background: COLORS.bg,
          }}
          role="group"
          aria-label="Modo de visualización"
        >
          {(
            [
              { mode: "grid" as const, icon: <LayoutGrid size={14} />, label: "Cuadrícula" },
              { mode: "list" as const, icon: <List size={14} />, label: "Lista" },
            ]
          ).map((v) => (
            <button
              key={v.mode}
              type="button"
              onClick={() => onViewModeChange(v.mode)}
              title={v.label}
              aria-label={v.label}
              aria-pressed={viewMode === v.mode}
              className={`data-view-toggle-btn${viewMode === v.mode ? " active" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          ))}
        </div>

        <button
          className="data-create-btn"
          onClick={onCreate}
          style={{
            padding: "10px 18px",
            borderRadius: 11,
            border: "none",
            background: COLORS.primary,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 7,
            boxShadow: "0 4px 14px rgba(57,169,0,.25)",
          }}
        >
          <Plus size={15} /> {createLabel}
        </button>
      </div>

      {activeFiltersBar && activeFiltersBar.activeFiltersCount > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <p style={{ fontSize: 11, color: COLORS.textLight }}>
            Mostrando <strong>{activeFiltersBar.filteredCount}</strong> resultado
            {activeFiltersBar.filteredCount !== 1 ? "s" : ""}
          </p>
          <button
            onClick={activeFiltersBar.onClearFilters}
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.primary,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontFamily: "inherit",
            }}
          >
            <X size={12} /> Limpiar filtros
          </button>
        </div>
      )}
    </>
  );
}
