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
  X,
  ChevronRight,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useData, Rol } from "../context/DataContext";
import { Dialog, DialogContent, DialogFooter } from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";

/* ─── constants ─── */
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

const GRUPO_ICONS: Record<string, React.ReactNode> = {
  administracion: <Shield className="h-3.5 w-3.5" />,
  operaciones: <Layers3 className="h-3.5 w-3.5" />,
  parqueadero: <Sparkles className="h-3.5 w-3.5" />,
  seguridad: <ShieldCheck className="h-3.5 w-3.5" />,
};

const GRUPO_COLORS: Record<string, string> = {
  administracion: "#EF4444",
  operaciones: "#2563EB",
  parqueadero: "#F59E0B",
  seguridad: "#8B5CF6",
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

/* ─── helper: permiso label lookup ─── */
const PERMISO_LABELS: Record<string, string> = Object.values(PERMISOS).reduce(
  (acc, grupo) => ({ ...acc, ...grupo }),
  {} as Record<string, string>
);

/* ─── role accent color ─── */
function getRolAccent(nombre: string): string {
  switch (nombre) {
    case "Administrador": return "#EF4444";
    case "SuperAdmin":    return "#8B5CF6";
    case "Supervisor":    return "#2563EB";
    case "Operador":      return "#F59E0B";
    default:              return "#39A900";
  }
}

/* ─── count helper ─── */
function countActivePermisos(permisos: typeof initialPermisos) {
  return Object.values(permisos).filter(Boolean).length;
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export function Roles() {
  const { roles, addRol, updateRol, deleteRol } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [viewingRol, setViewingRol] = useState<Rol | null>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    permisos: initialPermisos,
    estado: "activo" as "activo" | "inactivo",
  });

  const filteredRoles = useMemo(() =>
    roles.filter((rol) => {
      const matchesSearch = rol.nombre.toLowerCase().includes(search.toLowerCase());
      const matchesEstado = filterEstado === "todos" ? true : rol.estado === filterEstado;
      return matchesSearch && matchesEstado;
    }),
    [roles, search, filterEstado]
  );

  /* ─── handlers ─── */
  const handleOpenDialog = (rol?: Rol) => {
    if (rol) {
      setEditingRol(rol);
      setFormData({ nombre: rol.nombre, descripcion: rol.descripcion, permisos: rol.permisos, estado: rol.estado });
    } else {
      setEditingRol(null);
      setFormData({ nombre: "", descripcion: "", permisos: initialPermisos, estado: "activo" });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (editingRol) { updateRol(editingRol.id, formData); toast.success("Rol actualizado correctamente"); }
    else { addRol(formData); toast.success("Rol creado correctamente"); }
    setDialogOpen(false);
  };

  const handleDelete = (rol: Rol) => {
    if (ROLES_PROTEGIDOS.includes(rol.nombre)) { toast.error("Este rol está protegido"); return; }
    if (confirm("¿Desea eliminar este rol?")) { deleteRol(rol.id); toast.success("Rol eliminado"); }
  };

  const handleDuplicate = (rol: Rol) => {
    addRol({ ...rol, nombre: `${rol.nombre} Copia` });
    toast.success("Rol duplicado");
  };

  const handleTogglePermiso = (permiso: keyof typeof formData.permisos) => {
    setFormData({ ...formData, permisos: { ...formData.permisos, [permiso]: !formData.permisos[permiso] } });
  };

  /* ─── select-all per group ─── */
  const handleToggleGrupo = (grupo: string) => {
    const keys = Object.keys(PERMISOS[grupo as keyof typeof PERMISOS]) as Array<keyof typeof initialPermisos>;
    const allActive = keys.every((k) => formData.permisos[k]);
    const next = { ...formData.permisos };
    keys.forEach((k) => { next[k] = !allActive; });
    setFormData({ ...formData, permisos: next });
  };

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div className="space-y-6">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#39A900] to-[#2D7D00] p-6 text-white sm:p-8">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/6" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" />
              Seguridad y permisos
            </div>
            <h1 className="text-4xl font-black leading-none md:text-5xl" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Gestión de Roles
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
              Administra accesos, permisos y niveles de seguridad del sistema.
            </p>
          </div>

          {/* hero mini-stats */}
          <div className="grid grid-cols-2 gap-3 sm:w-[320px]">
            {[
              { label: "Roles activos", value: roles.filter((r) => r.estado === "activo").length },
              { label: "Protegidos", value: ROLES_PROTEGIDOS.length },
              { label: "Permisos", value: Object.keys(initialPermisos).length },
              { label: "Total roles", value: roles.length },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white/65">{item.label}</div>
                <div className="mt-1 text-3xl font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOPBAR ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          {/* search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Buscar rol..."
              className="h-11 rounded-xl border-zinc-200 bg-white pl-9 text-sm shadow-sm focus-visible:ring-[#39A900]/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* filter */}
          <select
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-[#39A900]/50 focus:ring-2 focus:ring-[#39A900]/20"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as any)}
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>

        <Button
          onClick={() => handleOpenDialog()}
          className="h-11 rounded-xl bg-[#39A900] px-5 font-bold shadow-sm hover:bg-[#2D7D00] hover:shadow-md transition-all"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Rol
        </Button>
      </div>

      {/* ── GRID ── */}
      {filteredRoles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <Shield className="mb-4 h-12 w-12 text-zinc-200" />
          <p className="text-sm font-semibold text-zinc-400">No se encontraron roles</p>
          <p className="mt-1 text-xs text-zinc-300">Prueba con otros filtros o crea uno nuevo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredRoles.map((rol) => {
            const permisosActivos = countActivePermisos(rol.permisos);
            const totalPermisos = Object.keys(rol.permisos).length;
            const nivelAcceso = Math.round((permisosActivos / totalPermisos) * 100);
            const protegido = ROLES_PROTEGIDOS.includes(rol.nombre);
            const accent = getRolAccent(rol.nombre);
            const activo = rol.estado === "activo";

            return (
              <div
                key={rol.id}
                className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* colored top stripe */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}99)` }} />

                {/* card header */}
                <div className="flex items-start justify-between gap-3 p-5">
                  <div className="flex items-start gap-3">
                    {/* icon */}
                    <div
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${accent}15`, border: `1px solid ${accent}28` }}
                    >
                      <Shield className="h-5 w-5" style={{ color: accent }} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-zinc-900 leading-tight">{rol.nombre}</h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {/* estado badge */}
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                          style={{
                            background: activo ? "rgba(57,169,0,.1)" : "rgba(156,163,175,.12)",
                            color: activo ? "#166534" : "#6B7280",
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: activo ? "#39A900" : "#9CA3AF" }} />
                          {rol.estado}
                        </span>

                        {protegido && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                            <Lock className="h-2.5 w-2.5" />
                            Protegido
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* permisos count */}
                  <div
                    className="rounded-xl px-3 py-2 text-center flex-shrink-0"
                    style={{ background: `${accent}10` }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: accent }}>Permisos</div>
                    <div className="text-xl font-black leading-tight" style={{ color: accent, fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {permisosActivos}
                    </div>
                  </div>
                </div>

                {/* description */}
                {rol.descripcion && (
                  <p className="line-clamp-2 px-5 pb-0 text-xs leading-relaxed text-zinc-400">{rol.descripcion}</p>
                )}

                {/* progress bar */}
                <div className="px-5 pt-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Nivel de acceso</span>
                    <span className="text-xs font-black text-zinc-600">{nivelAcceso}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${nivelAcceso}%`, background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }}
                    />
                  </div>
                </div>

                {/* permission tags */}
                <div className="flex flex-wrap gap-1.5 px-5 pt-3 pb-4">
                  {Object.entries(rol.permisos)
                    .filter(([_, v]) => v)
                    .slice(0, 5)
                    .map(([key]) => (
                      <span
                        key={key}
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-600"
                      >
                        {PERMISO_LABELS[key] ?? key}
                      </span>
                    ))}
                  {permisosActivos > 5 && (
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[10px] font-semibold text-zinc-400">
                      +{permisosActivos - 5}
                    </span>
                  )}
                </div>

                {/* footer */}
                <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      12 usuarios
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers3 className="h-3.5 w-3.5" />
                      {totalPermisos} total
                    </span>
                  </div>

                  {/* action buttons */}
                  <div className="flex gap-1.5">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800"
                      onClick={() => { setViewingRol(rol); setViewDialogOpen(true); }}
                      title="Ver detalle"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800"
                      onClick={() => handleOpenDialog(rol)}
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                      onClick={() => handleDuplicate(rol)}
                      title="Duplicar"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>

                    {!protegido && (
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                        onClick={() => handleDelete(rol)}
                        title="Eliminar"
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
        <DialogContent className="h-[95vh] max-w-[95vw] overflow-hidden rounded-[28px] border-none bg-[#F5F7F4] p-0 xl:max-w-5xl">
          <div className="flex h-full flex-col">

            {/* dialog header */}
            <div className="relative overflow-hidden border-b border-zinc-200 bg-white px-6 py-5 sm:px-8">
              <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#39A900]/8 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#39A900]/10">
                    <ShieldCheck className="h-5 w-5 text-[#39A900]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#39A900]">Seguridad avanzada</span>
                    <h2 className="text-2xl font-black text-zinc-900 leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {editingRol ? "Editar Rol" : "Nuevo Rol"}
                    </h2>
                  </div>
                </div>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-600"
                  onClick={() => setDialogOpen(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* dialog body */}
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="grid flex-1 overflow-hidden xl:grid-cols-[1.2fr_.75fr]">

                {/* LEFT — fields + permissions */}
                <div className="overflow-y-auto p-5 sm:p-7">
                  <div className="space-y-5">

                    {/* basic info */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                      <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Información básica</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-zinc-600">Nombre del rol</Label>
                          <Input
                            className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:ring-[#39A900]/30"
                            placeholder="ej. Operador de turno"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-zinc-600">Estado</Label>
                          <div className="flex h-11 items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4">
                            <span className={`text-xs font-bold uppercase tracking-wide ${formData.estado === "activo" ? "text-green-700" : "text-zinc-400"}`}>
                              {formData.estado}
                            </span>
                            <Switch
                              checked={formData.estado === "activo"}
                              onCheckedChange={(c) => setFormData({ ...formData, estado: c ? "activo" : "inactivo" })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-1.5">
                        <Label className="text-xs font-bold text-zinc-600">Descripción</Label>
                        <Textarea
                          className="min-h-[90px] rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:ring-[#39A900]/30 resize-none"
                          placeholder="Describe las responsabilidades de este rol..."
                          value={formData.descripcion}
                          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* permissions */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                      <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Permisos del rol</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {Object.entries(PERMISOS).map(([grupo, permisos]) => {
                          const color = GRUPO_COLORS[grupo] ?? "#39A900";
                          const keys = Object.keys(permisos) as Array<keyof typeof initialPermisos>;
                          const grupoActivo = keys.filter((k) => formData.permisos[k]).length;
                          const grupoTotal = keys.length;

                          return (
                            <div
                              key={grupo}
                              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                            >
                              {/* group header */}
                              <div className="mb-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                                    style={{ background: `${color}18`, color }}
                                  >
                                    {GRUPO_ICONS[grupo]}
                                  </div>
                                  <span className="text-xs font-black uppercase tracking-wide text-zinc-700 capitalize">{grupo}</span>
                                </div>
                                <button
                                  type="button"
                                  className="text-[10px] font-bold underline-offset-2 hover:underline"
                                  style={{ color }}
                                  onClick={() => handleToggleGrupo(grupo)}
                                >
                                  {grupoActivo === grupoTotal ? "Quitar todo" : "Seleccionar todo"}
                                </button>
                              </div>

                              {/* progress mini */}
                              <div className="mb-3 h-1 overflow-hidden rounded-full bg-zinc-200">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${(grupoActivo / grupoTotal) * 100}%`, background: color }}
                                />
                              </div>

                              <div className="space-y-2">
                                {Object.entries(permisos).map(([key, label]) => {
                                  const activo = formData.permisos[key as keyof typeof formData.permisos];
                                  return (
                                    <div
                                      key={key}
                                      className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 transition-all ${
                                        activo
                                          ? "border-transparent bg-white shadow-sm"
                                          : "border-zinc-200 bg-white/60"
                                      }`}
                                      style={activo ? { borderColor: `${color}30`, boxShadow: `0 0 0 1px ${color}20` } : {}}
                                      onClick={() => handleTogglePermiso(key as keyof typeof formData.permisos)}
                                    >
                                      <div>
                                        <div className="text-xs font-semibold text-zinc-800">{label}</div>
                                        <div className="text-[10px] text-zinc-400">
                                          {activo ? "Acceso habilitado" : "Sin acceso"}
                                        </div>
                                      </div>
                                      <Checkbox
                                        checked={activo}
                                        onCheckedChange={() => handleTogglePermiso(key as keyof typeof formData.permisos)}
                                        className="pointer-events-none"
                                        style={activo ? { borderColor: color, background: color } : {}}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT — live preview (desktop only) */}
                <div className="hidden border-l border-zinc-200 bg-white xl:flex xl:flex-col">
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-md">
                      {/* preview header */}
                      <div className="bg-gradient-to-br from-[#39A900] to-[#2D7D00] p-6 text-white">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                          <Shield className="h-6 w-6" />
                        </div>
                        <h3
                          className="mt-5 text-3xl font-black leading-tight"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                        >
                          {formData.nombre || "NOMBRE DEL ROL"}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-white/75">
                          {formData.descripcion || "Vista previa en tiempo real"}
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                            {formData.estado}
                          </span>
                          <span className="text-xs text-white/65">
                            {countActivePermisos(formData.permisos)} permisos activos
                          </span>
                        </div>
                      </div>

                      {/* preview permissions */}
                      <div className="p-5">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Permisos activos</p>
                        {countActivePermisos(formData.permisos) === 0 ? (
                          <div className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-200 p-4 text-xs text-zinc-300">
                            <Shield className="h-4 w-4" />
                            Sin permisos asignados
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {Object.entries(formData.permisos)
                              .filter(([_, v]) => v)
                              .map(([key]) => (
                                <div
                                  key={key}
                                  className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5"
                                >
                                  <span className="text-xs font-semibold text-zinc-700">{PERMISO_LABELS[key] ?? key}</span>
                                  <CheckCircle2 className="h-3.5 w-3.5 text-[#39A900]" />
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* dialog footer */}
              <div className="flex items-center justify-end gap-3 border-t border-zinc-200 bg-white px-6 py-4 sm:px-8">
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
                  {editingRol ? "Actualizar Rol" : "Crear Rol"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════
          DIALOG — VIEW DETAIL
      ══════════════════════════════════════ */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-md overflow-hidden rounded-2xl border-none bg-white p-0">
          {viewingRol && (() => {
            const accent = getRolAccent(viewingRol.nombre);
            const permisosActivos = countActivePermisos(viewingRol.permisos);
            const protegido = ROLES_PROTEGIDOS.includes(viewingRol.nombre);
            return (
              <div>
                {/* header */}
                <div className="p-6 text-white" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                      <Shield className="h-6 w-6" />
                    </div>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
                      onClick={() => setViewDialogOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <h2 className="mt-4 text-3xl font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {viewingRol.nombre}
                  </h2>
                  <p className="mt-1.5 text-sm text-white/75">{viewingRol.descripcion || "Sin descripción"}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {viewingRol.estado}
                    </span>
                    {protegido && (
                      <span className="flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold">
                        <Lock className="h-2.5 w-2.5" /> Protegido
                      </span>
                    )}
                  </div>
                </div>

                {/* body */}
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Permisos activos</p>
                    <span className="text-xs font-bold" style={{ color: accent }}>{permisosActivos} / {Object.keys(viewingRol.permisos).length}</span>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(viewingRol.permisos).map(([key, value]) => (
                      <div
                        key={key}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                          value ? "bg-zinc-50 text-zinc-800" : "bg-white text-zinc-300"
                        }`}
                        style={value ? { border: `1px solid ${accent}20` } : { border: "1px solid #f4f4f5" }}
                      >
                        <span>{PERMISO_LABELS[key] ?? key}</span>
                        {value
                          ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: accent }} />
                          : <XCircle className="h-3.5 w-3.5 text-zinc-200" />
                        }
                      </div>
                    ))}
                  </div>

                  <Button
                    className="mt-5 h-11 w-full rounded-xl font-bold"
                    style={{ background: accent }}
                    onClick={() => { setViewDialogOpen(false); handleOpenDialog(viewingRol); }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar este rol
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

    </div>
  );
}