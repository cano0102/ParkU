import React, { useState } from 'react';
import { Plus, Search, Eye, Trash2, Upload, Camera, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { useData } from '../context/DataContext';

type RegistroPlaca = {
  id: string;
  imagen: string;
  placaDetectada: string;
  vehiculo?: string;
  celda?: string;
  fechaEntrada: string;
  fechaSalida?: string;
  estado: 'entrada' | 'salida';
};

export function ReconocimientoPlacas() {
  const { vehiculos, celdas } = useData();
  const [registros, setRegistros] = useState<RegistroPlaca[]>([
    {
      id: '1',
      imagen: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop',
      placaDetectada: 'ABC123',
      vehiculo: 'Toyota Corolla 2020',
      celda: 'A-12',
      fechaEntrada: '2026-04-08T08:30:00',
      estado: 'entrada'
    },
    {
      id: '2',
      imagen: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      placaDetectada: 'XYZ789',
      vehiculo: 'Honda Civic 2019',
      celda: 'B-05',
      fechaEntrada: '2026-04-08T09:15:00',
      fechaSalida: '2026-04-08T14:20:00',
      estado: 'salida'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroPlaca | null>(null);
  
  const [formData, setFormData] = useState({
    imagen: '',
    placaDetectada: '',
    vehiculo: '',
    celda: '',
    estado: 'entrada' as 'entrada' | 'salida'
  });

  const resetForm = () => {
    setFormData({
      imagen: '',
      placaDetectada: '',
      vehiculo: '',
      celda: '',
      estado: 'entrada'
    });
    setSelectedRegistro(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imagenBase64 = reader.result as string;
        setFormData({ 
          ...formData, 
          imagen: imagenBase64,
          // Simular detección de placa
          placaDetectada: simulateOCR()
        });
      };
      reader.readAsDataURL(file);
      toast.success('Imagen procesada - Placa detectada');
    }
  };

  const simulateOCR = (): string => {
    // Simulación de OCR - en producción esto llamaría a una API real
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numeros = '0123456789';
    let placa = '';
    for (let i = 0; i < 3; i++) {
      placa += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    for (let i = 0; i < 3; i++) {
      placa += numeros.charAt(Math.floor(Math.random() * numeros.length));
    }
    return placa;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imagen || !formData.placaDetectada) {
      toast.error('Imagen y placa son obligatorios');
      return;
    }

    const nuevoRegistro: RegistroPlaca = {
      id: Date.now().toString(),
      imagen: formData.imagen,
      placaDetectada: formData.placaDetectada,
      vehiculo: formData.vehiculo || undefined,
      celda: formData.celda || undefined,
      fechaEntrada: new Date().toISOString(),
      fechaSalida: formData.estado === 'salida' ? new Date().toISOString() : undefined,
      estado: formData.estado
    };

    setRegistros([nuevoRegistro, ...registros]);
    toast.success(`Registro de ${formData.estado} creado exitosamente`);
    setDialogOpen(false);
    resetForm();
  };

  const handleView = (registro: RegistroPlaca) => {
    setSelectedRegistro(registro);
    setViewDialogOpen(true);
  };

  const confirmDelete = (registro: RegistroPlaca) => {
    setSelectedRegistro(registro);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (selectedRegistro) {
      setRegistros(registros.filter(r => r.id !== selectedRegistro.id));
      toast.success('Registro de entrada y salida eliminado');
      setDeleteDialogOpen(false);
      setSelectedRegistro(null);
    }
  };

  const filteredRegistros = registros.filter(reg =>
    reg.placaDetectada.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (reg.vehiculo && reg.vehiculo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (reg.celda && reg.celda.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reconocimiento de Placas</h1>
          <p className="text-gray-600 mt-1">Registro automático mediante OCR</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Camera className="h-4 w-4 mr-2" />
              Nuevo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar con Reconocimiento de Placa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imagen">Imagen del Vehículo *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    id="imagen"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="imagen" className="cursor-pointer">
                    {formData.imagen ? (
                      <div className="space-y-3">
                        <img 
                          src={formData.imagen} 
                          alt="Vehículo" 
                          className="max-h-48 mx-auto rounded-lg border-2 border-green-200"
                        />
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-green-800">
                            Placa detectada: <span className="text-2xl font-bold">{formData.placaDetectada}</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="h-12 w-12 mx-auto text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Click para cargar imagen del vehículo
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            La placa será detectada automáticamente
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {formData.imagen && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="placaDetectada">Placa Detectada *</Label>
                    <Input
                      id="placaDetectada"
                      value={formData.placaDetectada}
                      onChange={(e) => setFormData({ ...formData, placaDetectada: e.target.value.toUpperCase() })}
                      placeholder="ABC123"
                      required
                      className="font-mono text-lg"
                    />
                    <p className="text-xs text-gray-500">Puedes corregir la placa si es necesario</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehiculo">Vehículo</Label>
                      <Select
                        value={formData.vehiculo}
                        onValueChange={(value) => setFormData({ ...formData, vehiculo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar vehículo" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehiculos.map(v => (
                            <SelectItem key={v.id} value={`${v.marca} ${v.modelo} ${v.año}`}>
                              {v.placa} - {v.marca} {v.modelo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="celda">Celda</Label>
                      <Select
                        value={formData.celda}
                        onValueChange={(value) => setFormData({ ...formData, celda: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar celda" />
                        </SelectTrigger>
                        <SelectContent>
                          {celdas.filter(c => c.estado === 'disponible').map(c => (
                            <SelectItem key={c.id} value={c.numero}>
                              {c.numero} - {c.tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Tipo de Registro</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value: 'entrada' | 'salida') => setFormData({ ...formData, estado: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entrada">Entrada</SelectItem>
                        <SelectItem value="salida">Salida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

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
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!formData.imagen}
                >
                  Registrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Información del sistema */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sistema de Reconocimiento Óptico de Caracteres (OCR)</p>
            <p>Este módulo utiliza tecnología de visión artificial para detectar automáticamente las placas vehiculares.</p>
          </div>
        </div>
      </Card>

      {/* Búsqueda */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por placa, vehículo o celda..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Lista de Registros */}
      <div className="grid gap-4">
        {filteredRegistros.length === 0 ? (
          <Card className="p-12 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron registros</p>
          </Card>
        ) : (
          filteredRegistros.map((registro) => (
            <Card key={registro.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row">
                {/* Imagen */}
                <div className="w-full sm:w-48 h-48 sm:h-auto bg-gray-100 flex-shrink-0">
                  <img 
                    src={registro.imagen} 
                    alt={`Placa ${registro.placaDetectada}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Contenido */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold font-mono text-gray-900">
                          {registro.placaDetectada}
                        </h3>
                        <Badge variant={registro.estado === 'entrada' ? 'default' : 'secondary'}>
                          {registro.estado === 'entrada' ? 'Entrada' : 'Salida'}
                        </Badge>
                      </div>
                      {registro.vehiculo && (
                        <p className="text-gray-600">{registro.vehiculo}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {registro.celda && (
                      <div>
                        <p className="text-gray-500">Celda</p>
                        <p className="font-medium">{registro.celda}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500">Fecha de Entrada</p>
                      <p className="font-medium">
                        {new Date(registro.fechaEntrada).toLocaleString('es-CO', {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                    {registro.fechaSalida && (
                      <div>
                        <p className="text-gray-500">Fecha de Salida</p>
                        <p className="font-medium">
                          {new Date(registro.fechaSalida).toLocaleString('es-CO', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(registro)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => confirmDelete(registro)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Visualización */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle del Registro</DialogTitle>
          </DialogHeader>
          {selectedRegistro && (
            <div className="space-y-4">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={selectedRegistro.imagen} 
                  alt={`Placa ${selectedRegistro.placaDetectada}`}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Placa Detectada</p>
                  <p className="text-2xl font-bold font-mono">{selectedRegistro.placaDetectada}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <Badge variant={selectedRegistro.estado === 'entrada' ? 'default' : 'secondary'}>
                    {selectedRegistro.estado === 'entrada' ? 'Entrada' : 'Salida'}
                  </Badge>
                </div>
                {selectedRegistro.vehiculo && (
                  <div>
                    <p className="text-sm text-gray-500">Vehículo</p>
                    <p className="font-medium">{selectedRegistro.vehiculo}</p>
                  </div>
                )}
                {selectedRegistro.celda && (
                  <div>
                    <p className="text-sm text-gray-500">Celda Asignada</p>
                    <p className="font-medium">{selectedRegistro.celda}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Fecha de Entrada</p>
                  <p className="font-medium">
                    {new Date(selectedRegistro.fechaEntrada).toLocaleString('es-CO', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
                {selectedRegistro.fechaSalida && (
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Salida</p>
                    <p className="font-medium">
                      {new Date(selectedRegistro.fechaSalida).toLocaleString('es-CO', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de Confirmación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el registro de entrada y salida del vehículo con placa{' '}
              <strong>{selectedRegistro?.placaDetectada}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
