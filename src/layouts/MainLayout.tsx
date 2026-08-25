import { Outlet } from "react-router-dom";
import { theme } from "@/styles/theme";
import { nombreDeRol } from "@/services/core/roles";
import { useMainLayoutState } from "./hooks/useMainLayoutState";
import { mainLayoutStyles } from "./lib/styles";
import { SIDEBAR_GRADIENT } from "./lib/sidebarTheme";
import { SIDEBAR_W } from "./lib/menu";
import { Sidebar } from "./components/Sidebar";
import { SidebarWatermark } from "./components/SidebarWatermark";
import { MobileHeader } from "./components/MobileHeader";
import { MobileBottomNav } from "./components/MobileBottomNav";

const C = theme;

export function MainLayout() {
  const s = useMainLayoutState();

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex" }}>
      {/* ── Desktop Sidebar ────────────────────── */}
      {!s.hideLayout && (
        <aside
          className="hidden-mobile-sidebar"
          style={{
            position: "fixed",
            top: 0, left: 0, bottom: 0,
            width: s.sidebarWidth,
            background: SIDEBAR_GRADIENT,
            display: "flex",
            flexDirection: "column",
            zIndex: 80,
            transition: "width .22s cubic-bezier(.4,0,.2,1)",
            overflow: "hidden",
            boxShadow: "2px 0 24px rgba(0,0,0,.1)",
          }}
        >
          <SidebarWatermark />
          <Sidebar
            collapsed={s.collapsed}
            onToggleCollapsed={() => s.setCollapsed((v) => !v)}
            onCloseMobile={() => s.setMobileOpen(false)}
            grouped={s.grouped}
            activePath={s.location.pathname}
            userName={s.user?.nombre}
            userRol={s.user ? nombreDeRol(s.user.rol) : undefined}
            onLogout={s.handleLogout}
          />
        </aside>
      )}

      {/* ── Mobile overlay ─────────────────────── */}
      {!s.hideLayout && s.mobileOpen && (
        <>
          <div
            onClick={() => s.setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(13,31,5,.35)", backdropFilter: "blur(2px)", zIndex: 110 }}
          />
          <aside
            style={{
              position: "fixed",
              top: 0, left: 0, bottom: 0,
              width: SIDEBAR_W,
              background: SIDEBAR_GRADIENT,
              zIndex: 120,
              display: "flex",
              flexDirection: "column",
              boxShadow: "4px 0 32px rgba(0,0,0,.25)",
              overflow: "hidden",
            }}
          >
            <SidebarWatermark />
            <Sidebar
              isMobile
              collapsed={s.collapsed}
              onToggleCollapsed={() => s.setCollapsed((v) => !v)}
              onCloseMobile={() => s.setMobileOpen(false)}
              grouped={s.grouped}
              activePath={s.location.pathname}
              userName={s.user?.nombre}
              userRol={s.user ? nombreDeRol(s.user.rol) : undefined}
              onLogout={s.handleLogout}
            />
          </aside>
        </>
      )}

      {/* ── Mobile header ──────────────────────── */}
      {!s.hideLayout && (
        <MobileHeader onOpenMenu={() => s.setMobileOpen(true)} onGoToPerfil={() => s.navigate("/app/perfil")} />
      )}

      {/* ── Main content ───────────────────────── */}
      <main
        className={s.hideLayout ? "" : "main-with-layout"}
        style={{
          flex: 1,
          minHeight: "100vh",
          paddingTop: s.hideLayout ? 0 : undefined,
          paddingBottom: s.hideLayout ? 0 : undefined,
          paddingInline: s.hideLayout ? 0 : undefined,
        }}
      >
        <Outlet />
      </main>

      {/* ── Mobile bottom nav ──────────────────── */}
      {!s.hideLayout && (
        <MobileBottomNav items={s.visibleMenuItems} activePath={s.location.pathname} onOpenMenu={() => s.setMobileOpen(true)} />
      )}

      {/* ── Responsive CSS ─────────────────────── */}
      <style>{mainLayoutStyles(s.sidebarWidth)}</style>
    </div>
  );
}
