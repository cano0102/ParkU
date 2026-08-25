import { AlertCircle, Calendar, Car, Eye, MapPin, Trash2 } from "lucide-react";
import { theme } from "@/styles/theme";
import type { Reserva } from "@/services/api/reservas";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Celda } from "@/services/api/celdas";
import type { Usuario } from "@/services/api/usuarios";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { ESTADO_CONFIG, todayStr } from "../lib/constants";

const C = theme;

export const RESERVA_GRID_COLUMNS = "minmax(180px,1fr) minmax(160px,1fr) 120px minmax(160px,1fr) 180px 110px 100px";

interface ReservaRowProps {
  reserva: Reserva;
  vehiculo: Vehiculo | undefined;
  celda: Celda | undefined;
  usuario: Usuario | null | undefined;
  parqueadero: Parqueadero | undefined;
  onView: () => void;
  onDelete: () => void;
}

/** Una fila de la tabla de reservas: vehículo, conductor, ubicación, horario, fecha, estado y acciones. */
export function ReservaRow({ reserva, vehiculo, celda, usuario, parqueadero, onView, onDelete }: ReservaRowProps) {
  const cfg = ESTADO_CONFIG[reserva.estado];
  const esPasada = reserva.fechaReserva < todayStr() && reserva.estado !== "completada" && reserva.estado !== "cancelada";

  return (
    <div
      className="reserva-row"
      style={{
        display: "grid",
        gridTemplateColumns: RESERVA_GRID_COLUMNS,
        padding: "14px 16px",
        borderBottom: `1px solid ${C.border}`,
        alignItems: "center",
        fontSize: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(57,169,0,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Car size={16} color={C.primary} />
        </div>
        <div>
          <div style={{ fontWeight: 800, color: C.text }}>{vehiculo?.placa || "—"}</div>
          <div style={{ fontSize: 10, color: C.textLight }}>{vehiculo?.marca} {vehiculo?.modelo}</div>
        </div>
      </div>

      <div>
        {usuario ? (
          <>
            <div style={{ fontWeight: 600, color: C.text }}>{usuario.nombre}</div>
            <div style={{ fontSize: 10, color: C.textLight }}>{usuario.identificacion}</div>
          </>
        ) : (
          <span style={{ color: C.textLight, fontSize: 11 }}>Sin conductor</span>
        )}
      </div>

      <div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 8, background: "#F1F5F9", fontSize: 11, fontWeight: 600 }}>
          <MapPin size={10} color={C.primary} />
          Celda {celda?.numero || "—"}
        </div>
        {parqueadero && (
          <div style={{ fontSize: 9, color: C.textLight, marginTop: 2 }}>
            {parqueadero.nombre}
          </div>
        )}
      </div>

      <div>
        <div style={{ fontWeight: 600, color: C.text }}>
          {reserva.horaInicio} – {reserva.horaFin}
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Calendar size={10} color={C.textLight} />
          <span style={{ fontSize: 11, color: C.text }}>{reserva.fechaReserva}</span>
        </div>
        {esPasada && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
            <AlertCircle size={9} color={C.danger} />
            <span style={{ fontSize: 9, color: C.danger, fontWeight: 700 }}>Vencida</span>
          </div>
        )}
      </div>

      <div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
          background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
          {cfg.label}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
        <button
          className="action-btn"
          title="Ver detalle"
          aria-label="Ver detalle de la reserva"
          onClick={onView}
          style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: C.textLight, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Eye size={13} />
        </button>
        <button
          className="action-btn"
          title="Eliminar"
          aria-label="Eliminar reserva"
          onClick={onDelete}
          style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
