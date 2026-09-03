import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppBackends, usuariosSeed } from '@/test/appFakeApi';
import { AuthProvider } from '@/context/AuthContext';
import Usuarios from './UsuariosPage';
import { createTestQueryClient } from '@/test/queryWrapper';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));

// Usuario NO protegido con teléfono propio, para probar edición (el admin de la semilla base
// ahora está protegido — ver USUARIOS_PROTEGIDOS — y ya no se puede editar).
usuariosSeed.push({
  id: 5, correo: 'laura.gomez@sena.edu.co', contrasena: 'Pass1234', nombre: 'Laura Gómez R.',
  numero_telefonico: '3159876543', rol_id: 2, estado: 'ACTIVO',
});

apiFetchMock.mockImplementation(createAppBackends().apiFetch);

function renderUsuarios() {
  const client = createTestQueryClient();
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <Usuarios />
      </AuthProvider>
    </QueryClientProvider>
  );
}

describe('Usuarios', () => {
  it('renderiza los usuarios semilla tras cargar', async () => {
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('admin@sena.edu.co').length).toBeGreaterThan(0);
  });

  it('muestra el documento del usuario, tomado del conductor vinculado por usuario_id', async () => {
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });

    // El conductor semilla con usuario_id 2 es el que aporta el documento de Ana Martínez:
    // la cuenta en sí no guarda documento en la API real.
    expect(screen.getAllByText('CC 2345678901').length).toBeGreaterThan(0);
    // Y un usuario sin conductor vinculado lo dice explícitamente en vez de omitir el dato.
    expect(screen.getAllByText('Sin documento registrado').length).toBeGreaterThan(0);
  });

  it('filtra la lista al escribir en el buscador', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });

    const search = screen.getByLabelText('Buscar usuarios');
    await user.type(search, 'ana.martinez');

    await waitFor(() => {
      expect(screen.queryByText('María Díaz P.')).not.toBeInTheDocument();
    });
    expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
  });

  it('muestra "No se encontraron usuarios" cuando el filtro no coincide con nada', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });

    const search = screen.getByLabelText('Buscar usuarios');
    await user.type(search, 'usuario-inexistente-xyz');

    await waitFor(() => {
      expect(screen.getByText('No se encontraron usuarios')).toBeInTheDocument();
    });
  });

  it('alterna entre vista de cuadrícula y lista', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });

    expect(screen.queryByText('Correo')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Lista'));

    await waitFor(() => {
      expect(screen.getByText('Correo')).toBeInTheDocument();
    });
    expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);

    await user.click(screen.getByLabelText('Cuadrícula'));
    await waitFor(() => {
      expect(screen.queryByText('Correo')).not.toBeInTheDocument();
    });
  });

  it('filtra por rol usando el selector de filtros', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });

    await user.selectOptions(screen.getByLabelText('Filtrar por rol'), 'Vigilante');

    await waitFor(() => {
      expect(screen.queryByText('María Díaz P.')).not.toBeInTheDocument();
    });
    expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
  });

  it('abre el modal de creación con el formulario vacío al hacer click en "Nuevo Usuario"', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByText('Nuevo Usuario'));

    expect(await screen.findByRole('heading', { level: 2, name: 'Nuevo Usuario' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ej. María García López')).toHaveValue('');
    // El modo creación no muestra el selector de Estado de la cuenta.
    expect(screen.queryByText('Estado de la cuenta')).not.toBeInTheDocument();
  });

  it('muestra errores de validación al enviar el formulario de creación vacío', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByText('Nuevo Usuario'));
    await screen.findByRole('heading', { level: 2, name: 'Nuevo Usuario' });

    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }));

    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El correo es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('Debe seleccionar un rol')).toBeInTheDocument();
    expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument();
  });

  it('crea un nuevo usuario completando el formulario y enviándolo', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByText('Nuevo Usuario'));
    await screen.findByRole('heading', { level: 2, name: 'Nuevo Usuario' });

    const suffix = Date.now();
    // El nombre no lleva el sufijo numérico: los campos de nombre de persona
    // ya no aceptan dígitos (ver src/utils/validation.ts#quitarDigitos). La
    // unicidad para la búsqueda posterior la da el correo, no el nombre.
    const nombre = `Usuario Prueba Nuevo`;
    const correo = `usuario.prueba.${suffix}@sena.edu.co`;

    await user.type(screen.getByPlaceholderText('ej. María García López'), nombre);
    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), correo);
    await user.type(screen.getByPlaceholderText('••••••••'), 'Pass1234');
    // Mientras no se elige rol, el único combobox del formulario es el selector de rol.
    await user.selectOptions(screen.getByRole('combobox'), 'Comunidad SENA');

    // Al elegir Comunidad SENA aparece la sección de documento: para esas cuentas el
    // documento es obligatorio y se guarda en el conductor vinculado (ver
    // useUsuariosData.guardarDocumentoDeUsuario). Los otros roles no la ven.
    const documento = String(suffix).slice(-6);
    await user.type(screen.getByPlaceholderText('1001234567'), documento);
    const combos = screen.getAllByRole('combobox');
    await user.selectOptions(combos[combos.length - 1], 'Aprendiz');

    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 2, name: 'Nuevo Usuario' })).not.toBeInTheDocument();
    });
    await user.type(screen.getByLabelText('Buscar usuarios'), correo);

    await waitFor(() => {
      expect(screen.getAllByText(nombre).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(correo).length).toBeGreaterThan(0);
    // Ciclo completo: el documento se guardó en el conductor vinculado y vuelve a leerse
    // desde ahí para mostrarse en la tarjeta del usuario recién creado.
    await waitFor(() => {
      expect(screen.getAllByText(`CC ${documento}`).length).toBeGreaterThan(0);
    });
  }, 15000);

  it('abre el modal de edición con los datos del usuario precargados', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });

    const card = screen.getByText('Ana Martínez R.').closest('.u-card') as HTMLElement;
    await user.click(within(card).getByLabelText('Editar'));

    expect(await screen.findByRole('heading', { level: 2, name: 'Editar Usuario' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('ana.martinez@sena.edu.co')).toBeInTheDocument();
  });

  it('muestra el teléfono de la cuenta en la tarjeta y lo precarga al editar', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Laura Gómez R.').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('3159876543').length).toBeGreaterThan(0);

    const card = screen.getByText('Laura Gómez R.').closest('.u-card') as HTMLElement;
    await user.click(within(card).getByLabelText('Editar'));

    expect(await screen.findByRole('heading', { level: 2, name: 'Editar Usuario' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('3159876543')).toBeInTheDocument();
  });

  it('no permite editar al usuario protegido (el admin de la semilla)', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador ParkU').length).toBeGreaterThan(0);
    });

    const card = screen.getByText('Administrador ParkU').closest('.u-card') as HTMLElement;
    await user.click(within(card).getByLabelText('Editar'));

    expect(screen.queryByRole('heading', { level: 2, name: 'Editar Usuario' })).not.toBeInTheDocument();
  });

  it('permite alternar el estado de un usuario no protegido', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });

    const card = screen.getByText('Ana Martínez R.').closest('.u-card') as HTMLElement;
    const toggle = within(card).getByLabelText('Desactivar usuario');
    await user.click(toggle);

    await waitFor(() => {
      expect(within(card).getByLabelText('Activar usuario')).toBeInTheDocument();
    });
  });

  it('no permite desactivar al único Administrador activo del sistema', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador ParkU').length).toBeGreaterThan(0);
    });

    const card = screen.getByText('Administrador ParkU').closest('.u-card') as HTMLElement;
    const toggle = within(card).getByLabelText('Desactivar usuario');
    await user.click(toggle);

    // El intento no debe surtir efecto: el toggle sigue mostrando "activo".
    await waitFor(() => {
      expect(within(card).getByLabelText('Desactivar usuario')).toBeInTheDocument();
    });
    expect(within(card).getByText('Protegido')).toBeInTheDocument();
  });
});
