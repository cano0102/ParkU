import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppBackends } from '@/test/appFakeApi';
import { ControlSalidaPage } from './ControlSalidaPage';
import { createTestQueryClient } from '@/test/queryWrapper';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock }));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

function renderControlSalida(client = createTestQueryClient()) {
  return render(
    <QueryClientProvider client={client}>
      <ControlSalidaPage />
    </QueryClientProvider>
  );
}

describe('features/controlSalida', () => {
  it('renderiza la página con datos reales (banner, toolbar y el registro semilla)', async () => {
    renderControlSalida();

    await waitFor(() => expect(screen.getAllByText('ABC123').length).toBeGreaterThan(0));
    expect(screen.getByText('Entrada y Salida')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar registros')).toBeInTheDocument();
  });

  it('filtra la lista al escribir una placa en el buscador (vehículo real ABC123)', async () => {
    const user = userEvent.setup();
    renderControlSalida();
    await waitFor(() => expect(screen.getAllByText('ABC123').length).toBeGreaterThan(0));

    const search = screen.getByLabelText('Buscar registros');
    await user.type(search, 'ZZZ999');

    await waitFor(() => expect(screen.getByText('No se encontraron registros')).toBeInTheDocument());
  });

  it('abre el diálogo de confirmación al eliminar y lo cancela sin borrar el registro', async () => {
    const user = userEvent.setup();
    renderControlSalida();
    await waitFor(() => expect(screen.getAllByLabelText('Eliminar registro')).toHaveLength(1));

    await user.click(screen.getByLabelText('Eliminar registro'));

    expect(
      await screen.findByText(/El registro del vehículo ABC123 se eliminará permanentemente/)
    ).toBeInTheDocument();

    await user.click(screen.getByText('Cancelar'));

    await waitFor(() =>
      expect(screen.queryByText(/se eliminará permanentemente/)).not.toBeInTheDocument()
    );
    expect(screen.getAllByText('ABC123').length).toBeGreaterThan(0);
  });

  it('registra la salida y libera la celda desde el botón "Registrar salida" de la fila', async () => {
    // Antes esta acción solo existía en el mapa/tabla de Parqueaderos — se agregó también acá
    // porque es exactamente la pantalla donde alguien buscaría "registrar salida" por su nombre.
    const user = userEvent.setup();
    renderControlSalida();
    await waitFor(() => expect(screen.getAllByText('ABC123').length).toBeGreaterThan(0));

    expect(screen.getByText('Activo')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Registrar salida y liberar la celda'));

    await waitFor(() => expect(screen.getByText('Completado')).toBeInTheDocument());
    expect(screen.queryByText('Activo')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Registrar salida y liberar la celda')).not.toBeInTheDocument();
  });

  it('elimina el registro al confirmar en el diálogo', async () => {
    const user = userEvent.setup();
    renderControlSalida();
    await waitFor(() => expect(screen.getAllByLabelText('Eliminar registro')).toHaveLength(1));

    await user.click(screen.getByLabelText('Eliminar registro'));
    await screen.findByText(/se eliminará permanentemente/);

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(screen.getByText('No se encontraron registros')).toBeInTheDocument());
    expect(screen.queryByText('ABC123')).not.toBeInTheDocument();
  });
});
