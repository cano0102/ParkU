import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { Toaster, ErrorBoundary } from './components/shared';
import { RouteFallback } from './routes/RouteFallback';

const queryClient = new QueryClient();

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
