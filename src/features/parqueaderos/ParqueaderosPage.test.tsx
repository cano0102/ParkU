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

  it('muestra el aviso de incidente abierto sobre una celda con una novedad pendiente', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');
    await user.click(screen.getByText('PQ-1 Torre A'));

    // incidentesSeed tiene una novedad PENDIENTE sobre la celda 1 (C-001) y otra sobre la
    // celda 2 (C-002) del parqueadero 1; M-001 (celda 3) no tiene ninguna.
    const celdaC001 = await screen.findByText('C-001');
    const celdaC002 = screen.getByText('C-002');
    const celdaM001 = screen.getByText('M-001');
    expect(within(celdaC001.closest('button') as HTMLElement).getByTitle('Tiene un incidente abierto reportado')).toBeInTheDocument();
    expect(within(celdaC002.closest('button') as HTMLElement).getByTitle('Tiene un incidente abierto reportado')).toBeInTheDocument();
    expect(within(celdaM001.closest('button') as HTMLElement).queryByTitle('Tiene un incidente abierto reportado')).not.toBeInTheDocument();
  });

  it('muestra el aviso de +16h de estadía sobre una celda ocupada desde hace más de 16 horas', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');
    await user.click(screen.getByText('PQ-1 Torre A'));

    // controlSalidaSeed: celda 1 (C-001) tiene un vehículo DENTRO desde 2025-06-20 — muy por
    // encima del umbral de 16h, y no es un ingreso "Oficial SENA".
    const celdaC001 = await screen.findByText('C-001');
    const celdaM001 = screen.getByText('M-001');
    expect(within(celdaC001.closest('button') as HTMLElement).getByTitle('Lleva más de 16 horas estacionado — considera generar un incidente')).toBeInTheDocument();
    expect(within(celdaM001.closest('button') as HTMLElement).queryByTitle('Lleva más de 16 horas estacionado — considera generar un incidente')).not.toBeInTheDocument();
  });

  it('también muestra el aviso de incidente abierto en la vista de plano', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');

    await user.click(screen.getByRole('button', { name: 'Plano' }));
    await screen.findByLabelText('Acercar');

    // El plano SVG usa el mismo texto accesible que la tabla para el mismo aviso, pero como
    // <title> anidado dentro de un <g> (no hijo directo de <svg>) `getByTitle` no lo encuentra
    // — se busca el elemento <title> directo por contenido, igual que un lector de pantalla lo
    // asociaría con la celda. Aparece dos veces (C-001 y C-002, ambas con novedad PENDIENTE).
    const titulos = Array.from(document.querySelectorAll('title')).filter(
      (t) => t.textContent === 'Tiene un incidente abierto reportado'
    );
    expect(titulos).toHaveLength(2);
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

    // El formulario simplificado de creación ya no pide acceso/zona/piso/horarios
    // (quedan con un valor por defecto, editables después) — en su lugar pide
    // cuántas celdas generar por tipo (ver ParqueaderoFormModal.tsx).
    const [nombreInput, ubicacionInput] = within(dialog).getAllByRole('textbox');
    await user.type(nombreInput, 'PQ-Test Nuevo');
    await user.type(ubicacionInput, 'Acceso de prueba');
    await user.type(within(dialog).getByLabelText('Celdas de carro'), '2');

    await user.click(within(dialog).getByRole('button', { name: 'Crear Parqueadero' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('PQ-Test Nuevo')).toBeInTheDocument();

    // Las 2 celdas de carro pedidas se generaron solas en el backend (numeración
    // automática C-001/C-002) — se ven al expandir el parqueadero recién creado.
    await user.click(screen.getByText('PQ-Test Nuevo'));
    expect(await screen.findByText('C-001')).toBeInTheDocument();
    expect(screen.getByText('C-002')).toBeInTheDocument();
  });

  it('sin indicar ninguna celda, el formulario de creación no envía y muestra el error', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');

    await user.click(screen.getByRole('button', { name: /Nuevo Parqueadero/i }));
    const dialog = await screen.findByRole('dialog');

    const [nombreInput, ubicacionInput] = within(dialog).getAllByRole('textbox');
    await user.type(nombreInput, 'PQ-Sin Celdas');
    await user.type(ubicacionInput, 'Acceso de prueba');

    await user.click(within(dialog).getByRole('button', { name: 'Crear Parqueadero' }));

    expect(await screen.findByText(/Debes indicar al menos una celda/)).toBeInTheDocument();
    expect(screen.queryByText('PQ-Sin Celdas')).not.toBeInTheDocument();
  });

  it('al editar un parqueadero, subir la cantidad de celdas de una categoría crea solo las que faltan (no duplica las existentes)', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');

    const fila = screen.getByText('PQ-1 Torre A').closest('.pq-table-row') as HTMLElement;
    await user.click(within(fila).getByTitle('Editar'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Editar Parqueadero')).toBeInTheDocument();

    // Precargado con la cantidad ACTIVA real (celdasSeed: C-001 ocupada + C-002 disponible = 2
    // celdas de carro), no un valor fijo en 0 — ver openEdit en useParqueaderoForm.ts.
    const inputCarro = within(dialog).getByLabelText('Celdas de carro') as HTMLInputElement;
    expect(inputCarro.value).toBe('2');

    await user.clear(inputCarro);
    await user.type(inputCarro, '3');
    await user.click(within(dialog).getByRole('button', { name: 'Guardar Cambios' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    // Se creó únicamente la celda que faltaba (C-003, numeración continuada) — C-001/C-002
    // siguen existiendo tal cual, sin recrearse ni duplicarse.
    await user.click(screen.getByText('PQ-1 Torre A'));
    expect(await screen.findByText('C-003')).toBeInTheDocument();
    expect(screen.getAllByText('C-001')).toHaveLength(1);
    expect(screen.getAllByText('C-002')).toHaveLength(1);
  });

  it('eliminar un parqueadero con celdas/historial se rechaza sin abrir el diálogo de confirmación', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');

    // PQ-1 tiene celdas (C-001/C-002/M-001), un ingreso registrado (controlSalidaSeed) y
    // dos incidentes (incidentesSeed) — no debería poder eliminarse físicamente.
    const fila = screen.getByText('PQ-1 Torre A').closest('.pq-table-row') as HTMLElement;
    await user.click(within(fila).getByTitle('Eliminar'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('PQ-1 Torre A')).toBeInTheDocument();
  });

  it('eliminar un parqueadero sin celdas ni historial pide confirmación y lo quita de la lista', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-3 Torre C');

    // PQ-3 no tiene ninguna celda sembrada (celdasSeed solo cubre los parqueaderos 1 y 2), así
    // que sí se puede eliminar de verdad.
    const fila = screen.getByText('PQ-3 Torre C').closest('.pq-table-row') as HTMLElement;
    await user.click(within(fila).getByTitle('Eliminar'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/PQ-3 Torre C/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText('PQ-3 Torre C')).not.toBeInTheDocument());
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

  it('asistente de "Estacionar Vehículo": buscar conductor por nombre, elegir su vehículo y registrar el ingreso', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('PQ-1 Torre A');

    // Celda semilla C-002 del parqueadero 1 (id 2) está disponible — su conductor
    // (Pedro Ruiz G., seed conductor 2) no tiene ningún vehículo estacionado todavía.
    // Nota: la placa semilla de su vehículo (DEF456) tiene formato de carro aunque el
    // vehículo esté marcado como moto (dato de prueba heredado, no realista) — se usa
    // una celda de carro para que la validación de formato de placa no bloquee el flujo.
    await user.click(screen.getByText('PQ-1 Torre A'));
    const celdaC002 = await screen.findByText('C-002');
    await user.click(celdaC002.closest('button') as HTMLButtonElement);

    const infoDialog = await screen.findByRole('dialog');
    await user.click(within(infoDialog).getByRole('button', { name: 'Estacionar Vehículo' }));

    const ingresoDialog = await screen.findByRole('dialog');
    expect(within(ingresoDialog).getByRole('heading', { name: 'Registrar Vehículo' })).toBeInTheDocument();

    // Paso 1: buscar conductor — el campo vacío no debe mostrar ningún resultado.
    expect(within(ingresoDialog).queryByText('Pedro Ruiz G.')).not.toBeInTheDocument();
    await user.type(within(ingresoDialog).getByPlaceholderText('Busca por documento, nombre o correo...'), 'Pedro');
    await user.click(await within(ingresoDialog).findByText('Pedro Ruiz G.'));

    // Paso 2: su vehículo ya registrado (DEF456) aparece para elegir.
    await user.click(within(ingresoDialog).getByText('DEF456'));

    await user.click(within(ingresoDialog).getByRole('button', { name: 'Registrar Vehículo' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
