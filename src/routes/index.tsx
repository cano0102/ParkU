import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { NotFound } from './NotFound';
import Landing from '@/features/landing';
import { Login, Register, ForgotPassword, ResetPassword } from '@/features/auth';

/* Páginas autenticadas: se cargan bajo demanda, no en el bundle inicial */
const Dashboard = lazy(() => import('@/features/dashboard'));
const Roles = lazy(() => import('@/features/roles').then(m => ({ default: m.Roles })));
const Usuarios = lazy(() => import('@/features/usuarios'));
const Conductores = lazy(() => import('@/features/conductores').then(m => ({ default: m.Conductores })));
const Parqueaderos = lazy(() => import('@/features/parqueaderos'));
const ControlSalidaPage = lazy(() => import('@/features/controlSalida').then(m => ({ default: m.ControlSalidaPage })));
const Reservas = lazy(() => import('@/features/reservas').then(m => ({ default: m.Reservas })));
const Incidentes = lazy(() => import('@/features/incidentes').then(m => ({ default: m.Incidentes })));
const Perfil = lazy(() => import('@/features/perfil').then(m => ({ default: m.Perfil })));

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
    path: '/register',
    element: <Register />,
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
  },
]);
