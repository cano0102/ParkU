import React, { useState } from 'react';
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  LayoutDashboard,
  Users,
  ParkingCircle,
  UserCog,
  LogOut,
  ShieldCheck,
  ArrowLeftRight,
  Calendar,
  AlertTriangle,
  User,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import type { Rol } from '../services/api/roles';
import { theme } from '../theme';
import logoSena from "@/assets/images/logoSena.png";

/* ─── Design tokens (tema compartido, ver src/theme.ts) ─── */
const C = theme;

/* Superficie verde institucional del sidebar/topbar (en vez del blanco genérico
   de antes). El degradado + la marca de agua del pictograma le dan identidad
   SENA real en lugar del look "dashboard genérico" plano. */
const SIDEBAR_GRADIENT = 'linear-gradient(170deg, #2D7D00 0%, #1B4D00 100%)';
const onDark = {
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,.68)',
  textFaint: 'rgba(255,255,255,.46)',
  border: 'rgba(255,255,255,.16)',
  borderStrong: 'rgba(255,255,255,.28)',
  hoverBg: 'rgba(255,255,255,.1)',
  chipBg: 'rgba(255,255,255,.12)',
};

/* ─── Nav items ──────────────────────────────── */
const menuItems: {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  group: string;
  permission: keyof Rol['permisos'];
}[] = [
  { path: '/app/dashboard',    label: 'Dashboard',      icon: LayoutDashboard, group: 'principal', permission: 'dashboard' },
  { path: '/app/roles',        label: 'Roles',          icon: ShieldCheck,     group: 'admin',     permission: 'roles' },
  { path: '/app/usuarios',     label: 'Usuarios',       icon: Users,           group: 'admin',     permission: 'usuarios' },
  { path: '/app/conductores',  label: 'Conductores',    icon: UserCog,         group: 'admin',     permission: 'conductores' },
  { path: '/app/parqueaderos', label: 'Parqueaderos',   icon: ParkingCircle,   group: 'operacion', permission: 'parqueaderos' },
  { path: '/app/entrada-salida', label: 'Entrada / Salida', icon: ArrowLeftRight, group: 'operacion', permission: 'entradaSalida' },
  { path: '/app/reservas',     label: 'Reservas',       icon: Calendar,        group: 'operacion', permission: 'reservas' },
  { path: '/app/incidentes',   label: 'Incidentes',     icon: AlertTriangle,   group: 'operacion', permission: 'incidentes' },
];

const groups: Record<string, string> = {
  principal: 'Principal',
  admin:     'Administración',
  operacion: 'Operación',
};

const SIDEBAR_W = 256;

/* ─── Helpers ────────────────────────────────── */
function NavItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: typeof menuItems[0];
  active: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      to={item.path}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: collapsed ? '10px 0' : '9px 12px',
        borderRadius: 12,
        textDecoration: 'none',
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: active ? '#FFFFFF' : 'transparent',
        border: active ? '1px solid #FFFFFF' : '1px solid transparent',
        color: active ? C.primaryDark : onDark.textMuted,
        fontWeight: active ? 700 : 500,
        fontSize: 14,
        boxShadow: active ? '0 4px 12px rgba(0,0,0,.18)' : 'none',
        transition: 'all .18s ease',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = onDark.hoverBg;
          (e.currentTarget as HTMLElement).style.color = onDark.text;
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = onDark.textMuted;
        }
      }}
    >
      <Icon size={17} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
      {!collapsed && active && (
        <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: .6 }} />
      )}
    </Link>
  );
}

/* ─── Component ──────────────────────────────── */
export function MainLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const hideLayoutRoutes = ['/app/usuarios/editar', '/app/usuarios/nuevo'];
  const hideLayout = hideLayoutRoutes.some(r => location.pathname.startsWith(r));

  const sidebarWidth = collapsed ? 68 : SIDEBAR_W;

  /* solo se muestran las secciones que el rol del usuario tiene permitidas */
  const visibleMenuItems = menuItems.filter(item => hasPermission(item.permission));

  /* group items */
  const grouped = Object.entries(groups)
    .map(([key, label]) => ({
      key,
      label,
      items: visibleMenuItems.filter(m => m.group === key),
    }))
    .filter(g => g.items.length > 0);

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '20px 16px 16px',
        borderBottom: `1px solid ${onDark.border}`,
        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: 12,
          background: '#FFFFFF',
          border: '1px solid rgba(255,255,255,.6)',
          boxShadow: '0 3px 10px rgba(0,0,0,.22)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          padding: 6,
        }}>
          <img src={logoSena} alt="SENA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: onDark.text, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              ParkU
            </div>
            <div style={{ fontSize: 10, color: onDark.textMuted, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              SENA · Institucional
            </div>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{
              marginLeft: 'auto',
              width: 28, height: 28,
              borderRadius: 8,
              border: `1px solid ${onDark.border}`,
              background: onDark.chipBg,
              cursor: 'pointer',
              display: collapsed ? 'none' : 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: onDark.text,
              flexShrink: 0,
            }}
          >
            <Menu size={14} />
          </button>
        )}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              marginLeft: 'auto',
              width: 32, height: 32,
              borderRadius: 10,
              border: `1px solid ${onDark.border}`,
              background: onDark.chipBg,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: onDark.text,
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && !isMobile && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            margin: '12px auto 0',
            width: 36, height: 36,
            borderRadius: 10,
            border: `1px solid ${onDark.border}`,
            background: onDark.chipBg,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: onDark.text,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Menu size={15} />
        </button>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', position: 'relative', zIndex: 1 }}>
        {grouped.map(({ key, label, items }) => (
          <div key={key} style={{ marginBottom: 20 }}>
            {(!collapsed || isMobile) && (
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: onDark.textFaint,
                padding: '0 12px',
                marginBottom: 4,
              }}>
                {label}
              </div>
            )}
            {collapsed && !isMobile && (
              <div style={{
                height: 1,
                background: onDark.border,
                margin: '6px 8px 8px',
              }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {items.map(item => (
                <NavItem
                  key={item.path}
                  item={item}
                  active={location.pathname === item.path}
                  collapsed={collapsed && !isMobile}
                  onClick={isMobile ? () => setMobileOpen(false) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User card */}
      <div style={{
        margin: '0 10px 12px',
        borderRadius: 14,
        border: `1px solid ${onDark.border}`,
        background: onDark.chipBg,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>
        {(!collapsed || isMobile) ? (
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: 'rgba(255,255,255,.16)',
                border: `1px solid ${onDark.borderStrong}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User size={16} color={onDark.text} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: onDark.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.nombre}
                </div>
                <div style={{ fontSize: 11, color: onDark.textMuted, fontWeight: 500 }}>
                  {user?.rol}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => { navigate('/app/perfil'); if (isMobile) setMobileOpen(false); }}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 8,
                  border: `1px solid ${onDark.borderStrong}`,
                  background: 'rgba(255,255,255,.1)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  fontSize: 12, fontWeight: 600, color: onDark.text,
                }}
              >
                <User size={13} />
                Perfil
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,.28)',
                  background: '#DC2626',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  fontSize: 12, fontWeight: 600, color: '#fff',
                }}
              >
                <LogOut size={13} />
                Salir
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 6px' }}>
            <button
              onClick={() => navigate('/app/perfil')}
              title="Perfil"
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                border: `1px solid ${onDark.border}`,
                background: 'rgba(255,255,255,.1)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: onDark.text,
              }}
            >
              <User size={15} />
            </button>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,.28)',
                background: '#DC2626',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff',
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex' }}>

      {/* ── Desktop Sidebar ────────────────────── */}
      {!hideLayout && (
        <aside style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: sidebarWidth,
          background: SIDEBAR_GRADIENT,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 80,
          transition: 'width .22s cubic-bezier(.4,0,.2,1)',
          overflow: 'hidden',
          boxShadow: '2px 0 24px rgba(0,0,0,.1)',
        }}
        className="hidden-mobile-sidebar"
        >
          {/* Marca de agua institucional + resplandores decorativos */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.05)', top: -80, right: -90 }} />
            <img
              src={logoSena}
              alt=""
              style={{
                position: 'absolute', left: '50%', bottom: -46,
                width: 240, transform: 'translateX(-50%)',
                filter: 'brightness(0) invert(1)', opacity: .05,
              }}
            />
          </div>
          <SidebarContent />
        </aside>
      )}

      {/* ── Mobile overlay ─────────────────────── */}
      {!hideLayout && mobileOpen && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(13,31,5,.35)',
              backdropFilter: 'blur(2px)',
              zIndex: 110,
            }}
          />
          <aside style={{
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            width: SIDEBAR_W,
            background: SIDEBAR_GRADIENT,
            zIndex: 120,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 32px rgba(0,0,0,.25)',
            overflow: 'hidden',
          }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,.05)', top: -80, right: -90 }} />
              <img
                src={logoSena}
                alt=""
                style={{
                  position: 'absolute', left: '50%', bottom: -46,
                  width: 240, transform: 'translateX(-50%)',
                  filter: 'brightness(0) invert(1)', opacity: .05,
                }}
              />
            </div>
            <SidebarContent isMobile />
          </aside>
        </>
      )}

      {/* ── Mobile header ──────────────────────── */}
      {!hideLayout && (
        <header style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          height: 60,
          background: SIDEBAR_GRADIENT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 70,
          boxShadow: '0 2px 16px rgba(0,0,0,.12)',
          /* Only visible on mobile */
        }}
        className="mobile-header"
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              width: 38, height: 38,
              borderRadius: 10,
              border: `1px solid ${onDark.border}`,
              background: onDark.chipBg,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: onDark.text,
            }}
          >
            <Menu size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30,
              borderRadius: 9,
              background: '#FFFFFF',
              border: '1px solid rgba(255,255,255,.6)',
              boxShadow: '0 2px 8px rgba(0,0,0,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 4,
            }}>
              <img src={logoSena} alt="SENA" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: onDark.text, letterSpacing: '-0.03em' }}>
              ParkU
            </span>
          </div>

          <button
            onClick={() => navigate('/app/perfil')}
            style={{
              width: 38, height: 38,
              borderRadius: 10,
              border: `1px solid ${onDark.border}`,
              background: onDark.chipBg,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: onDark.text,
            }}
          >
            <User size={17} />
          </button>
        </header>
      )}

      {/* ── Main content ───────────────────────── */}
      <main style={{
        flex: 1,
        minHeight: '100vh',
        paddingTop: hideLayout ? 0 : undefined,
        paddingBottom: hideLayout ? 0 : undefined,
        paddingInline: hideLayout ? 0 : undefined,
      }}
      className={hideLayout ? '' : 'main-with-layout'}
      >
        <Outlet />
      </main>

      {/* ── Mobile bottom nav ──────────────────── */}
      {!hideLayout && (
        <nav
          className="mobile-bottom-nav"
          style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            height: 64,
            background: 'rgba(255,255,255,.95)',
            backdropFilter: 'blur(12px)',
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 4px',
            zIndex: 70,
          }}
        >
          {visibleMenuItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  padding: '6px 10px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  color: active ? '#FFFFFF' : C.textMuted,
                  background: active ? C.primary : 'transparent',
                  boxShadow: active ? '0 4px 12px rgba(57,169,0,.35)' : 'none',
                  transition: 'all .15s ease',
                  minWidth: 52,
                }}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
                <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
          {/* "Más" button for remaining items */}
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 10px',
              borderRadius: 12,
              border: 'none',
              background: 'transparent',
              color: C.textMuted,
              cursor: 'pointer',
              minWidth: 52,
            }}
          >
            <Menu size={20} strokeWidth={1.7} />
            <span style={{ fontSize: 10, fontWeight: 500 }}>Más</span>
          </button>
        </nav>
      )}

      {/* ── Responsive CSS ─────────────────────── */}
      <style>{`
        /* Desktop: show sidebar, hide mobile chrome */
        @media (min-width: 768px) {
          .mobile-header       { display: none !important; }
          .mobile-bottom-nav   { display: none !important; }
          .hidden-mobile-sidebar { display: flex !important; }
          .main-with-layout {
            margin-left: ${sidebarWidth}px;
            transition: margin-left .22s cubic-bezier(.4,0,.2,1);
            padding-top: 28px;
            padding-bottom: 40px;
            padding-inline: 28px;
          }
        }

        /* Mobile: hide sidebar, show header + bottom nav */
        @media (max-width: 767px) {
          .hidden-mobile-sidebar { display: none !important; }
          .mobile-header       { display: flex !important; }
          .mobile-bottom-nav   { display: flex !important; }
          .main-with-layout {
            padding-top: 76px;
            padding-bottom: 80px;
            padding-inline: 0;
          }
        }

        * { box-sizing: border-box; }

        /* Scrollbar for sidebar */
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,.25); border-radius: 99px; }

        /* Status indicator pulse */
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: .4; }
        }
      `}</style>
    </div>
  );
}