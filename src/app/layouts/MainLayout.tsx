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
  Grid3x3,
  UserCog,
  CarFront,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ArrowLeftRight,
  Calendar,
  AlertTriangle,
  Camera,
  User,
  ChevronRight,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#39A900',
  primaryDark: '#2D7D00',
  background: '#F5F7F8',
  surface: '#FFFFFF',
  text: '#0F172A',
  textLight: '#64748B',
  border: '#E2E8F0',
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

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

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

  return (
    <div
      style={{
        minHeight: '100vh',
        background: COLORS.background,
        fontFamily: "'Montserrat', sans-serif",
      }}
    >
      {/* HEADER */}

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 82,
          background: 'rgba(255,255,255,.92)',
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
        }}
      >
        {/* LEFT */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <button
            onClick={() =>
              setSidebarOpen(!sidebarOpen)
            }
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              border: `1px solid ${COLORS.border}`,
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.textLight,
              transition: '.2s ease',
            }}
          >
            {sidebarOpen ? (
              <X size={18} />
            ) : (
              <Menu size={18} />
            )}
          </button>

          {/* LOGO */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                background:
                  'linear-gradient(135deg,#39A900,#2D7D00)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  '0 10px 25px rgba(57,169,0,.25)',
              }}
            >
              <ParkingCircle
                size={26}
                color="#fff"
              />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 20,
                  color: COLORS.text,
                }}
              >
                ParkU
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: COLORS.textLight,
                  fontWeight: 600,
                }}
              >
                Sistema Institucional SENA
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              textAlign: 'right',
            }}
          >
            <div
              style={{
                fontWeight: 800,
                color: COLORS.text,
                fontSize: 14,
              }}
            >
              {user?.nombre}
            </div>

            <div
              style={{
                color: COLORS.textLight,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {user?.rol}
            </div>
          </div>

          {/* PERFIL */}

          <button
            onClick={() =>
              navigate('/app/perfil')
            }
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              border: `1px solid ${COLORS.border}`,
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.textLight,
              transition: '.25s ease',
            }}
          >
            <User size={18} />
          </button>

          {/* LOGOUT */}

          <button
            onClick={handleLogout}
            style={{
              width: 46,
              height: 46,
              borderRadius: 16,
              border: 'none',
              background: '#FEE2E2',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626',
              transition: '.25s ease',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* BODY */}

      <div
        style={{
          display: 'flex',
          paddingTop: 82,
        }}
      >
        {/* SIDEBAR */}

        <aside
          style={{
            position: 'fixed',
            left: 0,
            top: 82,
            width: sidebarOpen ? 280 : 0,
            height: 'calc(100vh - 82px)',
            background: '#fff',
            borderRight: `1px solid ${COLORS.border}`,
            overflow: 'hidden',
            transition: '.25s ease',
            zIndex: 40,
          }}
        >
          <div
            style={{
              padding: '1.5rem 1rem',
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                color: COLORS.primary,
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: 1,
                marginBottom: '1rem',
              }}
            >
              NAVEGACIÓN
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    marginBottom: 8,
                    borderRadius: 18,
                    textDecoration: 'none',
                    background: isActive
                      ? '#E8F5E1'
                      : 'transparent',
                    color: isActive
                      ? COLORS.primaryDark
                      : COLORS.textLight,
                    fontWeight: isActive
                      ? 800
                      : 600,
                    transition: '.25s ease',
                  }}
                >
                  <Icon
                    size={18}
                    color={
                      isActive
                        ? COLORS.primary
                        : COLORS.textLight
                    }
                  />

                  <span
                    style={{
                      flex: 1,
                    }}
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <ChevronRight
                      size={16}
                      color={COLORS.primary}
                    />
                  )}
                </Link>
              );
            })}

            {/* FOOTER */}

            <div
              style={{
                marginTop: '2rem',
                padding: '1rem',
                borderRadius: 22,
                background:
                  'linear-gradient(135deg,#39A900,#2D7D00)',
                color: '#fff',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  marginBottom: 6,
                }}
              >
                ParkU · SENA
              </div>

              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  opacity: 0.9,
                }}
              >
                Plataforma institucional de
                gestión inteligente de
                parqueaderos.
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}

        <main
          style={{
            flex: 1,
            marginLeft: sidebarOpen ? 280 : 0,
            transition: '.25s ease',
            padding: '2rem',
            minHeight: 'calc(100vh - 82px)',
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* MOBILE OVERLAY */}

      {sidebarOpen &&
        window.innerWidth < 1024 && (
          <div
            onClick={() =>
              setSidebarOpen(false)
            }
            style={{
              position: 'fixed',
              inset: 0,
              background:
                'rgba(15,23,42,.45)',
              zIndex: 30,
            }}
          />
        )}
    </div>
  );
}