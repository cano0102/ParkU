import React, {
  createContext,
  useContext,
  useState
} from 'react';
import * as authService from '../services/api/auth';
import { useRoles } from '@/features/roles';
import { useUpdateUsuario } from '@/features/usuarios';
import type { Rol } from '../services/api/roles';

interface User {
  id: string;
  correo: string;
  nombre: string;
  numero: string;
  rol: string;
  foto?: string;
}

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
    tipoUsuario: 'visitante' | 'estudiante' | 'docente' | 'administrativo' | 'otro';
    tipoDocumento: string;
    identificacion: string;
  }) => Promise<boolean>;

  googleLogin: (userData: any) => void;

  logout: () => void;

  updateUser: (data: Partial<Pick<User, 'nombre' | 'numero' | 'foto'>>) => void;

  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;

  // Genera un enlace de recuperación de contraseña para el correo dado.
  // Devuelve el token generado, o null si no existe ninguna cuenta con ese correo.
  requestPasswordReset: (correo: string) => Promise<string | null>;

  // Valida el token de un enlace de recuperación y, si es válido, actualiza
  // la contraseña del usuario asociado. El token es de un solo uso.
  resetPasswordWithToken: (
    token: string,
    newPassword: string
  ) => Promise<{ ok: boolean; message?: string }>;

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
  const { data: roles = [] } = useRoles();
  const updateUsuarioMutation = useUpdateUsuario();

  // Inicializador perezoso: lee localStorage de forma síncrona en el primer
  // render, para que isAuthenticated ya sea correcto antes de que
  // ProtectedRoute decida si redirige a /login (evita el "flash" a login
  // en cada recarga de página con una sesión válida).
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('parkUUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // LOGIN NORMAL — valida contra los usuarios reales (existencia, contraseña
  // y estado) a través de services/auth.ts.
  const login = async (
    correo: string,
    password: string
  ): Promise<boolean> => {
    const loggedUser = await authService.login(correo, password);

    setUser(loggedUser);
    localStorage.setItem('parkUUser', JSON.stringify(loggedUser));

    return true;
  };

  // REGISTRO — crea el usuario con rol "Comunidad SENA" y lo deja logueado.
  const register = async (data: {
    correo: string;
    password: string;
    nombre: string;
    numero: string;
    tipoUsuario: 'visitante' | 'estudiante' | 'docente' | 'administrativo' | 'otro';
    tipoDocumento: string;
    identificacion: string;
  }): Promise<boolean> => {
    const loggedUser = await authService.register(data);

    setUser(loggedUser);
    localStorage.setItem('parkUUser', JSON.stringify(loggedUser));

    return true;
  };

  // LOGIN GOOGLE
  const googleLogin = (userData: any) => {

    const googleUser: User = {
      id: userData.uid,
      correo: userData.email,
      nombre: userData.displayName || 'Usuario',
      numero: userData.phoneNumber || '',
      rol: 'Comunidad SENA'
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
    updateUsuarioMutation.mutate({ id: user.id, data });
  };

  // CAMBIAR CONTRASEÑA (usado por la página Perfil)
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    return authService.changePassword(user.id, currentPassword, newPassword);
  };

  // RECUPERAR CONTRASEÑA (usado por ForgotPassword / ResetPassword)
  const requestPasswordReset = (correo: string): Promise<string | null> => {
    return authService.requestPasswordReset(correo);
  };

  const resetPasswordWithToken = (token: string, newPassword: string): Promise<{ ok: boolean; message?: string }> => {
    return authService.resetPasswordWithToken(token, newPassword);
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
