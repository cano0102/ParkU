import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
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
  ClipboardList,
  AlertTriangle,
  Camera,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

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

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Protección de ruta: Redirigir al login si no está autenticado
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <ParkingCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">ParkU</h1>
                <p className="text-xs text-gray-500">Sistema de Parqueadero</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.nombre}</p>
              <p className="text-xs text-gray-500">{user?.rol}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/perfil')}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200
            transition-transform duration-300 z-40
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            w-64
          `}
        >
          <nav className="p-4 space-y-1 overflow-y-auto h-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-green-50 text-green-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden top-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}