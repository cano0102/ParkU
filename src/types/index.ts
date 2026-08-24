/**
 * Barril de tipos de dominio, segregados por archivo desde la Fase 6
 * (antes vivían todos en este mismo archivo). Se reexportan todos desde
 * aquí para mantener compatibilidad total con las importaciones
 * existentes (`import type { Rol } from '@/types'` sigue funcionando
 * igual) — importar directo de `@/types/usuarios`, etc. también es válido
 * si el consumidor solo necesita los tipos de un dominio.
 */

export type { Rol, Usuario } from './usuarios';
export type { Parqueadero, Celda } from './parqueaderos';
export type { Conductor, Vehiculo } from './conductores';
export type { Reserva } from './reservas';
export type { Incidente } from './incidentes';
export type { ControlSalida, Movimiento } from './shared';
