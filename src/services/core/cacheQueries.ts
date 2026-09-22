/**
 * Caché de React Query persistida en localStorage.
 *
 * Qué resuelve: al abrir la app (o recargarla), cada pantalla partía de cero y se quedaba en
 * "Cargando..." hasta que la API respondiera — y la API vive en Render, cuyo plan gratuito
 * apaga el servidor tras 15 minutos sin uso y tarda entre 30 y 60 segundos en despertarlo.
 * Con la caché guardada, la pantalla pinta al instante lo último que se vio y React Query
 * la refresca por detrás cuando la petición responde (stale-while-revalidate). Además, si
 * los datos guardados aún no vencieron (`staleTime`), la recarga no gasta ninguna petición
 * de las 100 por IP cada 15 minutos que permite el backend.
 *
 * Qué NO guarda: solo consultas que terminaron bien. Nada de tokens ni de la sesión — eso
 * sigue en tokenStorage.ts / AuthContext. La caché se borra al cerrar sesión o al caducar
 * la sesión (ver AuthContext) para que en un equipo compartido la siguiente persona no vea
 * los datos de la anterior, y `buster` la invalida sola en cada despliegue: si un servicio
 * cambia la forma de sus datos, ninguna pantalla recibe una copia vieja con otra forma.
 */
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { removeOldestQuery, type Persister } from '@tanstack/react-query-persist-client';

export const CACHE_QUERIES_KEY = 'parkuQueryCache';

/** Cuánto sobrevive lo guardado antes de descartarse al restaurar. Debe ser <= `gcTime`. */
export const CACHE_QUERIES_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Identificador del build (`define` en vite.config.ts y vitest.config.ts); cambia en cada despliegue. */
export const BUILD_ID: string = __APP_BUILD_ID__;

function storageDisponible(): Storage | undefined {
  try {
    // Un navegador con el almacenamiento bloqueado (modo privado en algunos, políticas de
    // empresa) lanza al tocar `localStorage`; en ese caso la caché simplemente no persiste.
    const storage = window.localStorage;
    storage.getItem(CACHE_QUERIES_KEY);
    return storage;
  } catch {
    return undefined;
  }
}

/**
 * Persister para `PersistQueryClientProvider`. Si localStorage no está disponible, devuelve
 * uno que no hace nada (la app funciona igual, solo sin caché entre recargas).
 */
export function crearPersisterDeQueries(): Persister {
  return createSyncStoragePersister({
    storage: storageDisponible(),
    key: CACHE_QUERIES_KEY,
    // Agrupa las escrituras: cada respuesta de la API cambia la caché, y serializarla entera
    // en cada una sería trabajo inútil. Un segundo de retraso no se nota.
    throttleTime: 1000,
    // Si localStorage se llena (cuota de ~5 MB), se va soltando la consulta más vieja hasta
    // que quepa, en vez de perder la caché entera.
    retry: removeOldestQuery,
  });
}

/** Borra la caché guardada. Se llama al cerrar o caducar la sesión. */
export function limpiarCacheDeQueries(): void {
  try {
    window.localStorage.removeItem(CACHE_QUERIES_KEY);
  } catch {
    // localStorage no disponible: no hay nada guardado que borrar.
  }
}
