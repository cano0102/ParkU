import { rolesTable, type Rol } from '../core/db';
import { createCrudService } from '../core/crud';

export type { Rol };

const crud = createCrudService<Rol>(rolesTable.get, rolesTable.set, 'rol', 'Rol');

export const getAll = crud.getAll;
export const getById = crud.getById;
export const create = crud.create;
export const update = crud.update;
export const remove = crud.remove;
