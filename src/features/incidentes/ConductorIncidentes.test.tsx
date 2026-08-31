import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppBackends } from '@/test/appFakeApi';
import { AuthProvider } from '@/context/AuthContext';
import { ROLES } from '@/services/core/roles';
import { createTestQueryClient } from '@/test/queryWrapper';
import { Incidentes } from './IncidentesPage';

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

// Misma cadena que ConductorDashboard.test.tsx: conductoresSeed[0] (id 1) pertenece a
// usuario_id 2, y vehiculosSeed[0] (id 1) lo tiene como principal. incidentesSeed[0] ya
// está atado a vehiculo_id 1 en la semilla compartida — no hace falta declarar uno nuevo.
function renderComoComunidadSena() {
  localStorage.setItem('parkuToken', 'fake-token-2');
  localStorage.setItem('parkUUser', JSON.stringify({
    id: '2', correo: 'ana.martinez@sena.edu.co', nombre: 'Ana Martínez R.', numero: '', rol: ROLES.CONDUCTOR,
  }));
  const client = createTestQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Incidentes />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('features/incidentes — ConductorIncidentes (rol Comunidad SENA)', () => {
  it('muestra "Mis incidentes" con solo los del propio vehículo, no el panel de gestión de Admin', async () => {
    renderComoComunidadSena();

    expect(await screen.findByText('Mis incidentes')).toBeInTheDocument();
    expect(await screen.findByText('Vehículo mal estacionado bloqueando entrada')).toBeInTheDocument();

    // No debe renderizar el panel de gestión completo (toolbar de Admin/Vigilante).
    expect(screen.queryByPlaceholderText(/Buscar por descripción/i)).not.toBeInTheDocument();
  });

  it('permite reportar un incidente nuevo desde "Reportar incidente"', async () => {
    const user = userEvent.setup();
    renderComoComunidadSena();
    await screen.findByText('Mis incidentes');

    await user.click(screen.getByRole('button', { name: /Reportar incidente/i }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Nuevo Incidente' })).toBeInTheDocument();

    // El selector de vehículo solo debe ofrecer los propios (placa ABC123, vehiculo 1).
    const selectVehiculo = screen.getByLabelText('Vehículo (opcional)') as HTMLSelectElement;
    const opciones = Array.from(selectVehiculo.options).map((o) => o.textContent);
    expect(opciones.some((o) => o?.includes('ABC123'))).toBe(true);
    expect(opciones.some((o) => o?.includes('DEF456'))).toBe(false);
  });

  it('permite cancelar un incidente propio que sigue pendiente', async () => {
    const user = userEvent.setup();
    renderComoComunidadSena();
    await screen.findByText('Mis incidentes');

    await user.click(await screen.findByRole('button', { name: /Cancelar/i }));

    await waitFor(() => {
      expect(apiFetchMock).toHaveBeenCalledWith('/novedades/1', expect.objectContaining({ method: 'PUT' }));
    });
  });
});
