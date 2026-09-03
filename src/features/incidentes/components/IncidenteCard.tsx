import { AlertTriangle, Car, CheckCircle, Clock, Edit, Eye, Lock, MapPin, Trash2, User } from "lucide-react";
import type { Incidente } from "@/services/api/incidentes";
import type { Celda } from "@/services/api/celdas";
import { theme } from "@/styles/theme";
import { ESTADO_CONFIG, type EstadoIncidente } from "../lib/constants";
import { esEstadoFinal, transicionesDe } from "../lib/transiciones";
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
  onCambiarEstado: (estado: EstadoIncidente) => void;
}

/** Tarjeta de un incidente en el grid: resumen, ubicación y acciones rápidas. */
export function IncidenteCard({ incidente, celda, vehiculoPlaca, asignadoNombre, nombreParqueadero, onView, onEdit, onDelete, onCambiarEstado }: IncidenteCardProps) {
  const cfg = ESTADO_CONFIG[incidente.estado];
  const fecha = new Date(incidente.fecha);
  // Resuelto, cerrado y cancelado son finales: en vez del selector se muestra la etiqueta
  // con un candado (la guarda equivalente vive en useIncidentesData.cambiarEstado, y el
  // backend debe impedirlo también). Ver lib/transiciones.ts.
  const estadoBloqueado = esEstadoFinal(incidente.estado);
  const destinos = transicionesDe(incidente.estado);

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
            {estadoBloqueado ? (
              <span
                title={`Un incidente ${cfg.label.toLowerCase()} ya no puede cambiar de estado`}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999,
                  fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.text,
                  border: `1px solid ${cfg.border}`,
                }}
              >
                <Lock size={10} aria-hidden="true" />
                {cfg.label}
              </span>
            ) : (
              <select
                aria-label="Cambiar estado del incidente"
                value={incidente.estado}
                onChange={(e) => onCambiarEstado(e.target.value as EstadoIncidente)}
                style={{
                  padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                  fontFamily: "inherit", cursor: "pointer", appearance: "none",
                  background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
                }}
              >
                <option value={incidente.estado}>{cfg.label}</option>
                {destinos.map((estado) => (
                  <option key={estado} value={estado}>
                    Cambiar a: {ESTADO_CONFIG[estado].label}
                  </option>
                ))}
              </select>
            )}
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
