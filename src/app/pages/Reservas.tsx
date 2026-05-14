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

import {
  useData,
  Reserva,
} from "../context/DataContext";

export function Reservas() {
  const {
    reservas,
    addReserva,
    updateReserva,
    deleteReserva,
    vehiculos,
    celdas,
    conductores,
    usuarios,
    parqueaderos,
  } = useData();

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [viewDialogOpen, setViewDialogOpen] =
    useState(false);

  const [editingReserva, setEditingReserva] =
    useState<Reserva | null>(null);

  const [viewingReserva, setViewingReserva] =
    useState<Reserva | null>(null);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filterEstado, setFilterEstado] =
    useState<
      | "todos"
      | "pendiente"
      | "activa"
      | "completada"
      | "cancelada"
    >("todos");

  const [formData, setFormData] =
    useState({
      vehiculoId: "",
      celdaId: "",
      fechaReserva:
        new Date()
          .toISOString()
          .split("T")[0],
      horaInicio: "08:00",
      horaFin: "18:00",
      estado:
        "pendiente" as
          | "pendiente"
          | "activa"
          | "completada"
          | "cancelada",
    });

  const handleOpenDialog = (
    reserva?: Reserva
  ) => {
    if (reserva) {
      setEditingReserva(reserva);

      setFormData({
        vehiculoId:
          reserva.vehiculoId,
        celdaId: reserva.celdaId,
        fechaReserva:
          reserva.fechaReserva,
        horaInicio:
          reserva.horaInicio,
        horaFin:
          reserva.horaFin,
        estado: reserva.estado,
      });
    } else {
      setEditingReserva(null);

      setFormData({
        vehiculoId: "",
        celdaId: "",
        fechaReserva:
          new Date()
            .toISOString()
            .split("T")[0],
        horaInicio: "08:00",
        horaFin: "18:00",
        estado: "pendiente",
      });
    }

    setDialogOpen(true);
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (editingReserva) {
      updateReserva(
        editingReserva.id,
        formData
      );

      toast.success(
        "Reserva actualizada correctamente"
      );
    } else {
      addReserva(formData);

      toast.success(
        "Reserva registrada correctamente"
      );
    }

    setDialogOpen(false);
  };

  const handleDelete = (
    id: string
  ) => {
    if (
      confirm(
        "¿Desea eliminar esta reserva?"
      )
    ) {
      deleteReserva(id);

      toast.success(
        "Reserva eliminada correctamente"
      );
    }
  };

  const handleViewReserva = (
    reserva: Reserva
  ) => {
    setViewingReserva(reserva);

    setViewDialogOpen(true);
  };

  const getVehiculo = (
    vehiculoId: string
  ) =>
    vehiculos.find(
      (v) => v.id === vehiculoId
    );

  const getCelda = (
    celdaId: string
  ) =>
    celdas.find(
      (c) => c.id === celdaId
    );

  const getParqueadero = (
    parqueaderoId: string
  ) =>
    parqueaderos.find(
      (p) =>
        p.id === parqueaderoId
    );

  const getConductorVehiculo = (
    vehiculoId: string
  ) => {
    const vehiculo =
      getVehiculo(vehiculoId);

    if (!vehiculo) return null;

    return conductores.find(
      (c) =>
        c.id ===
        vehiculo.conductorId
    );
  };

  const getUsuarioConductor = (
    vehiculoId: string
  ) => {
    const conductor =
      getConductorVehiculo(
        vehiculoId
      );

    if (!conductor) return null;

    return usuarios.find(
      (u) =>
        u.id === conductor.usuarioId
    );
  };

  const celdasDisponibles =
    celdas.filter(
      (c) =>
        c.estado ===
          "disponible" ||
        c.estado === "reservada"
    );

  const filteredReservas =
    useMemo(() => {
      return reservas.filter(
        (reserva) => {
          const vehiculo =
            getVehiculo(
              reserva.vehiculoId
            );

          const celda =
            getCelda(
              reserva.celdaId
            );

          const usuario =
            getUsuarioConductor(
              reserva.vehiculoId
            );

          const matchesSearch =
            vehiculo?.placa
              .toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              ) ||
            celda?.numero
              .toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              ) ||
            usuario?.nombre
              .toLowerCase()
              .includes(
                searchTerm.toLowerCase()
              ) ||
            reserva.fechaReserva.includes(
              searchTerm
            );

          const matchesEstado =
            filterEstado ===
            "todos"
              ? true
              : reserva.estado ===
                filterEstado;

          return (
            matchesSearch &&
            matchesEstado
          );
        }
      );
    }, [
      reservas,
      searchTerm,
      filterEstado,
    ]);

  const getEstadoStyles = (
    estado: string
  ) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";

      case "activa":
        return "bg-green-100 text-green-700 border border-green-200";

      case "completada":
        return "bg-blue-100 text-blue-700 border border-blue-200";

      case "cancelada":
        return "bg-red-100 text-red-700 border border-red-200";

      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const reservasPendientes =
    reservas.filter(
      (r) =>
        r.estado === "pendiente"
    ).length;

  const reservasActivas =
    reservas.filter(
      (r) => r.estado === "activa"
    ).length;

  const reservasCompletadas =
    reservas.filter(
      (r) =>
        r.estado ===
        "completada"
    ).length;

  const reservasCanceladas =
    reservas.filter(
      (r) =>
        r.estado === "cancelada"
    ).length;

  return (
    <div className="space-y-5 p-5 bg-[#F5F7F5] min-h-screen">
      {/* HEADER */}

      <div className="rounded-3xl bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-7 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Calendar className="h-4 w-4" />
              Gestión Institucional SENA
            </div>

            <h1 className="text-4xl font-black leading-tight">
              Gestión de Reservas
            </h1>

            <p className="text-sm text-white/80 mt-2 max-w-2xl">
              Administra reservas de
              vehículos, horarios,
              disponibilidad y control
              operativo de parqueaderos.
            </p>
          </div>

          <Button
            onClick={() =>
              handleOpenDialog()
            }
            className="bg-white text-[#2D7D00] hover:bg-white/90 h-12 px-6 rounded-xl font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Pendientes",
            value:
              reservasPendientes,
            icon: Clock3,
            color:
              "text-yellow-600",
            bg: "bg-yellow-100",
          },

          {
            label: "Activas",
            value: reservasActivas,
            icon: CheckCircle2,
            color:
              "text-green-600",
            bg: "bg-green-100",
          },

          {
            label: "Completadas",
            value:
              reservasCompletadas,
            icon: Calendar,
            color:
              "text-blue-600",
            bg: "bg-blue-100",
          },

          {
            label: "Canceladas",
            value:
              reservasCanceladas,
            icon: XCircle,
            color:
              "text-red-600",
            bg: "bg-red-100",
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

              <Input
                placeholder="Buscar por placa, conductor, celda o fecha..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
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
                Todos los estados
              </option>

              <option value="pendiente">
                Pendientes
              </option>

              <option value="activa">
                Activas
              </option>

              <option value="completada">
                Completadas
              </option>

              <option value="cancelada">
                Canceladas
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
                    Conductor
                  </TableHead>

                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Ubicación
                  </TableHead>

                  <TableHead className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Horario
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
                {filteredReservas.map(
                  (reserva) => {
                    const vehiculo =
                      getVehiculo(
                        reserva.vehiculoId
                      );

                    const celda =
                      getCelda(
                        reserva.celdaId
                      );

                    const usuario =
                      getUsuarioConductor(
                        reserva.vehiculoId
                      );

                    const parqueadero =
                      celda
                        ? getParqueadero(
                            celda.parqueaderoId
                          )
                        : null;

                    return (
                      <TableRow
                        key={
                          reserva.id
                        }
                        className="border-b border-gray-100 hover:bg-[#F8FAF8]"
                      >
                        {/* VEHICULO */}

                        <TableCell className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#39A900]/10 flex items-center justify-center">
                              <Car className="h-7 w-7 text-[#39A900]" />
                            </div>

                            <div>
                              <div className="font-black text-gray-900 text-lg tracking-wide">
                                {
                                  vehiculo?.placa
                                }
                              </div>

                              <div className="text-sm text-gray-500">
                                {
                                  vehiculo?.marca
                                }{" "}
                                ·{" "}
                                {
                                  vehiculo?.modelo
                                }
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* CONDUCTOR */}

                        <TableCell className="px-6 py-5">
                          {usuario && (
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                <UserCircle2 className="h-7 w-7 text-blue-600" />
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
                          )}
                        </TableCell>

                        {/* UBICACION */}

                        <TableCell className="px-6 py-5">
                          <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 rounded-xl bg-[#F5F7F5] px-3 py-2">
                              <MapPin className="h-4 w-4 text-[#39A900]" />

                              <span className="font-semibold text-gray-900">
                                Celda{" "}
                                {
                                  celda?.numero
                                }
                              </span>
                            </div>

                            <div className="text-sm text-gray-500">
                              {
                                parqueadero?.nombre
                              }
                            </div>
                          </div>
                        </TableCell>

                        {/* HORARIO */}

                        <TableCell className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="font-semibold text-gray-900">
                              {
                                reserva.fechaReserva
                              }
                            </div>

                            <div className="text-sm text-gray-500">
                              {
                                reserva.horaInicio
                              }{" "}
                              -{" "}
                              {
                                reserva.horaFin
                              }
                            </div>
                          </div>
                        </TableCell>

                        {/* ESTADO */}

                        <TableCell className="px-6 py-5">
                          <Badge
                            className={getEstadoStyles(
                              reserva.estado
                            )}
                          >
                            {
                              reserva.estado
                            }
                          </Badge>
                        </TableCell>

                        {/* ACCIONES */}

                        <TableCell className="px-6 py-5">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-xl border-gray-200"
                              onClick={() =>
                                handleViewReserva(
                                  reserva
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
                                  reserva
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
                                  reserva.id
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
    </div>
  );
}