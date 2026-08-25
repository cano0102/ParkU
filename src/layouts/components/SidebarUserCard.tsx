import { LogOut, User } from "lucide-react";
import { onDark } from "../lib/sidebarTheme";

interface SidebarUserCardProps {
  userName?: string;
  userRol?: string;
  isMobile: boolean;
  collapsed: boolean;
  onGoToPerfil: () => void;
  onLogout: () => void;
}

/** Tarjeta del usuario actual al pie del sidebar: perfil + cerrar sesión. */
export function SidebarUserCard({ userName, userRol, isMobile, collapsed, onGoToPerfil, onLogout }: SidebarUserCardProps) {
  const expanded = !collapsed || isMobile;

  return (
    <div
      style={{
        margin: "0 10px 12px",
        borderRadius: 14,
        border: `1px solid ${onDark.border}`,
        background: onDark.chipBg,
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}
    >
      {expanded ? (
        <div style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: "rgba(255,255,255,.16)",
                border: `1px solid ${onDark.borderStrong}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <User size={16} color={onDark.text} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: onDark.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userName}
              </div>
              <div style={{ fontSize: 11, color: onDark.textMuted, fontWeight: 500 }}>
                {userRol}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={onGoToPerfil}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 8,
                border: `1px solid ${onDark.borderStrong}`,
                background: "rgba(255,255,255,.1)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                fontSize: 12, fontWeight: 600, color: onDark.text,
              }}
            >
              <User size={13} />
              Perfil
            </button>
            <button
              onClick={onLogout}
              style={{
                flex: 1,
                height: 32,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,.28)",
                background: "#DC2626",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                fontSize: 12, fontWeight: 600, color: "#fff",
              }}
            >
              <LogOut size={13} />
              Salir
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 6px" }}>
          <button
            onClick={onGoToPerfil}
            title="Perfil"
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              border: `1px solid ${onDark.border}`,
              background: "rgba(255,255,255,.1)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: onDark.text,
            }}
          >
            <User size={15} />
          </button>
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,.28)",
              background: "#DC2626",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
