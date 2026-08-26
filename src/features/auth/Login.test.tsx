import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { createTestQueryClient } from '@/test/queryWrapper';
import { createAppBackends } from '@/test/appFakeApi';
import { Login } from './Login';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

import { toast } from 'sonner';

function renderLogin() {
  const client = createTestQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('Login', () => {
  it('renderiza el formulario de inicio de sesión', () => {
    renderLogin();

    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
  });

  it('inicia sesión con las credenciales semilla del administrador y navega al dashboard', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Correo Electrónico'), 'admin@sena.edu.co');
    await user.type(screen.getByLabelText('Contraseña'), 'Pass1234');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard'));
    expect(toast.success).toHaveBeenCalled();
  });

  it('muestra un error si la contraseña es incorrecta y no navega', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText('Correo Electrónico'), 'admin@sena.edu.co');
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Contraseña incorrecta. Verifica tus credenciales.')
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
