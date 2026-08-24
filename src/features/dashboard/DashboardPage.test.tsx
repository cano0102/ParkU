import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './DashboardPage';
import { createTestQueryClient } from '@/test/queryWrapper';

function renderDashboard() {
  const client = createTestQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <Dashboard />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('features/dashboard', () => {
  it('renderiza el panel con datos semilla reales (parqueaderos)', async () => {
    renderDashboard();
    // El dashboard selecciona el primer parqueadero apenas cargan los datos.
    await waitFor(() => expect(screen.getAllByText('PQ-1 Torre A').length).toBeGreaterThan(0));
    expect(screen.getByText('ParkU · SENA')).toBeInTheDocument();
    expect(screen.getAllByText('PQ-2 Torre B').length).toBeGreaterThan(0);
  });

  it('filtra la lista de parqueaderos por tipo de vehículo (Autos/Motos)', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(screen.getAllByText('PQ-1 Torre A').length).toBeGreaterThan(0));

    // PQ-5 Motos Norte es un parqueadero exclusivo de motos (celdasCarros: 0).
    await user.click(screen.getByRole('button', { name: 'Motos' }));
    await waitFor(() => expect(screen.getAllByText('PQ-5 Motos Norte').length).toBeGreaterThan(0));

    await user.click(screen.getByRole('button', { name: 'Todos' }));
    await waitFor(() => expect(screen.getAllByText('PQ-3 Administrativo').length).toBeGreaterThan(0));
  });

  it('permite seleccionar otro parqueadero de la lista y actualiza el detalle', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => expect(screen.getAllByText('PQ-1 Torre A').length).toBeGreaterThan(0));

    await user.click(screen.getAllByText('PQ-2 Torre B')[0]);
    // El bloque de "Vista seleccionada" muestra el nombre del parqueadero elegido.
    await waitFor(() => expect(screen.getAllByText('PQ-2 Torre B').length).toBeGreaterThanOrEqual(2));
  });
});
