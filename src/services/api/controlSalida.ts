import { controlSalidaTable, type ControlSalida } from '../core/db';
import { createCrudService } from '../core/crud';

export type { ControlSalida };

const crud = createCrudService<ControlSalida>(controlSalidaTable.get, controlSalidaTable.set, 'cs', 'Control de salida');

export const getAll = crud.getAll;
export const getById = crud.getById;
export const create = crud.create;
export const update = crud.update;
export const remove = crud.remove;
