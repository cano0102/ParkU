import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Grid3x3, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData, Celda } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function Celdas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const parqueaderoParam = searchParams.get('parqueadero');
  
  const { celdas, addCelda, updateCelda, deleteCelda, parqueaderos } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCelda, setEditingCelda] = useState<Celda | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterParqueadero, setFilterParqueadero] = useState(parqueaderoParam || 'all');
  const [filterEstado, setFilterEstado] = useState('all');
  
  // Actualizar filtro cuando cambie el parámetro
  useEffect(() => {
    if (parqueaderoParam) {
      setFilterParqueadero(parqueaderoParam);
    }
  }, [parqueaderoParam]);
  
  const [formData, setFormData] = useState({
    parqueaderoId: '',
    numero: '',
    tipo: 'carro' as 'carro' | 'moto' | 'movilidad reducida',
    estado: 'disponible' as 'disponible' | 'no_disponible' | 'reservada' | 'mantenimiento',
    ocupada: false
  });

  const handleOpenDialog = (celda?: Celda) => {
    if (celda) {
      setEditingCelda(celda);
      setFormData({
        parqueaderoId: celda.parqueaderoId,
        numero: celda.numero,
        tipo: celda.tipo,
        estado: celda.estado,
        ocupada: celda.ocupada
      });
    } else {
      setEditingCelda(null);
      setFormData({
        parqueaderoId: '',
        numero: '',
        tipo: 'carro',
        estado: 'disponible',
        ocupada: false
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCelda) {
      updateCelda(editingCelda.id, formData);
      toast.success('Celda actualizada exitosamente');
    } else {
      addCelda(formData);
      toast.success('Celda registrada exitosamente');
    }
    
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta celda?')) {
      deleteCelda(id);
      toast.success('Celda eliminada exitosamente');
    }
  };

  const getParqueadero = (parqueaderoId: string) => {
    return parqueaderos.find(p => p.id === parqueaderoId);
  };

  const filteredCeldas = celdas.filter(celda => {
    const matchesSearch = celda.numero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParqueadero = filterParqueadero === 'all' || celda.parqueaderoId === filterParqueadero;
    const matchesEstado = filterEstado === 'all' || celda.estado === filterEstado;
    
    return matchesSearch && matchesParqueadero && matchesEstado;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'bg-green-100 text-green-700 border-green-200';
      case 'no_disponible': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'reservada': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'mantenimiento': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'disponible': return 'Disponible';
      case 'no_disponible': return 'No disponible';
      case 'reservada': return 'Reservada';
      case 'mantenimiento': return 'Mantenimiento';
      default: return estado;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'carro': return '🚗';
      case 'moto': return '🏍️';
      case 'movilidad reducida': return '♿';
      default: return '🚗';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Celdas</h1>
          <p className="text-sm text-gray-600 mt-1">Administra las celdas de los parqueaderos</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Celda
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterParqueadero} onValueChange={setFilterParqueadero}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los parqueaderos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los parqueaderos</SelectItem>
                {parqueaderos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="no_disponible">No disponible</SelectItem>
                <SelectItem value="reservada">Reservada</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Celdas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredCeldas.map((celda) => {
          const parqueadero = getParqueadero(celda.parqueaderoId);
          
          return (
            <Card 
              key={celda.id} 
              className={`cursor-pointer hover:shadow-lg transition-all border-2 ${getEstadoColor(celda.estado)}`}
            >
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="text-3xl">{getTipoIcon(celda.tipo)}</div>
                  <div>
                    <p className="font-bold text-lg">{celda.numero}</p>
                    <p className="text-xs text-gray-600 truncate">{parqueadero?.nombre}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs w-full justify-center ${getEstadoColor(celda.estado)}`}
                  >
                    {getEstadoLabel(celda.estado)}
                  </Badge>
                  <div className="flex gap-1 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8"
                      onClick={() => handleOpenDialog(celda)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(celda.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCeldas.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Grid3x3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No se encontraron celdas</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog Crear/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCelda ? 'Editar Celda' : 'Registrar Nueva Celda'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="parqueaderoId">Parqueadero</Label>
                <Select
                  value={formData.parqueaderoId}
                  onValueChange={(value) => setFormData({ ...formData, parqueaderoId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar parqueadero" />
                  </SelectTrigger>
                  <SelectContent>
                    {parqueaderos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número de Celda</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value.toUpperCase() })}
                  placeholder="Ej: A-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Celda</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: 'carro' | 'moto' | 'movilidad reducida') => 
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carro">🚗 Carro</SelectItem>
                    <SelectItem value="moto">🏍️ Moto</SelectItem>
                    <SelectItem value="movilidad reducida">♿ Movilidad Reducida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value: 'disponible' | 'no_disponible' | 'reservada' | 'mantenimiento') =>
                    setFormData({ ...formData, estado: value, ocupada: value === 'no_disponible' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="no_disponible">No disponible</SelectItem>
                    <SelectItem value="reservada">Reservada</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingCelda ? 'Actualizar' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}