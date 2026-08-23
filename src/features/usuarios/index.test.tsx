import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Usuarios from './index';
import { createTestQueryClient, withQueryClient } from '@/test/queryWrapper';

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

    // En modo grid no hay encabezado de tabla ("Correo" es cabecera de columna en modo lista).
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

    expect(await screen.findByText('El número de identificación es obligatorio')).toBeInTheDocument();
    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
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
    const nombre = `Usuario Prueba ${suffix}`;
    const correo = `usuario.prueba.${suffix}@sena.edu.co`;

    await user.type(screen.getByPlaceholderText('ej. 1001234567'), `${suffix}`.padEnd(6, '0'));
    await user.type(screen.getByPlaceholderText('ej. María García López'), nombre);
    await user.type(screen.getByPlaceholderText('correo@sena.edu.co'), correo);
    await user.type(screen.getByPlaceholderText('••••••••'), 'Pass1234');
    // FormField no asocia su <label> con el control (sin htmlFor/id), así que
    // el <select> de rol no es ubicable por texto de label; se toma por
    // posición entre los combobox del formulario (tipo de documento, luego rol).
    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[selects.length - 1], 'Usuario Normal');

    await user.click(screen.getByRole('button', { name: 'Crear Usuario' }));

    // Con 11 usuarios semilla + este nuevo, la vista grid (9 por página) puede
    // dejar el registro recién creado en la página 2; se filtra por su correo
    // único para no depender de en qué página cayó.
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

    // El botón "Editar" tiene el mismo aria-label en todas las tarjetas, así
    // que se ubica el de la tarjeta de Ana Martínez subiendo hasta ".u-card".
    const card = screen.getByText('Ana Martínez R.').closest('.u-card') as HTMLElement;
    await user.click(within(card).getByLabelText('Editar'));

    expect(await screen.findByRole('heading', { level: 2, name: 'Editar Usuario' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('ana.martinez@sena.edu.co')).toBeInTheDocument();
  });

  it('permite alternar el estado de un usuario no protegido', async () => {
    const user = userEvent.setup();
    renderUsuarios();
    await waitFor(() => {
      expect(screen.getAllByText('Ana Martínez R.').length).toBeGreaterThan(0);
    });

    // Igual que con "Editar": el aria-label del switch de estado se repite
    // en cada tarjeta, así que se escopea a la de Ana Martínez (activa en la
    // semilla y sin protección especial).
    const card = screen.getByText('Ana Martínez R.').closest('.u-card') as HTMLElement;
    const toggle = within(card).getByLabelText('Desactivar usuario');
    await user.click(toggle);

    await waitFor(() => {
      expect(within(card).getByLabelText('Activar usuario')).toBeInTheDocument();
    });
  });
});
