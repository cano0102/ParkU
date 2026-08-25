import { memo } from "react";
import { Pencil, X, GaugeCircle, Palette, Calendar } from "lucide-react";
import type { Vehiculo } from "@/services/api/vehiculos";
import { COLORS, getTipoVehiculoStyle, sanitizeText } from "../lib/helpers";

interface VehiculoViewProps {
  vehiculo: Vehiculo;
  onEdit: () => void;
  onClose: () => void;
}

export const VehiculoView = memo(({ vehiculo, onEdit, onClose }: VehiculoViewProps) => {
  const tipoStyle = getTipoVehiculoStyle(vehiculo.tipo);
  const TipoIcon = tipoStyle.icon;

  return (
    <div>
      <div
        style={{
          padding: "1.6rem 1.8rem 1.4rem",
          background: `linear-gradient(135deg, ${tipoStyle.dot}, ${tipoStyle.dot}cc)`,
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
              }}
            >
              <TipoIcon size={24} />
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
          <h2 style={{ marginTop: 14, fontSize: 24, fontWeight: 900, lineHeight: 1, letterSpacing: 0.5 }}>
            {sanitizeText(vehiculo.placa)}
          </h2>
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(255,255,255,.18)",
                border: "1px solid rgba(255,255,255,.25)",
              }}
            >
              {tipoStyle.label}
            </span>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 800,
                background: "rgba(255,255,255,.18)",
                border: "1px solid rgba(255,255,255,.25)",
              }}
            >
              {vehiculo.estado}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: "1.4rem 1.8rem" }}>
        {[
          { label: "Marca", value: vehiculo.marca, icon: GaugeCircle },
          { label: "Línea", value: vehiculo.linea, icon: GaugeCircle },
          { label: "Color", value: vehiculo.color, icon: Palette },
          { label: "Año", value: vehiculo.modelo, icon: Calendar },
        ].filter((item) => item.value).map((item) => (
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
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: COLORS.textLight,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                {sanitizeText(String(item.value))}
              </div>
            </div>
          </div>
        ))}

        {vehiculo.descripcion && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              background: "#F8FAFC",
              border: `1px solid ${COLORS.border}`,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: COLORS.textLight,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              Descripción
            </div>
            <div style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.4 }}>
              {sanitizeText(vehiculo.descripcion)}
            </div>
          </div>
        )}

        <button
          onClick={onEdit}
          style={{
            marginTop: 12,
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

VehiculoView.displayName = "VehiculoView";
