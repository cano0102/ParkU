import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Search, Car } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData, Vehiculo } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';

export function Vehiculos() {
  const { vehiculos, addVehiculo, updateVehiculo, deleteVehiculo, conductores, usuarios } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [viewingVehiculo, setViewingVehiculo] = useState<Vehiculo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchByConductor, setSearchByConductor] = useState('');
  
  const [formData, setFormData] = useState({
    conductorId: '',
    placa: '',
    tipo: 'carro' as 'carro' | 'moto',
    marca: '',
    modelo: '',
    año: new Date().getFullYear(),
    color: '',
    descripcion: '',
    estado: 'activo' as 'activo' | 'inactivo'
  });

  const handleOpenDialog = (vehiculo?: Vehiculo) => {
    if (vehiculo) {
      setEditingVehiculo(vehiculo);
      setFormData({
        conductorId: vehiculo.conductorId,
        placa: vehiculo.placa,
        tipo: vehiculo.tipo,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        año: vehiculo.año,
        color: vehiculo.color,
        descripcion: vehiculo.descripcion,
        estado: vehiculo.estado
      });
    } else {
      setEditingVehiculo(null);
      setFormData({
        conductorId: '',
        placa: '',
        tipo: 'carro',
        marca: '',
        modelo: '',
        año: new Date().getFullYear(),
        color: '',
        descripcion: '',
        estado: 'activo'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVehiculo) {
      updateVehiculo(editingVehiculo.id, formData);
      toast.success('Vehículo actualizado exitosamente');
    } else {
      addVehiculo(formData);
      toast.success('Vehículo creado exitosamente');
    }
    
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      deleteVehiculo(id);
      toast.success('Vehículo eliminado exitosamente');
    }
  };

  const handleChangeEstado = (id: string, nuevoEstado: 'activo' | 'inactivo') => {
    updateVehiculo(id, { estado: nuevoEstado });
    toast.success(`Vehículo ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
  };

  const handleViewVehiculo = (vehiculo: Vehiculo) => {
    setViewingVehiculo(vehiculo);
    setViewDialogOpen(true);
  };

  const getConductor = (conductorId: string) => {
    return conductores.find(c => c.id === conductorId);
  };

  const getUsuarioConductor = (conductorId: string) => {
    const conductor = getConductor(conductorId);
    if (!conductor) return null;
    return usuarios.find(u => u.id === conductor.usuarioId);
  };

  const filteredVehiculos = vehiculos.filter(vehiculo => {
    const matchesSearch = 
      vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!searchByConductor) return matchesSearch;
    
    const usuario = getUsuarioConductor(vehiculo.conductorId);
    const matchesConductor = usuario?.nombre.toLowerCase().includes(searchByConductor.toLowerCase()) ||
                             usuario?.identificacion.includes(searchByConductor);
    
    return matchesSearch && matchesConductor;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Vehículos</h1>
          <p className="text-gray-600 mt-1">Administra los vehículos del sistema</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Vehículo
        </Button>
      </div>

      {/* Barras de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por placa, marca o modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por conductor..."
                value={searchByConductor}
                onChange={(e) => setSearchByConductor(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Vehículos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Vehículos ({filteredVehiculos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Conductor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehiculos.map((vehiculo) => {
                  const usuario = getUsuarioConductor(vehiculo.conductorId);
                  
                  return (
                    <TableRow key={vehiculo.id}>
                      <TableCell className="font-bold text-gray-900">
                        {vehiculo.placa}
                      </TableCell>
                      <TableCell>
                        <Badge variant={vehiculo.tipo === 'carro' ? 'default' : 'secondary'}>
                          {vehiculo.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium">{vehiculo.marca}</p>
                            <p className="text-xs text-gray-500">{vehiculo.modelo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{vehiculo.año}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: vehiculo.color.toLowerCase() }}
                          />
                          <span>{vehiculo.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {usuario ? (
                          <div>
                            <p className="text-sm font-medium">{usuario.nombre}</p>
                            <p className="text-xs text-gray-500">{usuario.identificacion}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={vehiculo.estado === 'activo'}
                          onCheckedChange={(checked) => 
                            handleChangeEstado(vehiculo.id, checked ? 'activo' : 'inactivo')
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewVehiculo(vehiculo)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(vehiculo)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(vehiculo.id)}
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
            <DialogTitle>{editingVehiculo ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="conductorId">Conductor</Label>
                <Select
                  value={formData.conductorId}
                  onValueChange={(value) => setFormData({ ...formData, conductorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    {conductores.map((conductor) => {
                      const usuario = usuarios.find(u => u.id === conductor.usuarioId);
                      return (
                        <SelectItem key={conductor.id} value={conductor.id}>
                          {usuario?.nombre} - {usuario?.identificacion}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  placeholder="ABC123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Vehículo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: 'carro' | 'moto') => 
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carro">Carro</SelectItem>
                    <SelectItem value="moto">Moto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  placeholder="Toyota, Yamaha, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  placeholder="Corolla, FZ, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="año">Año</Label>
                <Input
                  id="año"
                  type="number"
                  value={formData.año}
                  onChange={(e) => setFormData({ ...formData, año: parseInt(e.target.value) })}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Blanco, Negro, etc."
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Características adicionales del vehículo"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <div className="flex items-center gap-2 h-10">
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
                {editingVehiculo ? 'Actualizar' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalle */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Vehículo</DialogTitle>
          </DialogHeader>
          {viewingVehiculo && (() => {
            const usuario = getUsuarioConductor(viewingVehiculo.conductorId);
            
            return (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Car className="h-10 w-10 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{viewingVehiculo.placa}</h3>
                    <Badge variant={viewingVehiculo.estado === 'activo' ? 'default' : 'secondary'}>
                      {viewingVehiculo.estado}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Tipo</Label>
                    <p className="text-gray-900 font-medium capitalize">{viewingVehiculo.tipo}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Año</Label>
                    <p className="text-gray-900 font-medium">{viewingVehiculo.año}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Marca</Label>
                    <p className="text-gray-900">{viewingVehiculo.marca}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Modelo</Label>
                    <p className="text-gray-900">{viewingVehiculo.modelo}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded-full border-2"
                        style={{ backgroundColor: viewingVehiculo.color.toLowerCase() }}
                      />
                      <p className="text-gray-900">{viewingVehiculo.color}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Conductor</Label>
                    {usuario && (
                      <div className="mt-1">
                        <p className="text-gray-900 font-medium">{usuario.nombre}</p>
                        <p className="text-sm text-gray-500">{usuario.identificacion}</p>
                      </div>
                    )}
                  </div>
                  {viewingVehiculo.descripcion && (
                    <div className="col-span-2">
                      <Label className="text-gray-500">Descripción</Label>
                      <p className="text-gray-900 text-sm mt-1">{viewingVehiculo.descripcion}</p>
                    </div>
                  )}
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
