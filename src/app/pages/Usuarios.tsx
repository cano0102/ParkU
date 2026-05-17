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
  Sparkles,
  CheckCircle2,
  XCircle,
  UserCheck,
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

import { useData, Usuario } from "../context/DataContext";

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

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [viewDialogOpen, setViewDialogOpen] =
    useState(false);

  const [editingUsuario, setEditingUsuario] =
    useState<Usuario | null>(null);

  const [viewingUsuario, setViewingUsuario] =
    useState<Usuario | null>(null);

  const [search, setSearch] = useState("");

  const [filterEstado, setFilterEstado] =
    useState<
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
    estado: "activo" as
      | "activo"
      | "inactivo",
  });

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter((usuario) => {
      const matchesSearch =
        usuario.nombre
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        usuario.correo
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        usuario.identificacion.includes(
          search,
        );

      const matchesEstado =
        filterEstado === "todos"
          ? true
          : usuario.estado ===
            filterEstado;

      return (
        matchesSearch && matchesEstado
      );
    });
  }, [usuarios, search, filterEstado]);

  const handleOpenDialog = (
    usuario?: Usuario,
  ) => {
    if (usuario) {
      setEditingUsuario(usuario);

      setFormData({
        correo: usuario.correo,
        password: usuario.password,
        nombre: usuario.nombre,
        numero: usuario.numero,
        rol: usuario.rol,
        tipoDocumento:
          usuario.tipoDocumento,
        identificacion:
          usuario.identificacion,
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

  const handleSubmit = (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (editingUsuario) {
      updateUsuario(
        editingUsuario.id,
        formData,
      );

      toast.success(
        "Usuario actualizado correctamente",
      );
    } else {
      addUsuario(formData);

      toast.success(
        "Usuario creado correctamente",
      );
    }

    setDialogOpen(false);
  };

  const handleDelete = (
    usuario: Usuario,
  ) => {
    const protegido =
      USUARIOS_PROTEGIDOS.includes(
        usuario.correo,
      );

    if (protegido) {
      toast.error(
        "Este usuario está protegido",
      );

      return;
    }

    if (
      confirm(
        "¿Desea eliminar este usuario?",
      )
    ) {
      deleteUsuario(usuario.id);

      toast.success(
        "Usuario eliminado",
      );
    }
  };

  const handleDuplicate = (
    usuario: Usuario,
  ) => {
    addUsuario({
      ...usuario,
      correo: `copia_${usuario.correo}`,
      identificacion: `${usuario.identificacion}_copy`,
    });

    toast.success(
      "Usuario duplicado",
    );
  };

  const handleChangeEstado = (
    id: string,
    nuevoEstado:
      | "activo"
      | "inactivo",
  ) => {
    updateUsuario(id, {
      estado: nuevoEstado,
    });

    toast.success(
      `Usuario ${
        nuevoEstado === "activo"
          ? "activado"
          : "desactivado"
      }`,
    );
  };

  const getRoleColor = (
    rol: string,
  ) => {
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

      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#39A900] via-[#2F8F00] to-[#1F5F00] p-8 text-white shadow-2xl">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
          {/* LEFT */}

          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur-xl">
              <Shield className="h-4 w-4" />
              Gestión institucional de
              accesos
            </div>

            <h1 className="text-5xl font-black leading-none tracking-tight md:text-6xl">
              Gestión de Usuarios
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
              Administra usuarios,
              permisos, accesos y
              perfiles del sistema
              institucional del SENA
              con control total y
              seguridad avanzada.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
                <div className="text-xs text-white/70">
                  Usuarios activos
                </div>

                <div className="mt-1 text-2xl font-black">
                  {
                    usuarios.filter(
                      (u) =>
                        u.estado ===
                        "activo",
                    ).length
                  }
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
                <div className="text-xs text-white/70">
                  Roles asignados
                </div>

                <div className="mt-1 text-2xl font-black">
                  {roles.length}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl">
                <div className="text-xs text-white/70">
                  Seguridad
                </div>

                <div className="mt-1 text-2xl font-black">
                  Alta
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="grid grid-cols-2 gap-4 xl:w-[360px]">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-wide text-white/70">
                Usuarios totales
              </div>

              <div className="mt-2 text-4xl font-black">
                {usuarios.length}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-wide text-white/70">
                Activos
              </div>

              <div className="mt-2 text-4xl font-black">
                {
                  usuarios.filter(
                    (u) =>
                      u.estado ===
                      "activo",
                  ).length
                }
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-wide text-white/70">
                Inactivos
              </div>

              <div className="mt-2 text-4xl font-black">
                {
                  usuarios.filter(
                    (u) =>
                      u.estado ===
                      "inactivo",
                  ).length
                }
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-wide text-white/70">
                Protegidos
              </div>

              <div className="mt-2 text-4xl font-black">
                {
                  USUARIOS_PROTEGIDOS.length
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOPBAR */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />

            <Input
              placeholder="Buscar usuario..."
              className="h-12 rounded-2xl border-zinc-200 bg-white pl-10 shadow-sm"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value,
                )
              }
            />
          </div>

          <select
            className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm shadow-sm outline-none"
            value={filterEstado}
            onChange={(e) =>
              setFilterEstado(
                e.target
                  .value as any,
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

        <Button
          onClick={() =>
            handleOpenDialog()
          }
          className="h-12 rounded-2xl bg-[#39A900] px-6 font-bold shadow-lg hover:bg-[#2D7D00]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* GRID */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
        {filteredUsuarios.map(
          (usuario) => {
            const protegido =
              USUARIOS_PROTEGIDOS.includes(
                usuario.correo,
              );

            return (
              <Card
                key={usuario.id}
                className="group overflow-hidden rounded-[30px] border border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#39A900]/30 hover:shadow-2xl"
              >
                {/* TOP */}

                <div className="border-b border-zinc-100 bg-gradient-to-b from-zinc-50/80 to-white p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      {/* AVATAR */}

                      <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#39A900]/20 to-[#2D7D00]/10 ring-4 ring-[#39A900]/10">
                        <UserCircle className="h-8 w-8 text-[#39A900]" />

                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-green-500" />
                      </div>

                      <div>
                        <h2 className="text-2xl font-black text-zinc-900">
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

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Badge
                            className={`rounded-full border px-3 py-1 font-semibold shadow-sm ${getRoleColor(
                              usuario.rol,
                            )}`}
                          >
                            {usuario.rol}
                          </Badge>

                          <Badge
                            className={
                              usuario.estado ===
                              "activo"
                                ? "rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-600"
                                : "rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-600"
                            }
                          >
                            {
                              usuario.estado
                            }
                          </Badge>

                          {protegido && (
                            <Badge className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-600">
                              <Lock className="mr-1 h-3 w-3" />
                              Protegido
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Switch
                      checked={
                        usuario.estado ===
                        "activo"
                      }
                      onCheckedChange={(
                        checked,
                      ) =>
                        handleChangeEstado(
                          usuario.id,
                          checked
                            ? "activo"
                            : "inactivo",
                        )
                      }
                    />
                  </div>

                  {/* CONTACT */}

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-700 shadow-sm">
                      <Mail className="h-4 w-4 text-[#39A900]" />

                      {usuario.correo}
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-700 shadow-sm">
                      <Phone className="h-4 w-4 text-[#39A900]" />

                      {usuario.numero}
                    </div>
                  </div>
                </div>

                {/* BODY */}

                <CardContent className="space-y-5 p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        Estado
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-sm font-bold text-zinc-900">
                        {usuario.estado ===
                        "activo" ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            Inactivo
                          </>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        Seguridad
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-sm font-bold text-zinc-900">
                        <Shield className="h-4 w-4 text-[#39A900]" />
                        Institucional
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}

                  <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/60 px-5 py-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <UserCheck className="h-4 w-4 text-[#39A900]" />
                      Usuario registrado
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-xl border-zinc-200 shadow-sm transition-all hover:scale-105 hover:border-[#39A900]/30 hover:bg-[#39A900]/5"
                        onClick={() => {
                          setViewingUsuario(
                            usuario,
                          );

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
                        className="rounded-xl border-zinc-200 shadow-sm transition-all hover:scale-105 hover:border-[#39A900]/30 hover:bg-[#39A900]/5"
                        onClick={() =>
                          handleOpenDialog(
                            usuario,
                          )
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className="rounded-xl border-zinc-200 text-blue-600 shadow-sm transition-all hover:scale-105 hover:border-blue-300 hover:bg-blue-50"
                        onClick={() =>
                          handleDuplicate(
                            usuario,
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      {!protegido && (
                        <Button
                          size="icon"
                          variant="outline"
                          className="rounded-xl border-red-200 text-red-600 shadow-sm transition-all hover:scale-105 hover:bg-red-50"
                          onClick={() =>
                            handleDelete(
                              usuario,
                            )
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
          },
        )}
      </div>

      {/* DIALOG CREATE / EDIT */}

      <Dialog
        open={dialogOpen}
        onOpenChange={
          setDialogOpen
        }
      >
        <DialogContent className="max-w-5xl overflow-hidden rounded-[32px] border-none bg-white p-0 shadow-2xl">
          <DialogHeader className="border-b border-zinc-100 px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-2xl font-black text-zinc-900">
              <Sparkles className="h-5 w-5 text-[#39A900]" />

              {editingUsuario
                ? "Editar Usuario"
                : "Nuevo Usuario"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <Label>
                    Tipo Documento
                  </Label>

                  <Select
                    value={
                      formData.tipoDocumento
                    }
                    onValueChange={(
                      value,
                    ) =>
                      setFormData({
                        ...formData,
                        tipoDocumento:
                          value,
                      })
                    }
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-2xl border-zinc-200 bg-zinc-50/50">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="CC">
                        Cédula
                      </SelectItem>

                      <SelectItem value="TI">
                        TI
                      </SelectItem>

                      <SelectItem value="CE">
                        CE
                      </SelectItem>

                      <SelectItem value="PPTE">
                        PPTE
                      </SelectItem>

                      <SelectItem value="PA">
                        Pasaporte
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>
                    Identificación
                  </Label>

                  <Input
                    className="mt-2 h-12 rounded-2xl border-zinc-200 bg-zinc-50/50"
                    value={
                      formData.identificacion
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        identificacion:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>
                    Nombre completo
                  </Label>

                  <Input
                    className="mt-2 h-12 rounded-2xl border-zinc-200 bg-zinc-50/50"
                    value={
                      formData.nombre
                    }
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
                  <Label>Correo</Label>

                  <Input
                    className="mt-2 h-12 rounded-2xl border-zinc-200 bg-zinc-50/50"
                    value={
                      formData.correo
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        correo:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>
                    Contraseña
                  </Label>

                  <Input
                    type="password"
                    className="mt-2 h-12 rounded-2xl border-zinc-200 bg-zinc-50/50"
                    value={
                      formData.password
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        password:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>
                    Teléfono
                  </Label>

                  <Input
                    className="mt-2 h-12 rounded-2xl border-zinc-200 bg-zinc-50/50"
                    value={
                      formData.numero
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numero:
                          e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Rol</Label>

                  <Select
                    value={formData.rol}
                    onValueChange={(
                      value,
                    ) =>
                      setFormData({
                        ...formData,
                        rol: value,
                      })
                    }
                  >
                    <SelectTrigger className="mt-2 h-12 rounded-2xl border-zinc-200 bg-zinc-50/50">
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>

                    <SelectContent>
                      {roles
                        .filter(
                          (rol) =>
                            rol.estado ===
                            "activo",
                        )
                        .map((rol) => (
                          <SelectItem
                            key={rol.id}
                            value={
                              rol.nombre
                            }
                          >
                            {
                              rol.nombre
                            }
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* ESTADO */}

              <div className="flex items-center justify-between rounded-3xl border border-zinc-200 bg-zinc-50 p-5">
                <div>
                  <div className="text-sm font-bold text-zinc-900">
                    Estado del usuario
                  </div>

                  <div className="mt-1 text-sm text-zinc-500">
                    Activa o desactiva
                    el acceso al
                    sistema.
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {formData.estado ===
                  "activo" ? (
                    <Badge className="border-green-200 bg-green-50 text-green-600">
                      Activo
                    </Badge>
                  ) : (
                    <Badge className="border-red-200 bg-red-50 text-red-600">
                      Inactivo
                    </Badge>
                  )}

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
                {editingUsuario
                  ? "Actualizar Usuario"
                  : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}