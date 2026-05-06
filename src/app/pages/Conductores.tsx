import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Search, UserCog, Car } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData, Conductor } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';

export function Conductores() {
  const { conductores, addConductor, updateConductor, deleteConductor, usuarios, vehiculos } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [vehiculoDialogOpen, setVehiculoDialogOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null);
  const [viewingConductor, setViewingConductor] = useState<Conductor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    usuarioId: '',
    tipoConductor: 'aprendiz' as 'aprendiz' | 'instructor',
    centroFormacion: '',
    discapacidad: false,
    tipoDiscapacidad: '',
    estado: 'activo' as 'activo' | 'inactivo'
  });

  const handleOpenDialog = (conductor?: Conductor) => {
    if (conductor) {
      setEditingConductor(conductor);
      setFormData({
        usuarioId: conductor.usuarioId,
        tipoConductor: conductor.tipoConductor,
        centroFormacion: conductor.centroFormacion,
        discapacidad: conductor.discapacidad,
        tipoDiscapacidad: conductor.tipoDiscapacidad || '',
        estado: conductor.estado
      });
    } else {
      setEditingConductor(null);
      setFormData({
        usuarioId: '',
        tipoConductor: 'aprendiz',
        centroFormacion: '',
        discapacidad: false,
        tipoDiscapacidad: '',
        estado: 'activo'
      });
    }
    setDialogOpen(true);
  };

  const handleChangeEstado = (id: string, nuevoEstado: 'activo' | 'inactivo') => {
    updateConductor(id, { estado: nuevoEstado });
    toast.success(`Conductor ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} correctamente`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingConductor) {
      updateConductor(editingConductor.id, formData);
      toast.success('Conductor actualizado exitosamente');
    } else {
      addConductor(formData);
      toast.success('Conductor creado exitosamente');
    }
    
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este conductor?')) {
      deleteConductor(id);
      toast.success('Conductor eliminado exitosamente');
    }
  };

  const handleViewConductor = (conductor: Conductor) => {
    setViewingConductor(conductor);
    setViewDialogOpen(true);
  };

  const getUsuario = (usuarioId: string) => {
    return usuarios.find(u => u.id === usuarioId);
  };

  const getVehiculosConductor = (conductorId: string) => {
    return vehiculos.filter(v => v.conductorId === conductorId);
  };

  const filteredConductores = conductores.filter(conductor => {
    const usuario = getUsuario(conductor.usuarioId);
    if (!usuario) return false;
    
    return usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
           usuario.identificacion.includes(searchTerm) ||
           conductor.centroFormacion.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Conductores</h1>
          <p className="text-sm text-gray-600 mt-1">Administra los conductores del sistema</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Conductor
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, identificación o centro de formación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Conductores */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Conductores ({filteredConductores.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Centro</TableHead>
                  <TableHead>Vehículos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConductores.map((conductor) => {
                  const usuario = getUsuario(conductor.usuarioId);
                  const vehiculosConductor = getVehiculosConductor(conductor.id);
                  
                  if (!usuario) return null;
                  
                  return (
                    <TableRow key={conductor.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="text-sm">{usuario.tipoDocumento}</p>
                          <p className="text-sm text-gray-900">{usuario.identificacion}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserCog className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{usuario.nombre}</p>
                            <p className="text-xs text-gray-500">{usuario.correo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={conductor.tipoConductor === 'instructor' ? 'default' : 'secondary'} className="text-xs">
                          {conductor.tipoConductor === 'instructor' ? 'Instructor' : 'Aprendiz'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{conductor.centroFormacion}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {vehiculosConductor.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={conductor.estado === 'activo'}
                          onCheckedChange={(checked) =>
                            handleChangeEstado(conductor.id, checked ? 'activo' : 'inactivo')
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewConductor(conductor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(conductor)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(conductor.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingConductor ? 'Editar Conductor' : 'Crear Nuevo Conductor'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="usuarioId">Usuario</Label>
                <Select
                  value={formData.usuarioId}
                  onValueChange={(value) => setFormData({ ...formData, usuarioId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((usuario) => (
                      <SelectItem key={usuario.id} value={usuario.id}>
                        {usuario.nombre} - {usuario.identificacion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoConductor">Tipo de Conductor</Label>
                <Select
                  value={formData.tipoConductor}
                  onValueChange={(value: 'aprendiz' | 'instructor') => 
                    setFormData({ ...formData, tipoConductor: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aprendiz">Aprendiz</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="centroFormacion">Centro de Formación</Label>
                <Input
                  id="centroFormacion"
                  value={formData.centroFormacion}
                  onChange={(e) => setFormData({ ...formData, centroFormacion: e.target.value })}
                  placeholder="Ej: Ingeniería, Administración"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>¿Tiene Discapacidad?</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.discapacidad}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, discapacidad: checked, tipoDiscapacidad: checked ? formData.tipoDiscapacidad : '' })
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {formData.discapacidad ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>

              {formData.discapacidad && (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="tipoDiscapacidad">Tipo de Discapacidad</Label>
                  <Textarea
                    id="tipoDiscapacidad"
                    value={formData.tipoDiscapacidad}
                    onChange={(e) => setFormData({ ...formData, tipoDiscapacidad: e.target.value })}
                    placeholder="Describe el tipo de discapacidad"
                    rows={2}
                  />
                </div>
              )}

              <div className="space-y-2 col-span-2">
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
                {editingConductor ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalle */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Conductor</DialogTitle>
          </DialogHeader>
          {viewingConductor && (() => {
            const usuario = getUsuario(viewingConductor.usuarioId);
            const vehiculosConductor = getVehiculosConductor(viewingConductor.id);
            
            return (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCog className="h-10 w-10 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{usuario?.nombre}</h3>
                    <Badge variant={viewingConductor.tipoConductor === 'instructor' ? 'default' : 'secondary'}>
                      {viewingConductor.tipoConductor === 'instructor' ? 'Instructor' : 'Aprendiz'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label className="text-gray-500">Identificación</Label>
                    <p className="text-gray-900 font-medium">
                      {usuario?.tipoDocumento} {usuario?.identificacion}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Correo</Label>
                    <p className="text-gray-900">{usuario?.correo}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Centro de Formación</Label>
                    <p className="text-gray-900">{viewingConductor.centroFormacion}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Discapacidad</Label>
                    <p className="text-gray-900">
                      {viewingConductor.discapacidad ? 'Sí' : 'No'}
                      {viewingConductor.discapacidad && viewingConductor.tipoDiscapacidad && 
                        ` - ${viewingConductor.tipoDiscapacidad}`
                      }
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Vehículos Registrados</Label>
                    <div className="mt-2 space-y-2">
                      {vehiculosConductor.length > 0 ? (
                        vehiculosConductor.map(v => (
                          <div key={v.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <Car className="h-4 w-4 text-gray-600" />
                            <span className="text-sm">
                              {v.marca} {v.modelo} - {v.placa}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No tiene vehículos registrados</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
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
