import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  MapPin,
  Car,
  User,
  Clock,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
      asignadoA: 'Juan Pérez',
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
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'pendiente' | 'resuelto'>('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedIncidente, setSelectedIncidente] = useState<Incidente | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    descripcion: '',
    parqueadero: '',
    vehiculo: '',
    evidencia: '',
    asignadoA: '',
  });

  const resetForm = () => {
    setFormData({ descripcion: '', parqueadero: '', vehiculo: '', evidencia: '', asignadoA: '' });
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
      setIncidentes(incidentes.map((inc) =>
        inc.id === selectedIncidente.id ? { ...inc, ...formData } : inc,
      ));
      toast.success('Incidente actualizado correctamente');
    } else {
      const nuevo: Incidente = {
        id: Date.now().toString(),
        ...formData,
        vehiculo: formData.vehiculo || undefined,
        evidencia: formData.evidencia || undefined,
        asignadoA: formData.asignadoA || undefined,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
      };
      setIncidentes([nuevo, ...incidentes]);
      toast.success('Incidente registrado correctamente');
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (inc: Incidente) => {
    setSelectedIncidente(inc);
    setFormData({
      descripcion: inc.descripcion,
      parqueadero: inc.parqueadero,
      vehiculo: inc.vehiculo || '',
      evidencia: inc.evidencia || '',
      asignadoA: inc.asignadoA || '',
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const toggleEstado = (id: string) => {
    setIncidentes(incidentes.map((inc) =>
      inc.id === id
        ? { ...inc, estado: inc.estado === 'resuelto' ? 'pendiente' : 'resuelto' }
        : inc,
    ));
    toast.success('Estado del incidente actualizado');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, evidencia: reader.result as string });
      };
      reader.readAsDataURL(file);
      toast.success('Evidencia cargada');
    }
  };

  const filteredIncidentes = incidentes.filter((inc) => {
    const matchesSearch =
      inc.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.parqueadero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.vehiculo && inc.vehiculo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEstado = filterEstado === 'todos' ? true : inc.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const pendientes = incidentes.filter((i) => i.estado === 'pendiente').length;
  const resueltos = incidentes.filter((i) => i.estado === 'resuelto').length;

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-7 text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <ShieldAlert className="h-4 w-4" />
              Seguridad operativa
            </div>
            <h1 className="text-4xl font-black leading-none md:text-5xl">
              Incidentes y Novedades
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/85 md:text-base">
              Gestiona y hace seguimiento a los incidentes reportados en el parqueadero institucional.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">Pendientes</div>
              <div className="mt-1 text-3xl font-black">{pendientes}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">Resueltos</div>
              <div className="mt-1 text-3xl font-black">{resueltos}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">Con evidencia</div>
              <div className="mt-1 text-3xl font-black">
                {incidentes.filter((i) => i.evidencia).length}
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">Total</div>
              <div className="mt-1 text-3xl font-black">{incidentes.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP BAR */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Buscar por descripción, parqueadero o vehículo..."
              className="h-11 rounded-xl border-zinc-200 bg-white pl-10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm shadow-sm outline-none"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as any)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="resuelto">Resueltos</option>
          </select>
        </div>

        <Button
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="h-11 rounded-xl bg-[#39A900] px-5 hover:bg-[#2D7D00]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Registrar Incidente
        </Button>
      </div>

      {/* GRID DE INCIDENTES */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        {filteredIncidentes.length === 0 ? (
          <div className="col-span-full">
            <Card className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-400">
                <AlertTriangle className="mb-4 h-12 w-12" />
                <p className="text-sm">No se encontraron incidentes</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredIncidentes.map((incidente) => (
            <Card
              key={incidente.id}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              {/* TOP */}
              <div className="border-b border-zinc-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${
                        incidente.estado === 'resuelto'
                          ? 'bg-[#39A900]/10'
                          : 'bg-amber-50'
                      }`}
                    >
                      {incidente.estado === 'resuelto' ? (
                        <CheckCircle className="h-6 w-6 text-[#39A900]" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-base font-bold text-zinc-900">
                        {incidente.descripcion}
                      </h2>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {incidente.estado === 'resuelto' ? (
                          <Badge className="border-green-200 bg-green-50 text-green-700">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Resuelto
                          </Badge>
                        ) : (
                          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Pendiente
                          </Badge>
                        )}
                        {incidente.evidencia && (
                          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-600">
                            <ImageIcon className="mr-1 h-3 w-3" />
                            Evidencia
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BODY */}
              <CardContent className="space-y-4 p-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    <span>{incidente.parqueadero}</span>
                  </div>
                  {incidente.vehiculo && (
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <Car className="h-4 w-4 text-zinc-400" />
                      <span>{incidente.vehiculo}</span>
                    </div>
                  )}
                  {incidente.asignadoA && (
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <User className="h-4 w-4 text-zinc-400" />
                      <span>{incidente.asignadoA}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(incidente.fecha).toLocaleString('es-CO', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {/* FOOT */}
                <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`estado-${incidente.id}`} className="text-sm text-zinc-500">
                      {incidente.estado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                    </Label>
                    <Switch
                      id={`estado-${incidente.id}`}
                      checked={incidente.estado === 'resuelto'}
                      onCheckedChange={() => toggleEstado(incidente.id)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-zinc-200"
                      onClick={() => {
                        setSelectedIncidente(incidente);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-zinc-200"
                      onClick={() => handleEdit(incidente)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-3xl border-none bg-white p-0">
          <DialogHeader className="border-b border-zinc-100 px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-2xl font-black text-zinc-900">
              <Sparkles className="h-5 w-5 text-[#39A900]" />
              {isEditing ? 'Editar Incidente' : 'Registrar Incidente'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="max-h-[60vh] space-y-5 overflow-y-auto p-6">
              {/* Descripción */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <Label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Descripción *
                </Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe el incidente o novedad..."
                  required
                  rows={3}
                  className="rounded-xl border-zinc-200 bg-white"
                />
              </div>

              {/* Parqueadero + Vehículo */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <Label className="mb-2 block text-sm font-semibold text-zinc-700">
                    Parqueadero *
                  </Label>
                  <Select
                    value={formData.parqueadero}
                    onValueChange={(value) => setFormData({ ...formData, parqueadero: value })}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-white">
                      <SelectValue placeholder="Seleccionar parqueadero" />
                    </SelectTrigger>
                    <SelectContent>
                      {parqueaderos.map((p) => (
                        <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <Label className="mb-2 block text-sm font-semibold text-zinc-700">
                    Vehículo (opcional)
                  </Label>
                  <Select
                    value={formData.vehiculo}
                    onValueChange={(value) => setFormData({ ...formData, vehiculo: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-white">
                      <SelectValue placeholder="Seleccionar vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguno</SelectItem>
                      {vehiculos.map((v) => (
                        <SelectItem key={v.id} value={v.placa}>
                          {v.placa} — {v.marca} {v.modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Asignado */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <Label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Asignar a
                </Label>
                <Input
                  value={formData.asignadoA}
                  onChange={(e) => setFormData({ ...formData, asignadoA: e.target.value })}
                  placeholder="Nombre del responsable"
                  className="h-11 rounded-xl border-zinc-200 bg-white"
                />
              </div>

              {/* Evidencia */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <Label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Evidencia fotográfica
                </Label>
                <div className="overflow-hidden rounded-xl border-2 border-dashed border-zinc-300 bg-white transition-colors hover:border-[#39A900]">
                  <input
                    type="file"
                    id="evidencia"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="evidencia" className="flex cursor-pointer flex-col items-center justify-center p-6">
                    {formData.evidencia ? (
                      <div className="space-y-2 text-center">
                        <img
                          src={formData.evidencia}
                          alt="Evidencia"
                          className="mx-auto max-h-40 rounded-lg"
                        />
                        <p className="text-sm text-[#39A900]">Evidencia cargada ✓</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-center">
                        <Upload className="mx-auto h-10 w-10 text-zinc-300" />
                        <p className="text-sm text-zinc-500">
                          Haz clic para cargar imagen de evidencia
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-zinc-100 bg-zinc-50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-200"
                onClick={() => { setDialogOpen(false); resetForm(); }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#39A900] hover:bg-[#2D7D00]">
                {isEditing ? 'Actualizar Incidente' : 'Registrar Incidente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW DIALOG */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-3xl border-none bg-white p-0">
          {selectedIncidente && (
            <>
              <div
                className={`p-6 text-white ${
                  selectedIncidente.estado === 'resuelto'
                    ? 'bg-gradient-to-r from-[#39A900] to-[#2D7D00]'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                      {selectedIncidente.estado === 'resuelto' ? (
                        <CheckCircle className="h-8 w-8" />
                      ) : (
                        <AlertTriangle className="h-8 w-8" />
                      )}
                    </div>
                    <div>
                      <h2 className="max-w-sm text-xl font-black leading-tight">
                        {selectedIncidente.descripcion}
                      </h2>
                      <Badge className="mt-2 border-white/20 bg-white/15 text-white">
                        {selectedIncidente.estado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Parqueadero
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      {selectedIncidente.parqueadero}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Fecha
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                      <Clock className="h-4 w-4 text-zinc-400" />
                      {new Date(selectedIncidente.fecha).toLocaleString('es-CO', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>

                  {selectedIncidente.vehiculo && (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-500">
                        Vehículo
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        <Car className="h-4 w-4 text-zinc-400" />
                        {selectedIncidente.vehiculo}
                      </div>
                    </div>
                  )}

                  {selectedIncidente.asignadoA && (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-500">
                        Asignado a
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        <User className="h-4 w-4 text-zinc-400" />
                        {selectedIncidente.asignadoA}
                      </div>
                    </div>
                  )}
                </div>

                {selectedIncidente.evidencia && (
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Evidencia fotográfica
                    </div>
                    <img
                      src={selectedIncidente.evidencia}
                      alt="Evidencia"
                      className="w-full rounded-xl border border-zinc-200"
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="border-t border-zinc-100 bg-zinc-50 px-6 py-4">
                <Button
                  variant="outline"
                  className="border-zinc-200"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  className="bg-[#39A900] hover:bg-[#2D7D00]"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEdit(selectedIncidente);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}