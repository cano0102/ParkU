import { describe, it, expect, vi } from 'vitest';
import { createFakeRestBackend } from '../../test/fakeApi';
import { describeCrudContract } from '../../test/crudContract';
import * as incidentes from './incidentes';
import type { Incidente } from './incidentes';

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
    id: 1, tipo_novedad: 'MAL_ESTACIONAMIENTO', prioridad: 'MEDIA', descripcion: 'Vehículo mal estacionado',
    parqueadero_id: 1, celda_id: 1, vehiculo_id: 1, usuario_asignado_id: null,
    fecha_hora: '2025-01-01T08:00:00.000Z', estado: 'PENDIENTE', justificacion_cierre: null,
  },
  {
    id: 2, tipo_novedad: 'DANIO', prioridad: 'ALTA', descripcion: 'Daño en la barrera',
    parqueadero_id: 1, celda_id: null, vehiculo_id: null, usuario_asignado_id: null,
    fecha_hora: '2025-01-02T08:00:00.000Z', estado: 'RESUELTA', justificacion_cierre: 'Reparada',
  },
];
const backend = createFakeRestBackend('/novedades', seed);
apiFetchMock.mockImplementation(backend.apiFetch);

describe('services/incidentes (novedades)', () => {
  it('trae las 2 novedades semilla, traducidas a pendiente/resuelto', async () => {
    const all = await incidentes.getAll();
    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(all.map((i) => i.estado)).toEqual(expect.arrayContaining(['pendiente', 'resuelto']));
  });

  it('create envía la fecha calculada por el llamador como fecha_hora (antes se perdía en toApiPayload)', async () => {
    const fecha = '2025-03-04T10:00:00.000Z';
    const creado = await incidentes.create({
      clase: 'incidente', tipoNovedad: 'otro', tipoOtro: '', usuarioReportaId: '1',
      prioridad: 'media', descripcion: 'Con fecha explícita',
      parqueaderoId: '1', celdaId: '', vehiculoId: '', usuarioAsignadoId: '',
      fecha, estado: 'pendiente', justificacionCierre: '',
    });
    expect(apiFetchMock).toHaveBeenCalledWith(
      '/novedades',
      expect.objectContaining({ body: expect.objectContaining({ fecha_hora: fecha }) }),
    );
    expect(creado.fecha).toBe(fecha);
  });
});

describeCrudContract<Incidente>(
  'incidentes',
  incidentes,
  () => ({
    clase: 'incidente', tipoNovedad: 'otro', tipoOtro: '', usuarioReportaId: '1',
    prioridad: 'media',
    descripcion: 'Incidente de prueba',
    parqueaderoId: '1',
    celdaId: '',
    vehiculoId: '',
    usuarioAsignadoId: '',
    fecha: new Date().toISOString(),
    estado: 'pendiente',
    justificacionCierre: '',
  }),
  () => ({ estado: 'resuelto', justificacionCierre: 'Resuelto en el test' }),
);

/* La API rechaza que Comunidad SENA mande prioridad o encargado —los define el personal
   autorizado al aceptar el reporte—, y mandarlos en null contaba como mandarlos. */
describe('incidentes API — campos que no deben viajar vacíos', () => {
  it('no envía prioridad ni usuario asignado cuando vienen vacíos', async () => {
    apiFetchMock.mockClear();
    apiFetchMock.mockResolvedValue({ id: 9 });

    await incidentes.create({
      clase: 'incidente', tipoNovedad: 'danio', tipoOtro: '', usuarioReportaId: '5',
      prioridad: '' as never, descripcion: 'Me rayaron el carro',
      parqueaderoId: '1', celdaId: '', vehiculoId: '', usuarioAsignadoId: '',
      fecha: '2026-01-01T00:00:00.000Z', estado: 'pendiente', justificacionCierre: '',
    });

    const [, opciones] = apiFetchMock.mock.calls[0];
    expect(opciones.body).not.toHaveProperty('prioridad');
    expect(opciones.body).not.toHaveProperty('usuario_asignado_id');
    expect(opciones.body).toMatchObject({ clase: 'INCIDENTE', usuario_reporta_id: 5 });
  });
});
