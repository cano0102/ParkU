import { IconCalendar as Calendar } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import type { Reserva } from "@/services/api/reservas";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Celda } from "@/services/api/celdas";
import type { Conductor } from "@/services/api/conductores";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { ReservaRow, RESERVA_GRID_COLUMNS } from "./ReservaRow";

const C = theme;

interface ReservasTableProps {
  filteredReservas: Reserva[];
  totalReservas: number;
  getVehiculo: (id: string) => Vehiculo | undefined;
  getCelda: (id: string) => Celda | undefined;
  getConductorReserva: (reserva: Reserva) => Conductor | null | undefined;
  getParqueadero: (id: string) => Parqueadero | undefined;
  canDelete: boolean;
  onView: (reserva: Reserva) => void;
  onDelete: (reserva: Reserva) => void;
  puedeCancelar: (reserva: Reserva) => boolean;
  onCancel: (reserva: Reserva) => void;
}

/** Tabla del historial de reservas: encabezado, filas (o estado vacío) y el contador de resultados. */
export function ReservasTable({ filteredReservas, totalReservas, getVehiculo, getCelda, getConductorReserva, getParqueadero, canDelete, onView, onDelete, puedeCancelar, onCancel }: ReservasTableProps) {
  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)" }}>
      <div className="reserva-table-header" style={{
        display: "grid",
        gridTemplateColumns: RESERVA_GRID_COLUMNS,
        background: "#F8FAF8",
        borderBottom: `1px solid ${C.border}`,
        padding: "12px 16px",
        fontSize: 11, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5,
      }}>
        <div>Vehículo</div>
        <div>Conductor</div>
        <div>Ubicación</div>
        <div>Horario</div>
        <div>Fecha</div>
        <div>Estado</div>
        <div style={{ textAlign: "right" }}>Acciones</div>
      </div>

      <div>
        {filteredReservas.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", color: C.textLight }}>
            <Calendar size={36} color={C.border} style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 600, fontSize: 13 }}>No se encontraron reservas</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros. Las reservas se crean desde el módulo de Parqueaderos.</p>
          </div>
        ) : (
          filteredReservas.map((reserva) => {
            const celda = getCelda(reserva.celdaId);
            return (
              <ReservaRow
                key={reserva.id}
                reserva={reserva}
                vehiculo={getVehiculo(reserva.vehiculoId)}
                celda={celda}
                usuario={getConductorReserva(reserva)}
                parqueadero={celda ? getParqueadero(celda.parqueaderoId) : undefined}
                canDelete={canDelete}
                onView={() => onView(reserva)}
                onDelete={() => onDelete(reserva)}
                canCancel={puedeCancelar(reserva)}
                onCancel={() => onCancel(reserva)}
              />
            );
          })
        )}
      </div>

      {filteredReservas.length > 0 && (
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, background: "#F8FAF8", fontSize: 11, color: C.textLight }}>
          Mostrando <strong>{filteredReservas.length}</strong> de <strong>{totalReservas}</strong> reservas
        </div>
      )}
    </div>
  );
}
