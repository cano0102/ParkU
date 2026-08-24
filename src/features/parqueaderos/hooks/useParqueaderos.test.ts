import { describe, it, expect } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCeldas } from './useCeldas';
import { useCreateParqueadero, useRemoveParqueadero } from './useParqueaderos';
import type { Parqueadero } from './useParqueaderos';
import { createTestQueryClient, withQueryClient } from '@/test/queryWrapper';

const sample = (over: Partial<Omit<Parqueadero, 'id'>> = {}) => ({
  nombre: 'PQ Hook Test',
  direccion: 'Calle hook',
  capacidad: 3,
  horaInicio: '06:00',
  horaFin: '20:00',
  celdasCarros: 2,
  celdasMotos: 1,
  celdasMovilidadReducida: 0,
  descripcion: 'creado en test de hooks',
  estado: 'activo' as const,
  tipo: 'docentes',
  bloque: 'Bloque Hook',
  ...over,
});

/**
 * `useCreateParqueadero`/`useRemoveParqueadero` cascadean sobre celdas (ver
 * `services/parqueaderos.ts`) e invalidan *ambas* query keys a propósito —
 * si solo invalidaran 'parqueaderos', la lista de celdas quedaría obsoleta.
 */
describe('services/hooks/useParqueaderos — invalidación en cascada', () => {
  it('crear un parqueadero invalida también la query de celdas', async () => {
    const client = createTestQueryClient();
    const wrapper = withQueryClient(client);

    const celdasHook = renderHook(() => useCeldas(), { wrapper });
    await waitFor(() => expect(celdasHook.result.current.isSuccess).toBe(true));
    const before = celdasHook.result.current.data!.length;

    const create = renderHook(() => useCreateParqueadero(), { wrapper });
    await act(async () => {
      await create.result.current.mutateAsync(sample());
    });

    await waitFor(() => expect(celdasHook.result.current.data!.length).toBe(before + 3));
  });

  it('eliminar un parqueadero invalida también la query de celdas', async () => {
    const client = createTestQueryClient();
    const wrapper = withQueryClient(client);

    const create = renderHook(() => useCreateParqueadero(), { wrapper });
    let createdId = '';
    await act(async () => {
      const created = await create.result.current.mutateAsync(sample());
      createdId = created.id;
    });

    const celdasHook = renderHook(() => useCeldas(), { wrapper });
    await waitFor(() => expect(celdasHook.result.current.isSuccess).toBe(true));
    expect(celdasHook.result.current.data!.some((c) => c.parqueaderoId === createdId)).toBe(true);

    const remove = renderHook(() => useRemoveParqueadero(), { wrapper });
    await act(async () => {
      await remove.result.current.mutateAsync(createdId);
    });

    await waitFor(() => {
      expect(celdasHook.result.current.data!.some((c) => c.parqueaderoId === createdId)).toBe(false);
    });
  });
});
