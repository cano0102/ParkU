import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { createTestQueryClient } from '@/test/queryWrapper';
import { createAppBackends } from '@/test/appFakeApi';
import { ForgotPassword } from './ForgotPassword';

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

// Cuenta sembrada por appFakeApi.ts (ver usuariosSeed): correo, tipo/número de documento y
// nombre exactos, los datos que ahora se verifican en vez de enviar un enlace por correo.
const CUENTA_SEMBRADA = {
  correo: 'ana.martinez@sena.edu.co',
  tipoDocumento: 'CC',
  numeroDocumento: '2345678901',
  nombre: 'Ana Martínez R.',
};

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

async function llenarFormulario(user: ReturnType<typeof userEvent.setup>, datos = CUENTA_SEMBRADA) {
  await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), datos.correo);
  await user.type(screen.getByPlaceholderText('Como aparece en tu cuenta'), datos.nombre);
  await user.type(screen.getByPlaceholderText('1001234567'), datos.numeroDocumento);
}

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('ForgotPassword', () => {
  it('renderiza el formulario de verificación de identidad', async () => {
    await renderForgotPassword();

    expect(screen.getByPlaceholderText('correo@sena.edu.co')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Como aparece en tu cuenta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('1001234567')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Verificar identidad' })).toBeInTheDocument();
  });

  it('con datos que coinciden con una cuenta, navega a la pantalla de nueva contraseña con el token', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await llenarFormulario(user);
    await user.click(screen.getByRole('button', { name: 'Verificar identidad' }));

    await vi.waitFor(() => expect(mockNavigate).toHaveBeenCalled());
    const [ruta] = mockNavigate.mock.calls[0];
    expect(ruta).toMatch(/^\/reset-password\?token=/);
  });

  it('con datos que no coinciden con ninguna cuenta, muestra el error y no navega', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await llenarFormulario(user, { ...CUENTA_SEMBRADA, numeroDocumento: '0000000000' });
    await user.click(screen.getByRole('button', { name: 'Verificar identidad' }));

    await vi.waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Los datos no coinciden con ninguna cuenta registrada'),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Verificar identidad' })).toBeEnabled();
  });

  it('valida el formato del correo antes de enviar', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), 'no-es-un-correo');
    await user.type(screen.getByPlaceholderText('Como aparece en tu cuenta'), CUENTA_SEMBRADA.nombre);
    await user.type(screen.getByPlaceholderText('1001234567'), CUENTA_SEMBRADA.numeroDocumento);
    await user.click(screen.getByRole('button', { name: 'Verificar identidad' }));

    expect(await screen.findByText('Ingresa un correo electrónico válido')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Por favor, corrige los errores del formulario');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('exige el nombre y el número de documento', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), CUENTA_SEMBRADA.correo);
    await user.click(screen.getByRole('button', { name: 'Verificar identidad' }));

    expect(await screen.findByText('El nombre completo es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El número de documento es obligatorio')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
