import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import { ROLES } from '@/services/core/roles';
import type { Celda } from '@/services/api/celdas';
import type { Incidente } from '@/services/api/incidentes';
import type { Ocupante } from '../lib/helpers';
import { useIncidenteReporte } from './useIncidenteReporte';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

const useAuthMock = vi.hoisted(() => vi.fn());
vi.mock('@/context/AuthContext', () => ({ useAuth: useAuthMock }));

const useIncidentesMock = vi.hoisted(() => vi.fn());
vi.mock('@/features/incidentes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/features/incidentes')>();
  return { ...actual, useIncidentes: useIncidentesMock };
});

const celdaActiva: Celda = {
  id: '1', parqueaderoId: '1', numero: 'C-001', tipo: 'carro', usabilidad: 'general',
  estado: 'no_disponible', ocupada: true, observaciones: '',
};

const ocupanteActivo: Ocupante = {
  vehiculo: {
    id: 'v1', conductorId: 'c1', conductorNombre: 'Carlos López M.', placa: 'ABC123', tipo: 'carro',
    marca: 'Toyota', linea: 'Corolla', modelo: 2020, color: 'Blanco', descripcion: '', estado: 'activo',
  },
  conductor: { id: 'c1', usuarioId: 'u1', nombre: 'Carlos López M.' } as Ocupante['conductor'],
  esOficial: false,
  controlId: 'cs1',
  fechaEntrada: '2025-06-18T07:00:00.000Z',
};

function incidenteBase(overrides: Partial<Incidente>): Incidente {
  return {
    id: 'i1', clase: 'incidente', tipoNovedad: 'otro', tipoOtro: '', usuarioReportaId: '1',
    prioridad: 'media', descripcion: 'Preexistente',
    parqueaderoId: '1', celdaId: '', vehiculoId: '', usuarioAsignadoId: '',
    fecha: '2025-06-01T00:00:00.000Z', estado: 'pendiente', justificacionCierre: '',
    ...overrides,
  };
}

type IncidenteReporteData = Parameters<typeof useIncidenteReporte>[0];

function setup(data: { addIncidente: ReturnType<typeof vi.fn> }) {
  return renderHook(() => useIncidenteReporte(data as unknown as IncidenteReporteData, celdaActiva, ocupanteActivo, vi.fn()));
}

async function llenarYRegistrar(result: ReturnType<typeof setup>['result']) {
  // Tipo y prioridad son obligatorios en un incidente: sin ellos el formulario ni siquiera
  // llega a intentar registrar nada.
  act(() => result.current.setIncidenteForm((f) => ({
    ...f, descripcion: 'Se rayó la pintura', tipoNovedad: 'danio', prioridad: 'media',
  })));
  await act(async () => { await result.current.registrarIncidente(); });
}

describe('useIncidenteReporte — bloqueo de incidente duplicado (celda/vehículo con uno ya abierto)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({ user: { id: '1', rol: ROLES.ADMIN } });
    useIncidentesMock.mockReturnValue({ data: [] });
  });

  it('bloquea y avisa con un toast si ya existe un incidente abierto (pendiente) para la misma celda', async () => {
    useIncidentesMock.mockReturnValue({
      data: [incidenteBase({ id: 'dup', celdaId: celdaActiva.id, vehiculoId: '', estado: 'pendiente' })],
    });
    const data = { addIncidente: vi.fn() };
    const { result } = setup(data);

    expect(result.current.incidenteAbiertoExisteParaCeldaActiva).toBe(true);

    await llenarYRegistrar(result);

    expect(data.addIncidente).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Ya existe un incidente abierto'));
  });

  it('bloquea si el incidente abierto es del mismo vehículo aunque esté en otra celda', async () => {
    useIncidentesMock.mockReturnValue({
      data: [incidenteBase({ id: 'dup', celdaId: '99', vehiculoId: ocupanteActivo.vehiculo.id, estado: 'en_proceso' })],
    });
    const data = { addIncidente: vi.fn() };
    const { result } = setup(data);

    await llenarYRegistrar(result);

    expect(data.addIncidente).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('no bloquea si el incidente existente para esa celda ya está resuelto/rechazado/cancelado', async () => {
    useIncidentesMock.mockReturnValue({
      data: [incidenteBase({ id: 'viejo', celdaId: celdaActiva.id, estado: 'resuelto' })],
    });
    const data = { addIncidente: vi.fn().mockResolvedValue(undefined) };
    const { result } = setup(data);

    expect(result.current.incidenteAbiertoExisteParaCeldaActiva).toBe(false);

    await llenarYRegistrar(result);

    expect(data.addIncidente).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('permite registrar normalmente cuando no hay ningún incidente abierto para la celda/vehículo', async () => {
    const data = { addIncidente: vi.fn().mockResolvedValue(undefined) };
    const { result } = setup(data);

    await llenarYRegistrar(result);

    expect(data.addIncidente).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalled();
  });

  it('envía el tipo/prioridad/asignado elegidos en el formulario, no valores fijos', async () => {
    const data = { addIncidente: vi.fn().mockResolvedValue(undefined) };
    const { result } = setup(data);

    act(() => result.current.setIncidenteForm((f) => ({
      ...f, descripcion: 'Vidrio roto', tipoNovedad: 'danio', prioridad: 'critica', usuarioAsignadoId: 'u-vigilante-9',
    })));
    await act(async () => { await result.current.registrarIncidente(); });

    expect(data.addIncidente).toHaveBeenCalledWith(expect.objectContaining({
      tipoNovedad: 'danio', prioridad: 'critica', usuarioAsignadoId: 'u-vigilante-9',
    }));
  });

  it('no dispara la consulta de incidentes para el rol Conductor, para no arriesgar un 403 solo por abrir el plano de Parqueaderos', () => {
    useAuthMock.mockReturnValue({ user: { id: '2', rol: ROLES.CONDUCTOR } });
    const data = { addIncidente: vi.fn() };
    setup(data);

    expect(useIncidentesMock).toHaveBeenCalledWith({ enabled: false });
  });

  it('sí habilita la consulta de incidentes para roles distintos de Conductor (Admin/Vigilante)', () => {
    useAuthMock.mockReturnValue({ user: { id: '1', rol: ROLES.ADMIN } });
    const data = { addIncidente: vi.fn() };
    setup(data);

    expect(useIncidentesMock).toHaveBeenCalledWith({ enabled: true });
  });
});

/* Un incidente hay que poder clasificarlo y ordenarlo; una novedad es solo una observación de
   la operación y no tiene nada de eso que dar. */
describe('useIncidenteReporte — lo que exige cada clase de reporte', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({ user: { id: '1', rol: ROLES.ADMIN } });
    useIncidentesMock.mockReturnValue({ data: [] });
  });

  it('no registra un incidente sin tipo ni prioridad', async () => {
    const data = { addIncidente: vi.fn() };
    const { result } = setup(data);

    act(() => result.current.setIncidenteForm((f) => ({ ...f, descripcion: 'Algo pasó' })));
    await act(async () => { await result.current.registrarIncidente(); });

    expect(data.addIncidente).not.toHaveBeenCalled();
    expect(result.current.incidenteError).toMatch(/tipo/i);
  });

  it('con el tipo "otro" exige decir de qué se trata', async () => {
    const data = { addIncidente: vi.fn() };
    const { result } = setup(data);

    act(() => result.current.setIncidenteForm((f) => ({
      ...f, descripcion: 'Algo raro', tipoNovedad: 'otro', prioridad: 'baja',
    })));
    await act(async () => { await result.current.registrarIncidente(); });

    expect(data.addIncidente).not.toHaveBeenCalled();

    act(() => result.current.setIncidenteForm((f) => ({ ...f, tipoOtro: 'Fuga de agua' })));
    await act(async () => { await result.current.registrarIncidente(); });

    expect(data.addIncidente).toHaveBeenCalledWith(expect.objectContaining({ tipoOtro: 'Fuga de agua' }));
  });

  it('una novedad no pide tipo ni prioridad, y no arrastra celda ni vehículo', async () => {
    const data = { addIncidente: vi.fn().mockResolvedValue(undefined) };
    const { result } = setup(data);

    act(() => result.current.setIncidenteForm((f) => ({
      ...f, clase: 'novedad', descripcion: 'El portón hace ruido',
    })));
    await act(async () => { await result.current.registrarIncidente(); });

    expect(data.addIncidente).toHaveBeenCalledWith(expect.objectContaining({
      clase: 'novedad', celdaId: '', vehiculoId: '',
    }));
  });

  it('deja el reporte a nombre de quien se elija', async () => {
    const data = { addIncidente: vi.fn().mockResolvedValue(undefined) };
    const { result } = setup(data);

    act(() => result.current.setIncidenteForm((f) => ({
      ...f, descripcion: 'Choque leve', tipoNovedad: 'accidente', prioridad: 'alta', usuarioReportaId: '7',
    })));
    await act(async () => { await result.current.registrarIncidente(); });

    expect(data.addIncidente).toHaveBeenCalledWith(expect.objectContaining({ usuarioReportaId: '7' }));
  });

  it('Comunidad SENA no puede registrar novedades: ni se le ofrece', () => {
    useAuthMock.mockReturnValue({ user: { id: '5', rol: ROLES.CONDUCTOR } });
    const { result } = setup({ addIncidente: vi.fn() });

    expect(result.current.puedeRegistrarNovedades).toBe(false);
  });

  /* Comunidad SENA sí reporta incidentes, pero la API le rechaza el reporte si manda
     prioridad o encargado: los define el personal autorizado al aceptarlo. Van vacíos para
     que `toApiPayload` ni siquiera los envíe. */
  it('un conductor reporta sin mandar prioridad ni encargado', async () => {
    useAuthMock.mockReturnValue({ user: { id: '5', rol: ROLES.CONDUCTOR } });
    const data = { addIncidente: vi.fn().mockResolvedValue(undefined) };
    const { result } = setup(data);

    act(() => result.current.setIncidenteForm((f) => ({
      ...f, descripcion: 'Me rayaron el carro', tipoNovedad: 'danio',
    })));
    await act(async () => { await result.current.registrarIncidente(); });

    expect(data.addIncidente).toHaveBeenCalledWith(expect.objectContaining({
      prioridad: '', usuarioAsignadoId: '',
    }));
  });
});
