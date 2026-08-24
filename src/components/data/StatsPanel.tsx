import type { ReactNode } from "react";

export interface StatMetric {
  label: string;
  value: string | number;
  icon?: ReactNode;
}

export interface StatsPanelProps {
  eyebrowIcon: ReactNode;
  eyebrowText: string;
  title: string;
  description: string;
  metrics: StatMetric[];
}

/**
 * Hero/banner con métricas, compartido por las pantallas de gestión (antes
 * duplicado casi al detalle entre ConductoresStats y UsuariosStats).
 */
export function StatsPanel({ eyebrowIcon, eyebrowText, title, description, metrics }: StatsPanelProps) {
  return (
    <div
      className="stats-panel"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        background: "linear-gradient(135deg,#39A900,#2D7D00)",
        padding: "1.4rem 1.6rem",
        color: "#fff",
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .stats-panel-metrics { grid-template-columns: repeat(2, 1fr) !important; min-width: 0 !important; }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "rgba(255,255,255,.07)",
          top: -80,
          right: -60,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,.15)",
              border: "1px solid rgba(255,255,255,.2)",
              padding: "4px 12px",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {eyebrowIcon} {eyebrowText}
          </div>
          <h1
            style={{
              fontSize: "clamp(1.6rem,3vw,2.2rem)",
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>{description}</p>
        </div>

        <div
          className="stats-panel-metrics"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${metrics.length},1fr)`,
            gap: 8,
            minWidth: 280,
            maxWidth: 420,
          }}
        >
          {metrics.map((m) => (
            <div
              key={m.label}
              style={{
                background: "rgba(255,255,255,.12)",
                border: "1px solid rgba(255,255,255,.2)",
                borderRadius: 12,
                padding: "8px 10px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "rgba(255,255,255,.65)",
                  textTransform: "uppercase",
                  marginBottom: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                {m.icon} {m.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
