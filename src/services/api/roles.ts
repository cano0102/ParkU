/**
 * Roles contra la API real (`/api/roles`, solo Admin). El modelo real
 * (`rol`: id, nombre, descripcion, estado boolean) no tiene una columna de
 * permisos granular — la autorización real de cada endpoint está
 * hardcodeada por rol_id en el servidor (`verificarRol([...])`), no
 * consultada desde una tabla editable (ver `services/core/roles.ts`).
 *
 * Por eso `permisos` en el `Rol` que ve la UI es un campo **derivado, no
 * persistido**: para los 3 roles fijos (Admin=1/Vigilante=2/Conductor=3) se
 * completa con la matriz estática real; para cualquier rol adicional que un
 * Admin cree desde esta pantalla, se muestra en blanco (esos roles no tienen
 * ningún efecto de autorización en el backend actual). El formulario de
 * Roles se mantiene sin cambios — solo `nombre/descripcion/estado` viajan
 * de verdad a la API en `create`/`update`.
 *
 * El backend tiene un modelo `permiso`/`rol_permiso` real (M:N, con catálogo
 * agrupado por módulo). `getPermisosCatalogo` lee el catálogo y
 * `guardarPermisosDeRol` escribe la asignación de un rol con
 * `PUT /roles/:id/permisos`, que recibe el CONJUNTO COMPLETO
 * (`{ permisos: [1, 2, 4] }`) y retira lo que no esté en la lista.
 *
 * Es la única vía para desmarcar: `POST /roles-permisos` solo sabe añadir. La
 * lectura sale de `permiso_ids` del propio rol, con `GET /roles-permisos/rol/:id`
 * como respaldo si esa respuesta no lo incluyera.
 */
import { apiFetch } from '../core/http';
import { PERMISOS_POR_ROL, PERMISOS_VACIOS, esRolId, type PermisosRol } from '../core/roles';

export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: PermisosRol;
  estado: 'activo' | 'inactivo';
}

interface ApiRol {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
  /** Ids de los permisos asignados al rol; es lo que hay que marcar al editarlo. */
  permiso_ids?: number[];
}

function toFrontend(r: ApiRol): Rol {
  return {
    id: String(r.id),
    nombre: r.nombre,
    descripcion: r.descripcion ?? '',
    permisos: esRolId(r.id) ? PERMISOS_POR_ROL[r.id] : { ...PERMISOS_VACIOS },
    estado: r.estado ? 'activo' : 'inactivo',
  };
}

function toApiPayload(data: Partial<Omit<Rol, 'id'>>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.descripcion !== undefined) payload.descripcion = data.descripcion;
  if (data.estado !== undefined) payload.estado = data.estado === 'activo';
  return payload;
}

export async function getAll(): Promise<Rol[]> {
  const rows = await apiFetch<ApiRol[]>('/roles');
  return rows.map(toFrontend);
}

export async function getById(id: string): Promise<Rol | undefined> {
  try {
    return toFrontend(await apiFetch<ApiRol>(`/roles/${id}`));
  } catch {
    return undefined;
  }
}

export async function create(data: Omit<Rol, 'id'>): Promise<Rol> {
  const created = await apiFetch<ApiRol>('/roles', { method: 'POST', body: toApiPayload(data) });
  return toFrontend(created);
}

export async function update(id: string, data: Partial<Omit<Rol, 'id'>>): Promise<Rol> {
  const updated = await apiFetch<ApiRol>(`/roles/${id}`, { method: 'PUT', body: toApiPayload(data) });
  return toFrontend(updated);
}

export async function remove(id: string): Promise<void> {
  await apiFetch<void>(`/roles/${id}`, { method: 'DELETE' });
}

/** Un permiso del catálogo real (`/api/permisos`), agrupado por módulo. */
export interface PermisoCatalogo {
  id: string;
  nombre: string;
  descripcion: string;
  moduloId: string;
  moduloNombre: string;
}

interface ApiPermiso {
  id: number;
  modulo_id: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
  modulo?: { id: number; nombre: string };
}

/** Catálogo completo de permisos definidos en el backend, sin importar a qué rol
 *  estén asignados — ver la nota de solo-lectura en el encabezado del archivo. */
export async function getPermisosCatalogo(): Promise<PermisoCatalogo[]> {
  const rows = await apiFetch<ApiPermiso[]>('/permisos');
  return rows
    .filter((p) => p.estado)
    .map((p) => ({
      id: String(p.id),
      nombre: p.nombre,
      descripcion: p.descripcion ?? '',
      moduloId: String(p.modulo_id),
      moduloNombre: p.modulo?.nombre ?? 'Sin módulo',
    }));
}

interface ApiRolPermiso {
  id: number;
  rol: number;
  permiso: number;
}

/**
 * Ids de los permisos que el rol tiene asignados. La fuente principal es `permiso_ids`
 * del propio rol; si esa respuesta no lo trae (backend anterior), se recurre a la tabla
 * intermedia `GET /roles-permisos/rol/:id`.
 */
export async function getPermisosDeRol(rolId: string): Promise<Set<string>> {
  const rol = await apiFetch<ApiRol>(`/roles/${rolId}`);
  if (Array.isArray(rol?.permiso_ids)) {
    return new Set(rol.permiso_ids.map(String));
  }

  const rows = await apiFetch<ApiRolPermiso[]>(`/roles-permisos/rol/${rolId}`);
  return new Set(rows.map((r) => String(r.permiso)));
}

/**
 * Deja el rol exactamente con los permisos indicados, en UNA sola llamada:
 * `PUT /roles/:id/permisos` recibe el conjunto completo y retira lo que no esté en él.
 *
 * Es la única forma de desmarcar una casilla: `POST /roles-permisos` solo añade, así que
 * hacerlo por diferencia (un POST/DELETE por permiso) no llegaba a quitar nada.
 */
export async function guardarPermisosDeRol(rolId: string, permisoIds: string[]): Promise<void> {
  await apiFetch(`/roles/${rolId}/permisos`, {
    method: 'PUT',
    body: { permisos: permisoIds.map(Number) },
  });
}
