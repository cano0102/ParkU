import { useNavigate } from "react-router-dom";
import type { MenuItem } from "../lib/menu";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav } from "./SidebarNav";
import { SidebarUserCard } from "./SidebarUserCard";

interface SidebarProps {
  isMobile?: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
  grouped: { key: string; label: string; items: MenuItem[] }[];
  activePath: string;
  userName?: string;
  userRol?: string;
  onLogout: () => void;
}

/** Contenido completo del sidebar: logo, navegación agrupada y tarjeta de usuario. */
export function Sidebar({ isMobile = false, collapsed, onToggleCollapsed, onCloseMobile, grouped, activePath, userName, userRol, onLogout }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <SidebarHeader isMobile={isMobile} collapsed={collapsed} onToggleCollapsed={onToggleCollapsed} onCloseMobile={onCloseMobile} />
      <SidebarNav grouped={grouped} activePath={activePath} isMobile={isMobile} collapsed={collapsed} onNavigate={isMobile ? onCloseMobile : undefined} />
      <SidebarUserCard
        userName={userName}
        userRol={userRol}
        isMobile={isMobile}
        collapsed={collapsed}
        onGoToPerfil={() => { navigate("/app/perfil"); if (isMobile) onCloseMobile(); }}
        onLogout={onLogout}
      />
    </div>
  );
}
