import { reservasTable, type Reserva } from './_db';
import { createCrudService } from './_crud';

export type { Reserva };

const crud = createCrudService<Reserva>(reservasTable.get, reservasTable.set, 'res', 'Reserva');

export const getAll = crud.getAll;
export const getById = crud.getById;
export const create = crud.create;
export const update = crud.update;
export const remove = crud.remove;
