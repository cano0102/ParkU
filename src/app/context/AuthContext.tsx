import React, {
  createContext,
  useContext,
  useState
} from 'react';
import { useData, Rol } from './DataContext';

interface User {
  id: string;
  correo: string;
  nombre: string;
  numero: string;
  rol: string;
  foto?: string;
}

// Solicitud de recuperación de contraseña generada y resuelta dentro del
// propio proyecto (sin servicios externos de correo). El "envío" se simula
// mostrando el enlace directamente en la pantalla de Recuperar Contraseña.
interface ResetRequest {
  token: string;
  usuarioId: string;
  correo: string;
  expiresAt: number;
  usado: boolean;
}

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutos

interface AuthContextType {
  user: User | null;

  login: (
    correo: string,
    password: string
  ) => Promise<boolean>;

  register: (data: {
    correo: string;
    password: string;
    nombre: string;
    numero: string;
    tipoDocumento: string;
    identificacion: string;
  }) => Promise<boolean>;

  googleLogin: (userData: any) => void;

  logout: () => void;

  updateUser: (data: Partial<Pick<User, 'nombre' | 'numero' | 'foto'>>) => void;

  changePassword: (currentPassword: string, newPassword: string) => boolean;

  // Genera un enlace de recuperación de contraseña para el correo dado.
  // Devuelve el token generado, o null si no existe ninguna cuenta con ese correo.
  requestPasswordReset: (correo: string) => string | null;

  // Valida el token de un enlace de recuperación y, si es válido, actualiza
  // la contraseña del usuario asociado. El token es de un solo uso.
  resetPasswordWithToken: (
    token: string,
    newPassword: string
  ) => { ok: boolean; message?: string };

  isAuthenticated: boolean;

  // Permisos del rol asignado al usuario autenticado (null si no hay sesión
  // o si su rol fue eliminado/desactivado desde la pantalla de Roles).
  permisos: Rol['permisos'] | null;

  hasPermission: (key: keyof Rol['permisos']) => boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const { usuarios, roles, addUsuario, updateUsuario } = useData();

  // Inicializador perezoso: lee localStorage de forma síncrona en el primer
  // render, para que isAuthenticated ya sea correcto antes de que
  // ProtectedRoute decida si redirige a /login (evita el "flash" a login
  // en cada recarga de página con una sesión válida).
  const [resetRequests, setResetRequests] = useState<ResetRequest[]>([]);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('parkUUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // LOGIN NORMAL
  // Corrección: antes se aceptaba cualquier correo/contraseña no vacíos y se
  // creaba un usuario ficticio, sin relación alguna con los usuarios
  // gestionados en la sección "Usuarios" (mismos datos que usa esa pantalla).
  // Ahora valida contra los usuarios reales: existencia, contraseña y estado.
  const login = async (
    correo: string,
    password: string
  ): Promise<boolean> => {
    const correoNormalizado = correo.trim().toLowerCase();
    const usuario = usuarios.find(
      (u) => u.correo.trim().toLowerCase() === correoNormalizado
    );

    if (!usuario) {
      throw new Error('No existe una cuenta con este correo.');
    }
    if (usuario.estado !== 'activo') {
      throw new Error('Esta cuenta está desactivada. Contacta al administrador.');
    }
    if (usuario.password !== password) {
      throw new Error('Contraseña incorrecta. Verifica tus credenciales.');
    }

    const loggedUser: User = {
      id: usuario.id,
      correo: usuario.correo,
      nombre: usuario.nombre,
      numero: usuario.numero,
      rol: usuario.rol,
      foto: usuario.foto,
    };

    setUser(loggedUser);

    localStorage.setItem(
      'parkUUser',
      JSON.stringify(loggedUser)
    );

    return true;
  };

  // REGISTRO
  // Crea el usuario en la misma colección que gestiona la pantalla "Usuarios"
  // (mismos datos), con el rol "Usuario" (acceso básico), y lo deja logueado.
  const register = async (data: {
    correo: string;
    password: string;
    nombre: string;
    numero: string;
    tipoDocumento: string;
    identificacion: string;
  }): Promise<boolean> => {
    const correoNormalizado = data.correo.trim().toLowerCase();
    const identificacionNormalizada = data.identificacion.trim();

    const duplicado = usuarios.find(
      (u) =>
        u.correo.trim().toLowerCase() === correoNormalizado ||
        (identificacionNormalizada && u.identificacion.trim() === identificacionNormalizada)
    );
    if (duplicado) {
      if (duplicado.correo.trim().toLowerCase() === correoNormalizado) {
        throw new Error('Ya existe una cuenta registrada con este correo.');
      }
      throw new Error('Ya existe una cuenta registrada con ese número de identificación.');
    }

    const nombre = data.nombre.trim();
    const numero = data.numero.trim();

    const id = addUsuario({
      correo: correoNormalizado,
      password: data.password,
      nombre,
      numero,
      rol: 'Usuario',
      tipoDocumento: data.tipoDocumento,
      identificacion: identificacionNormalizada,
      estado: 'activo',
    });

    const loggedUser: User = {
      id,
      correo: correoNormalizado,
      nombre,
      numero,
      rol: 'Usuario',
    };

    setUser(loggedUser);

    localStorage.setItem(
      'parkUUser',
      JSON.stringify(loggedUser)
    );

    return true;
  };

  // LOGIN GOOGLE
  const googleLogin = (userData: any) => {

    const googleUser: User = {
      id: userData.uid,
      correo: userData.email,
      nombre: userData.displayName || 'Usuario',
      numero: userData.phoneNumber || '',
      rol: 'Usuario'
    };

    setUser(googleUser);

    localStorage.setItem(
      'parkUUser',
      JSON.stringify(googleUser)
    );
  };

  // LOGOUT
  const logout = () => {

    setUser(null);

    localStorage.removeItem('parkUUser');
  };

  // ACTUALIZAR PERFIL (usado por la página Perfil, incl. la foto)
  const updateUser = (data: Partial<Pick<User, 'nombre' | 'numero' | 'foto'>>) => {
    if (!user) return;
    const updated: User = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('parkUUser', JSON.stringify(updated));
    updateUsuario(user.id, data);
  };

  // CAMBIAR CONTRASEÑA (usado por la página Perfil)
  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    if (!user) return false;
    const usuario = usuarios.find((u) => u.id === user.id);
    if (!usuario || usuario.password !== currentPassword) return false;
    updateUsuario(user.id, { password: newPassword });
    return true;
  };

  // RECUPERAR CONTRASEÑA (usado por ForgotPassword / ResetPassword)
  // Genera un token de un solo uso, válido por 30 minutos, sin depender de
  // ningún servicio de correo externo: el "envío" lo simula la propia pantalla.
  const requestPasswordReset = (correo: string): string | null => {
    const correoNormalizado = correo.trim().toLowerCase();
    const usuario = usuarios.find((u) => u.correo.trim().toLowerCase() === correoNormalizado);
    if (!usuario) return null;

    const token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setResetRequests((prev) => [
      ...prev,
      { token, usuarioId: usuario.id, correo: usuario.correo, expiresAt: Date.now() + RESET_TOKEN_TTL_MS, usado: false },
    ]);

    return token;
  };

  const resetPasswordWithToken = (token: string, newPassword: string): { ok: boolean; message?: string } => {
    const solicitud = resetRequests.find((r) => r.token === token);
    if (!solicitud) return { ok: false, message: 'El enlace de recuperación no es válido.' };
    if (solicitud.usado) return { ok: false, message: 'Este enlace ya fue utilizado. Solicita uno nuevo.' };
    if (Date.now() > solicitud.expiresAt) return { ok: false, message: 'El enlace de recuperación expiró. Solicita uno nuevo.' };

    updateUsuario(solicitud.usuarioId, { password: newPassword });
    setResetRequests((prev) => prev.map((r) => (r.token === token ? { ...r, usado: true } : r)));

    return { ok: true };
  };

  // PERMISOS (une el rol del usuario logueado con la definición de permisos
  // gestionada en la pantalla de Roles). Si el rol fue borrado o desactivado
  // después de que el usuario inició sesión, se deniega todo por defecto.
  const rolActual = user ? roles.find((r) => r.nombre === user.rol) : undefined;
  const permisos = rolActual && rolActual.estado === 'activo' ? rolActual.permisos : null;

  const hasPermission = (key: keyof Rol['permisos']): boolean => !!permisos?.[key];

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        googleLogin,
        logout,
        updateUser,
        changePassword,
        requestPasswordReset,
        resetPasswordWithToken,
        isAuthenticated: !!user,
        permisos,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe ser usado dentro de AuthProvider'
    );
  }

  return context;
}
