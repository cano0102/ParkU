/**
 * Celdas contra la API real (`/api/celdas`). `estado` conserva los nombres
 * en minúscula que ya usaba el mock (`disponible/no_disponible/reservada/
 * mantenimiento`) — se traduce `OCUPADA` (nombre real) <-> `no_disponible`
 * (nombre que ya esperaba toda la UI) para no tener que tocar cada
 * componente que compara ese valor — más un 5º estado nuevo sin
 * equivalente mock (`inactiva`). `tipo` (forma del vehículo) y `usabilidad`
 * (general/ejecutivo/movilidad reducida/vehículo SENA) son campos separados
 * en el modelo real: el mock los mezclaba en un solo `tipo` con el valor
 * especial `"movilidad reducida"`.
 */
import { apiFetch, crearConRespaldo } from '../core/http';

export type TipoCelda = 'carro' | 'moto' | 'bicicleta' | 'camion' | 'bus';
export type UsabilidadCelda = 'general' | 'ejecutivo' | 'movilidad_reducida' | 'vehiculo_sena';
export type EstadoCelda = 'disponible' | 'no_disponible' | 'reservada' | 'mantenimiento' | 'inactiva';

export interface Celda {
  id: string;
  parqueaderoId: string;
  numero: string;
  tipo: TipoCelda;
  usabilidad: UsabilidadCelda;
  estado: EstadoCelda;
  /** Derivado de `estado === 'no_disponible'` — se conserva por compatibilidad con la UI existente. */
  ocupada: boolean;
  observaciones: string;
}

const ESTADO_DESDE_API: Record<string, EstadoCelda> = {
  DISPONIBLE: 'disponible', OCUPADA: 'no_disponible', RESERVADA: 'reservada',
  MANTENIMIENTO: 'mantenimiento', INACTIVA: 'inactiva',
};
const ESTADO_A_API: Record<EstadoCelda, string> = {
  disponible: 'DISPONIBLE', no_disponible: 'OCUPADA', reservada: 'RESERVADA',
  mantenimiento: 'MANTENIMIENTO', inactiva: 'INACTIVA',
};

interface ApiCelda {
  id: number;
  parqueadero: number;
  numero: string;
  tipo: string;
  usabilidad: string;
  estado: string;
  observaciones: string | null;
}

function toFrontend(c: ApiCelda): Celda {
  const estado = ESTADO_DESDE_API[c.estado] ?? 'disponible';
  return {
    id: String(c.id),
    parqueaderoId: String(c.parqueadero),
    numero: c.numero,
    tipo: (c.tipo?.toLowerCase() as TipoCelda) ?? 'carro',
    usabilidad: (c.usabilidad?.toLowerCase() as UsabilidadCelda) ?? 'general',
    estado,
    ocupada: estado === 'no_disponible',
    observaciones: c.observaciones ?? '',
  };
}

function toApiPayload(data: Partial<Omit<Celda, 'id'>>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.parqueaderoId !== undefined) payload.parqueadero = Number(data.parqueaderoId);
  if (data.numero !== undefined) payload.numero = data.numero;
  if (data.tipo !== undefined) payload.tipo = data.tipo.toUpperCase();
  if (data.usabilidad !== undefined) payload.usabilidad = data.usabilidad.toUpperCase();
  if (data.estado !== undefined) payload.estado = ESTADO_A_API[data.estado];
  if (data.observaciones !== undefined) payload.observaciones = data.observaciones || null;
  return payload;
}

export async function getAll(): Promise<Celda[]> {
  const rows = await apiFetch<ApiCelda[]>('/celdas');
  return rows.map(toFrontend);
}

export async function getById(id: string): Promise<Celda | undefined> {
  try {
    return toFrontend(await apiFetch<ApiCelda>(`/celdas/${id}`));
  } catch {
    return undefined;
  }
}

export async function create(data: Omit<Celda, 'id'>): Promise<Celda> {
  // `POST /celdas` crea el registro pero responde `null` en el body (bug
  // confirmado en vivo del backend) — `crearConRespaldo` lo recupera con un
  // GET a la lista si el POST no lo trae.
  const created = await crearConRespaldo<ApiCelda>('/celdas', toApiPayload(data), () => apiFetch<ApiCelda[]>('/celdas'));
  return toFrontend(created);
}

export async function update(id: string, data: Partial<Omit<Celda, 'id'>>): Promise<Celda> {
  // El estado de una celda se cambia normalmente por PUT/:id; el endpoint
  // /disponibilidad (con motivo) existe pero es para el flujo de
  // mantenimiento dedicado, que esta pantalla no usa todavía.
  const updated = await apiFetch<ApiCelda>(`/celdas/${id}`, { method: 'PUT', body: toApiPayload(data) });
  return toFrontend(updated);
}

export async function remove(id: string): Promise<void> {
  await apiFetch<void>(`/celdas/${id}`, { method: 'DELETE' });
}
