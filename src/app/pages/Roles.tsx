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
} from "lucide-react";

import { Button } from "../components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
        filterEstado === "todos" ? true : rol.estado === filterEstado;

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
      confirm("¿Desea eliminar este rol? Esta acción no se puede deshacer.")
    ) {
      deleteRol(rol.id);

      toast.success("Rol eliminado correctamente");
    }
  };

  const handleDuplicate = (rol: Rol) => {
    addRol({
      ...rol,
      nombre: `${rol.nombre} Copia`,
    });

    toast.success("Rol duplicado correctamente");
  };

  const handleTogglePermiso = (permiso: keyof typeof formData.permisos) => {
    setFormData({
      ...formData,

      permisos: {
        ...formData.permisos,

        [permiso]: !formData.permisos[permiso],
      },
    });
  };

  const countActivePermisos = (permisos: typeof formData.permisos) => {
    return Object.values(permisos).filter(Boolean).length;
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case "Administrador":
        return "bg-red-500/10 text-red-500 border-red-500/20";

      case "Supervisor":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";

      case "Operador":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";

      default:
        return "bg-green-500/10 text-green-500 border-green-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Roles</h1>

          <p className="text-sm text-gray-400 mt-1">
            Administra permisos y accesos del sistema
          </p>
        </div>

        <Button
          onClick={() => handleOpenDialog()}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      {/* RESUMEN */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="text-sm text-gray-400">Roles Totales</div>

            <div className="text-3xl font-bold text-white mt-1">
              {roles.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="text-sm text-gray-400">Roles Activos</div>

            <div className="text-3xl font-bold text-green-500 mt-1">
              {roles.filter((r) => r.estado === "activo").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="text-sm text-gray-400">Roles Protegidos</div>

            <div className="text-3xl font-bold text-red-500 mt-1">
              {ROLES_PROTEGIDOS.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="text-sm text-gray-400">Permisos del Sistema</div>

            <div className="text-3xl font-bold text-blue-500 mt-1">
              {Object.keys(initialPermisos).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS */}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

          <Input
            placeholder="Buscar rol..."
            className="pl-10 bg-zinc-900 border-zinc-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="bg-zinc-900 border border-zinc-800 rounded-md px-3 text-sm text-white"
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value as any)}
        >
          <option value="todos">Todos</option>

          <option value="activo">Activos</option>

          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      {/* LISTADO */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredRoles.map((rol) => {
          const permisosActivos = countActivePermisos(rol.permisos);

          const protegido = ROLES_PROTEGIDOS.includes(rol.nombre);

          return (
            <Card
              key={rol.id}
              className="bg-zinc-900 border-zinc-800 hover:border-green-600 transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-500" />
                    </div>

                    <div>
                      <CardTitle className="text-white text-lg">
                        {rol.nombre}
                      </CardTitle>

                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getRolColor(rol.nombre)}>
                          {rol.estado}
                        </Badge>

                        {protegido && (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                            <Lock className="h-3 w-3 mr-1" />
                            Protegido
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {rol.descripcion}
                </p>

                {/* PERMISOS */}

                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(rol.permisos)
                    .filter(([_, value]) => value)
                    .slice(0, 4)
                    .map(([key]) => (
                      <Badge
                        key={key}
                        className="bg-zinc-800 text-gray-300 border-zinc-700"
                      >
                        {
                          Object.values(PERMISOS)
                            .flatMap((group) => Object.entries(group))
                            .find(([k]) => k === key)?.[1]
                        }
                      </Badge>
                    ))}

                  {permisosActivos > 4 && (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      +{permisosActivos - 4}
                    </Badge>
                  )}
                </div>

                {/* INFO */}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    12 usuarios
                  </div>

                  <div>
                    {permisosActivos}/{Object.keys(rol.permisos).length}{" "}
                    permisos
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                    onClick={() => {
                      setViewingRol(rol);

                      setViewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                    onClick={() => handleOpenDialog(rol)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 bg-zinc-800 text-blue-400 hover:bg-zinc-700"
                    onClick={() => handleDuplicate(rol)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>

                  {!protegido && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 bg-zinc-800 text-red-500 hover:bg-red-500/10"
                      onClick={() => handleDelete(rol)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* DIALOG */}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-6xl bg-zinc-950 border-zinc-800 text-white overflow-hidden p-0">
          {/* HEADER */}

          <DialogHeader className="px-5 pt-5 pb-3 border-b border-zinc-800">
            <DialogTitle className="text-lg font-semibold">
              {editingRol ? "Editar Rol" : "Crear Nuevo Rol"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="p-5 space-y-4">
              {/* TOP SECTION */}

              <div className="grid grid-cols-2 gap-4">
                {/* NOMBRE */}

                <div>
                  <Label className="text-xs text-gray-400">
                    Nombre del Rol
                  </Label>

                  <Input
                    className="bg-zinc-900 border-zinc-800 mt-1 h-9 text-sm"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombre: e.target.value,
                      })
                    }
                  />
                </div>

                {/* DESCRIPCIÓN */}

                <div>
                  <Label className="text-xs text-gray-400">Descripción</Label>

                  <Textarea
                    className="bg-zinc-900 border-zinc-800 mt-1 h-9 min-h-[36px] resize-none text-sm"
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* PERMISOS */}

              <div className="grid grid-cols-4 gap-2">
                {Object.entries(PERMISOS).map(([grupo, permisos]) => (
                  <div
                    key={grupo}
                    className="border border-zinc-800 rounded-md p-2 bg-zinc-900/30"
                  >
                    {/* TITULO */}

                    <div className="text-[10px] font-semibold text-green-500 uppercase mb-2 tracking-wider">
                      {grupo}
                    </div>

                    {/* ITEMS */}

                    <div className="space-y-1">
                      {Object.entries(permisos).map(([key, label]) => (
                        <div key={key} className="flex items-center gap-2 h-6">
                          <Checkbox
                            checked={
                              formData.permisos[
                                key as keyof typeof formData.permisos
                              ]
                            }
                            onCheckedChange={() =>
                              handleTogglePermiso(
                                key as keyof typeof formData.permisos,
                              )
                            }
                          />

                          <span className="text-[11px] text-gray-300 leading-none">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ESTADO */}

              {/* ESTADO */}

              <div className="flex items-center justify-between border border-zinc-800 rounded-md px-3 py-2 bg-zinc-900/40">
                <div>
                  <div className="text-xs text-gray-400">Estado del Rol</div>

                  <div className="text-sm text-white">
                    {formData.estado === "activo" ? "Activo" : "Inactivo"}
                  </div>
                </div>

                <Switch
                  checked={formData.estado === "activo"}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      estado: checked ? "activo" : "inactivo",
                    })
                  }
                  disabled={!editingRol}
                />
              </div>
            </div>

            {/* FOOTER */}

            <DialogFooter className="px-5 py-3 border-t border-zinc-800 bg-zinc-950">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>

              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {editingRol ? "Actualizar Rol" : "Crear Rol"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VER DETALLE */}

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="w-[88vw] max-w-2xl bg-zinc-950 border border-zinc-800 text-white p-0 overflow-hidden rounded-lg scale-[0.92]">
          {/* HEADER */}

          <DialogHeader className="px-3 py-2 border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-green-500/10 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-500" />
                </div>

                <div>
                  <DialogTitle className="text-sm font-semibold text-white">
                    {viewingRol?.nombre}
                  </DialogTitle>

                  <div className="flex gap-2 mt-1">
                    <Badge className={getRolColor(viewingRol?.nombre || "")}>
                      {viewingRol?.estado}
                    </Badge>

                    {viewingRol &&
                      ROLES_PROTEGIDOS.includes(viewingRol.nombre) && (
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                          <Lock className="h-3 w-3 mr-1" />
                          Protegido
                        </Badge>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* BODY */}

          {viewingRol && (
            <div className="p-3 space-y-3">
              {/* DESCRIPCION */}

              <div className="bg-zinc-900 border border-zinc-800 rounded-md p-3">
                <div className="text-[10px] uppercase text-gray-500 mb-1">
                  Descripción
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {viewingRol.descripcion}
                </p>
              </div>

              {/* STATS */}

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-900 border border-zinc-800 rounded-md p-2">
                  <div className="text-[10px] text-gray-500 uppercase">
                    Usuarios
                  </div>

                  <div className="text-base font-semibold text-white mt-1">
                    12
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-md p-2">
                  <div className="text-[10px] text-gray-500 uppercase">
                    Permisos
                  </div>

                  <div className="text-base font-semibold text-green-500 mt-1">
                    {countActivePermisos(viewingRol.permisos)}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-md p-2">
                  <div className="text-[10px] text-gray-500 uppercase">
                    Estado
                  </div>

                  <div className="mt-1">
                    <Badge
                      className={
                        viewingRol.estado === "activo"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                      }
                    >
                      {viewingRol.estado}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* PERMISOS */}

              <div>
                <h3 className="text-xs font-semibold text-white mb-2">
                  Permisos del Rol
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PERMISOS).map(([grupo, permisos]) => (
                    <div
                      key={grupo}
                      className="bg-zinc-900 border border-zinc-800 rounded-md p-2"
                    >
                      {/* TITULO */}

                      <div className="text-[10px] uppercase tracking-wider text-green-500 font-semibold mb-2">
                        {grupo}
                      </div>

                      {/* ITEMS */}

                      <div className="space-y-1">
                        {Object.entries(permisos).map(([key, label]) => {
                          const activo =
                            viewingRol.permisos[
                              key as keyof typeof viewingRol.permisos
                            ];

                          return (
                            <div
                              key={key}
                              className={`flex items-center justify-between rounded px-2 py-[3px] text-[11px] ${
                                activo
                                  ? "bg-green-500/10 text-green-400"
                                  : "bg-zinc-800 text-gray-500"
                              }`}
                            >
                              <span>{label}</span>

                              <div
                                className={`w-2 h-2 rounded-full ${
                                  activo ? "bg-green-400" : "bg-gray-600"
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}

          <DialogFooter className="px-3 py-2 border-t border-zinc-800 bg-zinc-950">
            <Button
              variant="outline"
              className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 h-8 text-xs"
              onClick={() => setViewDialogOpen(false)}
            >
              Cerrar
            </Button>

            {viewingRol && (
              <Button
                className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenDialog(viewingRol);
                }}
              >
                <Pencil className="h-3 w-3 mr-2" />
                Editar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
