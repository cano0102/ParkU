import React, { useMemo, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Shield,
  Search,
  Copy,
  Lock,
  Users,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers3,
  ShieldCheck,
} from "lucide-react";

import { Button } from "../components/ui/button";

import {
  Card,
  CardContent,
} from "../components/ui/card";

import { Input } from "../components/ui/input";

import { Label } from "../components/ui/label";

import { useData, Rol } from "../context/DataContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

import { Badge } from "../components/ui/badge";

import { Switch } from "../components/ui/switch";

import { Textarea } from "../components/ui/textarea";

import { Checkbox } from "../components/ui/checkbox";

import { toast } from "sonner";

const ROLES_PROTEGIDOS = ["Administrador", "SuperAdmin"];

const PERMISOS = {
  administracion: {
    usuarios: "Usuarios",
    roles: "Roles",
    dashboard: "Dashboard",
  },

  operaciones: {
    entradaSalida: "Entrada / Salida",
    reservas: "Reservas",
    asignaciones: "Asignaciones",
  },

  parqueadero: {
    parqueaderos: "Parqueaderos",
    celdas: "Celdas",
    vehiculos: "Vehículos",
    conductores: "Conductores",
  },

  seguridad: {
    incidentes: "Incidentes",
    reconocimientoPlacas: "Reconocimiento",
  },
};

const initialPermisos = {
  dashboard: false,
  roles: false,
  usuarios: false,
  conductores: false,
  vehiculos: false,
  parqueaderos: false,
  celdas: false,
  asignaciones: false,
  entradaSalida: false,
  reservas: false,
  incidentes: false,
  reconocimientoPlacas: false,
};

export function Roles() {
  const { roles, addRol, updateRol, deleteRol } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [editingRol, setEditingRol] = useState<Rol | null>(null);

  const [viewingRol, setViewingRol] = useState<Rol | null>(null);

  const [search, setSearch] = useState("");

  const [filterEstado, setFilterEstado] = useState<
    "todos" | "activo" | "inactivo"
  >("todos");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    permisos: initialPermisos,
    estado: "activo" as "activo" | "inactivo",
  });

  const filteredRoles = useMemo(() => {
    return roles.filter((rol) => {
      const matchesSearch = rol.nombre
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesEstado =
        filterEstado === "todos"
          ? true
          : rol.estado === filterEstado;

      return matchesSearch && matchesEstado;
    });
  }, [roles, search, filterEstado]);

  const handleOpenDialog = (rol?: Rol) => {
    if (rol) {
      setEditingRol(rol);

      setFormData({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos,
        estado: rol.estado,
      });
    } else {
      setEditingRol(null);

      setFormData({
        nombre: "",
        descripcion: "",
        permisos: initialPermisos,
        estado: "activo",
      });
    }

    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRol) {
      updateRol(editingRol.id, formData);

      toast.success("Rol actualizado correctamente");
    } else {
      addRol(formData);

      toast.success("Rol creado correctamente");
    }

    setDialogOpen(false);
  };

  const handleDelete = (rol: Rol) => {
    if (ROLES_PROTEGIDOS.includes(rol.nombre)) {
      toast.error("Este rol está protegido");

      return;
    }

    if (
      confirm("¿Desea eliminar este rol?")
    ) {
      deleteRol(rol.id);

      toast.success("Rol eliminado");
    }
  };

  const handleDuplicate = (rol: Rol) => {
    addRol({
      ...rol,
      nombre: `${rol.nombre} Copia`,
    });

    toast.success("Rol duplicado");
  };

  const handleTogglePermiso = (
    permiso: keyof typeof formData.permisos,
  ) => {
    setFormData({
      ...formData,

      permisos: {
        ...formData.permisos,

        [permiso]:
          !formData.permisos[permiso],
      },
    });
  };

  const countActivePermisos = (
    permisos: typeof formData.permisos,
  ) => {
    return Object.values(permisos).filter(Boolean)
      .length;
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case "Administrador":
        return "bg-red-50 text-red-600 border-red-200";

      case "Supervisor":
        return "bg-blue-50 text-blue-600 border-blue-200";

      case "Operador":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      default:
        return "bg-green-50 text-green-700 border-green-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* HERO */}

      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-7 text-white">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Seguridad y permisos
            </div>

            <h1 className="text-4xl font-black leading-none md:text-5xl">
              Gestión de Roles
            </h1>

            <p className="mt-4 max-w-2xl text-sm text-white/85 md:text-base">
              Administra accesos, permisos y niveles
              de seguridad del sistema institucional.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-[340px]">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Roles activos
              </div>

              <div className="mt-1 text-3xl font-black">
                {
                  roles.filter(
                    (r) => r.estado === "activo",
                  ).length
                }
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Protegidos
              </div>

              <div className="mt-1 text-3xl font-black">
                {ROLES_PROTEGIDOS.length}
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Permisos
              </div>

              <div className="mt-1 text-3xl font-black">
                {
                  Object.keys(initialPermisos)
                    .length
                }
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-xs text-white/70">
                Roles totales
              </div>

              <div className="mt-1 text-3xl font-black">
                {roles.length}
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
              placeholder="Buscar rol..."
              className="h-11 rounded-xl border-zinc-200 bg-white pl-10 shadow-sm"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <select
            className="h-11 rounded-xl border border-zinc-200 bg-white px-4 text-sm shadow-sm outline-none"
            value={filterEstado}
            onChange={(e) =>
              setFilterEstado(e.target.value as any)
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

        <Button
          onClick={() => handleOpenDialog()}
          className="h-11 rounded-xl bg-[#39A900] px-5 hover:bg-[#2D7D00]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Rol
        </Button>
      </div>

      {/* GRID */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        {filteredRoles.map((rol) => {
          const permisosActivos =
            countActivePermisos(
              rol.permisos,
            );

          const protegido =
            ROLES_PROTEGIDOS.includes(
              rol.nombre,
            );

          return (
            <Card
              key={rol.id}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              {/* TOP */}

              <div className="border-b border-zinc-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#39A900]/10">
                      <Shield className="h-6 w-6 text-[#39A900]" />
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-zinc-900">
                        {rol.nombre}
                      </h2>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge
                          className={getRolColor(
                            rol.nombre,
                          )}
                        >
                          {rol.estado}
                        </Badge>

                        {protegido && (
                          <Badge className="border-red-200 bg-red-50 text-red-600">
                            <Lock className="mr-1 h-3 w-3" />
                            Protegido
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-zinc-100 px-3 py-2 text-right">
                    <div className="text-xs text-zinc-500">
                      Permisos
                    </div>

                    <div className="text-lg font-black text-[#39A900]">
                      {permisosActivos}
                    </div>
                  </div>
                </div>

                <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                  {rol.descripcion}
                </p>
              </div>

              {/* BODY */}

              <CardContent className="space-y-5 p-5">
                {/* PROGRESS */}

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-500">
                      Nivel de acceso
                    </span>

                    <span className="font-bold text-zinc-900">
                      {
                        Math.round(
                          (permisosActivos /
                            Object.keys(
                              rol.permisos,
                            ).length) *
                            100,
                        )
                      }
                      %
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full bg-[#39A900]"
                      style={{
                        width: `${
                          (permisosActivos /
                            Object.keys(
                              rol.permisos,
                            ).length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* PERMISOS */}

                <div className="flex flex-wrap gap-2">
                  {Object.entries(rol.permisos)
                    .filter(
                      ([_, value]) => value,
                    )
                    .slice(0, 5)
                    .map(([key]) => (
                      <Badge
                        key={key}
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-700"
                      >
                        {
                          Object.values(
                            PERMISOS,
                          )
                            .flatMap((group) =>
                              Object.entries(
                                group,
                              ),
                            )
                            .find(
                              ([k]) =>
                                k === key,
                            )?.[1]
                        }
                      </Badge>
                    ))}

                  {permisosActivos > 5 && (
                    <Badge className="rounded-full border border-[#39A900]/20 bg-[#39A900]/10 text-[#39A900]">
                      +
                      {permisosActivos - 5}
                    </Badge>
                  )}
                </div>

                {/* FOOT */}

                <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      12 usuarios
                    </div>

                    <div className="flex items-center gap-1">
                      <Layers3 className="h-4 w-4" />
                      {
                        Object.keys(
                          rol.permisos,
                        ).length
                      }
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-zinc-200"
                      onClick={() => {
                        setViewingRol(rol);

                        setViewDialogOpen(
                          true,
                        );
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      className="border-zinc-200"
                      onClick={() =>
                        handleOpenDialog(rol)
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="outline"
                      className="border-zinc-200 text-blue-600"
                      onClick={() =>
                        handleDuplicate(rol)
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    {!protegido && (
                      <Button
                        size="icon"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() =>
                          handleDelete(rol)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CREATE / EDIT */}

     {/* CREATE / EDIT */}

{/* CREATE / EDIT */}

<Dialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
>
  <DialogContent className="max-h-[95vh] max-w-7xl overflow-hidden rounded-[32px] border-none bg-[#F5F7F4] p-0">
    {/* HEADER */}

    <div className="relative overflow-hidden border-b border-zinc-200 bg-white px-8 py-6">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#39A900]/10 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#39A900]/10">
              <ShieldCheck className="h-6 w-6 text-[#39A900]" />
            </div>

            <Badge className="border-[#39A900]/20 bg-[#39A900]/10 px-4 py-1 text-[#2D7D00]">
              Seguridad avanzada
            </Badge>
          </div>

          <h2 className="text-4xl font-black tracking-tight text-zinc-900">
            {editingRol
              ? "Editar Rol"
              : "Nuevo Rol"}
          </h2>

          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Configura permisos, accesos y
            restricciones del rol dentro del
            sistema institucional.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:w-[320px]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-zinc-500">
              Permisos activos
            </div>

            <div className="mt-1 text-3xl font-black text-[#39A900]">
              {countActivePermisos(
                formData.permisos,
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-zinc-500">
              Nivel acceso
            </div>

            <div className="mt-1 text-3xl font-black text-zinc-900">
              {Math.round(
                (countActivePermisos(
                  formData.permisos,
                ) /
                  Object.keys(
                    formData.permisos,
                  ).length) *
                  100,
              )}
              %
            </div>
          </div>
        </div>
      </div>
    </div>

    <form
      onSubmit={handleSubmit}
      className="overflow-y-auto"
    >
      <div className="grid grid-cols-1 gap-8 p-8 xl:grid-cols-[1.2fr_.8fr]">
        {/* LEFT */}

        <div className="space-y-6">
          {/* INFO */}

          <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#39A900]/10">
                <Sparkles className="h-5 w-5 text-[#39A900]" />
              </div>

              <div>
                <h3 className="text-lg font-black text-zinc-900">
                  Información general
                </h3>

                <p className="text-sm text-zinc-500">
                  Datos principales del rol.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <Label className="text-sm font-semibold text-zinc-700">
                  Nombre del rol
                </Label>

                <Input
                  placeholder="Ej: Supervisor"
                  className="mt-2 h-12 rounded-2xl border-zinc-200 bg-zinc-50"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-zinc-700">
                  Estado
                </Label>

                <div className="mt-2 flex h-12 items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4">
                  <div className="flex items-center gap-2">
                    {formData.estado ===
                    "activo" ? (
                      <Badge className="border-green-200 bg-green-50 text-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Activo
                      </Badge>
                    ) : (
                      <Badge className="border-red-200 bg-red-50 text-red-600">
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactivo
                      </Badge>
                    )}
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
            </div>

            <div className="mt-5">
              <Label className="text-sm font-semibold text-zinc-700">
                Descripción
              </Label>

              <Textarea
                placeholder="Describe el alcance y funciones del rol..."
                className="mt-2 min-h-[120px] rounded-2xl border-zinc-200 bg-zinc-50"
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
              />
            </div>
          </div>

          {/* PERMISOS */}

          <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-zinc-900">
                  Gestión de permisos
                </h3>

                <p className="text-sm text-zinc-500">
                  Controla accesos y módulos
                  del sistema.
                </p>
              </div>

              <div className="rounded-2xl bg-[#39A900]/10 px-4 py-2 text-sm font-bold text-[#2D7D00]">
                {
                  Object.keys(
                    formData.permisos,
                  ).length
                }{" "}
                módulos
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {Object.entries(
                PERMISOS,
              ).map(
                ([grupo, permisos]) => (
                  <div
                    key={grupo}
                    className="rounded-[28px] border border-zinc-200 bg-zinc-50 p-5"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wide text-zinc-900">
                          {grupo}
                        </h3>

                        <p className="text-xs text-zinc-500">
                          Gestión y accesos
                        </p>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#39A900]/10">
                        <Shield className="h-4 w-4 text-[#39A900]" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(
                        permisos,
                      ).map(
                        ([key, label]) => {
                          const activo =
                            formData
                              .permisos[
                              key as keyof typeof formData.permisos
                            ];

                          return (
                            <div
                              key={key}
                              className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
                                activo
                                  ? "border-[#39A900]/30 bg-[#39A900]/10"
                                  : "border-zinc-200 bg-white"
                              }`}
                            >
                              <div>
                                <div className="font-semibold text-zinc-900">
                                  {label}
                                </div>

                                <div className="text-xs text-zinc-500">
                                  Acceso al
                                  módulo
                                </div>
                              </div>

                              <Checkbox
                                checked={
                                  activo
                                }
                                onCheckedChange={() =>
                                  handleTogglePermiso(
                                    key as keyof typeof formData.permisos,
                                  )
                                }
                              />
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div className="sticky top-0 h-fit">
          <div className="overflow-hidden rounded-[32px] border border-zinc-200 bg-white shadow-xl">
            {/* TOP */}

            <div className="bg-gradient-to-br from-[#39A900] to-[#2D7D00] p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <Shield className="h-7 w-7" />
                </div>

                <Badge className="border-white/20 bg-white/15 text-white">
                  Vista previa
                </Badge>
              </div>

              <div className="mt-6">
                <div className="text-xs uppercase tracking-[0.25em] text-white/70">
                  Rol
                </div>

                <h3 className="mt-2 text-4xl font-black leading-none">
                  {formData.nombre ||
                    "ADMINISTRADOR"}
                </h3>

                <p className="mt-3 text-sm text-white/80">
                  {
                    formData.descripcion
                  }
                </p>
              </div>

              {/* LEVEL */}

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/80">
                    Nivel de acceso
                  </span>

                  <span className="font-bold">
                    {Math.round(
                      (countActivePermisos(
                        formData.permisos,
                      ) /
                        Object.keys(
                          formData.permisos,
                        ).length) *
                        100,
                    )}
                    %
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{
                      width: `${
                        (countActivePermisos(
                          formData.permisos,
                        ) /
                          Object.keys(
                            formData
                              .permisos,
                          ).length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* TAGS */}

              <div className="mt-6 flex flex-wrap gap-2">
                {Object.entries(
                  formData.permisos,
                )
                  .filter(
                    ([_, value]) =>
                      value,
                  )
                  .slice(0, 8)
                  .map(([key]) => (
                    <Badge
                      key={key}
                      className="rounded-full border-none bg-white/15 text-white backdrop-blur"
                    >
                      {
                        Object.values(
                          PERMISOS,
                        )
                          .flatMap(
                            (group) =>
                              Object.entries(
                                group,
                              ),
                          )
                          .find(
                            ([k]) =>
                              k === key,
                          )?.[1]
                      }
                    </Badge>
                  ))}
              </div>
            </div>

            {/* BODY */}

            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                  Estado del rol
                </div>

                <div className="flex items-center gap-2">
                  {formData.estado ===
                  "activo" ? (
                    <>
                      <div className="h-2.5 w-2.5 rounded-full bg-green-500" />

                      <span className="font-semibold text-green-700">
                        Rol activo y operativo
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-2.5 w-2.5 rounded-full bg-red-500" />

                      <span className="font-semibold text-red-700">
                        Rol deshabilitado
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                      Resumen
                    </div>

                    <div className="mt-1 text-lg font-black text-zinc-900">
                      Accesos habilitados
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#39A900]/10 px-4 py-2 text-xl font-black text-[#39A900]">
                    {countActivePermisos(
                      formData.permisos,
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(
                    formData.permisos,
                  )
                    .filter(
                      ([_, value]) =>
                        value,
                    )
                    .slice(0, 6)
                    .map(([key]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-xl bg-white px-4 py-3"
                      >
                        <span className="text-sm font-medium text-zinc-700">
                          {
                            Object.values(
                              PERMISOS,
                            )
                              .flatMap(
                                (
                                  group,
                                ) =>
                                  Object.entries(
                                    group,
                                  ),
                              )
                              .find(
                                ([k]) =>
                                  k ===
                                  key,
                              )?.[1]
                          }
                        </span>

                        <CheckCircle2 className="h-4 w-4 text-[#39A900]" />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}

      <DialogFooter className="sticky bottom-0 border-t border-zinc-200 bg-white/90 px-8 py-5 backdrop-blur">
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-2xl border-zinc-200 px-6"
          onClick={() =>
            setDialogOpen(false)
          }
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          className="h-12 rounded-2xl bg-[#39A900] px-8 text-sm font-bold hover:bg-[#2D7D00]"
        >
          {editingRol
            ? "Actualizar Rol"
            : "Crear Rol"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

      {/* VIEW */}

      <Dialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      >
        <DialogContent className="max-w-3xl overflow-hidden rounded-3xl border-none bg-white p-0">
          {viewingRol && (
            <>
              <div className="bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                      <Shield className="h-8 w-8" />
                    </div>

                    <div>
                      <h2 className="text-3xl font-black">
                        {viewingRol.nombre}
                      </h2>

                      <div className="mt-2 flex gap-2">
                        <Badge className="border-white/20 bg-white/15 text-white">
                          {
                            viewingRol.estado
                          }
                        </Badge>

                        {ROLES_PROTEGIDOS.includes(
                          viewingRol.nombre,
                        ) && (
                          <Badge className="border-red-200 bg-red-500/20 text-white">
                            Protegido
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                    <div className="text-xs text-white/70">
                      Permisos activos
                    </div>

                    <div className="text-3xl font-black">
                      {countActivePermisos(
                        viewingRol.permisos,
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Descripción
                  </div>

                  <p className="text-sm leading-relaxed text-zinc-700">
                    {
                      viewingRol.descripcion
                    }
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(PERMISOS).map(
                    ([grupo, permisos]) => (
                      <div
                        key={grupo}
                        className="rounded-2xl border border-zinc-200 p-4"
                      >
                        <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-zinc-900">
                          {grupo}
                        </h3>

                        <div className="space-y-2">
                          {Object.entries(
                            permisos,
                          ).map(
                            ([key, label]) => {
                              const activo =
                                viewingRol
                                  .permisos[
                                  key as keyof typeof viewingRol.permisos
                                ];

                              return (
                                <div
                                  key={key}
                                  className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                                    activo
                                      ? "bg-[#39A900]/10 text-[#2D7D00]"
                                      : "bg-zinc-100 text-zinc-400"
                                  }`}
                                >
                                  <span className="text-sm font-medium">
                                    {label}
                                  </span>

                                  <div
                                    className={`h-2.5 w-2.5 rounded-full ${
                                      activo
                                        ? "bg-[#39A900]"
                                        : "bg-zinc-300"
                                    }`}
                                  />
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <DialogFooter className="border-t border-zinc-100 bg-zinc-50 px-6 py-4">
                <Button
                  variant="outline"
                  className="border-zinc-200"
                  onClick={() =>
                    setViewDialogOpen(false)
                  }
                >
                  Cerrar
                </Button>

                <Button
                  className="bg-[#39A900] hover:bg-[#2D7D00]"
                  onClick={() => {
                    setViewDialogOpen(false);

                    handleOpenDialog(
                      viewingRol,
                    );
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
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