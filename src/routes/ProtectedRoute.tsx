import { Link, Navigate } from 'react-router-dom';
import { IconShieldExclamation as ShieldAlert } from "@tabler/icons-react";
import { useAuth } from '../context/AuthContext';
import { rutaInicial, type PermisosRol } from '../services/core/roles';
import { theme } from '../styles/theme';

const C = theme;

function AccessDenied() {
  const { permisos } = useAuth();
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: C.dangerBg,
          border: `1px solid ${C.dangerBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ShieldAlert size={26} color={C.danger} />
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, margin: 0 }}>
        Acceso denegado
      </h2>
      <p style={{ fontSize: 14, color: C.textLight, maxWidth: 360, margin: 0 }}>
        Tu rol no tiene permiso para ver esta sección. Si crees que es un error,
        contacta a un administrador.
      </p>
      <Link
        to={rutaInicial(permisos)}
        style={{
          marginTop: 8,
          padding: '10px 18px',
          borderRadius: 10,
          background: C.primary,
          color: '#fff',
          fontWeight: 700,
          fontSize: 13,
          textDecoration: 'none',
        }}
      >
        Ir al inicio
      </Link>
    </div>
  );
}

export function ProtectedRoute({
  children,
  permission,
}: {
  children: React.ReactNode;
  /** Clave de `Rol.permisos` requerida para ver esta ruta. Si se omite, solo se exige sesión iniciada. */
  permission?: keyof PermisosRol;
}) {
  const { isAuthenticated, hasPermission, permisos } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (permission && !hasPermission(permission)) {
    // El Dashboard es a donde se llega tras iniciar sesión. Un rol a medida sin él (p. ej.
    // solo "Registrar salidas") no debe estrellarse contra "Acceso denegado" nada más
    // entrar: se le lleva directo a su primer módulo.
    if (permission === 'dashboard') return <Navigate to={rutaInicial(permisos)} replace />;
    return <AccessDenied />;
  }

  return <>{children}</>;
}

/** Ruta índice de `/app`: manda a la primera pantalla que el usuario puede abrir. */
export function InicioRedirect() {
  const { permisos } = useAuth();
  return <Navigate to={rutaInicial(permisos)} replace />;
}
