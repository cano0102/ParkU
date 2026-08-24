import { celdasTable, type Celda } from '../core/db';
import { createCrudService } from '../core/crud';

export type { Celda };

const crud = createCrudService<Celda>(celdasTable.get, celdasTable.set, 'c', 'Celda');

export const getAll = crud.getAll;
export const getById = crud.getById;
export const create = crud.create;
export const update = crud.update;
export const remove = crud.remove;
