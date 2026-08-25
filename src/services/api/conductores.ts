/**
 * Conductores contra la API real (`/api/conductores`). El modelo real trae
 * su propio nombre/documento/correo/teléfono (no dependen de un Usuario
 * vinculado como en el mock) y `usuario_id` es opcional — muchos
 * conductores reales se registran desde vigilancia sin cuenta propia. El
 * "tipo de conductor" del mock (aprendiz/instructor/...) pasa a ser una FK
 * a un catálogo real (`tipo_usuario_id`, ver services/api/catalogos.ts) en
 * vez de un enum libre.
 */
import { apiFetch } from '../core/http';

export interface Conductor {
  id: string;
  usuarioId: string;
  tipoDocumento: 'CC' | 'CE' | 'TI' | 'PASAPORTE' | 'PEP' | 'NIT';
  numeroDocumento: string;
  nombre: string;
  correo: string;
  direccion: string;
  numeroTelefonico: string;
  tipoUsuarioId: string;
  /** Nombre del tipo de usuario, ya resuelto por la API — solo lectura. */
  tipoUsuarioNombre: string;
  regionalFormacion: string;
  centroFormacion: string;
  programaFormacion: string;
  /** Fecha (YYYY-MM-DD) hasta la que es válido el registro; puede venir vacía. */
  vigencia: string;
  movilidadReducida: boolean;
  tipoDiscapacidad: string;
  estado: 'activo' | 'inactivo';
}

interface ApiConductor {
  id: number;
  usuario_id: number | null;
  tipo_documento: Conductor['tipoDocumento'];
  numero_documento: string;
  nombre_apellidos: string;
  correo: string | null;
  direccion: string | null;
  numero_telefonico: string | null;
  tipo_usuario_id: number;
  tipo_usuario_nombre?: string;
  regional_formacion: string | null;
  centro_formacion: string | null;
  programa_formacion: string | null;
  vigencia: string | null;
  movilidad_reducida: boolean;
  tipo_discapacidad: string | null;
  estado: boolean;
}

function toFrontend(c: ApiConductor): Conductor {
  return {
    id: String(c.id),
    usuarioId: c.usuario_id != null ? String(c.usuario_id) : '',
    tipoDocumento: c.tipo_documento,
    numeroDocumento: c.numero_documento,
    nombre: c.nombre_apellidos,
    correo: c.correo ?? '',
    direccion: c.direccion ?? '',
    numeroTelefonico: c.numero_telefonico ?? '',
    tipoUsuarioId: String(c.tipo_usuario_id),
    tipoUsuarioNombre: c.tipo_usuario_nombre ?? '',
    regionalFormacion: c.regional_formacion ?? '',
    centroFormacion: c.centro_formacion ?? '',
    programaFormacion: c.programa_formacion ?? '',
    vigencia: c.vigencia ?? '',
    movilidadReducida: c.movilidad_reducida,
    tipoDiscapacidad: c.tipo_discapacidad ?? '',
    estado: c.estado ? 'activo' : 'inactivo',
  };
}

function toApiPayload(data: Partial<Omit<Conductor, 'id'>>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.usuarioId !== undefined) payload.usuario_id = data.usuarioId ? Number(data.usuarioId) : null;
  if (data.tipoDocumento !== undefined) payload.tipo_documento = data.tipoDocumento;
  if (data.numeroDocumento !== undefined) payload.numero_documento = data.numeroDocumento;
  if (data.nombre !== undefined) payload.nombre_apellidos = data.nombre;
  if (data.correo !== undefined) payload.correo = data.correo || null;
  if (data.direccion !== undefined) payload.direccion = data.direccion || null;
  if (data.numeroTelefonico !== undefined) payload.numero_telefonico = data.numeroTelefonico || null;
  if (data.tipoUsuarioId !== undefined) payload.tipo_usuario_id = Number(data.tipoUsuarioId);
  if (data.regionalFormacion !== undefined) payload.regional_formacion = data.regionalFormacion || null;
  if (data.centroFormacion !== undefined) payload.centro_formacion = data.centroFormacion || null;
  if (data.programaFormacion !== undefined) payload.programa_formacion = data.programaFormacion || null;
  if (data.vigencia !== undefined) payload.vigencia = data.vigencia || null;
  if (data.movilidadReducida !== undefined) payload.movilidad_reducida = data.movilidadReducida;
  if (data.tipoDiscapacidad !== undefined) payload.tipo_discapacidad = data.tipoDiscapacidad || null;
  if (data.estado !== undefined) payload.estado = data.estado === 'activo';
  return payload;
}

export async function getAll(): Promise<Conductor[]> {
  const rows = await apiFetch<ApiConductor[]>('/conductores');
  return rows.map(toFrontend);
}

export async function getById(id: string): Promise<Conductor | undefined> {
  try {
    return toFrontend(await apiFetch<ApiConductor>(`/conductores/${id}`));
  } catch {
    return undefined;
  }
}

export async function create(data: Omit<Conductor, 'id'>): Promise<Conductor> {
  const created = await apiFetch<ApiConductor>('/conductores', { method: 'POST', body: toApiPayload(data) });
  return toFrontend(created);
}

export async function update(id: string, data: Partial<Omit<Conductor, 'id'>>): Promise<Conductor> {
  const updated = await apiFetch<ApiConductor>(`/conductores/${id}`, { method: 'PUT', body: toApiPayload(data) });
  return toFrontend(updated);
}

export async function remove(id: string): Promise<void> {
  await apiFetch<void>(`/conductores/${id}`, { method: 'DELETE' });
}
