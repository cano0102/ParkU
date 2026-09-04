import { Link } from "react-router-dom";
import { IconChevronRight as ChevronRight } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { onDark } from "../lib/sidebarTheme";
import type { MenuItem } from "../lib/menu";

const C = theme;

interface NavItemProps {
  item: MenuItem;
  active: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

/** Un enlace del menú lateral, con estado activo y modo colapsado (solo ícono). */
export function NavItem({ item, active, collapsed, onClick }: NavItemProps) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: collapsed ? "10px 0" : "9px 12px",
        borderRadius: 12,
        textDecoration: "none",
        justifyContent: collapsed ? "center" : "flex-start",
        background: active ? "#FFFFFF" : "transparent",
        border: active ? "1px solid #FFFFFF" : "1px solid transparent",
        color: active ? C.primaryDark : onDark.textMuted,
        fontWeight: active ? 700 : 500,
        fontSize: 14,
        boxShadow: active ? "0 4px 12px rgba(0,0,0,.18)" : "none",
        transition: "all .18s ease",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = onDark.hoverBg;
          (e.currentTarget as HTMLElement).style.color = onDark.text;
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = onDark.textMuted;
        }
      }}
    >
      <Icon size={17} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
      {!collapsed && active && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.6 }} />}
    </Link>
  );
}
