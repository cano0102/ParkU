import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * A diferencia de `services/api/*.test.ts` (que mockean `apiFetch` para probar el mapeo de
 * cada dominio), este archivo prueba `apiFetch` en sí — el único punto que normaliza
 * cualquier error HTTP (400/401/403/404/409/422/500, timeout, red caída) a un `Error` legible.
 * Mockea `fetch` directo (no `apiFetch`) para ejercitar esa lógica de verdad.
 */
function mockFetchOnce(status: number, body: unknown, ok = status >= 200 && status < 300) {
  return vi.fn().mockResolvedValueOnce({
    ok, status,
    json: async () => body,
  } as Response);
}

describe('apiFetch — normalización de errores HTTP', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('devuelve el body ya parseado cuando la respuesta es 200 OK', async () => {
    globalThis.fetch = mockFetchOnce(200, [{ id: 1 }]);
    const { apiFetch } = await import('./http');
    await expect(apiFetch('/parqueaderos')).resolves.toEqual([{ id: 1 }]);
  });

  it('usa el `message` del backend cuando lo trae (404)', async () => {
    globalThis.fetch = mockFetchOnce(404, { message: 'Parqueadero no encontrado' });
    const { apiFetch } = await import('./http');
    await expect(apiFetch('/parqueaderos/999')).rejects.toThrow('Parqueadero no encontrado');
  });

  it('une los mensajes de `errors[]` cuando el backend responde una lista de validación (422)', async () => {
    globalThis.fetch = mockFetchOnce(422, {
      errors: [{ campo: 'telefono', mensaje: 'Formato inválido' }, { campo: 'correo', mensaje: 'Correo obligatorio' }],
    });
    const { apiFetch } = await import('./http');
    await expect(apiFetch('/usuarios', { method: 'POST', body: {} })).rejects.toThrow('Formato inválido Correo obligatorio');
  });

  it('usa un mensaje de respaldo específico por status cuando el backend no trae message ni errors (403)', async () => {
    globalThis.fetch = mockFetchOnce(403, {});
    const { apiFetch } = await import('./http');
    await expect(apiFetch('/usuarios')).rejects.toThrow('No tienes los permisos requeridos.');
  });

  it('usa un mensaje de respaldo específico por status cuando el body no es JSON válido (500)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false, status: 500,
      json: async () => { throw new Error('not json'); },
    } as unknown as Response);
    const { apiFetch } = await import('./http');
    await expect(apiFetch('/parqueaderos')).rejects.toThrow('Ocurrió un error en el servidor. Intenta de nuevo más tarde.');
  });

  it('cae a "Error {status}" solo para un código sin mensaje de respaldo definido', async () => {
    globalThis.fetch = mockFetchOnce(418, {});
    const { apiFetch } = await import('./http');
    await expect(apiFetch('/parqueaderos')).rejects.toThrow('Error 418');
  });

  it('reporta un mensaje específico cuando la conexión falla (sin red)', async () => {
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const { apiFetch } = await import('./http');
    await expect(apiFetch('/parqueaderos')).rejects.toThrow('No se pudo conectar con el servidor. Revisa tu conexión a internet.');
  });

  it('reporta un mensaje específico cuando la petición supera el tiempo límite', async () => {
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new DOMException('aborted', 'AbortError'));
    const { apiFetch } = await import('./http');
    await expect(apiFetch('/parqueaderos')).rejects.toThrow('El servidor tardó demasiado en responder. Intenta de nuevo.');
  });
});
