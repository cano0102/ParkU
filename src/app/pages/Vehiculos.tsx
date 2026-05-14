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
} from "lucide-react";

import { Button } from "../components/ui/button";

import {
  Card,
  CardContent,
} from "../components/ui/card";

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

import {
  useData,
  Vehiculo,
} from "../context/DataContext";

export function Vehiculos() {
  const {
    vehiculos,
    addVehiculo,
    updateVehiculo,
    deleteVehiculo,
    conductores,
    usuarios,
  } = useData();

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [viewDialogOpen, setViewDialogOpen] =
    useState(false);

  const [editingVehiculo, setEditingVehiculo] =
    useState<Vehiculo | null>(null);

  const [viewingVehiculo, setViewingVehiculo] =
    useState<Vehiculo | null>(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [searchByConductor, setSearchByConductor] =
    useState("");

  const [filterEstado, setFilterEstado] =
    useState<
      "todos" | "activo" | "inactivo"
    >("todos");

  const [formData, setFormData] = useState({
    conductorId: "",
    placa: "",
    tipo: "carro" as "carro" | "moto",
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    color: "",
    descripcion: "",
    estado: "activo" as
      | "activo"
      | "inactivo",
  });

  const handleOpenDialog = (
    vehiculo?: Vehiculo
  ) => {
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

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (editingVehiculo) {
      updateVehiculo(
        editingVehiculo.id,
        formData
      );

      toast.success(
        "Vehículo actualizado correctamente"
      );
    } else {
      addVehiculo(formData);

      toast.success(
        "Vehículo registrado correctamente"
      );
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "¿Desea eliminar este vehículo?"
      )
    ) {
      deleteVehiculo(id);

      toast.success(
        "Vehículo eliminado correctamente"
      );
    }
  };

  const handleChangeEstado = (
    id: string,
    nuevoEstado: "activo" | "inactivo"
  ) => {
    updateVehiculo(id, {
      estado: nuevoEstado,
    });

    toast.success(
      `Vehículo ${
        nuevoEstado === "activo"
          ? "activado"
          : "desactivado"
      }`
    );
  };

  const handleViewVehiculo = (
    vehiculo: Vehiculo
  ) => {
    setViewingVehiculo(vehiculo);

    setViewDialogOpen(true);
  };

  const getConductor = (
    conductorId: string
  ) => {
    return conductores.find(
      (c) => c.id === conductorId
    );
  };

  const getUsuarioConductor = (
    conductorId: string
  ) => {
    const conductor =
      getConductor(conductorId);

    if (!conductor) return null;

    return usuarios.find(
      (u) => u.id === conductor.usuarioId
    );
  };

  const filteredVehiculos = useMemo(() => {
    return vehiculos.filter((vehiculo) => {
      const matchesSearch =
        vehiculo.placa
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        vehiculo.marca
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        vehiculo.modelo
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const usuario = getUsuarioConductor(
        vehiculo.conductorId
      );

      const matchesConductor =
        !searchByConductor
          ? true
          : usuario?.nombre
              .toLowerCase()
              .includes(
                searchByConductor.toLowerCase()
              ) ||
            usuario?.identificacion.includes(
              searchByConductor
            );

      const matchesEstado =
        filterEstado === "todos"
          ? true
          : vehiculo.estado === filterEstado;

      return (
        matchesSearch &&
        matchesConductor &&
        matchesEstado
      );
    });
  }, [
    vehiculos,
    searchTerm,
    searchByConductor,
    filterEstado,
  ]);

  const getTipoStyles = (
    tipo: "carro" | "moto"
  ) => {
    if (tipo === "carro") {
      return {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: Car,
      };
    }

    return {
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Bike,
    };
  };

  return (
    <div className="space-y-5 p-5 bg-[#F5F7F5] min-h-screen">
      {/* HEADER */}

      <div className="rounded-3xl bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-7 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="h-4 w-4" />
              Gestión Institucional SENA
            </div>

            <h1 className="text-4xl font-black leading-tight">
              Gestión de Vehículos
            </h1>

            <p className="text-sm text-white/80 mt-2 max-w-2xl">
              Administra vehículos registrados,
              conductores autorizados y estado
              operativo del parque automotor.
            </p>
          </div>

          <Button
            onClick={() =>
              handleOpenDialog()
            }
            className="bg-white text-[#2D7D00] hover:bg-white/90 h-12 px-6 rounded-xl font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Vehículo
          </Button>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Vehículos Totales",
            value: vehiculos.length,
            icon: Car,
            color: "text-[#39A900]",
            bg: "bg-green-100",
          },

          {
            label: "Vehículos Activos",
            value: vehiculos.filter(
              (v) => v.estado === "activo"
            ).length,
            icon: CheckCircle2,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },

          {
            label: "Vehículos Inactivos",
            value: vehiculos.filter(
              (v) =>
                v.estado === "inactivo"
            ).length,
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-100",
          },

          {
            label: "Conductores",
            value: conductores.length,
            icon: UserCircle2,
            color: "text-amber-600",
            bg: "bg-amber-100",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.label}
              className="border-0 shadow-sm rounded-2xl bg-white"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">
                      {item.label}
                    </div>

                    <div className="text-3xl font-black text-gray-900 mt-2">
                      {item.value}
                    </div>
                  </div>

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.bg}`}
                  >
                    <Icon
                      className={`h-6 w-6 ${item.color}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FILTROS */}

      <Card className="border-0 shadow-sm rounded-2xl bg-white">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

              <Input
                placeholder="Buscar por placa, marca o modelo..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="pl-10 h-11 border-gray-200 rounded-xl"
              />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

              <Input
                placeholder="Buscar por conductor..."
                value={searchByConductor}
                onChange={(e) =>
                  setSearchByConductor(
                    e.target.value
                  )
                }
                className="pl-10 h-11 border-gray-200 rounded-xl"
              />
            </div>

            <select
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm"
              value={filterEstado}
              onChange={(e) =>
                setFilterEstado(
                  e.target.value as any
                )
              }
            >
              <option value="todos">
                Todos
              </option>

              <option value="activo">
                Activos
              </option>

              <option value="inactivo">
                Inactivos
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* TABLA */}

      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F8FAF8] hover:bg-[#F8FAF8]">
                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Vehículo
                  </TableHead>

                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Información
                  </TableHead>

                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Conductor
                  </TableHead>

                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Estado
                  </TableHead>

                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredVehiculos.map(
                  (vehiculo) => {
                    const usuario =
                      getUsuarioConductor(
                        vehiculo.conductorId
                      );

                    const tipoStyle =
                      getTipoStyles(
                        vehiculo.tipo
                      );

                    const TipoIcon =
                      tipoStyle.icon;

                    return (
                      <TableRow
                        key={vehiculo.id}
                        className="border-b border-gray-100 hover:bg-[#F8FAF8]"
                      >
                        {/* VEHÍCULO */}

                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tipoStyle.bg}`}
                            >
                              <TipoIcon
                                className={`h-7 w-7 ${tipoStyle.text}`}
                              />
                            </div>

                            <div>
                              <div className="font-black text-gray-900 text-lg tracking-wide">
                                {
                                  vehiculo.placa
                                }
                              </div>

                              <div className="flex items-center gap-2 mt-1">
                                <Badge
                                  className={`border capitalize ${tipoStyle.bg} ${tipoStyle.text} ${tipoStyle.border}`}
                                >
                                  {
                                    vehiculo.tipo
                                  }
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* INFO */}

                        <TableCell className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <GaugeCircle className="h-4 w-4 text-gray-400" />

                              <span className="font-medium">
                                {
                                  vehiculo.marca
                                }{" "}
                                ·{" "}
                                {
                                  vehiculo.modelo
                                }
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Calendar className="h-4 w-4 text-gray-400" />

                              {
                                vehiculo.año
                              }
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Palette className="h-4 w-4 text-gray-400" />

                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full border"
                                  style={{
                                    backgroundColor:
                                      vehiculo.color.toLowerCase(),
                                  }}
                                />

                                {
                                  vehiculo.color
                                }
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* CONDUCTOR */}

                        <TableCell className="px-6 py-5">
                          {usuario ? (
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-[#39A900]/10 flex items-center justify-center">
                                <UserCircle2 className="h-7 w-7 text-[#39A900]" />
                              </div>

                              <div>
                                <div className="font-semibold text-gray-900">
                                  {
                                    usuario.nombre
                                  }
                                </div>

                                <div className="text-sm text-gray-500">
                                  {
                                    usuario.identificacion
                                  }
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              Sin conductor
                            </span>
                          )}
                        </TableCell>

                        {/* ESTADO */}

                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <Badge
                              className={
                                vehiculo.estado ===
                                "activo"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-red-100 text-red-700 border border-red-200"
                              }
                            >
                              {
                                vehiculo.estado
                              }
                            </Badge>

                            <Switch
                              checked={
                                vehiculo.estado ===
                                "activo"
                              }
                              onCheckedChange={(
                                checked
                              ) =>
                                handleChangeEstado(
                                  vehiculo.id,
                                  checked
                                    ? "activo"
                                    : "inactivo"
                                )
                              }
                            />
                          </div>
                        </TableCell>

                        {/* ACCIONES */}

                        <TableCell className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-xl border-gray-200"
                              onClick={() =>
                                handleViewVehiculo(
                                  vehiculo
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-xl border-gray-200"
                              onClick={() =>
                                handleOpenDialog(
                                  vehiculo
                                )
                              }
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() =>
                                handleDelete(
                                  vehiculo.id
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG CREAR / EDITAR */}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="max-w-4xl bg-white border-0 rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-[#39A900] to-[#2D7D00] px-6 py-5">
            <DialogTitle className="text-white text-2xl font-bold">
              {editingVehiculo
                ? "Editar Vehículo"
                : "Registrar Vehículo"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="p-6 grid grid-cols-2 gap-5">
              <div className="col-span-2 space-y-2">
                <Label>
                  Conductor
                </Label>

                <Select
                  value={
                    formData.conductorId
                  }
                  onValueChange={(
                    value
                  ) =>
                    setFormData({
                      ...formData,
                      conductorId:
                        value,
                    })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
                    <SelectValue placeholder="Seleccionar conductor" />
                  </SelectTrigger>

                  <SelectContent>
                    {conductores.map(
                      (
                        conductor
                      ) => {
                        const usuario =
                          usuarios.find(
                            (
                              u
                            ) =>
                              u.id ===
                              conductor.usuarioId
                          );

                        return (
                          <SelectItem
                            key={
                              conductor.id
                            }
                            value={
                              conductor.id
                            }
                          >
                            {
                              usuario?.nombre
                            }{" "}
                            -{" "}
                            {
                              usuario?.identificacion
                            }
                          </SelectItem>
                        );
                      }
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Placa
                </Label>

                <Input
                  className="h-11 rounded-xl border-gray-200 uppercase"
                  value={
                    formData.placa
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      placa:
                        e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="ABC123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Tipo Vehículo
                </Label>

                <Select
                  value={
                    formData.tipo
                  }
                  onValueChange={(
                    value:
                      | "carro"
                      | "moto"
                  ) =>
                    setFormData({
                      ...formData,
                      tipo: value,
                    })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="carro">
                      Carro
                    </SelectItem>

                    <SelectItem value="moto">
                      Moto
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Marca
                </Label>

                <Input
                  className="h-11 rounded-xl border-gray-200"
                  value={
                    formData.marca
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      marca:
                        e.target.value,
                    })
                  }
                  placeholder="Toyota, Yamaha..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Modelo
                </Label>

                <Input
                  className="h-11 rounded-xl border-gray-200"
                  value={
                    formData.modelo
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      modelo:
                        e.target.value,
                    })
                  }
                  placeholder="Corolla, FZ..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Año
                </Label>

                <Input
                  type="number"
                  className="h-11 rounded-xl border-gray-200"
                  value={
                    formData.año
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      año: parseInt(
                        e.target.value
                      ),
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Color
                </Label>

                <Input
                  className="h-11 rounded-xl border-gray-200"
                  value={
                    formData.color
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      color:
                        e.target.value,
                    })
                  }
                  placeholder="Blanco, Negro..."
                  required
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>
                  Descripción
                </Label>

                <Textarea
                  rows={4}
                  className="rounded-2xl border-gray-200"
                  value={
                    formData.descripcion
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descripcion:
                        e.target.value,
                    })
                  }
                  placeholder="Características adicionales del vehículo..."
                />
              </div>

              <div className="col-span-2 flex items-center justify-between rounded-2xl border border-gray-200 p-4 bg-[#F8FAF8]">
                <div>
                  <div className="font-semibold text-gray-900">
                    Estado del Vehículo
                  </div>

                  <div className="text-sm text-gray-500">
                    Controla la disponibilidad en el sistema
                  </div>
                </div>

                <Switch
                  checked={
                    formData.estado ===
                    "activo"
                  }
                  onCheckedChange={(
                    checked
                  ) =>
                    setFormData({
                      ...formData,
                      estado: checked
                        ? "activo"
                        : "inactivo",
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter className="px-6 py-5 border-t bg-gray-50">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() =>
                  setDialogOpen(false)
                }
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="bg-[#39A900] hover:bg-[#2D7D00] rounded-xl"
              >
                {editingVehiculo
                  ? "Actualizar Vehículo"
                  : "Registrar Vehículo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW VEHÍCULO */}

      <Dialog
        open={viewDialogOpen}
        onOpenChange={
          setViewDialogOpen
        }
      >
        <DialogContent className="max-w-xl bg-white border-0 rounded-3xl overflow-hidden p-0">
          {viewingVehiculo &&
            (() => {
              const usuario =
                getUsuarioConductor(
                  viewingVehiculo.conductorId
                );

              const tipoStyle =
                getTipoStyles(
                  viewingVehiculo.tipo
                );

              const TipoIcon =
                tipoStyle.icon;

              return (
                <>
                  <div className="bg-gradient-to-r from-[#39A900] to-[#2D7D00] px-6 py-8 text-white">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-3xl bg-white/15 flex items-center justify-center mb-4">
                        <TipoIcon className="h-14 w-14" />
                      </div>

                      <h2 className="text-3xl font-black tracking-wide">
                        {
                          viewingVehiculo.placa
                        }
                      </h2>

                      <div className="flex gap-2 mt-3">
                        <Badge
                          className={`capitalize border ${tipoStyle.bg} ${tipoStyle.text} ${tipoStyle.border}`}
                        >
                          {
                            viewingVehiculo.tipo
                          }
                        </Badge>

                        <Badge
                          className={
                            viewingVehiculo.estado ===
                            "activo"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                          }
                        >
                          {
                            viewingVehiculo.estado
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {[
                      {
                        label:
                          "Marca",
                        value:
                          viewingVehiculo.marca,
                      },

                      {
                        label:
                          "Modelo",
                        value:
                          viewingVehiculo.modelo,
                      },

                      {
                        label:
                          "Año",
                        value:
                          viewingVehiculo.año,
                      },

                      {
                        label:
                          "Color",
                        value:
                          viewingVehiculo.color,
                      },

                      {
                        label:
                          "Conductor",
                        value:
                          usuario
                            ? `${usuario.nombre} - ${usuario.identificacion}`
                            : "Sin conductor",
                      },
                    ].map((item) => (
                      <div
                        key={
                          item.label
                        }
                        className="rounded-2xl border border-gray-200 p-4"
                      >
                        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                          {
                            item.label
                          }
                        </div>

                        <div className="font-semibold text-gray-900">
                          {
                            item.value
                          }
                        </div>
                      </div>
                    ))}

                    {viewingVehiculo.descripcion && (
                      <div className="rounded-2xl border border-gray-200 p-4">
                        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                          Descripción
                        </div>

                        <div className="text-gray-700 text-sm leading-relaxed">
                          {
                            viewingVehiculo.descripcion
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="px-6 py-5 border-t bg-gray-50">
                    <Button
                      variant="outline"
                      className="rounded-xl"
                      onClick={() =>
                        setViewDialogOpen(
                          false
                        )
                      }
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