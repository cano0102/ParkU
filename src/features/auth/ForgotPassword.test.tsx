import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { createTestQueryClient } from '@/test/queryWrapper';
import { createAppBackends } from '@/test/appFakeApi';
import { ForgotPassword } from './ForgotPassword';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

import { toast } from 'sonner';

// Esta pantalla ya NO consulta `GET /usuarios` para validar si el correo existe (era una fuga
// de información desde una ruta pública, sin sesión — ver useForgotPasswordForm.ts) — solo
// valida el formato del correo en el cliente, así que no hace falta precargar ningún listado.
function renderForgotPassword() {
  const client = createTestQueryClient();

  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AuthProvider>
          <ForgotPassword />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('ForgotPassword', () => {
  it('renderiza el formulario de recuperación', async () => {
    await renderForgotPassword();

    expect(screen.getByPlaceholderText('correo@sena.edu.co')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar enlace' })).toBeInTheDocument();
  });

  it('pide el enlace al backend y le indica a la persona que revise su correo', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), 'admin@sena.edu.co');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByText(/Revisa tu/)).toBeInTheDocument();
    expect(screen.getByText('admin@sena.edu.co')).toBeInTheDocument();
    expect(apiFetchMock).toHaveBeenCalledWith(
      '/auth/recuperar-password',
      expect.objectContaining({ method: 'POST', body: { correo: 'admin@sena.edu.co' } }),
    );
    // El enlace llega por correo: la pantalla nunca lo muestra (antes decía que sí).
    expect(screen.queryByText(/reset-password\?token=/)).not.toBeInTheDocument();
  });

  it('para un correo con formato válido que no pertenece a ninguna cuenta, muestra la misma pantalla (evita enumeración de cuentas)', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), 'no-existe@sena.edu.co');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByText(/Revisa tu/)).toBeInTheDocument();
    expect(screen.queryByText(/no existe una cuenta/i)).not.toBeInTheDocument();
  });

  it('"Enviar otro enlace" vuelve al formulario con el mismo correo', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), 'admin@sena.edu.co');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
    await user.click(await screen.findByRole('button', { name: /Enviar otro enlace/ }));

    expect(screen.getByPlaceholderText('correo@sena.edu.co')).toHaveValue('admin@sena.edu.co');
    expect(screen.getByRole('button', { name: 'Enviar enlace' })).toBeInTheDocument();
  });

  it('si la petición falla, muestra el error y no se queda cargando', async () => {
    apiFetchMock.mockRejectedValueOnce(new Error('Demasiadas solicitudes. Intenta más tarde.'));
    const user = userEvent.setup();
    await renderForgotPassword();

    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), 'admin@sena.edu.co');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Demasiadas solicitudes. Intenta más tarde.'),
    );
    // Sigue en el formulario, con el botón disponible para reintentar.
    expect(screen.getByRole('button', { name: 'Enviar enlace' })).toBeEnabled();
    expect(screen.queryByText(/Revisa tu/)).not.toBeInTheDocument();
  });

  it('valida el formato del correo sin consultar si la cuenta existe', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), 'no-es-un-correo');
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByText('Ingresa un correo electrónico válido')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Por favor, corrige los errores del formulario');
  });
});
