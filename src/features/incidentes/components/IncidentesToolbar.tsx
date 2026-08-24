import { Plus, Search, X } from "lucide-react";
import { theme } from "@/styles/theme";
import type { EstadoIncidente } from "../lib/constants";

const C = theme;

interface IncidentesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterEstado: "todos" | EstadoIncidente;
  onFilterEstadoChange: (value: "todos" | EstadoIncidente) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  onCreate: () => void;
}

/** Buscador + filtro de estado + botón "Registrar Incidente". */
export function IncidentesToolbar({
  search, onSearchChange, filterEstado, onFilterEstadoChange,
  activeFiltersCount, onClearFilters, onCreate,
}: IncidentesToolbarProps) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />
        <input
          aria-label="Buscar incidente"
          placeholder="Buscar por descripción, parqueadero, celda o placa..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px 10px 36px", borderRadius: 11,
            border: `1px solid ${C.border}`, fontSize: 13, background: "#fff",
            fontFamily: "inherit",
          }}
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            aria-label="Limpiar búsqueda"
            style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: C.textLight,
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <select
        aria-label="Filtrar por estado"
        value={filterEstado}
        onChange={(e) => onFilterEstadoChange(e.target.value as "todos" | EstadoIncidente)}
        style={{
          padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`,
          fontSize: 13, background: "#fff", fontFamily: "inherit", cursor: "pointer",
        }}
      >
        <option value="todos">Todos los estados</option>
        <option value="pendiente">Pendientes</option>
        <option value="resuelto">Resueltos</option>
      </select>

      {activeFiltersCount > 0 && (
        <button
          onClick={onClearFilters}
          style={{
            padding: "10px 14px", borderRadius: 11,
            border: `1px solid ${C.border}`,
            background: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            color: C.textLight, fontSize: 12,
          }}
        >
          <X size={14} /> Limpiar filtros
        </button>
      )}

      <button
        onClick={onCreate}
        style={{
          padding: "10px 18px", borderRadius: 11, border: "none",
          background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800,
          cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 7,
          boxShadow: "0 4px 14px rgba(57,169,0,.25)",
        }}
      >
        <Plus size={15} /> Registrar Incidente
      </button>
    </div>
  );
}
