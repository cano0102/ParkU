import { describe, it, expect } from 'vitest';
import * as usuarios from './usuarios';
import type { Usuario } from './usuarios';
import { describeCrudContract } from '../../test/crudContract';

describe('services/usuarios', () => {
  it('trae al usuario admin semilla', async () => {
    const all = await usuarios.getAll();
    expect(all.some((u) => u.correo === 'admin@sena.edu.co')).toBe(true);
  });
});

describeCrudContract<Usuario>(
  'usuarios',
  usuarios,
  () => ({
    correo: `test-${Date.now()}@sena.edu.co`,
    password: 'Pass1234',
    nombre: 'Usuario de prueba',
    numero: '3000000000',
    rol: 'Comunidad SENA',
    tipoUsuario: 'estudiante',
    tipoDocumento: 'CC',
    identificacion: '999999999',
    estado: 'activo',
  }),
  () => ({ nombre: 'Nombre actualizado' }),
);
