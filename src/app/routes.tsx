import { createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from './layouts/MainLayout';
import Landing from './pages/Landing';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Roles } from './pages/Roles';
import { Usuarios } from './pages/Usuarios';
import { Conductores } from './pages/Conductores';
import { Vehiculos } from './pages/Vehiculos';
import { Parqueaderos } from './pages/Parqueaderos';
import { Celdas } from './pages/Celdas';
import { Asignaciones } from './pages/Asignaciones';
import { ControlSalidaPage } from './pages/ControlSalida';
import { Reservas } from './pages/Reservas';
import { Incidentes } from './pages/Incidentes';
import { ReconocimientoPlacas } from './pages/ReconocimientoPlacas';
import { Perfil } from './pages/Perfil';
import { NotFound } from './pages/NotFound';

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
        path: 'vehiculos',
        element: <Vehiculos />,
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
        path: 'reconocimiento-placas',
        element: <ReconocimientoPlacas />,
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