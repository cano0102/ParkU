import { useNavigate } from "react-router-dom";
import { AlertTriangle, Car, CheckCircle, Clock, Edit, MapPin, ParkingCircle, User, X } from "lucide-react";
import type { Incidente } from "@/services/api/incidentes";
import type { Celda } from "@/services/api/celdas";
import { theme } from "@/styles/theme";
import { CELDA_ESTADO_CONFIG, ESTADO_CONFIG } from "../lib/constants";

const C = theme;

interface IncidenteViewModalProps {
  incidente: Incidente;
  celda: Celda | undefined;
  vehiculoPlaca?: string;
  asignadoNombre?: string;
  nombreParqueadero: string;
  onClose: () => void;
  onEdit: () => void;
}

/** Vista de solo lectura del detalle de un incidente. */
export function IncidenteViewModal({ incidente, celda, vehiculoPlaca, asignadoNombre, nombreParqueadero, onClose, onEdit }: IncidenteViewModalProps) {
  const navigate = useNavigate();
  const cfg = ESTADO_CONFIG[incidente.estado];
  const fecha = new Date(incidente.fecha);

  const items = [
    {
      label: "Parqueadero", value: nombreParqueadero, icon: MapPin,
      onClick: () => navigate(`/app/parqueaderos?q=${encodeURIComponent(celda?.numero || nombreParqueadero)}`),
    },
    ...(celda
      ? [{
          label: "Celda", value: `${celda.numero} · ${CELDA_ESTADO_CONFIG[celda.estado].label} actualmente`, icon: ParkingCircle,
          onClick: () => navigate(`/app/parqueaderos?q=${encodeURIComponent(celda.numero)}`),
        }]
      : []),
    { label: "Fecha y hora", value: fecha.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }), icon: Clock, onClick: undefined },
    ...(vehiculoPlaca ? [{ label: "Vehículo", value: vehiculoPlaca, icon: Car, onClick: undefined }] : []),
    ...(asignadoNombre ? [{ label: "Asignado a", value: asignadoNombre, icon: User, onClick: undefined }] : []),
  ];

  return (
    <div>
      <div
        style={{
          padding: "1.6rem 1.8rem 1.4rem",
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
          color: "#fff",
          borderRadius: "24px 24px 0 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,.07)", top: -80, right: -60,
        }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: 14,
                background: "rgba(255,255,255,.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {incidente.estado === "resuelto" ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: "rgba(255,255,255,.15)", border: "none",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={15} />
            </button>
          </div>
          <h2 style={{ marginTop: 12, fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>
            {incidente.descripcion}
          </h2>
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
              background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
              {cfg.label}
            </span>
            {celda && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
              }}>
                <ParkingCircle size={11} /> Celda {celda.numero}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "1.4rem 1.8rem" }}>
        {items.map((item) => (
          <div
            key={item.label}
            onClick={item.onClick}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12,
              background: "#F8FAFC", border: `1px solid ${C.border}`,
              marginBottom: 8,
              cursor: item.onClick ? "pointer" : "default",
            }}
          >
            <item.icon size={14} color={C.textLight} />
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: item.onClick ? C.primary : C.text }}>
                {item.value}
              </div>
            </div>
          </div>
        ))}

        {incidente.justificacionCierre && (
          <div style={{
            padding: "10px 12px", borderRadius: 12,
            background: "#F0FDF4", border: `1px solid ${C.success}33`,
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.success, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              Justificación de cierre
            </div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4 }}>
              {incidente.justificacionCierre}
            </div>
          </div>
        )}

        <button
          onClick={onEdit}
          style={{
            marginTop: 12, width: "100%", padding: "12px 20px", borderRadius: 12,
            border: "none", background: C.primary, color: "#fff",
            fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: `0 6px 18px ${C.primary}33`,
          }}
        >
          <Edit size={14} />
          Editar incidente
        </button>
      </div>
    </div>
  );
}
