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
  /** Cuántas cosas esperan a alguien en este módulo (solicitudes sin responder, incidentes
   *  sin atender). Con 0 no se pinta nada. */
  pendientes?: number;
}

/** Un enlace del menú lateral, con estado activo y modo colapsado (solo ícono). */
export function NavItem({ item, active, collapsed, onClick, pendientes = 0 }: NavItemProps) {
  const Icon = item.icon;
  const hayPendientes = pendientes > 0;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      title={
        hayPendientes
          ? `${item.label} — ${pendientes} sin atender`
          : collapsed ? item.label : undefined
      }
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
      <span style={{ position: "relative", display: "flex", flexShrink: 0 }}>
        <Icon size={17} />
        {/* Con el menú plegado no hay sitio para el número: queda el punto, que es lo que
            hace falta para saber que hay que entrar ahí. */}
        {hayPendientes && collapsed && (
          <span style={{
            position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%",
            background: C.amber, border: "1.5px solid #14310A",
          }} />
        )}
      </span>
      {!collapsed && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
      {!collapsed && hayPendientes && (
        <span style={{
          marginLeft: "auto", minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9,
          background: C.amber, color: "#1A1A1A", fontSize: 10, fontWeight: 900,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {pendientes > 99 ? "99+" : pendientes}
        </span>
      )}
      {!collapsed && active && !hayPendientes && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.6 }} />}
    </Link>
  );
}
