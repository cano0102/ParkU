import { IconDownload as Download, IconSearch as Search, IconX as X } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import type { EstadoReserva } from "../lib/constants";

const C = theme;

interface ReservasToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterEstado: "todos" | EstadoReserva;
  onFilterEstadoChange: (value: "todos" | EstadoReserva) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
  onExport: () => void;
}

/** Buscador + filtro de estado + "limpiar filtros" + exportar CSV de la página de Reservas. */
export function ReservasToolbar({ search, onSearchChange, filterEstado, onFilterEstadoChange, activeFiltersCount, onClearFilters, onExport }: ReservasToolbarProps) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
        <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />
        <input
          aria-label="Buscar reserva"
          placeholder="Buscar por placa, conductor, celda o fecha..."
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
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textLight }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <select
        aria-label="Filtrar por estado"
        value={filterEstado}
        onChange={(e) => onFilterEstadoChange(e.target.value as "todos" | EstadoReserva)}
        style={{ padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, background: "#fff", fontFamily: "inherit", cursor: "pointer" }}
      >
        <option value="todos">Todos los estados</option>
        <option value="pendiente">Pendientes</option>
        <option value="activa">Activas</option>
        <option value="completada">Completadas</option>
        <option value="cancelada">Canceladas</option>
      </select>

      {activeFiltersCount > 0 && (
        <button
          onClick={onClearFilters}
          style={{ padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: C.textLight, fontSize: 12 }}
        >
          <X size={14} /> Limpiar
        </button>
      )}

      <button
        onClick={onExport}
        title="Exportar a CSV la lista con los filtros activos"
        style={{ padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: C.text, fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}
      >
        <Download size={14} /> Exportar CSV
      </button>
    </div>
  );
}
