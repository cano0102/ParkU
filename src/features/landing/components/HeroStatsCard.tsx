import type { Ref } from "react";
import { CheckCircle2 } from "lucide-react";
import { theme } from "@/styles/theme";
import { heroStats } from "../lib/content";
import { StatCard } from "./StatCard";

const COLORS = theme;

interface HeroStatsCardProps {
  visible: boolean;
  statsRef: Ref<HTMLDivElement>;
  statsVisible: boolean;
}

/** Columna derecha del hero: tarjeta "Dashboard ParkU" con las estadísticas animadas. */
export function HeroStatsCard({ visible, statsRef, statsVisible }: HeroStatsCardProps) {
  return (
    <div className={`fade ${visible ? "active" : ""}`}>
      <div className="card" ref={statsRef} style={{ padding: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2rem",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 24 }}>Dashboard ParkU</div>
            <div style={{ color: COLORS.textLight, marginTop: 4 }}>
              Estado institucional en tiempo real
            </div>
          </div>

          <div
            style={{
              color: COLORS.primary,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: COLORS.primary,
                display: "inline-block",
              }}
            />
            Online
          </div>
        </div>

        <div
          className="stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          {heroStats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} active={statsVisible} />
          ))}
        </div>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "#ECFDF3",
            padding: "16px 18px",
            borderRadius: 16,
            color: COLORS.primaryDark,
            fontWeight: 700,
          }}
        >
          <CheckCircle2 size={20} />
          Sistema operativo correctamente
        </div>
      </div>
    </div>
  );
}
