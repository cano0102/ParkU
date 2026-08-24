import { describe, it, expect } from 'vitest';
import * as auth from './auth';

describe('services/auth', () => {
  it('login acepta el usuario admin semilla con su contraseña', async () => {
    const user = await auth.login('admin@sena.edu.co', 'Pass1234');
    expect(user.correo).toBe('admin@sena.edu.co');
    expect(user.rol).toBe('Administrador');
  });

  it('login normaliza mayúsculas/espacios en el correo', async () => {
    const user = await auth.login('  Admin@SENA.edu.co  ', 'Pass1234');
    expect(user.correo).toBe('admin@sena.edu.co');
  });

  it('login rechaza un correo inexistente', async () => {
    await expect(auth.login('no-existe@sena.edu.co', 'Pass1234')).rejects.toThrow(
      'No existe una cuenta con este correo.',
    );
  });

  it('login rechaza una contraseña incorrecta', async () => {
    await expect(auth.login('admin@sena.edu.co', 'incorrecta')).rejects.toThrow(
      'Contraseña incorrecta. Verifica tus credenciales.',
    );
  });

  it('register crea un usuario nuevo con rol Comunidad SENA y evita correos duplicados', async () => {
    const correo = `nuevo-${Date.now()}@sena.edu.co`;
    const user = await auth.register({
      correo,
      password: 'Pass1234',
      nombre: 'Usuario Nuevo',
      numero: '3000000000',
      tipoUsuario: 'estudiante',
      tipoDocumento: 'CC',
      identificacion: `id-${Date.now()}`,
    });
    expect(user.rol).toBe('Comunidad SENA');

    await expect(
      auth.register({
        correo,
        password: 'Pass1234',
        nombre: 'Duplicado',
        numero: '3000000001',
        tipoUsuario: 'estudiante',
        tipoDocumento: 'CC',
        identificacion: `otro-id-${Date.now()}`,
      }),
    ).rejects.toThrow('Ya existe una cuenta registrada con este correo.');
  });

  it('requestPasswordReset + resetPasswordWithToken permiten cambiar la contraseña una sola vez', async () => {
    const correo = `reset-${Date.now()}@sena.edu.co`;
    await auth.register({
      correo, password: 'Pass1234', nombre: 'Reset Test', numero: '3000000002',
      tipoUsuario: 'estudiante', tipoDocumento: 'CC', identificacion: `id-reset-${Date.now()}`,
    });

    const token = await auth.requestPasswordReset(correo);
    expect(token).toBeTruthy();

    const resultado = await auth.resetPasswordWithToken(token as string, 'NuevaPass123');
    expect(resultado.ok).toBe(true);

    // El nuevo password ya funciona para iniciar sesión...
    await expect(auth.login(correo, 'NuevaPass123')).resolves.toBeTruthy();

    // ...y el token es de un solo uso.
    const segundoIntento = await auth.resetPasswordWithToken(token as string, 'OtraPass456');
    expect(segundoIntento.ok).toBe(false);
  });

  it('getPermisos deniega por defecto si el rol no existe', async () => {
    const permisos = await auth.getPermisos('Rol Inexistente');
    expect(permisos).toBeNull();
  });

  it('getPermisos devuelve los permisos del rol Administrador', async () => {
    const permisos = await auth.getPermisos('Administrador');
    expect(permisos?.dashboard).toBe(true);
    expect(permisos?.roles).toBe(true);
  });
});
