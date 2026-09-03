import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppBackends } from '@/test/appFakeApi';
import { AuthProvider } from '@/context/AuthContext';
import { Incidentes } from './IncidentesPage';
import { createTestQueryClient } from '@/test/queryWrapper';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({
  apiFetch: apiFetchMock,
  AUTH_EXPIRED_EVENT: 'parku:auth-expired',
  crearConRespaldo: async (path: string, body: unknown, fetchTodosCrudo: () => Promise<any[]>) => {
    const creado = await apiFetchMock(path, { method: 'POST', body });
    if (creado) return creado;
    const todos = await fetchTodosCrudo();
    return todos.reduce((max: any, item: any) => (item.id > max.id ? item : max));
  },
}));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

function renderIncidentes(client = createTestQueryClient()) {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Incidentes />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('features/incidentes', () => {
  it('renderiza los 2 incidentes semilla tras cargar', async () => {
    renderIncidentes();

    await waitFor(() =>
      expect(screen.getAllByText('Vehículo mal estacionado bloqueando entrada').length).toBeGreaterThan(0)
    );
    expect(screen.getAllByText('Derrame de aceite con posible caída de vehículo').length).toBeGreaterThan(0);
    expect(screen.getByText('Incidentes y Novedades')).toBeInTheDocument();
  });

  it('filtra la lista al escribir en el buscador', async () => {
    const user = userEvent.setup();
    renderIncidentes();
    await waitFor(() =>
      expect(screen.getAllByText('Vehículo mal estacionado bloqueando entrada').length).toBeGreaterThan(0)
    );

    const search = screen.getByLabelText('Buscar incidente');
    await user.type(search, 'aceite');

    await waitFor(() =>
      expect(screen.queryByText('Vehículo mal estacionado bloqueando entrada')).not.toBeInTheDocument()
    );
    expect(screen.getAllByText('Derrame de aceite con posible caída de vehículo').length).toBeGreaterThan(0);
  });

  it('registra un nuevo incidente completando el formulario del modal', async () => {
    const user = userEvent.setup();
    renderIncidentes();
    await waitFor(() =>
      expect(screen.getAllByText('Vehículo mal estacionado bloqueando entrada').length).toBeGreaterThan(0)
    );

    await user.click(screen.getByRole('button', { name: /Registrar Incidente/ }));

    const dialog = await screen.findByRole('dialog');
    expect(screen.getByRole('heading', { name: 'Nuevo Incidente' })).toBeInTheDocument();

    const descripcionUnica = `Incidente de prueba ${Date.now()}`;
    await user.type(screen.getByLabelText('Descripción *'), descripcionUnica);
    await user.selectOptions(screen.getByLabelText('Parqueadero *'), 'PQ-1 Torre A');

    await user.click(screen.getByRole('button', { name: 'Registrar Incidente', hidden: false }));

    await waitFor(() => expect(screen.getAllByText(descripcionUnica).length).toBeGreaterThan(0));
    expect(dialog).not.toBeInTheDocument();
  });

  it('muestra los incidentes abiertos por prioridad y deja los finalizados al final', async () => {
    const { container } = renderIncidentes();
    await waitFor(() =>
      expect(screen.getAllByText('Vehículo mal estacionado bloqueando entrada').length).toBeGreaterThan(0)
    );

    const descripciones = Array.from(container.querySelectorAll('.incidente-card')).map(
      (card) => card.querySelector('p')?.textContent
    );
    // Posiciones relativas (no igualdad exacta): los tests anteriores de este archivo
    // dejan incidentes creados en la semilla compartida.
    const posicion = (texto: string) => descripciones.findIndex((d) => d?.includes(texto));

    // Prioridad ALTA por encima de MEDIA entre los abiertos, aunque sea más antigua.
    expect(posicion('Derrame de aceite')).toBeLessThan(posicion('mal estacionado'));
    // CERRADO al final, pese a ser el más reciente y de prioridad CRÍTICA.
    expect(posicion('Barrera dañada')).toBe(descripciones.length - 1);
  });

  it('no ofrece cambio de estado en un incidente cerrado', async () => {
    renderIncidentes();
    const descripcion = await screen.findByText('Barrera dañada en el acceso norte');
    const tarjeta = descripcion.closest('.incidente-card') as HTMLElement;

    // Sin selector de estado: solo la etiqueta del estado final.
    expect(within(tarjeta).queryByRole('combobox')).not.toBeInTheDocument();
    expect(within(tarjeta).getAllByText('Cerrado').length).toBeGreaterThan(0);
  });

  it('cambia el estado de un incidente abierto con el selector de la tarjeta', async () => {
    const user = userEvent.setup();
    renderIncidentes();
    const descripcion = await screen.findByText('Vehículo mal estacionado bloqueando entrada');
    const tarjeta = descripcion.closest('.incidente-card') as HTMLElement;

    const selector = within(tarjeta).getByRole('combobox', { name: 'Cambiar estado del incidente' });
    await user.selectOptions(selector, 'en_proceso');

    await waitFor(() => {
      const actualizada = screen.getByText('Vehículo mal estacionado bloqueando entrada').closest('.incidente-card') as HTMLElement;
      expect(within(actualizada).getByRole('combobox')).toHaveValue('en_proceso');
    });
  });

  it('desde "en proceso" se puede pasar a resuelto, y ahí el estado queda bloqueado', async () => {
    const user = userEvent.setup();
    renderIncidentes();
    const descripcion = await screen.findByText('Derrame de aceite con posible caída de vehículo');
    const tarjeta = descripcion.closest('.incidente-card') as HTMLElement;

    await user.selectOptions(within(tarjeta).getByRole('combobox'), 'en_proceso');
    await waitFor(() => {
      const t = screen.getByText('Derrame de aceite con posible caída de vehículo').closest('.incidente-card') as HTMLElement;
      expect(within(t).getByRole('combobox')).toHaveValue('en_proceso');
    });

    const enProceso = screen.getByText('Derrame de aceite con posible caída de vehículo').closest('.incidente-card') as HTMLElement;
    await user.selectOptions(within(enProceso).getByRole('combobox'), 'resuelto');

    // Resuelto es final: la tarjeta ya no ofrece selector.
    await waitFor(() => {
      const t = screen.getByText('Derrame de aceite con posible caída de vehículo').closest('.incidente-card') as HTMLElement;
      expect(within(t).queryByRole('combobox')).not.toBeInTheDocument();
      expect(within(t).getAllByText('Resuelto').length).toBeGreaterThan(0);
    });
  }, 15000);

  it('elimina un incidente mediante el modal de confirmación', async () => {
    const user = userEvent.setup();
    renderIncidentes();
    await waitFor(() =>
      expect(screen.getAllByText('Vehículo mal estacionado bloqueando entrada').length).toBeGreaterThan(0)
    );

    // Filtra a un único incidente para que "Eliminar incidente" sea inequívoco.
    const search = screen.getByLabelText('Buscar incidente');
    await user.type(search, 'aceite');
    await waitFor(() => expect(screen.getAllByLabelText('Eliminar incidente')).toHaveLength(1));

    await user.click(screen.getByLabelText('Eliminar incidente'));
    expect(await screen.findByText('¿Eliminar incidente?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() =>
      expect(screen.queryByText('Derrame de aceite con posible caída de vehículo')).not.toBeInTheDocument()
    );
  });
});
