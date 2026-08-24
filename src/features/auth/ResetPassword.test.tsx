import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { createTestQueryClient } from '@/test/queryWrapper';
import * as authService from '@/services/api/auth';
import { ResetPassword } from './ResetPassword';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from 'sonner';

// Genera un token de recuperación real (mismo flujo de negocio cubierto por
// services/auth.test.ts) contra un usuario recién registrado, para no
// mutar la contraseña de las cuentas semilla que otros tests puedan asumir.
async function getValidResetToken() {
  const correo = `reset-ui-${Date.now()}@sena.edu.co`;
  await authService.register({
    correo,
    password: 'Pass1234',
    nombre: 'Usuario Reset',
    numero: '3101234567',
    tipoDocumento: 'CC',
    identificacion: `${Date.now()}`,
  });
  const token = await authService.requestPasswordReset(correo);
  return { correo, token: token as string };
}

function renderResetPassword(token: string | null) {
  const client = createTestQueryClient();
  const path = token ? `/reset-password?token=${token}` : '/reset-password';

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider>
          <ResetPassword />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('ResetPassword', () => {
  it('renderiza el formulario de nueva contraseña', () => {
    renderResetPassword('un-token-cualquiera');

    const inputs = screen.getAllByPlaceholderText('••••••••');
    expect(inputs).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Actualizar Contraseña' })).toBeInTheDocument();
  });

  it('actualiza la contraseña con un token válido y navega al login', async () => {
    const { correo, token } = await getValidResetToken();
    const user = userEvent.setup();
    renderResetPassword(token);

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordInput, 'NuevaPass123');
    await user.type(confirmInput, 'NuevaPass123');
    await user.click(screen.getByRole('button', { name: 'Actualizar Contraseña' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    expect(toast.success).toHaveBeenCalledWith('Contraseña actualizada correctamente');

    // La nueva contraseña ya funciona para iniciar sesión.
    await expect(authService.login(correo, 'NuevaPass123')).resolves.toBeTruthy();
  });

  it('muestra un error y no navega cuando no hay token en la URL', async () => {
    const user = userEvent.setup();
    renderResetPassword(null);

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordInput, 'NuevaPass123');
    await user.type(confirmInput, 'NuevaPass123');
    await user.click(screen.getByRole('button', { name: 'Actualizar Contraseña' }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Enlace inválido o expirado'));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
