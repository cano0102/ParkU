import { Plus, Search } from "lucide-react";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface RolesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterEstado: "todos" | "activo" | "inactivo";
  onFilterEstadoChange: (value: "todos" | "activo" | "inactivo") => void;
  onCreate: () => void;
}

/** Buscador + filtro de estado + botón "Nuevo Rol" de la página de Roles. */
export function RolesToolbar({ search, onSearchChange, filterEstado, onFilterEstadoChange, onCreate }: RolesToolbarProps) {
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
          placeholder="Buscar rol..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px 10px 36px",
            borderRadius: 11,
            border: `1px solid ${COLORS.border}`,
            fontSize: 13,
            background: "#fff",
            fontFamily: "inherit",
          }}
          aria-label="Buscar roles"
        />
      </div>
      <select
        value={filterEstado}
        onChange={(e) => onFilterEstadoChange(e.target.value as "todos" | "activo" | "inactivo")}
        style={{
          padding: "10px 14px",
          borderRadius: 11,
          border: `1px solid ${COLORS.border}`,
          fontSize: 13,
          background: "#fff",
          fontFamily: "inherit",
          cursor: "pointer",
        }}
        aria-label="Filtrar por estado"
      >
        <option value="todos">Todos</option>
        <option value="activo">Activos</option>
        <option value="inactivo">Inactivos</option>
      </select>
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
        }}
      >
        <Plus size={15} /> Nuevo Rol
      </button>
    </div>
  );
}
