import { describe, it, expect, vi } from 'vitest';
import { createFakeRestBackend } from '../../test/fakeApi';
import { describeCrudContract } from '../../test/crudContract';
import * as incidentes from './incidentes';
import type { Incidente } from './incidentes';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('../core/http', () => ({ apiFetch: apiFetchMock }));

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
});

describeCrudContract<Incidente>(
  'incidentes',
  incidentes,
  () => ({
    tipoNovedad: 'otro',
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
