import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('no ofrece permisos para un rol nuevo (todavía no existe en el backend real)', async () => {
    const user = userEvent.setup();
    renderRoles();
    await waitFor(() => {
      expect(screen.getAllByText('Administrador').length).toBeGreaterThan(0);
    });

    await user.click(screen.getByText('Nuevo Rol'));
    await screen.findByLabelText('Nombre del rol');

    expect(screen.getByText(/todavía no tiene permisos asignados en el backend/)).toBeInTheDocument();
    // Nada clickeable: es de solo lectura, no un editor.
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('muestra los permisos reales del rol (solo lectura) al editar uno existente', async () => {
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
      expect(screen.getByText('2 / 3 asignados')).toBeInTheDocument();
    });
    expect(screen.getByText('configuracion.gestionar')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    // Nada clickeable: ver el permiso guardado no significa poder cambiarlo desde aquí.
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
