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
  Car,
  ParkingCircle,
  UserCog,
  LogOut,
  ShieldCheck,
  ArrowLeftRight,
  Calendar,
  AlertTriangle,
  User,
  Clock3,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

/* ─── Design tokens ─────────────────────────── */
const C = {
  primary:       '#2F8F00',
  primaryDark:   '#1E6000',
  primaryLight:  '#E8F5E1',
  primaryBorder: '#C5E0AD',

  bg:            '#F4F7F2',
  surface:       '#FFFFFF',
  surfaceHover:  '#F8FBF6',

  text:          '#0D1F05',
  textSoft:      '#4B6642',
  textMuted:     '#8FA884',

  border:        '#E2EBD9',
  borderStrong:  '#C9DAC0',

  danger:        '#C92020',
  dangerBg:      '#FFF0F0',
  dangerBorder:  '#FAC5C5',
};

/* ─── Nav items ──────────────────────────────── */
const menuItems = [
  { path: '/app/dashboard',    label: 'Dashboard',      icon: LayoutDashboard, group: 'principal' },
  { path: '/app/roles',        label: 'Roles',          icon: ShieldCheck,     group: 'admin' },
  { path: '/app/usuarios',     label: 'Usuarios',       icon: Users,           group: 'admin' },
  { path: '/app/conductores',  label: 'Conductores',    icon: UserCog,         group: 'admin' },
  { path: '/app/vehiculos',    label: 'Vehículos',      icon: Car,             group: 'operacion' },
  { path: '/app/parqueaderos', label: 'Parqueaderos',   icon: ParkingCircle,   group: 'operacion' },
  { path: '/app/entrada-salida', label: 'Entrada / Salida', icon: ArrowLeftRight, group: 'operacion' },
  { path: '/app/reservas',     label: 'Reservas',       icon: Calendar,        group: 'operacion' },
  { path: '/app/incidentes',   label: 'Incidentes',     icon: AlertTriangle,   group: 'operacion' },
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
        background: active ? C.primaryLight : 'transparent',
        border: active ? `1px solid ${C.primaryBorder}` : '1px solid transparent',
        color: active ? C.primary : C.textSoft,
        fontWeight: active ? 600 : 500,
        fontSize: 14,
        transition: 'all .18s ease',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = C.surfaceHover;
          (e.currentTarget as HTMLElement).style.color = C.text;
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = C.textSoft;
        }
      }}
    >
      {/* Active indicator bar */}
      {active && !collapsed && (
        <span style={{
          position: 'absolute',
          left: 0, top: '50%',
          transform: 'translateY(-50%)',
          width: 3, height: 20,
          borderRadius: 99,
          background: C.primary,
        }} />
      )}
      <Icon size={17} style={{ flexShrink: 0 }} />
      {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
      {!collapsed && active && (
        <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: .5 }} />
      )}
    </Link>
  );
}

/* ─── Component ──────────────────────────────── */
export function MainLayout() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,  setCollapsed]  = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleLogout = () => { logout(); navigate('/login'); };

  const hideLayoutRoutes = ['/app/usuarios/editar', '/app/usuarios/nuevo'];
  const hideLayout = hideLayoutRoutes.some(r => location.pathname.startsWith(r));

  const sidebarWidth = collapsed ? 68 : SIDEBAR_W;

  /* group items */
  const grouped = Object.entries(groups).map(([key, label]) => ({
    key,
    label,
    items: menuItems.filter(m => m.group === key),
  }));

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '20px 16px 16px',
        borderBottom: `1px solid ${C.border}`,
        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 38, height: 38,
          borderRadius: 12,
          background: C.primaryLight,
          border: `1px solid ${C.primaryBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ParkingCircle size={20} color={C.primary} />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: C.text, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              ParkU
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 500, letterSpacing: '.02em', textTransform: 'uppercase' }}>
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
              border: `1px solid ${C.border}`,
              background: C.surface,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.textMuted,
              flexShrink: 0,
              display: collapsed ? 'none' : 'flex',
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
              border: `1px solid ${C.border}`,
              background: C.surface,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.textMuted,
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
            border: `1px solid ${C.border}`,
            background: C.surface,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.textMuted,
          }}
        >
          <Menu size={15} />
        </button>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {grouped.map(({ key, label, items }) => (
          <div key={key} style={{ marginBottom: 20 }}>
            {(!collapsed || isMobile) && (
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: C.textMuted,
                padding: '0 12px',
                marginBottom: 4,
              }}>
                {label}
              </div>
            )}
            {collapsed && !isMobile && (
              <div style={{
                height: 1,
                background: C.border,
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
        border: `1px solid ${C.border}`,
        background: C.bg,
        overflow: 'hidden',
      }}>
        {(!collapsed || isMobile) ? (
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: C.primaryLight,
                border: `1px solid ${C.primaryBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <User size={16} color={C.primary} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.nombre}
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>
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
                  border: `1px solid ${C.borderStrong}`,
                  background: C.surface,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  fontSize: 12, fontWeight: 600, color: C.textSoft,
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
                  border: `1px solid ${C.dangerBorder}`,
                  background: C.dangerBg,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  fontSize: 12, fontWeight: 600, color: C.danger,
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
                border: `1px solid ${C.border}`,
                background: C.surface,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.textSoft,
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
                border: `1px solid ${C.dangerBorder}`,
                background: C.dangerBg,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.danger,
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
          background: C.surface,
          borderRight: `1px solid ${C.border}`,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 80,
          transition: 'width .22s cubic-bezier(.4,0,.2,1)',
          overflow: 'hidden',
          /* Hide on mobile */
          '@media (max-width: 767px)': { display: 'none' },
        }}
        className="hidden-mobile-sidebar"
        >
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
            background: C.surface,
            borderRight: `1px solid ${C.border}`,
            zIndex: 120,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 32px rgba(0,0,0,.12)',
          }}>
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
          background: 'rgba(255,255,255,.92)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 70,
          /* Only visible on mobile */
        }}
        className="mobile-header"
        >
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              width: 38, height: 38,
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.surface,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.textSoft,
            }}
          >
            <Menu size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30,
              borderRadius: 9,
              background: C.primaryLight,
              border: `1px solid ${C.primaryBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ParkingCircle size={16} color={C.primary} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: C.text, letterSpacing: '-0.03em' }}>
              ParkU
            </span>
          </div>

          <button
            onClick={() => navigate('/app/perfil')}
            style={{
              width: 38, height: 38,
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: C.primaryLight,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.primary,
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
          {menuItems.slice(0, 5).map(item => {
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
                  color: active ? C.primary : C.textMuted,
                  background: active ? C.primaryLight : 'transparent',
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
        nav::-webkit-scrollbar-thumb { background: ${C.borderStrong}; border-radius: 99px; }

        /* Status indicator pulse */
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: .4; }
        }
      `}</style>
    </div>
  );
}