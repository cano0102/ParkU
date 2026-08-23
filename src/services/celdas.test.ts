import { describe, it, expect } from 'vitest';
import * as celdas from './celdas';
import type { Celda } from './celdas';
import { describeCrudContract } from '../test/crudContract';

describe('services/celdas', () => {
  it('genera celdas para los 7 parqueaderos semilla', async () => {
    const all = await celdas.getAll();
    expect(all.length).toBeGreaterThan(0);
    expect(new Set(all.map((c) => c.parqueaderoId)).size).toBe(7);
  });

  it('ninguna celda queda "ocupada" sin invariantes rotas de tipo/estado', async () => {
    const all = await celdas.getAll();
    for (const c of all) {
      expect(c.ocupada).toBe(c.estado === 'no_disponible');
    }
  });
});

describeCrudContract<Celda>(
  'celdas',
  celdas,
  () => ({
    parqueaderoId: '1',
    numero: 'C-999',
    tipo: 'carro',
    estado: 'disponible',
    ocupada: false,
    nombre: 'Celda de prueba',
  }),
  () => ({ estado: 'mantenimiento' }),
);
