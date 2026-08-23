import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createTestQueryClient } from '@/test/queryWrapper';
import { AuthProvider } from '@/context/AuthContext';
import { Perfil } from './index';

const SEED_USER = {
  id: '1',
  correo: 'admin@sena.edu.co',
  nombre: 'Administrador ParkU',
  numero: '3101234567',
  rol: 'Administrador',
};

function renderPerfil() {
  const client = createTestQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Perfil />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('Perfil', () => {
  beforeEach(() => {
    localStorage.setItem('parkUUser', JSON.stringify(SEED_USER));
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renderiza la información del usuario logueado', async () => {
    renderPerfil();

    await waitFor(() => {
      expect(screen.getAllByText('Administrador ParkU').length).toBeGreaterThanOrEqual(2);
    });
    expect(screen.getAllByText('admin@sena.edu.co').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('3101234567')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getAllByText('Administrador').length).toBeGreaterThanOrEqual(2);
  });

  it('permite editar el nombre y el teléfono y guardarlos', async () => {
    const user = userEvent.setup();
    renderPerfil();

    await waitFor(() => {
      expect(screen.getAllByText('Administrador ParkU').length).toBeGreaterThanOrEqual(2);
    });

    await user.click(screen.getByRole('button', { name: /editar/i }));

    const nombreInput = screen.getByDisplayValue('Administrador ParkU');
    const numeroInput = screen.getByDisplayValue('3101234567');

    await user.clear(nombreInput);
    await user.type(nombreInput, 'Admin Actualizado');
    await user.clear(numeroInput);
    await user.type(numeroInput, '3009998877');

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Admin Actualizado').length).toBeGreaterThanOrEqual(2);
    });
    expect(screen.getByText('3009998877')).toBeInTheDocument();
  });

  it('cambia la contraseña exitosamente con datos válidos', async () => {
    const user = userEvent.setup();
    renderPerfil();

    await waitFor(() => {
      expect(screen.getAllByText('Administrador ParkU').length).toBeGreaterThanOrEqual(2);
    });

    await user.click(screen.getByRole('button', { name: /cambiar/i }));

    const dialog = await screen.findByRole('dialog');
    const current = within(dialog).getByPlaceholderText('Contraseña actual');
    const nueva = within(dialog).getByPlaceholderText('Nueva contraseña');
    const confirmar = within(dialog).getByPlaceholderText('Confirmar nueva contraseña');

    await user.type(current, 'Pass1234');
    await user.type(nueva, 'NuevaPass123');
    await user.type(confirmar, 'NuevaPass123');

    const submitBtn = within(dialog).getByRole('button', { name: /guardar cambios/i });
    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('muestra un error si la contraseña actual es incorrecta', async () => {
    const user = userEvent.setup();
    const errorSpy = vi.spyOn(toast, 'error');
    renderPerfil();

    await waitFor(() => {
      expect(screen.getAllByText('Administrador ParkU').length).toBeGreaterThanOrEqual(2);
    });

    await user.click(screen.getByRole('button', { name: /cambiar/i }));

    const dialog = await screen.findByRole('dialog');
    const current = within(dialog).getByPlaceholderText('Contraseña actual');
    const nueva = within(dialog).getByPlaceholderText('Nueva contraseña');
    const confirmar = within(dialog).getByPlaceholderText('Confirmar nueva contraseña');

    await user.type(current, 'ContraseñaIncorrecta1');
    await user.type(nueva, 'OtraPass456');
    await user.type(confirmar, 'OtraPass456');

    const submitBtn = within(dialog).getByRole('button', { name: /guardar cambios/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith('Contraseña actual incorrecta');
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
