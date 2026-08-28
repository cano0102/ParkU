import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { Toaster, ErrorBoundary } from './components/shared';
import { RouteFallback } from './routes/RouteFallback';

// `retry: false` — hasta nuevo aviso (a petición explícita): por defecto React
// Query reintenta cada query fallida 3 veces con backoff. Contra la API real
// eso significa que un solo 429 ("demasiados intentos desde la IP") se
// multiplica x4 en vez de fallar una vez, lo que agota la ventana de rate
// limit del backend mucho más rápido de lo que generaría el uso real y deja
// la app bloqueada para seguir probándola. Revisar si se reactiva con una
// política más fina (p. ej. no reintentar en 4xx) cuando el rate limit del
// backend deje de ser un problema para las pruebas.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <RouterProvider router={router} />
          </Suspense>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
