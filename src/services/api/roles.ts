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
 * agrupado por módulo). `getPermisosCatalogo`/`getPermisosDeRol` lo leen y
 * `guardarPermisosDeRol` lo escribe, con las rutas que la API expone de verdad:
 * `POST /roles-permisos` para asignar y `DELETE /roles-permisos/:id` para quitar
 * (no existe ningún PUT masivo por rol, comprobado contra la API), así que el
 * guardado se hace por diferencia contra lo que el rol ya tenía.
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
 * Permisos que un rol tiene asignados en `rol_permiso`, como mapa
 * `idDelPermiso -> idDeLaFila`. Hace falta el id de la FILA (no el del permiso) porque
 * quitar una asignación es `DELETE /roles-permisos/:id` sobre esa fila.
 */
export async function getPermisosDeRol(rolId: string): Promise<Map<string, string>> {
  const rows = await apiFetch<ApiRolPermiso[]>(`/roles-permisos/rol/${rolId}`);
  return new Map(rows.map((r) => [String(r.permiso), String(r.id)]));
}

/**
 * Deja el rol exactamente con los permisos indicados: asigna los que faltan y quita los
 * que sobran, comparando contra lo que el backend tiene guardado ahora mismo (no contra
 * lo que la pantalla creía tener, que puede estar desactualizado).
 *
 * La API no expone una ruta que reemplace todo el conjunto de una vez, así que se hace
 * con las dos que sí existen: `POST /roles-permisos` y `DELETE /roles-permisos/:id`.
 */
export async function guardarPermisosDeRol(rolId: string, permisoIds: string[]): Promise<void> {
  const actuales = await getPermisosDeRol(rolId);
  const deseados = new Set(permisoIds);

  const porAsignar = [...deseados].filter((permisoId) => !actuales.has(permisoId));
  const porQuitar = [...actuales.entries()].filter(([permisoId]) => !deseados.has(permisoId));

  for (const permisoId of porAsignar) {
    await apiFetch('/roles-permisos', {
      method: 'POST',
      body: { rol: Number(rolId), permiso: Number(permisoId) },
    });
  }

  for (const [, rolPermisoId] of porQuitar) {
    await apiFetch(`/roles-permisos/${rolPermisoId}`, { method: 'DELETE' });
  }
}
