import { describe, it, expect } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useMovimientos } from './useMovimientos';
import { useCreateConductor } from './useConductores';
import { useCreateVehiculo } from './useVehiculos';
import { useControlSalida } from './useControlSalida';
import * as controlSalidaService from '../controlSalida';
import { createTestQueryClient, withQueryClient } from '../../test/queryWrapper';

/**
 * `useMovimientos` no tiene CRUD propio: combina controlSalida + vehiculos +
 * conductores (además de un puñado de registros de demo fijos) y sintetiza
 * una entrada 'entrada'/'salida' por cada control, replicando el useMemo que
 * antes vivía en DataContext.
 */
describe('services/hooks/useMovimientos — cálculo derivado', () => {
  it('incluye los movimientos base de demo mientras carga', async () => {
    const { result } = renderHook(() => useMovimientos(), { wrapper: withQueryClient() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data!.length).toBeGreaterThan(0);
  });

  it('sintetiza una entrada de movimiento "entrada" por cada control en curso', async () => {
    const client = createTestQueryClient();
    const wrapper = withQueryClient(client);

    const conductorHook = renderHook(() => useCreateConductor(), { wrapper });
    let conductorId = '';
    await act(async () => {
      const c = await conductorHook.result.current.mutateAsync({
        usuarioId: '1',
        nombre: 'Conductor Movimiento Test',
        tipoConductor: 'aprendiz',
        centroFormacion: 'Pruebas',
        discapacidad: false,
        estado: 'activo',
        tipo: 'docente',
        email: 'mov.test@sena.edu.co',
      });
      conductorId = c.id;
    });

    const vehiculoHook = renderHook(() => useCreateVehiculo(), { wrapper });
    let vehiculoId = '';
    const placa = 'MOV001';
    await act(async () => {
      const v = await vehiculoHook.result.current.mutateAsync({
        conductorId,
        placa,
        tipo: 'carro',
        marca: 'Marca',
        modelo: 'Modelo',
        año: 2024,
        color: 'Azul',
        descripcion: 'Vehículo de test de movimientos',
        estado: 'activo',
        parqueaderoId: '1',
        celdaId: 'c0',
        fechaEntrada: '2025-06-01T08:00',
      });
      vehiculoId = v.id;
    });

    await act(async () => {
      await controlSalidaService.create({
        vehiculoId,
        celdaId: 'c0',
        fechaEntrada: '2025-06-01T08:00',
        estado: 'en_parqueadero',
      });
      client.invalidateQueries({ queryKey: ['controlSalida'] });
    });

    const movimientosHook = renderHook(() => useMovimientos(), { wrapper });
    await waitFor(() => expect(movimientosHook.result.current.isLoading).toBe(false));

    const entrada = movimientosHook.result.current.data!.find(
      (m) => m.placa === placa && m.tipo === 'entrada',
    );
    expect(entrada).toBeDefined();
    expect(entrada!.conductorNombre).toBe('Conductor Movimiento Test');
  });

  it('ordena los movimientos por fecha descendente', async () => {
    const { result } = renderHook(() => useMovimientos(), { wrapper: withQueryClient() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const fechas = result.current.data!.map((m) => new Date(m.fecha).getTime());
    const ordenadas = [...fechas].sort((a, b) => b - a);
    expect(fechas).toEqual(ordenadas);
  });

  it('usa la misma query key "controlSalida" que useControlSalida (comparten caché)', async () => {
    const client = createTestQueryClient();
    const wrapper = withQueryClient(client);

    renderHook(() => useControlSalida(), { wrapper });
    renderHook(() => useMovimientos(), { wrapper });

    await waitFor(() => {
      expect(client.getQueryData(['controlSalida'])).toBeDefined();
    });
    expect(client.getQueryCache().findAll({ queryKey: ['controlSalida'] }).length).toBe(1);
  });
});
