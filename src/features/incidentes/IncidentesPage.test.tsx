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
    renderIncidentes();
    await waitFor(() =>
      expect(screen.getAllByText('Vehículo mal estacionado bloqueando entrada').length).toBeGreaterThan(0)
    );

    const descripciones = screen
      .getAllByRole('switch')
      .map((sw) => sw.closest('.incidente-card')?.querySelector('p')?.textContent);

    // Posiciones relativas (no igualdad exacta): los tests anteriores de este archivo
    // dejan incidentes creados en la semilla compartida.
    const posicion = (texto: string) => descripciones.findIndex((d) => d?.includes(texto));

    // Prioridad ALTA por encima de MEDIA entre los abiertos, aunque sea más antigua.
    expect(posicion('Derrame de aceite')).toBeLessThan(posicion('mal estacionado'));
    // CERRADO al final, pese a ser el más reciente y de prioridad CRÍTICA.
    expect(posicion('Barrera dañada')).toBe(descripciones.length - 1);
  });

  it('bloquea el switch de un incidente cerrado', async () => {
    const user = userEvent.setup();
    renderIncidentes();
    await waitFor(() =>
      expect(screen.getAllByText('Barrera dañada en el acceso norte').length).toBeGreaterThan(0)
    );

    const switches = screen.getAllByRole('switch');
    const switchCerrado = switches[switches.length - 1];
    expect(switchCerrado).toBeDisabled();
    expect(switchCerrado).toHaveAccessibleName('El incidente está cerrado y no puede cambiar de estado');

    await user.click(switchCerrado);
    expect(switchCerrado).toHaveAttribute('aria-checked', 'false');
  });

  it('cambia el estado de un incidente con el switch de la tarjeta', async () => {
    const user = userEvent.setup();
    renderIncidentes();
    await waitFor(() =>
      expect(screen.getAllByText('Vehículo mal estacionado bloqueando entrada').length).toBeGreaterThan(0)
    );

    // El primero de la lista es el abierto de mayor prioridad (ALTA, "derrame de aceite"),
    // no el más reciente ni el CRÍTICO ya cerrado — ver lib/orden.ts.
    const [firstSwitch] = screen.getAllByRole('switch');
    expect(firstSwitch).toHaveAttribute('aria-checked', 'false');

    await user.click(firstSwitch);

    await waitFor(() => expect(firstSwitch).toHaveAttribute('aria-checked', 'true'));
  });

  it('muestra el conductor del vehículo en el detalle del incidente (trazabilidad)', async () => {
    const user = userEvent.setup();
    renderIncidentes();
    await waitFor(() =>
      expect(screen.getAllByText('Vehículo mal estacionado bloqueando entrada').length).toBeGreaterThan(0)
    );

    // Incidente 1 (semilla, appFakeApi.ts) tiene vehiculo_id 1 -> ABC123, dueño Carlos López M.
    // Se ubica su tarjeta por la descripción en vez de asumir que es la primera del grid: el
    // orden es por fecha desc, y este archivo reutiliza el mismo backend falso entre tests (no
    // uno fresco por test) — si un test anterior crea un incidente, ahora que `fecha_hora` sí
    // se manda al crear (antes se perdía en toApiPayload, ver services/api/incidentes.ts), ese
    // incidente nuevo pasa a ser el más reciente y se movería al primer lugar.
    const descripcion = screen.getAllByText('Vehículo mal estacionado bloqueando entrada')[0];
    const tarjeta = descripcion.closest('.incidente-card') as HTMLElement;
    const verBtn = within(tarjeta).getByLabelText('Ver detalle del incidente');
    await user.click(verBtn);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('ABC123')).toBeInTheDocument();
    expect(within(dialog).getByText(/Carlos López M\. · 2345678901/)).toBeInTheDocument();
  });

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
