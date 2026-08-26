import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { createAppBackends } from '@/test/appFakeApi';
import Parqueaderos from './ParqueaderosPage';
import { createTestQueryClient } from '../../test/queryWrapper';
import { AuthProvider } from '@/context/AuthContext';
import { ROLES } from '@/services/core/roles';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: 'parku:auth-expired' }));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

// Este archivo cubre la vista de Admin/Vigilante (crear/editar parqueadero, liberar celda,
// asignación inteligente) — requiere un usuario logueado con esos permisos; ver appFakeApi.ts
// (usuario id 1, rol Administrador) para el seed que /auth/verificar valida.
const SEED_ADMIN = {
  id: '1',
  correo: 'admin@sena.edu.co',
  nombre: 'Administrador ParkU',
  numero: '3101234567',
  rol: ROLES.ADMIN,
};

/**
 * Pruebas de humo/moderadas para el punto de entrada más grande y complejo de
 * la app (~900 líneas): mapa/lista de parqueaderos, celdas con CRUD en
 * cascada y escáner OCR de placas.
 *
 * Alcance deliberadamente fuera de estas pruebas: la cámara/OCR real
 * (ScannerModal + CameraScanner) — jsdom no implementa
 * `navigator.mediaDevices.getUserMedia` ni captura de video/canvas real, y
 * ninguno de los flujos ejercitados aquí llega a abrir el modal "scanner"
 * (solo se llega a él pulsando "Escanear placa" dentro de IngresoModal o
 * SmartAssignModal, lo cual evitamos a propósito). Como no se dispara,
 * `getUserMedia` nunca se invoca y no hace falta stubearlo.
 */

function renderPage() {
  const client = createTestQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Parqueaderos />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('features/parqueaderos — Parqueaderos (punto de entrada)', () => {
  beforeEach(() => {
    localStorage.setItem('parkuToken', 'fake-token-1');
    localStorage.setItem('parkUUser', JSON.stringify(SEED_ADMIN));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renderiza los parqueaderos sembrados en la vista de tabla', async () => {
    renderPage();

    expect(await screen.findByText('PQ-1 Torre A')).toBeInTheDocument();
    expect(screen.getByText('PQ-2 Torre B')).toBeInTheDocument();
    expect(screen.getByText('PQ-3 Torre C')).toBeInTheDocument();
    expect(screen.getByText('PQ-4 Torre D')).toBeInTheDocument();
    expect(screen.getByText('PQ-5 Torre E')).toBeInTheDocument();
    expect(screen.getByText('PQ-6 Torre F')).toBeInTheDocument();
    expect(screen.getByText('PQ-7 Torre G')).toBeInTheDocument();
    expect(screen.getByText('Gestión de Parqueaderos')).toBeInTheDocument();
  });

  it('cambia entre la vista de lista y la vista de plano con el toggle', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');

    // En tabla no existen los controles de zoom del plano.
    expect(screen.queryByLabelText('Acercar')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Plano' }));
    expect(await screen.findByLabelText('Acercar')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Lista' }));
    await waitFor(() => expect(screen.queryByLabelText('Acercar')).not.toBeInTheDocument());
    expect(screen.getByText('PQ-1 Torre A')).toBeInTheDocument();
  });

  it('escribir en el buscador que no coincide con ninguna celda vacía la lista', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');

    const buscador = screen.getByPlaceholderText('Buscar por placa, celda, conductor...');
    await user.type(buscador, 'zzzznomatch');

    expect(await screen.findByText('No se encontraron parqueaderos')).toBeInTheDocument();
    expect(screen.queryByText('PQ-1 Torre A')).not.toBeInTheDocument();
  });

  it('al expandir un parqueadero y hacer click en una celda ocupada abre el detalle con el vehículo', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');

    // Expande la fila de PQ-1 Torre A para ver su grilla de celdas.
    await user.click(screen.getByText('PQ-1 Torre A'));

    // Celda semilla C-001 (parqueadero 1) está ocupada por el vehículo ABC123
    // (ver src/test/appFakeApi.ts: vehiculo 1 + registro de entrada "DENTRO").
    const celdaC001 = await screen.findByText('C-001');
    const celdaBoton = celdaC001.closest('button');
    expect(celdaBoton).not.toBeNull();
    await user.click(celdaBoton as HTMLButtonElement);

    const dialog = await screen.findByRole('dialog');
    // La placa aparece dos veces dentro del modal (título + fila "Placa").
    expect(within(dialog).getAllByText('ABC123').length).toBeGreaterThan(0);
    expect(within(dialog).getAllByText('Carlos López M.').length).toBeGreaterThan(0);
    expect(within(dialog).getByRole('button', { name: 'Liberar Celda' })).toBeInTheDocument();
  });

  it('el botón "Nuevo Parqueadero" abre el modal de creación', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');

    await user.click(screen.getByRole('button', { name: /Nuevo Parqueadero/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Nuevo Parqueadero')).toBeInTheDocument();
    expect(within(dialog).getByPlaceholderText('Ej: PQ-8 Bloque D')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Crear Parqueadero' })).toBeInTheDocument();
  });

  it('completar y enviar el formulario de creación agrega el parqueadero a la lista', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');

    await user.click(screen.getByRole('button', { name: /Nuevo Parqueadero/i }));
    const dialog = await screen.findByRole('dialog');

    // El formulario simplificado ya no pide bloque/celdas por tipo (ver
    // services/api/parqueaderos.ts): nombre + ubicación son sus dos textbox.
    const [nombreInput, ubicacionInput] = within(dialog).getAllByRole('textbox');
    await user.type(nombreInput, 'PQ-Test Nuevo');
    await user.type(ubicacionInput, 'Acceso de prueba');

    await user.click(within(dialog).getByRole('button', { name: 'Crear Parqueadero' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('PQ-Test Nuevo')).toBeInTheDocument();
  });

  it('el botón "Asignación Inteligente" abre el modal correspondiente', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');

    await user.click(screen.getByRole('button', { name: /Asignación Inteligente/i }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Asignación Inteligente')).toBeInTheDocument();
    expect(
      within(dialog).getByText(/El sistema buscará la celda óptima libre/i)
    ).toBeInTheDocument();
  });
});
