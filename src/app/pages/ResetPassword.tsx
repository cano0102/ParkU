import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import {
  ParkingCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

import {
  confirmPasswordReset
} from 'firebase/auth';

import { auth } from '../../firebase/config';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

import { toast } from 'sonner';

export function ResetPassword() {

  const navigate = useNavigate();

  // Obtener código del correo
  const [searchParams] = useSearchParams();

  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    if (!oobCode) {
      toast.error('Código inválido o expirado');
      return;
    }

    if (password.length < 8) {
      toast.error(
        'La contraseña debe tener mínimo 8 caracteres'
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {

      setLoading(true);

      // RESET REAL DE FIREBASE
      await confirmPasswordReset(
        auth,
        oobCode,
        password
      );

      toast.success(
        'Contraseña actualizada correctamente'
      );

      navigate('/login');

    } catch (error) {

      console.error(error);

      toast.error(
        'El enlace expiró o es inválido'
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* LOGO */}
          <div className="text-center mb-8">

            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-4">
              <ParkingCircle className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Nueva Contraseña
            </h1>

            <p className="text-gray-600">
              Ingresa tu nueva contraseña
            </p>

          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* PASSWORD */}
            <div className="space-y-2">

              <Label htmlFor="password">
                Nueva Contraseña
              </Label>

              <div className="relative">

                <Input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  className="h-11 pr-10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />}
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">

              <Label htmlFor="confirmPassword">
                Confirmar Contraseña
              </Label>

              <div className="relative">

                <Input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                  className="h-11 pr-10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />}
                </button>

              </div>

            </div>

            {/* REQUISITOS */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">

              <p className="text-sm font-medium text-gray-700 mb-2">
                Requisitos:
              </p>

              <ul className="text-sm text-gray-600 space-y-1">

                <li className={
                  password.length >= 8
                    ? 'text-green-600'
                    : ''
                }>
                  • Mínimo 8 caracteres
                </li>

                <li className={
                  password === confirmPassword &&
                  password
                    ? 'text-green-600'
                    : ''
                }>
                  • Las contraseñas coinciden
                </li>

              </ul>

            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading
                ? 'Actualizando...'
                : 'Actualizar Contraseña'}
            </Button>

          </form>

          {/* LOGIN */}
          <div className="mt-6">

            <Link to="/login">

              <Button
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Login
              </Button>

            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}