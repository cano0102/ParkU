import React, { useMemo, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  Search,
  CheckCircle2,
  Clock3,
  XCircle,
  Car,
  UserCircle2,
  MapPin,
  X,
  Shield,
  Clock,
} from "lucide-react";

import { Button }             from "../components/ui/button";
import { Card, CardContent }  from "../components/ui/card";
import { Input }              from "../components/ui/input";
import { Label }              from "../components/ui/label";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
}                             from "../components/ui/dialog";
import { Badge }              from "../components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
}                             from "../components/ui/select";
import { toast }              from "sonner";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
}                             from "../components/ui/table";
import { useData, Reserva }   from "../context/DataContext";

/* ─── Estado config ─────────────────────────────────── */
type EstadoReserva = "pendiente" | "activa" | "completada" | "cancelada";

const ESTADO_CONFIG: Record<EstadoReserva, {
  bg: string; text: string; border: string; dot: string; label: string;
}> = {
  pendiente:  { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  dot: "#F59E0B", label: "Pendiente"  },
  activa:     { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  dot: "#22C55E", label: "Activa"     },
  completada: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "#3B82F6", label: "Completada" },
  cancelada:  { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    dot: "#EF4444", label: "Cancelada"  },
};

function EstadoBadge({ estado }: { estado: EstadoReserva }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente;
  return (
    <Badge className={`${cfg.bg} ${cfg.text} border ${cfg.border} capitalize flex items-center gap-1.5 w-fit`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </Badge>
  );
}

/* ─── Component ─────────────────────────────────────── */
export function Reservas() {
  const {
    reservas, addReserva, updateReserva, deleteReserva,
    vehiculos, celdas, conductores, usuarios, parqueaderos,
  } = useData();

  const [dialogOpen,     setDialogOpen]     = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [viewingReserva, setViewingReserva] = useState<Reserva | null>(null);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [filterEstado,   setFilterEstado]   = useState<"todos" | EstadoReserva>("todos");

  const [formData, setFormData] = useState({
    vehiculoId:   "",
    celdaId:      "",
    fechaReserva: new Date().toISOString().split("T")[0],
    horaInicio:   "08:00",
    horaFin:      "18:00",
    estado:       "pendiente" as EstadoReserva,
  });

  /* ── Helpers ────────────────────────────────────────── */
  const getVehiculo      = (id: string) => vehiculos.find(v => v.id === id);
  const getCelda         = (id: string) => celdas.find(c => c.id === id);
  const getParqueadero   = (id: string) => parqueaderos.find(p => p.id === id);

  const getConductorVehiculo = (vehiculoId: string) => {
    const v = getVehiculo(vehiculoId);
    return v ? conductores.find(c => c.id === v.conductorId) : null;
  };

  const getUsuarioConductor = (vehiculoId: string) => {
    const c = getConductorVehiculo(vehiculoId);
    return c ? usuarios.find(u => u.id === c.usuarioId) : null;
  };

  const celdasDisponibles = celdas.filter(c => c.estado === "disponible" || c.estado === "reservada");

  /* ── Handlers ───────────────────────────────────────── */
  const handleOpenDialog = (reserva?: Reserva) => {
    if (reserva) {
      setEditingReserva(reserva);
      setFormData({
        vehiculoId:   reserva.vehiculoId,
        celdaId:      reserva.celdaId,
        fechaReserva: reserva.fechaReserva,
        horaInicio:   reserva.horaInicio,
        horaFin:      reserva.horaFin,
        estado:       reserva.estado,
      });
    } else {
      setEditingReserva(null);
      setFormData({
        vehiculoId:   "",
        celdaId:      "",
        fechaReserva: new Date().toISOString().split("T")[0],
        horaInicio:   "08:00",
        horaFin:      "18:00",
        estado:       "pendiente",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReserva) {
      updateReserva(editingReserva.id, formData);
      toast.success("Reserva actualizada correctamente");
    } else {
      addReserva(formData);
      toast.success("Reserva registrada correctamente");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Desea eliminar esta reserva?")) {
      deleteReserva(id);
      toast.success("Reserva eliminada correctamente");
    }
  };

  const handleViewReserva = (reserva: Reserva) => {
    setViewingReserva(reserva);
    setViewDialogOpen(true);
  };

  const clearFilters = () => { setSearchTerm(""); setFilterEstado("todos"); };

  /* ── Filtered data ──────────────────────────────────── */
  const filteredReservas = useMemo(() => {
    return reservas.filter(reserva => {
      const vehiculo = getVehiculo(reserva.vehiculoId);
      const celda    = getCelda(reserva.celdaId);
      const usuario  = getUsuarioConductor(reserva.vehiculoId);

      const matchesSearch =
        vehiculo?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        celda?.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reserva.fechaReserva.includes(searchTerm);

      const matchesEstado = filterEstado === "todos" || reserva.estado === filterEstado;
      return matchesSearch && matchesEstado;
    });
  }, [reservas, searchTerm, filterEstado]);

  /* ── Stats ──────────────────────────────────────────── */
  const counts = {
    pendiente:  reservas.filter(r => r.estado === "pendiente").length,
    activa:     reservas.filter(r => r.estado === "activa").length,
    completada: reservas.filter(r => r.estado === "completada").length,
    cancelada:  reservas.filter(r => r.estado === "cancelada").length,
  };

  const activeFiltersCount = [searchTerm, filterEstado !== "todos" ? filterEstado : ""].filter(Boolean).length;

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="space-y-4 sm:space-y-5 p-3 sm:p-5 bg-[#F5F7F5] min-h-screen">

      {/* HEADER */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-5 sm:p-7 text-white shadow-lg relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-16 right-24 w-64 h-64 rounded-full bg-white/[0.03] pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-3">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              Gestión Institucional SENA
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
              Gestión de Reservas
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1.5 max-w-2xl">
              Administra reservas de vehículos, horarios, disponibilidad y control operativo de parqueaderos.
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-white text-[#2D7D00] hover:bg-white/90 h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-bold w-full sm:w-auto shrink-0 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Pendientes",  shortLabel: "Pendiente",  value: counts.pendiente,  icon: Clock3,       estado: "pendiente"  as EstadoReserva },
          { label: "Activas",     shortLabel: "Activas",    value: counts.activa,     icon: CheckCircle2, estado: "activa"     as EstadoReserva },
          { label: "Completadas", shortLabel: "Completas",  value: counts.completada, icon: Calendar,     estado: "completada" as EstadoReserva },
          { label: "Canceladas",  shortLabel: "Canceladas", value: counts.cancelada,  icon: XCircle,      estado: "cancelada"  as EstadoReserva },
        ].map(item => {
          const Icon = item.icon;
          const cfg  = ESTADO_CONFIG[item.estado];
          const isActive = filterEstado === item.estado;
          return (
            <Card
              key={item.label}
              className={`border shadow-sm rounded-2xl bg-white cursor-pointer transition-all ${
                isActive ? "ring-2 ring-[#39A900] border-[#39A900]/30" : "border-transparent hover:border-gray-200"
              }`}
              onClick={() => setFilterEstado(isActive ? "todos" : item.estado)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">{item.label}</div>
                    <div className="text-xs text-gray-500 sm:hidden">{item.shortLabel}</div>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 sm:mt-2">{item.value}</div>
                  </div>
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${cfg.text}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FILTROS */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por placa, conductor, celda o fecha..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 h-10 sm:h-11 border-gray-200 rounded-xl text-sm"
              />
            </div>

            {/* Estado filter — always visible */}
            <div className="flex gap-2">
              <select
                className="flex-1 sm:flex-none sm:w-48 h-10 sm:h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#39A900] focus:ring-offset-1"
                value={filterEstado}
                onChange={e => setFilterEstado(e.target.value as any)}
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="activa">Activas</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
              </select>

              {/* Clear filters button — only when active */}
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border-gray-200 shrink-0 text-gray-500 hover:text-red-600 hover:border-red-200"
                  onClick={clearFilters}
                  title="Limpiar filtros"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Result count */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {filteredReservas.length} resultado{filteredReservas.length !== 1 ? "s" : ""} encontrado{filteredReservas.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-[#39A900] font-medium hover:text-[#2D7D00]"
              >
                <X className="h-3 w-3" />
                Limpiar filtros
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TABLA — sm y superior */}
      <Card className="border-0 shadow-sm rounded-2xl sm:rounded-3xl bg-white overflow-hidden hidden sm:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAF8] hover:bg-[#F8FAF8]">
                  {[
                    { label: "Vehículo",   hide: "" },
                    { label: "Conductor",  hide: "hidden md:table-cell" },
                    { label: "Ubicación",  hide: "" },
                    { label: "Horario",    hide: "hidden lg:table-cell" },
                    { label: "Estado",     hide: "" },
                    { label: "Acciones",   hide: "" },
                  ].map(({ label, hide }, i) => (
                    <TableHead
                      key={label}
                      className={`px-4 lg:px-6 py-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap ${hide} ${i === 5 ? "text-right" : ""}`}
                    >
                      {label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredReservas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-gray-400">
                      <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No se encontraron reservas</p>
                      <p className="text-xs mt-1">Ajusta los filtros o crea una nueva reserva</p>
                    </TableCell>
                  </TableRow>
                ) : filteredReservas.map(reserva => {
                  const vehiculo    = getVehiculo(reserva.vehiculoId);
                  const celda       = getCelda(reserva.celdaId);
                  const usuario     = getUsuarioConductor(reserva.vehiculoId);
                  const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;

                  return (
                    <TableRow key={reserva.id} className="border-b border-gray-100 hover:bg-[#F8FAF8] transition-colors">

                      {/* VEHÍCULO */}
                      <TableCell className="px-4 lg:px-6 py-4 lg:py-5">
                        <div className="flex items-center gap-3 lg:gap-4">
                          <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-[#39A900]/10 flex items-center justify-center shrink-0">
                            <Car className="h-5 w-5 lg:h-6 lg:w-6 text-[#39A900]" />
                          </div>
                          <div>
                            <div className="font-black text-gray-900 text-base lg:text-lg tracking-wide">
                              {vehiculo?.placa ?? "—"}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              {vehiculo?.marca} · {vehiculo?.modelo}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* CONDUCTOR */}
                      <TableCell className="hidden md:table-cell px-4 lg:px-6 py-4 lg:py-5">
                        {usuario ? (
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                              <UserCircle2 className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 text-sm truncate max-w-[120px] lg:max-w-none">
                                {usuario.nombre}
                              </div>
                              <div className="text-xs text-gray-500">{usuario.identificacion}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin conductor</span>
                        )}
                      </TableCell>

                      {/* UBICACIÓN */}
                      <TableCell className="px-4 lg:px-6 py-4 lg:py-5">
                        <div className="space-y-1.5">
                          <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#F5F7F5] px-2.5 py-1.5 border border-gray-100">
                            <MapPin className="h-3.5 w-3.5 text-[#39A900] shrink-0" />
                            <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                              Celda {celda?.numero ?? "—"}
                            </span>
                          </div>
                          {parqueadero && (
                            <div className="text-xs text-gray-500 pl-1 truncate max-w-[140px] lg:max-w-[180px]">
                              {parqueadero.nombre}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* HORARIO */}
                      <TableCell className="hidden lg:table-cell px-4 lg:px-6 py-4 lg:py-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                            <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {reserva.fechaReserva}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="h-3 w-3 text-gray-400 shrink-0" />
                            {reserva.horaInicio} – {reserva.horaFin}
                          </div>
                        </div>
                      </TableCell>

                      {/* ESTADO */}
                      <TableCell className="px-4 lg:px-6 py-4 lg:py-5">
                        <EstadoBadge estado={reserva.estado as EstadoReserva} />
                      </TableCell>

                      {/* ACCIONES */}
                      <TableCell className="px-4 lg:px-6 py-4 lg:py-5">
                        <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                          <Button size="icon" variant="outline"
                            className="rounded-xl border-gray-200 h-8 w-8 lg:h-9 lg:w-9"
                            onClick={() => handleViewReserva(reserva)}
                          >
                            <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                          </Button>
                          <Button size="icon" variant="outline"
                            className="rounded-xl border-gray-200 h-8 w-8 lg:h-9 lg:w-9"
                            onClick={() => handleOpenDialog(reserva)}
                          >
                            <Pencil className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                          </Button>
                          <Button size="icon" variant="outline"
                            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-8 w-8 lg:h-9 lg:w-9"
                            onClick={() => handleDelete(reserva.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredReservas.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-[#F8FAF8]">
              <p className="text-xs text-gray-500">
                Mostrando <span className="font-semibold text-gray-700">{filteredReservas.length}</span> de{" "}
                <span className="font-semibold text-gray-700">{reservas.length}</span> reservas
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CARDS — mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {filteredReservas.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No se encontraron reservas</p>
            <p className="text-xs mt-1">Ajusta los filtros para ver resultados</p>
          </div>
        ) : filteredReservas.map(reserva => {
          const vehiculo    = getVehiculo(reserva.vehiculoId);
          const celda       = getCelda(reserva.celdaId);
          const usuario     = getUsuarioConductor(reserva.vehiculoId);
          const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;

          return (
            <Card key={reserva.id} className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-0">
                {/* Card header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <div className="w-11 h-11 rounded-xl bg-[#39A900]/10 flex items-center justify-center shrink-0">
                    <Car className="h-6 w-6 text-[#39A900]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-gray-900 text-lg tracking-wide">
                        {vehiculo?.placa ?? "—"}
                      </span>
                      <EstadoBadge estado={reserva.estado as EstadoReserva} />
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {vehiculo?.marca} {vehiculo?.modelo}
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 space-y-3">
                  {/* Conductor */}
                  {usuario && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCircle2 className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-800">{usuario.nombre}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-500">{usuario.identificacion}</span>
                    </div>
                  )}

                  {/* Ubicación */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-[#39A900] shrink-0" />
                    <span className="font-medium text-gray-800">Celda {celda?.numero ?? "—"}</span>
                    {parqueadero && (
                      <>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500 truncate">{parqueadero.nombre}</span>
                      </>
                    )}
                  </div>

                  {/* Horario */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                      <span>{reserva.fechaReserva}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{reserva.horaInicio} – {reserva.horaFin}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200 h-8 gap-1.5 px-3"
                      onClick={() => handleViewReserva(reserva)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="text-xs hidden xs:inline">Ver</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200 h-8 gap-1.5 px-3"
                      onClick={() => handleOpenDialog(reserva)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="text-xs hidden xs:inline">Editar</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-8 gap-1.5 px-3"
                      onClick={() => handleDelete(reserva.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="text-xs hidden xs:inline">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredReservas.length > 0 && (
          <p className="text-center text-xs text-gray-400 pb-2">
            {filteredReservas.length} de {reservas.length} reservas
          </p>
        )}
      </div>

      {/* DIALOG CREAR / EDITAR */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-2xl bg-white border-0 rounded-2xl sm:rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="bg-gradient-to-r from-[#39A900] to-[#2D7D00] px-5 sm:px-6 py-4 sm:py-5 shrink-0">
            <DialogTitle className="text-white text-xl sm:text-2xl font-bold">
              {editingReserva ? "Editar Reserva" : "Nueva Reserva"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 overflow-y-auto flex-1">

              {/* Vehículo */}
              <div className="col-span-1 sm:col-span-2 space-y-2">
                <Label>Vehículo</Label>
                <Select
                  value={formData.vehiculoId}
                  onValueChange={v => setFormData(f => ({ ...f, vehiculoId: v }))}
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehiculos.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.placa} — {v.marca} {v.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Celda */}
              <div className="col-span-1 sm:col-span-2 space-y-2">
                <Label>Celda</Label>
                <Select
                  value={formData.celdaId}
                  onValueChange={v => setFormData(f => ({ ...f, celdaId: v }))}
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
                    <SelectValue placeholder="Seleccionar celda" />
                  </SelectTrigger>
                  <SelectContent>
                    {celdasDisponibles.map(c => {
                      const pq = getParqueadero(c.parqueaderoId);
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          Celda {c.numero} — {pq?.nombre ?? "Parqueadero"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label>Fecha de reserva</Label>
                <input
                  type="date"
                  className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39A900] focus-visible:ring-offset-2"
                  value={formData.fechaReserva}
                  onChange={e => setFormData(f => ({ ...f, fechaReserva: e.target.value }))}
                  required
                />
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(v: EstadoReserva) => setFormData(f => ({ ...f, estado: v }))}
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
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

              {/* Hora inicio */}
              <div className="space-y-2">
                <Label>Hora de inicio</Label>
                <input
                  type="time"
                  className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39A900] focus-visible:ring-offset-2"
                  value={formData.horaInicio}
                  onChange={e => setFormData(f => ({ ...f, horaInicio: e.target.value }))}
                  required
                />
              </div>

              {/* Hora fin */}
              <div className="space-y-2">
                <Label>Hora de fin</Label>
                <input
                  type="time"
                  className="flex h-11 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#39A900] focus-visible:ring-offset-2"
                  value={formData.horaFin}
                  onChange={e => setFormData(f => ({ ...f, horaFin: e.target.value }))}
                  required
                />
              </div>

              {/* Duration hint */}
              {formData.horaInicio && formData.horaFin && (
                <div className="col-span-1 sm:col-span-2">
                  <div className="flex items-center gap-2 rounded-xl bg-[#F8FAF8] border border-gray-100 px-4 py-3">
                    <Clock className="h-4 w-4 text-[#39A900] shrink-0" />
                    <span className="text-sm text-gray-600">
                      Duración:{" "}
                      <span className="font-semibold text-gray-900">
                        {(() => {
                          const [h1, m1] = formData.horaInicio.split(":").map(Number);
                          const [h2, m2] = formData.horaFin.split(":").map(Number);
                          const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
                          if (mins <= 0) return "—";
                          const h = Math.floor(mins / 60), m = mins % 60;
                          return h > 0 ? `${h}h ${m > 0 ? m + "min" : ""}`.trim() : `${m}min`;
                        })()}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="px-4 sm:px-6 py-4 sm:py-5 border-t bg-gray-50 shrink-0 flex-row gap-2 justify-end">
              <Button type="button" variant="outline" className="rounded-xl flex-1 sm:flex-none"
                onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#39A900] hover:bg-[#2D7D00] rounded-xl flex-1 sm:flex-none">
                {editingReserva ? "Actualizar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG VER */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg bg-white border-0 rounded-2xl sm:rounded-3xl overflow-hidden p-0 max-h-[90vh] flex flex-col">
          {viewingReserva && (() => {
            const vehiculo    = getVehiculo(viewingReserva.vehiculoId);
            const celda       = getCelda(viewingReserva.celdaId);
            const usuario     = getUsuarioConductor(viewingReserva.vehiculoId);
            const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;
            const cfg         = ESTADO_CONFIG[viewingReserva.estado as EstadoReserva];

            return (
              <>
                {/* Hero */}
                <div className="bg-gradient-to-r from-[#39A900] to-[#2D7D00] px-6 py-6 sm:py-8 text-white shrink-0">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/15 flex items-center justify-center mb-3 sm:mb-4">
                      <Car className="h-11 w-11 sm:w-14 sm:h-14 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-wide">
                      {vehiculo?.placa ?? "—"}
                    </h2>
                    <p className="text-white/70 text-sm mt-1">{vehiculo?.marca} {vehiculo?.modelo}</p>
                    <div className="mt-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detail fields */}
                <div className="p-4 sm:p-6 space-y-3 overflow-y-auto flex-1">
                  {[
                    { label: "Conductor",       value: usuario ? `${usuario.nombre} · ${usuario.identificacion}` : "Sin conductor" },
                    { label: "Celda",           value: celda ? `Celda ${celda.numero}` : "—" },
                    { label: "Parqueadero",     value: parqueadero?.nombre ?? "—" },
                    { label: "Fecha de reserva",value: viewingReserva.fechaReserva },
                    { label: "Horario",         value: `${viewingReserva.horaInicio} – ${viewingReserva.horaFin}` },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{item.label}</div>
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">{item.value}</div>
                    </div>
                  ))}
                </div>

                <DialogFooter className="px-4 sm:px-6 py-4 sm:py-5 border-t bg-gray-50 shrink-0 flex-row gap-2 justify-end">
                  <Button variant="outline" className="rounded-xl flex-1 sm:flex-none sm:w-auto"
                    onClick={() => setViewDialogOpen(false)}>
                    Cerrar
                  </Button>
                  <Button
                    className="bg-[#39A900] hover:bg-[#2D7D00] rounded-xl flex-1 sm:flex-none"
                    onClick={() => { setViewDialogOpen(false); handleOpenDialog(viewingReserva); }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}