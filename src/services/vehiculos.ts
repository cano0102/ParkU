import { vehiculosTable, type Vehiculo } from './_db';
import { createCrudService } from './_crud';

export type { Vehiculo };

const crud = createCrudService<Vehiculo>(vehiculosTable.get, vehiculosTable.set, 'veh', 'Vehículo');

export const getAll = crud.getAll;
export const getById = crud.getById;
export const create = crud.create;
export const update = crud.update;
export const remove = crud.remove;
