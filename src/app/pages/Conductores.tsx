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
  X,
  GraduationCap,
  BookOpen,
  MapPin,
  Hash,
  Palette,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

import { Button }                                    from "../components/ui/button";
import { Input }                                     from "../components/ui/input";
import { Label }                                     from "../components/ui/label";
import { Switch }                                    from "../components/ui/switch";
import { Dialog, DialogContent, DialogFooter }       from "../components/ui/dialog";
import { Select, SelectContent, SelectItem,
         SelectTrigger, SelectValue }                from "../components/ui/select";
import { Textarea }                                  from "../components/ui/textarea";
import { toast }                                     from "sonner";
import { useData, Conductor }                        from "../context/DataContext";

/* ─── avatar helpers ─── */
const AVATAR_GRADIENTS = [
  ["#39A900", "#2D7D00"],
  ["#2563EB", "#1D4ED8"],
  ["#8B5CF6", "#7C3AED"],
  ["#F59E0B", "#D97706"],
  ["#EF4444", "#DC2626"],
  ["#0891B2", "#0E7490"],
];

function getAvatarGradient(str: string) {
  const idx = (str?.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

function getInitials(nombre: string) {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/* ─── tipo-conductor style ─── */
function getTipoStyle(tipo: string) {
  return tipo === "instructor"
    ? { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB", label: "Instructor" }
    : { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", label: "Aprendiz"   };
}

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
export function Conductores() {
  const {
    conductores, addConductor, updateConductor, deleteConductor,
    usuarios, vehiculos, addVehiculo,
  } = useData();

  const [dialogOpen,      setDialogOpen]      = useState(false);
  const [viewDialogOpen,  setViewDialogOpen]  = useState(false);
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null);
  const [viewingConductor, setViewingConductor] = useState<Conductor | null>(null);
  const [searchTerm,      setSearchTerm]      = useState("");
  const [filterTipo,      setFilterTipo]      = useState("todos");
  const [filterEstado,    setFilterEstado]    = useState("todos");

  const [formData, setFormData] = useState({
    usuarioId:        "",
    tipoConductor:    "aprendiz" as "aprendiz" | "instructor",
    centroFormacion:  "",
    discapacidad:     false,
    tipoDiscapacidad: "",
    estado:           "activo" as "activo" | "inactivo",
    placa:            "",
    tipoVehiculo:     "carro" as "carro" | "moto",
    marca:            "",
    modelo:           "",
    año:              new Date().getFullYear(),
    color:            "",
    descripcion:      "",
  });

  /* ─── helpers ─── */
  const getUsuario = (id: string) => usuarios.find((u) => u.id === id);
  const getVehiculosConductor = (id: string) => vehiculos.filter((v) => v.conductorId === id);

  /* ─── derived stats ─── */
  const totalActivos     = conductores.filter((c) => c.estado === "activo").length;
  const totalInactivos   = conductores.filter((c) => c.estado === "inactivo").length;
  const totalInstructores = conductores.filter((c) => c.tipoConductor === "instructor").length;
  const totalAprendices  = conductores.filter((c) => c.tipoConductor === "aprendiz").length;

  /* ─── filtered list ─── */
  const filteredConductores = useMemo(() =>
    conductores.filter((conductor) => {
      const usuario = getUsuario(conductor.usuarioId);
      if (!usuario) return false;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        usuario.nombre.toLowerCase().includes(q) ||
        usuario.identificacion.includes(searchTerm) ||
        conductor.centroFormacion.toLowerCase().includes(q);
      const matchesTipo   = filterTipo   === "todos" ? true : conductor.tipoConductor === filterTipo;
      const matchesEstado = filterEstado === "todos" ? true : conductor.estado        === filterEstado;
      return matchesSearch && matchesTipo && matchesEstado;
    }),
    [conductores, searchTerm, filterTipo, filterEstado]
  );

  /* ─── handlers ─── */
  const handleOpenDialog = (conductor?: Conductor) => {
    if (conductor) {
      setEditingConductor(conductor);
      const v = vehiculos.find((veh) => veh.conductorId === conductor.id);
      setFormData({
        usuarioId:        conductor.usuarioId,
        tipoConductor:    conductor.tipoConductor,
        centroFormacion:  conductor.centroFormacion,
        discapacidad:     conductor.discapacidad,
        tipoDiscapacidad: conductor.tipoDiscapacidad || "",
        estado:           conductor.estado,
        placa:            v?.placa        || "",
        tipoVehiculo:     v?.tipo         || "carro",
        marca:            v?.marca        || "",
        modelo:           v?.modelo       || "",
        año:              v?.año          || new Date().getFullYear(),
        color:            v?.color        || "",
        descripcion:      v?.descripcion  || "",
      });
    } else {
      setEditingConductor(null);
      setFormData({
        usuarioId: "", tipoConductor: "aprendiz", centroFormacion: "",
        discapacidad: false, tipoDiscapacidad: "", estado: "activo",
        placa: "", tipoVehiculo: "carro", marca: "", modelo: "",
        año: new Date().getFullYear(), color: "", descripcion: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.usuarioId)       { toast.error("Selecciona un usuario");       return; }
    if (!formData.centroFormacion) { toast.error("El centro de formación es requerido"); return; }

    const conductorData = {
      usuarioId:        formData.usuarioId,
      tipoConductor:    formData.tipoConductor,
      centroFormacion:  formData.centroFormacion,
      discapacidad:     formData.discapacidad,
      tipoDiscapacidad: formData.tipoDiscapacidad,
      estado:           formData.estado,
    };

    if (editingConductor) {
      updateConductor(editingConductor.id, conductorData);
      toast.success("Conductor actualizado correctamente");
    } else {
      addConductor(conductorData);
      const nuevoConductor = conductores[conductores.length - 1];
      addVehiculo({
        conductorId:  nuevoConductor?.id || "",
        placa:        formData.placa,
        tipo:         formData.tipoVehiculo,
        marca:        formData.marca,
        modelo:       formData.modelo,
        año:          formData.año,
        color:        formData.color,
        descripcion:  formData.descripcion,
        estado:       "activo",
      });
      toast.success("Conductor creado correctamente");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Desea eliminar este conductor?")) {
      deleteConductor(id);
      toast.success("Conductor eliminado correctamente");
    }
  };

  const handleChangeEstado = (id: string, nuevoEstado: "activo" | "inactivo") => {
    updateConductor(id, { estado: nuevoEstado });
    toast.success(`Conductor ${nuevoEstado === "activo" ? "activado" : "desactivado"}`);
  };

  /* ════════════════ RENDER ════════════════ */
  return (
    <div className="space-y-5">

      {/* ── HERO ── */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#39A900] via-[#2F8F00] to-[#1F5F00] p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-14 -left-14 h-48 w-48 rounded-full bg-white/6" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" />
              Gestión institucional
            </div>
            <h1
              className="text-4xl font-black leading-none md:text-5xl"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Gestión de Conductores
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/78 md:text-base">
              Administra conductores, aprendices, instructores y vehículos autorizados del sistema SENA.
            </p>
          </div>

          {/* hero stats */}
          <div className="grid grid-cols-2 gap-3 sm:w-[310px]">
            {[
              { label: "Total",        value: conductores.length,  icon: UserCog   },
              { label: "Vehículos",    value: vehiculos.length,    icon: Car       },
              { label: "Activos",      value: totalActivos,        icon: UserCheck },
              { label: "Instructores", value: totalInstructores,   icon: GraduationCap },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white/18 bg-white/12 p-4 backdrop-blur">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3 w-3 text-white/60" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">{label}</span>
                </div>
                <div className="mt-1 text-3xl font-black" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
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
              placeholder="Buscar conductor, identificación o centro..."
              className="h-11 rounded-xl border-zinc-200 bg-white pl-9 text-sm shadow-sm focus-visible:ring-[#39A900]/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* tipo filter */}
          <select
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#39A900]/20"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="aprendiz">Aprendiz</option>
            <option value="instructor">Instructor</option>
          </select>

          {/* estado filter */}
          <select
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#39A900]/20"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
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
          Nuevo Conductor
        </Button>
      </div>

      {/* results hint */}
      {(searchTerm || filterTipo !== "todos" || filterEstado !== "todos") && (
        <p className="text-xs text-zinc-400">
          Mostrando <span className="font-bold text-zinc-600">{filteredConductores.length}</span> resultado{filteredConductores.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── GRID ── */}
      {filteredConductores.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white py-20 text-center">
          <UserCog className="mb-4 h-12 w-12 text-zinc-200" />
          <p className="text-sm font-semibold text-zinc-400">No se encontraron conductores</p>
          <p className="mt-1 text-xs text-zinc-300">Prueba con otros filtros o registra uno nuevo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {filteredConductores.map((conductor) => {
            const usuario          = getUsuario(conductor.usuarioId);
            const vehiculosCond    = getVehiculosConductor(conductor.id);
            if (!usuario) return null;

            const [c1, c2]         = getAvatarGradient(usuario.nombre);
            const initials         = getInitials(usuario.nombre);
            const tipoStyle        = getTipoStyle(conductor.tipoConductor);
            const activo           = conductor.estado === "activo";

            return (
              <div
                key={conductor.id}
                className="group overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* color stripe */}
                <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${tipoStyle.dot}, ${tipoStyle.dot}88)` }} />

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
                      {/* vehicles count pill */}
                      <div
                        className="flex flex-shrink-0 flex-col items-center rounded-xl px-3 py-1.5"
                        style={{ background: "#F0FDF4" }}
                      >
                        <span className="text-[10px] font-semibold text-[#166534]">Vehículos</span>
                        <span className="text-xl font-black leading-tight text-[#39A900]"
                          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                          {vehiculosCond.length}
                        </span>
                      </div>
                    </div>

                    {/* badges */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ background: tipoStyle.bg, color: tipoStyle.text, border: `1px solid ${tipoStyle.border}` }}
                      >
                        {conductor.tipoConductor === "instructor"
                          ? <GraduationCap className="h-2.5 w-2.5" />
                          : <BookOpen       className="h-2.5 w-2.5" />}
                        {tipoStyle.label}
                      </span>

                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                        style={{
                          background: activo ? "rgba(57,169,0,.1)"  : "rgba(239,68,68,.08)",
                          color:      activo ? "#166534"            : "#B91C1C",
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: activo ? "#39A900" : "#EF4444" }} />
                        {conductor.estado}
                      </span>

                      {conductor.discapacidad && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          <Accessibility className="h-2.5 w-2.5" />
                          Discapacidad
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* centro formacion */}
                <div className="mx-5 mb-3 flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
                  <Building2 className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                  <span className="truncate text-xs text-zinc-600">{conductor.centroFormacion || "—"}</span>
                </div>

                {/* vehicles list */}
                {vehiculosCond.length > 0 && (
                  <div className="mx-5 mb-4 space-y-2">
                    {vehiculosCond.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg"
                            style={{ background: `${c1}18` }}
                          >
                            {v.tipo === "moto"
                              ? <Bike className="h-4 w-4" style={{ color: c1 }} />
                              : <Car  className="h-4 w-4" style={{ color: c1 }} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-800">{v.placa}</p>
                            <p className="text-[10px] text-zinc-400">{v.marca} {v.modelo} · {v.color}</p>
                          </div>
                        </div>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold capitalize"
                          style={{ background: `${c1}15`, color: c1 }}
                        >
                          {v.tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* footer */}
                <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={activo}
                      onCheckedChange={(checked) =>
                        handleChangeEstado(conductor.id, checked ? "activo" : "inactivo")
                      }
                    />
                    <span className="text-xs font-medium text-zinc-500">
                      {activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800"
                      title="Ver detalle"
                      onClick={() => { setViewingConductor(conductor); setViewDialogOpen(true); }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800"
                      title="Editar"
                      onClick={() => handleOpenDialog(conductor)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                      title="Eliminar"
                      onClick={() => handleDelete(conductor.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#39A900]">Registro de conductor</p>
                  <h2 className="text-xl font-black leading-tight text-zinc-900" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {editingConductor ? "Editar Conductor" : "Nuevo Conductor"}
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

          {/* form body */}
          <form onSubmit={handleSubmit}>
            <div className="max-h-[65vh] overflow-y-auto p-6 space-y-4">

              {/* section: datos del conductor */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Datos del conductor</p>
                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs font-bold text-zinc-600">Usuario vinculado</Label>
                    <Select
                      value={formData.usuarioId}
                      onValueChange={(v) => setFormData({ ...formData, usuarioId: v })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm">
                        <SelectValue placeholder="Seleccionar usuario…" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.nombre} — {u.identificacion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-600">Tipo de conductor</Label>
                    <Select
                      value={formData.tipoConductor}
                      onValueChange={(v: "aprendiz" | "instructor") => setFormData({ ...formData, tipoConductor: v })}
                    >
                      <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aprendiz">Aprendiz</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-600">Centro de formación</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <Input
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50 pl-9 text-sm focus-visible:ring-[#39A900]/30"
                        placeholder="ej. Centro de Tecnología"
                        value={formData.centroFormacion}
                        onChange={(e) => setFormData({ ...formData, centroFormacion: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* discapacidad toggle */}
                <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-zinc-700">¿Tiene alguna discapacidad?</p>
                    <p className="text-[10px] text-zinc-400">Activa para registrar el tipo</p>
                  </div>
                  <Switch
                    checked={formData.discapacidad}
                    onCheckedChange={(c) => setFormData({ ...formData, discapacidad: c })}
                  />
                </div>

                {formData.discapacidad && (
                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-600">Tipo de discapacidad</Label>
                    <Input
                      className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:ring-[#39A900]/30"
                      placeholder="ej. Visual, Motriz, Auditiva…"
                      value={formData.tipoDiscapacidad}
                      onChange={(e) => setFormData({ ...formData, tipoDiscapacidad: e.target.value })}
                    />
                  </div>
                )}

                {/* estado */}
                <div className="mt-3 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-bold text-zinc-700">Estado del conductor</p>
                    <p className="text-[10px] text-zinc-400">Activa o desactiva el acceso al sistema</p>
                  </div>
                  <Switch
                    checked={formData.estado === "activo"}
                    onCheckedChange={(c) => setFormData({ ...formData, estado: c ? "activo" : "inactivo" })}
                  />
                </div>
              </div>

              {/* section: vehículo (solo crear) */}
              {!editingConductor && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Car className="h-4 w-4 text-[#39A900]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Vehículo asociado</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-600">Placa</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                          className="h-11 rounded-xl border-zinc-200 bg-zinc-50 pl-9 text-sm font-bold uppercase tracking-widest focus-visible:ring-[#39A900]/30"
                          placeholder="ABC-123"
                          value={formData.placa}
                          onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-600">Tipo de vehículo</Label>
                      <Select
                        value={formData.tipoVehiculo}
                        onValueChange={(v: "carro" | "moto") => setFormData({ ...formData, tipoVehiculo: v })}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="carro">🚗 Carro</SelectItem>
                          <SelectItem value="moto">🏍️ Moto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-600">Marca</Label>
                      <Input
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:ring-[#39A900]/30"
                        placeholder="ej. Chevrolet"
                        value={formData.marca}
                        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-600">Modelo</Label>
                      <Input
                        className="h-11 rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:ring-[#39A900]/30"
                        placeholder="ej. Spark"
                        value={formData.modelo}
                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-600">Año</Label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                          type="number"
                          className="h-11 rounded-xl border-zinc-200 bg-zinc-50 pl-9 text-sm focus-visible:ring-[#39A900]/30"
                          value={formData.año}
                          onChange={(e) => setFormData({ ...formData, año: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-zinc-600">Color</Label>
                      <div className="relative">
                        <Palette className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                          className="h-11 rounded-xl border-zinc-200 bg-zinc-50 pl-9 text-sm focus-visible:ring-[#39A900]/30"
                          placeholder="ej. Rojo"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-bold text-zinc-600">Descripción adicional</Label>
                      <Textarea
                        className="min-h-[70px] rounded-xl border-zinc-200 bg-zinc-50 text-sm focus-visible:ring-[#39A900]/30 resize-none"
                        placeholder="Observaciones sobre el vehículo…"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
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
                {editingConductor ? "Actualizar Conductor" : "Crear Conductor"}
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
          {viewingConductor && (() => {
            const c            = viewingConductor;
            const usuario      = getUsuario(c.usuarioId);
            const vehs         = getVehiculosConductor(c.id);
            if (!usuario) return null;

            const [g1, g2]     = getAvatarGradient(usuario.nombre);
            const initials     = getInitials(usuario.nombre);
            const tipoStyle    = getTipoStyle(c.tipoConductor);
            const activo       = c.estado === "activo";

            return (
              <>
                {/* gradient header */}
                <div
                  className="px-6 pb-6 pt-5 text-white"
                  style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
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
                  <h2 className="mt-4 text-2xl font-black leading-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {usuario.nombre}
                  </h2>
                  <p className="mt-1 text-sm text-white/75">{usuario.tipoDocumento} · {usuario.identificacion}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold capitalize"
                    >
                      {tipoStyle.label}
                    </span>
                    <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold uppercase">
                      {c.estado}
                    </span>
                    {c.discapacidad && (
                      <span className="rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[10px] font-bold">
                        Discapacidad
                      </span>
                    )}
                  </div>
                </div>

                {/* body */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <Building2 className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                    <span className="text-sm text-zinc-700">{c.centroFormacion || "—"}</span>
                  </div>

                  {c.discapacidad && c.tipoDiscapacidad && (
                    <div className="flex items-center gap-3 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
                      <Accessibility className="h-4 w-4 flex-shrink-0 text-purple-500" />
                      <span className="text-sm text-purple-700">{c.tipoDiscapacidad}</span>
                    </div>
                  )}

                  {vehs.length > 0 && (
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">Vehículos registrados</p>
                      <div className="space-y-2">
                        {vehs.map((v) => (
                          <div key={v.id} className="flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${g1}18` }}>
                              {v.tipo === "moto"
                                ? <Bike className="h-4 w-4" style={{ color: g1 }} />
                                : <Car  className="h-4 w-4" style={{ color: g1 }} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-800">{v.placa}</p>
                              <p className="text-[10px] text-zinc-400">{v.marca} {v.modelo} · {v.color}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="mt-1 h-11 w-full rounded-xl font-bold transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                    onClick={() => { setViewDialogOpen(false); handleOpenDialog(c); }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar conductor
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