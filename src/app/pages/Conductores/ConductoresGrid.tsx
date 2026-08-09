import { Pencil, Trash2, Car, Building2, Accessibility } from "lucide-react";
import type { Conductor, Usuario, Vehiculo } from "../../context/DataContext";
import { COLORS, getAvatarGradient, getInitials, getTipoStyle, getTipoVehiculoStyle, sanitizeText } from "./helpers";

interface ConductoresGridProps {
  conductores: Conductor[];
  getUsuario: (id: string) => Usuario | undefined;
  getVehiculosConductor: (id: string) => Vehiculo[];
  onToggleEstado: (id: string, estado: "activo" | "inactivo") => void;
  onViewVehiculo: (v: Vehiculo) => void;
  onEdit: (c: Conductor) => void;
  onDelete: (c: Conductor) => void;
}

export function ConductoresGrid({
  conductores, getUsuario, getVehiculosConductor,
  onToggleEstado, onViewVehiculo, onEdit, onDelete,
}: ConductoresGridProps) {
  return (
    <div className="conductores-grid">
      {conductores.map((conductor) => {
        const usuario = getUsuario(conductor.usuarioId);
        const vehiculosCond = getVehiculosConductor(conductor.id);
        if (!usuario) return null;

        const [g1, g2] = getAvatarGradient(conductor.nombre);
        const initials = getInitials(conductor.nombre);
        const tipoStyle = getTipoStyle(conductor.tipoConductor);
        const activo = conductor.estado === "activo";
        const TipoIcon = tipoStyle.icon;
        const vehiculoPrincipal = vehiculosCond[0];
        const vTipoStyle = vehiculoPrincipal ? getTipoVehiculoStyle(vehiculoPrincipal.tipo) : null;

        return (
          <div
            key={conductor.id}
            className={`conductor-card${activo ? "" : " is-inactive"}`}
          >
            <div className="status-rail" style={{ background: activo ? COLORS.primary : "#CBD5E1" }} />

            <div className="card-top">
              <div
                className="card-avatar"
                style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
              >
                {initials}
              </div>

              <div className="card-identity">
                <p className="card-name">{sanitizeText(conductor.nombre)}</p>
                <p className="card-doc">
                  {usuario.tipoDocumento} · {usuario.identificacion}
                </p>
              </div>

              <button
                className="card-switch"
                onClick={() => onToggleEstado(conductor.id, conductor.estado)}
                style={{ background: activo ? COLORS.primary : "#CBD5E1" }}
                aria-label={activo ? "Desactivar conductor" : "Activar conductor"}
              >
                <div className="knob" style={{ left: activo ? 17 : 2 }} />
              </button>
            </div>

            <div className="card-tags">
              <span
                className="card-tag"
                style={{ background: tipoStyle.bg, color: tipoStyle.text }}
              >
                <TipoIcon size={10} />
                {tipoStyle.label}
              </span>
              <span className={`status-badge ${activo ? "active" : "inactive"}`}>
                {conductor.estado}
              </span>
              {conductor.discapacidad && (
                <span
                  className="card-tag"
                  style={{ background: "#F3E8FF", color: "#9333EA" }}
                >
                  <Accessibility size={10} />
                  Discapacidad
                </span>
              )}
            </div>

            {vehiculosCond.length === 0 ? (
              <div className="plate-block">
                <Car size={15} color={COLORS.textMuted} style={{ flexShrink: 0 }} />
                <span className="plate-empty">Sin vehículo asignado</span>
              </div>
            ) : vehiculosCond.length === 1 && vehiculoPrincipal && vTipoStyle ? (
              <div
                className="plate-block has-plate"
                onClick={() => onViewVehiculo(vehiculoPrincipal)}
                style={{ cursor: "pointer" }}
              >
                <span className="plate-chip">{vehiculoPrincipal.placa}</span>
                <span className="plate-meta">
                  {vehiculoPrincipal.marca} {vehiculoPrincipal.modelo}
                </span>
                <vTipoStyle.icon size={15} color={vTipoStyle.dot} style={{ flexShrink: 0 }} />
              </div>
            ) : (
              <div className="plate-list">
                {vehiculosCond.map((v) => {
                  const vStyle = getTipoVehiculoStyle(v.tipo);
                  const VIcon = vStyle.icon;
                  return (
                    <div
                      key={v.id}
                      className="plate-row"
                      onClick={() => onViewVehiculo(v)}
                    >
                      <span className="plate-chip">{v.placa}</span>
                      <span className="plate-meta">
                        {v.marca} {v.modelo}
                      </span>
                      <VIcon size={13} color={vStyle.dot} style={{ flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="card-center">
              <Building2 size={12} color={COLORS.textLight} />
              <span>{sanitizeText(conductor.centroFormacion) || "—"}</span>
            </div>

            <div className="card-footer">
              <span style={{ fontSize: 10, color: COLORS.textLight, fontWeight: 700 }}>
                {vehiculosCond.length} vehículo{vehiculosCond.length !== 1 ? "s" : ""}
              </span>
              <div style={{ display: "flex", gap: 2 }}>
                <button
                  className="action-btn"
                  title="Editar"
                  onClick={() => onEdit(conductor)}
                  aria-label={`Editar ${sanitizeText(conductor.nombre)}`}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="action-btn danger"
                  title="Eliminar"
                  onClick={() => onDelete(conductor)}
                  aria-label={`Eliminar ${sanitizeText(conductor.nombre)}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
