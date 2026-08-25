import { Menu, User } from "lucide-react";
import logoSena from "@/assets/images/logoSena.png";
import { SIDEBAR_GRADIENT, onDark } from "../lib/sidebarTheme";

interface MobileHeaderProps {
  onOpenMenu: () => void;
  onGoToPerfil: () => void;
}

/** Barra superior fija visible solo en móvil: abrir menú, logo, acceso a perfil. */
export function MobileHeader({ onOpenMenu, onGoToPerfil }: MobileHeaderProps) {
  return (
    <header
      className="mobile-header"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 60,
        background: SIDEBAR_GRADIENT,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        zIndex: 70,
        boxShadow: "0 2px 16px rgba(0,0,0,.12)",
      }}
    >
      <button
        onClick={onOpenMenu}
        style={{
          width: 38, height: 38,
          borderRadius: 10,
          border: `1px solid ${onDark.border}`,
          background: onDark.chipBg,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: onDark.text,
        }}
      >
        <Menu size={18} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 30, height: 30,
            borderRadius: 9,
            background: "#FFFFFF",
            border: "1px solid rgba(255,255,255,.6)",
            boxShadow: "0 2px 8px rgba(0,0,0,.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 4,
          }}
        >
          <img src={logoSena} alt="SENA" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <span style={{ fontWeight: 800, fontSize: 16, color: onDark.text, letterSpacing: "-0.03em" }}>
          ParkU
        </span>
      </div>

      <button
        onClick={onGoToPerfil}
        style={{
          width: 38, height: 38,
          borderRadius: 10,
          border: `1px solid ${onDark.border}`,
          background: onDark.chipBg,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: onDark.text,
        }}
      >
        <User size={17} />
      </button>
    </header>
  );
}
