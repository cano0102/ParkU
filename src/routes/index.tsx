import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { NotFound } from './NotFound';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { Precarga } from './Precarga';
import {
  Login, Register, ForgotPassword, ResetPassword,
  Dashboard, Roles, Usuarios, Conductores, Parqueaderos, ControlSalidaPage, Reservas, Incidentes, Perfil,
} from './paginas';
import Landing from '@/features/landing';

/* Qué se descarga por adelantado desde cada pantalla pública: lo que viene después. Desde la
   landing, el login (y el registro, que se ofrece ahí mismo); desde el login, la primera
   pantalla de la app, para que el "Ingresar" no se quede esperando ningún chunk. Se declaran
   fuera del árbol para que sean la misma referencia en cada render (ver Precarga). */
const TRAS_LANDING = ['/login', '/register'];
const TRAS_LOGIN = ['/app/dashboard'];

export const router = createBrowserRouter([
  {
    index: true,
    element: <Precarga rutas={TRAS_LANDING}><Landing /></Precarga>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login',
    element: <Precarga rutas={TRAS_LOGIN}><Login /></Precarga>,
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
