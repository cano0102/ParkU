import { describe, it, expect, vi, afterEach } from 'vitest';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('../core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));

const auth = await import('./auth');
const { getToken, getRefreshToken, clearTokens } = await import('../core/tokenStorage');

const USUARIO_API = { id: 1, correo: 'admin@sena.edu.co', nombre: 'Administrador ParkU', rol: 1, estado: 'ACTIVO' };

afterEach(() => {
  clearTokens();
  apiFetchMock.mockReset();
});

describe('services/auth', () => {
  it('login guarda el token/refreshToken y normaliza el correo devuelto', async () => {
    apiFetchMock.mockImplementation(async (path: string, opts: any) => {
      expect(path).toBe('/auth/login');
      expect(opts.body).toEqual({ correo: 'admin@sena.edu.co', contrasena: 'Pass1234' });
      return { success: true, message: 'Login exitoso', data: { user: USUARIO_API, token: 'tok-1', refreshToken: 'ref-1', expiresIn: '7d' } };
    });

    const user = await auth.login('  Admin@SENA.edu.co  ', 'Pass1234');
    expect(user.correo).toBe('admin@sena.edu.co');
    expect(user.rol).toBe(1);
    expect(getToken()).toBe('tok-1');
    expect(getRefreshToken()).toBe('ref-1');
  });

  it('login propaga el mensaje de error de la API en credenciales inválidas', async () => {
    apiFetchMock.mockRejectedValue(new Error('Credenciales inválidas'));
    await expect(auth.login('no-existe@sena.edu.co', 'Pass1234')).rejects.toThrow('Credenciales inválidas');
  });

  it('register crea el usuario y luego hace login para dejarlo con sesión iniciada', async () => {
    const calls: string[] = [];
    apiFetchMock.mockImplementation(async (path: string) => {
      calls.push(path);
      if (path === '/auth/registro') return { success: true, message: 'ok', data: { id: 2, correo: 'nuevo@sena.edu.co', nombre: 'Nuevo', rol: 3, estado: 'ACTIVO' } };
      if (path === '/auth/login') return { success: true, message: 'ok', data: { user: { id: 2, correo: 'nuevo@sena.edu.co', nombre: 'Nuevo', rol: 3, estado: 'ACTIVO' }, token: 't', refreshToken: 'r', expiresIn: '7d' } };
      throw new Error(`ruta inesperada: ${path}`);
    });

    const user = await auth.register({
      correo: 'nuevo@sena.edu.co', password: 'Pass1234', nombre: 'Nuevo', numero: '3000000000',
      tipoDocumento: 'CC', identificacion: 'id-1',
    });
    expect(user.rol).toBe(3);
    expect(calls).toEqual(['/auth/registro', '/auth/login']);
    expect(getToken()).toBe('t');
  });

  it('requestPasswordReset devuelve null cuando la API no incluye token (comportamiento de producción)', async () => {
    apiFetchMock.mockResolvedValue({ success: true, message: 'Si el correo existe, se generó un enlace' });
    const token = await auth.requestPasswordReset('alguien@sena.edu.co');
    expect(token).toBeNull();
  });

  it('resetPasswordWithToken reporta ok:false con el mensaje de la API si el token no es válido', async () => {
    apiFetchMock.mockRejectedValue(new Error('El enlace de recuperación no es válido.'));
    const resultado = await auth.resetPasswordWithToken('token-invalido', 'NuevaPass123');
    expect(resultado.ok).toBe(false);
    expect(resultado.message).toBe('El enlace de recuperación no es válido.');
  });

  it('changePassword devuelve false (no lanza) si la API rechaza la contraseña actual', async () => {
    apiFetchMock.mockRejectedValue(new Error('Contraseña actual incorrecta'));
    const ok = await auth.changePassword('1', 'mala', 'NuevaPass123');
    expect(ok).toBe(false);
  });

  it('logout limpia los tokens locales aunque la API falle (best-effort)', async () => {
    apiFetchMock.mockImplementation(async (path: string) => {
      if (path === '/auth/login') return { success: true, message: 'ok', data: { user: USUARIO_API, token: 'tok', refreshToken: 'ref', expiresIn: '7d' } };
      throw new Error('network down');
    });
    await auth.login('admin@sena.edu.co', 'Pass1234');
    expect(getToken()).toBe('tok');

    await auth.logout();
    expect(getToken()).toBeNull();
  });
});
