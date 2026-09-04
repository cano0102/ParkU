import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { IconAlertTriangle as AlertTriangle } from "@tabler/icons-react";
import { theme } from '../styles/theme';

const C = theme;

/**
 * `errorElement` del router de datos (`createBrowserRouter`). Sin esto,
 * cualquier error que ocurra dentro de una ruta (incluida una carga de chunk
 * fallida tras un deploy nuevo — "Failed to fetch dynamically imported
 * module") lo captura el manejador por defecto de React Router, que muestra
 * su pantalla en inglés "Unexpected Application Error!" en vez de la nuestra
 * — sus límites de error internos por ruta interceptan el error antes de que
 * llegue al `<ErrorBoundary>` de React que envuelve `<RouterProvider>` en
 * App.tsx.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const esError404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: C.bg,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          width: '100%',
          textAlign: 'center',
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: '32px 28px',
          boxShadow: '0 20px 55px rgba(15,23,42,.08)',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            margin: '0 auto 16px',
            borderRadius: 14,
            background: C.dangerBg,
            border: `1px solid ${C.dangerBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AlertTriangle size={24} color={C.danger} />
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 6 }}>
          {esError404 ? 'Página no encontrada' : 'Ocurrió un error inesperado'}
        </div>
        <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 20, lineHeight: 1.5 }}>
          {esError404
            ? 'La página que buscas no existe o fue movida.'
            : 'Puede que haya una nueva versión de ParkU disponible. Recarga la página para actualizar.'}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%',
            height: 40,
            borderRadius: 10,
            border: 'none',
            background: C.primary,
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Recargar página
        </button>
      </div>
    </div>
  );
}
