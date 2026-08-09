import { Shield, Users, UserCheck, UserX } from "lucide-react";

interface UsuariosStatsProps {
  total: number;
  activos: number;
  inactivos: number;
  rolesCount: number;
}

export function UsuariosStats({ total, activos, inactivos, rolesCount }: UsuariosStatsProps) {
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
            <Shield size={11} /> Gestión institucional
          </div>
          <h1
            style={{
              fontSize: "clamp(1.6rem,3vw,2.2rem)",
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            Gestión de Usuarios
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
            Administra cuentas, accesos, roles y permisos del sistema.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 8,
            minWidth: 280,
          }}
        >
          {[
            { label: "Total", value: total, icon: <Users size={11} /> },
            { label: "Activos", value: activos, icon: <UserCheck size={11} /> },
            { label: "Inactivos", value: inactivos, icon: <UserX size={11} /> },
            { label: "Roles", value: rolesCount, icon: <Shield size={11} /> },
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                {s.icon} {s.label}
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
