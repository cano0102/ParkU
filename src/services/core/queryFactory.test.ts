import { describe, it, expect } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useRoles, useCreateRol, useUpdateRol, useRemoveRol } from '@/features/roles/hooks/useRoles';
import { createTestQueryClient, withQueryClient } from '@/test/queryWrapper';

/**
 * `useRoles` es una instancia concreta de `createQueryHooks` (ver
 * `_factory.ts`): probar su ciclo de vida completo (list/create/update/
 * remove + invalidación de caché) cubre el comportamiento genérico que
 * comparten los demás hooks de dominio construidos sobre la misma fábrica.
 */
describe('services/hooks/_factory (vía useRoles)', () => {
  it('useList trae los roles semilla', async () => {
    const { result } = renderHook(() => useRoles(), { wrapper: withQueryClient() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBeGreaterThanOrEqual(3);
  });

  it('useCreate agrega un registro y useList lo refleja tras invalidar', async () => {
    const client = createTestQueryClient();
    const wrapper = withQueryClient(client);

    const list = renderHook(() => useRoles(), { wrapper });
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
    const before = list.result.current.data!.length;

    const create = renderHook(() => useCreateRol(), { wrapper });
    await act(async () => {
      await create.result.current.mutateAsync({
        nombre: 'Rol hook test',
        descripcion: 'creado en test',
        permisos: {
          dashboard: false, roles: false, usuarios: false, conductores: false, vehiculos: false,
          parqueaderos: false, celdas: false, asignaciones: false, entradaSalida: false,
          reservas: false, incidentes: false, reconocimientoPlacas: false,
        },
        estado: 'activo',
      });
    });

    await waitFor(() => expect(list.result.current.data!.length).toBe(before + 1));
  });

  it('useUpdate aplica el cambio y useRemove lo elimina, ambos invalidando la lista', async () => {
    const client = createTestQueryClient();
    const wrapper = withQueryClient(client);

    const create = renderHook(() => useCreateRol(), { wrapper });
    let createdId = '';
    await act(async () => {
      const created = await create.result.current.mutateAsync({
        nombre: 'Rol a editar',
        descripcion: 'original',
        permisos: {
          dashboard: false, roles: false, usuarios: false, conductores: false, vehiculos: false,
          parqueaderos: false, celdas: false, asignaciones: false, entradaSalida: false,
          reservas: false, incidentes: false, reconocimientoPlacas: false,
        },
        estado: 'activo',
      });
      createdId = created.id;
    });

    const update = renderHook(() => useUpdateRol(), { wrapper });
    await act(async () => {
      await update.result.current.mutateAsync({ id: createdId, data: { descripcion: 'editada' } });
    });
    expect(update.result.current.data?.descripcion).toBe('editada');

    const list = renderHook(() => useRoles(), { wrapper });
    await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
    expect(list.result.current.data!.some((r) => r.id === createdId)).toBe(true);

    const remove = renderHook(() => useRemoveRol(), { wrapper });
    await act(async () => {
      await remove.result.current.mutateAsync(createdId);
    });

    await waitFor(() => {
      expect(list.result.current.data!.some((r) => r.id === createdId)).toBe(false);
    });
  });
});
