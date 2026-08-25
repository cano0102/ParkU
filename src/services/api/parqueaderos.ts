/**
 * Parqueaderos contra la API real (`/api/parqueaderos`). Ya no auto-genera
 * celdas al crear un parqueadero ni las borra en cascada al eliminarlo (así
 * lo hacía el mock) — la API real no lo hace, las celdas se administran una
 * a una desde la pantalla de Celdas. `celdasCarros/celdasMotos/
 * celdasMovilidadReducida` tampoco existen en el modelo real: se calculan
 * en `features/parqueaderos/hooks/useParqueaderosData.ts` agrupando
 * `GET /api/celdas` por parqueadero+tipo, no aquí.
 */
import { apiFetch } from '../core/http';

export type TipoParqueadero = 'general' | 'docentes' | 'administrativos' | 'aprendices' | 'visitantes' | 'motos' | 'vehiculo_sena';
export type AccesoParqueadero = 'regional' | 'avenida_boyaca';

export interface Parqueadero {
  id: string;
  nombre: string;
  ubicacion: string;
  acceso: AccesoParqueadero;
  capacidadMaxima: number;
  horaInicio: string;
  horaFin: string;
  estado: 'activo' | 'inactivo';
  zona: string;
  piso: string;
  descripcion: string;
  tipo: TipoParqueadero;
}

interface ApiParqueadero {
  id: number;
  nombre: string;
  ubicacion: string;
  acceso: string;
  capacidad_maxima: number;
  hora_apertura: string | null;
  hora_cierre: string | null;
  estado: boolean;
  zona: string | null;
  piso: string | null;
  descripcion: string | null;
  tipo: string;
}

function toFrontend(p: ApiParqueadero): Parqueadero {
  return {
    id: String(p.id),
    nombre: p.nombre,
    ubicacion: p.ubicacion,
    acceso: (p.acceso?.toLowerCase() as AccesoParqueadero) ?? 'regional',
    capacidadMaxima: p.capacidad_maxima,
    horaInicio: (p.hora_apertura ?? '').slice(0, 5),
    horaFin: (p.hora_cierre ?? '').slice(0, 5),
    estado: p.estado ? 'activo' : 'inactivo',
    zona: p.zona ?? '',
    piso: p.piso ?? '',
    descripcion: p.descripcion ?? '',
    tipo: (p.tipo?.toLowerCase() as TipoParqueadero) ?? 'general',
  };
}

function toApiPayload(data: Partial<Omit<Parqueadero, 'id'>>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.ubicacion !== undefined) payload.ubicacion = data.ubicacion;
  if (data.acceso !== undefined) payload.acceso = data.acceso.toUpperCase();
  if (data.capacidadMaxima !== undefined) payload.capacidad_maxima = data.capacidadMaxima;
  if (data.horaInicio !== undefined) payload.hora_apertura = data.horaInicio || null;
  if (data.horaFin !== undefined) payload.hora_cierre = data.horaFin || null;
  if (data.zona !== undefined) payload.zona = data.zona || null;
  if (data.piso !== undefined) payload.piso = data.piso || null;
  if (data.descripcion !== undefined) payload.descripcion = data.descripcion || null;
  if (data.tipo !== undefined) payload.tipo = data.tipo.toUpperCase();
  return payload;
}

export async function getAll(): Promise<Parqueadero[]> {
  const rows = await apiFetch<ApiParqueadero[]>('/parqueaderos');
  return rows.map(toFrontend);
}

export async function getById(id: string): Promise<Parqueadero | undefined> {
  try {
    return toFrontend(await apiFetch<ApiParqueadero>(`/parqueaderos/${id}`));
  } catch {
    return undefined;
  }
}

export async function create(data: Omit<Parqueadero, 'id'>): Promise<Parqueadero> {
  const created = await apiFetch<ApiParqueadero>('/parqueaderos', { method: 'POST', body: toApiPayload(data) });
  return toFrontend(created);
}

export async function update(id: string, data: Partial<Omit<Parqueadero, 'id'>>): Promise<Parqueadero> {
  // `estado` se cambia por un endpoint aparte (PATCH /:id/estado, exige motivo);
  // si viene en el patch junto a otros campos, se aplica ese cambio por separado.
  const { estado, ...resto } = data;
  let updated: ApiParqueadero;
  if (Object.keys(resto).length > 0) {
    updated = await apiFetch<ApiParqueadero>(`/parqueaderos/${id}`, { method: 'PUT', body: toApiPayload(resto) });
  } else {
    updated = await apiFetch<ApiParqueadero>(`/parqueaderos/${id}`);
  }
  if (estado !== undefined) {
    updated = await apiFetch<ApiParqueadero>(`/parqueaderos/${id}/estado`, {
      method: 'PATCH',
      body: { estado: estado === 'activo', motivo: 'Actualizado desde el panel de administración' },
    });
  }
  return toFrontend(updated);
}

export async function remove(id: string): Promise<void> {
  await apiFetch<void>(`/parqueaderos/${id}`, { method: 'DELETE' });
}
