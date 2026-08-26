/**
 * Contrato CRUD que implementa cada módulo de dominio en `services/api/*.ts`
 * (getAll/getById/create/update/remove). Lo consume `queryFactory.ts` para
 * tipar sus hooks de React Query genéricamente por dominio.
 */
export interface CrudService<T> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | undefined>;
  create: (data: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, data: Partial<Omit<T, 'id'>>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}
