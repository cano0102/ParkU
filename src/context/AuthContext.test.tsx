import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { createAppBackends } from '@/test/appFakeApi';

/**
 * La foto de perfil no la persiste el backend real (el modelo de Usuario no tiene columna
 * `foto` — ver el comentario de `updateUser` en AuthContext.tsx), así que vive aparte en
 * localStorage bajo una llave propia por usuario, no dentro de `parkUUser` — de otra forma
 * un logout (que sí borra `parkUUser`) la perdía sin remedio. Este archivo prueba justo esa
 * sobrevivencia, no el recorte/selección de archivo (eso es `useFotoPerfil.ts`, con `canvas`,
 * poco práctico de ejercitar en jsdom).
 */
const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

const FOTO = 'data:image/png;base64,ABC123';

function Consumer() {
  const { user, updateUser, logout, login } = useAuth();
  return (
    <div>
      <span data-testid="foto">{user?.foto ?? 'sin-usuario-o-foto'}</span>
      <button onClick={() => updateUser({ foto: FOTO })}>Set foto</button>
      <button onClick={() => updateUser({ foto: '' })}>Quitar foto</button>
      <button onClick={() => logout()}>Salir</button>
      <button onClick={() => login('admin@sena.edu.co', 'Pass1234')}>Entrar</button>
    </div>
  );
}

function renderConsumer() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  );
}

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('AuthContext — persistencia de la foto de perfil entre logout/login', () => {
  it('la foto sobrevive a cerrar sesión y volver a iniciarla en el mismo navegador', async () => {
    const user = userEvent.setup();
    localStorage.setItem('parkuToken', 'fake-token-1');
    localStorage.setItem(
      'parkUUser',
      JSON.stringify({ id: '1', correo: 'admin@sena.edu.co', nombre: 'Administrador ParkU', numero: '3101234567', rol: 1 })
    );
    renderConsumer();

    await user.click(screen.getByRole('button', { name: 'Set foto' }));
    expect(screen.getByTestId('foto')).toHaveTextContent(FOTO);

    await user.click(screen.getByRole('button', { name: 'Salir' }));
    expect(screen.getByTestId('foto')).toHaveTextContent('sin-usuario-o-foto');

    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(screen.getByTestId('foto')).toHaveTextContent(FOTO));
  });

  it('quitar la foto también la borra del almacenamiento separado (no reaparece en el próximo login)', async () => {
    const user = userEvent.setup();
    localStorage.setItem('parkuToken', 'fake-token-1');
    localStorage.setItem(
      'parkUUser',
      JSON.stringify({ id: '1', correo: 'admin@sena.edu.co', nombre: 'Administrador ParkU', numero: '3101234567', rol: 1 })
    );
    renderConsumer();

    await user.click(screen.getByRole('button', { name: 'Set foto' }));
    expect(screen.getByTestId('foto')).toHaveTextContent(FOTO);

    await user.click(screen.getByRole('button', { name: 'Quitar foto' }));
    expect(screen.getByTestId('foto')).toHaveTextContent(''); // '' no es nullish: no cae en el fallback del `??`

    await user.click(screen.getByRole('button', { name: 'Salir' }));
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(screen.getByTestId('foto')).toHaveTextContent('sin-usuario-o-foto'));
  });

  it('la hidratación inicial (recargar la página con sesión guardada) también trae la foto guardada aparte', () => {
    localStorage.setItem('parkuToken', 'fake-token-1');
    localStorage.setItem(
      'parkUUser',
      JSON.stringify({ id: '1', correo: 'admin@sena.edu.co', nombre: 'Administrador ParkU', numero: '3101234567', rol: 1 })
    );
    // Simula que la foto ya se había guardado en una sesión anterior, en la llave aparte.
    localStorage.setItem('parkuFotoPerfil:1', FOTO);

    renderConsumer();

    expect(screen.getByTestId('foto')).toHaveTextContent(FOTO);
  });
});
