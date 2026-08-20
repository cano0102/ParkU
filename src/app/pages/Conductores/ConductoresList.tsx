import { Pencil, Building2, Eye } from "lucide-react";
import type { Conductor, Usuario, Vehiculo } from "../../context/DataContext";
import { COLORS, getAvatarGradient, getInitials, getTipoStyle, sanitizeText } from "./helpers";

interface ConductoresListProps {
  conductores: Conductor[];
  getUsuario: (id: string) => Usuario | undefined;
  getVehiculosConductor: (id: string) => Vehiculo[];
  onToggleEstado: (id: string, estado: "activo" | "inactivo") => void;
  onViewVehiculo: (v: Vehiculo) => void;
  onViewDetail: (c: Conductor) => void;
  onEdit: (c: Conductor) => void;
}

export function ConductoresList({
  conductores, getUsuario, getVehiculosConductor,
  onToggleEstado, onViewVehiculo, onViewDetail, onEdit,
}: ConductoresListProps) {
  return (
    <div className="conductores-list">
      <div className="list-header">
        <span>Conductor</span>
        <span>Centro de formación</span>
        <span>Vehículo(s)</span>
        <span>Tipo</span>
        <span>Estado</span>
        <span style={{ textAlign: "right" }}>Acciones</span>
      </div>

      {conductores.map((conductor) => {
        const usuario = getUsuario(conductor.usuarioId);
        const vehiculosCond = getVehiculosConductor(conductor.id);
        if (!usuario) return null;

        const [g1, g2] = getAvatarGradient(conductor.nombre);
        const initials = getInitials(conductor.nombre);
        const tipoStyle = getTipoStyle(conductor.tipoConductor);
        const activo = conductor.estado === "activo";
        const TipoIcon = tipoStyle.icon;

        return (
          <div key={conductor.id} className="list-row">
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  flexShrink: 0,
                  background: `linear-gradient(135deg,${g1},${g2})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                  color: "#fff",
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 800,
                    color: COLORS.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {sanitizeText(conductor.nombre)}
                </p>
                <p style={{ fontSize: 10, color: COLORS.textLight, marginTop: 1 }}>
                  {usuario.tipoDocumento} · {usuario.identificacion}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: COLORS.textLight,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={conductor.centroFormacion}
            >
              <Building2 size={11} style={{ flexShrink: 0 }} />
              {sanitizeText(conductor.centroFormacion) || "—"}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {vehiculosCond.length === 0 ? (
                <span style={{ fontSize: 11, color: COLORS.textMuted, fontStyle: "italic" }}>
                  Sin vehículo
                </span>
              ) : (
                vehiculosCond.slice(0, 2).map((v) => (
                  <span
                    key={v.id}
                    className="list-plate-chip"
                    style={{ cursor: "pointer", width: "fit-content" }}
                    onClick={() => onViewVehiculo(v)}
                  >
                    {v.placa}
                  </span>
                ))
              )}
              {vehiculosCond.length > 2 && (
                <span style={{ fontSize: 10, color: COLORS.textLight }}>
                  +{vehiculosCond.length - 2} más
                </span>
              )}
            </div>

            <div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 9px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                  background: tipoStyle.bg,
                  color: tipoStyle.text,
                  border: `1px solid ${tipoStyle.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                <TipoIcon size={9} /> {tipoStyle.label}
              </span>
            </div>

            <div>
              <button
                onClick={() => onToggleEstado(conductor.id, conductor.estado)}
                title={activo ? "Desactivar" : "Activar"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 9px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                  background: activo ? "rgba(57,169,0,.1)" : "rgba(239,68,68,.08)",
                  color: activo ? "#166534" : "#B91C1C",
                  fontFamily: "inherit",
                }}
                aria-label={activo ? "Desactivar conductor" : "Activar conductor"}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: activo ? COLORS.primary : "#EF4444",
                  }}
                />
                {conductor.estado}
              </button>
            </div>

            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
              <button
                title="Ver detalles"
                onClick={() => onViewDetail(conductor)}
                className="action-btn"
                style={{
                  width: 26,
                  height: 26,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.bg,
                }}
                aria-label="Ver detalles"
              >
                <Eye size={12} />
              </button>
              <button
                title="Editar"
                onClick={() => onEdit(conductor)}
                className="action-btn"
                style={{
                  width: 26,
                  height: 26,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.bg,
                }}
                aria-label="Editar"
              >
                <Pencil size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
