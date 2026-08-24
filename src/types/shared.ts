/**
 * Tipos operativos/derivados que no pertenecen a un solo dominio de UI:
 * `ControlSalida` lo consumen control-salida, parqueaderos, reservas e
 * incidentes; `Movimiento` es 100% derivado (ver services/api/movimientos.ts)
 * y solo lo consume el dashboard de parqueaderos.
 */

export interface ControlSalida {
  id: string;
  vehiculoId: string;
  celdaId: string;
  fechaEntrada: string;
  fechaSalida?: string;
  estado: 'en_parqueadero' | 'finalizado';
}

export interface Movimiento {
  id: string;
  placa: string;
  tipo: 'entrada' | 'salida';
  fecha: string;
  parqueaderoId: string;
  conductorNombre: string;
}
