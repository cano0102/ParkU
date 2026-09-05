import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createTestQueryClient } from '@/test/queryWrapper';
import { AuthProvider } from '@/context/AuthContext';
import { createAppBackends } from '@/test/appFakeApi';
import { ROLES } from '@/services/core/roles';
import { Perfil } from './PerfilPage';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));

// Se guarda la referencia (y se rehace en cada prueba) para poder mirar lo que quedó
// GUARDADO, no solo lo que se ve en pantalla: desde que el perfil se persiste en la API,
// esa es la diferencia que importa.
let backends = createAppBackends();

const SEED_USER = {
  id: '1',
  correo: 'admin@sena.edu.co',
  nombre: 'Administrador ParkU',
  numero: '3101234567',
  rol: ROLES.ADMIN,
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
    backends = createAppBackends();
    apiFetchMock.mockImplementation(backends.apiFetch);
    localStorage.setItem('parkuToken', 'fake-token-1');
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
    expect(screen.getAllByText('Administrador').length).toBeGreaterThanOrEqual(2);
    // El perfil identifica a la persona por su documento, no por el id interno de la base.
    // Esta cuenta sembrada no tiene documento, así que lo dice en vez de dejar el hueco.
    expect(screen.getByText('Sin documento registrado')).toBeInTheDocument();
    expect(screen.queryByText('ID de usuario')).not.toBeInTheDocument();
  });

  it('muestra el documento de la cuenta cuando lo tiene', async () => {
    localStorage.setItem('parkUUser', JSON.stringify({
      id: '2', correo: 'ana.martinez@sena.edu.co', nombre: 'Ana Martínez R.', rol: ROLES.VIGILANTE,
    }));
    renderPerfil();

    // El tipo y el número van en filas separadas, como en el resto de formularios.
    expect(await screen.findByText('2345678901')).toBeInTheDocument();
    expect(screen.getByText('CC')).toBeInTheDocument();
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
    // Esta cuenta semilla no tiene documento y ahora es obligatorio: hay que completarlo
    // para poder guardar.
    await user.type(screen.getByLabelText('Número de documento'), '1122334455');

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(screen.getAllByText('Admin Actualizado').length).toBeGreaterThanOrEqual(2);
    });
    expect(screen.getByText('3009998877')).toBeInTheDocument();
  });

  it('guarda en la API el correo y el documento, y arrastra al conductor vinculado', async () => {
    const user = userEvent.setup();
    // Ana tiene cuenta (id 2) y conductor vinculado (usuario_id 2) en los datos semilla.
    localStorage.setItem('parkUUser', JSON.stringify({
      id: '2', correo: 'ana.martinez@sena.edu.co', nombre: 'Ana Martínez R.', numero: '', rol: ROLES.VIGILANTE,
    }));
    renderPerfil();
    await waitFor(() => expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThanOrEqual(2));

    await user.click(screen.getByRole('button', { name: /editar/i }));

    const correo = screen.getByLabelText('Correo');
    await user.clear(correo);
    await user.type(correo, 'ana.nueva@sena.edu.co');

    const documento = screen.getByLabelText('Número de documento');
    await user.clear(documento);
    await user.type(documento, '9988776655');

    await user.selectOptions(screen.getByLabelText('Tipo de documento'), 'CE');
    await user.click(screen.getByRole('button', { name: /guardar/i }));

    // La cuenta quedó guardada en la API, no solo en esta pantalla.
    await waitFor(() => {
      expect(backends.usuarios.items.find((u: any) => u.id === 2)).toMatchObject({
        correo: 'ana.nueva@sena.edu.co', tipo_documento: 'CE', numero_documento: '9988776655',
      });
    });

    // Y el conductor vinculado quedó con lo mismo: es lo que ve el módulo de Conductores.
    expect(backends.conductores.items.find((c: any) => c.usuario_id === 2)).toMatchObject({
      correo: 'ana.nueva@sena.edu.co', tipo_documento: 'CE', numero_documento: '9988776655',
    });
  }, 20000);

  it('avisa y no deja guardar si el correo no es válido', async () => {
    const user = userEvent.setup();
    renderPerfil();
    await waitFor(() => expect(screen.getAllByText('Administrador ParkU').length).toBeGreaterThanOrEqual(2));

    await user.click(screen.getByRole('button', { name: /editar/i }));
    const correo = screen.getByLabelText('Correo');
    await user.clear(correo);
    await user.type(correo, 'esto-no-es-un-correo');
    await user.tab();

    expect(await screen.findByText('Ingresa un correo electrónico válido')).toBeInTheDocument();
    // El botón se bloquea: no hay forma de mandar a la API algo que ya se sabe inválido.
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
    expect(backends.usuarios.items.find((u: any) => u.id === 1)).toMatchObject({ correo: 'admin@sena.edu.co' });
  }, 20000);

  it('avisa mientras se escribe si el documento ya está en uso, sin decir de quién es', async () => {
    const user = userEvent.setup();
    localStorage.setItem('parkUUser', JSON.stringify({
      id: '2', correo: 'ana.martinez@sena.edu.co', nombre: 'Ana Martínez R.', numero: '', rol: ROLES.VIGILANTE,
    }));
    renderPerfil();
    await waitFor(() => expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThanOrEqual(2));

    await user.click(screen.getByRole('button', { name: /editar/i }));
    const documento = screen.getByLabelText('Número de documento');
    await user.clear(documento);
    // 3456789012 es el documento de la cuenta de Pedro en los datos semilla.
    await user.type(documento, '3456789012');

    const aviso = await screen.findByText('Ese documento ya está registrado en otra cuenta', undefined, { timeout: 4000 });
    expect(aviso).toBeInTheDocument();
    // Lo importante: dice que está ocupado, no A QUIÉN pertenece.
    expect(screen.queryByText(/pedro/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pedro.ruiz@sena.edu.co/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
  }, 20000);

  it('valida mientras se escribe, sin esperar a salir del campo', async () => {
    const user = userEvent.setup();
    renderPerfil();
    await waitFor(() => expect(screen.getAllByText('Administrador ParkU').length).toBeGreaterThanOrEqual(2));

    await user.click(screen.getByRole('button', { name: /editar/i }));
    const telefono = screen.getByLabelText('Teléfono');
    await user.clear(telefono);
    await user.type(telefono, '123');

    // Sin blur ni submit: el aviso ya está.
    expect(screen.getByText('Ingresa un número de teléfono colombiano válido (10 dígitos)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
  }, 20000);

  it('no deja guardar sin documento: es obligatorio', async () => {
    const user = userEvent.setup();
    renderPerfil();
    await waitFor(() => expect(screen.getAllByText('Administrador ParkU').length).toBeGreaterThanOrEqual(2));

    // La cuenta semilla no tiene documento, así que el formulario abre pidiéndolo.
    await user.click(screen.getByRole('button', { name: /editar/i }));
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    expect(screen.getByRole('button', { name: /guardar/i })).toBeDisabled();
    expect(backends.usuarios.items.find((u: any) => u.id === 1)).toMatchObject({ nombre: 'Administrador ParkU' });

    // En cuanto se completa, se puede guardar.
    await user.type(screen.getByLabelText('Número de documento'), '1122334455');
    await waitFor(() => expect(screen.getByRole('button', { name: /guardar/i })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    await waitFor(() => {
      expect(backends.usuarios.items.find((u: any) => u.id === 1)).toMatchObject({
        tipo_documento: 'CC', numero_documento: '1122334455',
      });
    });
  }, 20000);

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
