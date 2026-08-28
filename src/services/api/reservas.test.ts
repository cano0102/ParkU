import { describe, it, expect, vi } from 'vitest';
import { createFakeRestBackend } from '../../test/fakeApi';
import { describeCrudContract } from '../../test/crudContract';
import * as reservas from './reservas';
import type { Reserva } from './reservas';

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

const backend = createFakeRestBackend('/reservas', [], {
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

describe('services/reservas', () => {
  it('empieza vacío', async () => {
    const all = await reservas.getAll();
    expect(Array.isArray(all)).toBe(true);
  });

  it('combina fecha + hora en fecha_hora_inicio/fin al crear, y los separa de vuelta al leer', async () => {
    const creada = await reservas.create({
      tipoReserva: 'visitante', vehiculoId: '1', celdaId: '1', conductorId: '1', motivo: '',
      fechaReserva: '2030-01-01', horaInicio: '08:00', horaFin: '10:00', estado: 'pendiente',
    });
    expect(creada.fechaReserva).toBe('2030-01-01');
    expect(creada.horaInicio).toBe('08:00');
    expect(creada.horaFin).toBe('10:00');
    const call = apiFetchMock.mock.calls.find(([, opts]) => (opts as any)?.method === 'POST');
    expect((call?.[1] as any).body.fecha_hora_inicio).toContain('2030-01-01');
  });

  it('cambiar a un estado gestionable usa PATCH /:id/estado', async () => {
    const creada = await reservas.create({
      tipoReserva: 'visitante', vehiculoId: '1', celdaId: '1', conductorId: '1', motivo: '',
      fechaReserva: '2030-01-01', horaInicio: '08:00', horaFin: '10:00', estado: 'pendiente',
    });
    const actualizada = await reservas.update(creada.id, { estado: 'activa' });
    expect(actualizada.estado).toBe('activa');
    expect(apiFetchMock.mock.calls.some(([path, opts]) => path === `/reservas/${creada.id}/estado` && (opts as any)?.method === 'PATCH')).toBe(true);
  });
});

describeCrudContract<Reserva>(
  'reservas',
  reservas,
  () => ({
    tipoReserva: 'visitante',
    vehiculoId: '1',
    celdaId: '1',
    conductorId: '1',
    motivo: '',
    fechaReserva: '2030-01-01',
    horaInicio: '08:00',
    horaFin: '10:00',
    estado: 'pendiente',
  }),
  () => ({ motivo: 'Actualizado en el test' }),
);
