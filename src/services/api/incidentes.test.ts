import { describe, it, expect } from 'vitest';
import * as incidentes from './incidentes';
import type { Incidente } from './incidentes';
import { describeCrudContract } from '../../test/crudContract';

describe('services/incidentes', () => {
  it('trae los 2 incidentes semilla, ambos pendientes', async () => {
    const all = await incidentes.getAll();
    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(all.every((i) => i.estado === 'pendiente' || i.estado === 'resuelto')).toBe(true);
  });
});

describeCrudContract<Incidente>(
  'incidentes',
  incidentes,
  () => ({
    descripcion: 'Incidente de prueba',
    parqueaderoId: '1',
    fecha: new Date().toISOString(),
    estado: 'pendiente',
  }),
  () => ({ estado: 'resuelto', notasResolucion: 'Resuelto en el test' }),
);
