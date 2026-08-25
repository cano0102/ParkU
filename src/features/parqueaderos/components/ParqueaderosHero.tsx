import { Shield } from "lucide-react";
import { CELDA_CONFIG } from "../lib/helpers";

interface ParqueaderosHeroProps {
  stats: { libres: number; ocupadas: number; reservadas: number; pct: number };
}

/** Banner superior de la página de Parqueaderos con las pastillas de ocupación. */
export function ParqueaderosHero({ stats }: ParqueaderosHeroProps) {
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, background: "linear-gradient(135deg,#39A900,#2D7D00)", padding: "1.4rem 1.6rem", color: "#fff" }}>
      <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,.07)", top: -80, right: -60 }} />
      <div className="pq-hero-banner" style={{ position: "relative", zIndex: 2 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)", padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            <Shield size={11} /> Gestión Institucional SENA
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>Gestión de Parqueaderos</h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>Registro óptico automatizado, celdas de cortesía institucional y reportes de ocupación en tiempo real.</p>
        </div>
        <div className="pq-hero-stats">
          {[
            { label: "Disponibles", value: stats.libres, dot: CELDA_CONFIG.disponible.dotColor },
            { label: "Ocupadas", value: stats.ocupadas, dot: CELDA_CONFIG.no_disponible.dotColor },
            { label: "Reservadas", value: stats.reservadas, dot: CELDA_CONFIG.reservada.dotColor },
            { label: "Ocupación", value: `${stats.pct}%`, dot: "#94A3B8" },
          ].map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 12, padding: "8px 10px", textAlign: "center" }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,.65)", textTransform: "uppercase", marginBottom: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />{s.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
