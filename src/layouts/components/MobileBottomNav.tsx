import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { theme } from "@/styles/theme";
import type { MenuItem } from "../lib/menu";

const C = theme;

interface MobileBottomNavProps {
  items: MenuItem[];
  activePath: string;
  onOpenMenu: () => void;
}

/** Barra de navegación fija al pie, visible solo en móvil: hasta 5 accesos + "Más". */
export function MobileBottomNav({ items, activePath, onOpenMenu }: MobileBottomNavProps) {
  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        height: 64,
        background: "rgba(255,255,255,.95)",
        backdropFilter: "blur(12px)",
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 4px",
        zIndex: 70,
      }}
    >
      {items.slice(0, 5).map((item) => {
        const Icon = item.icon;
        const active = activePath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              padding: "6px 10px",
              borderRadius: 12,
              textDecoration: "none",
              color: active ? "#FFFFFF" : C.textMuted,
              background: active ? C.primary : "transparent",
              boxShadow: active ? "0 4px 12px rgba(57,169,0,.35)" : "none",
              transition: "all .15s ease",
              minWidth: 52,
            }}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, whiteSpace: "nowrap" }}>
              {item.label.split(" ")[0]}
            </span>
          </Link>
        );
      })}
      <button
        onClick={onOpenMenu}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          padding: "6px 10px",
          borderRadius: 12,
          border: "none",
          background: "transparent",
          color: C.textMuted,
          cursor: "pointer",
          minWidth: 52,
        }}
      >
        <Menu size={20} strokeWidth={1.7} />
        <span style={{ fontSize: 10, fontWeight: 500 }}>Más</span>
      </button>
    </nav>
  );
}
