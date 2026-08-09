import { LayoutGrid, List, Plus, X } from "lucide-react";
import { COLORS, inputStyle } from "./helpers";

interface ConductoresToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterTipo: string;
  onFilterTipoChange: (value: string) => void;
  filterVehiculoTipo: string;
  onFilterVehiculoTipoChange: (value: string) => void;
  filterEstado: "todos" | "activo" | "inactivo";
  onFilterEstadoChange: (value: "todos" | "activo" | "inactivo") => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onCreate: () => void;
  activeFiltersCount: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export function ConductoresToolbar({
  search, onSearchChange,
  filterTipo, onFilterTipoChange,
  filterVehiculoTipo, onFilterVehiculoTipoChange,
  filterEstado, onFilterEstadoChange,
  viewMode, onViewModeChange,
  onCreate,
  activeFiltersCount, filteredCount, onClearFilters,
}: ConductoresToolbarProps) {
  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative", minWidth: 180 }}>
          <input
            placeholder="Buscar conductor, vehículo, identificación..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={inputStyle}
            aria-label="Buscar conductores"
          />
        </div>

        <select
          value={filterTipo}
          onChange={(e) => onFilterTipoChange(e.target.value)}
          style={{
            ...inputStyle,
            width: "auto",
            appearance: "none",
            paddingRight: 28,
            cursor: "pointer",
          }}
          aria-label="Filtrar por tipo"
        >
          <option value="todos">Todos los tipos</option>
          <option value="aprendiz">Aprendiz</option>
          <option value="instructor">Instructor</option>
        </select>

        <select
          value={filterVehiculoTipo}
          onChange={(e) => onFilterVehiculoTipoChange(e.target.value)}
          style={{
            ...inputStyle,
            width: "auto",
            appearance: "none",
            paddingRight: 28,
            cursor: "pointer",
          }}
          aria-label="Filtrar por tipo de vehículo"
        >
          <option value="todos">Todos los vehículos</option>
          <option value="carro">Con Carro</option>
          <option value="moto">Con Moto</option>
        </select>

        <select
          value={filterEstado}
          onChange={(e) => onFilterEstadoChange(e.target.value as "todos" | "activo" | "inactivo")}
          style={{
            ...inputStyle,
            width: "auto",
            appearance: "none",
            paddingRight: 28,
            cursor: "pointer",
          }}
          aria-label="Filtrar por estado"
        >
          <option value="todos">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>

        <div className="view-toggle" role="group" aria-label="Modo de visualización">
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
              className={`view-toggle-btn${viewMode === v.mode ? " active" : ""}`}
            >
              {v.icon}
              <span className="view-toggle-label">{v.label}</span>
            </button>
          ))}
        </div>

        <button
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
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(57,169,0,.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(57,169,0,.25)";
          }}
        >
          <Plus size={15} /> Nuevo Conductor
        </button>
      </div>

      {activeFiltersCount > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 11, color: COLORS.textLight }}>
            Mostrando <strong>{filteredCount}</strong> resultado
            {filteredCount !== 1 ? "s" : ""}
          </p>
          <button
            onClick={onClearFilters}
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
            }}
          >
            <X size={12} /> Limpiar filtros
          </button>
        </div>
      )}
    </>
  );
}
