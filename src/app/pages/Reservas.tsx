import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, Calendar, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData, Reserva } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export function Reservas() {
  const { reservas, addReserva, updateReserva, deleteReserva, vehiculos, celdas, conductores, usuarios, parqueaderos } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [viewingReserva, setViewingReserva] = useState<Reserva | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    vehiculoId: '',
    celdaId: '',
    fechaReserva: new Date().toISOString().split('T')[0],
    horaInicio: '08:00',
    horaFin: '18:00',
    estado: 'pendiente' as 'pendiente' | 'activa' | 'completada' | 'cancelada'
  });

  const handleOpenDialog = (reserva?: Reserva) => {
    if (reserva) {
      setEditingReserva(reserva);
      setFormData({
        vehiculoId: reserva.vehiculoId,
        celdaId: reserva.celdaId,
        fechaReserva: reserva.fechaReserva,
        horaInicio: reserva.horaInicio,
        horaFin: reserva.horaFin,
        estado: reserva.estado
      });
    } else {
      setEditingReserva(null);
      setFormData({
        vehiculoId: '',
        celdaId: '',
        fechaReserva: new Date().toISOString().split('T')[0],
        horaInicio: '08:00',
        horaFin: '18:00',
        estado: 'pendiente'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingReserva) {
      updateReserva(editingReserva.id, formData);
      toast.success('Reserva actualizada exitosamente');
    } else {
      addReserva(formData);
      toast.success('Reserva creada exitosamente');
    }
    
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
      deleteReserva(id);
      toast.success('Reserva eliminada exitosamente');
    }
  };

  const handleViewReserva = (reserva: Reserva) => {
    setViewingReserva(reserva);
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

  const celdasDisponibles = celdas.filter(c => c.estado === 'disponible' || c.estado === 'reservada');

  const filteredReservas = reservas.filter(reserva => {
    const vehiculo = getVehiculo(reserva.vehiculoId);
    const celda = getCelda(reserva.celdaId);
    const usuario = getUsuarioConductor(reserva.vehiculoId);
    
    return (
      vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      celda?.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reserva.fechaReserva.includes(searchTerm)
    );
  });

  const getEstadoBadgeVariant = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'secondary';
      case 'activa': return 'default';
      case 'completada': return 'outline';
      case 'cancelada': return 'destructive';
      default: return 'secondary';
    }
  };

  const reservasPendientes = reservas.filter(r => r.estado === 'pendiente').length;
  const reservasActivas = reservas.filter(r => r.estado === 'activa').length;
  const reservasCompletadas = reservas.filter(r => r.estado === 'completada').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
          <p className="text-gray-600 mt-1">Administra las reservas de vehículos</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reserva
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{reservasPendientes}</p>
                <p className="text-xs text-gray-500">Reservas por confirmar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{reservasActivas}</p>
                <p className="text-xs text-gray-500">Reservas confirmadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{reservasCompletadas}</p>
                <p className="text-xs text-gray-500">Reservas finalizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por placa, celda, conductor o fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Reservas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas ({filteredReservas.length})</CardTitle>
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
                  <TableHead>Fecha</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservas.map((reserva) => {
                  const vehiculo = getVehiculo(reserva.vehiculoId);
                  const celda = getCelda(reserva.celdaId);
                  const usuario = getUsuarioConductor(reserva.vehiculoId);
                  const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;
                  
                  return (
                    <TableRow key={reserva.id}>
                      <TableCell>
                        {vehiculo && (
                          <div>
                            <p className="font-bold">{vehiculo.placa}</p>
                            <p className="text-xs text-gray-500">
                              {vehiculo.marca} {vehiculo.modelo}
                            </p>
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
                      <TableCell className="text-sm">{reserva.fechaReserva}</TableCell>
                      <TableCell className="text-sm">
                        {reserva.horaInicio} - {reserva.horaFin}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadgeVariant(reserva.estado)}>
                          {reserva.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReserva(reserva)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(reserva)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(reserva.id)}
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
            <DialogTitle>{editingReserva ? 'Editar Reserva' : 'Crear Nueva Reserva'}</DialogTitle>
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
                <Label htmlFor="fechaReserva">Fecha de Reserva</Label>
                <Input
                  id="fechaReserva"
                  type="date"
                  value={formData.fechaReserva}
                  onChange={(e) => setFormData({ ...formData, fechaReserva: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Hora Inicio</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaFin">Hora Fin</Label>
                  <Input
                    id="horaFin"
                    type="time"
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: 'pendiente' | 'activa' | 'completada' | 'cancelada') => 
                    setFormData({ ...formData, estado: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="activa">Activa</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingReserva ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalle */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de la Reserva</DialogTitle>
          </DialogHeader>
          {viewingReserva && (() => {
            const vehiculo = getVehiculo(viewingReserva.vehiculoId);
            const celda = getCelda(viewingReserva.celdaId);
            const usuario = getUsuarioConductor(viewingReserva.vehiculoId);
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
                  <p className="text-sm text-gray-500">{usuario?.identificacion}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Celda</Label>
                    <p className="text-gray-900 font-medium">{celda?.numero}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Parqueadero</Label>
                    <p className="text-gray-900">{parqueadero?.nombre}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Fecha de Reserva</Label>
                  <p className="text-gray-900 font-medium">{viewingReserva.fechaReserva}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Hora Inicio</Label>
                    <p className="text-gray-900">{viewingReserva.horaInicio}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Hora Fin</Label>
                    <p className="text-gray-900">{viewingReserva.horaFin}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500">Estado</Label>
                  <div className="mt-1">
                    <Badge variant={getEstadoBadgeVariant(viewingReserva.estado)}>
                      {viewingReserva.estado}
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
