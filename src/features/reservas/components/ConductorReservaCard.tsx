import {
  IconAlertCircle as AlertCircle,
  IconBan as Ban,
  IconCalendar as Calendar,
  IconCar as Car,
  IconClock as Clock,
  IconEye as Eye,
  IconMapPin as MapPin,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import type { Reserva } from "@/services/api/reservas";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { ESTADO_CONFIG, todayStr } from "../lib/constants";

const C = theme;

interface ConductorReservaCardProps {
  reserva: Reserva;
  vehiculo: Vehiculo | undefined;
  celda: Celda | undefined;
  parqueadero: Parqueadero | undefined;
  onView: () => void;
  /** Se muestra "Cancelar" solo si la página decidió que aún se puede (ver puedeCancelar). */
  canCancel: boolean;
  onCancel: () => void;
}

/** Tarjeta de "Mis reservas" (rol Comunidad SENA): la reserva de uno de sus vehículos, sin la
 *  columna de conductor ni las acciones de gestión de la tabla de Admin/Vigilante — mismo
 *  patrón que ConductorIncidenteCard. */
export function ConductorReservaCard({ reserva, vehiculo, celda, parqueadero, onView, canCancel, onCancel }: ConductorReservaCardProps) {
  const cfg = ESTADO_CONFIG[reserva.estado];
  const esPasada =
    reserva.fechaReserva < todayStr() &&
    !["completada", "cancelada", "rechazada"].includes(reserva.estado);

  return (
    <div
      style={{
        borderRadius: 14, border: `1px solid ${C.border}`, background: "#fff",
        overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)",
      }}
    >
      <div style={{ height: 4, background: cfg.dot }} title={cfg.label} />
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: "rgba(57,169,0,.1)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Car size={16} color={C.primary} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: C.text, fontSize: 13 }}>{vehiculo?.placa || "—"}</div>
              <div style={{ fontSize: 10, color: C.textLight, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : "—"}
              </div>
            </div>
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999,
            fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
            {cfg.label}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12, fontSize: 11, color: C.textLight }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={12} />
            <span>
              <strong style={{ color: C.text }}>Celda {celda?.numero || "—"}</strong>
              {parqueadero ? ` · ${parqueadero.nombre}` : ""}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={12} />
            <span>{reserva.fechaReserva}</span>
            {esPasada && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: C.danger, fontWeight: 700, fontSize: 10 }}>
                <AlertCircle size={10} />Vencida
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={12} />
            <span>{reserva.horaInicio} – {reserva.horaFin}</span>
          </div>
        </div>

        {/* El motivo del rechazo es lo único que le explica al conductor qué pasó con su solicitud. */}
        {reserva.estado === "rechazada" && reserva.motivoRechazo && (
          <div style={{
            padding: "10px 12px", borderRadius: 10, marginBottom: 12,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: cfg.text, textTransform: "uppercase", letterSpacing: .5 }}>
              Motivo del rechazo
            </div>
            <p style={{ fontSize: 11, color: cfg.text, lineHeight: 1.45, marginTop: 2 }}>{reserva.motivoRechazo}</p>
          </div>
        )}

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: "flex", gap: 8 }}>
          <button
            onClick={onView}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "8px 10px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff",
              color: C.text, fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
            }}
          >
            <Eye size={12} />Ver detalle
          </button>
          {canCancel && (
            <button
              onClick={onCancel}
              aria-label={`Cancelar la reserva de ${vehiculo?.placa ?? "este vehículo"}`}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px 10px", borderRadius: 9, border: "1px solid #B4530933", background: "#fff",
                color: "#B45309", fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
              }}
            >
              <Ban size={12} />Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
