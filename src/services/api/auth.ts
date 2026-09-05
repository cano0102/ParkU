/**
 * Sesión/login contra la API real (Api-ParkU). Antes esto validaba
 * login/registro/reset contra el store mock de usuarios; ahora llama a
 * `/api/auth/*` y guarda el JWT + refresh token que devuelve (ver
 * `services/core/tokenStorage.ts`, leído por `services/core/http.ts` en cada
 * petición posterior).
 *
 * `getPermisos` se eliminó: los permisos ya no dependen de una consulta al
 * backend, son una matriz estática por rol (`services/core/roles.ts`) — ver
 * el porqué en el plan de conexión a la API.
 */
import { apiFetch } from '../core/http';
import { setTokens, clearTokens } from '../core/tokenStorage';
import type { RolId } from '../core/roles';

export interface AuthUser {
  id: string;
  correo: string;
  nombre: string;
  numero: string;
  rol: RolId;
  foto?: string;
  /** Permisos efectivos del rol, tal como los nombra el backend ("reservas.gestionar"…).
   *  Los devuelven el login, /auth/verificar y /auth/perfil. Con ellos se decide qué
   *  pantallas se ven -- ver permisosDeVistas en services/core/roles.ts. */
  permisos?: string[];
  /** Nombre real del rol, tal como está en la tabla `rol`. El token solo lleva el id, y la
   *  tabla estática del frontend solo conoce los tres del sistema: sin esto, un rol creado a
   *  medida se mostraba como "Desconocido" en el perfil. */
  rolNombre?: string;
  /** Documento de la cuenta, para que el Perfil identifique a la persona. */
  tipoDocumento?: string;
  numeroDocumento?: string;
}

export interface RegisterInput {
  correo: string;
  password: string;
  nombre: string;
  numero: string;
  /** El formulario los valida (formato + duplicado en vivo vía `existeDocumento`) pero
   *  Sí se envían: `POST /auth/registro` los guarda en la cuenta y además crea el perfil de
   *  Conductor vinculado. Aquí sí corresponde crearlo automáticamente — quien se registra es
   *  la propia persona que va a parquear, no un tercero al que un admin le abre cuenta. */
  tipoDocumento: string;
  identificacion: string;
  /** Perfil dentro del SENA (Aprendiz/Instructor/…), del catálogo /catalogos/tipos-usuario.
   *  Es un dato del CONDUCTOR que se crea con el registro. Opcional: si el catálogo no
   *  cargó, la cuenta se crea igual y el perfil queda por completar. */
  tipoUsuarioId?: string;
}

interface ApiUsuario {
  id: number;
  correo: string;
  nombre: string;
  numero?: string | null;
  rol: number;
  estado: string;
  permisos?: string[];
  rol_nombre?: string | null;
  tipo_documento?: string | null;
  numero_documento?: string | null;
}

interface LoginResponseData {
  user: ApiUsuario;
  token: string;
  refreshToken: string;
  expiresIn: string;
}

interface AuthEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

function toAuthUser(u: ApiUsuario): AuthUser {
  return {
    id: String(u.id),
    correo: u.correo,
    nombre: u.nombre,
    numero: u.numero ?? '',
    rol: u.rol as RolId,
    permisos: Array.isArray(u.permisos) ? u.permisos : [],
    rolNombre: u.rol_nombre ?? undefined,
    tipoDocumento: u.tipo_documento ?? undefined,
    numeroDocumento: u.numero_documento ?? undefined,
  };
}

export async function login(correo: string, password: string): Promise<AuthUser> {
  const res = await apiFetch<AuthEnvelope<LoginResponseData>>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { correo: correo.trim().toLowerCase(), contrasena: password },
  });
  setTokens(res.data.token, res.data.refreshToken);
  return toAuthUser(res.data.user);
}

/**
 * El registro público (`POST /api/auth/registro`) siempre crea rol Conductor y no devuelve
 * token — para mantener el "queda logueado" que ya tenía el mock, se hace login
 * inmediatamente después con las mismas credenciales.
 *
 * Con el documento, el backend crea también el Conductor de esa misma persona, vinculado a
 * la cuenta, en la misma transacción: si el documento ya estaba registrado responde 409 y no
 * queda ni cuenta ni conductor.
 */
export async function register(data: RegisterInput): Promise<AuthUser> {
  await apiFetch('/auth/registro', {
    method: 'POST',
    auth: false,
    body: {
      correo: data.correo.trim().toLowerCase(),
      contrasena: data.password,
      // Igual que en `/usuarios`: la API exige repetir la contraseña o responde 400
      // "Debes confirmar la contraseña (envía confirmar_contrasena)" — sin esto el
      // registro público no funcionaba para nadie. El formulario ya valida que la
      // confirmación coincida antes de llegar aquí (ver useRegisterForm).
      confirmar_contrasena: data.password,
      nombre: data.nombre.trim(),
      numero: data.numero?.trim() || undefined,
      // Los dos van juntos o no van: el backend responde 400 si llega solo uno.
      ...(data.identificacion?.trim()
        ? {
            tipo_documento: data.tipoDocumento || 'CC',
            numero_documento: data.identificacion.trim(),
            ...(data.tipoUsuarioId ? { tipo_usuario_id: Number(data.tipoUsuarioId) } : {}),
          }
        : {}),
    },
  });
  return login(data.correo, data.password);
}

/** Chequeo de disponibilidad en vivo del formulario de registro (antes del submit). */
export async function existeCorreo(correo: string): Promise<boolean> {
  const res = await apiFetch<{ success: boolean; existe: boolean }>(
    `/auth/existe-correo?correo=${encodeURIComponent(correo.trim().toLowerCase())}`,
    { auth: false }
  );
  return res.existe;
}

/** Igual que `existeCorreo`, para el número de teléfono. */
export async function existeNumero(numero: string): Promise<boolean> {
  const res = await apiFetch<{ success: boolean; existe: boolean }>(
    `/auth/existe-numero?numero=${encodeURIComponent(numero.trim())}`,
    { auth: false }
  );
  return res.existe;
}

/**
 * Igual que `existeCorreo`, para el documento de identidad. Solo informativo:
 * el registro público no crea un Conductor (ver auth.ts#register), así que
 * este chequeo evita que alguien use un documento que ya pertenece a otra
 * persona en el sistema, aunque ese documento no quede asociado a la cuenta
 * recién creada.
 */
export async function existeDocumento(tipoDocumento: string, numeroDocumento: string): Promise<boolean> {
  const res = await apiFetch<{ success: boolean; existe: boolean }>(
    `/auth/existe-documento?tipoDocumento=${encodeURIComponent(tipoDocumento)}&numeroDocumento=${encodeURIComponent(numeroDocumento.trim())}`,
    { auth: false }
  );
  return res.existe;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch {
    // best-effort: si el token ya expiró o la red falla, igual limpiamos la sesión local.
  } finally {
    clearTokens();
  }
}

/** Confirma contra el backend que el token guardado sigue siendo válido (bootstrap de sesión). */
export async function verificarToken(): Promise<AuthUser | null> {
  try {
    const res = await apiFetch<AuthEnvelope<{ usuario: ApiUsuario }>>('/auth/verificar');
    return toAuthUser(res.data.usuario);
  } catch {
    return null;
  }
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    await apiFetch(`/usuarios/${userId}/contrasena`, {
      method: 'PATCH',
      body: { actual: currentPassword, nueva: newPassword },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Genera un enlace de recuperación de un solo uso. En producción la API no
 * confirma si el correo existe (evita enumeración de cuentas): devuelve
 * éxito siempre, y solo incluye `token` en la respuesta fuera de producción.
 * Por eso `null` aquí no significa "el correo no existe" — el caller debe
 * tratarlo como "no hay enlace para mostrar en pantalla", no como error.
 */
export async function requestPasswordReset(correo: string): Promise<string | null> {
  const res = await apiFetch<{ success: boolean; message: string; token?: string }>('/auth/recuperar-password', {
    method: 'POST',
    auth: false,
    body: { correo: correo.trim().toLowerCase() },
  });
  return res.token ?? null;
}

export async function resetPasswordWithToken(token: string, newPassword: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await apiFetch<{ success: boolean; message: string }>('/auth/restablecer-password', {
      method: 'POST',
      auth: false,
      body: { token, nuevaContrasena: newPassword },
    });
    return { ok: true, message: res.message };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'El enlace de recuperación no es válido.' };
  }
}
