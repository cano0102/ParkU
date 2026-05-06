import React from 'react';
import { useNavigate } from 'react-router';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-green-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4">Página no encontrada</h2>
        <p className="text-gray-600 mt-2 mb-8">
          La página que buscas no existe o ha sido movida.
        </p>
        <Button 
          onClick={() => navigate('/dashboard')} 
          className="bg-green-600 hover:bg-green-700"
        >
          <Home className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Button>
      </div>
    </div>
  );
}
