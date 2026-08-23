/**
 * `movimientos` no es un dominio CRUD (por eso no se creó en la Fase 1): es
 * 100% derivado de controlSalida + vehiculos + conductores, más un puñado de
 * registros de demo fijos. Este módulo solo expone esos registros base de
 * solo lectura; el cálculo derivado vive en services/hooks/useMovimientos.ts,
 * que es quien de verdad combina las cuatro fuentes.
 */
import { movimientosBaseTable, type Movimiento } from './_db';

export type { Movimiento };

export async function getBase(): Promise<Movimiento[]> {
  return [...movimientosBaseTable.get()];
}
