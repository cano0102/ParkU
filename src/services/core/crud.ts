/**
 * Fábrica de operaciones CRUD reutilizada por cada módulo de dominio en
 * services/. Todas las funciones son `async` aunque el store interno (ver
 * _db.ts) sea síncrono: es lo que permite que un dominio cambie después su
 * implementación interna por una llamada real a Firestore sin que ningún
 * caller (hooks de React Query, tests) tenga que cambiar.
 */
import { createId } from './db';

export interface CrudService<T> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | undefined>;
  create: (data: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, data: Partial<Omit<T, 'id'>>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export function createCrudService<T extends { id: string }>(
  getStore: () => T[],
  setStore: (next: T[]) => void,
  idPrefix: string,
  entityName: string,
): CrudService<T> {
  return {
    async getAll() {
      return [...getStore()];
    },
    async getById(id: string) {
      return getStore().find((item) => item.id === id);
    },
    async create(data: Omit<T, 'id'>) {
      const created = { ...data, id: createId(idPrefix) } as T;
      setStore([...getStore(), created]);
      return created;
    },
    async update(id: string, data: Partial<Omit<T, 'id'>>) {
      const current = getStore();
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) throw new Error(`${entityName} ${id} no encontrado`);
      const updated = { ...current[index], ...data };
      setStore(current.map((item, i) => (i === index ? updated : item)));
      return updated;
    },
    async remove(id: string) {
      const current = getStore();
      if (!current.some((item) => item.id === id)) throw new Error(`${entityName} ${id} no encontrado`);
      setStore(current.filter((item) => item.id !== id));
    },
  };
}
