import { describe, it, expect, vi } from 'vitest';
import { createFakeRestBackend } from '../../test/fakeApi';
import { describeCrudContract } from '../../test/crudContract';
import * as parqueaderos from './parqueaderos';
import type { Parqueadero } from './parqueaderos';

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

const seed = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  nombre: `PQ Semilla ${i + 1}`,
  ubicacion: 'Acceso Regional',
  acceso: 'REGIONAL',
  capacidad_maxima: 10,
  hora_apertura: '06:00:00',
  hora_cierre: '20:00:00',
  estado: true,
  zona: 'Zona A',
  piso: 'Nivel 1',
  descripcion: '',
  tipo: 'GENERAL',
}));
const backend = createFakeRestBackend('/parqueaderos', seed, {
  actions: [
    {
      method: 'PATCH',
      pattern: /^\/(\d+)\/estado$/,
      handle: (m, body, items) => {
        const id = Number(m[1]);
        const idx = items.findIndex((i) => i.id === id);
        if (idx === -1) throw new Error('404');
        items[idx] = { ...items[idx], estado: (body as any).estado };
        return items[idx];
      },
    },
  ],
});
apiFetchMock.mockImplementation(backend.apiFetch);

describe('services/parqueaderos', () => {
  it('trae los 7 parqueaderos semilla', async () => {
    const all = await parqueaderos.getAll();
    expect(all.length).toBe(7);
  });

  it('create ya NO genera celdas en cascada — la API real las administra aparte', async () => {
    const creado = await parqueaderos.create({
      nombre: 'PQ Test Sin Cascada',
      ubicacion: 'Calle de prueba',
      acceso: 'regional',
      capacidadMaxima: 6,
      horaInicio: '06:00',
      horaFin: '20:00',
      zona: '', piso: '',
      descripcion: 'Parqueadero creado en un test',
      estado: 'activo',
      tipo: 'docentes',
    });
    // No se le pasó nada relacionado a celdas: create() no debería intentar tocar /celdas.
    expect(apiFetchMock.mock.calls.every(([path]) => !String(path).startsWith('/celdas'))).toBe(true);
    expect(creado.nombre).toBe('PQ Test Sin Cascada');
  });

  it('cambiar estado usa PATCH /:id/estado con un motivo', async () => {
    const updated = await parqueaderos.update('1', { estado: 'inactivo' });
    expect(updated.estado).toBe('inactivo');
    const call = apiFetchMock.mock.calls.find(([path, opts]) => path === '/parqueaderos/1/estado' && (opts as any)?.method === 'PATCH');
    expect(call).toBeTruthy();
    expect((call?.[1] as any).body.motivo).toBeTruthy();
  });
});

describeCrudContract<Parqueadero>(
  'parqueaderos',
  parqueaderos,
  () => ({
    nombre: `PQ Contrato CRUD ${Math.random()}`,
    ubicacion: 'Calle de prueba',
    acceso: 'regional',
    capacidadMaxima: 10,
    horaInicio: '06:00',
    horaFin: '20:00',
    zona: '', piso: '',
    descripcion: 'Parqueadero de prueba',
    estado: 'activo',
    tipo: 'docentes',
  }),
  () => ({ descripcion: 'Descripción actualizada' }),
);
