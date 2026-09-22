import { IconMapPin as MapPin, IconCircleCheck as CircleCheck } from "@tabler/icons-react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Vehiculo } from "@/services/api/vehiculos";
import { theme } from "@/styles/theme";
import { CELDA_CONFIG, getCeldaVisualConfig } from "../lib/helpers";

const C = theme;

interface CeldasDisponiblesConductorProps {
  celdas: Celda[];
  parqueaderos: Parqueadero[];
  /** Vehículos del usuario logueado, por id de la celda donde están (ver useParqueaderosData). */
  misVehiculosPorCelda: Record<string, Vehiculo>;
}

/**
 * Vista de Parqueaderos para Comunidad SENA (Conductor): a diferencia del panel de gestión de
 * Admin/Vigilante, acá no hay parqueaderos que administrar — solo celdas disponibles donde
 * podría quedar su vehículo (la celda real se la asigna el vigilante al registrar el ingreso;
 * ver el aviso informativo en ParqueaderosPage.tsx). Por eso no se agrupa por parqueadero ni
 * se muestran columnas de gestión: es una sola grilla plana de celdas libres.
 */
export function CeldasDisponiblesConductor({ celdas, parqueaderos, misVehiculosPorCelda }: CeldasDisponiblesConductorProps) {
  const parqueaderoPorId = new Map(parqueaderos.map((pq) => [pq.id, pq]));

  if (celdas.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "48px 24px",
          borderRadius: 16,
          border: `2px dashed ${C.border}`,
          background: "#fff",
          color: C.textLight,
        }}
      >
        <MapPin size={36} color={C.border} style={{ marginBottom: 12 }} />
        <p style={{ fontWeight: 700, fontSize: 13 }}>No hay celdas disponibles ahora mismo</p>
        <p style={{ fontSize: 11, marginTop: 4 }}>Vuelve a consultar más tarde.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
        gap: 10,
      }}
    >
      {celdas.map((celda) => {
        const cfg = CELDA_CONFIG[celda.estado];
        const tipoCfg = getCeldaVisualConfig(celda);
        const TipoIcon = tipoCfg.icon;
        const pq = parqueaderoPorId.get(celda.parqueaderoId);
        const miVehiculo = misVehiculosPorCelda[celda.id] ?? null;

        return (
          <div
            key={celda.id}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: `2px solid ${miVehiculo ? C.primary : cfg.border}`,
              borderLeft: `4px solid ${tipoCfg.accent}`,
              background: miVehiculo ? C.primaryPale : cfg.bg,
              color: cfg.text,
              boxShadow: miVehiculo ? "0 0 0 3px rgba(57,169,0,.2)" : undefined,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.5 }}>{celda.numero}</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: tipoCfg.accent,
                  flexShrink: 0,
                }}
              >
                <TipoIcon size={12} color="#fff" strokeWidth={2.5} />
              </span>
            </div>
            <div style={{ fontSize: 11, color: C.textLight, marginBottom: 8, minHeight: 14 }}>
              {pq ? `${pq.nombre} · ${pq.zona || pq.ubicacion}` : "—"}
            </div>
            {miVehiculo ? (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 800, color: C.primaryDark }}>
                <CircleCheck size={12} /> Tu vehículo · {miVehiculo.placa}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dotColor, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.8 }}>{cfg.label}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
