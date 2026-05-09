import React, { useMemo, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  UserCircle,
  Shield,
  Mail,
  Phone,
  Copy,
  Lock,
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

import { useData, Usuario } from "../context/DataContext";

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

const USUARIOS_PROTEGIDOS = [
  "admin@sena.edu.co",
  "superadmin@sena.edu.co",
];

export function Usuarios() {
  const {
    usuarios,
    addUsuario,
    updateUsuario,
    deleteUsuario,
    roles,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);

  const [viewDialogOpen, setViewDialogOpen] =
    useState(false);

  const [editingUsuario, setEditingUsuario] =
    useState<Usuario | null>(null);

  const [viewingUsuario, setViewingUsuario] =
    useState<Usuario | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [filterEstado, setFilterEstado] = useState<
    "todos" | "activo" | "inactivo"
  >("todos");

  const [formData, setFormData] = useState({
    correo: "",
    password: "",
    nombre: "",
    numero: "",
    rol: "",
    tipoDocumento: "CC",
    identificacion: "",
    estado: "activo" as "activo" | "inactivo",
  });

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchesSearch =
        usuario.nombre
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        usuario.correo
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        usuario.identificacion.includes(searchTerm);

      const matchesEstado =
        filterEstado === "todos"
          ? true
          : usuario.estado === filterEstado;

      return matchesSearch && matchesEstado;
    });
  }, [usuarios, searchTerm, filterEstado]);

  const handleOpenDialog = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);

      setFormData({
        correo: usuario.correo,
        password: usuario.password,
        nombre: usuario.nombre,
        numero: usuario.numero,
        rol: usuario.rol,
        tipoDocumento: usuario.tipoDocumento,
        identificacion: usuario.identificacion,
        estado: usuario.estado,
      });
    } else {
      setEditingUsuario(null);

      setFormData({
        correo: "",
        password: "",
        nombre: "",
        numero: "",
        rol: "",
        tipoDocumento: "CC",
        identificacion: "",
        estado: "activo",
      });
    }

    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUsuario) {
      updateUsuario(editingUsuario.id, formData);

      toast.success("Usuario actualizado");
    } else {
      addUsuario(formData);

      toast.success("Usuario creado");
    }

    setDialogOpen(false);
  };

  const handleDelete = (usuario: Usuario) => {
    const protegido = USUARIOS_PROTEGIDOS.includes(
      usuario.correo
    );

    if (protegido) {
      toast.error(
        "Este usuario está protegido y no puede eliminarse"
      );

      return;
    }

    if (
      confirm(
        "¿Desea eliminar este usuario? Esta acción no se puede deshacer."
      )
    ) {
      deleteUsuario(usuario.id);

      toast.success("Usuario eliminado");
    }
  };

  const handleDuplicate = (usuario: Usuario) => {
    addUsuario({
      ...usuario,
      correo: `copia_${usuario.correo}`,
      identificacion: `${usuario.identificacion}_copy`,
    });

    toast.success("Usuario duplicado");
  };

  const handleViewUsuario = (usuario: Usuario) => {
    setViewingUsuario(usuario);

    setViewDialogOpen(true);
  };

  const handleChangeEstado = (
    id: string,
    nuevoEstado: "activo" | "inactivo"
  ) => {
    updateUsuario(id, {
      estado: nuevoEstado,
    });

    toast.success(
      `Usuario ${
        nuevoEstado === "activo"
          ? "activado"
          : "desactivado"
      }`
    );
  };

  const getRoleColor = (rol: string) => {
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
          <h1 className="text-3xl font-bold text-white">
            Gestión de Usuarios
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Administra usuarios y accesos del sistema
          </p>
        </div>

        <Button
          onClick={() => handleOpenDialog()}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="text-sm text-gray-400">
              Usuarios Totales
            </div>

            <div className="text-3xl font-bold text-white mt-1">
              {usuarios.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="text-sm text-gray-400">
              Usuarios Activos
            </div>

            <div className="text-3xl font-bold text-green-500 mt-1">
              {
                usuarios.filter(
                  (u) => u.estado === "activo"
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="text-sm text-gray-400">
              Administradores
            </div>

            <div className="text-3xl font-bold text-red-500 mt-1">
              {
                usuarios.filter(
                  (u) => u.rol === "Administrador"
                ).length
              }
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-5">
            <div className="text-sm text-gray-400">
              Roles Disponibles
            </div>

            <div className="text-3xl font-bold text-blue-500 mt-1">
              {roles.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS */}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />

          <Input
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>

        <select
          className="bg-zinc-900 border border-zinc-800 rounded-md px-3 text-sm text-white"
          value={filterEstado}
          onChange={(e) =>
            setFilterEstado(e.target.value as any)
          }
        >
          <option value="todos">Todos</option>

          <option value="activo">Activos</option>

          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      {/* GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredUsuarios.map((usuario) => {
          const protegido =
            USUARIOS_PROTEGIDOS.includes(
              usuario.correo
            );

          return (
            <Card
              key={usuario.id}
              className="bg-zinc-900 border-zinc-800 hover:border-green-600 transition-all"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                      <UserCircle className="h-8 w-8 text-green-500" />
                    </div>

                    <div>
                      <CardTitle className="text-white text-lg">
                        {usuario.nombre}
                      </CardTitle>

                      <div className="flex gap-2 mt-1">
                        <Badge
                          className={getRoleColor(
                            usuario.rol
                          )}
                        >
                          {usuario.rol}
                        </Badge>

                        <Badge
                          variant={
                            usuario.estado === "activo"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {usuario.estado}
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
                {/* INFO */}

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Mail className="h-4 w-4 text-gray-500" />
                    {usuario.correo}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Phone className="h-4 w-4 text-gray-500" />
                    {usuario.numero}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Shield className="h-4 w-4 text-gray-500" />
                    {usuario.tipoDocumento} -{" "}
                    {usuario.identificacion}
                  </div>
                </div>

                {/* ESTADO */}

                <div className="flex items-center justify-between border border-zinc-800 rounded-lg p-3 mb-4">
                  <div>
                    <div className="text-sm text-white">
                      Estado
                    </div>

                    <div className="text-xs text-gray-500">
                      Activar / Desactivar acceso
                    </div>
                  </div>

                  <Switch
                    checked={
                      usuario.estado === "activo"
                    }
                    onCheckedChange={(checked) =>
                      handleChangeEstado(
                        usuario.id,
                        checked
                          ? "activo"
                          : "inactivo"
                      )
                    }
                  />
                </div>

                {/* ACTIONS */}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                    onClick={() =>
                      handleViewUsuario(usuario)
                    }
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700"
                    onClick={() =>
                      handleOpenDialog(usuario)
                    }
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 bg-zinc-800 text-blue-400 hover:bg-zinc-700"
                    onClick={() =>
                      handleDuplicate(usuario)
                    }
                  >
                    <Copy className="h-3 w-3" />
                  </Button>

                  {!protegido && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 bg-zinc-800 text-red-500 hover:bg-red-500/10"
                      onClick={() =>
                        handleDelete(usuario)
                      }
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

      {/* DIALOG CREAR / EDITAR */}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingUsuario
                ? "Editar Usuario"
                : "Nuevo Usuario"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Tipo Documento</Label>

                <Select
                  value={formData.tipoDocumento}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      tipoDocumento: value,
                    })
                  }
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="CC">
                      Cédula
                    </SelectItem>

                    <SelectItem value="TI">
                      Tarjeta de Identidad
                    </SelectItem>

                    <SelectItem value="CE">
                      Extranjería
                    </SelectItem>

                    <SelectItem value="PA">
                      Pasaporte
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Identificación</Label>

                <Input
                  className="bg-zinc-900 border-zinc-800"
                  value={formData.identificacion}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      identificacion:
                        e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label>Nombre Completo</Label>

                <Input
                  className="bg-zinc-900 border-zinc-800"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Correo</Label>

                <Input
                  type="email"
                  className="bg-zinc-900 border-zinc-800"
                  value={formData.correo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      correo: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Contraseña</Label>

                <Input
                  type="password"
                  className="bg-zinc-900 border-zinc-800"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                  placeholder={
                    editingUsuario
                      ? "Sin cambios"
                      : ""
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>

                <Input
                  className="bg-zinc-900 border-zinc-800"
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      numero: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>

                <Select
                  value={formData.rol}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      rol: value,
                    })
                  }
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>

                  <SelectContent>
                    {roles
                      .filter(
                        (rol) =>
                          rol.estado === "activo"
                      )
                      .map((rol) => (
                        <SelectItem
                          key={rol.id}
                          value={rol.nombre}
                        >
                          {rol.nombre}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 flex items-center justify-between border border-zinc-800 rounded-lg p-4">
                <div>
                  <div className="text-sm text-white">
                    Estado del Usuario
                  </div>

                  <div className="text-xs text-gray-500">
                    Controla el acceso al sistema
                  </div>
                </div>

                <Switch
                  checked={
                    formData.estado === "activo"
                  }
                  onCheckedChange={(checked) =>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
              >
                {editingUsuario
                  ? "Actualizar Usuario"
                  : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW USER */}

      <Dialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      >
        <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>
              Información del Usuario
            </DialogTitle>
          </DialogHeader>

          {viewingUsuario && (
            <div className="space-y-5 py-4">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                  <UserCircle className="h-14 w-14 text-green-500" />
                </div>

                <h2 className="text-xl font-bold">
                  {viewingUsuario.nombre}
                </h2>

                <div className="flex gap-2 mt-2">
                  <Badge
                    className={getRoleColor(
                      viewingUsuario.rol
                    )}
                  >
                    {viewingUsuario.rol}
                  </Badge>

                  <Badge
                    variant={
                      viewingUsuario.estado ===
                      "activo"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {viewingUsuario.estado}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 border border-zinc-800 rounded-lg p-4">
                <div>
                  <div className="text-xs text-gray-500">
                    Correo
                  </div>

                  <div className="text-sm">
                    {viewingUsuario.correo}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    Documento
                  </div>

                  <div className="text-sm">
                    {
                      viewingUsuario.tipoDocumento
                    }{" "}
                    -{" "}
                    {
                      viewingUsuario.identificacion
                    }
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    Teléfono
                  </div>

                  <div className="text-sm">
                    {viewingUsuario.numero}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-500">
                    Rol
                  </div>

                  <div className="text-sm">
                    {viewingUsuario.rol}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              className="border-zinc-700"
              onClick={() =>
                setViewDialogOpen(false)
              }
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}