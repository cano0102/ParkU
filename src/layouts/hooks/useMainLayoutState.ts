import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useReservaAutoExpiry } from "@/features/reservas";
import { groups, HIDE_LAYOUT_ROUTES, menuItems, SIDEBAR_W } from "../lib/menu";

/** Estado del layout: sidebar colapsado/móvil, rutas sin chrome, menú visible según permisos. */
export function useMainLayoutState() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  useReservaAutoExpiry();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const hideLayout = HIDE_LAYOUT_ROUTES.some((r) => location.pathname.startsWith(r));
  const sidebarWidth = collapsed ? 68 : SIDEBAR_W;

  // Solo se muestran las secciones que el rol del usuario tiene permitidas
  const visibleMenuItems = menuItems.filter((item) => hasPermission(item.permission));

  const grouped = Object.entries(groups)
    .map(([key, label]) => ({
      key,
      label,
      items: visibleMenuItems.filter((m) => m.group === key),
    }))
    .filter((g) => g.items.length > 0);

  return {
    location, navigate, user, hasPermission, handleLogout,
    mobileOpen, setMobileOpen, collapsed, setCollapsed,
    hideLayout, sidebarWidth, visibleMenuItems, grouped,
  };
}
