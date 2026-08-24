import { parqueaderosTable, celdasTable, type Parqueadero, type Celda } from '../core/db';
import { createCrudService } from '../core/crud';

export type { Parqueadero };

const crud = createCrudService<Parqueadero>(parqueaderosTable.get, parqueaderosTable.set, 'pq', 'Parqueadero');

export const getAll = crud.getAll;
export const getById = crud.getById;
export const update = crud.update;

function buildCeldas(pq: Parqueadero): Celda[] {
  const nuevas: Celda[] = [];
  for (let i = 0; i < pq.celdasCarros; i++) {
    nuevas.push({ id: `c-${pq.id}-c${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, parqueaderoId: pq.id, numero: `C-${String(i + 1).padStart(3, '0')}`, tipo: 'carro', estado: 'disponible', ocupada: false, nombre: `${pq.nombre}-C${i + 1}` });
  }
  for (let i = 0; i < pq.celdasMotos; i++) {
    nuevas.push({ id: `c-${pq.id}-m${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, parqueaderoId: pq.id, numero: `M-${String(i + 1).padStart(3, '0')}`, tipo: 'moto', estado: 'disponible', ocupada: false, nombre: `${pq.nombre}-M${i + 1}` });
  }
  for (let i = 0; i < pq.celdasMovilidadReducida; i++) {
    nuevas.push({ id: `c-${pq.id}-mr${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, parqueaderoId: pq.id, numero: `MR-${String(i + 1).padStart(3, '0')}`, tipo: 'movilidad reducida', estado: 'disponible', ocupada: false, nombre: `${pq.nombre}-MR${i + 1}` });
  }
  return nuevas;
}

/** Igual que el antiguo `addParqueadero` de DataContext: crear un parqueadero
 * también genera sus celdas (carro/moto/movilidad reducida) según los
 * conteos indicados. */
export async function create(data: Omit<Parqueadero, 'id'>): Promise<Parqueadero> {
  const created = await crud.create(data);
  celdasTable.set([...celdasTable.get(), ...buildCeldas(created)]);
  return created;
}

/** Igual que el antiguo `deleteParqueadero`: elimina en cascada todas las
 * celdas que pertenecían a este parqueadero. */
export async function remove(id: string): Promise<void> {
  await crud.remove(id);
  celdasTable.set(celdasTable.get().filter((c) => c.parqueaderoId !== id));
}
