import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';
import * as authService from '../services/api/auth';
import { getToken, clearTokens } from '../services/core/tokenStorage';
import { AUTH_EXPIRED_EVENT } from '../services/core/http';
import { ROLES, permisosDeRol, type RolId, type PermisosRol } from '../services/core/roles';

interface User {
  id: string;
  correo: string;
  nombre: string;
  numero: string;
  rol: RolId;
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
    tipoDocumento: string;
    identificacion: string;
  }) => Promise<boolean>;

  googleLogin: (userData: any) => void;

  logout: () => void;

  // Solo actualiza el perfil en esta sesión/navegador (localStorage): el
  // modelo de Usuario de la API real no tiene columnas `numero` ni `foto`, y
  // `nombre` solo se puede editar vía API con rol Admin — no hay forma de
  // persistir esto en el backend para un usuario editando su propio perfil.
  updateUser: (data: Partial<Pick<User, 'nombre' | 'numero' | 'foto'>>) => void;

  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;

  // Genera un enlace de recuperación de contraseña para el correo dado.
  // Devuelve el token generado si la API lo incluyó en la respuesta (solo
  // fuera de producción), o null en caso contrario — null no implica que el
  // correo no exista, la API no lo revela por seguridad.
  requestPasswordReset: (correo: string) => Promise<string | null>;

  // Valida el token de un enlace de recuperación y, si es válido, actualiza
  // la contraseña del usuario asociado. El token es de un solo uso.
  resetPasswordWithToken: (
    token: string,
    newPassword: string
  ) => Promise<{ ok: boolean; message?: string }>;

  isAuthenticated: boolean;

  // Permisos del rol del usuario autenticado, según la matriz estática que
  // refleja los `verificarRol([...])` reales de la API (ver services/core/roles.ts).
  permisos: PermisosRol | null;

  hasPermission: (key: keyof PermisosRol) => boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

const USER_STORAGE_KEY = 'parkUUser';

/** La foto de perfil vive en una llave APARTE de `parkUUser`, indexada por id de usuario —
 *  el modelo real de Usuario no tiene columna `foto` (ver el comentario de `updateUser` más
 *  abajo), así que `logout()` no puede "guardarla en el backend" antes de borrar la sesión.
 *  Guardándola por separado, sobrevive a `persistUser(null)` (logout) y se puede volver a
 *  fusionar en el próximo login de la MISMA cuenta en este mismo navegador — antes vivía solo
 *  dentro de `parkUUser`, así que cada logout la borraba sin remedio. */
const fotoStorageKey = (userId: string) => `parkuFotoPerfil:${userId}`;

function leerFotoGuardada(userId: string): string | undefined {
  try {
    return localStorage.getItem(fotoStorageKey(userId)) || undefined;
  } catch {
    return undefined;
  }
}

function guardarFotoGuardada(userId: string, foto: string) {
  try {
    if (foto) localStorage.setItem(fotoStorageKey(userId), foto);
    else localStorage.removeItem(fotoStorageKey(userId));
  } catch {
    // localStorage no disponible — la foto solo dura esta pestaña, igual que el resto de la sesión.
  }
}

/** Completa `foto` desde el almacenamiento propio si el usuario recién resuelto (login/registro/
 *  hidratación inicial) no trae una — pasa exactamente igual si ya la tenía. */
function conFotoGuardada(u: User): User {
  if (u.foto) return u;
  const foto = leerFotoGuardada(u.id);
  return foto ? { ...u, foto } : u;
}

export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  // Inicializador perezoso: lee localStorage de forma síncrona en el primer
  // render, para que isAuthenticated ya sea correcto antes de que
  // ProtectedRoute decida si redirige a /login (evita el "flash" a login
  // en cada recarga de página con una sesión válida). Se valida contra el
  // backend por separado (ver useEffect abajo) — leer localStorage aquí solo
  // evita el parpadeo, no reemplaza esa validación.
  const [user, setUser] = useState<User | null>(() => {
    try {
      if (!getToken()) return null;
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? conFotoGuardada(JSON.parse(savedUser)) : null;
    } catch {
      return null;
    }
  });

  const persistUser = (next: User | null) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // localStorage no disponible — la sesión sigue funcionando en memoria para esta pestaña.
    }
  };

  // Confirma contra la API que el token guardado sigue siendo válido. Si
  // expiró (o el usuario fue desactivado) desde la última visita, cierra la
  // sesión local en vez de dejar una sesión "fantasma".
  useEffect(() => {
    if (!getToken()) return;
    let cancelado = false;
    authService.verificarToken().then((usuarioReal) => {
      if (cancelado) return;
      if (!usuarioReal) {
        clearTokens();
        persistUser(null);
        return;
      }
      // Resincroniza SOLO `rol` contra la respuesta autoritativa del backend — antes se
      // descartaba del todo, así que si el rol de alguien cambiaba en el servidor (o alguien
      // editaba `parkUUser.rol` a mano desde DevTools), ni `hasPermission()` ni los guards de
      // ruta se enteraban hasta un nuevo login. El resto de campos (`nombre`, `numero`, `foto`)
      // se DEJAN tal cual estén en el estado local a propósito: `updateUser` más abajo ya
      // documenta que esos solo se editan localmente desde Perfil — el backend real ni
      // siquiera tiene forma de persistir un usuario editando su propio nombre/teléfono —
      // así que sobrescribirlos aquí con la respuesta del backend borraría esa edición local
      // en cada recarga de página.
      setUser((actual) => {
        if (!actual) return actual;
        const next = { ...actual, rol: usuarioReal.rol };
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // localStorage no disponible — la sesión sigue funcionando en memoria para esta pestaña.
        }
        return next;
      });
    });
    return () => {
      cancelado = true;
    };
  }, []);

  // Si `http.ts` no logró renovar el token en un 401, cierra la sesión local.
  useEffect(() => {
    const onAuthExpired = () => persistUser(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // LOGIN NORMAL — valida contra la API real (correo/contraseña/estado) vía services/api/auth.ts.
  const login = async (
    correo: string,
    password: string
  ): Promise<boolean> => {
    const loggedUser = await authService.login(correo, password);
    persistUser(conFotoGuardada(loggedUser));
    return true;
  };

  // REGISTRO — la API pública siempre crea rol Conductor y deja al usuario logueado.
  const register = async (data: {
    correo: string;
    password: string;
    nombre: string;
    numero: string;
    tipoDocumento: string;
    identificacion: string;
  }): Promise<boolean> => {
    const loggedUser = await authService.register(data);
    persistUser(loggedUser);
    return true;
  };

  // LOGIN GOOGLE — sin flujo de Firebase Auth conectado; se deja el estado
  // local por compatibilidad, pero no llama a la API.
  const googleLogin = (userData: any) => {
    const googleUser: User = {
      id: userData.uid,
      correo: userData.email,
      nombre: userData.displayName || 'Usuario',
      numero: userData.phoneNumber || '',
      rol: ROLES.CONDUCTOR,
    };
    persistUser(googleUser);
  };

  // LOGOUT
  const logout = () => {
    persistUser(null);
    void authService.logout();
  };

  // ACTUALIZAR PERFIL (usado por la página Perfil, incl. la foto) — solo local, ver nota en el tipo.
  const updateUser = (data: Partial<Pick<User, 'nombre' | 'numero' | 'foto'>>) => {
    if (!user) return;
    // La foto, además de vivir en `parkUUser`, se guarda aparte para sobrevivir a un logout
    // (ver `guardarFotoGuardada` arriba) — con `foto: ''` (quitar foto) se borra de ambos lados.
    if (data.foto !== undefined) guardarFotoGuardada(user.id, data.foto);
    persistUser({ ...user, ...data });
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

  // PERMISOS — matriz estática por rol_id (ver services/core/roles.ts).
  const permisos = user ? permisosDeRol(user.rol) : null;

  const hasPermission = (key: keyof PermisosRol): boolean => !!permisos?.[key];

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
