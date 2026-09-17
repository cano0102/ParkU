import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryCache, QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { toast } from 'sonner';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { Toaster, ErrorBoundary } from './components/shared';
import { RouteFallback } from './routes/RouteFallback';
import { BUILD_ID, CACHE_QUERIES_MAX_AGE_MS, crearPersisterDeQueries } from './services/core/cacheQueries';

// `retry: false` — hasta nuevo aviso (a petición explícita): por defecto React
// Query reintenta cada query fallida 3 veces con backoff. Contra la API real
// eso significa que un solo 429 ("demasiados intentos desde la IP") se
// multiplica x4 en vez de fallar una vez, lo que agota la ventana de rate
// limit del backend mucho más rápido de lo que generaría el uso real y deja
// la app bloqueada para seguir probándola. Revisar si se reactiva con una
// política más fina (p. ej. no reintentar en 4xx) cuando el rate limit del
// backend deje de ser un problema para las pruebas.
//
// `staleTime`/`refetchOnWindowFocus`/`refetchOnReconnect` — con los valores
// por defecto (staleTime 0, refetch en cada foco de ventana y reconexión),
// React Query volvía a pedir los mismos datos cada vez que se montaba un
// componente, se cambiaba de pestaña o volvía la conexión, aunque los datos
// tuvieran segundos de antigüedad. Sumado a que casi toda página pide varios
// recursos a la vez (celdas, reservas, vehículos, conductores, parqueaderos)
// y a que el backend tiene un límite de solicitudes por IP bastante estricto,
// esto por sí solo alcanza para gatillar el 429 con el uso normal de la app,
// sin que medie ningún reintento. Con un `staleTime` de 1 minuto los datos ya
// cacheados se reutilizan en vez de volver a pedirse en cada navegación.
// `QueryCache.onError` — React Query 5 quitó el `onError` por-query de `useQuery`
// (solo lo conserva `useMutation`), así que este es el único lugar posible para que
// una lectura fallida (p. ej. un 403 de un rol sin permiso sobre esa lista) muestre
// algo en vez de quedar como un array vacío indistinguible de "no hay datos" —
// antes de esto, `useList()` en queryFactory.ts no avisaba nada.
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // `meta.silentError` (ver queryFactory.ts#useList): para una lectura que hay que
      // intentar igual porque no existe otra fuente de datos, pero cuyo componente ya
      // construyó su propio manejo de `isError` en pantalla — evita el toast duplicado.
      if (query.meta?.silentError) return;
      const mensaje = error instanceof Error ? error.message : 'No se pudo cargar la información.';
      // `id` = el propio mensaje: una pantalla pide varias listas a la vez, y cuando la causa
      // es común (el backend dormido, el límite de solicitudes por IP, sin conexión) todas
      // fallan con el mismo texto — sonner reutiliza el toast en vez de apilar seis iguales.
      toast.error(mensaje, { id: mensaje });
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Las listas se conservan en memoria (y en la caché persistida) mientras la sesión
      // siga abierta, aunque ninguna pantalla las esté usando: así al volver a una sección
      // se pinta lo último que se vio mientras se refresca por detrás. Con los 5 minutos por
      // defecto, una lista sin usar se descartaba y la sección volvía a arrancar en blanco.
      // Debe ser >= CACHE_QUERIES_MAX_AGE_MS para que la persistencia no la pierda antes.
      gcTime: CACHE_QUERIES_MAX_AGE_MS,
    },
    mutations: { retry: false },
  },
});

// Ver services/core/cacheQueries.ts: lo último que respondió la API se guarda en localStorage
// y se restaura al abrir la app, para no arrancar en "Cargando..." cada vez.
const persister = crearPersisterDeQueries();
const persistOptions = { persister, maxAge: CACHE_QUERIES_MAX_AGE_MS, buster: BUILD_ID };

export default function App() {
  return (
    <ErrorBoundary>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <RouterProvider router={router} />
          </Suspense>
          <Toaster />
        </AuthProvider>
      </PersistQueryClientProvider>
    </ErrorBoundary>
  );
}
