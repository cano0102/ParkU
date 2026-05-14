import React, { useMemo, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  UserCog,
  Car,
  ShieldCheck,
  UserCheck,
  UserX,
  Bike,
  Accessibility,
  Building2,
  Sparkles,
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

import { Textarea } from "../components/ui/textarea";

import { toast } from "sonner";

import { useData, Conductor } from "../context/DataContext";

export function Conductores() {
  const {
    conductores,
    addConductor,
    updateConductor,
    deleteConductor,
    usuarios,
    vehiculos,
    addVehiculo,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [viewDialogOpen, setViewDialogOpen] =
    useState(false);

  const [editingConductor, setEditingConductor] =
    useState<Conductor | null>(null);

  const [viewingConductor, setViewingConductor] =
    useState<Conductor | null>(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [formData, setFormData] = useState({
    usuarioId: "",
    tipoConductor:
      "aprendiz" as "aprendiz" | "instructor",
    centroFormacion: "",
    discapacidad: false,
    tipoDiscapacidad: "",
    estado: "activo" as
      | "activo"
      | "inactivo",

    placa: "",
    tipoVehiculo:
      "carro" as "carro" | "moto",
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    color: "",
    descripcion: "",
  });

  const getUsuario = (usuarioId: string) => {
    return usuarios.find(
      (u) => u.id === usuarioId,
    );
  };

  const getVehiculosConductor = (
    conductorId: string,
  ) => {
    return vehiculos.filter(
      (v) => v.conductorId === conductorId,
    );
  };

  const filteredConductores = useMemo(() => {
    return conductores.filter(
      (conductor) => {
        const usuario = getUsuario(
          conductor.usuarioId,
        );

        if (!usuario) return false;

        return (
          usuario.nombre
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase(),
            ) ||
          usuario.identificacion.includes(
            searchTerm,
          ) ||
          conductor.centroFormacion
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase(),
            )
        );
      },
    );
  }, [conductores, searchTerm]);

  const handleOpenDialog = (
    conductor?: Conductor,
  ) => {
    if (conductor) {
      setEditingConductor(conductor);

      const vehiculo = vehiculos.find(
        (v) =>
          v.conductorId === conductor.id,
      );

      setFormData({
        usuarioId: conductor.usuarioId,
        tipoConductor:
          conductor.tipoConductor,
        centroFormacion:
          conductor.centroFormacion,
        discapacidad:
          conductor.discapacidad,
        tipoDiscapacidad:
          conductor.tipoDiscapacidad ||
          "",
        estado: conductor.estado,

        placa: vehiculo?.placa || "",
        tipoVehiculo:
          vehiculo?.tipo || "carro",
        marca: vehiculo?.marca || "",
        modelo:
          vehiculo?.modelo || "",
        año:
          vehiculo?.año ||
          new Date().getFullYear(),
        color: vehiculo?.color || "",
        descripcion:
          vehiculo?.descripcion || "",
      });
    } else {
      setEditingConductor(null);

      setFormData({
        usuarioId: "",
        tipoConductor: "aprendiz",
        centroFormacion: "",
        discapacidad: false,
        tipoDiscapacidad: "",
        estado: "activo",

        placa: "",
        tipoVehiculo: "carro",
        marca: "",
        modelo: "",
        año: new Date().getFullYear(),
        color: "",
        descripcion: "",
      });
    }

    setDialogOpen(true);
  };

  const handleSubmit = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    const conductorData = {
      usuarioId: formData.usuarioId,
      tipoConductor:
        formData.tipoConductor,
      centroFormacion:
        formData.centroFormacion,
      discapacidad:
        formData.discapacidad,
      tipoDiscapacidad:
        formData.tipoDiscapacidad,
      estado: formData.estado,
    };

    if (editingConductor) {
      updateConductor(
        editingConductor.id,
        conductorData,
      );

      toast.success(
        "Conductor actualizado correctamente",
      );
    } else {
      addConductor(conductorData);

      const nuevoConductor =
        conductores[
          conductores.length - 1
        ];

      addVehiculo({
        conductorId:
          nuevoConductor?.id || "",
        placa: formData.placa,
        tipo: formData.tipoVehiculo,
        marca: formData.marca,
        modelo: formData.modelo,
        año: formData.año,
        color: formData.color,
        descripcion:
          formData.descripcion,
        estado: "activo",
      });

      toast.success(
        "Conductor creado correctamente",
      );
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        "¿Desea eliminar este conductor?",
      )
    ) {
      deleteConductor(id);

      toast.success(
        "Conductor eliminado correctamente",
      );
    }
  };

  const handleViewConductor = (
    conductor: Conductor,
  ) => {
    setViewingConductor(conductor);

    setViewDialogOpen(true);
  };

  const handleChangeEstado = (
    id: string,
    nuevoEstado:
      | "activo"
      | "inactivo",
  ) => {
    updateConductor(id, {
      estado: nuevoEstado,
    });

    toast.success(
      `Conductor ${
        nuevoEstado === "activo"
          ? "activado"
          : "desactivado"
      }`,
    );
  };

  return (
    <div className="space-y-6">
      {/* HERO */}

      <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-7 text-white">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Gestión institucional
            </div>

            <h1 className="text-4xl font-black md:text-5xl">
              Gestión de Conductores
            </h1>

            <p className="mt-4 max-w-2xl text-sm text-white/85 md:text-base">
              Administra conductores,
              aprendices, instructores y
              vehículos autorizados dentro
              del sistema institucional SENA.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Conductores
              </div>

              <div className="mt-1 text-3xl font-black">
                {conductores.length}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Vehículos
              </div>

              <div className="mt-1 text-3xl font-black">
                {vehiculos.length}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Activos
              </div>

              <div className="mt-1 text-3xl font-black">
                {
                  conductores.filter(
                    (c) =>
                      c.estado ===
                      "activo",
                  ).length
                }
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Instructores
              </div>

              <div className="mt-1 text-3xl font-black">
                {
                  conductores.filter(
                    (c) =>
                      c.tipoConductor ===
                      "instructor",
                  ).length
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOPBAR */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />

          <Input
            placeholder="Buscar conductor..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value,
              )
            }
            className="h-11 rounded-xl border-zinc-200 bg-white pl-10 shadow-sm"
          />
        </div>

        <Button
          onClick={() =>
            handleOpenDialog()
          }
          className="h-11 rounded-xl bg-[#39A900] px-5 hover:bg-[#2D7D00]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Conductor
        </Button>
      </div>

      {/* GRID */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        {filteredConductores.map(
          (conductor) => {
            const usuario = getUsuario(
              conductor.usuarioId,
            );

            const vehiculosConductor =
              getVehiculosConductor(
                conductor.id,
              );

            if (!usuario) return null;

            return (
              <Card
                key={conductor.id}
                className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                {/* TOP */}

                <div className="border-b border-zinc-100 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#39A900]/10">
                        <UserCog className="h-8 w-8 text-[#39A900]" />
                      </div>

                      <div>
                        <h2 className="text-xl font-black text-zinc-900">
                          {usuario.nombre}
                        </h2>

                        <div className="mt-1 text-sm text-zinc-500">
                          {
                            usuario.tipoDocumento
                          }{" "}
                          ·{" "}
                          {
                            usuario.identificacion
                          }
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge
                            className={
                              conductor.tipoConductor ===
                              "instructor"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }
                          >
                            {
                              conductor.tipoConductor
                            }
                          </Badge>

                          <Badge
                            className={
                              conductor.estado ===
                              "activo"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }
                          >
                            {
                              conductor.estado
                            }
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-center">
                      <div className="text-xs text-zinc-500">
                        Vehículos
                      </div>

                      <div className="text-2xl font-black text-[#39A900]">
                        {
                          vehiculosConductor.length
                        }
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        <Building2 className="h-3.5 w-3.5" />
                        Centro
                      </div>

                      <div className="mt-2 text-sm font-semibold text-zinc-800">
                        {
                          conductor.centroFormacion
                        }
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        <Accessibility className="h-3.5 w-3.5" />
                        Discapacidad
                      </div>

                      <div className="mt-2 text-sm font-semibold text-zinc-800">
                        {conductor.discapacidad
                          ? "Sí"
                          : "No"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BODY */}

                <CardContent className="space-y-5 p-5">
                  <div className="space-y-3">
                    {vehiculosConductor.map(
                      (vehiculo) => (
                        <div
                          key={vehiculo.id}
                          className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#39A900]/10">
                              {vehiculo.tipo ===
                              "moto" ? (
                                <Bike className="h-5 w-5 text-[#39A900]" />
                              ) : (
                                <Car className="h-5 w-5 text-[#39A900]" />
                              )}
                            </div>

                            <div>
                              <div className="font-bold text-zinc-900">
                                {
                                  vehiculo.placa
                                }
                              </div>

                              <div className="text-xs text-zinc-500">
                                {
                                  vehiculo.marca
                                }{" "}
                                ·{" "}
                                {
                                  vehiculo.modelo
                                }
                              </div>
                            </div>
                          </div>

                          <Badge className="border-zinc-200 bg-white text-zinc-700">
                            {
                              vehiculo.tipo
                            }
                          </Badge>
                        </div>
                      ),
                    )}
                  </div>

                  {/* FOOTER */}

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={
                          conductor.estado ===
                          "activo"
                        }
                        onCheckedChange={(
                          checked,
                        ) =>
                          handleChangeEstado(
                            conductor.id,
                            checked
                              ? "activo"
                              : "inactivo",
                          )
                        }
                      />

                      <span className="text-sm font-medium text-zinc-600">
                        Estado
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-zinc-200"
                        onClick={() =>
                          handleViewConductor(
                            conductor,
                          )
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="border-zinc-200"
                        onClick={() =>
                          handleOpenDialog(
                            conductor,
                          )
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() =>
                          handleDelete(
                            conductor.id,
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          },
        )}
      </div>

      {/* MODAL CREAR */}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="max-w-5xl overflow-hidden rounded-3xl border-none bg-white p-0">
          <DialogHeader className="border-b border-zinc-100 px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-2xl font-black text-zinc-900">
              <Sparkles className="h-5 w-5 text-[#39A900]" />

              {editingConductor
                ? "Editar Conductor"
                : "Nuevo Conductor"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label>
                    Usuario
                  </Label>

                  <Select
                    value={
                      formData.usuarioId
                    }
                    onValueChange={(
                      value,
                    ) =>
                      setFormData({
                        ...formData,
                        usuarioId: value,
                      })
                    }
                  >
                    <SelectTrigger className="mt-2 h-11 rounded-xl border-zinc-200">
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>

                    <SelectContent>
                      {usuarios.map(
                        (usuario) => (
                          <SelectItem
                            key={
                              usuario.id
                            }
                            value={
                              usuario.id
                            }
                          >
                            {
                              usuario.nombre
                            }{" "}
                            -{" "}
                            {
                              usuario.identificacion
                            }
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>
                    Tipo Conductor
                  </Label>

                  <Select
                    value={
                      formData.tipoConductor
                    }
                    onValueChange={(
                      value:
                        | "aprendiz"
                        | "instructor",
                    ) =>
                      setFormData({
                        ...formData,
                        tipoConductor:
                          value,
                      })
                    }
                  >
                    <SelectTrigger className="mt-2 h-11 rounded-xl border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="aprendiz">
                        Aprendiz
                      </SelectItem>

                      <SelectItem value="instructor">
                        Instructor
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>
                    Centro Formación
                  </Label>

                  <Input
                    className="mt-2 h-11 rounded-xl border-zinc-200"
                    value={
                      formData.centroFormacion
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        centroFormacion:
                          e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* VEHICULO */}

              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="mb-5 flex items-center gap-2">
                  <Car className="h-5 w-5 text-[#39A900]" />

                  <h3 className="text-lg font-black text-zinc-900">
                    Información del
                    Vehículo
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <Label>Placa</Label>

                    <Input
                      className="mt-2 h-11 rounded-xl border-zinc-200"
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
                    />
                  </div>

                  <div>
                    <Label>
                      Tipo Vehículo
                    </Label>

                    <Select
                      value={
                        formData.tipoVehiculo
                      }
                      onValueChange={(
                        value:
                          | "carro"
                          | "moto",
                      ) =>
                        setFormData({
                          ...formData,
                          tipoVehiculo:
                            value,
                        })
                      }
                    >
                      <SelectTrigger className="mt-2 h-11 rounded-xl border-zinc-200">
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

                  <div>
                    <Label>Marca</Label>

                    <Input
                      className="mt-2 h-11 rounded-xl border-zinc-200"
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
                    />
                  </div>

                  <div>
                    <Label>Modelo</Label>

                    <Input
                      className="mt-2 h-11 rounded-xl border-zinc-200"
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
                    />
                  </div>
                </div>
              </div>

              {/* ESTADO */}

              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">
                    Estado del
                    conductor
                  </div>

                  <div className="mt-1 text-sm text-zinc-500">
                    Activa o desactiva
                    el acceso.
                  </div>
                </div>

                <Switch
                  checked={
                    formData.estado ===
                    "activo"
                  }
                  onCheckedChange={(
                    checked,
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

            <DialogFooter className="border-t border-zinc-100 bg-zinc-50 px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-200"
                onClick={() =>
                  setDialogOpen(false)
                }
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="bg-[#39A900] hover:bg-[#2D7D00]"
              >
                {editingConductor
                  ? "Actualizar"
                  : "Crear Conductor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}