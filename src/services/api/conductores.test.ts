import { describe, it, expect, vi } from 'vitest';
import { createFakeRestBackend } from '../../test/fakeApi';
import { describeCrudContract } from '../../test/crudContract';
import * as conductores from './conductores';
import type { Conductor } from './conductores';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('../core/http', () => ({ apiFetch: apiFetchMock }));

const seed = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  usuario_id: null,
  tipo_documento: 'CC',
  numero_documento: `${1000000000 + i}`,
  nombre_apellidos: `Conductor Semilla ${i + 1}`,
  correo: null,
  direccion: null,
  numero_telefonico: null,
  tipo_usuario_id: 1,
  tipo_usuario_nombre: 'Aprendiz',
  regional_formacion: null,
  centro_formacion: 'Centro de Pruebas',
  programa_formacion: null,
  vigencia: null,
  movilidad_reducida: false,
  tipo_discapacidad: null,
  estado: true,
}));
const backend = createFakeRestBackend('/conductores', seed);
apiFetchMock.mockImplementation(backend.apiFetch);

describe('services/conductores', () => {
  it('trae los 10 conductores semilla', async () => {
    const all = await conductores.getAll();
    expect(all.length).toBeGreaterThanOrEqual(10);
  });

  it('conductor sin usuario_id vinculado trae usuarioId vacío, no null/undefined', async () => {
    const all = await conductores.getAll();
    expect(all[0].usuarioId).toBe('');
  });
});

describeCrudContract<Conductor>(
  'conductores',
  conductores,
  () => ({
    usuarioId: '',
    nombre: 'Conductor de prueba',
    tipoDocumento: 'CC',
    numeroDocumento: `${Date.now()}`,
    correo: '',
    direccion: '',
    numeroTelefonico: '',
    tipoUsuarioId: '1',
    tipoUsuarioNombre: '',
    regionalFormacion: '',
    centroFormacion: 'Pruebas',
    programaFormacion: '',
    vigencia: '',
    movilidadReducida: false,
    tipoDiscapacidad: '',
    estado: 'activo',
  }),
  () => ({ direccion: 'Calle 45 #10-20' }),
);
