import React, { useState } from 'react';
import { Plus, Search, Edit, Eye, AlertTriangle, CheckCircle, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { useData } from '../context/DataContext';

type Incidente = {
  id: string;
  descripcion: string;
  parqueadero: string;
  vehiculo?: string;
  evidencia?: string;
  fecha: string;
  estado: 'resuelto' | 'pendiente';
  asignadoA?: string;
};

export function Incidentes() {
  const { parqueaderos, vehiculos } = useData();
  const [incidentes, setIncidentes] = useState<Incidente[]>([
    {
      id: '1',
      descripcion: 'Vehículo mal estacionado bloqueando entrada',
      parqueadero: 'Parqueadero Principal',
      vehiculo: 'ABC123',
      fecha: '2026-04-08T10:30:00',
      estado: 'pendiente',
      asignadoA: 'Juan Pérez'
    },
    {
      id: '2',
      descripcion: 'Luminaria averiada en zona norte',
      parqueadero: 'Parqueadero Norte',
      fecha: '2026-04-07T14:20:00',
      estado: 'resuelto',
    },
    {
      id: '3',
      descripcion: 'Derrame de aceite en celda B-15',
      parqueadero: 'Parqueadero Principal',
      vehiculo: 'XYZ789',
      fecha: '2026-04-06T16:45:00',
      estado: 'pendiente',
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedIncidente, setSelectedIncidente] = useState<Incidente | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    descripcion: '',
    parqueadero: '',
    vehiculo: '',
    evidencia: '',
    asignadoA: ''
  });

  const resetForm = () => {
    setFormData({
      descripcion: '',
      parqueadero: '',
      vehiculo: '',
      evidencia: '',
      asignadoA: ''
    });
    setIsEditing(false);
    setSelectedIncidente(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descripcion || !formData.parqueadero) {
      toast.error('Descripción y Parqueadero son obligatorios');
      return;
    }

    if (isEditing && selectedIncidente) {
      setIncidentes(incidentes.map(inc => 
        inc.id === selectedIncidente.id 
          ? { ...inc, ...formData }
          : inc
      ));
      toast.success('Incidente actualizado exitosamente');
    } else {
      const nuevoIncidente: Incidente = {
        id: Date.now().toString(),
        ...formData,
        vehiculo: formData.vehiculo || undefined,
        evidencia: formData.evidencia || undefined,
        asignadoA: formData.asignadoA || undefined,
        fecha: new Date().toISOString(),
        estado: 'pendiente'
      };
      setIncidentes([nuevoIncidente, ...incidentes]);
      toast.success('Incidente registrado exitosamente');
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (incidente: Incidente) => {
    setSelectedIncidente(incidente);
    setFormData({
      descripcion: incidente.descripcion,
      parqueadero: incidente.parqueadero,
      vehiculo: incidente.vehiculo || '',
      evidencia: incidente.evidencia || '',
      asignadoA: incidente.asignadoA || ''
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleView = (incidente: Incidente) => {
    setSelectedIncidente(incidente);
    setViewDialogOpen(true);
  };

  const toggleEstado = (id: string) => {
    setIncidentes(incidentes.map(inc => 
      inc.id === id 
        ? { ...inc, estado: inc.estado === 'resuelto' ? 'pendiente' : 'resuelto' }
        : inc
    ));
    toast.success('Estado del incidente actualizado');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // En producción, aquí subirías el archivo a un servidor
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, evidencia: reader.result as string });
      };
      reader.readAsDataURL(file);
      toast.success('Evidencia cargada');
    }
  };

  const filteredIncidentes = incidentes.filter(inc =>
    inc.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.parqueadero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inc.vehiculo && inc.vehiculo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incidentes y Novedades</h1>
          <p className="text-gray-600 mt-1">Gestión de incidentes del parqueadero</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Incidente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Editar Incidente' : 'Registrar Nuevo Incidente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe el incidente o novedad..."
                  required
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parqueadero">Parqueadero *</Label>
                  <Select
                    value={formData.parqueadero}
                    onValueChange={(value) => setFormData({ ...formData, parqueadero: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar parqueadero" />
                    </SelectTrigger>
                    <SelectContent>
                      {parqueaderos.map(p => (
                        <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehiculo">Vehículo (Opcional)</Label>
                  <Select
                    value={formData.vehiculo}
                    onValueChange={(value) => setFormData({ ...formData, vehiculo: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      {vehiculos.map(v => (
                        <SelectItem key={v.id} value={v.placa}>
                          {v.placa} - {v.marca} {v.modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asignadoA">Asignar a</Label>
                <Input
                  id="asignadoA"
                  value={formData.asignadoA}
                  onChange={(e) => setFormData({ ...formData, asignadoA: e.target.value })}
                  placeholder="Nombre del responsable"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidencia">Evidencia (Imagen)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    id="evidencia"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="evidencia" className="cursor-pointer">
                    {formData.evidencia ? (
                      <div className="space-y-2">
                        <img 
                          src={formData.evidencia} 
                          alt="Evidencia" 
                          className="max-h-40 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-green-600">Evidencia cargada ✓</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 mx-auto text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click para cargar imagen de evidencia
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {isEditing ? 'Actualizar' : 'Registrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Búsqueda */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por descripción, parqueadero o vehículo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Lista de Incidentes */}
      <div className="grid gap-4">
        {filteredIncidentes.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron incidentes</p>
          </Card>
        ) : (
          filteredIncidentes.map((incidente) => (
            <Card key={incidente.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${incidente.estado === 'resuelto' ? 'text-green-600' : 'text-amber-600'}`}>
                      {incidente.estado === 'resuelto' ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <AlertTriangle className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{incidente.descripcion}</h3>
                        <Badge variant={incidente.estado === 'resuelto' ? 'default' : 'secondary'}>
                          {incidente.estado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Parqueadero:</span> {incidente.parqueadero}
                        </p>
                        {incidente.vehiculo && (
                          <p>
                            <span className="font-medium">Vehículo:</span> {incidente.vehiculo}
                          </p>
                        )}
                        {incidente.asignadoA && (
                          <p>
                            <span className="font-medium">Asignado a:</span> {incidente.asignadoA}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Fecha:</span>{' '}
                          {new Date(incidente.fecha).toLocaleString('es-CO', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                        {incidente.evidencia && (
                          <div className="flex items-center gap-1 text-green-600">
                            <ImageIcon className="h-4 w-4" />
                            <span>Tiene evidencia fotográfica</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`estado-${incidente.id}`} className="text-sm">
                      {incidente.estado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                    </Label>
                    <Switch
                      id={`estado-${incidente.id}`}
                      checked={incidente.estado === 'resuelto'}
                      onCheckedChange={() => toggleEstado(incidente.id)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(incidente)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(incidente)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Visualización */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Incidente</DialogTitle>
          </DialogHeader>
          {selectedIncidente && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={selectedIncidente.estado === 'resuelto' ? 'text-green-600' : 'text-amber-600'}>
                  {selectedIncidente.estado === 'resuelto' ? (
                    <CheckCircle className="h-8 w-8" />
                  ) : (
                    <AlertTriangle className="h-8 w-8" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedIncidente.descripcion}</h3>
                  <Badge variant={selectedIncidente.estado === 'resuelto' ? 'default' : 'secondary'}>
                    {selectedIncidente.estado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y">
                <div>
                  <p className="text-sm text-gray-500">Parqueadero</p>
                  <p className="font-medium">{selectedIncidente.parqueadero}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">
                    {new Date(selectedIncidente.fecha).toLocaleString('es-CO', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
                {selectedIncidente.vehiculo && (
                  <div>
                    <p className="text-sm text-gray-500">Vehículo</p>
                    <p className="font-medium">{selectedIncidente.vehiculo}</p>
                  </div>
                )}
                {selectedIncidente.asignadoA && (
                  <div>
                    <p className="text-sm text-gray-500">Asignado a</p>
                    <p className="font-medium">{selectedIncidente.asignadoA}</p>
                  </div>
                )}
              </div>

              {selectedIncidente.evidencia && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Evidencia Fotográfica</p>
                  <img 
                    src={selectedIncidente.evidencia} 
                    alt="Evidencia" 
                    className="w-full rounded-lg border"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}