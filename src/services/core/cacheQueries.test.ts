import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClientSave, persistQueryClientRestore } from '@tanstack/react-query-persist-client';
import {
  BUILD_ID,
  CACHE_QUERIES_KEY,
  CACHE_QUERIES_MAX_AGE_MS,
  crearPersisterDeQueries,
  limpiarCacheDeQueries,
} from './cacheQueries';

/**
 * La caché persistida es lo que hace que la app arranque con datos en vez de en
 * "Cargando..." (y lo que evita gastar peticiones del límite por IP en cada recarga). Estas
 * pruebas cubren el contrato con React Query — guardar, restaurar, borrar — y los dos
 * modos de fallo que no deben romper nada: localStorage bloqueado y localStorage lleno.
 */
function clienteConDatos() {
  const client = new QueryClient({ defaultOptions: { queries: { gcTime: CACHE_QUERIES_MAX_AGE_MS } } });
  client.setQueryData(['celdas'], [{ id: '1', numero: 'C-001' }]);
  return client;
}

describe('services/core/cacheQueries', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('guarda las consultas exitosas en localStorage y las restaura en otro cliente', async () => {
    const persister = crearPersisterDeQueries();
    persistQueryClientSave({ queryClient: clienteConDatos(), persister, buster: BUILD_ID });
    // La escritura se agrupa (throttle de 1 s): hasta entonces no hay nada guardado.
    expect(localStorage.getItem(CACHE_QUERIES_KEY)).toBeNull();
    await vi.advanceTimersByTimeAsync(1000);
    expect(localStorage.getItem(CACHE_QUERIES_KEY)).toContain('C-001');

    const restaurado = new QueryClient();
    await persistQueryClientRestore({ queryClient: restaurado, persister, buster: BUILD_ID, maxAge: CACHE_QUERIES_MAX_AGE_MS });
    expect(restaurado.getQueryData(['celdas'])).toEqual([{ id: '1', numero: 'C-001' }]);
  });

  it('descarta lo guardado por otro build (buster distinto)', async () => {
    const persister = crearPersisterDeQueries();
    persistQueryClientSave({ queryClient: clienteConDatos(), persister, buster: 'build-viejo' });
    await vi.advanceTimersByTimeAsync(1000);

    const restaurado = new QueryClient();
    await persistQueryClientRestore({ queryClient: restaurado, persister, buster: BUILD_ID, maxAge: CACHE_QUERIES_MAX_AGE_MS });
    expect(restaurado.getQueryData(['celdas'])).toBeUndefined();
    // Y la copia inservible desaparece del almacenamiento.
    expect(localStorage.getItem(CACHE_QUERIES_KEY)).toBeNull();
  });

  it('limpiarCacheDeQueries borra lo guardado', async () => {
    const persister = crearPersisterDeQueries();
    persistQueryClientSave({ queryClient: clienteConDatos(), persister, buster: BUILD_ID });
    await vi.advanceTimersByTimeAsync(1000);
    expect(localStorage.getItem(CACHE_QUERIES_KEY)).not.toBeNull();

    limpiarCacheDeQueries();
    expect(localStorage.getItem(CACHE_QUERIES_KEY)).toBeNull();
  });

  it('si localStorage se llena, suelta la consulta más vieja y vuelve a intentar', async () => {
    const client = clienteConDatos();
    client.setQueryData(['parqueaderos'], [{ id: '1' }]);
    const setItem = vi.spyOn(Storage.prototype, 'setItem');
    setItem.mockImplementationOnce(() => { throw new DOMException('QuotaExceededError'); });

    const persister = crearPersisterDeQueries();
    persistQueryClientSave({ queryClient: client, persister, buster: BUILD_ID });
    await vi.advanceTimersByTimeAsync(1000);

    // Primer intento falla (cuota), segundo con una consulta menos sí se guarda.
    expect(setItem).toHaveBeenCalledTimes(2);
    const guardado = JSON.parse(setItem.mock.calls[1][1] as string);
    expect(guardado.clientState.queries).toHaveLength(1);
  });

  it('sin localStorage (bloqueado), el persister no hace nada y no lanza', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() { throw new Error('bloqueado'); },
    });
    try {
      const persister = crearPersisterDeQueries();
      expect(() => limpiarCacheDeQueries()).not.toThrow();
      persistQueryClientSave({ queryClient: clienteConDatos(), persister, buster: BUILD_ID });
      await vi.advanceTimersByTimeAsync(1000);
      const restaurado = new QueryClient();
      await persistQueryClientRestore({ queryClient: restaurado, persister, buster: BUILD_ID });
      expect(restaurado.getQueryData(['celdas'])).toBeUndefined();
    } finally {
      Object.defineProperty(window, 'localStorage', descriptor);
    }
  });

  it('BUILD_ID sale de la constante inyectada por Vite', () => {
    expect(BUILD_ID).toBe('test');
  });
});
