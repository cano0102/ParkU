/**
 * Persistencia del JWT + refresh token de la API real en localStorage.
 * Separado de `parkUUser` (que sigue viviendo en AuthContext) para que el
 * cliente HTTP (`./http.ts`) pueda leer el token sin depender de React.
 */

const TOKEN_KEY = 'parkuToken';
const REFRESH_TOKEN_KEY = 'parkuRefreshToken';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setTokens(token: string, refreshToken: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch {
    // localStorage no disponible (modo privado, etc.) — la sesión no persiste
    // entre recargas, pero la pestaña actual sigue funcionando.
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ver nota en setTokens
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // ver nota en setTokens
  }
}
