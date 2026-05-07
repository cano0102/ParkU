import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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

const menuItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/app/roles', label: 'Roles', icon: ShieldCheck },
  { path: '/app/usuarios', label: 'Usuarios', icon: Users },
  { path: '/app/conductores', label: 'Conductores', icon: UserCog },
  { path: '/app/vehiculos', label: 'Vehículos', icon: Car },
  { path: '/app/parqueaderos', label: 'Parqueaderos', icon: ParkingCircle },
  { path: '/app/celdas', label: 'Celdas', icon: Grid3x3 },
  { path: '/app/asignaciones', label: 'Asignación de Celdas', icon: CarFront },
  { path: '/app/entrada-salida', label: 'Entrada y Salida', icon: ArrowLeftRight },
  { path: '/app/reservas', label: 'Reservas', icon: Calendar },
  { path: '/app/incidentes', label: 'Incidentes', icon: AlertTriangle },
  { path: '/app/reconocimiento-placas', label: 'Reconocimiento de Placas', icon: Camera },
];

const SENA_GREEN = '#009e3d';

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: "'Barlow', sans-serif" }}>

      {/* ── HEADER ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#080808',
        borderBottom: `3px solid ${SENA_GREEN}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.5rem', height: 64,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#666', padding: 6, borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => e.currentTarget.style.color = SENA_GREEN}
            onMouseLeave={e => e.currentTarget.style.color = '#666'}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, background: SENA_GREEN, borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ParkingCircle size={20} color="#fff" />
            </div>
            <div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 900, fontSize: 18, color: '#fff',
                letterSpacing: 1, lineHeight: 1,
              }}>
                <span style={{ color: SENA_GREEN }}>SENA</span> · ParkU
              </div>
              <div style={{ fontSize: 10, color: '#555', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                Sistema de Parqueadero
              </div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right', display: window.innerWidth < 640 ? 'none' : 'block' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8' }}>{user?.nombre}</div>
            <div style={{ fontSize: 11, color: '#555', letterSpacing: 1, textTransform: 'uppercase' }}>{user?.rol}</div>
          </div>

          <button
            onClick={() => navigate('/app/perfil')}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', color: '#888', padding: 8, borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = SENA_GREEN; e.currentTarget.style.borderColor = SENA_GREEN; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            title="Mi Perfil"
          >
            <User size={16} />
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(212,24,61,0.1)', border: '1px solid rgba(212,24,61,0.2)',
              cursor: 'pointer', color: '#d4183d', padding: 8, borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,24,61,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,24,61,0.1)'; }}
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', paddingTop: 64 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          position: 'fixed', top: 64, left: 0,
          height: 'calc(100vh - 64px)',
          width: sidebarOpen ? 240 : 0,
          background: '#080808',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
          zIndex: 40,
        }}>
          <nav style={{ padding: '1rem 0', overflowY: 'auto', height: '100%' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px',
                    margin: '1px 8px',
                    borderRadius: 4,
                    textDecoration: 'none',
                    fontSize: 13, fontWeight: isActive ? 700 : 500,
                    letterSpacing: 0.3,
                    color: isActive ? '#fff' : '#666',
                    background: isActive ? 'rgba(0,158,61,0.15)' : 'transparent',
                    borderLeft: isActive ? `3px solid ${SENA_GREEN}` : '3px solid transparent',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#e8e8e8';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#666';
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                  onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false); }}
                >
                  <Icon size={15} color={isActive ? SENA_GREEN : undefined} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                  {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto', color: SENA_GREEN }} />}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: '#080808',
          }}>
            <div style={{ fontSize: 10, color: '#333', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center' }}>
              © 2026 ParkU SENA
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{
          flex: 1,
          marginLeft: sidebarOpen ? 240 : 0,
          transition: 'margin-left 0.2s ease',
          minHeight: 'calc(100vh - 64px)',
          padding: '2rem 2.5rem',
          background: '#0a0a0a',
        }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 30, top: 64,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}