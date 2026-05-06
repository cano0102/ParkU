import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData, Rol } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';

const PERMISOS_LABELS = {
  dashboard: 'Dashboard',
  roles: 'Gestión de Roles',
  usuarios: 'Gestión de Usuarios',
  conductores: 'Gestión de Conductores',
  vehiculos: 'Gestión de Vehículos',
  parqueaderos: 'Gestión de Parqueaderos',
  celdas: 'Gestión de Celdas',
  asignaciones: 'Asignación de Celdas',
  entradaSalida: 'Entrada y Salida',
  reservas: 'Reservas',
  incidentes: 'Incidentes',
  reconocimientoPlacas: 'Reconocimiento de Placas'
};

export function Roles() {
  const { roles, addRol, updateRol, deleteRol } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [viewingRol, setViewingRol] = useState<Rol | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    permisos: {
      dashboard: false,
      roles: false,
      usuarios: false,
      conductores: false,
      vehiculos: false,
      parqueaderos: false,
      celdas: false,
      asignaciones: false,
      entradaSalida: false,
      reservas: false,
      incidentes: false,
      reconocimientoPlacas: false
    },
    estado: 'activo' as 'activo' | 'inactivo'
  });

  const handleOpenDialog = (rol?: Rol) => {
    if (rol) {
      setEditingRol(rol);
      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos,
        estado: rol.estado
      });
    } else {
      setEditingRol(null);
      setFormData({
        nombre: '',
        descripcion: '',
        permisos: {
          dashboard: false,
          roles: false,
          usuarios: false,
          conductores: false,
          vehiculos: false,
          parqueaderos: false,
          celdas: false,
          asignaciones: false,
          entradaSalida: false,
          reservas: false,
          incidentes: false,
          reconocimientoPlacas: false
        },
        estado: 'activo'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRol) {
      updateRol(editingRol.id, formData);
      toast.success('Rol actualizado correctamente');
    } else {
      addRol(formData);
      toast.success('Rol creado correctamente');
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este rol? Esta acción no se puede deshacer.')) {
      deleteRol(id);
      toast.success('Rol eliminado correctamente');
    }
  };

  const handleChangeEstado = (id: string, nuevoEstado: 'activo' | 'inactivo') => {
    updateRol(id, { estado: nuevoEstado });
    toast.success(`Rol ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
  };

  const handleViewRol = (rol: Rol) => {
    setViewingRol(rol);
    setViewDialogOpen(true);
  };

  const handleTogglePermiso = (permiso: keyof typeof formData.permisos) => {
    setFormData({
      ...formData,
      permisos: {
        ...formData.permisos,
        [permiso]: !formData.permisos[permiso]
      }
    });
  };

  const handleToggleAllPermisos = (value: boolean) => {
    const allPermisos = Object.keys(formData.permisos).reduce((acc, key) => {
      acc[key as keyof typeof formData.permisos] = value;
      return acc;
    }, {} as typeof formData.permisos);

    setFormData({
      ...formData,
      permisos: allPermisos
    });
  };

  const countActivePermisos = (permisos: typeof formData.permisos) => {
    return Object.values(permisos).filter(Boolean).length;
  };

  const allPermisosSelected = Object.values(formData.permisos).every(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Roles</h1>
          <p className="text-sm text-gray-600 mt-1">Administra los roles y permisos del sistema</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      {/* Lista de Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((rol) => (
          <Card key={rol.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{rol.nombre}</CardTitle>
                    <Badge variant={rol.estado === 'activo' ? 'default' : 'secondary'} className="mt-1 text-xs">
                      {rol.estado}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{rol.descripcion}</p>

              <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                <span>Permisos activos: {countActivePermisos(rol.permisos)}/{Object.keys(rol.permisos).length}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={() => handleViewRol(rol)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={() => handleOpenDialog(rol)}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(rol.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRol ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Rol</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej: Administrador, Operador, Usuario"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  required
                  placeholder="Describe las responsabilidades de este rol"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Permisos del Rol</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAllPermisos(!allPermisosSelected)}
                  >
                    {allPermisosSelected ? 'Desmarcar todos' : 'Seleccionar todos'}
                  </Button>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(PERMISOS_LABELS).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={formData.permisos[key as keyof typeof formData.permisos]}
                          onCheckedChange={() => handleTogglePermiso(key as keyof typeof formData.permisos)}
                        />
                        <label
                          htmlFor={key}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.estado === 'activo'}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, estado: checked ? 'activo' : 'inactivo' })
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {formData.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingRol ? 'Actualizar Rol' : 'Crear Rol'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalle */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Rol</DialogTitle>
          </DialogHeader>
          {viewingRol && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-gray-500 text-xs">Nombre</Label>
                <p className="text-gray-900 font-medium">{viewingRol.nombre}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Descripción</Label>
                <p className="text-gray-900 text-sm">{viewingRol.descripcion}</p>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Estado</Label>
                <div className="mt-1">
                  <Badge variant={viewingRol.estado === 'activo' ? 'default' : 'secondary'}>
                    {viewingRol.estado}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-500 text-xs">Permisos Asignados ({countActivePermisos(viewingRol.permisos)}/{Object.keys(viewingRol.permisos).length})</Label>
                <div className="mt-2 border rounded-lg p-3 bg-gray-50 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(PERMISOS_LABELS).map(([key, label]) => {
                      const hasPermiso = viewingRol.permisos[key as keyof typeof viewingRol.permisos];
                      return (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className={hasPermiso ? 'text-gray-900' : 'text-gray-400'}>{label}</span>
                          <Badge variant={hasPermiso ? 'default' : 'secondary'} className="text-xs">
                            {hasPermiso ? 'Permitido' : 'Denegado'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
