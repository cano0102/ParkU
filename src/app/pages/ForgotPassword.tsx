import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ParkingCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';


export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular envío de correo
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
      toast.success('Enlace de recuperación enviado a tu correo');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo y Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4">
              <ParkingCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recuperar Contraseña</h1>
            <p className="text-gray-600">
              {emailSent 
                ? 'Revisa tu correo electrónico' 
                : 'Ingresa tu correo para recuperar el acceso'
              }
            </p>
          </div>

          {!emailSent ? (
            <>
              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@parku.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Se enviará un enlace de recuperación a tu correo electrónico. 
                    El enlace será válido por 24 horas.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </Button>
              </form>

              {/* Volver al Login */}
              <div className="mt-6">
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Mensaje de éxito */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-800 font-medium mb-2">
                  ¡Correo enviado exitosamente!
                </p>
                <p className="text-sm text-green-700">
                  Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p>• Revisa tu bandeja de entrada</p>
                <p>• Si no lo encuentras, revisa la carpeta de spam</p>
                <p>• El enlace es válido por 24 horas</p>
              </div>

              {/* Volver al Login */}
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          © 2026 ParkU - Sistema Universitario de Parqueadero
        </p>
      </div>
    </div>
  );
}
