import { IconShield as Shield, IconPencil as Pencil, IconEye as Eye, IconTrash as Trash } from "@tabler/icons-react";
import type { Rol } from "@/services/api/roles";
import { DataList, type DataListColumn } from "@/components/data";
import { theme } from "@/styles/theme";
import { ROLES_PROTEGIDOS } from "../lib/helpers";
import { RolesGrid } from "./RolesGrid";

const COLORS = theme;

interface RolesResultsProps {
  roles: Rol[];
  viewMode: "grid" | "list";
  onView: (rol: Rol) => void;
  onEdit: (rol: Rol) => void;
  onToggleEstado: (rol: Rol) => void;
  onDelete: (rol: Rol) => void;
}

const contarPermisos = (rol: Rol) => Object.values(rol.permisos).filter(Boolean).length;

/** Columnas de la vista en lista: lo mismo que la tarjeta, en una línea. */
function columnas(
  onView: (rol: Rol) => void,
  onEdit: (rol: Rol) => void,
  onToggleEstado: (rol: Rol) => void,
  onDelete: (rol: Rol) => void,
): DataListColumn<Rol>[] {
  const boton = {
    width: 26, height: 26, borderRadius: 7, border: `1px solid ${COLORS.border}`,
    background: COLORS.bg, color: COLORS.textLight, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  } as const;

  return [
    {
      header: "Rol",
      width: "minmax(160px, 1.4fr)",
      render: (rol) => (
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: "rgba(57,169,0,.1)",
              display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary,
            }}
          >
            <Shield size={14} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12.5, fontWeight: 800, color: COLORS.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {rol.nombre}
            </p>
            <p style={{ fontSize: 10.5, color: COLORS.textLight, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {rol.descripcion || "Sin descripción"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Permisos",
      width: "minmax(110px, .7fr)",
      render: (rol) => (
        <span style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.text }}>
          {contarPermisos(rol)} de {Object.keys(rol.permisos).length}
        </span>
      ),
    },
    {
      header: "Estado",
      width: "minmax(90px, .5fr)",
      render: (rol) => (
        <button
          type="button"
          onClick={() => onToggleEstado(rol)}
          aria-label={rol.estado === "activo" ? `Deshabilitar rol ${rol.nombre}` : `Habilitar rol ${rol.nombre}`}
          style={{
            padding: "3px 10px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
            fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.3,
            background: rol.estado === "activo" ? "rgba(57,169,0,.12)" : "rgba(239,68,68,.1)",
            color: rol.estado === "activo" ? "#166534" : "#B91C1C",
          }}
        >
          {rol.estado}
        </button>
      ),
    },
    {
      header: "Acciones",
      width: "120px",
      align: "right",
      render: (rol) => (
        <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
          <button style={boton} onClick={() => onView(rol)} aria-label={`Ver detalle de ${rol.nombre}`} title="Ver detalle">
            <Eye size={12} />
          </button>
          <button style={boton} onClick={() => onEdit(rol)} aria-label={`Editar rol ${rol.nombre}`} title="Editar">
            <Pencil size={12} />
          </button>
          {!(ROLES_PROTEGIDOS as readonly string[]).includes(rol.nombre) && (
            <button
              style={{ ...boton, border: "1px solid #FECACA", background: "#FEF2F2", color: "#B91C1C" }}
              onClick={() => onDelete(rol)}
              aria-label={`Eliminar ${rol.nombre}`}
              title="Eliminar"
            >
              <Trash size={12} />
            </button>
          )}
        </div>
      ),
    },
  ];
}

/** Tarjetas o lista, según el conmutador de la barra — igual que Usuarios y Conductores. */
export function RolesResults({ roles, viewMode, onView, onEdit, onToggleEstado, onDelete }: RolesResultsProps) {
  if (viewMode === "grid" || roles.length === 0) {
    return (
      <RolesGrid
        roles={roles}
        onView={onView}
        onEdit={onEdit}
        onToggleEstado={onToggleEstado}
        onDelete={onDelete}
      />
    );
  }

  return (
    <DataList
      items={roles}
      getKey={(rol) => rol.id}
      columns={columnas(onView, onEdit, onToggleEstado, onDelete)}
    />
  );
}
