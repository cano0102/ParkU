import { describe, it, expect } from 'vitest';
import * as reservas from './reservas';
import type { Reserva } from './reservas';
import { describeCrudContract } from '../../test/crudContract';

describe('services/reservas', () => {
  it('empieza vacío (sin reservas semilla, igual que antes en DataContext)', async () => {
    const all = await reservas.getAll();
    expect(Array.isArray(all)).toBe(true);
  });
});

describeCrudContract<Reserva>(
  'reservas',
  reservas,
  () => ({
    vehiculoId: 'v1',
    celdaId: 'c0',
    fechaReserva: '2025-01-01',
    horaInicio: '08:00',
    horaFin: '10:00',
    estado: 'pendiente',
  }),
  () => ({ estado: 'activa' }),
);
