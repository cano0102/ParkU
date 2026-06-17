import React, { useMemo, useState, useEffect } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Shield,
  Search,
  Copy,
  Lock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers3,
  ShieldCheck,
  X,
  ArrowLeft,
} from "lucide-react";

import { useData, Rol } from "../context/DataContext";
import { toast } from "sonner";

/* ─── Paleta ─── */
const C = {
  primary:     "#39A900",
  primaryDark: "#2D7D00",
  text:        "#0F172A",
  textLight:   "#64748B",
  border:      "#E2E8F0",
  bg:          "#F5F7F8",
};

/* ─── Constantes ─── */
const ROLES_PROTEGIDOS = ["Administrador", "SuperAdmin"];

const PERMISOS = {
  administracion: { usuarios: "Usuarios", roles: "Roles", dashboard: "Dashboard" },
  operaciones:    { entradaSalida: "Entrada / Salida", reservas: "Reservas", asignaciones: "Asignaciones" },
  parqueadero:    { parqueaderos: "Parqueaderos", celdas: "Celdas", vehiculos: "Vehículos", conductores: "Conductores" },
  seguridad:      { incidentes: "Incidentes", reconocimientoPlacas: "Reconocimiento" },
};

const GRUPO_ICONS: Record<string, React.ReactNode> = {
  administracion: <Shield    size={13} />,
  operaciones:    <Layers3   size={13} />,
  parqueadero:    <Sparkles  size={13} />,
  seguridad:      <ShieldCheck size={13} />,
};

const GRUPO_COLORS: Record<string, string> = {
  administracion: "#EF4444",
  operaciones:    "#2563EB",
  parqueadero:    "#F59E0B",
  seguridad:      "#8B5CF6",
};

const initialPermisos = {
  dashboard: false, roles: false, usuarios: false, conductores: false,
  vehiculos: false, parqueaderos: false, celdas: false, asignaciones: false,
  entradaSalida: false, reservas: false, incidentes: false, reconocimientoPlacas: false,
};

type Permisos = typeof initialPermisos;

const PERMISO_LABELS: Record<string, string> = Object.values(PERMISOS).reduce(
  (acc, g) => ({ ...acc, ...g }),
  {} as Record<string, string>
);

function getRolAccent(nombre: string) {
  switch (nombre) {
    case "Administrador": return "#EF4444";
    case "SuperAdmin":    return "#8B5CF6";
    case "Supervisor":    return "#2563EB";
    case "Operador":      return "#F59E0B";
    default:              return C.primary;
  }
}

function countActive(p: Permisos) {
  return Object.values(p).filter(Boolean).length;
}

/* ══════════════════════════════════════════════════════
   OVERLAY / MODAL propio — sin depender de Dialog shadcn
══════════════════════════════════════════════════════ */
function Modal({
  open,
  onClose,
  children,
  maxWidth = 780,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}) {
  /* cierra con Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        background: "rgba(15,23,42,.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth,
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 24,
          background: "#fff",
          border: `1px solid ${C.border}`,
          boxShadow: "0 20px 55px rgba(15,23,42,.12)",
          animation: "modalIn .18s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
      <style>{`
        @keyframes modalIn{
          from{opacity:0;transform:translateY(16px) scale(.97)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   FORMULARIO — Crear / Editar
══════════════════════════════════════════════════════ */
interface FormState {
  nombre: string;
  descripcion: string;
  permisos: Permisos;
  estado: "activo" | "inactivo";
}

function RolForm({
  initial,
  onSave,
  onCancel,
  title,
}: {
  initial: FormState;
  onSave: (data: FormState) => void;
  onCancel: () => void;
  title: string;
}) {
  const [form, setForm] = useState<FormState>(initial);

  const handleTogglePermiso = (k: keyof Permisos) =>
    setForm((f) => ({ ...f, permisos: { ...f.permisos, [k]: !f.permisos[k] } }));

  const handleToggleGrupo = (grupo: string) => {
    const keys = Object.keys(PERMISOS[grupo as keyof typeof PERMISOS]) as Array<keyof Permisos>;
    const allOn = keys.every((k) => form.permisos[k]);
    const next = { ...form.permisos };
    keys.forEach((k) => { next[k] = !allOn; });
    setForm((f) => ({ ...f, permisos: next }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    onSave(form);
  };

  const activeCount = countActive(form.permisos);
  const total       = Object.keys(form.permisos).length;

  return (
    <form onSubmit={handleSubmit}>
      {/* ── HEADER ── */}
      <div
        style={{
          padding: "1.4rem 1.8rem 1.2rem",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: "rgba(57,169,0,.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ShieldCheck size={18} color={C.primary} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>
              Seguridad
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1 }}>{title}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          style={{
            width: 34, height: 34, borderRadius: 9,
            border: `1px solid ${C.border}`,
            background: "#fff", cursor: "pointer", color: C.textLight,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>

        {/* Información básica */}
        <section>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.textLight, textTransform: "uppercase", marginBottom: 10 }}>
            Información básica
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* Nombre */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Nombre del rol
              </label>
              <input
                type="text"
                placeholder="ej. Operador de turno"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 11,
                  border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                  fontFamily: "inherit", background: "#F8FAFC",
                }}
              />
            </div>

            {/* Estado */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Estado
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {(["activo", "inactivo"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, estado: s }))}
                    style={{
                      flex: 1, padding: "11px 10px", borderRadius: 11, fontSize: 12,
                      fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      border: form.estado === s ? "1px solid transparent" : `1px solid ${C.border}`,
                      background: form.estado === s
                        ? s === "activo" ? "rgba(57,169,0,.1)" : "rgba(100,116,139,.1)"
                        : "#F8FAFC",
                      color: form.estado === s
                        ? s === "activo" ? C.primaryDark : C.textLight
                        : C.textLight,
                    }}
                  >
                    {s === "activo" ? "✓ Activo" : "✗ Inactivo"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div style={{ marginTop: 10 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
              Descripción
            </label>
            <textarea
              placeholder="Describe las responsabilidades de este rol..."
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              rows={2}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 11,
                border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                fontFamily: "inherit", background: "#F8FAFC", resize: "none",
              }}
            />
          </div>
        </section>

        {/* Permisos */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.textLight, textTransform: "uppercase" }}>
              Permisos
            </p>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>
              {activeCount} / {total} activos
            </span>
          </div>

          {/* Barra global */}
          <div style={{ height: 4, borderRadius: 999, background: "#E2E8F0", marginBottom: 12, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 999, background: C.primary,
              width: `${(activeCount / total) * 100}%`,
              transition: "width .3s ease",
            }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {Object.entries(PERMISOS).map(([grupo, permisos]) => {
              const color  = GRUPO_COLORS[grupo] ?? C.primary;
              const keys   = Object.keys(permisos) as Array<keyof Permisos>;
              const on     = keys.filter((k) => form.permisos[k]).length;
              const total  = keys.length;
              const allOn  = on === total;

              return (
                <div
                  key={grupo}
                  style={{
                    borderRadius: 12, border: `1px solid ${C.border}`,
                    background: "#F8FAFC", overflow: "hidden",
                  }}
                >
                  {/* grupo header */}
                  <div
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "9px 12px",
                      borderBottom: `1px solid ${C.border}`,
                      background: "#fff",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div
                        style={{
                          width: 24, height: 24, borderRadius: 7,
                          background: `${color}18`, color,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {GRUPO_ICONS[grupo]}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, color: C.text, textTransform: "capitalize" }}>
                        {grupo}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleGrupo(grupo)}
                      style={{
                        fontSize: 10, fontWeight: 700, color,
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {allOn ? "Quitar todo" : "Todo"}
                    </button>
                  </div>

                  {/* barra grupo */}
                  <div style={{ height: 3, background: "#E2E8F0", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: color, width: `${(on / total) * 100}%`, transition: "width .3s" }} />
                  </div>

                  {/* items */}
                  <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
                    {Object.entries(permisos).map(([key, label]) => {
                      const checked = form.permisos[key as keyof Permisos];
                      return (
                        <div
                          key={key}
                          onClick={() => handleTogglePermiso(key as keyof Permisos)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "8px 10px", borderRadius: 9, cursor: "pointer",
                            border: `1px solid ${checked ? `${color}30` : C.border}`,
                            background: checked ? `${color}08` : "#fff",
                            transition: "all .15s",
                          }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{label}</span>
                          <div
                            style={{
                              width: 16, height: 16, borderRadius: 5,
                              border: `1.5px solid ${checked ? color : C.border}`,
                              background: checked ? color : "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                              transition: "all .15s",
                            }}
                          >
                            {checked && <span style={{ color: "#fff", fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── FOOTER ── */}
      <div
        style={{
          padding: "1rem 1.8rem",
          borderTop: `1px solid ${C.border}`,
          display: "flex", gap: 10, justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "11px 20px", borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: "#fff", color: C.text,
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          style={{
            padding: "11px 24px", borderRadius: 12,
            border: "none", background: C.primary, color: "#fff",
            fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 6px 18px rgba(57,169,0,.22)",
          }}
        >
          {title === "Nuevo Rol" ? "Crear Rol" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════════
   MODAL DETALLE — Ver rol
══════════════════════════════════════════════════════ */
function ViewModal({ rol, onClose, onEdit }: { rol: Rol; onClose: () => void; onEdit: () => void }) {
  const accent       = getRolAccent(rol.nombre);
  const activeCount  = countActive(rol.permisos);
  const total        = Object.keys(rol.permisos).length;
  const protegido    = ROLES_PROTEGIDOS.includes(rol.nombre);

  return (
    <>
      {/* HEADER verde */}
      <div
        style={{
          padding: "1.6rem 1.8rem 1.4rem",
          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
          color: "#fff",
          borderRadius: "24px 24px 0 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,.07)", top: -80, right: -60,
        }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div
              style={{
                width: 42, height: 42, borderRadius: 11,
                background: "rgba(255,255,255,.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Shield size={20} />
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: "rgba(255,255,255,.15)", border: "none",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={15} />
            </button>
          </div>
          <h2 style={{ marginTop: 14, fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{rol.nombre}</h2>
          <p style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
            {rol.descripcion || "Sin descripción"}
          </p>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
              background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
              textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              {rol.estado}
            </span>
            {protegido && (
              <span style={{
                padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Lock size={10} /> Protegido
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: "1.4rem 1.8rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.textLight, textTransform: "uppercase" }}>
            Permisos activos
          </p>
          <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>{activeCount} / {total}</span>
        </div>

        {/* barra */}
        <div style={{ height: 4, borderRadius: 999, background: "#E2E8F0", marginBottom: 12, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, background: accent, width: `${(activeCount / total) * 100}%` }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {Object.entries(rol.permisos).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 12px", borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: `1px solid ${value ? `${accent}20` : C.border}`,
                background: value ? `${accent}06` : "#FAFAFA",
                color: value ? C.text : C.textLight,
              }}
            >
              <span>{PERMISO_LABELS[key] ?? key}</span>
              {value
                ? <CheckCircle2 size={14} color={accent} />
                : <XCircle     size={14} color="#CBD5E1" />
              }
            </div>
          ))}
        </div>

        <button
          onClick={onEdit}
          style={{
            marginTop: 16, width: "100%",
            padding: "13px 20px", borderRadius: 12,
            border: "none", background: accent, color: "#fff",
            fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: `0 6px 18px ${accent}33`,
          }}
        >
          <Pencil size={14} />
          Editar este rol
        </button>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════ */
const emptyForm = (): FormState => ({
  nombre: "", descripcion: "", permisos: { ...initialPermisos }, estado: "activo",
});

export function Roles() {
  const { roles, addRol, updateRol, deleteRol } = useData();

  const [dialogOpen,     setDialogOpen]     = useState(false);
  const [viewOpen,       setViewOpen]       = useState(false);
  const [editingRol,     setEditingRol]     = useState<Rol | null>(null);
  const [viewingRol,     setViewingRol]     = useState<Rol | null>(null);
  const [search,         setSearch]         = useState("");
  const [filterEstado,   setFilterEstado]   = useState<"todos" | "activo" | "inactivo">("todos");

  /* ── form state ── */
  const [formInitial, setFormInitial] = useState<FormState>(emptyForm());

  const openCreate = () => {
    setEditingRol(null);
    setFormInitial(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (rol: Rol) => {
    setEditingRol(rol);
    setFormInitial({ nombre: rol.nombre, descripcion: rol.descripcion, permisos: { ...rol.permisos }, estado: rol.estado });
    setViewOpen(false);
    setDialogOpen(true);
  };

  const handleSave = (data: FormState) => {
    if (editingRol) {
      updateRol(editingRol.id, data);
      toast.success("Rol actualizado correctamente");
    } else {
      addRol(data);
      toast.success("Rol creado correctamente");
    }
    setDialogOpen(false);
  };

  const handleDelete = (rol: Rol) => {
    if (ROLES_PROTEGIDOS.includes(rol.nombre)) { toast.error("Este rol está protegido"); return; }
    if (confirm(`¿Eliminar el rol "${rol.nombre}"?`)) {
      deleteRol(rol.id);
      toast.success("Rol eliminado");
    }
  };

  const handleDuplicate = (rol: Rol) => {
    addRol({ ...rol, nombre: `${rol.nombre} Copia` });
    toast.success("Rol duplicado");
  };

  const filteredRoles = useMemo(() =>
    roles.filter((r) => {
      const ms = r.nombre.toLowerCase().includes(search.toLowerCase());
      const me = filterEstado === "todos" || r.estado === filterEstado;
      return ms && me;
    }),
    [roles, search, filterEstado]
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .roles-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .rol-card{ transition:box-shadow .18s,transform .18s; }
        .rol-card:hover{ box-shadow:0 8px 28px rgba(15,23,42,.1); transform:translateY(-1px); }
        .rol-action-btn{ transition:background .15s,color .15s; }
        .rol-action-btn:hover{ background:#F1F5F9 !important; color:#0F172A !important; }
        input:focus,textarea:focus,select:focus{
          outline:none;
          border-color:${C.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
      `}</style>

      <div className="roles-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── HERO ── */}
        <div
          style={{
            position: "relative", overflow: "hidden", borderRadius: 20,
            background: "linear-gradient(135deg,#39A900,#2D7D00)",
            padding: "1.4rem 1.6rem", color: "#fff",
          }}
        >
          <div style={{
            position: "absolute", width: 250, height: 250, borderRadius: "50%",
            background: "rgba(255,255,255,.07)", top: -80, right: -60,
          }} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)",
                padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                letterSpacing: 1, textTransform: "uppercase", marginBottom: 8,
              }}>
                <ShieldCheck size={11} /> Seguridad y permisos
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
                Gestión de Roles
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
                Administra accesos, permisos y niveles de seguridad.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, minWidth: 280 }}>
              {[
                { label: "Activos",    value: roles.filter((r) => r.estado === "activo").length },
                { label: "Protegidos", value: ROLES_PROTEGIDOS.length },
                { label: "Permisos",   value: Object.keys(initialPermisos).length },
                { label: "Total",      value: roles.length },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 12, padding: "8px 10px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,.65)", textTransform: "uppercase", marginBottom: 2 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TOPBAR ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative", minWidth: 180 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />
            <input
              placeholder="Buscar rol..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px 10px 36px", borderRadius: 11,
                border: `1px solid ${C.border}`, fontSize: 13, background: "#fff",
                fontFamily: "inherit",
              }}
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as any)}
            style={{
              padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`,
              fontSize: 13, background: "#fff", fontFamily: "inherit", cursor: "pointer",
            }}
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          <button
            onClick={openCreate}
            style={{
              padding: "10px 18px", borderRadius: 11, border: "none",
              background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 7,
              boxShadow: "0 4px 14px rgba(57,169,0,.25)",
            }}
          >
            <Plus size={15} /> Nuevo Rol
          </button>
        </div>

        {/* ── GRID ── */}
        {filteredRoles.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "3rem 1rem", borderRadius: 16, border: `2px dashed ${C.border}`,
            background: "#fff", color: C.textLight,
          }}>
            <Shield size={36} color={C.border} style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron roles</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o crea uno nuevo</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
            gap: 10,
          }}>
            {filteredRoles.map((rol) => {
              const activeCount = countActive(rol.permisos);
              const total       = Object.keys(rol.permisos).length;
              const pct         = Math.round((activeCount / total) * 100);
              const protegido   = ROLES_PROTEGIDOS.includes(rol.nombre);
              const accent      = getRolAccent(rol.nombre);
              const activo      = rol.estado === "activo";

              return (
                <div
                  key={rol.id}
                  className="rol-card"
                  style={{
                    borderRadius: 14, border: `1px solid ${C.border}`,
                    background: "#fff", overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(15,23,42,.05)",
                  }}
                >
                  {/* stripe */}
                  <div style={{ height: 3, background: accent }} />

                  {/* header */}
                  <div style={{ padding: "12px 12px 8px", display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                      background: `${accent}15`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Shield size={14} color={accent} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 800, color: C.text, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {rol.nombre}
                      </p>
                      <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999,
                          background: activo ? "rgba(57,169,0,.1)" : "rgba(156,163,175,.12)",
                          color: activo ? C.primaryDark : C.textLight,
                          textTransform: "uppercase", letterSpacing: 0.4,
                        }}>
                          {rol.estado}
                        </span>
                        {protegido && <Lock size={10} color="#EF4444" />}
                      </div>
                    </div>
                  </div>

                  {/* bar */}
                  <div style={{ padding: "0 12px 8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: .8 }}>Acceso</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: accent }}>{activeCount}/{total}</span>
                    </div>
                    <div style={{ height: 3, borderRadius: 999, background: "#E2E8F0", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 999, background: accent, width: `${pct}%` }} />
                    </div>
                  </div>

                  {/* tags */}
                  <div style={{ padding: "0 12px 10px", display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {Object.entries(rol.permisos).filter(([, v]) => v).slice(0, 2).map(([k]) => (
                      <span key={k} style={{
                        fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 999,
                        background: "#F1F5F9", color: C.textLight,
                      }}>
                        {PERMISO_LABELS[k] ?? k}
                      </span>
                    ))}
                    {activeCount > 2 && (
                      <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 999, background: "#F1F5F9", color: C.textLight }}>
                        +{activeCount - 2}
                      </span>
                    )}
                  </div>

                  {/* actions */}
                  <div style={{
                    borderTop: `1px solid ${C.border}`, padding: "7px 8px",
                    display: "flex", justifyContent: "flex-end", gap: 2,
                  }}>
                    {[
                      { icon: <Eye size={12} />, title: "Ver", color: C.textLight,
                        onClick: () => { setViewingRol(rol); setViewOpen(true); } },
                      { icon: <Pencil size={12} />, title: "Editar", color: C.textLight,
                        onClick: () => openEdit(rol) },
                      { icon: <Copy size={12} />, title: "Duplicar", color: "#2563EB",
                        onClick: () => handleDuplicate(rol) },
                      ...(!protegido ? [{
                        icon: <Trash2 size={12} />, title: "Eliminar", color: "#EF4444",
                        onClick: () => handleDelete(rol),
                      }] : []),
                    ].map((btn, i) => (
                      <button
                        key={i}
                        className="rol-action-btn"
                        title={btn.title}
                        onClick={btn.onClick}
                        style={{
                          width: 26, height: 26, borderRadius: 7,
                          border: "none", background: "transparent",
                          color: btn.color, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {btn.icon}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL CREAR / EDITAR ── */}
      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={780}>
        <RolForm
          key={editingRol?.id ?? "new"}
          initial={formInitial}
          title={editingRol ? "Editar Rol" : "Nuevo Rol"}
          onSave={handleSave}
          onCancel={() => setDialogOpen(false)}
        />
      </Modal>

      {/* ── MODAL VER ── */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} maxWidth={440}>
        {viewingRol && (
          <ViewModal
            rol={viewingRol}
            onClose={() => setViewOpen(false)}
            onEdit={() => openEdit(viewingRol)}
          />
        )}
      </Modal>
    </>
  );
}