import React, {
  createContext,
  useContext,
  useState
} from 'react';
import { useData } from './DataContext';

interface User {
  id: string;
  correo: string;
  nombre: string;
  numero: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;

  login: (
    correo: string,
    password: string
  ) => Promise<boolean>;

  googleLogin: (userData: any) => void;

  logout: () => void;

  updateUser: (data: { nombre: string; numero: string }) => void;

  changePassword: (currentPassword: string, newPassword: string) => boolean;

  isAuthenticated: boolean;
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
  const { usuarios, updateUsuario } = useData();

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

  // ACTUALIZAR PERFIL (usado por la página Perfil)
  const updateUser = (data: { nombre: string; numero: string }) => {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        googleLogin,
        logout,
        updateUser,
        changePassword,
        isAuthenticated: !!user
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
