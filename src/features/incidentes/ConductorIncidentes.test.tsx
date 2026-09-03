import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('no ofrece prioridad ni "Asignar a": quien solo reporta no clasifica su propio reporte', async () => {
    const user = userEvent.setup();
    renderComoComunidadSena();
    await screen.findByText('Mis incidentes');

    await user.click(screen.getByRole('button', { name: /Reportar incidente/i }));
    await screen.findByRole('heading', { level: 2, name: 'Nuevo Incidente' });

    expect(screen.queryByLabelText('Prioridad')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Asignar a')).not.toBeInTheDocument();
    // Sí se le explica qué pasa con su reporte en vez de dejar el hueco sin más.
    expect(screen.getByText(/queda/i)).toBeInTheDocument();
    // El tipo sí lo elige quien reporta (describe QUÉ vio, no la urgencia).
    expect(screen.getByLabelText('Tipo')).toBeInTheDocument();
  });

  // `PUT /novedades/:id` (usado por "Editar" y "Cancelar") da 403 para este rol en la API real
  // hoy (ver el comentario junto a PERMISOS_POR_ROL[CONDUCTOR].incidentes en
  // services/core/roles.ts) — antes este test aceptaba como correcto que el botón disparara un
  // PUT que en producción fallaría con un 403 confuso justo después de que la lista deje de
  // fallar en silencio (fix #1). ConductorIncidenteCard.tsx ahora deja el botón visible pero
  // deshabilitado hasta que el backend abra esa ruta.
  it('el botón "Cancelar" (y "Editar") de un incidente propio pendiente está deshabilitado, no dispara ningún PUT', async () => {
    const user = userEvent.setup();
    renderComoComunidadSena();
    await screen.findByText('Mis incidentes');

    const botonCancelar = await screen.findByRole('button', { name: /Cancelar/i });
    const botonEditar = screen.getByRole('button', { name: /Editar/i });

    expect(botonCancelar).toBeDisabled();
    expect(botonEditar).toBeDisabled();
    expect(botonCancelar.getAttribute('title')).toContain('Disponible próximamente');

    await user.click(botonCancelar);

    expect(apiFetchMock).not.toHaveBeenCalledWith('/novedades/1', expect.objectContaining({ method: 'PUT' }));
  });
});

describe('features/incidentes — ConductorIncidentes con el 403 real simulado (GET /novedades para Comunidad SENA)', () => {
  afterEach(() => {
    // Vuelve al backend permisivo (comportamiento por defecto de createAppBackends) para no
    // filtrar este 403 simulado hacia otros tests de este archivo.
    apiFetchMock.mockImplementation(createAppBackends().apiFetch);
  });

  it('no revienta y muestra un mensaje claro en vez de la ambigua "no has reportado nada" cuando el listado 403 para este rol', async () => {
    apiFetchMock.mockImplementation(createAppBackends({ rolActual: ROLES.CONDUCTOR }).apiFetch);
    renderComoComunidadSena();

    expect(await screen.findByText('Mis incidentes')).toBeInTheDocument();
    expect(await screen.findByText('No pudimos cargar tu historial de incidentes')).toBeInTheDocument();
    expect(screen.getByText(/se guardó correctamente/i)).toBeInTheDocument();

    // El mensaje ambiguo de "cero reportes" (indistinguible de un 403 silencioso, que es
    // justamente el bug que motivó este fix) no debe aparecer en este escenario.
    expect(screen.queryByText('Todavía no has reportado ningún incidente')).not.toBeInTheDocument();
  });

  it('reportar un incidente nuevo (POST) sigue funcionando aunque el listado (GET) 403 para este rol', async () => {
    apiFetchMock.mockImplementation(createAppBackends({ rolActual: ROLES.CONDUCTOR }).apiFetch);
    const user = userEvent.setup();
    renderComoComunidadSena();
    await screen.findByText('Mis incidentes');

    await user.click(screen.getByRole('button', { name: /Reportar incidente/i }));
    expect(await screen.findByRole('heading', { level: 2, name: 'Nuevo Incidente' })).toBeInTheDocument();
  });
});
