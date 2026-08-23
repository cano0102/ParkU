import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { ControlSalidaPage } from './index';
import { createTestQueryClient } from '@/test/queryWrapper';

function renderControlSalida(client = createTestQueryClient()) {
  return render(
    <QueryClientProvider client={client}>
      <ControlSalidaPage />
    </QueryClientProvider>
  );
}

describe('features/control-salida', () => {
  it('renderiza la página con datos reales (banner, toolbar y paginación)', async () => {
    renderControlSalida();

    // Con >100 registros (12 semilla + sintéticos) y PAGE_SIZE=8 la paginación
    // aparece; el orden es por fecha de entrada descendente, así que los
    // registros semilla (2025-06-20) no necesariamente caen en la página 1.
    await waitFor(() => expect(screen.getByText(/Pág\. \d+ de \d+/)).toBeInTheDocument());
    expect(screen.getByText('Entrada y Salida')).toBeInTheDocument();
    expect(screen.getByLabelText('Buscar registros')).toBeInTheDocument();
  });

  it('filtra la lista al escribir una placa en el buscador (vehículo real ABC123)', async () => {
    const user = userEvent.setup();
    renderControlSalida();
    await waitFor(() => expect(screen.getByText(/Pág\. \d+ de \d+/)).toBeInTheDocument());

    const search = screen.getByLabelText('Buscar registros');
    await user.type(search, 'ABC123');

    await waitFor(() => expect(screen.queryByText('GHI789')).not.toBeInTheDocument());
    expect(screen.getAllByText('ABC123').length).toBeGreaterThan(0);
  });

  it('abre el diálogo de confirmación al eliminar y lo cancela sin borrar el registro', async () => {
    const user = userEvent.setup();
    renderControlSalida();
    await waitFor(() => expect(screen.getByText(/Pág\. \d+ de \d+/)).toBeInTheDocument());

    // Filtra a un único registro para que el botón "Eliminar registro" sea inequívoco
    // (todas las filas comparten el mismo aria-label).
    const search = screen.getByLabelText('Buscar registros');
    await user.type(search, 'ABC123');
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

  it('elimina el registro al confirmar en el diálogo', async () => {
    const user = userEvent.setup();
    renderControlSalida();
    await waitFor(() => expect(screen.getByText(/Pág\. \d+ de \d+/)).toBeInTheDocument());

    const search = screen.getByLabelText('Buscar registros');
    await user.type(search, 'ABC123');
    await waitFor(() => expect(screen.getAllByLabelText('Eliminar registro')).toHaveLength(1));

    await user.click(screen.getByLabelText('Eliminar registro'));
    await screen.findByText(/se eliminará permanentemente/);

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(screen.getByText('No se encontraron registros')).toBeInTheDocument());
    expect(screen.queryByText('ABC123')).not.toBeInTheDocument();
  });
});
