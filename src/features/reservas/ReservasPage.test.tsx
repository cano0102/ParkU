import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createFakeRestBackend } from '@/test/fakeApi';
import { Reservas } from './ReservasPage';
import { createTestQueryClient } from '@/test/queryWrapper';
import { AuthProvider } from '@/context/AuthContext';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));

const vehiculos = createFakeRestBackend('/vehiculos', [
  { id: 1, placa: 'ABC123', tipo: 'CARRO', marca: 'Chevrolet', linea: 'Spark', modelo: 2020, color: 'Rojo', observaciones: null, estado: true, conductores: [{ id: 1, nombre_apellidos: 'Conductor Uno', DetallePropiedad: { es_principal: true } }], conductor_principal_id: 1, conductor_principal_nombre: 'Conductor Uno' },
]);
const celdas = createFakeRestBackend('/celdas', [
  { id: 1, parqueadero: 1, numero: 'C-001', tipo: 'CARRO', usabilidad: 'GENERAL', estado: 'DISPONIBLE', observaciones: null },
]);
const conductores = createFakeRestBackend('/conductores', [
  { id: 1, usuario_id: null, tipo_documento: 'CC', numero_documento: '123', nombre_apellidos: 'Conductor Uno', correo: null, direccion: null, numero_telefonico: null, tipo_usuario_id: 1, tipo_usuario_nombre: 'Aprendiz', regional_formacion: null, centro_formacion: null, programa_formacion: null, vigencia: null, movilidad_reducida: false, tipo_discapacidad: null, estado: true },
]);
const parqueaderos = createFakeRestBackend('/parqueaderos', [
  { id: 1, nombre: 'PQ Uno', ubicacion: 'Regional', acceso: 'REGIONAL', capacidad_maxima: 10, hora_apertura: '06:00:00', hora_cierre: '20:00:00', estado: true, zona: '', piso: '', descripcion: '', tipo: 'GENERAL' },
]);
const reservas = createFakeRestBackend('/reservas', []);

// El helper genérico espera basePath == prefijo exacto del path recibido — como
// varios dominios comparten un solo mock de apiFetch en este test, se enruta
// por prefijo hacia el backend correspondiente en vez de usar cada uno "suelto".
apiFetchMock.mockImplementation(async (path: string, opts?: object) => {
  const backends: [string, ReturnType<typeof createFakeRestBackend>][] = [
    ['/vehiculos', vehiculos], ['/celdas', celdas], ['/conductores', conductores],
    ['/parqueaderos', parqueaderos], ['/reservas', reservas],
  ];
  const match = backends.find(([prefix]) => path.startsWith(prefix));
  if (!match) throw new Error(`sin router para ${path}`);
  return match[1].apiFetch(path, opts as any);
});

async function reservaSample() {
  return {
    tipoReserva: 'visitante' as const,
    vehiculoId: '1',
    celdaId: '1',
    conductorId: '1',
    motivo: '',
    fechaReserva: '2030-01-01',
    horaInicio: '08:00',
    horaFin: '10:00',
    estado: 'pendiente' as const,
  };
}

function renderReservas(client = createTestQueryClient()) {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Reservas />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('features/reservas', () => {
  it('muestra el estado vacío cuando no hay reservas', async () => {
    renderReservas();
    await waitFor(() => expect(screen.getByText('No se encontraron reservas')).toBeInTheDocument());
    expect(screen.getByText('Gestión de Reservas')).toBeInTheDocument();
  });

  it('crea una reserva y la muestra en la tabla con su estado', async () => {
    const reservasService = await import('@/services/api/reservas');
    await reservasService.create(await reservaSample());

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
