import { describe, it, expect } from 'vitest';
import * as controlSalida from './controlSalida';
import type { ControlSalida } from './controlSalida';
import { describeCrudContract } from '../../test/crudContract';

describe('services/controlSalida', () => {
  it('trae los controles semilla en estado en_parqueadero', async () => {
    const all = await controlSalida.getAll();
    expect(all.some((c) => c.id === 'cs1' && c.estado === 'en_parqueadero')).toBe(true);
  });
});

describeCrudContract<ControlSalida>(
  'controlSalida',
  controlSalida,
  () => ({
    vehiculoId: 'v1',
    celdaId: 'c0',
    fechaEntrada: '2025-01-01T08:00',
    estado: 'en_parqueadero',
  }),
  () => ({ estado: 'finalizado', fechaSalida: '2025-01-01T18:00' }),
);
