import { usuariosTable, type Usuario } from './_db';
import { createCrudService } from './_crud';

export type { Usuario };

const crud = createCrudService<Usuario>(usuariosTable.get, usuariosTable.set, 'usr', 'Usuario');

export const getAll = crud.getAll;
export const getById = crud.getById;
export const create = crud.create;
export const update = crud.update;
export const remove = crud.remove;
