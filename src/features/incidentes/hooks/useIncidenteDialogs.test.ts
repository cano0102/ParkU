import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import type { Incidente } from '@/services/api/incidentes';
import { useIncidenteDialogs } from './useIncidenteDialogs';
import type { IncidentesData } from './useIncidentesData';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }));

function incidenteBase(overrides: Partial<Incidente>): Incidente {
  return {
    // Un tipo concreto: "otro" sin decir cuál ya no se puede guardar.
    id: 'i1', clase: 'incidente', tipoNovedad: 'danio', tipoOtro: '', usuarioReportaId: '1',
    prioridad: 'media', descripcion: 'Preexistente',
    parqueaderoId: '1', celdaId: '', vehiculoId: '', usuarioAsignadoId: '',
    fecha: '2025-06-01T00:00:00.000Z', estado: 'pendiente', justificacionCierre: '',
    ...overrides,
  };
}

function buildData(overrides: Partial<{ celdas: { id: string; parqueaderoId: string }[]; incidentes: Incidente[]; addIncidente: ReturnType<typeof vi.fn>; updateIncidente: ReturnType<typeof vi.fn> }> = {}) {
  return {
    celdas: [],
    incidentes: [],
    addIncidente: vi.fn().mockResolvedValue(undefined),
    updateIncidente: vi.fn().mockResolvedValue(undefined),
    deleteIncidente: vi.fn(),
    ocupanteDeCelda: vi.fn().mockReturnValue(undefined),
    usuariosReportantes: [{ id: '1', nombre: 'Administrador ParkU' }],
    ...overrides,
  } as unknown as IncidentesData;
}

function llenarForm(result: ReturnType<typeof renderHook<ReturnType<typeof useIncidenteDialogs>, unknown>>['result'], extra: Partial<{ celdaId: string; vehiculoId: string }> = {}) {
  act(() => {
    result.current.setFormData((f) => ({
      // Tipo y prioridad son obligatorios en un incidente: sin ellos el formulario no llega
      // a intentar guardar nada.
      ...f, descripcion: 'Vehículo rayado', parqueaderoId: '1', celdaId: '', vehiculoId: '',
      tipoNovedad: 'danio', prioridad: 'media', ...extra,
    }));
  });
}

describe('useIncidenteDialogs — bloqueo de incidente duplicado al crear', () => {
  beforeEach(() => vi.clearAllMocks());

  it('bloquea con un toast si ya hay un incidente abierto (pendiente) para la misma celda', async () => {
    const data = buildData({ incidentes: [incidenteBase({ id: 'dup', celdaId: '5', estado: 'pendiente' })] });
    const { result } = renderHook(() => useIncidenteDialogs(data));

    act(() => result.current.openCreate());
    llenarForm(result, { celdaId: '5' });

    await act(async () => { await result.current.handleSave(); });

    expect(data.addIncidente).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Ya existe un incidente abierto'));
  });

  it('bloquea si ya hay un incidente abierto (en_proceso) para el mismo vehículo, aunque la celda sea distinta', async () => {
    const data = buildData({ incidentes: [incidenteBase({ id: 'dup', celdaId: '99', vehiculoId: 'v1', estado: 'en_proceso' })] });
    const { result } = renderHook(() => useIncidenteDialogs(data));

    act(() => result.current.openCreate());
    llenarForm(result, { celdaId: '5', vehiculoId: 'v1' });

    await act(async () => { await result.current.handleSave(); });

    expect(data.addIncidente).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it('no bloquea si el incidente existente para esa celda ya está resuelto', async () => {
    const data = buildData({ incidentes: [incidenteBase({ id: 'viejo', celdaId: '5', estado: 'resuelto' })] });
    const { result } = renderHook(() => useIncidenteDialogs(data));

    act(() => result.current.openCreate());
    llenarForm(result, { celdaId: '5' });

    await act(async () => { await result.current.handleSave(); });

    expect(data.addIncidente).toHaveBeenCalledTimes(1);
  });

  it('permite crear cuando no hay ningún incidente abierto para la celda/vehículo elegidos', async () => {
    const data = buildData();
    const { result } = renderHook(() => useIncidenteDialogs(data));

    act(() => result.current.openCreate());
    llenarForm(result, { celdaId: '5' });

    await act(async () => { await result.current.handleSave(); });

    expect(data.addIncidente).toHaveBeenCalledTimes(1);
  });

  it('no aplica el bloqueo de duplicados al editar (solo aplica al crear uno nuevo)', async () => {
    const existente = incidenteBase({ id: 'e1', celdaId: '5', estado: 'pendiente' });
    const data = buildData({ incidentes: [existente] });
    const { result } = renderHook(() => useIncidenteDialogs(data));

    act(() => result.current.openEdit(existente));

    await act(async () => { await result.current.handleSave(); });

    expect(data.updateIncidente).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });
});

describe('useIncidenteDialogs — celdas permitidas para el conductor', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rechaza guardar un incidente en una celda fuera de la flota permitida', async () => {
    const data = buildData({
      celdas: [
        { id: '5', parqueaderoId: '1' },
        { id: '6', parqueaderoId: '1' },
      ],
    });
    const { result } = renderHook(() => useIncidenteDialogs(data, {
      celdaIdsPermitidas: new Set(['5']),
    }));

    act(() => result.current.openCreate());
    llenarForm(result, { celdaId: '6' });

    await act(async () => { await result.current.handleSave(); });

    expect(data.addIncidente).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Solo puedes reportar'));
  });
});

describe('useIncidenteDialogs — puedeClasificar: false (ConductorIncidentes)', () => {
  beforeEach(() => vi.clearAllMocks());

  /* Bug real: con `puedeClasificar: false` el formulario de ConductorIncidentes oculta el
     selector de prioridad (la define quien recibe el reporte, no quien lo hace) — pero antes
     de este fix `formErrors.prioridad` seguía exigiéndola siempre que la clase no fuera
     "novedad", así que el botón "Registrar Incidente" quedaba deshabilitado para siempre y un
     conductor jamás podía enviar un reporte desde esa pantalla. */
  it('permite guardar sin prioridad ni encargado cuando quien reporta no puede clasificar', async () => {
    const data = buildData();
    const { result } = renderHook(() => useIncidenteDialogs(data, { puedeClasificar: false }));

    act(() => result.current.openCreate());
    act(() => {
      result.current.setFormData((f) => ({
        ...f, descripcion: 'Me rayaron el carro', tipoNovedad: 'danio',
        // Ni prioridad ni encargado: son justo los campos que este rol no ve en el formulario.
      }));
    });

    expect(result.current.formInvalido).toBe(false);

    await act(async () => { await result.current.handleSave(); });

    expect(data.addIncidente).toHaveBeenCalledTimes(1);
    expect(data.addIncidente).toHaveBeenCalledWith(expect.objectContaining({
      prioridad: '', usuarioAsignadoId: '',
    }));
  });

  it('sigue exigiendo detallar "otro" aunque no pueda clasificar (ese campo no se oculta)', async () => {
    const data = buildData();
    const { result } = renderHook(() => useIncidenteDialogs(data, { puedeClasificar: false }));

    // El formulario parte con tipoNovedad "otro" por defecto (mismo formulario que Admin/
    // Vigilante): sin decir de qué se trata, el reporte no queda clasificado.
    act(() => result.current.openCreate());
    act(() => {
      result.current.setFormData((f) => ({ ...f, descripcion: 'Me rayaron el carro' }));
    });

    expect(result.current.formInvalido).toBe(true);
    expect(result.current.formErrors.prioridad).toBe('');
    expect(result.current.formErrors.tipoOtro).not.toBe('');
  });
});
