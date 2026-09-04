import {
  IconAlertTriangle as AlertTriangle,
  IconCircleCheck as CheckCircle,
  IconClock as Clock,
  IconShieldExclamation as ShieldAlert,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";

const C = theme;

interface IncidentesHeroProps {
  pendientes: number;
  enProceso: number;
  resueltos: number;
  total: number;
}

/** Banner superior de la página de Incidentes con las pastillas de estadísticas. */
export function IncidentesHero({ pendientes, enProceso, resueltos, total }: IncidentesHeroProps) {
  return (
    <div
      style={{
        position: "relative", overflow: "hidden", borderRadius: 20,
        background: "linear-gradient(135deg,#39A900,#2D7D00)",
        padding: "1.4rem 1.6rem", color: "#fff",
      }}
    >
      <div style={{
        position: "absolute", width: 250, height: 250, borderRadius: "50%",
        background: "rgba(255,255,255,.07)", top: -80, right: -60,
      }} />
      <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)",
            padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
            letterSpacing: 1, textTransform: "uppercase", marginBottom: 8,
          }}>
            <ShieldAlert size={11} /> Seguridad operativa
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
            Incidentes y Novedades
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
            Gestiona y haz seguimiento a los incidentes reportados en el parqueadero institucional.
          </p>
        </div>

        <div className="incidentes-hero-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, minWidth: 280, maxWidth: 420 }}>
          {[
            { label: "Pendientes", value: pendientes, icon: AlertTriangle, color: C.warning },
            { label: "En proceso", value: enProceso, icon: Clock, color: C.primary },
            { label: "Resueltos", value: resueltos, icon: CheckCircle, color: C.success },
            { label: "Total", value: total, icon: ShieldAlert, color: "#fff" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
              borderRadius: 12, padding: "8px 10px", textAlign: "center",
            }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,.65)", textTransform: "uppercase", marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
