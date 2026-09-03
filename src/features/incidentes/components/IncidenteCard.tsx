import { AlertTriangle, Car, CheckCircle, Clock, Edit, Eye, Lock, MapPin, Trash2, User } from "lucide-react";
import type { Incidente } from "@/services/api/incidentes";
import type { Celda } from "@/services/api/celdas";
import { theme } from "@/styles/theme";
import { ESTADO_CONFIG } from "../lib/constants";
import { CeldaBadgeInline, EstadoBadgeInline } from "./IncidenteBadges";

const C = theme;

interface IncidenteCardProps {
  incidente: Incidente;
  celda: Celda | undefined;
  vehiculoPlaca?: string;
  asignadoNombre?: string;
  nombreParqueadero: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleEstado: () => void;
}

/** Tarjeta de un incidente en el grid: resumen, ubicación y acciones rápidas. */
export function IncidenteCard({ incidente, celda, vehiculoPlaca, asignadoNombre, nombreParqueadero, onView, onEdit, onDelete, onToggleEstado }: IncidenteCardProps) {
  const cfg = ESTADO_CONFIG[incidente.estado];
  const fecha = new Date(incidente.fecha);
  // Un incidente cerrado no puede volver a pendiente/resuelto: el switch queda
  // deshabilitado y se marca con un candado (la guarda equivalente vive en
  // useIncidentesData.toggleEstado, y el backend debe impedirlo también).
  const estadoBloqueado = incidente.estado === "cerrado";

  return (
    <div
      className="incidente-card"
      style={{
        borderRadius: 14, border: `1px solid ${C.border}`,
        background: "#fff", overflow: "hidden",
        boxShadow: "0 2px 8px rgba(15,23,42,.05)",
      }}
    >
      <div style={{ height: 3, background: incidente.estado === "resuelto" ? C.success : C.warning }} />

      <div style={{ padding: "14px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: `${cfg.bg}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {incidente.estado === "resuelto" ? (
              <CheckCircle size={24} color={C.success} />
            ) : (
              <AlertTriangle size={24} color={C.warning} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 6 }}>
              {incidente.descripcion}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <EstadoBadgeInline estado={incidente.estado} />
              {celda && <CeldaBadgeInline numero={celda.numero} estado={celda.estado} />}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text }}>
            <MapPin size={12} color={C.textLight} />
            <span>
              {nombreParqueadero}
              {celda && <> · Celda <strong>{celda.numero}</strong></>}
            </span>
          </div>
          {vehiculoPlaca && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text }}>
              <Car size={12} color={C.textLight} />
              <span>{vehiculoPlaca}</span>
            </div>
          )}
          {asignadoNombre && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text }}>
              <User size={12} color={C.textLight} />
              <span>{asignadoNombre}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: C.textLight }}>
            <Clock size={10} />
            <span>{fecha.toLocaleDateString("es-CO")} · {fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        <div style={{
          borderTop: `1px solid ${C.border}`, paddingTop: 12,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={onToggleEstado}
              role="switch"
              disabled={estadoBloqueado}
              aria-checked={incidente.estado === "resuelto"}
              aria-label={
                estadoBloqueado
                  ? "El incidente está cerrado y no puede cambiar de estado"
                  : `Marcar incidente como ${incidente.estado === "resuelto" ? "pendiente" : "resuelto"}`
              }
              title={estadoBloqueado ? "Un incidente cerrado no puede cambiar de estado" : undefined}
              style={{
                width: 36, height: 20, borderRadius: 999,
                background: estadoBloqueado
                  ? C.borderStrong
                  : incidente.estado === "resuelto" ? C.success : C.warning,
                border: "none", cursor: estadoBloqueado ? "not-allowed" : "pointer", position: "relative",
                transition: "background .2s",
                opacity: estadoBloqueado ? 0.65 : 1,
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                background: "#fff", position: "absolute", top: 2,
                left: incidente.estado === "resuelto" ? 18 : 2,
                transition: "left .2s",
              }} />
            </button>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: C.textLight }}>
              {/* Antes solo distinguía resuelto/pendiente, así que un incidente
                  cerrado o cancelado se rotulaba "Pendiente"; ahora usa la etiqueta
                  real del estado (ESTADO_CONFIG) y avisa cuando está bloqueado. */}
              {cfg.label}
              {estadoBloqueado && <Lock size={10} aria-hidden="true" />}
            </span>
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            <button
              className="action-btn"
              title="Ver detalle"
              aria-label="Ver detalle del incidente"
              onClick={onView}
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: "none", background: "transparent",
                color: C.textLight, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Eye size={13} />
            </button>
            <button
              className="action-btn"
              title="Editar"
              aria-label="Editar incidente"
              onClick={onEdit}
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: "none", background: "transparent",
                color: C.textLight, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Edit size={13} />
            </button>
            <button
              className="delete-btn"
              title="Eliminar"
              aria-label="Eliminar incidente"
              onClick={onDelete}
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: "none", background: "transparent",
                color: C.danger, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
