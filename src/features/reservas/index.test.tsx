import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Reservas } from './index';
import { createTestQueryClient } from '@/test/queryWrapper';
import * as reservasService from '@/services/reservas';

function renderReservas(client = createTestQueryClient()) {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <Reservas />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('features/reservas', () => {
  it('muestra el estado vacío cuando no hay reservas (semilla vacía)', async () => {
    renderReservas();

    await waitFor(() => expect(screen.getByText('No se encontraron reservas')).toBeInTheDocument());
    expect(screen.getByText('Gestión de Reservas')).toBeInTheDocument();
  });

  it('crea una reserva y la muestra en la tabla con su estado', async () => {
    await reservasService.create({
      vehiculoId: 'v1',
      celdaId: 'c0',
      fechaReserva: '2025-01-01',
      horaInicio: '08:00',
      horaFin: '10:00',
      estado: 'pendiente',
    });

    renderReservas();

    await waitFor(() => expect(screen.getAllByText('ABC123').length).toBeGreaterThan(0));
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
  });

  it('filtra la lista al escribir una placa que no coincide con ninguna reserva', async () => {
    const user = userEvent.setup();
    renderReservas();
    await waitFor(() => expect(screen.getAllByText('ABC123').length).toBeGreaterThan(0));

    const search = screen.getByLabelText('Buscar reserva');
    await user.type(search, 'ZZZ999');

    await waitFor(() => expect(screen.getByText('No se encontraron reservas')).toBeInTheDocument());
    expect(screen.queryByText('ABC123')).not.toBeInTheDocument();
  });

  it('abre el modal de detalle con la información de la reserva creada', async () => {
    const user = userEvent.setup();
    renderReservas();
    await waitFor(() => expect(screen.getAllByText('ABC123').length).toBeGreaterThan(0));

    await user.click(screen.getByLabelText('Ver detalle de la reserva'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'ABC123' })).toBeInTheDocument();
    expect(within(dialog).getByText('Celda C-001')).toBeInTheDocument();
    expect(within(dialog).getByText('08:00 – 10:00')).toBeInTheDocument();
  });

  it('elimina la reserva mediante el modal de confirmación', async () => {
    const user = userEvent.setup();
    renderReservas();
    await waitFor(() => expect(screen.getAllByText('ABC123').length).toBeGreaterThan(0));

    await user.click(screen.getByLabelText('Eliminar reserva'));
    expect(await screen.findByText('¿Eliminar reserva?')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(screen.getByText('No se encontraron reservas')).toBeInTheDocument());
    expect(screen.queryByText('ABC123')).not.toBeInTheDocument();
  });
});
