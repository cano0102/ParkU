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
    expect(screen.getByRole('button', { name: 'Generar Enlace' })).toBeInTheDocument();
  });

  it('genera un enlace de recuperación para un correo semilla existente', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), 'admin@sena.edu.co');
    await user.click(screen.getByRole('button', { name: 'Generar Enlace' }));

    await waitFor(
      () => expect(screen.getByText('Abrir Enlace de Recuperación')).toBeInTheDocument(),
      { timeout: 2000 }
    );
  });

  it('para un correo con formato válido que no pertenece a ninguna cuenta, igual avanza a la pantalla de éxito sin revelar que no existe (evita enumeración de cuentas)', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), 'no-existe@sena.edu.co');
    await user.click(screen.getByRole('button', { name: 'Generar Enlace' }));

    // Llega a la pantalla de éxito igual que con un correo real ("Recomendaciones" solo se
    // renderiza ahí) — la única diferencia observable es que no hay enlace para abrir/copiar,
    // nunca un mensaje que confirme o niegue si la cuenta existe.
    expect(await screen.findByText('Recomendaciones')).toBeInTheDocument();
    expect(screen.queryByText('Abrir Enlace de Recuperación')).not.toBeInTheDocument();
    expect(screen.queryByText(/no existe una cuenta/i)).not.toBeInTheDocument();
  });

  it('valida el formato del correo sin consultar si la cuenta existe', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), 'no-es-un-correo');
    await user.click(screen.getByRole('button', { name: 'Generar Enlace' }));

    expect(await screen.findByText('Ingresa un correo electrónico válido')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Por favor, corrige los errores del formulario');
  });
});
