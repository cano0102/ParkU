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

const PERMISO_LABELS: Record<string, string> = Object.values(PERMISOS).reduce(
  (acc, grupo) => ({ ...acc, ...grupo }),
  {} as Record<string, string>
);

function getRolAccent(nombre: string): string {
  switch (nombre) {
    case "Administrador": return "#EF4444";
    case "SuperAdmin":    return "#8B5CF6";
    case "Supervisor":    return "#2563EB";
    case "Operador":      return "#F59E0B";
    default:              return "#39A900";
  }
}

function countActivePermisos(permisos: typeof initialPermisos) {
  return Object.values(permisos).filter(Boolean).length;
}

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

  const handleToggleGrupo = (grupo: string) => {
    const keys = Object.keys(PERMISOS[grupo as keyof typeof PERMISOS]) as Array<keyof typeof initialPermisos>;
    const allActive = keys.every((k) => formData.permisos[k]);
    const next = { ...formData.permisos };
    keys.forEach((k) => { next[k] = !allActive; });
    setFormData({ ...formData, permisos: next });
  };

  return (
    <div className="space-y-5">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#39A900] to-[#2D7D00] p-5 text-white sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-white/6" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur">
              <ShieldCheck className="h-3 w-3" />
              Seguridad y permisos
            </div>
            <h1 className="text-2xl font-black leading-none sm:text-3xl" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Gestión de Roles
            </h1>
            <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-white/80">
              Administra accesos, permisos y niveles de seguridad del sistema.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:w-[340px]">
            {[
              { label: "Activos", value: roles.filter((r) => r.estado === "activo").length },
              { label: "Protegidos", value: ROLES_PROTEGIDOS.length },
              { label: "Permisos", value: Object.keys(initialPermisos).length },
              { label: "Total", value: roles.length },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/20 bg-white/12 px-2.5 py-2 text-center backdrop-blur">
                <div className="text-[8px] font-semibold uppercase tracking-wider text-white/60">{item.label}</div>
                <div className="text-xl font-black leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TOPBAR ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Buscar rol..."
              className="h-9 rounded-lg border-zinc-200 bg-white pl-8 text-xs shadow-sm focus-visible:ring-[#39A900]/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-9 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs shadow-sm outline-none focus:border-[#39A900]/50 focus:ring-2 focus:ring-[#39A900]/20"
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
          className="h-9 rounded-lg bg-[#39A900] px-4 text-xs font-bold shadow-sm hover:bg-[#2D7D00] transition-all"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nuevo Rol
        </Button>
      </div>

      {/* ── GRID ── */}
      {filteredRoles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-12 text-center">
          <Shield className="mb-2 h-8 w-8 text-zinc-200" />
          <p className="text-xs font-semibold text-zinc-400">No se encontraron roles</p>
          <p className="mt-0.5 text-[10px] text-zinc-300">Prueba con otros filtros o crea uno nuevo</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
                className="group overflow-hidden rounded-lg border border-zinc-200/80 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {/* stripe */}
                <div className="h-[3px] w-full" style={{ background: accent }} />

                {/* header */}
                <div className="flex items-center gap-2 px-2.5 pt-2.5 pb-1">
                  <div
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                    style={{ background: `${accent}15` }}
                  >
                    <Shield className="h-3.5 w-3.5" style={{ color: accent }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[11px] font-bold text-zinc-900 leading-tight">{rol.nombre}</h2>
                    <div className="mt-0.5 flex items-center gap-1">
                      <span
                        className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-[1px] text-[8px] font-bold uppercase"
                        style={{
                          background: activo ? "rgba(57,169,0,.1)" : "rgba(156,163,175,.12)",
                          color: activo ? "#166534" : "#6B7280",
                        }}
                      >
                        <span className="h-1 w-1 rounded-full" style={{ background: activo ? "#39A900" : "#9CA3AF" }} />
                        {rol.estado}
                      </span>
                      {protegido && (
                        <Lock className="h-2.5 w-2.5 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* permisos count + bar */}
                <div className="px-2.5 pt-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-semibold uppercase tracking-wide text-zinc-400">Acceso</span>
                    <span className="text-[10px] font-black" style={{ color: accent }}>
                      {permisosActivos}/{totalPermisos}
                    </span>
                  </div>
                  <div className="h-[3px] overflow-hidden rounded-full bg-zinc-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${nivelAcceso}%`, background: accent }}
                    />
                  </div>
                </div>

                {/* tags — max 2 */}
                <div className="flex flex-wrap gap-0.5 px-2.5 pt-1.5 pb-2">
                  {Object.entries(rol.permisos)
                    .filter(([_, v]) => v)
                    .slice(0, 2)
                    .map(([key]) => (
                      <span
                        key={key}
                        className="rounded-full bg-zinc-100 px-1.5 py-[1px] text-[8px] font-semibold text-zinc-500"
                      >
                        {PERMISO_LABELS[key] ?? key}
                      </span>
                    ))}
                  {permisosActivos > 2 && (
                    <span className="rounded-full bg-zinc-100 px-1.5 py-[1px] text-[8px] font-semibold text-zinc-400">
                      +{permisosActivos - 2}
                    </span>
                  )}
                </div>

                {/* actions */}
                <div className="flex items-center justify-end gap-0.5 border-t border-zinc-100 px-2 py-1.5">
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                    onClick={() => { setViewingRol(rol); setViewDialogOpen(true); }}
                    title="Ver"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                    onClick={() => handleOpenDialog(rol)}
                    title="Editar"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    className="flex h-6 w-6 items-center justify-center rounded-md text-blue-400 transition hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => handleDuplicate(rol)}
                    title="Duplicar"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  {!protegido && (
                    <button
                      className="flex h-6 w-6 items-center justify-center rounded-md text-red-400 transition hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleDelete(rol)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
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

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="grid flex-1 overflow-hidden xl:grid-cols-[1.2fr_.75fr]">

                <div className="overflow-y-auto p-5 sm:p-7">
                  <div className="space-y-5">

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

                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                      <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Permisos del rol</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {Object.entries(PERMISOS).map(([grupo, permisos]) => {
                          const color = GRUPO_COLORS[grupo] ?? "#39A900";
                          const keys = Object.keys(permisos) as Array<keyof typeof initialPermisos>;
                          const grupoActivo = keys.filter((k) => formData.permisos[k]).length;
                          const grupoTotal = keys.length;

                          return (
                            <div key={grupo} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
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
                                        activo ? "border-transparent bg-white shadow-sm" : "border-zinc-200 bg-white/60"
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

                <div className="hidden border-l border-zinc-200 bg-white xl:flex xl:flex-col">
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-md">
                      <div className="bg-gradient-to-br from-[#39A900] to-[#2D7D00] p-6 text-white">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                          <Shield className="h-6 w-6" />
                        </div>
                        <h3 className="mt-5 text-3xl font-black leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
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