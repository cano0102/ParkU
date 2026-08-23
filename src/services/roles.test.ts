import { describe, it, expect } from 'vitest';
import * as roles from './roles';
import type { Rol } from './roles';
import { describeCrudContract } from '../test/crudContract';

describe('services/roles', () => {
  it('trae los 3 roles semilla (Administrador, Vigilante, Usuario Normal)', async () => {
    const all = await roles.getAll();
    const nombres = all.map((r) => r.nombre);
    expect(nombres).toEqual(expect.arrayContaining(['Administrador', 'Vigilante', 'Usuario Normal']));
  });
});

describeCrudContract<Rol>(
  'roles',
  roles,
  () => ({
    nombre: 'Rol de prueba',
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
