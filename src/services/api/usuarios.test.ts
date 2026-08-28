import { describe, it, expect, vi } from 'vitest';
import { createFakeRestBackend } from '../../test/fakeApi';
import { describeCrudContract } from '../../test/crudContract';
import * as usuarios from './usuarios';
import type { Usuario } from './usuarios';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('../core/http', () => ({ apiFetch: apiFetchMock }));

const seed = [
  { id: 1, correo: 'admin@sena.edu.co', nombre: 'Administrador ParkU', rol_id: 1, estado: 'ACTIVO' },
];
const backend = createFakeRestBackend('/usuarios', seed);
apiFetchMock.mockImplementation(backend.apiFetch);

describe('services/usuarios', () => {
  it('trae al usuario admin semilla', async () => {
    const all = await usuarios.getAll();
    expect(all.some((u) => u.correo === 'admin@sena.edu.co')).toBe(true);
  });

  it('update nunca envía la contraseña (la API la rechaza fuera de /contrasena)', async () => {
    await usuarios.update('1', { password: 'algo', nombre: 'Renombrado' });
    const call = apiFetchMock.mock.calls.find(([path]) => path === '/usuarios/1');
    expect(call?.[1]).toMatchObject({ body: { nombre: 'Renombrado' } });
    expect((call?.[1] as any).body.contrasena).toBeUndefined();
  });

  it('crea y actualiza el teléfono de contacto de la cuenta mapeándolo a numero_telefonico', async () => {
    await usuarios.create({ correo: 'nuevo@sena.edu.co', password: 'Pass1234', nombre: 'Nuevo', numero: '3101234567', rol: 3, estado: 'activo' });
    const createCall = apiFetchMock.mock.calls.find(([path, opts]) => path === '/usuarios' && (opts as any)?.method === 'POST');
    expect((createCall?.[1] as any).body.numero_telefonico).toBe('3101234567');

    await usuarios.update('1', { numero: '3009998877' });
    const updateCall = apiFetchMock.mock.calls.find(
      ([path, opts]) => path === '/usuarios/1' && (opts as any)?.body?.numero_telefonico === '3009998877'
    );
    expect(updateCall).toBeDefined();
  });
});

describeCrudContract<Usuario>(
  'usuarios',
  usuarios,
  () => ({
    correo: `test-${Date.now()}@sena.edu.co`,
    password: 'Pass1234',
    nombre: 'Usuario de prueba',
    numero: '',
    rol: 3,
    estado: 'activo',
  }),
  () => ({ nombre: 'Nombre actualizado' }),
);
