import { memo } from "react";
import { Pencil, Plus, X, Mail, Phone, IdCard, Building2, Accessibility, Car } from "lucide-react";
import type { Conductor } from "@/services/api/conductores";
import type { Usuario } from "@/services/api/usuarios";
import type { Vehiculo } from "@/services/api/vehiculos";
import { COLORS, getAvatarGradient, getInitials, getTipoUsuarioStyle, getTipoVehiculoStyle, sanitizeText } from "../lib/helpers";

interface ConductorDetailModalProps {
  conductor: Conductor;
  usuario: Usuario | undefined;
  vehiculos: Vehiculo[];
  onEdit: () => void;
  onViewVehiculo: (v: Vehiculo) => void;
  onAgregarVehiculo: () => void;
  onClose: () => void;
}

export const ConductorDetailModal = memo(({ conductor, usuario, vehiculos, onEdit, onViewVehiculo, onAgregarVehiculo, onClose }: ConductorDetailModalProps) => {
  const [g1, g2] = getAvatarGradient(conductor.nombre);
  const tipoStyle = getTipoUsuarioStyle(conductor.tipoUsuarioNombre);
  const TipoIcon = tipoStyle.icon;
  const activo = conductor.estado === "activo";

  const filas = [
    { label: "Correo", value: conductor.correo || usuario?.correo, icon: Mail },
    { label: "Teléfono", value: conductor.numeroTelefonico, icon: Phone },
    { label: "Documento", value: `${conductor.tipoDocumento} · ${conductor.numeroDocumento}`, icon: IdCard },
    { label: "Centro de formación", value: conductor.centroFormacion, icon: Building2 },
  ].filter((f) => f.value);

  return (
    <div>
      <div
        style={{
          padding: "1.6rem 1.8rem 1.4rem",
          background: `linear-gradient(135deg, ${g1}, ${g2})`,
          color: "#fff",
          borderRadius: "24px 24px 0 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,.07)",
            top: -80,
            right: -60,
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "rgba(255,255,255,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              {getInitials(conductor.nombre)}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "rgba(255,255,255,.15)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Cerrar vista"
            >
              <X size={15} />
            </button>
          </div>
          <h2 style={{ marginTop: 14, fontSize: 20, fontWeight: 900, lineHeight: 1.2 }}>
            {sanitizeText(conductor.nombre)}
          </h2>
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800, background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)" }}>
              <TipoIcon size={11} />
              {tipoStyle.label}
            </span>
            <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800, background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)" }}>
              {activo ? "Activo" : "Inactivo"}
            </span>
            {conductor.movilidadReducida && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800, background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)" }}>
                <Accessibility size={11} />
                {conductor.tipoDiscapacidad ? sanitizeText(conductor.tipoDiscapacidad) : "Movilidad reducida"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "1.4rem 1.8rem" }}>
        {filas.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: "#F8FAFC",
              border: `1px solid ${COLORS.border}`,
              marginBottom: 8,
            }}
          >
            <item.icon size={14} color={COLORS.textLight} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, wordBreak: "break-word" }}>
                {sanitizeText(String(item.value))}
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: COLORS.textLight, textTransform: "uppercase", letterSpacing: 1 }}>
              Vehículo{vehiculos.length !== 1 ? "s" : ""} ({vehiculos.length})
            </div>
            <button
              onClick={onAgregarVehiculo}
              style={{
                display: "flex", alignItems: "center", gap: 4, border: "none", background: "rgba(57,169,0,.1)",
                color: COLORS.primary, fontSize: 10.5, fontWeight: 800, padding: "4px 9px", borderRadius: 999,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Plus size={11} />
              Agregar vehículo
            </button>
          </div>
          {vehiculos.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 12, background: "#F8FAFC", border: `1px dashed ${COLORS.border}`, color: COLORS.textMuted, fontSize: 12 }}>
              <Car size={14} />
              Sin vehículo asignado — este conductor puede tener varios (carro y moto, por ejemplo).
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {vehiculos.map((v) => {
                const vStyle = getTipoVehiculoStyle(v.tipo);
                const VIcon = vStyle.icon;
                return (
                  <button
                    key={v.id}
                    onClick={() => onViewVehiculo(v)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 12px",
                      borderRadius: 12,
                      background: vStyle.bg,
                      border: `1px solid ${vStyle.border}`,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                    }}
                  >
                    <VIcon size={15} color={vStyle.dot} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 800, color: vStyle.text, letterSpacing: 0.5 }}>{v.placa}</span>
                    <span style={{ fontSize: 11, color: COLORS.textLight, marginLeft: "auto" }}>
                      {v.marca} {v.modelo}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={onEdit}
          style={{
            marginTop: 14,
            width: "100%",
            padding: "12px 20px",
            borderRadius: 12,
            border: "none",
            background: tipoStyle.dot,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: `0 6px 18px ${tipoStyle.dot}33`,
          }}
        >
          <Pencil size={14} />
          Editar Conductor
        </button>
      </div>
    </div>
  );
});

ConductorDetailModal.displayName = "ConductorDetailModal";
