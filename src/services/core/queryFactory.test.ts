import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { toast } from 'sonner';
import { createFakeRestBackend } from '@/test/fakeApi';
import { QueryClient } from '@tanstack/react-query';
import { useRoles, useCreateRol, useUpdateRol, useRemoveRol } from '@/features/roles';
import { createTestQueryClient, withQueryClient } from '@/test/queryWrapper';
import { STALE_TIME } from './queryFactory';

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock('@/services/core/http', () => ({ apiFetch: apiFetchMock }));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const seed = [
  { id: 1, nombre: 'Administrador', descripcion: '', estado: true },
  { id: 2, nombre: 'Vigilante', descripcion: '', estado: true },
  { id: 3, nombre: 'Conductor', descripcion: '', estado: true },
];
const backend = createFakeRestBackend('/roles', seed);
apiFetchMock.mockImplementation(backend.apiFetch);

const permisosVacios = {
  dashboard: false, roles: false, usuarios: false, conductores: false, vehiculos: false, misVehiculos: false,
  parqueaderos: false, celdas: false, asignaciones: false, entradaSalida: false,
  reservas: false, incidentes: false, reconocimientoPlacas: false,
};

/**
 * `useRoles` es una instancia concreta de `createQueryHooks` (ver
 * `queryFactory.ts`): probar su ciclo de vida completo (list/create/update/
 * remove + invalidación de caché) cubre el comportamiento genérico que
 * comparten los demás hooks de dominio construidos sobre la misma fábrica.
 */
describe('services/core/queryFactory (vía useRoles)', () => {
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
        permisos: permisosVacios,
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
        permisos: permisosVacios,
        estado: 'activo',
      });
      createdId = created.id;
    });

    const update = renderHook(() => useUpdateRol(), { wrapper });
    await act(async () => {
      await update.result.current.mutateAsync({ id: createdId, data: { descripcion: 'editada' } });
    });
    await waitFor(() => expect(update.result.current.data?.descripcion).toBe('editada'));

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

  /**
   * Antes de agregar `onError` a la fábrica (ver queryFactory.ts), una mutación rechazada por
   * el backend no mostraba nada: ni error, ni el sitio que la llamaba se enteraba (`.mutate()`
   * es fire-and-forget). Esta prueba fija ese contrato: cualquier hook construido sobre
   * `createQueryHooks` debe avisar el error, sin que cada dominio tenga que repetir el manejo.
   */
  it('useCreate avisa con un toast de error (no en silencio) cuando la mutación falla', async () => {
    vi.mocked(toast.error).mockClear();
    const client = createTestQueryClient();
    const wrapper = withQueryClient(client);

    apiFetchMock.mockImplementationOnce(() => Promise.reject(new Error('Ya existe un rol con ese nombre')));

    const create = renderHook(() => useCreateRol(), { wrapper });
    await act(async () => {
      await expect(
        create.result.current.mutateAsync({
          nombre: 'Rol duplicado',
          descripcion: '',
          permisos: permisosVacios,
          estado: 'activo',
        })
      ).rejects.toThrow('Ya existe un rol con ese nombre');
    });

    expect(toast.error).toHaveBeenCalledWith('Ya existe un rol con ese nombre');
  });

  /**
   * El backend limita las peticiones por IP (100 cada 15 min), así que cuánto tiempo se
   * reutiliza una lista sin volver a pedirla importa. La fábrica acepta un `staleTime` por
   * dominio y, si no se le da, tiene que respetar el del QueryClient: un
   * `staleTime: undefined` explícito pisaría el valor por defecto (React Query mezcla las
   * opciones con spread) y dejaría la lista caducada al instante — una petición por montaje.
   */
  it('useList respeta el staleTime del QueryClient cuando la fábrica no fija uno', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } });
    const wrapper = withQueryClient(client);

    const { result } = renderHook(() => useRoles(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(client.getQueryCache().find({ queryKey: ['roles'] })?.observers[0]?.options.staleTime).toBe(STALE_TIME.MAESTRO);

    const { createQueryHooks } = await import('./queryFactory');
    const sinStale = createQueryHooks<{ id: string }>('sin-stale', {
      getAll: async () => [], getById: async () => undefined, create: async (d) => ({ id: '1', ...d }), update: async () => ({ id: '1' }), remove: async () => {},
    });
    const lista = renderHook(() => sinStale.useList(), { wrapper });
    await waitFor(() => expect(lista.result.current.isSuccess).toBe(true));
    expect(client.getQueryCache().find({ queryKey: ['sin-stale'] })?.observers[0]?.options.staleTime).toBe(60_000);
    expect(lista.result.current.isStale).toBe(false);
  });
});
