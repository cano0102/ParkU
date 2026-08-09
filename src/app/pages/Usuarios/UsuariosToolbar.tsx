import { Search, LayoutGrid, List, Plus } from "lucide-react";
import { COLORS, inputStyle } from "./helpers";

interface UsuariosToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterEstado: "todos" | "activo" | "inactivo";
  onFilterEstadoChange: (value: "todos" | "activo" | "inactivo") => void;
  filterRol: string;
  onFilterRolChange: (value: string) => void;
  uniqueRoles: string[];
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onCreate: () => void;
}

export function UsuariosToolbar({
  search, onSearchChange,
  filterEstado, onFilterEstadoChange,
  filterRol, onFilterRolChange, uniqueRoles,
  viewMode, onViewModeChange,
  onCreate,
}: UsuariosToolbarProps) {
  return (
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
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36 }}
          aria-label="Buscar usuarios"
        />
      </div>

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

      <select
        value={filterRol}
        onChange={(e) => onFilterRolChange(e.target.value)}
        style={{
          ...inputStyle,
          width: "auto",
          appearance: "none",
          paddingRight: 28,
          cursor: "pointer",
        }}
        aria-label="Filtrar por rol"
      >
        <option value="todos">Todos los roles</option>
        {uniqueRoles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

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
              background: viewMode === v.mode ? "#fff" : "transparent",
              color: viewMode === v.mode ? COLORS.primaryDark : COLORS.textLight,
              boxShadow: viewMode === v.mode ? "0 1px 4px rgba(15,23,42,.1)" : "none",
            }}
          >
            {v.icon}
            <span className="u-view-label">{v.label}</span>
          </button>
        ))}
      </div>

      <button
        className="u-btn"
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
        <Plus size={15} /> Nuevo Usuario
      </button>
    </div>
  );
}
