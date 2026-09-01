import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { createAppBackends } from '@/test/appFakeApi';
import { useConductores, useUpdateConductor } from './useConductores';
import { useVehiculos } from './useVehiculos';
import { createTestQueryClient, withQueryClient } from '@/test/queryWrapper';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock }));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

apiFetchMock.mockImplementation(createAppBackends().apiFetch);

/**
 * `Vehiculo.conductorNombre` es denormalizado por el backend en el GET de vehículos (ver
 * services/api/vehiculos.ts#toFrontend). Renombrar un conductor solo invalidaba la query
 * `conductores` (el `useUpdate` genérico de queryFactory.ts solo conoce su propio dominio),
 * dejando cualquier pantalla que muestre el dueño de un vehículo con el nombre viejo hasta
 * que algo, sin relación, disparara un refetch de `vehiculos`. Ver useConductores.ts.
 */
describe('useConductores — useUpdateConductor invalida también vehiculos', () => {
  it('invalida las queries de conductores y de vehiculos tras actualizar un conductor', async () => {
    const client = createTestQueryClient();
    const wrapper = withQueryClient(client);
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries');

    const conductoresList = renderHook(() => useConductores(), { wrapper });
    await waitFor(() => expect(conductoresList.result.current.isSuccess).toBe(true));

    const update = renderHook(() => useUpdateConductor(), { wrapper });
    await act(async () => {
      await update.result.current.mutateAsync({ id: '1', data: { nombre: 'Carlos Renombrado' } });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['conductores'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['vehiculos'] });
  });

  it('dispara un refetch real de la lista de vehiculos activa tras actualizar un conductor', async () => {
    const client = createTestQueryClient();
    const wrapper = withQueryClient(client);

    const vehiculosList = renderHook(() => useVehiculos(), { wrapper });
    await waitFor(() => expect(vehiculosList.result.current.isSuccess).toBe(true));
    const vehiculosCallsBefore = apiFetchMock.mock.calls.filter(([path]) => String(path).startsWith('/vehiculos')).length;

    const update = renderHook(() => useUpdateConductor(), { wrapper });
    await act(async () => {
      await update.result.current.mutateAsync({ id: '1', data: { nombre: 'Carlos Renombrado' } });
    });

    // Antes del fix, solo `conductores` se invalidaba — `vehiculos` (con la vista de detalle de
    // vehículo montada) no volvía a pedirse tras editar el conductor, así que esto se habría
    // quedado en el mismo conteo de antes.
    await waitFor(() => {
      const vehiculosCallsAfter = apiFetchMock.mock.calls.filter(([path]) => String(path).startsWith('/vehiculos')).length;
      expect(vehiculosCallsAfter).toBeGreaterThan(vehiculosCallsBefore);
    });
  });
});
