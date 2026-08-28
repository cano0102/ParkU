import { describe, it, expect, vi } from 'vitest';
import { createFakeRestBackend } from '../../test/fakeApi';
import { describeCrudContract } from '../../test/crudContract';
import * as vehiculos from './vehiculos';
import type { Vehiculo } from './vehiculos';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('../core/http', () => ({
  apiFetch: apiFetchMock,
  crearConRespaldo: async (path: string, body: unknown, fetchTodosCrudo: () => Promise<any[]>) => {
    const creado = await apiFetchMock(path, { method: 'POST', body });
    if (creado) return creado;
    const todos = await fetchTodosCrudo();
    return todos.reduce((max: any, item: any) => (item.id > max.id ? item : max));
  },
}));

const seed = [
  {
    id: 1, placa: 'ABC123', tipo: 'CARRO', marca: 'Chevrolet', linea: 'Spark GT', modelo: 2020,
    color: 'Rojo', observaciones: null, estado: true,
    conductores: [{ id: 1, nombre_apellidos: 'Conductor Uno', DetallePropiedad: { es_principal: true } }],
    conductor_principal_id: 1, conductor_principal_nombre: 'Conductor Uno',
  },
];
const backend = createFakeRestBackend('/vehiculos', seed);
apiFetchMock.mockImplementation(backend.apiFetch);

describe('services/vehiculos', () => {
  it('trae el vehículo semilla ABC123', async () => {
    const all = await vehiculos.getAll();
    expect(all.some((v) => v.placa === 'ABC123')).toBe(true);
  });

  it('resuelve conductorId/conductorNombre desde el propietario principal', async () => {
    const all = await vehiculos.getAll();
    const abc = all.find((v) => v.placa === 'ABC123')!;
    expect(abc.conductorId).toBe('1');
    expect(abc.conductorNombre).toBe('Conductor Uno');
  });

  it('update no reasigna el conductor (el backend no lo soporta desde PUT)', async () => {
    await vehiculos.update('1', { conductorId: '2', color: 'Negro' });
    const call = apiFetchMock.mock.calls.find(([path, opts]) => path === '/vehiculos/1' && (opts as any)?.method === 'PUT');
    expect((call?.[1] as any).body.conductor_id).toBeUndefined();
    expect((call?.[1] as any).body.color).toBe('Negro');
  });
});

describeCrudContract<Vehiculo>(
  'vehiculos',
  vehiculos,
  () => ({
    conductorId: '',
    conductorNombre: '',
    placa: `TST${Math.floor(Math.random() * 900 + 100)}`,
    tipo: 'carro',
    marca: 'Marca',
    linea: 'Línea',
    modelo: 2024,
    color: 'Blanco',
    descripcion: 'Vehículo de prueba',
    estado: 'activo',
  }),
  () => ({ color: 'Negro' }),
);
