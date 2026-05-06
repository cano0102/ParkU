import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, CarFront, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData, AsignacionCelda } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export function Asignaciones() {
  const { asignaciones, addAsignacion, updateAsignacion, deleteAsignacion, celdas, vehiculos, conductores, usuarios, parqueaderos } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingAsignacion, setEditingAsignacion] = useState<AsignacionCelda | null>(null);
  const [viewingAsignacion, setViewingAsignacion] = useState<AsignacionCelda | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    celdaId: '',
    vehiculoId: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    estado: 'activa' as 'activa' | 'finalizada'
  });

  const handleOpenDialog = (asignacion?: AsignacionCelda) => {
    if (asignacion) {
      setEditingAsignacion(asignacion);
      setFormData({
        celdaId: asignacion.celdaId,
        vehiculoId: asignacion.vehiculoId,
        fechaInicio: asignacion.fechaInicio,
        fechaFin: asignacion.fechaFin || '',
        estado: asignacion.estado
      });
    } else {
      setEditingAsignacion(null);
      setFormData({
        celdaId: '',
        vehiculoId: '',
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: '',
        estado: 'activa'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Actualizar estado de la celda
    const celda = celdas.find(c => c.id === formData.celdaId);
    if (celda && formData.estado === 'activa') {
      // Aquí deberías actualizar el estado de la celda a ocupada
    }
    
    if (editingAsignacion) {
      updateAsignacion(editingAsignacion.id, formData);
      toast.success('Asignación actualizada exitosamente');
    } else {
      addAsignacion(formData);
      toast.success('Asignación creada exitosamente');
    }
    
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta asignación?')) {
      deleteAsignacion(id);
      toast.success('Asignación eliminada exitosamente');
    }
  };

  const handleViewAsignacion = (asignacion: AsignacionCelda) => {
    setViewingAsignacion(asignacion);
    setViewDialogOpen(true);
  };

  const getVehiculo = (vehiculoId: string) => vehiculos.find(v => v.id === vehiculoId);
  const getCelda = (celdaId: string) => celdas.find(c => c.id === celdaId);
  const getParqueadero = (parqueaderoId: string) => parqueaderos.find(p => p.id === parqueaderoId);
  
  const getConductorVehiculo = (vehiculoId: string) => {
    const vehiculo = getVehiculo(vehiculoId);
    if (!vehiculo) return null;
    return conductores.find(c => c.id === vehiculo.conductorId);
  };
  
  const getUsuarioConductor = (vehiculoId: string) => {
    const conductor = getConductorVehiculo(vehiculoId);
    if (!conductor) return null;
    return usuarios.find(u => u.id === conductor.usuarioId);
  };

  const celdasDisponibles = celdas.filter(c => c.estado === 'disponible');

  const filteredAsignaciones = asignaciones.filter(asignacion => {
    const vehiculo = getVehiculo(asignacion.vehiculoId);
    const celda = getCelda(asignacion.celdaId);
    const usuario = getUsuarioConductor(asignacion.vehiculoId);
    
    return (
      vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      celda?.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asignación de Celdas</h1>
          <p className="text-gray-600 mt-1">Vincula vehículos con celdas de parqueadero</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Asignación
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por placa, celda o conductor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Asignaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Asignaciones ({filteredAsignaciones.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehículo</TableHead>
                  <TableHead>Conductor</TableHead>
                  <TableHead>Celda</TableHead>
                  <TableHead>Parqueadero</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAsignaciones.map((asignacion) => {
                  const vehiculo = getVehiculo(asignacion.vehiculoId);
                  const celda = getCelda(asignacion.celdaId);
                  const usuario = getUsuarioConductor(asignacion.vehiculoId);
                  const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;
                  
                  return (
                    <TableRow key={asignacion.id}>
                      <TableCell>
                        {vehiculo && (
                          <div className="flex items-center gap-2">
                            <CarFront className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-bold">{vehiculo.placa}</p>
                              <p className="text-xs text-gray-500">
                                {vehiculo.marca} {vehiculo.modelo}
                              </p>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {usuario && (
                          <div>
                            <p className="font-medium">{usuario.nombre}</p>
                            <p className="text-xs text-gray-500">{usuario.identificacion}</p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{celda?.numero}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{parqueadero?.nombre}</TableCell>
                      <TableCell className="text-sm">{asignacion.fechaInicio}</TableCell>
                      <TableCell className="text-sm">
                        {asignacion.fechaFin || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={asignacion.estado === 'activa' ? 'default' : 'secondary'}>
                          {asignacion.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewAsignacion(asignacion)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(asignacion)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(asignacion.id)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAsignacion ? 'Editar Asignación' : 'Crear Nueva Asignación'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vehiculoId">Vehículo</Label>
                <Select
                  value={formData.vehiculoId}
                  onValueChange={(value) => setFormData({ ...formData, vehiculoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculos.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.placa} - {v.marca} {v.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="celdaId">Celda</Label>
                <Select
                  value={formData.celdaId}
                  onValueChange={(value) => setFormData({ ...formData, celdaId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar celda" />
                  </SelectTrigger>
                  <SelectContent>
                    {celdasDisponibles.map((c) => {
                      const parq = getParqueadero(c.parqueaderoId);
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          {c.numero} - {parq?.nombre}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaFin">Fecha de Fin (Opcional)</Label>
                <Input
                  id="fechaFin"
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: 'activa' | 'finalizada') => 
                    setFormData({ ...formData, estado: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activa">Activa</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingAsignacion ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalle */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de la Asignación</DialogTitle>
          </DialogHeader>
          {viewingAsignacion && (() => {
            const vehiculo = getVehiculo(viewingAsignacion.vehiculoId);
            const celda = getCelda(viewingAsignacion.celdaId);
            const usuario = getUsuarioConductor(viewingAsignacion.vehiculoId);
            const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;
            
            return (
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-gray-500">Vehículo</Label>
                  <p className="text-gray-900 font-medium">
                    {vehiculo?.placa} - {vehiculo?.marca} {vehiculo?.modelo}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Conductor</Label>
                  <p className="text-gray-900">{usuario?.nombre}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Celda</Label>
                  <p className="text-gray-900 font-medium">{celda?.numero}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Parqueadero</Label>
                  <p className="text-gray-900">{parqueadero?.nombre}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Fecha Inicio</Label>
                    <p className="text-gray-900">{viewingAsignacion.fechaInicio}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Fecha Fin</Label>
                    <p className="text-gray-900">{viewingAsignacion.fechaFin || 'No definida'}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Estado</Label>
                  <div className="mt-1">
                    <Badge variant={viewingAsignacion.estado === 'activa' ? 'default' : 'secondary'}>
                      {viewingAsignacion.estado}
                    </Badge>
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
