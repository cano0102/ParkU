/**
 * Reservas contra la API real (`/api/reservas`). `estado` conserva los
 * nombres que ya usaba el mock donde hay equivalente real
 * (`pendiente/activa/completada/cancelada`, mapeados a
 * `PENDIENTE/ACEPTADA/TERMINADA/CANCELADA`) más un 5º estado nuevo sin
 * equivalente mock (`rechazada` = `RECHAZADA`) — el ciclo de vida real tiene
 * un paso de aprobación por Admin/Vigilante que el mock no modelaba: una
 * reserva creada por un Conductor queda `pendiente` hasta que se acepta o
 * rechaza.
 *
 * `fechaReserva/horaInicio/horaFin` se mantienen como 3 campos separados
 * (igual que el mock) aunque la API real use un solo rango datetime
 * (`fecha_hora_inicio`/`fecha_hora_fin`) — la combinación/separación vive
 * aquí para no tocar los formularios existentes.
 */
import { apiFetch, crearConRespaldo } from '../core/http';

export type TipoReserva = 'vehiculo_sena' | 'movilidad_reducida' | 'visitante';
export type EstadoReserva = 'pendiente' | 'activa' | 'rechazada' | 'completada' | 'cancelada';

export interface Reserva {
  id: string;
  tipoReserva: TipoReserva;
  vehiculoId: string;
  celdaId: string;
  conductorId: string;
  motivo: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  estado: EstadoReserva;
}

const ESTADO_DESDE_API: Record<string, EstadoReserva> = {
  PENDIENTE: 'pendiente', ACEPTADA: 'activa', RECHAZADA: 'rechazada',
  TERMINADA: 'completada', CANCELADA: 'cancelada',
};
const ESTADO_A_API: Record<EstadoReserva, string> = {
  pendiente: 'PENDIENTE', activa: 'ACEPTADA', rechazada: 'RECHAZADA',
  completada: 'TERMINADA', cancelada: 'CANCELADA',
};
/** `PATCH /:id/estado` solo acepta estas 4 transiciones (no `PENDIENTE`, es el estado inicial). */
const ESTADOS_GESTIONABLES: EstadoReserva[] = ['activa', 'rechazada', 'completada', 'cancelada'];

interface ApiReserva {
  id: number;
  tipo_reserva: string;
  celda_id: number;
  conductor_id: number | null;
  vehiculo_id: number | null;
  motivo: string | null;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  estado: string;
}

function partirFechaHora(iso: string): { fecha: string; hora: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { fecha: '', hora: '' };
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    fecha: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function combinarFechaHora(fecha: string, hora: string): string {
  return new Date(`${fecha}T${hora}:00`).toISOString();
}

function toFrontend(r: ApiReserva): Reserva {
  const inicio = partirFechaHora(r.fecha_hora_inicio);
  const fin = partirFechaHora(r.fecha_hora_fin);
  return {
    id: String(r.id),
    tipoReserva: (r.tipo_reserva?.toLowerCase() as TipoReserva) ?? 'visitante',
    vehiculoId: r.vehiculo_id != null ? String(r.vehiculo_id) : '',
    celdaId: String(r.celda_id),
    conductorId: r.conductor_id != null ? String(r.conductor_id) : '',
    motivo: r.motivo ?? '',
    fechaReserva: inicio.fecha,
    horaInicio: inicio.hora,
    horaFin: fin.hora,
    estado: ESTADO_DESDE_API[r.estado] ?? 'pendiente',
  };
}

export async function getAll(): Promise<Reserva[]> {
  const rows = await apiFetch<ApiReserva[]>('/reservas');
  return rows.map(toFrontend);
}

/**
 * Reservas de un vehículo puntual. A diferencia de `getAll` (solo Admin/
 * Vigilante, `GET /reservas` responde 403 para un Conductor), esta ruta sí
 * la puede consultar cualquier usuario autenticado — es lo que usa el
 * Dashboard simplificado del rol Comunidad SENA para mostrar sus reservas
 * sin necesitar el listado completo.
 */
export async function getByVehiculo(vehiculoId: string): Promise<Reserva[]> {
  const rows = await apiFetch<ApiReserva[]>(`/reservas/vehiculo/${vehiculoId}`);
  return rows.map(toFrontend);
}

export async function getById(id: string): Promise<Reserva | undefined> {
  try {
    return toFrontend(await apiFetch<ApiReserva>(`/reservas/${id}`));
  } catch {
    return undefined;
  }
}

export async function create(data: Omit<Reserva, 'id'>): Promise<Reserva> {
  // `POST /reservas` crea el registro pero responde `null` en el body (bug
  // confirmado en vivo del backend) — `crearConRespaldo` recupera el
  // registro creado con un GET a la lista si el POST no lo trae.
  const created = await crearConRespaldo<ApiReserva>(
    '/reservas',
    {
      tipo_reserva: data.tipoReserva.toUpperCase(),
      celda_id: Number(data.celdaId),
      conductor_id: data.conductorId ? Number(data.conductorId) : undefined,
      vehiculo_id: data.vehiculoId ? Number(data.vehiculoId) : undefined,
      motivo: data.motivo || undefined,
      fecha_hora_inicio: combinarFechaHora(data.fechaReserva, data.horaInicio),
      fecha_hora_fin: combinarFechaHora(data.fechaReserva, data.horaFin),
    },
    () => apiFetch<ApiReserva[]>('/reservas'),
  );
  return toFrontend(created);
}

export async function update(id: string, data: Partial<Omit<Reserva, 'id'>>): Promise<Reserva> {
  // El estado se gestiona por su propio endpoint (PATCH /:id/estado); si viene junto a
  // otros campos en el mismo patch, primero se aplican los demás campos y luego el estado.
  const { estado, ...resto } = data;
  let updated: ApiReserva | undefined;
  if (Object.keys(resto).length > 0) {
    const actual = await apiFetch<ApiReserva>(`/reservas/${id}`);
    const inicioFecha = resto.fechaReserva ?? partirFechaHora(actual.fecha_hora_inicio).fecha;
    const inicioHora = resto.horaInicio ?? partirFechaHora(actual.fecha_hora_inicio).hora;
    const finHora = resto.horaFin ?? partirFechaHora(actual.fecha_hora_fin).hora;
    updated = await apiFetch<ApiReserva>(`/reservas/${id}`, {
      method: 'PUT',
      body: {
        tipo_reserva: resto.tipoReserva?.toUpperCase(),
        celda_id: resto.celdaId ? Number(resto.celdaId) : undefined,
        conductor_id: resto.conductorId !== undefined ? (resto.conductorId ? Number(resto.conductorId) : null) : undefined,
        vehiculo_id: resto.vehiculoId !== undefined ? (resto.vehiculoId ? Number(resto.vehiculoId) : null) : undefined,
        motivo: resto.motivo,
        fecha_hora_inicio: (resto.fechaReserva || resto.horaInicio) ? combinarFechaHora(inicioFecha, inicioHora) : undefined,
        fecha_hora_fin: (resto.fechaReserva || resto.horaFin) ? combinarFechaHora(inicioFecha, finHora) : undefined,
      },
    });
  }
  if (estado !== undefined) {
    const estadoApi = ESTADOS_GESTIONABLES.includes(estado) ? ESTADO_A_API[estado] : null;
    if (estadoApi) {
      // Bug confirmado en vivo: `PATCH /:id/estado` sí aplica el cambio (un GET posterior lo
      // confirma), pero responde el registro con el `estado` de ANTES del cambio, no el nuevo.
      // No se usa `updated` como fuente de verdad para el estado en ningún sitio de llamada —
      // todos dependen de la invalidación de la query de reservas (ver queryFactory.ts) para
      // refrescar con el GET real, así que esta respuesta obsoleta no llega a mostrarse.
      updated = await apiFetch<ApiReserva>(`/reservas/${id}/estado`, { method: 'PATCH', body: { estado: estadoApi } });
    }
  }
  return toFrontend(updated ?? await apiFetch<ApiReserva>(`/reservas/${id}`));
}

export async function remove(id: string): Promise<void> {
  await apiFetch<void>(`/reservas/${id}`, { method: 'DELETE' });
}
