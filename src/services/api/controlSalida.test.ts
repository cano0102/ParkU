import { describe, it, expect, vi } from 'vitest';
import { createFakeRestBackend } from '../../test/fakeApi';
import { describeCrudContract } from '../../test/crudContract';
import * as controlSalida from './controlSalida';
import type { ControlSalida } from './controlSalida';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('../core/http', () => ({ apiFetch: apiFetchMock }));

const seed = [
  {
    id: 1, vehiculo_id: 1, conductor_id: 1, parqueadero_id: 1, celda_id: 1,
    fecha_hora_ingreso: '2025-01-01T08:00:00.000Z', fecha_hora_salida: null, estado: 'DENTRO' as const,
  },
];
const backend = createFakeRestBackend('/entradas-salidas', seed, {
  actions: [
    {
      method: 'POST',
      pattern: /^\/entrada$/,
      handle: (_m, body, items) => {
        const b = body as any;
        const nextId = items.reduce((max, i) => Math.max(max, i.id), 0) + 1;
        const created = {
          id: nextId, vehiculo_id: b.vehiculo_id, conductor_id: b.conductor_id ?? null,
          parqueadero_id: b.parqueadero_id, celda_id: b.celda_id ?? null,
          fecha_hora_ingreso: b.fecha_hora_ingreso ?? new Date().toISOString(),
          fecha_hora_salida: null, estado: 'DENTRO' as const,
        };
        items.push(created);
        return created;
      },
    },
    {
      method: 'POST',
      pattern: /^\/salida$/,
      handle: (_m, body, items) => {
        const b = body as any;
        const idx = items.findIndex((i) => i.vehiculo_id === b.vehiculo_id && i.estado === 'DENTRO');
        if (idx === -1) throw new Error('409: sin ingreso abierto');
        items[idx] = { ...items[idx], fecha_hora_salida: b.fecha_hora_salida ?? new Date().toISOString(), estado: 'FINALIZADO' as const };
        return items[idx];
      },
    },
  ],
});
apiFetchMock.mockImplementation(backend.apiFetch);

describe('services/controlSalida', () => {
  it('trae los registros semilla en estado en_parqueadero', async () => {
    const all = await controlSalida.getAll();
    expect(all.some((c) => c.id === '1' && c.estado === 'en_parqueadero')).toBe(true);
  });

  it('create llama a POST /entrada, no a un endpoint genérico', async () => {
    const creado = await controlSalida.create({
      vehiculoId: '1', conductorId: '1', parqueaderoId: '1', celdaId: '1',
      fechaEntrada: '2025-02-01T08:00', estado: 'en_parqueadero',
    });
    expect(creado.estado).toBe('en_parqueadero');
    expect(apiFetchMock.mock.calls.some(([path]) => path === '/entradas-salidas/entrada')).toBe(true);
  });

  it('update con estado finalizado llama a POST /salida sobre el vehículo', async () => {
    const actualizado = await controlSalida.update('1', { estado: 'finalizado', fechaSalida: '2025-01-02T08:00' });
    expect(actualizado.estado).toBe('finalizado');
    expect(actualizado.fechaSalida).toBeTruthy();
    expect(apiFetchMock.mock.calls.some(([path]) => path === '/entradas-salidas/salida')).toBe(true);
  });
});

// vehiculoId único por muestra: la API real cierra el ingreso ABIERTO de ese
// vehículo (no un id de registro puntual) — si dos muestras comparten
// vehiculoId, "cerrar" una cerraría la otra en su lugar.
let muestraId = 100;
describeCrudContract<ControlSalida>(
  'controlSalida',
  controlSalida,
  () => ({
    vehiculoId: String(muestraId++), conductorId: '1', parqueaderoId: '1', celdaId: '1',
    fechaEntrada: '2025-01-01T08:00', estado: 'en_parqueadero',
  }),
  () => ({ estado: 'finalizado', fechaSalida: '2025-01-01T18:00' }),
);
