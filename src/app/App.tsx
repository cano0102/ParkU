import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import { Toaster } from '../shared/components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <RouterProvider router={router} />
        <Toaster />
      </DataProvider>
    </AuthProvider>
  );
}
