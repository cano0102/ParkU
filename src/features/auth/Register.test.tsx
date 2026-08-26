import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { createTestQueryClient } from '@/test/queryWrapper';
import { createAppBackends } from '@/test/appFakeApi';
import { Register } from './Register';

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

function renderRegister() {
  const client = createTestQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>, overrides?: { correo?: string; identificacion?: string }) {
  const correo = overrides?.correo ?? `nuevo-${Date.now()}@sena.edu.co`;
  const identificacion = overrides?.identificacion ?? `${Date.now()}`;

  await user.type(screen.getByLabelText('N.º de identificación'), identificacion);
  await user.selectOptions(screen.getByLabelText('¿Cómo te identificas?'), 'estudiante');
  await user.type(screen.getByLabelText('Nombre Completo'), 'Usuario de Prueba');
  await user.type(screen.getByLabelText('Correo Electrónico'), correo);
  await user.type(screen.getByLabelText('Teléfono'), '3101234567');
  await user.type(screen.getByLabelText('Contraseña'), 'Pass1234');
  await user.type(screen.getByLabelText('Confirmar Contraseña'), 'Pass1234');
  await user.click(screen.getByLabelText(/Acepto los términos/));

  return { correo, identificacion };
}

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('Register', () => {
  it('renderiza el formulario de registro', () => {
    renderRegister();

    expect(screen.getByLabelText('Nombre Completo')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument();
  });

  it('registra un usuario nuevo con datos válidos y navega al dashboard', async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/app/dashboard'));
    expect(toast.success).toHaveBeenCalled();
  });

  it('muestra un error si el correo ya está registrado', async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillValidForm(user, { correo: 'admin@sena.edu.co' });
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Ya existe una cuenta registrada con este correo.')
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('valida en tiempo real (sin enviar el formulario) si el correo ya está registrado', async () => {
    const user = userEvent.setup();
    renderRegister();

    // admin@sena.edu.co ya existe en la semilla (appFakeApi.ts).
    await user.type(screen.getByLabelText('Correo Electrónico'), 'admin@sena.edu.co');

    expect(await screen.findByText('Este correo ya está registrado')).toBeInTheDocument();
    // Todavía no se envió el formulario.
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('valida en tiempo real si el número de teléfono ya está registrado', async () => {
    const user = userEvent.setup();
    renderRegister();

    // El admin (id 1) tiene numero_telefonico '3101234567' en la semilla.
    await user.type(screen.getByLabelText('Teléfono'), '3101234567');

    expect(await screen.findByText('Este número ya está registrado')).toBeInTheDocument();
  });

  it('valida en tiempo real si el documento ya pertenece a un conductor registrado', async () => {
    const user = userEvent.setup();
    renderRegister();

    // El conductor id 1 (semilla, appFakeApi.ts) tiene documento CC 2345678901.
    // El tipo por defecto del formulario ya es CC, así que basta con escribir el número.
    await user.type(screen.getByLabelText('N.º de identificación'), '2345678901');

    expect(await screen.findByText('Este documento ya está registrado')).toBeInTheDocument();
  });

  it('no muestra error de disponibilidad para un correo/número/documento que no están en uso', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.type(screen.getByLabelText('Correo Electrónico'), `libre-${Date.now()}@sena.edu.co`);
    await user.type(screen.getByLabelText('Teléfono'), '3009998877');
    await user.type(screen.getByLabelText('N.º de identificación'), '9999999999');

    // Primero confirma que el chequeo en vivo realmente arrancó (el debounce
    // disparó la consulta)...
    await waitFor(() => expect(screen.queryAllByText('Verificando disponibilidad…').length).toBeGreaterThan(0));
    // ...y después espera a que termine, antes de afirmar que no quedó
    // ningún error de disponibilidad.
    await waitFor(
      () => expect(screen.queryAllByText('Verificando disponibilidad…').length).toBe(0),
      { timeout: 2000 }
    );

    expect(screen.queryByText('Este correo ya está registrado')).not.toBeInTheDocument();
    expect(screen.queryByText('Este número ya está registrado')).not.toBeInTheDocument();
    expect(screen.queryByText('Este documento ya está registrado')).not.toBeInTheDocument();
  });
});
