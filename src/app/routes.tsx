import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../shared/layouts/MainLayout';
import Landing from '../features/landing/pages/Landing';
import { Login } from '../features/auth/pages/Login';
import { ForgotPassword } from '../features/auth/pages/ForgotPassword';
import { ResetPassword } from '../features/auth/pages/ResetPassword';
import  Dashboard  from '../features/dashboard/pages/Dashboard';
import  {Roles}  from '../features/roles/pages/Roles';
import  Usuarios  from '../features/usuarios/pages/Usuarios';
import { Conductores } from '../features/conductores/pages/Conductores';
import { Vehiculos } from '../features/vehiculos/pages/Vehiculos';
import  Parqueaderos  from '../features/parqueaderos/pages/Parqueaderos';
import { Celdas } from '../features/celdas/pages/Celdas';
import { Asignaciones } from '../features/asignaciones/pages/Asignaciones';
import { ControlSalidaPage } from '../features/control-salida/pages/ControlSalida';
import { Reservas } from '../features/reservas/pages/Reservas';
import { Incidentes } from '../features/incidentes/pages/Incidentes';
import { Perfil } from '../features/perfil/pages/Perfil';
import { NotFound } from '../shared/pages/NotFound';

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
    element: <MainLayout />,
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
        path: 'celdas',
        element: <Celdas />,
      },
      {
        path: 'asignaciones',
        element: <Asignaciones />,
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