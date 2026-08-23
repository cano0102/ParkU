import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { createTestQueryClient } from '@/test/queryWrapper';
import * as usuariosService from '@/services/usuarios';
import { ForgotPassword } from './ForgotPassword';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from 'sonner';

// Precarga la lista de usuarios en la caché de React Query antes de montar,
// para que la validación de "correo existente" del formulario (que depende
// de useUsuarios()) no corra contra una lista todavía vacía por una
// condición de carrera con el fetch inicial.
async function renderForgotPassword() {
  const client = createTestQueryClient();
  await client.prefetchQuery({ queryKey: ['usuarios'], queryFn: usuariosService.getAll });

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
    expect(toast.success).toHaveBeenCalled();
  });

  it('muestra un error de validación si el correo no pertenece a ninguna cuenta', async () => {
    const user = userEvent.setup();
    await renderForgotPassword();

    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), 'no-existe@sena.edu.co');
    await user.click(screen.getByRole('button', { name: 'Generar Enlace' }));

    expect(
      await screen.findByText('No existe una cuenta registrada con este correo')
    ).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Por favor, corrige los errores del formulario');
  });
});
