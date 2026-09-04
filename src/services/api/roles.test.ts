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

describe('services/roles — permisos del rol', () => {
  it('guarda el conjunto completo en UNA sola llamada PUT /roles/:id/permisos', async () => {
    apiFetchMock.mockClear();
    apiFetchMock.mockResolvedValueOnce({ success: true });

    await roles.guardarPermisosDeRol('13', ['1', '2', '4']);

    // El backend retira lo que no venga en la lista: por eso es un reemplazo completo y no
    // un POST/DELETE por permiso (POST /roles-permisos solo sabe añadir, no desmarcar).
    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    const [path, opts] = apiFetchMock.mock.calls[0];
    expect(path).toBe('/roles/13/permisos');
    expect((opts as any).method).toBe('PUT');
    expect((opts as any).body).toEqual({ permisos: [1, 2, 4] });
  });

  it('lee los permisos marcados desde permiso_ids del rol', async () => {
    apiFetchMock.mockClear();
    apiFetchMock.mockResolvedValueOnce({ id: 13, nombre: 'Supervisor', descripcion: null, estado: true, permiso_ids: [1, 4] });

    const asignados = await roles.getPermisosDeRol('13');

    expect(apiFetchMock).toHaveBeenCalledTimes(1);
    expect([...asignados].sort()).toEqual(['1', '4']);
  });

  it('recurre a la tabla intermedia si el rol no trae permiso_ids', async () => {
    apiFetchMock.mockClear();
    apiFetchMock
      .mockResolvedValueOnce({ id: 13, nombre: 'Supervisor', descripcion: null, estado: true })
      .mockResolvedValueOnce([{ id: 9, rol: 13, permiso: 5 }]);

    const asignados = await roles.getPermisosDeRol('13');

    expect([...asignados]).toEqual(['5']);
    expect(apiFetchMock.mock.calls[1][0]).toBe('/roles-permisos/rol/13');
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
