import { IconCar as Car, IconMotorbike as Motorbike, IconMapPin as MapPin } from "@tabler/icons-react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { theme } from "@/styles/theme";

const C = theme;

interface CeldasDisponiblesProps {
  celdas: Celda[];
  parqueaderos: Parqueadero[];
  onCellClick: (celda: Celda) => void;
}

/** Vista de consulta del Conductor: muestra directamente las celdas disponibles. */
export function CeldasDisponibles({ celdas, parqueaderos, onCellClick }: CeldasDisponiblesProps) {
  const parqueaderoPorId = new Map(parqueaderos.map((parqueadero) => [parqueadero.id, parqueadero]));

  if (celdas.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "48px 24px", borderRadius: 16, border: `1px dashed ${C.border}`,
        background: "#fff", color: C.textLight,
      }}>
        <Car size={36} color={C.border} style={{ marginBottom: 12 }} />
        <p style={{ fontWeight: 700, fontSize: 13 }}>No hay celdas disponibles</p>
      </div>
    );
  }

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
      gap: 12,
    }}>
      {celdas.map((celda) => {
        const parqueadero = parqueaderoPorId.get(celda.parqueaderoId);
        const Icon = celda.tipo === "moto" ? Motorbike : Car;
        return (
          <button
            key={celda.id}
            type="button"
            onClick={() => onCellClick(celda)}
            style={{
              textAlign: "left", padding: 16, borderRadius: 14,
              border: `1px solid ${C.border}`, background: "#fff",
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(15,23,42,.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, background: C.primaryPale,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={19} color={C.primary} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>
                  Celda {celda.numero}
                </div>
                <div style={{ fontSize: 11, color: C.primary, fontWeight: 700 }}>
                  Disponible
                </div>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, marginTop: 12,
              fontSize: 11, color: C.textLight,
            }}>
              <MapPin size={13} />
              {parqueadero?.nombre ?? "Parqueadero"}
            </div>
          </button>
        );
      })}
    </div>
  );
}
