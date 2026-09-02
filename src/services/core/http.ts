/**
 * Cliente fetch fino para la API real (Api-ParkU). Reemplaza el store en
 * memoria (`db.ts`/`crud.ts`, eliminados) como única puerta de entrada a la
 * red para todo `services/api/*.ts`.
 *
 * Contrato de la API (confirmado leyendo el repo del backend y probando en
 * vivo): casi todos los recursos devuelven el JSON crudo (array u objeto)
 * sin envoltorio; solo `/api/auth/*` responde `{success, message, data}`.
 * Los errores llegan en una de tres formas — `{message}` (errores de
 * negocio), `{status, message}` (auth/rol/404), o
 * `{success:false, errors:[{campo|field, mensaje|message}]}` (validación) —
 * `apiFetch` normaliza cualquiera de esas formas a un `Error(mensaje)` plano,
 * igual que lanzaban los servicios mock, para que los `catch` de hooks y
 * formularios existentes no tengan que cambiar.
 */
import { getToken, getRefreshToken, setToken, clearTokens } from './tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL;
const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT) || 15000;

export const AUTH_EXPIRED_EVENT = 'parku:auth-expired';

/** `fetch` con límite de tiempo (`VITE_API_TIMEOUT`): sin esto, una petición
 *  colgada (backend caído a medias, red intermitente) se queda esperando para
 *  siempre sin que el usuario vea ningún error ni pueda reintentar. */
function fetchConTimeout(input: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

function esErrorPorTimeout(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  /** Se serializa con JSON.stringify; omitir para peticiones sin cuerpo. */
  body?: unknown;
  /** Si es false, no se agrega el header Authorization (login/registro). Default: true. */
  auth?: boolean;
}

interface ApiErrorItem {
  campo?: string;
  field?: string;
  mensaje?: string;
  message?: string;
}

interface ApiErrorBody {
  message?: string;
  errors?: ApiErrorItem[];
}

/** Mensaje de respaldo por código HTTP, usado SOLO cuando el backend responde un error sin
 *  `message` ni `errors` útiles (body vacío o inesperado) — evita mostrar el crudo "Error 404"
 *  en esos casos, sin inventar un motivo que el backend no dio. */
const MENSAJE_POR_STATUS: Partial<Record<number, string>> = {
  400: 'La solicitud no es válida. Revisa los datos ingresados.',
  401: 'Tu sesión no es válida. Inicia sesión de nuevo.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No se encontró el recurso solicitado.',
  409: 'La operación no se pudo completar por un conflicto con datos existentes.',
  422: 'Los datos ingresados no son válidos. Revisa el formulario.',
  500: 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.',
};

function extraerMensajeError(body: unknown, status: number): string {
  const b = body as ApiErrorBody | null;
  if (b && Array.isArray(b.errors) && b.errors.length > 0) {
    const mensajes = b.errors
      .map((e) => e.mensaje ?? e.message)
      .filter((m): m is string => Boolean(m));
    if (mensajes.length > 0) return mensajes.join(' ');
  }
  if (b && typeof b.message === 'string' && b.message) return b.message;
  return MENSAJE_POR_STATUS[status] ?? `Error ${status}`;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetchConTimeout(`${BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return null;
        const body = await res.json().catch(() => null);
        const nuevoToken: string | undefined = body?.data?.token;
        if (!nuevoToken) return null;
        setToken(nuevoToken);
        return nuevoToken;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Ejecuta una petición contra la API real y devuelve el body ya parseado.
 * `path` es relativo a `VITE_API_URL` (p. ej. `/usuarios`, `/auth/login`).
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const ejecutar = async (): Promise<Response> => {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string> | undefined),
    };
    if (auth) {
      const token = getToken();
      if (token) h.Authorization = `Bearer ${token}`;
    }
    return fetchConTimeout(`${BASE_URL}${path}`, {
      ...rest,
      headers: h,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res: Response;
  try {
    res = await ejecutar();
  } catch (error) {
    if (esErrorPorTimeout(error)) throw new Error('El servidor tardó demasiado en responder. Intenta de nuevo.');
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión a internet.');
  }

  if (res.status === 401 && auth) {
    const nuevoToken = await refreshAccessToken();
    if (nuevoToken) {
      try {
        res = await ejecutar();
      } catch (error) {
        if (esErrorPorTimeout(error)) throw new Error('El servidor tardó demasiado en responder. Intenta de nuevo.');
        throw new Error('No se pudo conectar con el servidor. Revisa tu conexión a internet.');
      }
    } else {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      }
    }
  }

  const parsedBody = await parseJsonSafe(res);

  if (!res.ok) {
    throw new Error(extraerMensajeError(parsedBody, res.status));
  }

  return parsedBody as T;
}

/**
 * Compensa un bug confirmado del backend real: `POST` en `/reservas`,
 * `/celdas`, `/vehiculos`, `/novedades` y `/parqueaderos` crea el registro
 * correctamente (queda en la base de datos) pero responde `null` en el body
 * en vez del objeto creado — sin esto, cada creación en esos 5 dominios
 * lanzaba un `TypeError` al intentar leer campos de `null` y el usuario veía
 * un error aunque el registro sí se hubiera guardado.
 *
 * Si el POST no trae el objeto creado, se recupera con un `GET` de la lista
 * completa y se toma el de mayor `id` (asume ids autoincrementales; no
 * blinda contra otra creación concurrente en el mismo instante, un riesgo
 * aceptable para el volumen de uso de esta app).
 */
export async function crearConRespaldo<T extends { id: number }>(
  path: string,
  body: unknown,
  fetchTodosCrudo: () => Promise<T[]>,
): Promise<T> {
  const creado = await apiFetch<T | null>(path, { method: 'POST', body });
  if (creado) return creado;
  const todos = await fetchTodosCrudo();
  if (todos.length === 0) {
    throw new Error('El registro se creó pero no se pudo recuperar. Actualiza la página.');
  }
  return todos.reduce((max, item) => (item.id > max.id ? item : max));
}
