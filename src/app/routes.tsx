import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { NotFound } from './pages/NotFound';

/* Páginas autenticadas: se cargan bajo demanda, no en el bundle inicial */
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Roles = lazy(() => import('./pages/Roles').then(m => ({ default: m.Roles })));
const Usuarios = lazy(() => import('./pages/Usuarios'));
const Conductores = lazy(() => import('./pages/Conductores').then(m => ({ default: m.Conductores })));
const Parqueaderos = lazy(() => import('./pages/Parqueaderos'));
const ControlSalidaPage = lazy(() => import('./pages/ControlSalida').then(m => ({ default: m.ControlSalidaPage })));
const Reservas = lazy(() => import('./pages/Reservas').then(m => ({ default: m.Reservas })));
const Incidentes = lazy(() => import('./pages/Incidentes').then(m => ({ default: m.Incidentes })));
const Perfil = lazy(() => import('./pages/Perfil').then(m => ({ default: m.Perfil })));

export const router = createBrowserRouter([
  {
    index: true,
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'perfil',
        element: <Perfil />,
      },
      {
        path: 'roles',
        element: <Roles />,
      },
      {
        path: 'usuarios',
        element: <Usuarios />,
      },
      {
        path: 'conductores',
        element: <Conductores />,
      },
      {
        path: 'parqueaderos',
        element: <Parqueaderos />,
      },
      {
        path: 'entrada-salida',
        element: <ControlSalidaPage />,
      },
      {
        path: 'reservas',
        element: <Reservas />,
      },
      {
        path: 'incidentes',
        element: <Incidentes />,
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
  },
]);