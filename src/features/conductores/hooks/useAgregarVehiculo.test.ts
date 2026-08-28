import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import type { Conductor } from '@/services/api/conductores';
import type { Vehiculo } from '@/services/api/vehiculos';
import { useAgregarVehiculo } from './useAgregarVehiculo';

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const conductor: Conductor = {
  id: '1', usuarioId: '', tipoDocumento: 'CC', numeroDocumento: '123', nombre: 'Andrés Torres',
  correo: '', direccion: '', numeroTelefonico: '', tipoUsuarioId: '1', tipoUsuarioNombre: 'Aprendiz',
  regionalFormacion: '', centroFormacion: '', programaFormacion: '', vigencia: '',
  movilidadReducida: false, tipoDiscapacidad: '', estado: 'activo',
};

const vehiculoExistente: Vehiculo = {
  id: 'v1', conductorId: '1', conductorNombre: 'Andrés Torres', placa: 'ABC123', tipo: 'carro',
  marca: '', linea: '', modelo: null, color: '', descripcion: '', estado: 'activo',
};

function buildData(vehiculos: Vehiculo[] = [], addVehiculo = vi.fn().mockResolvedValue({ ...vehiculoExistente, id: 'v2' })) {
  return { vehiculos, addVehiculo };
}

afterEach(() => vi.clearAllMocks());

describe('useAgregarVehiculo', () => {
  it('permite agregar un segundo vehículo al mismo conductor (un conductor puede tener carro y moto)', async () => {
    const data = buildData([vehiculoExistente]);
    const { result } = renderHook(() => useAgregarVehiculo(data));

    act(() => result.current.abrir(conductor));
    expect(result.current.conductorActivo).toEqual(conductor);

    act(() => result.current.setForm({ ...result.current.form, placa: 'XYZ12D', tipoVehiculo: 'moto' }));
    await act(async () => result.current.guardar());

    expect(data.addVehiculo).toHaveBeenCalledWith(expect.objectContaining({
      conductorId: '1', placa: 'XYZ12D', tipo: 'moto',
    }));
    expect(toast.success).toHaveBeenCalled();
  });

  it('rechaza una placa ya registrada en otro vehículo', async () => {
    const data = buildData([vehiculoExistente]);
    const { result } = renderHook(() => useAgregarVehiculo(data));

    act(() => result.current.abrir(conductor));
    act(() => result.current.setForm({ ...result.current.form, placa: 'ABC123' }));
    await act(async () => result.current.guardar());

    expect(result.current.error).toBe('Esta placa ya está registrada en otro vehículo');
    expect(data.addVehiculo).not.toHaveBeenCalled();
  });

  it('rechaza una placa con formato inválido para el tipo seleccionado', async () => {
    const data = buildData();
    const { result } = renderHook(() => useAgregarVehiculo(data));

    act(() => result.current.abrir(conductor));
    act(() => result.current.setForm({ ...result.current.form, placa: 'ABC123', tipoVehiculo: 'moto' }));
    await act(async () => result.current.guardar());

    expect(result.current.error).toMatch(/moto/);
    expect(data.addVehiculo).not.toHaveBeenCalled();
  });

  it('no muestra error antes del primer intento de guardar (validación en tiempo real gateada por touched)', () => {
    const data = buildData();
    const { result } = renderHook(() => useAgregarVehiculo(data));

    act(() => result.current.abrir(conductor));
    expect(result.current.error).toBeNull();

    act(() => result.current.markTouched());
    expect(result.current.error).toBe('La placa es obligatoria');
  });
});
