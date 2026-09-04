import { IconAlertTriangle as AlertTriangle } from "@tabler/icons-react";
import type { Incidente } from "@/services/api/incidentes";
import type { Celda } from "@/services/api/celdas";
import type { Vehiculo } from "@/services/api/vehiculos";
import { theme } from "@/styles/theme";
import type { EstadoIncidente } from "../lib/constants";
import { IncidenteCard } from "./IncidenteCard";

const C = theme;

interface IncidentesGridProps {
  incidentes: Incidente[];
  celdaDe: (id?: string) => Celda | undefined;
  vehiculoDe: (id?: string) => Vehiculo | undefined;
  nombreUsuarioAsignado: (id?: string) => string | undefined;
  nombreParqueadero: (id: string) => string;
  onView: (incidente: Incidente) => void;
  onEdit: (incidente: Incidente) => void;
  onDelete: (incidente: Incidente) => void;
  onCambiarEstado: (id: string, estado: EstadoIncidente) => void;
}

/** Grid de tarjetas de incidente, o el estado vacío cuando el filtro no arroja resultados. */
export function IncidentesGrid({ incidentes, celdaDe, vehiculoDe, nombreUsuarioAsignado, nombreParqueadero, onView, onEdit, onDelete, onCambiarEstado }: IncidentesGridProps) {
  if (incidentes.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "3rem 1rem", borderRadius: 16, border: `2px dashed ${C.border}`,
        background: "#fff", color: C.textLight,
      }}>
        <AlertTriangle size={36} color={C.border} style={{ marginBottom: 10 }} />
        <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron incidentes</p>
        <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o registra uno nuevo</p>
      </div>
    );
  }

  return (
    <div
      className="incidentes-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))",
        gap: 12,
      }}
    >
      <style>{`
        @media (max-width: 400px) {
          .incidentes-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {incidentes.map((incidente) => (
        <IncidenteCard
          key={incidente.id}
          incidente={incidente}
          celda={celdaDe(incidente.celdaId)}
          vehiculoPlaca={vehiculoDe(incidente.vehiculoId)?.placa}
          asignadoNombre={nombreUsuarioAsignado(incidente.usuarioAsignadoId)}
          nombreParqueadero={nombreParqueadero(incidente.parqueaderoId)}
          onView={() => onView(incidente)}
          onEdit={() => onEdit(incidente)}
          onDelete={() => onDelete(incidente)}
          onCambiarEstado={(estado) => onCambiarEstado(incidente.id, estado)}
        />
      ))}
    </div>
  );
}
