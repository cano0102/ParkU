import React, { useMemo, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Car,
  Bike,
  Shield,
  GaugeCircle,
  UserCircle2,
  Calendar,
  Palette,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import { useData, Vehiculo } from "../context/DataContext";

export function Vehiculos() {
  const {
    vehiculos,
    addVehiculo,
    updateVehiculo,
    deleteVehiculo,
    conductores,
    usuarios,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [viewingVehiculo, setViewingVehiculo] = useState<Vehiculo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchByConductor, setSearchByConductor] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    conductorId: "",
    placa: "",
    tipo: "carro" as "carro" | "moto",
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    color: "",
    descripcion: "",
    estado: "activo" as "activo" | "inactivo",
  });

  const handleOpenDialog = (vehiculo?: Vehiculo) => {
    if (vehiculo) {
      setEditingVehiculo(vehiculo);
      setFormData({
        conductorId: vehiculo.conductorId,
        placa: vehiculo.placa,
        tipo: vehiculo.tipo,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        año: vehiculo.año,
        color: vehiculo.color,
        descripcion: vehiculo.descripcion,
        estado: vehiculo.estado,
      });
    } else {
      setEditingVehiculo(null);
      setFormData({
        conductorId: "",
        placa: "",
        tipo: "carro",
        marca: "",
        modelo: "",
        año: new Date().getFullYear(),
        color: "",
        descripcion: "",
        estado: "activo",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehiculo) {
      updateVehiculo(editingVehiculo.id, formData);
      toast.success("Vehículo actualizado correctamente");
    } else {
      addVehiculo(formData);
      toast.success("Vehículo registrado correctamente");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Desea eliminar este vehículo?")) {
      deleteVehiculo(id);
      toast.success("Vehículo eliminado correctamente");
    }
  };

  const handleChangeEstado = (id: string, nuevoEstado: "activo" | "inactivo") => {
    updateVehiculo(id, { estado: nuevoEstado });
    toast.success(`Vehículo ${nuevoEstado === "activo" ? "activado" : "desactivado"}`);
  };

  const handleViewVehiculo = (vehiculo: Vehiculo) => {
    setViewingVehiculo(vehiculo);
    setViewDialogOpen(true);
  };

  const getConductor = (conductorId: string) =>
    conductores.find((c) => c.id === conductorId);

  const getUsuarioConductor = (conductorId: string) => {
    const conductor = getConductor(conductorId);
    if (!conductor) return null;
    return usuarios.find((u) => u.id === conductor.usuarioId);
  };

  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter((vehiculo) => {
      const matchesSearch =
        vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase());

      const usuario = getUsuarioConductor(vehiculo.conductorId);
      const matchesConductor = !searchByConductor
        ? true
        : usuario?.nombre.toLowerCase().includes(searchByConductor.toLowerCase()) ||
          usuario?.identificacion.includes(searchByConductor);

      const matchesEstado =
        filterEstado === "todos" ? true : vehiculo.estado === filterEstado;

      return matchesSearch && matchesConductor && matchesEstado;
    });
  }, [vehiculos, searchTerm, searchByConductor, filterEstado]);

  const getTipoStyles = (tipo: "carro" | "moto") => {
    if (tipo === "carro") {
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        badgeBg: "bg-blue-100",
        icon: Car,
      };
    }
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      badgeBg: "bg-amber-100",
      icon: Bike,
    };
  };

  const activeFiltersCount = [
    searchTerm,
    searchByConductor,
    filterEstado !== "todos" ? filterEstado : "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setSearchByConductor("");
    setFilterEstado("todos");
  };

  return (
    <div className="space-y-4 sm:space-y-5 p-3 sm:p-5 bg-[#F5F7F5] min-h-screen">

      {/* HEADER */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-5 sm:p-7 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span>Gestión Institucional SENA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
              Gestión de Vehículos
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1.5 sm:mt-2 max-w-2xl">
              Administra vehículos registrados, conductores autorizados y estado operativo del parque automotor.
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-white text-[#2D7D00] hover:bg-white/90 h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-bold w-full sm:w-auto shrink-0 text-sm sm:text-base"
          >
            <Plus className="h-4 w-4 mr-2 shrink-0" />
            Nuevo Vehículo
          </Button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Totales",
            fullLabel: "Vehículos Totales",
            value: vehiculos.length,
            icon: Car,
            color: "text-[#39A900]",
            bg: "bg-green-100",
          },
          {
            label: "Activos",
            fullLabel: "Vehículos Activos",
            value: vehiculos.filter((v) => v.estado === "activo").length,
            icon: CheckCircle2,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            label: "Inactivos",
            fullLabel: "Vehículos Inactivos",
            value: vehiculos.filter((v) => v.estado === "inactivo").length,
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-100",
          },
          {
            label: "Conductores",
            fullLabel: "Conductores",
            value: conductores.length,
            icon: UserCircle2,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-0 shadow-sm rounded-2xl bg-white">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm text-gray-500 truncate hidden sm:block">
                      {item.fullLabel}
                    </div>
                    <div className="text-xs text-gray-500 truncate sm:hidden">
                      {item.label}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 sm:mt-2">
                      {item.value}
                    </div>
                  </div>
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${item.bg}`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${item.color}`} />
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
          {/* Mobile: toggle filters */}
          <div className="flex items-center gap-2 sm:hidden mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar vehículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 border-gray-200 rounded-xl text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-xl border-gray-200 shrink-0 relative"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#39A900] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile: expanded filters */}
          {showFilters && (
            <div className="flex flex-col gap-2 mb-3 sm:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por conductor..."
                  value={searchByConductor}
                  onChange={(e) => setSearchByConductor(e.target.value)}
                  className="pl-9 h-10 border-gray-200 rounded-xl text-sm"
                />
              </div>
              <select
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm w-full"
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value as any)}
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Solo activos</option>
                <option value="inactivo">Solo inactivos</option>
              </select>
            </div>
          )}

          {/* Desktop: always visible */}
          <div className="hidden sm:grid sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por placa, marca o modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 border-gray-200 rounded-xl"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por conductor..."
                value={searchByConductor}
                onChange={(e) => setSearchByConductor(e.target.value)}
                className="pl-10 h-11 border-gray-200 rounded-xl"
              />
            </div>
            <select
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as any)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Solo activos</option>
              <option value="inactivo">Solo inactivos</option>
            </select>
          </div>

          {/* Active filters indicator */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {filteredVehiculos.length} resultado{filteredVehiculos.length !== 1 ? "s" : ""} encontrado{filteredVehiculos.length !== 1 ? "s" : ""}
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

      {/* TABLA — desktop */}
      <Card className="border-0 shadow-sm rounded-2xl sm:rounded-3xl bg-white overflow-hidden hidden sm:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAF8] hover:bg-[#F8FAF8]">
                  <TableHead className="px-4 lg:px-6 py-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Vehículo
                  </TableHead>
                  <TableHead className="px-4 lg:px-6 py-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Información
                  </TableHead>
                  <TableHead className="px-4 lg:px-6 py-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Conductor
                  </TableHead>
                  <TableHead className="px-4 lg:px-6 py-4 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">
                    Estado
                  </TableHead>
                  <TableHead className="px-4 lg:px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right whitespace-nowrap">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredVehiculos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16 text-gray-400">
                      <Car className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No se encontraron vehículos</p>
                      <p className="text-xs mt-1">Intenta ajustar los filtros de búsqueda</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehiculos.map((vehiculo) => {
                    const usuario = getUsuarioConductor(vehiculo.conductorId);
                    const tipoStyle = getTipoStyles(vehiculo.tipo);
                    const TipoIcon = tipoStyle.icon;

                    return (
                      <TableRow
                        key={vehiculo.id}
                        className="border-b border-gray-100 hover:bg-[#F8FAF8] transition-colors"
                      >
                        {/* VEHÍCULO */}
                        <TableCell className="px-4 lg:px-6 py-4 lg:py-5">
                          <div className="flex items-center gap-3 lg:gap-4">
                            <div className={`w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 ${tipoStyle.bg}`}>
                              <TipoIcon className={`h-6 w-6 lg:h-7 lg:w-7 ${tipoStyle.text}`} />
                            </div>
                            <div>
                              <div className="font-black text-gray-900 text-base lg:text-lg tracking-wide">
                                {vehiculo.placa}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`border capitalize text-xs ${tipoStyle.badgeBg} ${tipoStyle.text} ${tipoStyle.border}`}>
                                  {vehiculo.tipo}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* INFO */}
                        <TableCell className="px-4 lg:px-6 py-4 lg:py-5">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <GaugeCircle className="h-4 w-4 text-gray-400 shrink-0" />
                              <span className="font-medium truncate max-w-[140px] lg:max-w-none">
                                {vehiculo.marca} · {vehiculo.modelo}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                              {vehiculo.año}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Palette className="h-4 w-4 text-gray-400 shrink-0" />
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0"
                                  style={{ backgroundColor: vehiculo.color.toLowerCase() }}
                                />
                                {vehiculo.color}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* CONDUCTOR */}
                        <TableCell className="px-4 lg:px-6 py-4 lg:py-5">
                          {usuario ? (
                            <div className="flex items-center gap-2 lg:gap-3">
                              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-[#39A900]/10 flex items-center justify-center shrink-0">
                                <UserCircle2 className="h-6 w-6 lg:h-7 lg:w-7 text-[#39A900]" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 text-sm truncate max-w-[120px] lg:max-w-none">
                                  {usuario.nombre}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                  {usuario.identificacion}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Sin conductor</span>
                          )}
                        </TableCell>

                        {/* ESTADO */}
                        <TableCell className="px-4 lg:px-6 py-4 lg:py-5">
                          <div className="flex items-center gap-3">
                            <Badge
                              className={
                                vehiculo.estado === "activo"
                                  ? "bg-green-100 text-green-700 border border-green-200 text-xs"
                                  : "bg-red-100 text-red-700 border border-red-200 text-xs"
                              }
                            >
                              {vehiculo.estado}
                            </Badge>
                            <Switch
                              checked={vehiculo.estado === "activo"}
                              onCheckedChange={(checked) =>
                                handleChangeEstado(vehiculo.id, checked ? "activo" : "inactivo")
                              }
                            />
                          </div>
                        </TableCell>

                        {/* ACCIONES */}
                        <TableCell className="px-4 lg:px-6 py-4 lg:py-5">
                          <div className="flex items-center justify-end gap-1.5 lg:gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-xl border-gray-200 h-8 w-8 lg:h-9 lg:w-9"
                              onClick={() => handleViewVehiculo(vehiculo)}
                            >
                              <Eye className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-xl border-gray-200 h-8 w-8 lg:h-9 lg:w-9"
                              onClick={() => handleOpenDialog(vehiculo)}
                            >
                              <Pencil className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-8 w-8 lg:h-9 lg:w-9"
                              onClick={() => handleDelete(vehiculo.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer count */}
          {filteredVehiculos.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-[#F8FAF8]">
              <p className="text-xs text-gray-500">
                Mostrando <span className="font-semibold text-gray-700">{filteredVehiculos.length}</span> de{" "}
                <span className="font-semibold text-gray-700">{vehiculos.length}</span> vehículos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CARDS — mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {filteredVehiculos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Car className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No se encontraron vehículos</p>
            <p className="text-xs mt-1">Ajusta los filtros para ver resultados</p>
          </div>
        ) : (
          filteredVehiculos.map((vehiculo) => {
            const usuario = getUsuarioConductor(vehiculo.conductorId);
            const tipoStyle = getTipoStyles(vehiculo.tipo);
            const TipoIcon = tipoStyle.icon;

            return (
              <Card key={vehiculo.id} className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardContent className="p-0">
                  {/* Card Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tipoStyle.bg}`}>
                      <TipoIcon className={`h-6 w-6 ${tipoStyle.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-gray-900 text-lg tracking-wide">
                          {vehiculo.placa}
                        </span>
                        <Badge className={`border capitalize text-xs ${tipoStyle.badgeBg} ${tipoStyle.text} ${tipoStyle.border}`}>
                          {vehiculo.tipo}
                        </Badge>
                        <Badge
                          className={
                            vehiculo.estado === "activo"
                              ? "bg-green-100 text-green-700 border border-green-200 text-xs"
                              : "bg-red-100 text-red-700 border border-red-200 text-xs"
                          }
                        >
                          {vehiculo.estado}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {vehiculo.marca} {vehiculo.modelo} · {vehiculo.año}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Color */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Palette className="h-4 w-4 text-gray-400 shrink-0" />
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-gray-200"
                          style={{ backgroundColor: vehiculo.color.toLowerCase() }}
                        />
                        {vehiculo.color}
                      </div>
                    </div>

                    {/* Conductor */}
                    {usuario ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserCircle2 className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-800">{usuario.nombre}</span>
                        <span className="text-gray-400">·</span>
                        <span>{usuario.identificacion}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <UserCircle2 className="h-4 w-4 shrink-0" />
                        Sin conductor asignado
                      </div>
                    )}

                    {/* Footer: switch + actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={vehiculo.estado === "activo"}
                          onCheckedChange={(checked) =>
                            handleChangeEstado(vehiculo.id, checked ? "activo" : "inactivo")
                          }
                        />
                        <span className="text-xs text-gray-500">
                          {vehiculo.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-xl border-gray-200 h-8 w-8"
                          onClick={() => handleViewVehiculo(vehiculo)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-xl border-gray-200 h-8 w-8"
                          onClick={() => handleOpenDialog(vehiculo)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 h-8 w-8"
                          onClick={() => handleDelete(vehiculo.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}

        {filteredVehiculos.length > 0 && (
          <p className="text-center text-xs text-gray-400 pb-2">
            {filteredVehiculos.length} de {vehiculos.length} vehículos
          </p>
        )}
      </div>

      {/* DIALOG CREAR / EDITAR */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-4xl bg-white border-0 rounded-2xl sm:rounded-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="bg-gradient-to-r from-[#39A900] to-[#2D7D00] px-5 sm:px-6 py-4 sm:py-5 shrink-0">
            <DialogTitle className="text-white text-xl sm:text-2xl font-bold">
              {editingVehiculo ? "Editar Vehículo" : "Registrar Vehículo"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 overflow-y-auto flex-1">
              {/* Conductor */}
              <div className="col-span-1 sm:col-span-2 space-y-2">
                <Label>Conductor</Label>
                <Select
                  value={formData.conductorId}
                  onValueChange={(value) => setFormData({ ...formData, conductorId: value })}
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
                    <SelectValue placeholder="Seleccionar conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    {conductores.map((conductor) => {
                      const usuario = usuarios.find((u) => u.id === conductor.usuarioId);
                      return (
                        <SelectItem key={conductor.id} value={conductor.id}>
                          {usuario?.nombre} - {usuario?.identificacion}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Placa */}
              <div className="space-y-2">
                <Label>Placa</Label>
                <Input
                  className="h-11 rounded-xl border-gray-200 uppercase"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  placeholder="ABC123"
                  required
                />
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <Label>Tipo Vehículo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: "carro" | "moto") =>
                    setFormData({ ...formData, tipo: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carro">Carro</SelectItem>
                    <SelectItem value="moto">Moto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Marca */}
              <div className="space-y-2">
                <Label>Marca</Label>
                <Input
                  className="h-11 rounded-xl border-gray-200"
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  placeholder="Toyota, Yamaha..."
                  required
                />
              </div>

              {/* Modelo */}
              <div className="space-y-2">
                <Label>Modelo</Label>
                <Input
                  className="h-11 rounded-xl border-gray-200"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  placeholder="Corolla, FZ..."
                  required
                />
              </div>

              {/* Año */}
              <div className="space-y-2">
                <Label>Año</Label>
                <Input
                  type="number"
                  className="h-11 rounded-xl border-gray-200"
                  value={formData.año}
                  onChange={(e) =>
                    setFormData({ ...formData, año: parseInt(e.target.value) })
                  }
                  required
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  className="h-11 rounded-xl border-gray-200"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="Blanco, Negro..."
                  required
                />
              </div>

              {/* Descripción */}
              <div className="col-span-1 sm:col-span-2 space-y-2">
                <Label>Descripción</Label>
                <Textarea
                  rows={3}
                  className="rounded-2xl border-gray-200"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Características adicionales del vehículo..."
                />
              </div>

              {/* Estado */}
              <div className="col-span-1 sm:col-span-2 flex items-center justify-between rounded-2xl border border-gray-200 p-4 bg-[#F8FAF8]">
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">
                    Estado del Vehículo
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                    Controla la disponibilidad en el sistema
                  </div>
                </div>
                <Switch
                  checked={formData.estado === "activo"}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, estado: checked ? "activo" : "inactivo" })
                  }
                />
              </div>
            </div>

            <DialogFooter className="px-4 sm:px-6 py-4 sm:py-5 border-t bg-gray-50 shrink-0 flex-row gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl flex-1 sm:flex-none"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-[#39A900] hover:bg-[#2D7D00] rounded-xl flex-1 sm:flex-none"
              >
                {editingVehiculo ? "Actualizar" : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW VEHÍCULO */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-xl bg-white border-0 rounded-2xl sm:rounded-3xl overflow-hidden p-0 max-h-[90vh] flex flex-col">
          {viewingVehiculo &&
            (() => {
              const usuario = getUsuarioConductor(viewingVehiculo.conductorId);
              const tipoStyle = getTipoStyles(viewingVehiculo.tipo);
              const TipoIcon = tipoStyle.icon;

              return (
                <>
                  <div className="bg-gradient-to-r from-[#39A900] to-[#2D7D00] px-6 py-6 sm:py-8 text-white shrink-0">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/15 flex items-center justify-center mb-3 sm:mb-4">
                        <TipoIcon className="h-11 w-11 sm:h-14 sm:w-14" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-wide">
                        {viewingVehiculo.placa}
                      </h2>
                      <div className="flex gap-2 mt-2 sm:mt-3 flex-wrap justify-center">
                        <Badge className={`capitalize border ${tipoStyle.badgeBg} ${tipoStyle.text} ${tipoStyle.border}`}>
                          {viewingVehiculo.tipo}
                        </Badge>
                        <Badge
                          className={
                            viewingVehiculo.estado === "activo"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }
                        >
                          {viewingVehiculo.estado}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 space-y-3 overflow-y-auto flex-1">
                    {[
                      { label: "Marca", value: viewingVehiculo.marca },
                      { label: "Modelo", value: viewingVehiculo.modelo },
                      { label: "Año", value: viewingVehiculo.año },
                      { label: "Color", value: viewingVehiculo.color },
                      {
                        label: "Conductor",
                        value: usuario
                          ? `${usuario.nombre} - ${usuario.identificacion}`
                          : "Sin conductor",
                      },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                          {item.label}
                        </div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                          {item.value}
                        </div>
                      </div>
                    ))}

                    {viewingVehiculo.descripcion && (
                      <div className="rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                          Descripción
                        </div>
                        <div className="text-gray-700 text-sm leading-relaxed">
                          {viewingVehiculo.descripcion}
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="px-4 sm:px-6 py-4 sm:py-5 border-t bg-gray-50 shrink-0">
                    <Button
                      variant="outline"
                      className="rounded-xl w-full sm:w-auto"
                      onClick={() => setViewDialogOpen(false)}
                    >
                      Cerrar
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