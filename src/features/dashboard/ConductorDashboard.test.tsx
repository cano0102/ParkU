import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppBackends, reservasSeed } from '@/test/appFakeApi';
import { AuthProvider } from '@/context/AuthContext';
import { ROLES } from '@/services/core/roles';
import { createTestQueryClient } from '@/test/queryWrapper';
import Dashboard from './DashboardPage';

// conductoresSeed[0] (id 1) pertenece a usuario_id 2, y vehiculosSeed[0] (id 1)
// tiene a ese conductor como principal — se reutiliza esa cadena ya existente
// en la semilla compartida para no tener que declarar fixtures nuevos.
reservasSeed.push({
  id: 1,
  tipo_reserva: 'VEHICULO_SENA',
  celda_id: 1,
  conductor_id: 1,
  vehiculo_id: 1,
  motivo: 'Gira institucional',
  fecha_hora_inicio: '2026-09-01T08:00:00.000Z',
  fecha_hora_fin: '2026-09-01T18:00:00.000Z',
  estado: 'ACEPTADA',
});

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

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
          <Dashboard />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('features/dashboard — ConductorDashboard (rol Comunidad SENA)', () => {
  it('muestra la celda con reserva activa, los vehículos y las reservas del conductor', async () => {
    renderComoComunidadSena();

    expect(await screen.findByText('Mi ParkU')).toBeInTheDocument();

    // Celda con reserva activa (ACEPTADA -> 'activa'): celda 1 pertenece al parqueadero 1.
    await waitFor(() => expect(screen.getByText('PQ-1 Torre A')).toBeInTheDocument());
    expect(screen.getByText(/Celda C-001/)).toBeInTheDocument();

    // Vehículo del conductor 1 (placa ABC123 en la semilla).
    expect(screen.getByText('ABC123')).toBeInTheDocument();

    // La reserva activa aparece también en la lista de reservas.
    expect(screen.getByText('Gira institucional')).toBeInTheDocument();

    // No debe renderizar el Dashboard completo de Admin.
    expect(screen.queryByText('ParkU · SENA')).not.toBeInTheDocument();
  });
});
