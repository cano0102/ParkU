import React, { useState } from 'react';
import {
  Plus,
  ArrowLeftRight,
  Search,
  LogIn,
  LogOut as LogOutIcon,
  Car,
  MapPin,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useData, ControlSalida } from '../context/DataContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

export function ControlSalidaPage() {
  const {
    controlesSalida,
    addControlSalida,
    updateControlSalida,
    vehiculos,
    celdas,
    conductores,
    usuarios,
    parqueaderos,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVehiculo, setSearchVehiculo] = useState('');
  const [filterEstado, setFilterEstado] = useState<
    'todos' | 'en_parqueadero' | 'finalizado'
  >('todos');

  const [formData, setFormData] = useState({
    vehiculoId: '',
    celdaId: '',
    fechaEntrada: new Date().toISOString().slice(0, 16),
    fechaSalida: '',
    estado: 'en_parqueadero' as 'en_parqueadero' | 'finalizado',
  });

  const handleOpenDialog = () => {
    setFormData({
      vehiculoId: '',
      celdaId: '',
      fechaEntrada: new Date().toISOString().slice(0, 16),
      fechaSalida: '',
      estado: 'en_parqueadero',
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
      estado: 'finalizado',
    });
    toast.success('Salida registrada exitosamente');
  };

  const getVehiculo = (vehiculoId: string) =>
    vehiculos.find((v) => v.id === vehiculoId);
  const getCelda = (celdaId: string) =>
    celdas.find((c) => c.id === celdaId);
  const getParqueadero = (parqueaderoId: string) =>
    parqueaderos.find((p) => p.id === parqueaderoId);

  const getConductorVehiculo = (vehiculoId: string) => {
    const vehiculo = getVehiculo(vehiculoId);
    if (!vehiculo) return null;
    return conductores.find((c) => c.id === vehiculo.conductorId);
  };

  const getUsuarioConductor = (vehiculoId: string) => {
    const conductor = getConductorVehiculo(vehiculoId);
    if (!conductor) return null;
    return usuarios.find((u) => u.id === conductor.usuarioId);
  };

  const celdasDisponibles = celdas.filter((c) => c.estado === 'disponible');

  const filteredControles = controlesSalida.filter((control) => {
    const vehiculo = getVehiculo(control.vehiculoId);
    const celda = getCelda(control.celdaId);
    const usuario = getUsuarioConductor(control.vehiculoId);

    const matchesSearch =
      vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      celda?.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVehiculo = searchVehiculo
      ? vehiculo?.placa.toLowerCase().includes(searchVehiculo.toLowerCase())
      : true;

    const matchesEstado =
      filterEstado === 'todos' ? true : control.estado === filterEstado;

    return matchesSearch && matchesVehiculo && matchesEstado;
  });

  const vehiculosEnParqueadero = controlesSalida.filter(
    (c) => c.estado === 'en_parqueadero',
  );
  const vehiculosSalidos = controlesSalida.filter(
    (c) => c.estado === 'finalizado',
  );

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-7 text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <ArrowLeftRight className="h-4 w-4" />
              Movimiento de vehículos
            </div>

            <h1 className="text-4xl font-black leading-none md:text-5xl">
              Entrada y Salida
            </h1>

            <p className="mt-4 max-w-2xl text-sm text-white/85 md:text-base">
              Registra y gestiona el flujo de vehículos en el parqueadero
              institucional.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">En parqueadero</div>
              <div className="mt-1 text-3xl font-black">
                {vehiculosEnParqueadero.length}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">Salidas</div>
              <div className="mt-1 text-3xl font-black">
                {vehiculosSalidos.length}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">Celdas libres</div>
              <div className="mt-1 text-3xl font-black">
                {celdasDisponibles.length}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">Total registros</div>
              <div className="mt-1 text-3xl font-black">
                {controlesSalida.length}
              </div>
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
              placeholder="Buscar por placa, celda o conductor..."
              className="h-11 rounded-xl border-zinc-200 bg-white pl-10 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Filtrar por placa..."
              className="h-11 rounded-xl border-zinc-200 bg-white pl-10 shadow-sm w-48"
              value={searchVehiculo}
              onChange={(e) => setSearchVehiculo(e.target.value)}
            />
          </div>

          <select
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm shadow-sm outline-none"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as any)}
          >
            <option value="todos">Todos</option>
            <option value="en_parqueadero">En parqueadero</option>
            <option value="finalizado">Finalizados</option>
          </select>
        </div>

        <Button
          onClick={handleOpenDialog}
          className="h-11 rounded-xl bg-[#39A900] px-5 hover:bg-[#2D7D00]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Registrar Entrada
        </Button>
      </div>

      {/* TABLE CARD */}
      <Card className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-bold text-zinc-900">
            Registro de Entradas y Salidas ({filteredControles.length})
          </h2>
        </div>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50">
                  <TableHead className="font-bold text-zinc-700">Vehículo</TableHead>
                  <TableHead className="font-bold text-zinc-700">Conductor</TableHead>
                  <TableHead className="font-bold text-zinc-700">Celda</TableHead>
                  <TableHead className="font-bold text-zinc-700">Parqueadero</TableHead>
                  <TableHead className="font-bold text-zinc-700">Entrada</TableHead>
                  <TableHead className="font-bold text-zinc-700">Salida</TableHead>
                  <TableHead className="font-bold text-zinc-700">Estado</TableHead>
                  <TableHead className="text-right font-bold text-zinc-700">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredControles.map((control) => {
                  const vehiculo = getVehiculo(control.vehiculoId);
                  const celda = getCelda(control.celdaId);
                  const usuario = getUsuarioConductor(control.vehiculoId);
                  const parqueadero = celda
                    ? getParqueadero(celda.parqueaderoId)
                    : null;

                  return (
                    <TableRow
                      key={control.id}
                      className="transition-colors hover:bg-zinc-50"
                    >
                      <TableCell>
                        {vehiculo && (
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#39A900]/10">
                              <Car className="h-4 w-4 text-[#39A900]" />
                            </div>
                            <div>
                              <p className="font-bold text-zinc-900">
                                {vehiculo.placa}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {vehiculo.marca} {vehiculo.modelo}
                              </p>
                            </div>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        {usuario && (
                          <div>
                            <p className="font-medium text-zinc-900">
                              {usuario.nombre}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {usuario.identificacion}
                            </p>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-700">
                          {celda?.numero}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-zinc-600">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                          {parqueadero?.nombre}
                        </div>
                      </TableCell>

                      <TableCell className="text-sm text-zinc-600">
                        {new Date(control.fechaEntrada).toLocaleString('es-CO')}
                      </TableCell>

                      <TableCell className="text-sm text-zinc-600">
                        {control.fechaSalida
                          ? new Date(control.fechaSalida).toLocaleString('es-CO')
                          : <span className="text-zinc-400">—</span>}
                      </TableCell>

                      <TableCell>
                        {control.estado === 'en_parqueadero' ? (
                          <Badge className="border-blue-200 bg-blue-50 text-blue-700">
                            <LogIn className="mr-1 h-3 w-3" />
                            En parqueadero
                          </Badge>
                        ) : (
                          <Badge className="border-zinc-200 bg-zinc-50 text-zinc-500">
                            Finalizado
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {control.estado === 'en_parqueadero' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRegistrarSalida(control.id)}
                            className="rounded-xl border-[#39A900]/30 text-[#39A900] hover:bg-[#39A900]/10"
                          >
                            <LogOutIcon className="mr-1 h-4 w-4" />
                            Registrar Salida
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredControles.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-zinc-400"
                    >
                      No se encontraron registros
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG REGISTRAR ENTRADA */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg overflow-hidden rounded-3xl border-none bg-white p-0">
          <DialogHeader className="border-b border-zinc-100 px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-2xl font-black text-zinc-900">
              <LogIn className="h-5 w-5 text-[#39A900]" />
              Registrar Entrada
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5 p-6">
              {/* Vehículo */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <Label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Vehículo
                </Label>
                <Select
                  value={formData.vehiculoId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, vehiculoId: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-white">
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculos.map((v) => {
                      const conductor = conductores.find(
                        (c) => c.id === v.conductorId,
                      );
                      const usuario = conductor
                        ? usuarios.find((u) => u.id === conductor.usuarioId)
                        : null;
                      return (
                        <SelectItem key={v.id} value={v.id}>
                          {v.placa} — {v.marca} {v.modelo} ({usuario?.nombre})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Celda */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <Label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Celda disponible
                </Label>
                <Select
                  value={formData.celdaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, celdaId: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-white">
                    <SelectValue placeholder="Seleccionar celda" />
                  </SelectTrigger>
                  <SelectContent>
                    {celdasDisponibles.map((c) => {
                      const parq = getParqueadero(c.parqueaderoId);
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          {c.numero} — {parq?.nombre} ({c.tipo})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha */}
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <Label className="mb-2 block text-sm font-semibold text-zinc-700">
                  Fecha y hora de entrada
                </Label>
                <input
                  type="datetime-local"
                  value={formData.fechaEntrada}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaEntrada: e.target.value })
                  }
                  required
                  className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#39A900]/30"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-zinc-100 bg-zinc-50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-200"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#39A900] hover:bg-[#2D7D00]"
              >
                Registrar Entrada
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}