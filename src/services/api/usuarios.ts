/**
 * Usuarios contra la API real (`/api/usuarios`, solo Admin). El modelo real
 * (`usuario`: id, nombre, correo, contrasena, rol_id, estado ENUM,
 * numero_telefonico) no tiene columnas `foto`/`tipoUsuario`/`tipoDocumento`/
 * `identificacion` — esos datos de persona (documento, tipo) viven en la
 * entidad Conductor (`services/api/conductores.ts`), separada de la cuenta
 * de acceso. `numero_telefonico` sí es de la cuenta (no de la persona:
 * `conductor.numero_telefonico` es un campo aparte) y por eso sí se maneja
 * acá. Por eso el `Usuario` que administra esta pantalla se reduce a
 * credenciales + rol + estado + teléfono de contacto; documento/tipo se
 * gestionan desde Conductores.
 *
 * `contrasena` nunca viaja en `update()`: la API rechaza un PUT que la
 * incluya (usa `PATCH /:id/contrasena`, ver services/api/auth.ts#changePassword)
 * — no hay forma de que un Admin restablezca la contraseña de otro usuario
 * sin conocerla, así que si `data.password` llega con contenido en `update`,
 * simplemente se ignora (no hay endpoint real para esa acción).
 */
import { apiFetch } from '../core/http';
import { esRolId, ROLES, type RolId } from '../core/roles';

export interface Usuario {
  id: string;
  correo: string;
  /** Solo se usa al crear; vacío en las respuestas y al editar. */
  password: string;
  nombre: string;
  /** Teléfono de contacto de la cuenta (opcional). */
  numero: string;
  rol: RolId;
  estado: 'activo' | 'inactivo';
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
}

function toFrontend(u: ApiUsuario): Usuario {
  return {
    id: String(u.id),
    correo: u.correo,
    password: '',
    nombre: u.nombre,
    numero: u.numero_telefonico ?? '',
    rol: esRolId(u.rol_id) ? u.rol_id : ROLES.CONDUCTOR,
    estado: u.estado === 'ACTIVO' ? 'activo' : 'inactivo',
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
      nombre: data.nombre,
      numero_telefonico: data.numero.trim() || undefined,
      rol_id: data.rol,
      // La API espera el ENUM en mayúsculas ("ACTIVO"/"INACTIVO"), no un
      // booleano — confirmado en vivo: enviar `true`/`false` aquí hace que
      // el backend responda 500 en cada creación.
      estado: data.estado === 'activo' ? 'ACTIVO' : 'INACTIVO',
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
  const updated = await apiFetch<ApiUsuario>(`/usuarios/${id}`, { method: 'PUT', body: payload });
  return toFrontend(updated);
}

export async function remove(id: string): Promise<void> {
  await apiFetch<void>(`/usuarios/${id}`, { method: 'DELETE' });
}
