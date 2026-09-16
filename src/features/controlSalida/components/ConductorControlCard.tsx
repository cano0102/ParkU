import {
  IconCar as Car,
  IconEye as Eye,
  IconLogin as LogIn,
  IconLogout as LogOut,
  IconMapPin as MapPin,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import type { ControlSalida } from "@/services/api/controlSalida";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { formatDateTime, getTiempoEstadia, isSameDay } from "../lib/helpers";

const C = theme;

interface ConductorControlCardProps {
  control: ControlSalida;
  vehiculo: Vehiculo | undefined;
  celda: Celda | undefined;
  parqueadero: Parqueadero | null | undefined;
  onVerDetalle: () => void;
}

/** Tarjeta de "Mis entradas y salidas" (rol Comunidad SENA): un movimiento de uno de sus
 *  vehículos, sin la columna de conductor ni las acciones de portería (liberar, reportar) de
 *  la tabla de Admin/Vigilante — mismo patrón que ConductorIncidenteCard. */
export function ConductorControlCard({ control, vehiculo, celda, parqueadero, onVerDetalle }: ConductorControlCardProps) {
  const esActivo = control.estado === "en_parqueadero";
  const esHoy = isSameDay(control.fechaEntrada, new Date());
  const estado = esActivo
    ? { label: "En parqueadero", bg: C.infoBg, text: C.info }
    : { label: "Completado", bg: C.successBg, text: C.success };

  return (
    <div
      style={{
        borderRadius: 14, border: `1px solid ${C.border}`, background: "#fff",
        overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)",
      }}
    >
      <div style={{ height: 4, background: estado.text }} title={estado.label} />
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
            display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999,
            fontSize: 10, fontWeight: 700, background: estado.bg, color: estado.text, whiteSpace: "nowrap", flexShrink: 0,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: estado.text }} />
            {estado.label}
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
            <LogIn size={12} />
            <span>Entrada: {formatDateTime(control.fechaEntrada)}</span>
            {esHoy && (
              <span style={{
                fontSize: 8, fontWeight: 800, letterSpacing: 0.3, textTransform: "uppercase",
                color: C.primary, background: "rgba(57,169,0,.1)", padding: "1px 6px", borderRadius: 999,
              }}>
                Hoy
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogOut size={12} />
            <span>
              {control.fechaSalida ? `Salida: ${formatDateTime(control.fechaSalida)}` : "Aún sin salida"}
              {" · "}
              <strong style={{ color: C.text }}>{getTiempoEstadia(control.fechaEntrada, control.fechaSalida)}</strong>
            </span>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
          <button
            onClick={onVerDetalle}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "8px 10px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff",
              color: C.text, fontSize: 11, fontWeight: 700, fontFamily: "inherit", cursor: "pointer",
            }}
          >
            <Eye size={12} />Ver detalle
          </button>
        </div>
      </div>
    </div>
  );
}
