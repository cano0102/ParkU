import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createAppBackends } from '@/test/appFakeApi';
import Usuarios from './UsuariosPage';
import { createTestQueryClient, withQueryClient } from '@/test/queryWrapper';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock }));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

function renderUsuarios() {
  const client = createTestQueryClient();
  const Wrapper = withQueryClient(client);
  return render(
    <Wrapper>
      <Usuarios />
    </Wrapper>
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
    // El único combobox del formulario simplificado es el selector de rol
    // (ya no hay tipo de documento ni tipo de usuario, ver services/api/usuarios.ts).
    await user.selectOptions(screen.getByRole('combobox'), 'Comunidad SENA');

    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 2, name: 'Nuevo Usuario' })).not.toBeInTheDocument();
    });
    await user.type(screen.getByLabelText('Buscar usuarios'), correo);

    await waitFor(() => {
      expect(screen.getAllByText(nombre).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(correo).length).toBeGreaterThan(0);
  });

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
      expect(screen.getAllByText('Administrador ParkU').length).toBeGreaterThan(0);
    });

    // Semilla: el admin (id 1) tiene numero_telefonico '3101234567' (ver appFakeApi.ts).
    expect(screen.getAllByText('3101234567').length).toBeGreaterThan(0);

    const card = screen.getByText('Administrador ParkU').closest('.u-card') as HTMLElement;
    await user.click(within(card).getByLabelText('Editar'));

    expect(await screen.findByRole('heading', { level: 2, name: 'Editar Usuario' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('3101234567')).toBeInTheDocument();
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
});
