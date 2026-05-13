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
  Users,
  UserCheck,
  UserX,
  Layers3,
} from "lucide-react";

import { Button } from "../components/ui/button";

import {
  Card,
  CardContent,
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
    const protegido =
      USUARIOS_PROTEGIDOS.includes(usuario.correo);

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
        return "bg-red-100 text-red-700 border-red-200";

      case "Supervisor":
        return "bg-blue-100 text-blue-700 border-blue-200";

      case "Operador":
        return "bg-amber-100 text-amber-700 border-amber-200";

      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  return (
    <div className="space-y-5 p-5 bg-[#F5F7F5] min-h-screen">
      {/* HEADER */}

      <div className="rounded-3xl bg-gradient-to-r from-[#39A900] to-[#2D7D00] p-7 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Shield className="h-4 w-4" />
              Administración Institucional
            </div>

            <h1 className="text-4xl font-black leading-tight">
              Gestión de Usuarios
            </h1>

            <p className="text-sm text-white/80 mt-2 max-w-2xl">
              Administra usuarios, accesos, roles y permisos
              del sistema institucional SENA.
            </p>
          </div>

          <Button
            onClick={() => handleOpenDialog()}
            className="bg-white text-[#2D7D00] hover:bg-white/90 h-12 px-6 rounded-xl font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Usuarios Totales",
            value: usuarios.length,
            icon: Users,
            color: "text-[#39A900]",
            bg: "bg-green-100",
          },

          {
            label: "Usuarios Activos",
            value: usuarios.filter(
              (u) => u.estado === "activo"
            ).length,
            icon: UserCheck,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },

          {
            label: "Usuarios Inactivos",
            value: usuarios.filter(
              (u) => u.estado === "inactivo"
            ).length,
            icon: UserX,
            color: "text-red-600",
            bg: "bg-red-100",
          },

          {
            label: "Roles Disponibles",
            value: roles.length,
            icon: Layers3,
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
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="pl-10 h-11 border-gray-200 rounded-xl"
              />
            </div>

            <select
              className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm"
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
        </CardContent>
      </Card>

      {/* TABLA */}

      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAF8] border-b border-gray-100">
                <tr className="text-left">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Usuario
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Contacto
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Rol
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Estado
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsuarios.map((usuario) => {
                  const protegido =
                    USUARIOS_PROTEGIDOS.includes(
                      usuario.correo
                    );

                  return (
                    <tr
                      key={usuario.id}
                      className="border-b border-gray-100 hover:bg-[#F8FAF8] transition-colors"
                    >
                      {/* USER */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-[#39A900]/10 flex items-center justify-center">
                            <UserCircle className="h-8 w-8 text-[#39A900]" />
                          </div>

                          <div>
                            <div className="font-bold text-gray-900">
                              {usuario.nombre}
                            </div>

                            <div className="text-sm text-gray-500 mt-1">
                              {usuario.tipoDocumento} ·{" "}
                              {usuario.identificacion}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CONTACTO */}

                      <td className="px-6 py-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {usuario.correo}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {usuario.numero}
                          </div>
                        </div>
                      </td>

                      {/* ROL */}

                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-2">
                          <Badge
                            className={`w-fit border ${getRoleColor(
                              usuario.rol
                            )}`}
                          >
                            {usuario.rol}
                          </Badge>

                          {protegido && (
                            <Badge className="w-fit bg-red-100 text-red-700 border border-red-200">
                              <Lock className="h-3 w-3 mr-1" />
                              Protegido
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* ESTADO */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <Badge
                            className={
                              usuario.estado === "activo"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-red-100 text-red-700 border border-red-200"
                            }
                          >
                            {usuario.estado}
                          </Badge>

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
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="rounded-xl border-gray-200"
                            onClick={() =>
                              handleViewUsuario(usuario)
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="outline"
                            className="rounded-xl border-gray-200"
                            onClick={() =>
                              handleOpenDialog(usuario)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="outline"
                            className="rounded-xl border-gray-200 text-blue-600"
                            onClick={() =>
                              handleDuplicate(usuario)
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>

                          {!protegido && (
                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() =>
                                handleDelete(usuario)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG CREAR / EDITAR */}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl bg-white border-0 rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-[#39A900] to-[#2D7D00] px-6 py-5">
            <DialogTitle className="text-white text-2xl font-bold">
              {editingUsuario
                ? "Editar Usuario"
                : "Nuevo Usuario"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="p-6 grid grid-cols-2 gap-5">
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
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
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
                  className="h-11 rounded-xl border-gray-200"
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
                  className="h-11 rounded-xl border-gray-200"
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
                  className="h-11 rounded-xl border-gray-200"
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
                  className="h-11 rounded-xl border-gray-200"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>

                <Input
                  className="h-11 rounded-xl border-gray-200"
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
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
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

              <div className="col-span-2 flex items-center justify-between rounded-2xl border border-gray-200 p-4 bg-[#F8FAF8]">
                <div>
                  <div className="font-semibold text-gray-900">
                    Estado del Usuario
                  </div>

                  <div className="text-sm text-gray-500">
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

            <DialogFooter className="px-6 py-5 border-t bg-gray-50">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                className="bg-[#39A900] hover:bg-[#2D7D00] rounded-xl"
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
        <DialogContent className="max-w-lg bg-white border-0 rounded-3xl overflow-hidden p-0">
          {viewingUsuario && (
            <>
              <div className="bg-gradient-to-r from-[#39A900] to-[#2D7D00] px-6 py-8 text-white">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-3xl bg-white/15 flex items-center justify-center mb-4">
                    <UserCircle className="h-14 w-14" />
                  </div>

                  <h2 className="text-2xl font-black">
                    {viewingUsuario.nombre}
                  </h2>

                  <div className="flex gap-2 mt-3">
                    <Badge
                      className={`border ${getRoleColor(
                        viewingUsuario.rol
                      )}`}
                    >
                      {viewingUsuario.rol}
                    </Badge>

                    <Badge
                      className={
                        viewingUsuario.estado ===
                        "activo"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }
                    >
                      {viewingUsuario.estado}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {[
                  {
                    label: "Correo",
                    value: viewingUsuario.correo,
                  },

                  {
                    label: "Documento",
                    value: `${viewingUsuario.tipoDocumento} - ${viewingUsuario.identificacion}`,
                  },

                  {
                    label: "Teléfono",
                    value: viewingUsuario.numero,
                  },

                  {
                    label: "Rol",
                    value: viewingUsuario.rol,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-gray-200 p-4"
                  >
                    <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      {item.label}
                    </div>

                    <div className="font-semibold text-gray-900">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter className="px-6 py-5 border-t bg-gray-50">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() =>
                    setViewDialogOpen(false)
                  }
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}