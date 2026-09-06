import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppBackends } from '@/test/appFakeApi';
import Dashboard from './DashboardPage';
import { createTestQueryClient } from '@/test/queryWrapper';
import { AuthProvider } from '@/context/AuthContext';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

function iniciarSesion(rol: number) {
  localStorage.setItem('parkuToken', 'fake-token-1');
  localStorage.setItem(
    'parkUUser',
    JSON.stringify({ id: '1', correo: 'admin@sena.edu.co', nombre: 'Administrador ParkU', numero: '3101234567', rol }),
  );
}

function renderDashboard() {
  const client = createTestQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
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

    // PQ-2 Torre B es un parqueadero exclusivo de motos en la semilla (sin celdas de carro).
    await user.click(screen.getByRole('button', { name: 'Motos' }));
    await waitFor(() => expect(screen.getAllByText('PQ-2 Torre B').length).toBeGreaterThan(0));

    await user.click(screen.getByRole('button', { name: 'Todos' }));
    await waitFor(() => expect(screen.getAllByText('PQ-3 Torre C').length).toBeGreaterThan(0));
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

/* Los avisos son trabajo por hacer: enseñárselos a quien no puede hacerlo solo estorba (y en
   el caso de Comunidad SENA, los listados que los alimentan le responden 403). */
describe('features/dashboard — avisos de pendientes', () => {
  it('un administrador ve los incidentes que están sin atender', async () => {
    iniciarSesion(1);
    renderDashboard();

    // La semilla trae dos incidentes PENDIENTE.
    await waitFor(() => expect(screen.getByText('2 incidentes reportados')).toBeInTheDocument());
  });

  /* Una avería y una observación de turno no se atienden igual: sumarlas hacía que un
     parqueadero con observaciones pareciera tener averías sin resolver. */
  it('cuenta las novedades en su propio recuadro, no con los incidentes', async () => {
    iniciarSesion(1);
    renderDashboard();

    await waitFor(() => expect(screen.getByText('1 novedad registrada')).toBeInTheDocument());
    // La novedad de la semilla no infló el número de incidentes.
    expect(screen.getByText('2 incidentes reportados')).toBeInTheDocument();
  });

  it('un rol sin permiso sobre esos módulos no ve el recuadro', async () => {
    iniciarSesion(99);
    renderDashboard();

    await waitFor(() => expect(screen.getAllByText('PQ-1 Torre A').length).toBeGreaterThan(0));
    expect(screen.queryByText(/incidentes reportados/)).not.toBeInTheDocument();
    expect(screen.queryByText('Nada pendiente por revisar')).not.toBeInTheDocument();
  });
});
