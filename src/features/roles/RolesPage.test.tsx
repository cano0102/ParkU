import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createAppBackends } from '@/test/appFakeApi';
import { Roles } from './RolesPage';
import { createTestQueryClient, withQueryClient } from '@/test/queryWrapper';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock }));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

function renderRoles() {
  const client = createTestQueryClient();
  const Wrapper = withQueryClient(client);
  return render(
    <Wrapper>
      <Roles />
    </Wrapper>
  );
}

describe('Roles', () => {
  it('renderiza los roles semilla tras cargar', async () => {
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Vigilante').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Comunidad SENA').length).toBeGreaterThan(0);
  });

  it('filtra la lista al escribir en el buscador', async () => {
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });

    const search = screen.getByLabelText('Buscar roles');
    await user.type(search, 'Vigilante');

    await waitFor(() => {
      expect(screen.queryByText('Comunidad SENA')).not.toBeInTheDocument();
    });
    expect(screen.getAllByText('Vigilante').length).toBeGreaterThan(0);
  });

  it('muestra "No se encontraron roles" cuando el filtro no coincide con nada', async () => {
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });

    const search = screen.getByLabelText('Buscar roles');
    await user.type(search, 'rol-inexistente-xyz');

    await waitFor(() => {
      expect(screen.getByText('No se encontraron roles')).toBeInTheDocument();
    });
  });

  it('abre el modal de creación con el formulario vacío al hacer click en "Nuevo Rol"', async () => {
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByText('Nuevo Rol'));

    expect(await screen.findByRole('heading', { name: 'Nuevo Rol' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del rol')).toHaveValue('');
    // El modo creación no muestra el selector de Estado.
    expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument();
  });

  it('crea un nuevo rol completando el formulario y enviándolo', async () => {
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByText('Nuevo Rol'));
    const nombreInput = await screen.findByLabelText('Nombre del rol');

    const nombreUnico = `Rol Test ${Date.now()}`;
    await user.type(nombreInput, nombreUnico);

    await user.click(screen.getByRole('button', { name: 'Crear Rol' }));

    await waitFor(() => {
      expect(screen.getAllByText(nombreUnico).length).toBeGreaterThan(0);
    });
  });

  it('abre el detalle de un rol al hacer click en "Ver detalle" y permite pasar a edición', async () => {
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByLabelText('Ver detalle de Administrador'));

    // El modal de vista muestra el nombre del rol como encabezado h2 (la tarjeta
    // detrás también tiene un h3 con el mismo texto, por eso se filtra por nivel).
    expect(await screen.findByRole('heading', { level: 2, name: 'Administrador' })).toBeInTheDocument();

    await user.click(screen.getByText('Editar este rol'));

    expect(await screen.findByRole('heading', { level: 2, name: 'Editar Rol' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre del rol')).toHaveValue('Administrador');
  });

  it('deshabilita el switch de estado para roles protegidos (Administrador)', async () => {
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });

    expect(screen.queryByLabelText('Deshabilitar rol Administrador')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Habilitar rol Administrador')).not.toBeInTheDocument();
  });

  it('permite alternar el estado de un rol no protegido (Vigilante)', async () => {
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Vigilante').length).toBeGreaterThan(0);
    });

    const toggle = screen.getByLabelText('Deshabilitar rol Vigilante');
    await user.click(toggle);

    await waitFor(() => {
      expect(screen.getByLabelText('Habilitar rol Vigilante')).toBeInTheDocument();
    });
  });

  it('permite marcar permisos al crear un rol nuevo', async () => {
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByText('Nuevo Rol'));
    await screen.findByLabelText('Nombre del rol');

    // Un rol nuevo empieza sin permisos marcados, pero se pueden elegir desde ya.
    const casillas = await screen.findAllByRole('checkbox');
    expect(casillas.length).toBeGreaterThan(0);
    expect(casillas.every((c) => !(c as HTMLInputElement).checked)).toBe(true);

    await user.click(casillas[0]);
    expect((casillas[0] as HTMLInputElement).checked).toBe(true);
  });

  it('precarga los permisos guardados del rol y permite cambiarlos al editar', async () => {
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByLabelText('Ver detalle de Administrador'));
    await user.click(await screen.findByText('Editar este rol'));
    await screen.findByRole('heading', { level: 2, name: 'Editar Rol' });

    // Semilla: rol 1 (Administrador) tiene 2 permisos reales asignados en
    // rolesPermisosSeed (ver appFakeApi.ts) — "configuracion.gestionar" y
    // "parqueaderos.consultar", agrupados por sus módulos reales.
    await waitFor(() => {
      expect(screen.getByText('2 / 3 seleccionados')).toBeInTheDocument();
    });
    expect(screen.getByText('Gestionar roles y permisos')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();

    // Y ahora sí se pueden cambiar: al desmarcar uno, el contador baja.
    const marcados = screen.getAllByRole('checkbox').filter((c) => (c as HTMLInputElement).checked);
    expect(marcados).toHaveLength(2);
    await user.click(marcados[0]);
    await waitFor(() => {
      expect(screen.getByText('1 / 3 seleccionados')).toBeInTheDocument();
    });
  }, 15000);

  it('guarda los permisos desmarcados al editar el rol', async () => {
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByLabelText('Ver detalle de Administrador'));
    await user.click(await screen.findByText('Editar este rol'));
    await screen.findByRole('heading', { level: 2, name: 'Editar Rol' });
    await waitFor(() => {
      expect(screen.getByText('2 / 3 seleccionados')).toBeInTheDocument();
    });

    // Se quita un permiso y se guarda: debe persistirse (DELETE sobre rol_permiso).
    const marcados = screen.getAllByRole('checkbox').filter((c) => (c as HTMLInputElement).checked);
    await user.click(marcados[0]);
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { level: 2, name: 'Editar Rol' })).not.toBeInTheDocument();
    });

    // Al reabrir, el backend ya devuelve solo el permiso que quedó.
    await user.click(screen.getByLabelText('Ver detalle de Administrador'));
    await user.click(await screen.findByText('Editar este rol'));
    await waitFor(() => {
      expect(screen.getByText('1 / 3 seleccionados')).toBeInTheDocument();
    });
  }, 20000);

  it('no ofrece el botón Eliminar para un rol protegido (Administrador)', async () => {
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });

    expect(screen.queryByLabelText('Eliminar Administrador')).not.toBeInTheDocument();
  });

  it('eliminar un rol no protegido pide confirmación y lo quita de la lista', async () => {
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Vigilante').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByLabelText('Eliminar Vigilante'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Vigilante/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText('Vigilante')).not.toBeInTheDocument());
  });
});
