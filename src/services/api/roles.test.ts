import { describe, it, expect, vi } from 'vitest';
import { createFakeRestBackend } from '../../test/fakeApi';
import { describeCrudContract } from '../../test/crudContract';
import * as roles from './roles';
import type { Rol } from './roles';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('../core/http', () => ({ apiFetch: apiFetchMock }));

const seed = [
  { id: 1, nombre: 'Administrador', descripcion: 'Acceso total', estado: true },
  { id: 2, nombre: 'Vigilante', descripcion: 'Gestión operativa', estado: true },
  { id: 3, nombre: 'Conductor', descripcion: 'Acceso básico', estado: true },
];
const backend = createFakeRestBackend('/roles', seed);
apiFetchMock.mockImplementation(backend.apiFetch);

describe('services/roles', () => {
  it('trae los 3 roles fijos de la API real (Administrador, Vigilante, Conductor)', async () => {
    const all = await roles.getAll();
    const nombres = all.map((r) => r.nombre);
    expect(nombres).toEqual(expect.arrayContaining(['Administrador', 'Vigilante', 'Conductor']));
  });

  it('completa `permisos` con la matriz estática para los 3 roles fijos (id 1/2/3)', async () => {
    const all = await roles.getAll();
    const admin = all.find((r) => r.nombre === 'Administrador')!;
    const conductor = all.find((r) => r.nombre === 'Conductor')!;
    expect(admin.permisos.roles).toBe(true);
    expect(conductor.permisos.roles).toBe(false);
    expect(conductor.permisos.reservas).toBe(true);
  });

  it('un rol creado por fuera de los 3 fijos no tiene permisos reales asociados', async () => {
    const creado = await roles.create({
      nombre: 'Rol de prueba', descripcion: 'Creado en un test', estado: 'activo',
      permisos: {
        dashboard: true, roles: true, usuarios: true, conductores: true, vehiculos: true,
        parqueaderos: true, celdas: true, asignaciones: true, entradaSalida: true,
        reservas: true, incidentes: true, reconocimientoPlacas: true,
      },
    });
    expect(creado.permisos.roles).toBe(false);
  });
});

describeCrudContract<Rol>(
  'roles',
  roles,
  () => ({
    nombre: `Rol de prueba ${Math.random()}`,
    descripcion: 'Creado en un test',
    permisos: {
      dashboard: true, roles: false, usuarios: false, conductores: false, vehiculos: false,
      parqueaderos: false, celdas: false, asignaciones: false, entradaSalida: false,
      reservas: false, incidentes: false, reconocimientoPlacas: false,
    },
    estado: 'activo',
  }),
  () => ({ descripcion: 'Descripción actualizada' }),
);
