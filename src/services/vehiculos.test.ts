import { describe, it, expect } from 'vitest';
import * as vehiculos from './vehiculos';
import type { Vehiculo } from './vehiculos';
import { describeCrudContract } from '../test/crudContract';

describe('services/vehiculos', () => {
  it('trae el vehículo semilla ABC123', async () => {
    const all = await vehiculos.getAll();
    expect(all.some((v) => v.placa === 'ABC123')).toBe(true);
  });
});

describeCrudContract<Vehiculo>(
  'vehiculos',
  vehiculos,
  () => ({
    conductorId: '1',
    placa: 'TST999',
    tipo: 'carro',
    marca: 'Marca',
    modelo: 'Modelo',
    año: 2024,
    color: 'Blanco',
    descripcion: 'Vehículo de prueba',
    estado: 'activo',
    parqueaderoId: '1',
    celdaId: 'c0',
    fechaEntrada: '2025-01-01T08:00',
  }),
  () => ({ color: 'Negro' }),
);
