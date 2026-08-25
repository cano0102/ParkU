/**
 * Vehículos contra la API real (`/api/vehiculos`). La relación con el
 * conductor ya no es una FK directa en el vehículo: es M:N vía
 * `detalle_propiedad`, y el GET ya trae resuelto `conductor_principal_id`/
 * `conductor_principal_nombre` (el propietario marcado `es_principal`).
 * Esta app solo necesita "el dueño" (1 conductor por vehículo en la UI), así
 * que `conductorId` se mapea a ese principal — se envía como `conductor_id`
 * al crear, que el backend usa para crear el vínculo en `detalle_propiedad`.
 *
 * Tampoco tiene ya `parqueaderoId/celdaId/fechaEntrada` propios: "dónde está
 * estacionado ahora" vive en `/api/entradas-salidas` (ver
 * services/api/controlSalida.ts), no en el vehículo.
 */
import { apiFetch } from '../core/http';

export interface Vehiculo {
  id: string;
  conductorId: string;
  conductorNombre: string;
  placa: string;
  tipo: 'carro' | 'moto' | 'bicicleta' | 'camion' | 'bus';
  marca: string;
  linea: string;
  /** Año del vehículo (columna `modelo` en la API real). */
  modelo: number | null;
  color: string;
  descripcion: string;
  estado: 'activo' | 'inactivo';
}

const TIPO_A_API: Record<Vehiculo['tipo'], string> = {
  carro: 'CARRO', moto: 'MOTO', bicicleta: 'BICICLETA', camion: 'CAMION', bus: 'BUS',
};
const TIPO_DESDE_API: Record<string, Vehiculo['tipo']> = {
  CARRO: 'carro', MOTO: 'moto', BICICLETA: 'bicicleta', CAMION: 'camion', BUS: 'bus',
};

interface ApiConductorResumen {
  id: number;
  nombre_apellidos: string;
  DetallePropiedad?: { es_principal: boolean };
}

interface ApiVehiculo {
  id: number;
  placa: string | null;
  tipo: string;
  marca: string | null;
  linea: string | null;
  modelo: number | null;
  color: string | null;
  observaciones: string | null;
  estado: boolean;
  conductores?: ApiConductorResumen[];
  conductor_principal_id?: number | null;
  conductor_principal_nombre?: string | null;
}

function toFrontend(v: ApiVehiculo): Vehiculo {
  const principal = v.conductores?.find((c) => c.DetallePropiedad?.es_principal) ?? v.conductores?.[0];
  const conductorId = v.conductor_principal_id ?? principal?.id ?? null;
  const conductorNombre = v.conductor_principal_nombre ?? principal?.nombre_apellidos ?? '';
  return {
    id: String(v.id),
    conductorId: conductorId != null ? String(conductorId) : '',
    conductorNombre,
    placa: v.placa ?? '',
    tipo: TIPO_DESDE_API[v.tipo] ?? 'carro',
    marca: v.marca ?? '',
    linea: v.linea ?? '',
    modelo: v.modelo,
    color: v.color ?? '',
    descripcion: v.observaciones ?? '',
    estado: v.estado ? 'activo' : 'inactivo',
  };
}

function toApiPayload(data: Partial<Omit<Vehiculo, 'id'>>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.conductorId !== undefined) payload.conductor_id = data.conductorId ? Number(data.conductorId) : undefined;
  if (data.placa !== undefined) payload.placa = data.placa || null;
  if (data.tipo !== undefined) payload.tipo = TIPO_A_API[data.tipo];
  if (data.marca !== undefined) payload.marca = data.marca || null;
  if (data.linea !== undefined) payload.linea = data.linea || null;
  if (data.modelo !== undefined) payload.modelo = data.modelo;
  if (data.color !== undefined) payload.color = data.color || null;
  if (data.descripcion !== undefined) payload.observaciones = data.descripcion || null;
  if (data.estado !== undefined) payload.estado = data.estado === 'activo';
  return payload;
}

export async function getAll(): Promise<Vehiculo[]> {
  const rows = await apiFetch<ApiVehiculo[]>('/vehiculos');
  return rows.map(toFrontend);
}

export async function getById(id: string): Promise<Vehiculo | undefined> {
  try {
    return toFrontend(await apiFetch<ApiVehiculo>(`/vehiculos/${id}`));
  } catch {
    return undefined;
  }
}

export async function create(data: Omit<Vehiculo, 'id'>): Promise<Vehiculo> {
  const created = await apiFetch<ApiVehiculo>('/vehiculos', { method: 'POST', body: toApiPayload(data) });
  return toFrontend(created);
}

export async function update(id: string, data: Partial<Omit<Vehiculo, 'id'>>): Promise<Vehiculo> {
  // La reasignación de conductor no se envía en update: el backend no
  // soporta cambiar el propietario principal desde PUT /vehiculos/:id.
  const { conductorId: _conductorId, ...resto } = data;
  void _conductorId;
  const updated = await apiFetch<ApiVehiculo>(`/vehiculos/${id}`, { method: 'PUT', body: toApiPayload(resto) });
  return toFrontend(updated);
}

export async function remove(id: string): Promise<void> {
  await apiFetch<void>(`/vehiculos/${id}`, { method: 'DELETE' });
}
