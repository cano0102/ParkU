import { IconMenu2 as Menu, IconX as X } from "@tabler/icons-react";
import logoSena from "@/assets/images/logoSena.png";
import { onDark } from "../lib/sidebarTheme";

interface SidebarHeaderProps {
  isMobile: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}

/** Logo + nombre + botón de colapsar (desktop) o cerrar (móvil), y el botón de expandir cuando está colapsado. */
export function SidebarHeader({ isMobile, collapsed, onToggleCollapsed, onCloseMobile }: SidebarHeaderProps) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "20px 16px 16px",
          borderBottom: `1px solid ${onDark.border}`,
          justifyContent: collapsed && !isMobile ? "center" : "flex-start",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 38, height: 38,
            borderRadius: 12,
            background: "#FFFFFF",
            border: "1px solid rgba(255,255,255,.6)",
            boxShadow: "0 3px 10px rgba(0,0,0,.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            padding: 6,
          }}
        >
          <img src={logoSena} alt="SENA" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: onDark.text, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              ParkU
            </div>
            <div style={{ fontSize: 10, color: onDark.textMuted, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>
              SENA · Institucional
            </div>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={onToggleCollapsed}
            style={{
              marginLeft: "auto",
              width: 28, height: 28,
              borderRadius: 8,
              border: `1px solid ${onDark.border}`,
              background: onDark.chipBg,
              cursor: "pointer",
              display: collapsed ? "none" : "flex",
              alignItems: "center", justifyContent: "center",
              color: onDark.text,
              flexShrink: 0,
            }}
          >
            <Menu size={14} />
          </button>
        )}
        {isMobile && (
          <button
            onClick={onCloseMobile}
            style={{
              marginLeft: "auto",
              width: 32, height: 32,
              borderRadius: 10,
              border: `1px solid ${onDark.border}`,
              background: onDark.chipBg,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: onDark.text,
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {collapsed && !isMobile && (
        <button
          onClick={onToggleCollapsed}
          style={{
            margin: "12px auto 0",
            width: 36, height: 36,
            borderRadius: 10,
            border: `1px solid ${onDark.border}`,
            background: onDark.chipBg,
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: onDark.text,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Menu size={15} />
        </button>
      )}
    </>
  );
}
