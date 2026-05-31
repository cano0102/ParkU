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
  Filter,
  X,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '../components/ui/sheet';
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
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
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
  const conEvidencia = incidentes.filter((i) => i.evidencia).length;

  // Reutilizable: formulario interno para Dialog y Sheet
  const FormularioIncidente = () => (
    <div className="space-y-4 sm:space-y-5">
      {/* Descripción */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
        <Label className="mb-2 block text-sm font-semibold text-zinc-700">
          Descripción *
        </Label>
        <Textarea
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Describe el incidente o novedad..."
          required
          rows={3}
          className="rounded-xl border-zinc-200 bg-white text-sm"
        />
      </div>

      {/* Parqueadero + Vehículo */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
          <Label className="mb-2 block text-sm font-semibold text-zinc-700">
            Parqueadero *
          </Label>
          <Select
            value={formData.parqueadero}
            onValueChange={(value) => setFormData({ ...formData, parqueadero: value })}
          >
            <SelectTrigger className="h-10 sm:h-11 rounded-xl border-zinc-200 bg-white text-sm">
              <SelectValue placeholder="Seleccionar parqueadero" />
            </SelectTrigger>
            <SelectContent>
              {parqueaderos.map((p) => (
                <SelectItem key={p.id} value={p.nombre}>{p.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
          <Label className="mb-2 block text-sm font-semibold text-zinc-700">
            Vehículo (opcional)
          </Label>
          <Select
            value={formData.vehiculo}
            onValueChange={(value) => setFormData({ ...formData, vehiculo: value === 'none' ? '' : value })}
          >
            <SelectTrigger className="h-10 sm:h-11 rounded-xl border-zinc-200 bg-white text-sm">
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
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
        <Label className="mb-2 block text-sm font-semibold text-zinc-700">
          Asignar a
        </Label>
        <Input
          value={formData.asignadoA}
          onChange={(e) => setFormData({ ...formData, asignadoA: e.target.value })}
          placeholder="Nombre del responsable"
          className="h-10 sm:h-11 rounded-xl border-zinc-200 bg-white text-sm"
        />
      </div>

      {/* Evidencia */}
      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
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
          <label htmlFor="evidencia" className="flex cursor-pointer flex-col items-center justify-center p-4 sm:p-6">
            {formData.evidencia ? (
              <div className="space-y-2 text-center">
                <img
                  src={formData.evidencia}
                  alt="Evidencia"
                  className="mx-auto max-h-32 sm:max-h-40 rounded-lg"
                />
                <p className="text-sm text-[#39A900]">Evidencia cargada ✓</p>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <Upload className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-zinc-300" />
                <p className="text-xs sm:text-sm text-zinc-500">
                  Toca para cargar imagen de evidencia
                </p>
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[28px] bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-4 sm:p-7 text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold backdrop-blur">
              <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Seguridad operativa
            </div>
            <h1 className="text-2xl font-black leading-none sm:text-4xl md:text-5xl">
              Incidentes y Novedades
            </h1>
            <p className="mt-2 sm:mt-4 max-w-2xl text-xs sm:text-sm text-white/85 md:text-base">
              Gestiona y haz seguimiento a los incidentes reportados en el parqueadero institucional.
            </p>
          </div>

          {/* Estadísticas: 2 cols en móvil, 2x2 en lg */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:w-[340px]">
            {[
              { label: 'Pendientes', value: pendientes },
              { label: 'Resueltos', value: resueltos },
              { label: 'Con evidencia', value: conEvidencia },
              { label: 'Total', value: incidentes.length },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl sm:rounded-2xl bg-white/10 p-3 sm:p-4 backdrop-blur">
                <div className="text-[10px] sm:text-xs text-white/70">{label}</div>
                <div className="mt-0.5 sm:mt-1 text-2xl sm:text-3xl font-black">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOP BAR ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Búsqueda + filtro */}
        <div className="flex flex-1 gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Buscar incidente..."
              className="h-10 sm:h-11 rounded-xl border-zinc-200 bg-white pl-10 shadow-sm text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filtro: select en desktop, botón sheet en móvil */}
          <div className="hidden sm:block">
            <select
              className="h-10 sm:h-11 rounded-xl border border-zinc-200 bg-white px-3 sm:px-4 text-sm shadow-sm outline-none cursor-pointer"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as any)}
            >
              <option value="todos">Todos</option>
              <option value="pendiente">Pendientes</option>
              <option value="resuelto">Resueltos</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="sm:hidden h-10 w-10 rounded-xl border-zinc-200 flex-shrink-0 relative"
            onClick={() => setFilterSheetOpen(true)}
          >
            <Filter className="h-4 w-4" />
            {filterEstado !== 'todos' && (
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#39A900]" />
            )}
          </Button>
        </div>

        <Button
          onClick={() => { resetForm(); setDialogOpen(true); }}
          className="h-10 sm:h-11 w-full sm:w-auto rounded-xl bg-[#39A900] px-4 sm:px-5 hover:bg-[#2D7D00] text-sm font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Registrar Incidente
        </Button>
      </div>

      {/* Chip de filtro activo (móvil) */}
      {filterEstado !== 'todos' && (
        <div className="flex sm:hidden">
          <button
            onClick={() => setFilterEstado('todos')}
            className="flex items-center gap-1.5 rounded-full bg-[#39A900]/10 px-3 py-1 text-xs font-semibold text-[#39A900]"
          >
            {filterEstado === 'pendiente' ? 'Pendientes' : 'Resueltos'}
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* ── GRID DE INCIDENTES ── */}
      <div className="grid grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
        {filteredIncidentes.length === 0 ? (
          <div className="col-span-full">
            <Card className="overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 text-zinc-400">
                <AlertTriangle className="mb-4 h-10 w-10 sm:h-12 sm:w-12" />
                <p className="text-sm">No se encontraron incidentes</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredIncidentes.map((incidente) => (
            <Card
              key={incidente.id}
              className="overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]"
            >
              {/* TOP */}
              <div className="border-b border-zinc-100 p-4 sm:p-5">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`flex h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl ${
                      incidente.estado === 'resuelto' ? 'bg-[#39A900]/10' : 'bg-amber-50'
                    }`}
                  >
                    {incidente.estado === 'resuelto' ? (
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#39A900]" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 text-sm sm:text-base font-bold text-zinc-900">
                      {incidente.descripcion}
                    </h2>
                    <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                      {incidente.estado === 'resuelto' ? (
                        <Badge className="border-green-200 bg-green-50 text-green-700 text-[10px] sm:text-xs px-2 py-0.5">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Resuelto
                        </Badge>
                      ) : (
                        <Badge className="border-amber-200 bg-amber-50 text-amber-700 text-[10px] sm:text-xs px-2 py-0.5">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Pendiente
                        </Badge>
                      )}
                      {incidente.evidencia && (
                        <Badge className="border-zinc-200 bg-zinc-50 text-zinc-600 text-[10px] sm:text-xs px-2 py-0.5">
                          <ImageIcon className="mr-1 h-3 w-3" />
                          Evidencia
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BODY */}
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-zinc-400" />
                    <span className="truncate">{incidente.parqueadero}</span>
                  </div>
                  {incidente.vehiculo && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600">
                      <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-zinc-400" />
                      <span className="truncate">{incidente.vehiculo}</span>
                    </div>
                  )}
                  {incidente.asignadoA && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-600">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-zinc-400" />
                      <span className="truncate">{incidente.asignadoA}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>
                      {new Date(incidente.fecha).toLocaleString('es-CO', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                </div>

                {/* FOOT */}
                <div className="flex items-center justify-between border-t border-zinc-100 pt-3 sm:pt-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`estado-${incidente.id}`} className="text-xs sm:text-sm text-zinc-500 cursor-pointer">
                      {incidente.estado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                    </Label>
                    <Switch
                      id={`estado-${incidente.id}`}
                      checked={incidente.estado === 'resuelto'}
                      onCheckedChange={() => toggleEstado(incidente.id)}
                    />
                  </div>

                  <div className="flex gap-1.5 sm:gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 sm:h-9 sm:w-9 border-zinc-200 rounded-lg sm:rounded-xl"
                      onClick={() => {
                        setSelectedIncidente(incidente);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 sm:h-9 sm:w-9 border-zinc-200 rounded-lg sm:rounded-xl"
                      onClick={() => handleEdit(incidente)}
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── FILTRO SHEET (móvil) ── */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl pb-8">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-lg font-black">Filtrar incidentes</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2">
            {(['todos', 'pendiente', 'resuelto'] as const).map((opcion) => (
              <button
                key={opcion}
                onClick={() => { setFilterEstado(opcion); setFilterSheetOpen(false); }}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition-all ${
                  filterEstado === opcion
                    ? 'border-[#39A900] bg-[#39A900]/10 text-[#39A900]'
                    : 'border-zinc-200 bg-white text-zinc-600'
                }`}
              >
                {opcion === 'todos' ? 'Todos' : opcion === 'pendiente' ? 'Pendientes' : 'Resueltos'}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── CREATE / EDIT DIALOG ── */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl border-none bg-white p-0 mx-3 sm:mx-auto">
          <DialogHeader className="border-b border-zinc-100 px-4 sm:px-6 py-4 sm:py-5">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl font-black text-zinc-900">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-[#39A900]" />
              {isEditing ? 'Editar Incidente' : 'Registrar Incidente'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="max-h-[65vh] sm:max-h-[60vh] space-y-4 sm:space-y-5 overflow-y-auto p-4 sm:p-6">
              <FormularioIncidente />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 border-t border-zinc-100 bg-zinc-50 px-4 sm:px-6 py-3 sm:py-4">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto border-zinc-200 h-10"
                onClick={() => { setDialogOpen(false); resetForm(); }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto bg-[#39A900] hover:bg-[#2D7D00] h-10">
                {isEditing ? 'Actualizar Incidente' : 'Registrar Incidente'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── VIEW DIALOG ── */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="w-[calc(100vw-24px)] max-w-2xl overflow-hidden rounded-2xl sm:rounded-3xl border-none bg-white p-0 mx-3 sm:mx-auto">
          {selectedIncidente && (
            <>
              <div
                className={`p-4 sm:p-6 text-white ${
                  selectedIncidente.estado === 'resuelto'
                    ? 'bg-gradient-to-r from-[#39A900] to-[#2D7D00]'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur">
                    {selectedIncidente.estado === 'resuelto' ? (
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-xl font-black leading-tight">
                      {selectedIncidente.descripcion}
                    </h2>
                    <Badge className="mt-2 border-white/20 bg-white/15 text-white text-xs">
                      {selectedIncidente.estado === 'resuelto' ? 'Resuelto' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="max-h-[55vh] overflow-y-auto space-y-4 sm:space-y-5 p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Parqueadero', icon: MapPin, value: selectedIncidente.parqueadero },
                    {
                      label: 'Fecha',
                      icon: Clock,
                      value: new Date(selectedIncidente.fecha).toLocaleString('es-CO', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }),
                    },
                    ...(selectedIncidente.vehiculo
                      ? [{ label: 'Vehículo', icon: Car, value: selectedIncidente.vehiculo }]
                      : []),
                    ...(selectedIncidente.asignadoA
                      ? [{ label: 'Asignado a', icon: User, value: selectedIncidente.asignadoA }]
                      : []),
                  ].map(({ label, icon: Icon, value }) => (
                    <div key={label} className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
                      <div className="mb-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-zinc-500">
                        {label}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-900">
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 text-zinc-400" />
                        <span className="truncate">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedIncidente.evidencia && (
                  <div className="rounded-xl sm:rounded-2xl border border-zinc-200 bg-zinc-50 p-3 sm:p-4">
                    <div className="mb-3 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Evidencia fotográfica
                    </div>
                    <img
                      src={selectedIncidente.evidencia}
                      alt="Evidencia"
                      className="w-full rounded-lg sm:rounded-xl border border-zinc-200"
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 border-t border-zinc-100 bg-zinc-50 px-4 sm:px-6 py-3 sm:py-4">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-zinc-200 h-10"
                  onClick={() => setViewDialogOpen(false)}
                >
                  Cerrar
                </Button>
                <Button
                  className="w-full sm:w-auto bg-[#39A900] hover:bg-[#2D7D00] h-10"
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