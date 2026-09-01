import { describe, it, expect, vi } from 'vitest';
import { createFakeRestBackend } from '../../test/fakeApi';
import { describeCrudContract } from '../../test/crudContract';
import * as celdas from './celdas';
import type { Celda } from './celdas';

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
  { id: 1, parqueadero: 1, numero: 'C-001', tipo: 'CARRO', usabilidad: 'GENERAL', estado: 'DISPONIBLE', observaciones: null },
  { id: 2, parqueadero: 1, numero: 'C-002', tipo: 'MOTO', usabilidad: 'GENERAL', estado: 'OCUPADA', observaciones: null },
];
const backend = createFakeRestBackend('/celdas', seed);
apiFetchMock.mockImplementation(backend.apiFetch);

const loteAction = {
  method: 'POST' as const,
  pattern: /^\/parqueadero\/(\d+)\/generar-lote$/,
  handle: (m: RegExpMatchArray, body: unknown, items: any[]) => {
    const b = body as { cantidadCarro?: number; cantidadMoto?: number; cantidadMovilidadReducida?: number };
    const creadas: unknown[] = [];
    const push = (prefijo: string, tipo: string, usabilidad: string, cantidad: number) => {
      for (let i = 1; i <= cantidad; i++) {
        const nextId = items.reduce((max, it) => Math.max(max, it.id), 0) + 1;
        const nueva = { id: nextId, parqueadero: Number(m[1]), numero: `${prefijo}${String(i).padStart(3, '0')}`, tipo, usabilidad, estado: 'DISPONIBLE', observaciones: null };
        items.push(nueva);
        creadas.push(nueva);
      }
    };
    push('C-', 'CARRO', 'GENERAL', b.cantidadCarro ?? 0);
    push('M-', 'MOTO', 'GENERAL', b.cantidadMoto ?? 0);
    push('PMR-', 'CARRO', 'MOVILIDAD_REDUCIDA', b.cantidadMovilidadReducida ?? 0);
    return creadas;
  },
};

describe('services/celdas', () => {
  it('traduce estado/tipo/usabilidad desde la API real (mayúsculas -> minúsculas del mock)', async () => {
    const all = await celdas.getAll();
    expect(all).toEqual([
      { id: '1', parqueaderoId: '1', numero: 'C-001', tipo: 'carro', usabilidad: 'general', estado: 'disponible', ocupada: false, observaciones: '' },
      { id: '2', parqueaderoId: '1', numero: 'C-002', tipo: 'moto', usabilidad: 'general', estado: 'no_disponible', ocupada: true, observaciones: '' },
    ]);
  });

  it('generarLote crea las celdas pedidas y las traduce al formato del frontend', async () => {
    // Backend propio (no el `backend` compartido de arriba): esta acción muta su
    // `items`, y describeCrudContract más abajo asume ids/seed frescos.
    const loteBackend = createFakeRestBackend('/celdas', [], { actions: [loteAction] });
    apiFetchMock.mockImplementationOnce(loteBackend.apiFetch);

    const creadas = await celdas.generarLote('7', { carros: 2, motos: 1, movilidadReducida: 0 });
    expect(creadas.map((c) => c.numero)).toEqual(['C-001', 'C-002', 'M-001']);
    expect(creadas.every((c) => c.parqueaderoId === '7')).toBe(true);
    expect(creadas.map((c) => c.tipo)).toEqual(['carro', 'carro', 'moto']);
  });
});

// El `patchSample` NO usa `estado` a propósito: `celdas.update()` documenta (ver el comentario
// sobre `PUT /celdas/:id` en celdas.ts) que el backend real IGNORA ese campo ahí — el único
// canal real para cambiarlo es `cambiarDisponibilidad()` (`PUT /celdas/:id/disponibilidad`).
// El backend falso de este archivo (`createFakeRestBackend`) simula un PUT genérico que SÍ
// aplica cualquier campo enviado, `estado` incluido — si el contrato genérico de abajo
// siguiera parcheando `estado`, pasaría igual aquí sin proteger contra una regresión real
// donde `update()` volviera a depender de que el backend de verdad lo aplique. `observaciones`
// sí es un campo que el PUT real aplica normalmente, así que es una prueba fiel del contrato.
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
  () => ({ observaciones: 'Revisión de rutina' }),
);
