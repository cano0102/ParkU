import { memo, useCallback, useMemo } from "react";
import { CheckCircle2, Eye, Lock, Pencil, Shield, Trash2, XCircle } from "lucide-react";
import type { Rol } from "@/services/api/roles";
import { theme } from "@/styles/theme";
import {
  countActive, GRUPO_COLORS, GRUPO_ICON_COMPONENTS, GRUPO_LABELS, PERMISOS,
  type PermisosKeys, type PermisosState,
} from "../lib/permisos";
import { ROLES_PROTEGIDOS, getRolAccent } from "../lib/helpers";

const COLORS = theme;

const BAR_HEIGHTS = [7, 11, 15, 19, 23];

interface RoleCardProps {
  rol: Rol;
  onView: (rol: Rol) => void;
  onEdit: (rol: Rol) => void;
  onToggleEstado: (rol: Rol) => void;
  onDelete: (rol: Rol) => void;
}

/** Tarjeta de un rol en el grid: resumen visual de nivel de acceso y acciones rápidas. */
export const RoleCard = memo(({ rol, onView, onEdit, onToggleEstado, onDelete }: RoleCardProps) => {
  const activeCount = useMemo(() => countActive(rol.permisos), [rol.permisos]);
  const total = useMemo(() => Object.keys(rol.permisos).length, [rol.permisos]);
  const pct = Math.round((activeCount / total) * 100);

  const protegido = (ROLES_PROTEGIDOS as readonly string[]).includes(rol.nombre);
  const accent = getRolAccent(rol.nombre);
  const activo = rol.estado === "activo";

  const gruposDesglose = useMemo(
    () =>
      (Object.entries(PERMISOS) as [PermisosKeys, typeof PERMISOS[PermisosKeys]][]).map(
        ([grupo, permisos]) => {
          const keys = Object.keys(permisos) as Array<keyof PermisosState>;
          const on = keys.filter((k) => rol.permisos[k]).length;
          return { grupo, on, total: keys.length };
        }
      ),
    [rol.permisos]
  );

  const filledBars = pct === 0 ? 0 : Math.max(1, Math.ceil(pct / 20));

  const handleView = useCallback(() => onView(rol), [onView, rol]);
  const handleEdit = useCallback(() => onEdit(rol), [onEdit, rol]);
  const handleDelete = useCallback(() => onDelete(rol), [onDelete, rol]);
  const handleToggleEstado = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleEstado(rol);
    },
    [onToggleEstado, rol]
  );

  return (
    <article className="role-card" style={{ ["--accent" as any]: accent }}>
      <div className="role-card-top" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
        <div className="role-card-top-row">
          <div className="role-icon" style={{ background: `${accent}15` }}>
            <Shield size={20} color={accent} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span
              className="role-status-pill"
              style={{
                background: activo ? "rgba(57,169,0,.12)" : "rgba(148,163,184,.16)",
                color: activo ? COLORS.primaryDark : COLORS.textLight,
              }}
            >
              {activo ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
              {rol.estado}
            </span>
            {!protegido && (
              <button
                type="button"
                role="switch"
                aria-checked={activo}
                aria-label={activo ? `Deshabilitar rol ${rol.nombre}` : `Habilitar rol ${rol.nombre}`}
                title={activo ? "Deshabilitar rol" : "Habilitar rol"}
                onClick={handleToggleEstado}
                className="role-switch"
                style={{
                  background: activo ? COLORS.primary : "#CBD5E1",
                }}
              >
                <span
                  className="role-switch-knob"
                  style={{ transform: activo ? "translateX(14px)" : "translateX(0)" }}
                />
              </button>
            )}
          </div>
        </div>

        <div className="role-name-row">
          <h3 className="role-name">{rol.nombre}</h3>
          {protegido && (
            <span className="role-lock" title="Rol protegido del sistema">
              <Lock size={11} />
            </span>
          )}
        </div>

        <p className="role-desc">{rol.descripcion || "Sin descripción"}</p>
      </div>

      <div className="role-card-body">
        <div className="clearance-row">
          <span className="clearance-label">Nivel de acceso</span>
          <span className="clearance-pct" style={{ color: accent }}>
            {pct}%
          </span>
        </div>
        <div className="clearance-bars">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="clearance-bar"
              style={{
                height: h,
                background: i < filledBars ? accent : "#E2E8F0",
              }}
            />
          ))}
        </div>

        <div className="group-grid">
          {gruposDesglose.map(({ grupo, on, total: totalGrupo }) => {
            const color = GRUPO_COLORS[grupo];
            const Icon = GRUPO_ICON_COMPONENTS[grupo];
            const activeGroup = on > 0;
            return (
              <div
                key={grupo}
                className="group-chip"
                style={{
                  background: activeGroup ? `${color}12` : "#F8FAFC",
                  color: activeGroup ? color : COLORS.textLight,
                  border: `1px solid ${activeGroup ? `${color}30` : COLORS.border}`,
                }}
                title={GRUPO_LABELS[grupo]}
              >
                <Icon size={13} />
                <span>{on}/{totalGrupo}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="role-card-footer">
        <button className="role-action-btn" onClick={handleView} aria-label={`Ver detalle de ${rol.nombre}`} title="Ver detalle">
          <Eye size={15} />
        </button>
        <span className="role-action-divider" />
        <button className="role-action-btn" onClick={handleEdit} aria-label={`Editar ${rol.nombre}`} title="Editar">
          <Pencil size={15} />
        </button>
        {!protegido && (
          <>
            <span className="role-action-divider" />
            <button className="role-action-btn" onClick={handleDelete} aria-label={`Eliminar ${rol.nombre}`} title="Eliminar" style={{ color: COLORS.danger }}>
              <Trash2 size={15} />
            </button>
          </>
        )}
      </div>
    </article>
  );
});

RoleCard.displayName = "RoleCard";
