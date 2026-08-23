import { conductoresTable, type Conductor } from './_db';
import { createCrudService } from './_crud';

export type { Conductor };

const crud = createCrudService<Conductor>(conductoresTable.get, conductoresTable.set, 'cond', 'Conductor');

export const getAll = crud.getAll;
export const getById = crud.getById;
export const create = crud.create;
export const update = crud.update;
export const remove = crud.remove;
