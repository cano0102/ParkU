import React from 'react';

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
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#2F8F00',
  primarySoft: '#F1F8EC',
  primaryBorder: '#DCEFD0',

  background: '#F6F8FA',

  text: '#0F172A',
  textSoft: '#475569',
  textMuted: '#94A3B8',

  border: '#E5E7EB',

  dangerBg: '#FEF2F2',
  danger: '#DC2626',
};

const menuItems = [
  {
    path: '/app/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/app/roles',
    label: 'Roles',
    icon: ShieldCheck,
  },
  {
    path: '/app/usuarios',
    label: 'Usuarios',
    icon: Users,
  },
  {
    path: '/app/conductores',
    label: 'Conductores',
    icon: UserCog,
  },
  {
    path: '/app/vehiculos',
    label: 'Vehículos',
    icon: Car,
  },
  {
    path: '/app/parqueaderos',
    label: 'Parqueaderos',
    icon: ParkingCircle,
  },
  {
    path: '/app/entrada-salida',
    label: 'Entrada / Salida',
    icon: ArrowLeftRight,
  },
  {
    path: '/app/reservas',
    label: 'Reservas',
    icon: Calendar,
  },
  {
    path: '/app/incidentes',
    label: 'Incidentes',
    icon: AlertTriangle,
  },
];

export function MainLayout() {
  const location = useLocation();

  const navigate = useNavigate();

  const {
    user,
    logout,
    isAuthenticated,
  } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();

    navigate('/login');
  };

  /*
    RUTAS DONDE QUIERES OCULTAR
    HEADER + MENU FLOTANTE
  */

  const hideLayoutRoutes = [
    '/app/usuarios/editar',
    '/app/usuarios/nuevo',
  ];

  const hideLayout =
    hideLayoutRoutes.some((route) =>
      location.pathname.startsWith(route),
    );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.background,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* HEADER */}

      {!hideLayout && (
        <header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,

            height: 74,

            background:
              'rgba(255,255,255,.85)',

            backdropFilter: 'blur(10px)',

            borderBottom: `1px solid ${COLORS.border}`,

            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',

            padding: '0 1.5rem',
          }}
        >
          {/* LEFT */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,

                borderRadius: 14,

                background:
                  COLORS.primarySoft,

                border: `1px solid ${COLORS.primaryBorder}`,

                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',
              }}
            >
              <ParkingCircle
                size={22}
                color={COLORS.primary}
              />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,

                  fontSize: 18,

                  color: COLORS.text,

                  letterSpacing:
                    '-0.02em',
                }}
              >
                ParkU
              </div>

              <div
                style={{
                  fontSize: 12,

                  color:
                    COLORS.textMuted,

                  fontWeight: 500,
                }}
              >
                Gestión institucional
                SENA
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.8rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,

                padding: '8px 12px',

                borderRadius: 999,

                background:
                  COLORS.primarySoft,

                border: `1px solid ${COLORS.primaryBorder}`,
              }}
            >
              <Clock3
                size={14}
                color={COLORS.primary}
              />

              <span
                style={{
                  fontSize: 12,

                  color:
                    COLORS.primary,

                  fontWeight: 600,
                }}
              >
                Sistema operativo
              </span>
            </div>

            <div
              style={{
                textAlign: 'right',
              }}
            >
              <div
                style={{
                  fontWeight: 600,

                  color: COLORS.text,

                  fontSize: 14,
                }}
              >
                {user?.nombre}
              </div>

              <div
                style={{
                  color:
                    COLORS.textMuted,

                  fontSize: 12,

                  fontWeight: 500,
                }}
              >
                {user?.rol}
              </div>
            </div>

            <button
              onClick={() =>
                navigate('/app/perfil')
              }
              style={{
                width: 42,
                height: 42,

                borderRadius: 12,

                border: `1px solid ${COLORS.border}`,

                background: '#fff',

                cursor: 'pointer',

                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',

                color: COLORS.textSoft,
              }}
            >
              <User size={17} />
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: 42,
                height: 42,

                borderRadius: 12,

                border: 'none',

                background:
                  COLORS.dangerBg,

                cursor: 'pointer',

                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'center',

                color: COLORS.danger,
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
      )}

      {/* MAIN */}

      <main
        style={{
          paddingTop: hideLayout
            ? 0
            : 100,

          paddingBottom: hideLayout
            ? 0
            : 120,

          paddingInline: hideLayout
            ? 0
            : '1.8rem',

          minHeight: '100vh',
        }}
      >
        <Outlet />
      </main>

      {/* FLOATING NAVIGATION */}

      {!hideLayout && (
        <div
          style={{
            position: 'fixed',

            left: '50%',

            bottom: 24,

            transform:
              'translateX(-50%)',

            zIndex: 90,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,

              padding: '10px',

              background:
                'rgba(255,255,255,.88)',

              backdropFilter:
                'blur(14px)',

              border: `1px solid ${COLORS.border}`,

              borderRadius: 22,

              boxShadow:
                '0 10px 30px rgba(15,23,42,.08)',
            }}
          >
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                location.pathname ===
                item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  style={{
                    width: isActive
                      ? 120
                      : 46,

                    height: 46,

                    borderRadius: 16,

                    overflow: 'hidden',

                    textDecoration:
                      'none',

                    background:
                      isActive
                        ? COLORS.primary
                        : 'transparent',

                    color: isActive
                      ? '#fff'
                      : COLORS.textSoft,

                    transition:
                      '.25s ease',

                    display: 'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    gap: 10,

                    padding:
                      '0 14px',
                  }}
                >
                  <Icon size={18} />

                  {isActive && (
                    <span
                      style={{
                        fontSize: 13,

                        fontWeight: 600,

                        whiteSpace:
                          'nowrap',
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}