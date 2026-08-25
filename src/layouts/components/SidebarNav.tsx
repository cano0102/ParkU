import { onDark } from "../lib/sidebarTheme";
import type { MenuItem } from "../lib/menu";
import { NavItem } from "./NavItem";

interface SidebarNavProps {
  grouped: { key: string; label: string; items: MenuItem[] }[];
  activePath: string;
  isMobile: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

/** Lista de enlaces del menú, agrupada por sección (Principal/Administración/Operación). */
export function SidebarNav({ grouped, activePath, isMobile, collapsed, onNavigate }: SidebarNavProps) {
  return (
    <nav style={{ flex: 1, padding: "12px 10px", position: "relative", zIndex: 1 }}>
      {grouped.map(({ key, label, items }) => (
        <div key={key} style={{ marginBottom: 20 }}>
          {(!collapsed || isMobile) && (
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: onDark.textFaint,
                padding: "0 12px",
                marginBottom: 4,
              }}
            >
              {label}
            </div>
          )}
          {collapsed && !isMobile && (
            <div style={{ height: 1, background: onDark.border, margin: "6px 8px 8px" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {items.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                active={activePath === item.path}
                collapsed={collapsed && !isMobile}
                onClick={isMobile ? onNavigate : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
