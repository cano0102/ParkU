/**
 * Entradas/salidas contra la API real (`/api/entradas-salidas`, solo
 * Admin/Vigilante). Un mismo `registro_acceso` cubre ingreso Y salida
 * (`fecha_hora_salida` null = el vehículo sigue adentro) — no hay un solo
 * endpoint de "crear" genérico como en el mock: `create()` siempre registra
 * un INGRESO (`POST /entrada`) y `update()` con `estado: 'finalizado'`
 * registra la SALIDA del ingreso abierto de ese vehículo (`POST /salida`).
 *
 * Ya no depende de `Vehiculo.parqueaderoId/celdaId/fechaEntrada` (esos
 * campos no existen en el modelo real): este registro ES la fuente de
 * verdad de "dónde está estacionado un vehículo ahora", no el vehículo.
 */
import { apiFetch } from '../core/http';

export interface ControlSalida {
  id: string;
  vehiculoId: string;
  conductorId: string;
  parqueaderoId: string;
  celdaId: string;
  fechaEntrada: string;
  fechaSalida?: string;
  estado: 'en_parqueadero' | 'finalizado';
}

interface ApiRegistroAcceso {
  id: number;
  vehiculo_id: number;
  conductor_id: number | null;
  parqueadero_id: number;
  celda_id: number | null;
  fecha_hora_ingreso: string;
  fecha_hora_salida: string | null;
  estado: 'DENTRO' | 'FINALIZADO' | 'BLOQUEADO';
}

function toFrontend(r: ApiRegistroAcceso): ControlSalida {
  return {
    id: String(r.id),
    vehiculoId: String(r.vehiculo_id),
    conductorId: r.conductor_id != null ? String(r.conductor_id) : '',
    parqueaderoId: String(r.parqueadero_id),
    celdaId: r.celda_id != null ? String(r.celda_id) : '',
    fechaEntrada: r.fecha_hora_ingreso,
    fechaSalida: r.fecha_hora_salida ?? undefined,
    estado: r.estado === 'DENTRO' ? 'en_parqueadero' : 'finalizado',
  };
}

export async function getAll(): Promise<ControlSalida[]> {
  const rows = await apiFetch<ApiRegistroAcceso[]>('/entradas-salidas');
  return rows.map(toFrontend);
}

export async function getById(id: string): Promise<ControlSalida | undefined> {
  try {
    return toFrontend(await apiFetch<ApiRegistroAcceso>(`/entradas-salidas/${id}`));
  } catch {
    return undefined;
  }
}

export async function create(data: Omit<ControlSalida, 'id'>): Promise<ControlSalida> {
  const created = await apiFetch<ApiRegistroAcceso>('/entradas-salidas/entrada', {
    method: 'POST',
    body: {
      vehiculo_id: Number(data.vehiculoId),
      conductor_id: data.conductorId ? Number(data.conductorId) : undefined,
      parqueadero_id: Number(data.parqueaderoId),
      celda_id: data.celdaId ? Number(data.celdaId) : undefined,
      fecha_hora_ingreso: data.fechaEntrada,
    },
  });
  return toFrontend(created);
}

export async function update(id: string, data: Partial<Omit<ControlSalida, 'id'>>): Promise<ControlSalida> {
  if (data.estado === 'finalizado') {
    const actual = await getById(id);
    if (!actual) throw new Error('Registro de entrada/salida no encontrado');
    const updated = await apiFetch<ApiRegistroAcceso>('/entradas-salidas/salida', {
      method: 'POST',
      body: { vehiculo_id: Number(actual.vehiculoId), fecha_hora_salida: data.fechaSalida },
    });
    return toFrontend(updated);
  }
  // No hay más campos editables sobre un registro ya abierto fuera de registrar su salida.
  const actual = await getById(id);
  if (!actual) throw new Error('Registro de entrada/salida no encontrado');
  return actual;
}

export async function remove(id: string): Promise<void> {
  await apiFetch<void>(`/entradas-salidas/${id}`, { method: 'DELETE' });
}
