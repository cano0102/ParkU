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
  Lock,
  Sparkles,
  CheckCircle2,
  XCircle,
  UserCheck,
  X,
  Users,
  UserX,
  IdCard,
  KeyRound,
  ChevronDown,
} from "lucide-react";

import { Button }                                    from "../components/ui/button";
import { Input }                                     from "../components/ui/input";
import { Label }                                     from "../components/ui/label";
import { Switch }                                    from "../components/ui/switch";
import { Badge }                                     from "../components/ui/badge";
import { Dialog, DialogContent, DialogFooter }       from "../components/ui/dialog";
import { Select, SelectContent, SelectItem,
         SelectTrigger, SelectValue }                from "../components/ui/select";
import { useData, Usuario }                          from "../context/DataContext";
import { toast }                                     from "sonner";

/* ─── constants ─── */
const USUARIOS_PROTEGIDOS = [
  "admin@sena.edu.co",
  "superadmin@sena.edu.co",
];

/* ─── role accent ─── */
function getRoleAccent(rol: string) {
  switch (rol) {
    case "Administrador": return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", dot: "#EF4444" };
    case "SuperAdmin":    return { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6" };
    case "Supervisor":    return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB" };
    case "Operador":      return { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B" };
    default:              return { bg: "#ECFDF5", text: "#166534", border: "#A7F3D0", dot: "#39A900" };
  }
}

/* ─── avatar initials ─── */
function getInitials(nombre: string) {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* ─── avatar bg palette ─── */
const AVATAR_COLORS = [
  ["#39A900", "#2D7D00"],
  ["#2563EB", "#1D4ED8"],
  ["#8B5CF6", "#7C3AED"],
  ["#F59E0B", "#D97706"],
  ["#EF4444", "#DC2626"],
  ["#0891B2", "#0E7490"],
];

function getAvatarColor(nombre: string) {
  const idx = nombre.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export default function Usuarios() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario, roles } = useData();

  const [dialogOpen, setDialogOpen]           = useState(false);
  const [viewDialogOpen, setViewDialogOpen]   = useState(false);
  const [editingUsuario, setEditingUsuario]   = useState<Usuario | null>(null);
  const [viewingUsuario, setViewingUsuario]   = useState<Usuario | null>(null);
  const [search, setSearch]                   = useState("");
  const [filterEstado, setFilterEstado]       = useState<"todos" | "activo" | "inactivo">("todos");
  const [filterRol, setFilterRol]             = useState("todos");

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

  /* ─── derived ─── */
  const totalActivos   = usuarios.filter((u) => u.estado === "activo").length;
  const totalInactivos = usuarios.filter((u) => u.estado === "inactivo").length;

  const filteredUsuarios = useMemo(() =>
    usuarios.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        u.nombre.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.identificacion.includes(search);
      const matchesEstado = filterEstado === "todos" ? true : u.estado === filterEstado;
      const matchesRol    = filterRol    === "todos" ? true : u.rol === filterRol;
      return matchesSearch && matchesEstado && matchesRol;
    }),
    [usuarios, search, filterEstado, filterRol]
  );

  /* ─── handlers ─── */
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
      setFormData({ correo: "", password: "", nombre: "", numero: "", rol: "", tipoDocumento: "CC", identificacion: "", estado: "activo" });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (!formData.correo.trim()) { toast.error("El correo es obligatorio"); return; }
    if (editingUsuario) {
      updateUsuario(editingUsuario.id, formData);
      toast.success("Usuario actualizado correctamente");
    } else {
      addUsuario(formData);
      toast.success("Usuario creado correctamente");
    }
    setDialogOpen(false);
  };

  const handleDelete = (usuario: Usuario) => {
    if (USUARIOS_PROTEGIDOS.includes(usuario.correo)) { toast.error("Este usuario está protegido"); return; }
    if (confirm("¿Desea eliminar este usuario?")) {
      deleteUsuario(usuario.id);
      toast.success("Usuario eliminado");
    }
  };

  const handleToggleEstado = (usuario: Usuario) => {
    if (USUARIOS_PROTEGIDOS.includes(usuario.correo)) { toast.error("Este usuario está protegido"); return; }
    updateUsuario(usuario.id, { ...usuario, estado: usuario.estado === "activo" ? "inactivo" : "activo" });
  };

  const uniqueRoles = Array.from(new Set(usuarios.map((u) => u.rol).filter(Boolean)));

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="space-y-5">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#39A900] via-[#2F8F00] to-[#1F5F00] p-6 text-white shadow-xl sm:p-8">
        {/* blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-14 -left-14 h-48 w-48 rounded-full bg-white/6" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest backdrop-blur">
              <Shield className="h-3.5 w-3.5" />
              Gestión institucional
            </div>
            <h1
              className="text-4xl font-black leading-none md:text-5xl"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Gestión de Usuarios
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/78 md:text-base">
              Administra cuentas, accesos, roles y permisos del sistema institucional.
            </p>
          </div>

          {/* hero stats */}
          <div className="grid grid-cols-2 gap-3 sm:w-[300px]">
            {[
              { label: "Total usuarios", value: usuarios.length,  icon: Users    },
              { label: "Activos",        value: totalActivos,      icon: UserCheck },
              { label: "Inactivos",      value: totalInactivos,    icon: UserX    },
              { label: "Roles usados",   value: uniqueRoles.length, icon: Shield  },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white/18 bg-white/12 p-4 backdrop-blur">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-white/60" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">{label}</span>
                </div>
                <div
                  className="mt-1 text-3xl font-black"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOPBAR ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          {/* search */}
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Buscar usuario..."
              className="h-11 rounded-xl border-zinc-200 bg-white pl-9 text-sm shadow-sm focus-visible:ring-[#39A900]/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* estado filter */}
          <select
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-[#39A900]/50 focus:ring-2 focus:ring-[#39A900]/20"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as any)}
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          {/* rol filter */}
          <select
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-[#39A900]/50 focus:ring-2 focus:ring-[#39A900]/20"
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
          >
            <option value="todos">Todos los roles</option>
            {uniqueRoles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={() => handleOpenDialog()}
          className="h-11 rounded-xl bg-[#39A900] px-5 font-bold shadow-sm hover:bg-[#2D7D00] hover:shadow-md transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      {/* ── RESULTS COUNT ── */}
      {search || filterEstado !== "todos" || filterRol !== "todos" ? (
        <p className="text-xs text-zinc-400">
          Mostrando <span className="font-bold text-zinc-600">{filteredUsuarios.length}</span> resultado{filteredUsuarios.length !== 1 ? "s" : ""}
          {search && <> para "<span className="text-zinc-700">{search}</span>"</>}
        </p>
      ) : null}

      {/* ── GRID ── */}
      {filteredUsuarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <UserCircle className="mb-4 h-12 w-12 text-zinc-200" />
          <p className="text-sm font-semibold text-zinc-400">No se encontraron usuarios</p>
          <p className="mt-1 text-xs text-zinc-300">Prueba con otros filtros o crea uno nuevo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredUsuarios.map((usuario) => {
            const protegido    = USUARIOS_PROTEGIDOS.includes(usuario.correo);
            const activo       = usuario.estado === "activo";
            const roleStyle    = getRoleAccent(usuario.rol);
            const [c1, c2]     = getAvatarColor(usuario.nombre);
            const initials     = getInitials(usuario.nombre);

            return (
              <div
                key={usuario.id}
                className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* top stripe — role color */}
                <div
                  className="h-1 w-full"
                  style={{ background: `linear-gradient(90deg, ${roleStyle.dot}, ${roleStyle.dot}88)` }}
                />

                {/* card header */}
                <div className="flex items-start gap-4 p-5">
                  {/* avatar */}
                  <div
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                  >
                    {initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-zinc-900">{usuario.nombre}</h2>
                        <p className="text-xs text-zinc-400">{usuario.tipoDocumento} · {usuario.identificacion}</p>
                      </div>

                      {/* estado toggle */}
                      <Switch
                        checked={activo}
                        onCheckedChange={() => handleToggleEstado(usuario)}
                        className="flex-shrink-0 mt-0.5"
                      />
                    </div>

                    {/* badges row */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {/* role badge */}
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: roleStyle.bg, color: roleStyle.text, border: `1px solid ${roleStyle.border}` }}
                      >
                        <Shield className="h-2.5 w-2.5" />
                        {usuario.rol || "Sin rol"}
                      </span>

                      {/* estado badge */}
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{
                          background: activo ? "rgba(57,169,0,.1)"  : "rgba(239,68,68,.08)",
                          color:      activo ? "#166534"            : "#B91C1C",
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: activo ? "#39A900" : "#EF4444" }}
                        />
                        {usuario.estado}
                      </span>

                      {protegido && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          <Lock className="h-2.5 w-2.5" />
                          Protegido
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* contact info */}
                <div className="mx-5 mb-4 space-y-2">
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                    <span className="truncate">{usuario.correo}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                    <span>{usuario.numero || "—"}</span>
                  </div>
                </div>

                {/* footer */}
                <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <UserCheck className="h-3.5 w-3.5 text-[#39A900]" />
                    <span>Registrado</span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800"
                      title="Ver detalle"
                      onClick={() => { setViewingUsuario(usuario); setViewDialogOpen(true); }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800"
                      title="Editar"
                      onClick={() => handleOpenDialog(usuario)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {!protegido && (
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                        title="Eliminar"
                        onClick={() => handleDelete(usuario)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════
          DIALOG — CREATE / EDIT
      ══════════════════════════════════════ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl overflow-hidden rounded-[28px] border-none bg-[#F5F7F4] p-0 shadow-2xl">

          {/* header */}
          <div className="relative overflow-hidden border-b border-zinc-200 bg-white px-6 py-5">
            <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-[#39A900]/8 blur-3xl" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#39A900]/10">
                  <Sparkles className="h-5 w-5 text-[#39A900]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#39A900]">Gestión de accesos</p>
                  <h2
                    className="text-xl font-black leading-tight text-zinc-900"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
                  </h2>
                </div>
              </div>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-600"
                onClick={() => setDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 p-6">

              {/* section: documento */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Documento de identidad</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-600">Tipo de documento</Label>
                    <Select
                      value={formData.tipoDocumento}
                      onValueChange={(v) => setFormData({ ...formData, tipoDocumento: v })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CC">Cédula de Ciudadanía (CC)</SelectItem>
                        <SelectItem value="TI">Tarjeta de Identidad (TI)</SelectItem>
                        <SelectItem value="CE">Cédula de Extranjería (CE)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-600">Número de identificación</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50 pl-9 text-sm focus-visible:ring-[#39A900]/30"
                        placeholder="ej. 1001234567"
                        value={formData.identificacion}
                        onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* section: datos personales */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Datos personales</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-bold text-zinc-600">Nombre completo</Label>
                    <Input
                      className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:ring-[#39A900]/30"
                      placeholder="ej. María García López"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-600">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        type="email"
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50 pl-9 text-sm focus-visible:ring-[#39A900]/30"
                        placeholder="correo@sena.edu.co"
                        value={formData.correo}
                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-600">Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50 pl-9 text-sm focus-visible:ring-[#39A900]/30"
                        placeholder="300 000 0000"
                        value={formData.numero}
                        onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* section: acceso */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Credenciales y acceso</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-600">
                      Contraseña {editingUsuario && <span className="font-normal text-zinc-400">(dejar vacío para no cambiar)</span>}
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        type="password"
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50 pl-9 text-sm focus-visible:ring-[#39A900]/30"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-600">Rol del sistema</Label>
                    <Select
                      value={formData.rol}
                      onValueChange={(v) => setFormData({ ...formData, rol: v })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm">
                        <SelectValue placeholder="Seleccionar rol…" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((rol) => (
                          <SelectItem key={rol.id} value={rol.nombre}>
                            {rol.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-bold text-zinc-600">Estado de la cuenta</Label>
                    <div className="flex h-11 items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4">
                      <span
                        className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: formData.estado === "activo" ? "#166534" : "#9CA3AF" }}
                      >
                        {formData.estado === "activo" ? "Cuenta activa" : "Cuenta inactiva"}
                      </span>
                      <Switch
                        checked={formData.estado === "activo"}
                        onCheckedChange={(c) => setFormData({ ...formData, estado: c ? "activo" : "inactivo" })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-white px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-zinc-200 px-5 text-sm font-semibold"
                onClick={() => setDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="h-11 rounded-xl bg-[#39A900] px-7 text-sm font-bold shadow-sm hover:bg-[#2D7D00] hover:shadow-md transition-all"
              >
                {editingUsuario ? "Actualizar Usuario" : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════
          DIALOG — VIEW DETAIL
      ══════════════════════════════════════ */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-sm overflow-hidden rounded-2xl border-none bg-white p-0 shadow-2xl">
          {viewingUsuario && (() => {
            const u           = viewingUsuario;
            const [c1, c2]    = getAvatarColor(u.nombre);
            const initials    = getInitials(u.nombre);
            const activo      = u.estado === "activo";
            const roleStyle   = getRoleAccent(u.rol);
            const protegido   = USUARIOS_PROTEGIDOS.includes(u.correo);

            return (
              <>
                {/* gradient header */}
                <div
                  className="px-6 pb-6 pt-5 text-white"
                  style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black"
                    >
                      {initials}
                    </div>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25"
                      onClick={() => setViewDialogOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <h2
                    className="mt-4 text-2xl font-black leading-tight"
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {u.nombre}
                  </h2>
                  <p className="mt-1 text-sm text-white/75">{u.tipoDocumento} · {u.identificacion}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {u.estado}
                    </span>
                    <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold">
                      {u.rol || "Sin rol"}
                    </span>
                    {protegido && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold">
                        <Lock className="h-2.5 w-2.5" /> Protegido
                      </span>
                    )}
                  </div>
                </div>

                {/* body */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <Mail className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                    <span className="truncate text-sm text-zinc-700">{u.correo}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <Phone className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                    <span className="text-sm text-zinc-700">{u.numero || "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <Shield className="h-4 w-4 flex-shrink-0" style={{ color: roleStyle.dot }} />
                    <span className="text-sm font-semibold" style={{ color: roleStyle.text }}>{u.rol || "Sin rol asignado"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      {activo
                        ? <CheckCircle2 className="h-4 w-4 text-[#39A900]" />
                        : <XCircle      className="h-4 w-4 text-red-400"   />}
                      <span className="text-sm font-semibold text-zinc-700">
                        {activo ? "Cuenta activa" : "Cuenta inactiva"}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="mt-1 h-11 w-full rounded-xl font-bold transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}
                    onClick={() => { setViewDialogOpen(false); handleOpenDialog(u); }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar usuario
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

    </div>
  );
}