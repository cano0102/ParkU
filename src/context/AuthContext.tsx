import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

interface User {
  id: string;
  email: string;
  nombre: string;
  numero: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;

  login: (
    email: string,
    password: string
  ) => Promise<boolean>;

  googleLogin: (userData: any) => void;

  logout: () => void;

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

  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {

    const savedUser =
      localStorage.getItem('parkUUser');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

  }, []);

  // LOGIN NORMAL
  const login = async (
    email: string,
    password: string
  ): Promise<boolean> => {

    if (email && password) {

      const mockUser = {
        id: '1',
        email,
        nombre: 'Administrador',
        numero: '3001234567',
        rol: 'Administrador'
      };

      setUser(mockUser);

      localStorage.setItem(
        'parkUUser',
        JSON.stringify(mockUser)
      );

      return true;
    }

    return false;
  };

  // LOGIN GOOGLE
  const googleLogin = (userData: any) => {

    const googleUser = {
      id: userData.uid,
      email: userData.email,
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

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        googleLogin,
        logout,
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