import { Shield } from "lucide-react";
import type { Rol } from "@/services/api/roles";
import { theme } from "@/styles/theme";
import { RoleCard } from "./RoleCard";

const COLORS = theme;

interface RolesGridProps {
  roles: Rol[];
  onView: (rol: Rol) => void;
  onEdit: (rol: Rol) => void;
  onToggleEstado: (rol: Rol) => void;
}

/** Grid de tarjetas de rol, o el estado vacío cuando el filtro no arroja resultados. */
export function RolesGrid({ roles, onView, onEdit, onToggleEstado }: RolesGridProps) {
  if (roles.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 1rem",
          borderRadius: 16,
          border: `2px dashed ${COLORS.border}`,
          background: "#fff",
          color: COLORS.textLight,
        }}
      >
        <Shield size={36} color={COLORS.border} style={{ marginBottom: 10 }} />
        <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron roles</p>
        <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o crea uno nuevo</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
        gap: 14,
      }}
    >
      {roles.map((rol) => (
        <RoleCard
          key={rol.id}
          rol={rol}
          onView={onView}
          onEdit={onEdit}
          onToggleEstado={onToggleEstado}
        />
      ))}
    </div>
  );
}
