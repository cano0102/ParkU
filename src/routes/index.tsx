import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { NotFound } from './NotFound';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import Landing from '@/features/landing';
import { Login, Register, ForgotPassword, ResetPassword } from '@/features/auth';

/**
 * Envuelve `import()` para que un chunk que falla al descargarse (típico tras
 * un deploy nuevo: el navegador sigue teniendo cargado el `index.html`/router
 * viejo, que apunta a un archivo hasheado que el deploy actual ya no sirve —
 * "Failed to fetch dynamically imported module") recargue la página UNA vez
 * en vez de quedar en un error. La recarga trae el `index.html` actual, con
 * las referencias correctas a los chunks del build vigente. Si tras recargar
 * sigue fallando (caída real de red, no un deploy), ya no reintenta — se
 * deja propagar a `RouteErrorBoundary`.
 */
const CHUNK_RELOAD_KEY = 'parku-chunk-reload';

function lazyConReintento<T extends { default: React.ComponentType<any> }>(factory: () => Promise<T>) {
  return lazy(async () => {
    try {
      const modulo = await factory();
      // Un chunk que sí cargó bien limpia el flag: un reintento pasado no debe
      // impedir que una falla genuina *distinta*, más adelante, se recargue también.
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      return modulo;
    } catch (error) {
      const yaReintento = sessionStorage.getItem(CHUNK_RELOAD_KEY) === '1';
      if (!yaReintento) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
        window.location.reload();
        return new Promise<T>(() => {}); // la página se recarga; nunca debe resolver.
      }
      throw error;
    }
  });
}

/* Páginas autenticadas: se cargan bajo demanda, no en el bundle inicial */
const Dashboard = lazyConReintento(() => import('@/features/dashboard'));
const Roles = lazyConReintento(() => import('@/features/roles').then(m => ({ default: m.Roles })));
const Usuarios = lazyConReintento(() => import('@/features/usuarios'));
const Conductores = lazyConReintento(() => import('@/features/conductores').then(m => ({ default: m.Conductores })));
const Parqueaderos = lazyConReintento(() => import('@/features/parqueaderos'));
const ControlSalidaPage = lazyConReintento(() => import('@/features/controlSalida').then(m => ({ default: m.ControlSalidaPage })));
const Reservas = lazyConReintento(() => import('@/features/reservas').then(m => ({ default: m.Reservas })));
const Incidentes = lazyConReintento(() => import('@/features/incidentes').then(m => ({ default: m.Incidentes })));
const Perfil = lazyConReintento(() => import('@/features/perfil').then(m => ({ default: m.Perfil })));

export const router = createBrowserRouter([
  {
    index: true,
    element: <Landing />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/register',
    element: <Register />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    // Cubre también a todas las rutas hijas (dashboard/roles/usuarios/...):
    // si una de ellas lanza y no tiene su propio errorElement, burbujea hasta acá.
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute permission="dashboard">
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'perfil',
        element: <Perfil />,
      },
      {
        path: 'roles',
        element: (
          <ProtectedRoute permission="roles">
            <Roles />
          </ProtectedRoute>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <ProtectedRoute permission="usuarios">
            <Usuarios />
          </ProtectedRoute>
        ),
      },
      {
        path: 'conductores',
        element: (
          <ProtectedRoute permission="conductores">
            <Conductores />
          </ProtectedRoute>
        ),
      },
      {
        path: 'parqueaderos',
        element: (
          <ProtectedRoute permission="parqueaderos">
            <Parqueaderos />
          </ProtectedRoute>
        ),
      },
      {
        path: 'entrada-salida',
        element: (
          <ProtectedRoute permission="entradaSalida">
            <ControlSalidaPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reservas',
        element: (
          <ProtectedRoute permission="reservas">
            <Reservas />
          </ProtectedRoute>
        ),
      },
      {
        path: 'incidentes',
        element: (
          <ProtectedRoute permission="incidentes">
            <Incidentes />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <RouteErrorBoundary />,
  },
]);
