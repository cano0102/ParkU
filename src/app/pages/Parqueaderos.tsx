import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Eye, ParkingCircle, MapPin, Search, Grid3x3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData, Parqueadero } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { Textarea } from '../components/ui/textarea';
import { useNavigate } from 'react-router';

export function Parqueaderos() {
  const navigate = useNavigate();
  const { parqueaderos, addParqueadero, updateParqueadero, deleteParqueadero, celdas } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingParqueadero, setEditingParqueadero] = useState<Parqueadero | null>(null);
  const [viewingParqueadero, setViewingParqueadero] = useState<Parqueadero | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    capacidad: 0,
    horaInicio: '06:00',
    horaFin: '22:00',
    celdasCarros: 0,
    celdasMotos: 0,
    celdasMovilidadReducida: 0,
    descripcion: '',
    estado: 'activo' as 'activo' | 'inactivo'
  });

  const handleOpenDialog = (parqueadero?: Parqueadero) => {
    if (parqueadero) {
      setEditingParqueadero(parqueadero);
      setFormData({
        nombre: parqueadero.nombre,
        direccion: parqueadero.direccion,
        capacidad: parqueadero.capacidad,
        horaInicio: parqueadero.horaInicio,
        horaFin: parqueadero.horaFin,
        celdasCarros: parqueadero.celdasCarros,
        celdasMotos: parqueadero.celdasMotos,
        celdasMovilidadReducida: parqueadero.celdasMovilidadReducida,
        descripcion: parqueadero.descripcion,
        estado: parqueadero.estado
      });
    } else {
      setEditingParqueadero(null);
      setFormData({
        nombre: '',
        direccion: '',
        capacidad: 0,
        horaInicio: '06:00',
        horaFin: '22:00',
        celdasCarros: 0,
        celdasMotos: 0,
        celdasMovilidadReducida: 0,
        descripcion: '',
        estado: 'activo'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalCeldas = formData.celdasCarros + formData.celdasMotos + formData.celdasMovilidadReducida;

    if (totalCeldas === 0) {
      toast.error('Debe crear al menos una celda');
      return;
    }

    if (editingParqueadero) {
      updateParqueadero(editingParqueadero.id, { ...formData, capacidad: totalCeldas });
      toast.success('Parqueadero actualizado correctamente');
    } else {
      addParqueadero({ ...formData, capacidad: totalCeldas });
      toast.success(`Parqueadero creado correctamente con ${totalCeldas} celdas`);
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este parqueadero?')) {
      deleteParqueadero(id);
      toast.success('Parqueadero eliminado exitosamente');
    }
  };

  const handleChangeEstado = (id: string, nuevoEstado: 'activo' | 'inactivo') => {
    updateParqueadero(id, { estado: nuevoEstado });
    toast.success(`Parqueadero ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
  };

  const handleViewParqueadero = (parqueadero: Parqueadero) => {
    setViewingParqueadero(parqueadero);
    setViewDialogOpen(true);
  };

  const getCeldasParqueadero = (parqueaderoId: string) => {
    return celdas.filter(c => c.parqueaderoId === parqueaderoId);
  };

  const filteredParqueaderos = parqueaderos.filter(parqueadero =>
    parqueadero.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Parqueaderos</h1>
          <p className="text-sm text-gray-600 mt-1">Administra los parqueaderos del campus</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Parqueadero
        </Button>
      </div>

      {/* Búsqueda */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar parqueadero por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Lista de Parqueaderos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredParqueaderos.map((parqueadero) => {
          const celdasParq = getCeldasParqueadero(parqueadero.id);
          const celdasOcupadas = celdasParq.filter(c => c.estado === 'ocupada').length;
          const ocupacion = celdasParq.length > 0 ? (celdasOcupadas / celdasParq.length) * 100 : 0;

          return (
            <Card key={parqueadero.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <ParkingCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{parqueadero.nombre}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-500">{parqueadero.direccion}</p>
                      </div>
                    </div>
                  </div>
                  <Badge variant={parqueadero.estado === 'activo' ? 'default' : 'secondary'}>
                    {parqueadero.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Estadísticas */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{celdasParq.length}</p>
                      <p className="text-xs text-gray-500">Total Celdas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{celdasOcupadas}</p>
                      <p className="text-xs text-gray-500">Ocupadas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{ocupacion.toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">Ocupación</p>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Celdas Carros</p>
                      <p className="font-medium">{parqueadero.celdasCarros}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Celdas Motos</p>
                      <p className="font-medium">{parqueadero.celdasMotos}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Movilidad Reducida</p>
                      <p className="font-medium">{parqueadero.celdasMovilidadReducida}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Horario</p>
                      <p className="font-medium text-xs">{parqueadero.horaInicio} - {parqueadero.horaFin}</p>
                    </div>
                  </div>

                  {/* Estado Switch */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="text-sm text-gray-500">Estado:</span>
                    <Switch
                      checked={parqueadero.estado === 'activo'}
                      onCheckedChange={(checked) => 
                        handleChangeEstado(parqueadero.id, checked ? 'activo' : 'inactivo')
                      }
                    />
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      onClick={() => navigate(`/app/celdas?parqueadero=${parqueadero.id}`)}
                    >
                      <Grid3x3 className="h-4 w-4 mr-1" />
                      Celdas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewParqueadero(parqueadero)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenDialog(parqueadero)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(parqueadero.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingParqueadero ? 'Editar Parqueadero' : 'Registrar Nuevo Parqueadero'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="nombre">Nombre del Parqueadero</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Parqueadero Central"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Ej: Calle 100 # 50-30"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-semibold">Configuración de Celdas</Label>
                <p className="text-xs text-gray-500">Define la cantidad de celdas que se crearán automáticamente</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="celdasCarros">Celdas para Carros</Label>
                <Input
                  id="celdasCarros"
                  type="number"
                  value={formData.celdasCarros}
                  onChange={(e) => setFormData({ ...formData, celdasCarros: parseInt(e.target.value) || 0 })}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="celdasMotos">Celdas para Motos</Label>
                <Input
                  id="celdasMotos"
                  type="number"
                  value={formData.celdasMotos}
                  onChange={(e) => setFormData({ ...formData, celdasMotos: parseInt(e.target.value) || 0 })}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="celdasMovilidadReducida">Celdas de Movilidad Reducida</Label>
                <Input
                  id="celdasMovilidadReducida"
                  type="number"
                  value={formData.celdasMovilidadReducida}
                  onChange={(e) => setFormData({ ...formData, celdasMovilidadReducida: parseInt(e.target.value) || 0 })}
                  min="0"
                  required
                />
              </div>

              <div className="col-span-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Total de celdas: </span>
                  {formData.celdasCarros + formData.celdasMotos + formData.celdasMovilidadReducida}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora de Inicio</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaFin">Hora de Cierre</Label>
                <Input
                  id="horaFin"
                  type="time"
                  value={formData.horaFin}
                  onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción del parqueadero"
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
                {editingParqueadero ? 'Actualizar' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Ver Detalle */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle del Parqueadero</DialogTitle>
          </DialogHeader>
          {viewingParqueadero && (() => {
            const celdasParq = getCeldasParqueadero(viewingParqueadero.id);
            const celdasOcupadas = celdasParq.filter(c => c.estado === 'ocupada').length;
            
            return (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <ParkingCircle className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{viewingParqueadero.nombre}</h3>
                    <Badge variant={viewingParqueadero.estado === 'activo' ? 'default' : 'secondary'}>
                      {viewingParqueadero.estado}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-500">Dirección</Label>
                    <p className="text-gray-900">{viewingParqueadero.direccion}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-gray-500 text-xs">Celdas Carros</Label>
                      <p className="text-gray-900 font-medium">{viewingParqueadero.celdasCarros}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Celdas Motos</Label>
                      <p className="text-gray-900 font-medium">{viewingParqueadero.celdasMotos}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500 text-xs">Movilidad Reducida</Label>
                      <p className="text-gray-900 font-medium">{viewingParqueadero.celdasMovilidadReducida}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-500">Horario de Operación</Label>
                    <p className="text-gray-900 font-medium">
                      {viewingParqueadero.horaInicio} - {viewingParqueadero.horaFin}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Ocupación Actual</Label>
                    <p className="text-gray-900 font-medium">
                      {celdasOcupadas} / {celdasParq.length} celdas ocupadas
                    </p>
                  </div>
                  {viewingParqueadero.descripcion && (
                    <div>
                      <Label className="text-gray-500">Descripción</Label>
                      <p className="text-gray-900">{viewingParqueadero.descripcion}</p>
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