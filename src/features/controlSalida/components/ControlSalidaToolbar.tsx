import { Search, X } from "lucide-react";
import { theme } from "@/styles/theme";
import type { Parqueadero } from "@/services/api/parqueaderos";

const COLORS = theme;

interface ControlSalidaToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterEstado: "todos" | "en_parqueadero" | "finalizado";
  onFilterEstadoChange: (value: "todos" | "en_parqueadero" | "finalizado") => void;
  filterParqueadero: string;
  onFilterParqueaderoChange: (value: string) => void;
  parqueaderos: Parqueadero[];
  filteredCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

/** Buscador + filtros de estado/parqueadero, y el resumen de resultados con "limpiar filtros". */
export function ControlSalidaToolbar({
  search, onSearchChange, filterEstado, onFilterEstadoChange, filterParqueadero, onFilterParqueaderoChange,
  parqueaderos, filteredCount, hasActiveFilters, onClearFilters,
}: ControlSalidaToolbarProps) {
  return (
    <>
      <div className="toolbar">
        <div className="toolbar-search">
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.textLight }} />
          <input
            placeholder="Buscar por placa, celda, conductor..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 11, border: `1px solid ${COLORS.border}`, fontSize: 13, background: "#fff", fontFamily: "inherit" }}
            aria-label="Buscar registros"
          />
        </div>

        <select
          value={filterEstado}
          onChange={(e) => onFilterEstadoChange(e.target.value as "todos" | "en_parqueadero" | "finalizado")}
          style={{ padding: "10px 14px", borderRadius: 11, border: `1px solid ${COLORS.border}`, fontSize: 13, background: "#fff", fontFamily: "inherit", cursor: "pointer" }}
          aria-label="Filtrar por estado"
        >
          <option value="todos">Todos los estados</option>
          <option value="en_parqueadero">En parqueadero</option>
          <option value="finalizado">Finalizados</option>
        </select>

        {parqueaderos.length > 1 && (
          <select
            value={filterParqueadero}
            onChange={(e) => onFilterParqueaderoChange(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: 11, border: `1px solid ${COLORS.border}`, fontSize: 13, background: "#fff", fontFamily: "inherit", cursor: "pointer" }}
            aria-label="Filtrar por parqueadero"
          >
            <option value="todos">Todos los parqueaderos</option>
            {parqueaderos.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        )}
      </div>

      {hasActiveFilters && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, padding: "0 4px" }}>
          <p style={{ fontSize: 11, color: COLORS.textLight }}>
            Mostrando <strong>{filteredCount}</strong> registro{filteredCount !== 1 ? "s" : ""}
          </p>
          <button
            onClick={onClearFilters}
            style={{ fontSize: 11, fontWeight: 600, color: COLORS.primary, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            <X size={12} /> Limpiar filtros
          </button>
        </div>
      )}
    </>
  );
}
