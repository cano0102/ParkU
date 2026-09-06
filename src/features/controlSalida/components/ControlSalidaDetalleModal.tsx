import {
  IconCar as Car,
  IconCircleLetterP as ParkingCircle,
  IconClock as Clock,
  IconMapPin as MapPin,
  IconUser as User,
  IconX as X,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import type { ControlSalida } from "@/services/api/controlSalida";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Celda } from "@/services/api/celdas";
import type { Conductor } from "@/services/api/conductores";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { theme } from "@/styles/theme";
import { formatDateTime, getTiempoEstadia } from "../lib/helpers";

const C = theme;

interface ControlSalidaDetalleModalProps {
  control: ControlSalida;
  vehiculo: Vehiculo | undefined;
  celda: Celda | undefined;
  conductor: Conductor | null | undefined;
  parqueadero: Parqueadero | null | undefined;
  onClose: () => void;
}

interface Dato { icono: ReactNode; etiqueta: string; valor: ReactNode }

/**
 * Todo lo que hay detrás de una fila del historial.
 *
 * La tabla muestra lo que cabe en una línea; lo demás (documento del conductor, tipo y color
 * del vehículo, la celda exacta, las dos horas completas) quedaba sin sitio donde consultarse.
 * Sustituye a la acción de eliminar: un movimiento registrado es historia del parqueadero y no
 * se borra — se consulta.
 */
export function ControlSalidaDetalleModal({
  control, vehiculo, celda, conductor, parqueadero, onClose,
}: ControlSalidaDetalleModalProps) {
  const entrada = formatDateTime(control.fechaEntrada);
  const salida = control.fechaSalida ? formatDateTime(control.fechaSalida) : null;
  // formatDateTime ya devuelve fecha y hora en una sola cadena.
  const activo = control.estado === "en_parqueadero";

  const datos: Dato[] = [
    {
      icono: <Car size={14} color={C.textLight} />,
      etiqueta: "Vehículo",
      valor: vehiculo
        ? `${vehiculo.placa} · ${vehiculo.marca} ${vehiculo.modelo}${vehiculo.color ? ` · ${vehiculo.color}` : ""}`
        : "—",
    },
    {
      icono: <User size={14} color={C.textLight} />,
      etiqueta: "Conductor",
      valor: conductor
        ? `${conductor.nombre}${conductor.numeroDocumento ? ` · ${conductor.tipoDocumento} ${conductor.numeroDocumento}` : ""}`
        : "—",
    },
    {
      icono: <MapPin size={14} color={C.textLight} />,
      etiqueta: "Parqueadero",
      valor: parqueadero?.nombre ?? "—",
    },
    {
      icono: <ParkingCircle size={14} color={C.textLight} />,
      etiqueta: "Celda",
      valor: celda ? `${celda.numero} (${celda.tipo})` : "—",
    },
    {
      icono: <Clock size={14} color={C.textLight} />,
      etiqueta: "Entrada",
      valor: entrada,
    },
    {
      icono: <Clock size={14} color={C.textLight} />,
      etiqueta: "Salida",
      valor: salida ?? "Sigue en el parqueadero",
    },
    {
      icono: <Clock size={14} color={C.textLight} />,
      etiqueta: "Estadía",
      valor: getTiempoEstadia(control.fechaEntrada, control.fechaSalida),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, padding: "1.4rem 1.6rem 0" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.textLight, textTransform: "uppercase" }}>
            Detalle del movimiento
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, marginTop: 2 }}>
            {vehiculo?.placa || "—"}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar detalle"
          style={{ width: 30, height: 30, borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", color: C.textLight, cursor: "pointer" }}
        >
          <X size={14} />
        </button>
      </div>

      <div style={{ padding: "1rem 1.6rem 1.6rem", display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{
          alignSelf: "flex-start", padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800,
          background: activo ? C.infoBg : C.successBg, color: activo ? C.info : C.success,
        }}>
          {activo ? "En parqueadero" : "Completado"}
        </span>

        {datos.map((d) => (
          <div key={d.etiqueta} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, background: "#F8FAFC", border: `1px solid ${C.border}` }}>
            {d.icono}
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: .5 }}>{d.etiqueta}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{d.valor}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
