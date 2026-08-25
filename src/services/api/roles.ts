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
