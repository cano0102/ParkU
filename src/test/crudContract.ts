import { describe, it, expect } from 'vitest';

/**
 * Batería de pruebas compartida para el contrato CRUD que expone cada módulo
 * de dominio en src/services/ (getAll/getById/create/update/remove). Evita
 * repetir las mismas 6 aserciones en cada archivo *.test.ts de servicio.
 */
export interface CrudLike<T extends { id: string }> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T | undefined>;
  create: (data: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, data: Partial<Omit<T, 'id'>>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export function describeCrudContract<T extends { id: string }>(
  name: string,
  service: CrudLike<T>,
  buildSample: () => Omit<T, 'id'>,
  patchSample: () => Partial<Omit<T, 'id'>>,
) {
  describe(`${name} (contrato CRUD)`, () => {
    it('getAll devuelve un array', async () => {
      const all = await service.getAll();
      expect(Array.isArray(all)).toBe(true);
    });

    it('create agrega un registro con id y lo hace recuperable', async () => {
      const before = await service.getAll();
      const created = await service.create(buildSample());
      expect(created.id).toBeTruthy();

      const after = await service.getAll();
      expect(after.length).toBe(before.length + 1);

      const found = await service.getById(created.id);
      expect(found).toEqual(created);
    });

    it('update aplica un merge parcial sin perder el resto de campos', async () => {
      const created = await service.create(buildSample());
      const patch = patchSample();
      const updated = await service.update(created.id, patch);
      expect(updated.id).toBe(created.id);
      expect(updated).toMatchObject(patch);
    });

    it('update sobre un id inexistente lanza error', async () => {
      await expect(service.update('no-existe-xyz', patchSample())).rejects.toThrow();
    });

    it('remove elimina el registro', async () => {
      const created = await service.create(buildSample());
      await service.remove(created.id);
      const found = await service.getById(created.id);
      expect(found).toBeUndefined();
    });

    it('remove sobre un id inexistente lanza error', async () => {
      await expect(service.remove('no-existe-xyz')).rejects.toThrow();
    });
  });
}
