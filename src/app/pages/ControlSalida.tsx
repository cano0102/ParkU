import React, { useState } from 'react';
import { Plus, ArrowLeftRight, Search, LogIn, LogOut as LogOutIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData, ControlSalida } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export function ControlSalidaPage() {
  const { controlesSalida, addControlSalida, updateControlSalida, deleteControlSalida, vehiculos, celdas, conductores, usuarios, parqueaderos } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVehiculo, setSearchVehiculo] = useState('');
  
  const [formData, setFormData] = useState({
    vehiculoId: '',
    celdaId: '',
    fechaEntrada: new Date().toISOString().slice(0, 16),
    fechaSalida: '',
    estado: 'en_parqueadero' as 'en_parqueadero' | 'finalizado'
  });

  const handleOpenDialog = () => {
    setFormData({
      vehiculoId: '',
      celdaId: '',
      fechaEntrada: new Date().toISOString().slice(0, 16),
      fechaSalida: '',
      estado: 'en_parqueadero'
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addControlSalida(formData);
    toast.success('Entrada registrada exitosamente');
    setDialogOpen(false);
  };

  const handleRegistrarSalida = (id: string) => {
    const now = new Date().toISOString().slice(0, 16);
    updateControlSalida(id, { 
      fechaSalida: now,
      estado: 'finalizado' 
    });
    toast.success('Salida registrada exitosamente');
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

  const filteredControles = controlesSalida.filter(control => {
    const vehiculo = getVehiculo(control.vehiculoId);
    const celda = getCelda(control.celdaId);
    const usuario = getUsuarioConductor(control.vehiculoId);
    
    const matchesSearch = 
      vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      celda?.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!searchVehiculo) return matchesSearch;
    
    return matchesSearch && vehiculo?.placa.toLowerCase().includes(searchVehiculo.toLowerCase());
  });

  const vehiculosEnParqueadero = controlesSalida.filter(c => c.estado === 'en_parqueadero');
  const vehiculosSalidos = controlesSalida.filter(c => c.estado === 'finalizado');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Control de Entrada y Salida</h1>
          <p className="text-gray-600 mt-1">Registra entradas y salidas de vehículos</p>
        </div>
        <Button onClick={handleOpenDialog} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Registrar Entrada
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              En Parqueadero
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <LogIn className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{vehiculosEnParqueadero.length}</p>
                <p className="text-xs text-gray-500">Vehículos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Salidas Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <LogOutIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{vehiculosSalidos.length}</p>
                <p className="text-xs text-gray-500">Registros completados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Registros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ArrowLeftRight className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{controlesSalida.length}</p>
                <p className="text-xs text-gray-500">Movimientos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por placa, celda o conductor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar vehículo específico por placa..."
                value={searchVehiculo}
                onChange={(e) => setSearchVehiculo(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Entradas y Salidas ({filteredControles.length})</CardTitle>
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
                  <TableHead>Fecha Entrada</TableHead>
                  <TableHead>Fecha Salida</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredControles.map((control) => {
                  const vehiculo = getVehiculo(control.vehiculoId);
                  const celda = getCelda(control.celdaId);
                  const usuario = getUsuarioConductor(control.vehiculoId);
                  const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;
                  
                  return (
                    <TableRow key={control.id}>
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
                      <TableCell className="text-sm">
                        {new Date(control.fechaEntrada).toLocaleString('es-CO')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {control.fechaSalida 
                          ? new Date(control.fechaSalida).toLocaleString('es-CO')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={control.estado === 'en_parqueadero' ? 'default' : 'secondary'}>
                          {control.estado === 'en_parqueadero' ? 'En parqueadero' : 'Finalizado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {control.estado === 'en_parqueadero' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegistrarSalida(control.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <LogOutIcon className="h-4 w-4 mr-1" />
                              Registrar Salida
                            </Button>
                          )}
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

      {/* Dialog Registrar Entrada */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Entrada de Vehículo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="vehiculoId">Seleccionar Vehículo</Label>
                <Select
                  value={formData.vehiculoId}
                  onValueChange={(value) => setFormData({ ...formData, vehiculoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Buscar y seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculos.map((v) => {
                      const conductor = conductores.find(c => c.id === v.conductorId);
                      const usuario = conductor ? usuarios.find(u => u.id === conductor.usuarioId) : null;
                      return (
                        <SelectItem key={v.id} value={v.id}>
                          {v.placa} - {v.marca} {v.modelo} ({usuario?.nombre})
                        </SelectItem>
                      );
                    })}
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
                    <SelectValue placeholder="Seleccionar celda disponible" />
                  </SelectTrigger>
                  <SelectContent>
                    {celdasDisponibles.map((c) => {
                      const parq = getParqueadero(c.parqueaderoId);
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          {c.numero} - {parq?.nombre} ({c.tipo})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaEntrada">Fecha y Hora de Entrada</Label>
                <Input
                  id="fechaEntrada"
                  type="datetime-local"
                  value={formData.fechaEntrada}
                  onChange={(e) => setFormData({ ...formData, fechaEntrada: e.target.value })}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Registrar Entrada
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
