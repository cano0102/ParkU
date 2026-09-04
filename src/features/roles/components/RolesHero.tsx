import { IconShieldCheck as ShieldCheck } from "@tabler/icons-react";

interface RolesHeroProps {
  stats: {
    activos: number;
    protegidos: number;
    permisos: number;
    total: number;
  };
}

/** Banner superior de la página de Roles con las pastillas de estadísticas. */
export function RolesHero({ stats }: RolesHeroProps) {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        background: "linear-gradient(135deg,#39A900,#2D7D00)",
        padding: "1.4rem 1.6rem",
        color: "#fff",
      }}
    >
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
            <ShieldCheck size={11} /> Seguridad y permisos
          </div>
          <h1
            style={{
              fontSize: "clamp(1.6rem,3vw,2.2rem)",
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            Gestión de Roles
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
            Administra accesos, permisos y niveles de seguridad.
          </p>
        </div>

        <div
          className="roles-hero-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 8,
            minWidth: 280,
            maxWidth: 420,
          }}
        >
          {[
            { label: "Activos", value: stats.activos },
            { label: "Protegidos", value: stats.protegidos },
            { label: "Permisos", value: stats.permisos },
            { label: "Total", value: stats.total },
          ].map((s) => (
            <div
              key={s.label}
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
                }}
              >
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
