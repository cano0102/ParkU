/**
 * Usuarios contra la API real (`/api/usuarios`, solo Admin).
 *
 * El documento (`tipo_documento` + `numero_documento`) SÍ es columna de `usuario`: el
 * backend lo movió a la cuenta (migración 002). Antes no lo era, y esta pantalla lo
 * guardaba creando un Conductor vinculado — por eso crear una cuenta hacía aparecer un
 * conductor que nadie había pedido, y esa cuenta quedaba marcada como "ya vinculada" y
 * desaparecía del selector de Conductores. Ese rodeo ya no existe: el documento viaja en el
 * mismo POST/PUT que el resto de la cuenta.
 *
 * Lo que sigue SIN ser de la cuenta es el "tipo de usuario" (Aprendiz/Instructor/…): es del
 * conductor, y por eso no se pide en este formulario. El perfil de conductor se crea donde
 * de verdad hace falta: al registrarse uno mismo, al darlo de alta en Conductores, o al
 * registrar su vehículo para parquearlo.
 *
 * `contrasena` nunca viaja en `update()`: la API rechaza un PUT que la
 * incluya (usa `PATCH /:id/contrasena`, ver services/api/auth.ts#changePassword)
 * — no hay forma de que un Admin restablezca la contraseña de otro usuario
 * sin conocerla, así que si `data.password` llega con contenido en `update`,
 * simplemente se ignora (no hay endpoint real para esa acción).
 */
import { apiFetch } from '../core/http';
import type { RolId } from '../core/roles';

export interface Usuario {
  id: string;
  correo: string;
  /** Documento de identidad de la cuenta (columnas reales de `usuario`). */
  tipoDocumento?: string;
  numeroDocumento?: string;
  /** Solo se usa al crear; vacío en las respuestas y al editar. */
  password: string;
  /** Repetición de la contraseña. La API la EXIGE al crear (`confirmar_contrasena`):
   *  sin ella responde 400 "Debes confirmar la contraseña". Solo se usa al crear. */
  confirmPassword?: string;
  nombre: string;
  /** Teléfono de contacto de la cuenta (opcional). */
  numero: string;
  /** Id del rol tal como lo devuelve la API. No se limita a los 3 roles fijos
   *  (Admin/Vigilante/Conductor): un Admin puede crear roles nuevos desde la pantalla de
   *  Roles, y esas cuentas deben conservar SU rol, no caer a uno por defecto. */
  rol: number;
  estado: 'activo' | 'inactivo';
  /** Fecha de creación que devuelva la API. Solo llega en las lecturas: nadie la envía
   *  al crear o actualizar, por eso es opcional. */
  fechaCreacion?: string;
}

interface ApiUsuario {
  id: number;
  correo: string;
  nombre: string;
  numero_telefonico?: string | null;
  /** La API real nombra esta columna `rol_id` (confirmado en vivo) — antes se
   *  leía `rol` (inexistente en la respuesta real), así que todo usuario
   *  caía siempre al rol por defecto sin importar el suyo real. */
  rol_id: number;
  estado: string;
  tipo_documento?: string | null;
  numero_documento?: string | null;
  /** Fecha de alta de la cuenta. El nombre depende de cómo la exponga la API (Sequelize
   *  suele dar `createdAt`; una columna manual, `created_at` o `fecha_creacion`), así que
   *  se aceptan las variantes en vez de asumir una: si no llega ninguna, el listado ordena
   *  por id (ver compararUsuariosPorRecientes). */
  createdAt?: string | null;
  created_at?: string | null;
  fecha_creacion?: string | null;
}

function toFrontend(u: ApiUsuario): Usuario {
  return {
    id: String(u.id),
    correo: u.correo,
    password: '',
    nombre: u.nombre,
    numero: u.numero_telefonico ?? '',
    // Antes, cualquier rol que no fuera 1/2/3 se convertía silenciosamente en Conductor:
    // un usuario con un rol creado por el Admin aparecía (y se guardaba) como otro rol.
    rol: u.rol_id,
    estado: u.estado === 'ACTIVO' ? 'activo' : 'inactivo',
    tipoDocumento: u.tipo_documento ?? '',
    numeroDocumento: u.numero_documento ?? '',
    fechaCreacion: u.createdAt ?? u.created_at ?? u.fecha_creacion ?? '',
  };
}

export async function getAll(): Promise<Usuario[]> {
  const rows = await apiFetch<ApiUsuario[]>('/usuarios');
  return rows.map(toFrontend);
}

export async function getById(id: string): Promise<Usuario | undefined> {
  try {
    return toFrontend(await apiFetch<ApiUsuario>(`/usuarios/${id}`));
  } catch {
    return undefined;
  }
}

export async function create(data: Omit<Usuario, 'id'>): Promise<Usuario> {
  const created = await apiFetch<ApiUsuario>('/usuarios', {
    method: 'POST',
    body: {
      correo: data.correo.trim().toLowerCase(),
      contrasena: data.password,
      // Requerido por la API: sin este campo responde 400 "Debes confirmar la contraseña
      // (envía confirmar_contrasena)" y la cuenta no se crea. Se manda la confirmación que
      // escribió el usuario; si quien llama no la trae, se repite la contraseña.
      confirmar_contrasena: data.confirmPassword ?? data.password,
      nombre: data.nombre,
      numero_telefonico: data.numero.trim() || undefined,
      rol_id: data.rol,
      // La API espera el ENUM en mayúsculas ("ACTIVO"/"INACTIVO"), no un
      // booleano — confirmado en vivo: enviar `true`/`false` aquí hace que
      // el backend responda 500 en cada creación.
      estado: data.estado === 'activo' ? 'ACTIVO' : 'INACTIVO',
      // Van juntos o no van: el backend responde 400 si llega solo uno.
      ...(data.numeroDocumento?.trim()
        ? { tipo_documento: data.tipoDocumento || 'CC', numero_documento: data.numeroDocumento.trim() }
        : {}),
    },
  });
  return toFrontend(created);
}

export async function update(id: string, data: Partial<Omit<Usuario, 'id'>>): Promise<Usuario> {
  const payload: Record<string, unknown> = {};
  if (data.correo !== undefined) payload.correo = data.correo.trim().toLowerCase();
  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.numero !== undefined) payload.numero_telefonico = data.numero.trim() || null;
  if (data.rol !== undefined) payload.rol_id = data.rol;
  // Mismo caso que en `create`: el backend exige el ENUM en mayúsculas, un
  // booleano hace que la actualización falle con 500 (bug reproducido en vivo).
  if (data.estado !== undefined) payload.estado = data.estado === 'activo' ? 'ACTIVO' : 'INACTIVO';
  // Igual que en `create`: los dos campos del documento viajan juntos o no viajan.
  if (data.numeroDocumento?.trim()) {
    payload.tipo_documento = data.tipoDocumento || 'CC';
    payload.numero_documento = data.numeroDocumento.trim();
  }
  const updated = await apiFetch<ApiUsuario>(`/usuarios/${id}`, { method: 'PUT', body: payload });
  return toFrontend(updated);
}

export async function remove(id: string): Promise<void> {
  await apiFetch<void>(`/usuarios/${id}`, { method: 'DELETE' });
}
