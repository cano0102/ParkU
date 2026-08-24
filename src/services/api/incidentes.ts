import { incidentesTable, type Incidente } from '../core/db';
import { createCrudService } from '../core/crud';

export type { Incidente };

const crud = createCrudService<Incidente>(incidentesTable.get, incidentesTable.set, 'inc', 'Incidente');

export const getAll = crud.getAll;
export const getById = crud.getById;
export const create = crud.create;
export const update = crud.update;
export const remove = crud.remove;
