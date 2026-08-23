import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Incidentes } from './index';
import { createTestQueryClient } from '@/test/queryWrapper';

function renderIncidentes(client = createTestQueryClient()) {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <Incidentes />
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

  it('cambia el estado de un incidente con el switch de la tarjeta', async () => {
    const user = userEvent.setup();
    renderIncidentes();
    await waitFor(() =>
      expect(screen.getAllByText('Vehículo mal estacionado bloqueando entrada').length).toBeGreaterThan(0)
    );

    // El primero de la lista (orden por fecha desc) es el incidente "mal estacionado".
    const [firstSwitch] = screen.getAllByRole('switch');
    expect(firstSwitch).toHaveAttribute('aria-checked', 'false');

    await user.click(firstSwitch);

    await waitFor(() => expect(firstSwitch).toHaveAttribute('aria-checked', 'true'));
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
