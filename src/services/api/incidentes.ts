/**
 * Incidentes contra la API real de Novedades (`/api/novedades`). El listado
 * completo y la gestión son solo Admin/Vigilante; cualquier usuario
 * autenticado puede crear una novedad propia, pero no listarlas (ver
 * verificarRol en el backend) — para un Conductor esta lista queda vacía.
 *
 * Sin equivalente mock: `tipoNovedad`/`prioridad` (obligatorios en la API
 * real) y el estado gana 3 valores nuevos (`en_proceso/rechazado/cancelado`)
 * sobre el ciclo pendiente/resuelto que ya tenía el mock. `evidencia`
 * (imagen en base64 embebida) se elimina: la API real la modela como un
 * sub-recurso aparte (`evidencia_novedad`, con URL, no base64 inline) que
 * esta integración no cubre todavía. `vehiculo`/`asignadoA` pasan de texto
 * libre a FKs reales (`vehiculoId`, `usuarioAsignadoId`).
 */
import { apiFetch, crearConRespaldo } from '../core/http';

/**
 * Un INCIDENTE es un daño, un choque o una problemática: ocurre sobre algo concreto (una
 * celda, un vehículo) y necesita tipo y prioridad para poder atenderlo. Una NOVEDAD es una
 * observación de la operación, sin gravedad: no arrastra celda ni vehículo, y solo la
 * registra el personal del parqueadero. Ver la migración 007 de la API.
 */
export type ClaseNovedad = 'incidente' | 'novedad';

export type TipoNovedad = 'danio' | 'accidente' | 'mal_estacionamiento' | 'queja' | 'otro';
export type PrioridadNovedad = 'baja' | 'media' | 'alta' | 'critica';
/* `rechazado` es el CERRADA de la API. El nombre cambió porque "cerrado" y "resuelto"
   contaban lo mismo (el incidente terminó bien) y no había forma de decir "esto no procede":
   ahora CERRADA es justamente ese desenlace, y como todo desenlace negativo exige un motivo
   que lee quien reportó. */
export type EstadoNovedad = 'pendiente' | 'en_proceso' | 'resuelto' | 'rechazado' | 'cancelado';

export interface Incidente {
  id: string;
  clase: ClaseNovedad;
  tipoNovedad: TipoNovedad;
  /** En qué consiste, cuando el tipo es "otro". Vacío en cualquier otro caso. */
  tipoOtro: string;
  /** Quién lo reportó. El personal autorizado puede dejarlo a nombre de otra persona. */
  usuarioReportaId: string;
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
  PENDIENTE: 'pendiente', EN_PROCESO: 'en_proceso', RESUELTA: 'resuelto', CERRADA: 'rechazado', CANCELADA: 'cancelado',
};
const ESTADO_A_API: Record<EstadoNovedad, string> = {
  pendiente: 'PENDIENTE', en_proceso: 'EN_PROCESO', resuelto: 'RESUELTA', rechazado: 'CERRADA', cancelado: 'CANCELADA',
};

interface ApiNovedad {
  id: number;
  clase?: string;
  tipo_novedad: string | null;
  tipo_otro?: string | null;
  usuario_reporta_id?: number | null;
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
    clase: (n.clase?.toLowerCase() as ClaseNovedad) ?? 'incidente',
    tipoNovedad: (n.tipo_novedad ? TIPO_DESDE_API[n.tipo_novedad] : undefined) ?? 'otro',
    tipoOtro: n.tipo_otro ?? '',
    usuarioReportaId: n.usuario_reporta_id != null ? String(n.usuario_reporta_id) : '',
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
  if (data.clase !== undefined) payload.clase = data.clase.toUpperCase();
  if (data.tipoNovedad !== undefined) payload.tipo_novedad = data.tipoNovedad.toUpperCase();
  if (data.tipoOtro !== undefined) payload.tipo_otro = data.tipoOtro || null;
  if (data.usuarioReportaId !== undefined) payload.usuario_reporta_id = data.usuarioReportaId ? Number(data.usuarioReportaId) : undefined;
  /* Vacío significa "no lo envío", no "ponlo en null": la API rechaza que Comunidad SENA
     mande prioridad o asignación (las define el personal autorizado al aceptar el reporte),
     y mandarlas en null contaba como mandarlas. */
  if (data.prioridad) payload.prioridad = data.prioridad.toUpperCase();
  if (data.descripcion !== undefined) payload.descripcion = data.descripcion;
  if (data.parqueaderoId !== undefined) payload.parqueadero_id = data.parqueaderoId ? Number(data.parqueaderoId) : null;
  if (data.celdaId !== undefined) payload.celda_id = data.celdaId ? Number(data.celdaId) : null;
  if (data.vehiculoId !== undefined) payload.vehiculo_id = data.vehiculoId ? Number(data.vehiculoId) : null;
  if (data.usuarioAsignadoId) payload.usuario_asignado_id = Number(data.usuarioAsignadoId);
  if (data.fecha !== undefined) payload.fecha_hora = data.fecha;
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
  // `POST /novedades` crea el registro pero responde `null` en el body (bug
  // confirmado en vivo del backend) — `crearConRespaldo` lo recupera con un
  // GET a la lista si el POST no lo trae.
  const created = await crearConRespaldo<ApiNovedad>('/novedades', toApiPayload(data), () => apiFetch<ApiNovedad[]>('/novedades'));
  return toFrontend(created);
}

export async function update(id: string, data: Partial<Omit<Incidente, 'id'>>): Promise<Incidente> {
  const updated = await apiFetch<ApiNovedad>(`/novedades/${id}`, { method: 'PUT', body: toApiPayload(data) });
  return toFrontend(updated);
}

export async function remove(id: string): Promise<void> {
  await apiFetch<void>(`/novedades/${id}`, { method: 'DELETE' });
}
