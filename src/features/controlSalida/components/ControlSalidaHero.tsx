import {
  IconArrowsLeftRight as ArrowLeftRight,
  IconClock as Clock,
  IconLogin as LogIn,
  IconLogout as LogOutIcon,
  IconCircleLetterP as ParkingCircle,
} from "@tabler/icons-react";

interface ControlSalidaHeroProps {
  enParqueadero: number;
  salidas: number;
  celdasLibres: number;
  total: number;
}

/** Banner superior de Entrada y Salida con las pastillas de estadísticas. */
export function ControlSalidaHero({ enParqueadero, salidas, celdasLibres, total }: ControlSalidaHeroProps) {
  return (
    <div
      style={{
        position: "relative", overflow: "hidden", borderRadius: 20,
        background: "linear-gradient(135deg,#39A900,#2D7D00)", padding: "1.4rem 1.6rem", color: "#fff",
      }}
    >
      <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,.07)", top: -80, right: -60 }} />
      <div className="hero-banner" style={{ position: "relative", zIndex: 2 }}>
        <div>
          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)",
              padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
              letterSpacing: 1, textTransform: "uppercase", marginBottom: 8,
            }}
          >
            <ArrowLeftRight size={11} /> Movimiento de vehículos
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
            Entrada y Salida
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
            Historial de movimientos. Para registrar una entrada o una salida, hazlo desde la celda en el módulo de Parqueaderos.
          </p>
        </div>

        <div className="hero-stats">
          {[
            { label: "En parqueadero", value: enParqueadero, icon: LogIn },
            { label: "Salidas", value: salidas, icon: LogOutIcon },
            { label: "Celdas libres", value: celdasLibres, icon: ParkingCircle },
            { label: "Total registros", value: total, icon: Clock },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 12, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,.65)", textTransform: "uppercase", marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <span>{s.value}</span>
                <span style={{ fontSize: 12, opacity: 0.6 }}><s.icon size={12} /></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
