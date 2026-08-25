import { Car, ParkingCircle, Trash2 } from "lucide-react";
import { theme } from "@/styles/theme";
import type { ControlSalida } from "@/services/api/controlSalida";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Celda } from "@/services/api/celdas";
import type { Usuario } from "@/services/api/usuarios";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { formatDateTime, getTiempoEstadia, isSameDay } from "../lib/helpers";

const COLORS = theme;

const GRID_COLUMNS = "minmax(155px,1fr) minmax(135px,1fr) 85px minmax(135px,1fr) 150px 150px 90px 140px";

interface ControlSalidaRowProps {
  control: ControlSalida;
  vehiculo: Vehiculo | undefined;
  celda: Celda | undefined;
  usuario: Usuario | null | undefined;
  parqueadero: Parqueadero | null | undefined;
  onDelete: (control: ControlSalida) => void;
}

/** Una fila del historial: vehículo, conductor, celda, parqueadero, entrada/salida, estadía y acciones. */
export function ControlSalidaRow({ control, vehiculo, celda, usuario, parqueadero, onDelete }: ControlSalidaRowProps) {
  const esActivo = control.estado === "en_parqueadero";
  const esHoy = isSameDay(control.fechaEntrada, new Date());

  return (
    <div
      className="control-row table-row"
      style={{ gridTemplateColumns: GRID_COLUMNS, borderLeft: `3px solid ${esActivo ? COLORS.info : "transparent"}` }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(57,169,0,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Car size={16} color={COLORS.primary} />
        </div>
        <div>
          <div style={{ fontWeight: 800, color: COLORS.text }}>{vehiculo?.placa || "—"}</div>
          <div style={{ fontSize: 10, color: COLORS.textLight }}>{vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : "—"}</div>
        </div>
      </div>

      <div>
        <span className="cell-label">Conductor</span>
        <div style={{ fontWeight: 600, color: COLORS.text }}>{usuario?.nombre || "—"}</div>
        <div style={{ fontSize: 10, color: COLORS.textLight }}>{usuario?.identificacion || ""}</div>
      </div>

      <div>
        <span className="cell-label">Celda</span>
        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: COLORS.infoBg, color: COLORS.info }}>
          {celda?.numero || "—"}
        </span>
      </div>

      <div>
        <span className="cell-label">Parqueadero</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: COLORS.text }}>
          <ParkingCircle size={12} color={COLORS.textLight} />
          {parqueadero?.nombre || "—"}
        </span>
      </div>

      <div>
        <span className="cell-label">Entrada</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: COLORS.text }}>
          {formatDateTime(control.fechaEntrada)}
          {esHoy && (
            <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: 0.3, textTransform: "uppercase", color: COLORS.primary, background: "rgba(57,169,0,.1)", padding: "1px 6px", borderRadius: 999 }}>
              Hoy
            </span>
          )}
        </span>
      </div>

      <div>
        <span className="cell-label">Salida</span>
        <span style={{ fontSize: 11, color: control.fechaSalida ? COLORS.text : COLORS.textLight }}>
          {control.fechaSalida ? formatDateTime(control.fechaSalida) : "—"}
        </span>
      </div>

      <div>
        <span className="cell-label">Estadía</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textLight }}>
          {getTiempoEstadia(control.fechaEntrada, control.fechaSalida)}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
        {esActivo ? (
          <span title="En parqueadero" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", background: COLORS.infoBg, color: COLORS.info }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.info, flexShrink: 0 }} />
            Activo
          </span>
        ) : (
          <span title="Completado" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", background: COLORS.successBg, color: COLORS.success }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.success, flexShrink: 0 }} />
            Completado
          </span>
        )}
        <button
          className="action-btn"
          title="Eliminar"
          aria-label="Eliminar registro"
          onClick={() => onDelete(control)}
          style={{ background: "transparent", color: COLORS.danger, padding: 6 }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}


export { GRID_COLUMNS as controlSalidaGridColumns };
