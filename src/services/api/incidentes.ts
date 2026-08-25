/**
 * Incidentes contra la API real de Novedades (`/api/novedades`). El listado
 * completo y la gestión son solo Admin/Vigilante; cualquier usuario
 * autenticado puede crear una novedad propia, pero no listarlas (ver
 * verificarRol en el backend) — para un Conductor esta lista queda vacía.
 *
 * Sin equivalente mock: `tipoNovedad`/`prioridad` (obligatorios en la API
 * real) y el estado gana 3 valores nuevos (`en_proceso/cerrado/cancelado`)
 * sobre el ciclo pendiente/resuelto que ya tenía el mock. `evidencia`
 * (imagen en base64 embebida) se elimina: la API real la modela como un
 * sub-recurso aparte (`evidencia_novedad`, con URL, no base64 inline) que
 * esta integración no cubre todavía. `vehiculo`/`asignadoA` pasan de texto
 * libre a FKs reales (`vehiculoId`, `usuarioAsignadoId`).
 */
import { apiFetch } from '../core/http';

export type TipoNovedad = 'danio' | 'accidente' | 'mal_estacionamiento' | 'queja' | 'otro';
export type PrioridadNovedad = 'baja' | 'media' | 'alta' | 'critica';
export type EstadoNovedad = 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado' | 'cancelado';

export interface Incidente {
  id: string;
  tipoNovedad: TipoNovedad;
  prioridad: PrioridadNovedad;
  descripcion: string;
  parqueaderoId: string;
  celdaId: string;
  vehiculoId: string;
  usuarioAsignadoId: string;
  fecha: string;
  estado: EstadoNovedad;
  justificacionCierre: string;
}

const TIPO_DESDE_API: Record<string, TipoNovedad> = {
  DANIO: 'danio', ACCIDENTE: 'accidente', MAL_ESTACIONAMIENTO: 'mal_estacionamiento', QUEJA: 'queja', OTRO: 'otro',
};
const ESTADO_DESDE_API: Record<string, EstadoNovedad> = {
  PENDIENTE: 'pendiente', EN_PROCESO: 'en_proceso', RESUELTA: 'resuelto', CERRADA: 'cerrado', CANCELADA: 'cancelado',
};
const ESTADO_A_API: Record<EstadoNovedad, string> = {
  pendiente: 'PENDIENTE', en_proceso: 'EN_PROCESO', resuelto: 'RESUELTA', cerrado: 'CERRADA', cancelado: 'CANCELADA',
};

interface ApiNovedad {
  id: number;
  tipo_novedad: string;
  prioridad: string;
  descripcion: string;
  parqueadero_id: number | null;
  celda_id: number | null;
  vehiculo_id: number | null;
  usuario_asignado_id: number | null;
  fecha_hora: string;
  estado: string;
  justificacion_cierre: string | null;
}

function toFrontend(n: ApiNovedad): Incidente {
  return {
    id: String(n.id),
    tipoNovedad: TIPO_DESDE_API[n.tipo_novedad] ?? 'otro',
    prioridad: (n.prioridad?.toLowerCase() as PrioridadNovedad) ?? 'media',
    descripcion: n.descripcion,
    parqueaderoId: n.parqueadero_id != null ? String(n.parqueadero_id) : '',
    celdaId: n.celda_id != null ? String(n.celda_id) : '',
    vehiculoId: n.vehiculo_id != null ? String(n.vehiculo_id) : '',
    usuarioAsignadoId: n.usuario_asignado_id != null ? String(n.usuario_asignado_id) : '',
    fecha: n.fecha_hora,
    estado: ESTADO_DESDE_API[n.estado] ?? 'pendiente',
    justificacionCierre: n.justificacion_cierre ?? '',
  };
}

function toApiPayload(data: Partial<Omit<Incidente, 'id'>>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.tipoNovedad !== undefined) payload.tipo_novedad = data.tipoNovedad.toUpperCase();
  if (data.prioridad !== undefined) payload.prioridad = data.prioridad.toUpperCase();
  if (data.descripcion !== undefined) payload.descripcion = data.descripcion;
  if (data.parqueaderoId !== undefined) payload.parqueadero_id = data.parqueaderoId ? Number(data.parqueaderoId) : null;
  if (data.celdaId !== undefined) payload.celda_id = data.celdaId ? Number(data.celdaId) : null;
  if (data.vehiculoId !== undefined) payload.vehiculo_id = data.vehiculoId ? Number(data.vehiculoId) : null;
  if (data.usuarioAsignadoId !== undefined) payload.usuario_asignado_id = data.usuarioAsignadoId ? Number(data.usuarioAsignadoId) : null;
  if (data.estado !== undefined) payload.estado = ESTADO_A_API[data.estado];
  if (data.justificacionCierre !== undefined) payload.justificacion_cierre = data.justificacionCierre || null;
  return payload;
}

export async function getAll(): Promise<Incidente[]> {
  const rows = await apiFetch<ApiNovedad[]>('/novedades');
  return rows.map(toFrontend);
}

export async function getById(id: string): Promise<Incidente | undefined> {
  try {
    return toFrontend(await apiFetch<ApiNovedad>(`/novedades/${id}`));
  } catch {
    return undefined;
  }
}

export async function create(data: Omit<Incidente, 'id'>): Promise<Incidente> {
  const created = await apiFetch<ApiNovedad>('/novedades', { method: 'POST', body: toApiPayload(data) });
  return toFrontend(created);
}

export async function update(id: string, data: Partial<Omit<Incidente, 'id'>>): Promise<Incidente> {
  const updated = await apiFetch<ApiNovedad>(`/novedades/${id}`, { method: 'PUT', body: toApiPayload(data) });
  return toFrontend(updated);
}

export async function remove(id: string): Promise<void> {
  await apiFetch<void>(`/novedades/${id}`, { method: 'DELETE' });
}
