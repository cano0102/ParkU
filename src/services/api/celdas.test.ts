import { describe, it, expect, vi } from 'vitest';
import { createFakeRestBackend } from '../../test/fakeApi';
import { describeCrudContract } from '../../test/crudContract';
import * as celdas from './celdas';
import type { Celda } from './celdas';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('../core/http', () => ({ apiFetch: apiFetchMock }));

const seed = [
  { id: 1, parqueadero: 1, numero: 'C-001', tipo: 'CARRO', usabilidad: 'GENERAL', estado: 'DISPONIBLE', observaciones: null },
  { id: 2, parqueadero: 1, numero: 'C-002', tipo: 'MOTO', usabilidad: 'GENERAL', estado: 'OCUPADA', observaciones: null },
];
const backend = createFakeRestBackend('/celdas', seed);
apiFetchMock.mockImplementation(backend.apiFetch);

describe('services/celdas', () => {
  it('traduce estado/tipo/usabilidad desde la API real (mayúsculas -> minúsculas del mock)', async () => {
    const all = await celdas.getAll();
    expect(all).toEqual([
      { id: '1', parqueaderoId: '1', numero: 'C-001', tipo: 'carro', usabilidad: 'general', estado: 'disponible', ocupada: false, observaciones: '' },
      { id: '2', parqueaderoId: '1', numero: 'C-002', tipo: 'moto', usabilidad: 'general', estado: 'no_disponible', ocupada: true, observaciones: '' },
    ]);
  });
});

describeCrudContract<Celda>(
  'celdas',
  celdas,
  () => ({
    parqueaderoId: '1',
    numero: 'C-999',
    tipo: 'carro',
    usabilidad: 'general',
    estado: 'disponible',
    ocupada: false,
    observaciones: '',
  }),
  () => ({ estado: 'mantenimiento' }),
);
