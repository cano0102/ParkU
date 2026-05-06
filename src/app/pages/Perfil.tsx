import React, { useState } from 'react';
import { User, Mail, Phone, IdCard, Shield, Key, Save } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';

export function Perfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    // Simular cambio de contraseña
    toast.success('Contraseña actualizada exitosamente');
    setDialogOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-1">Información personal y configuración de cuenta</p>
      </div>

      {/* Avatar y Nombre */}
      <Card className="p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-3xl font-bold">
            {user.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">{user.nombre}</h2>
            <p className="text-gray-600">{user.correo}</p>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                <Shield className="h-4 w-4" />
                {user.rol}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Información Personal */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="h-5 w-5 text-gray-400" />
              <Label>Nombre Completo</Label>
            </div>
            <p className="font-medium pl-7">{user.nombre}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="h-5 w-5 text-gray-400" />
              <Label>Correo Electrónico</Label>
            </div>
            <p className="font-medium pl-7">{user.correo}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <Phone className="h-5 w-5 text-gray-400" />
              <Label>Teléfono</Label>
            </div>
            <p className="font-medium pl-7">{user.telefono || 'No especificado'}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <IdCard className="h-5 w-5 text-gray-400" />
              <Label>Identificación</Label>
            </div>
            <p className="font-medium pl-7">
              {user.tipoDocumento} {user.identificacion}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700">
              <Shield className="h-5 w-5 text-gray-400" />
              <Label>Rol en el Sistema</Label>
            </div>
            <p className="font-medium pl-7">{user.rol}</p>
          </div>
        </div>
      </Card>

      {/* Seguridad */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Seguridad</h3>
            <p className="text-sm text-gray-600 mt-1">Gestiona la seguridad de tu cuenta</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Key className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambiar Contraseña</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Requisitos de la contraseña:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className={passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                      • Mínimo 8 caracteres {passwordData.newPassword.length >= 8 && '✓'}
                    </li>
                    <li className={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'text-green-600' : ''}>
                      • Las contraseñas deben coincidir {passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword && '✓'}
                    </li>
                  </ul>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Actualizar Contraseña
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Contraseña</p>
              <p className="text-sm text-gray-600">Última actualización: Hace 30 días</p>
            </div>
            <p className="text-gray-400">••••••••</p>
          </div>
        </div>
      </Card>

      {/* Estadísticas de Uso */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Actividad Reciente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">Último acceso</p>
            <p className="text-lg font-semibold text-green-900 mt-1">Hoy, 10:30 AM</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">Sesiones activas</p>
            <p className="text-lg font-semibold text-blue-900 mt-1">1 dispositivo</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-700">Cuenta creada</p>
            <p className="text-lg font-semibold text-purple-900 mt-1">Ene 2026</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
