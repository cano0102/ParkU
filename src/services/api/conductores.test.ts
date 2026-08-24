import { describe, it, expect } from 'vitest';
import * as conductores from './conductores';
import type { Conductor } from './conductores';
import { describeCrudContract } from '../../test/crudContract';

describe('services/conductores', () => {
  it('trae los 10 conductores semilla', async () => {
    const all = await conductores.getAll();
    expect(all.length).toBeGreaterThanOrEqual(10);
  });
});

describeCrudContract<Conductor>(
  'conductores',
  conductores,
  () => ({
    usuarioId: '1',
    nombre: 'Conductor de prueba',
    tipoConductor: 'aprendiz',
    centroFormacion: 'Pruebas',
    discapacidad: false,
    estado: 'activo',
    tipo: 'docente',
    email: 'conductor.prueba@sena.edu.co',
  }),
  () => ({ centroFormacion: 'Centro actualizado' }),
);
