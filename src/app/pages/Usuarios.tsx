import React, { useMemo, useState, useEffect } from "react";

import {
  Plus, Pencil, Trash2, Eye, Search,
  UserCircle, Shield, Mail, Phone, Lock,
  CheckCircle2, XCircle, UserCheck, X,
  Users, UserX, IdCard, KeyRound, Eye as EyeIcon, EyeOff,
} from "lucide-react";

import { useData, Usuario } from "../context/DataContext";
import { toast }            from "sonner";

/* ─── Paleta (idéntica a Roles/Login) ─── */
const C = {
  primary:     "#39A900",
  primaryDark: "#2D7D00",
  text:        "#0F172A",
  textLight:   "#64748B",
  border:      "#E2E8F0",
  bg:          "#F8FAFC",
};

/* ─── Constantes ─── */
const USUARIOS_PROTEGIDOS = ["admin@sena.edu.co", "superadmin@sena.edu.co"];

/* ─── Helpers de estilo ─── */
function getRoleAccent(rol: string) {
  switch (rol) {
    case "Administrador": return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", dot: "#EF4444" };
    case "SuperAdmin":    return { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6" };
    case "Supervisor":    return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB" };
    case "Operador":      return { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B" };
    default:              return { bg: "#ECFDF5", text: "#166534", border: "#A7F3D0", dot: "#39A900" };
  }
}

const AVATAR_PALETTE = [
  ["#39A900","#2D7D00"], ["#2563EB","#1D4ED8"], ["#8B5CF6","#7C3AED"],
  ["#F59E0B","#D97706"], ["#EF4444","#DC2626"], ["#0891B2","#0E7490"],
];

function avatarColors(nombre: string): [string, string] {
  const idx = (nombre.charCodeAt(0) || 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx] as [string, string];
}

function initials(nombre: string) {
  return nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

/* ══════════════════════════════════════════════════
   MODAL reutilizable (igual que en Roles)
══════════════════════════════════════════════════ */
function Modal({
  open, onClose, children, maxWidth = 680,
}: {
  open: boolean; onClose: () => void; children: React.ReactNode; maxWidth?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
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
          maxHeight: "92vh", overflowY: "auto",
          borderRadius: 24, background: "#fff",
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

/* ══════════════════════════════════════════════════
   CAMPO reutilizable
══════════════════════════════════════════════════ */
function Field({
  label, children, hint,
}: {
  label: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: C.textLight }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 11,
  border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
  fontFamily: "inherit", background: C.bg, color: C.text,
};

const inputIconStyle: React.CSSProperties = {
  ...inputStyle, paddingLeft: 38,
};

/* ══════════════════════════════════════════════════
   FORM — Crear / Editar
══════════════════════════════════════════════════ */
function UsuarioForm({
  initial, title, roles, onSave, onCancel,
}: {
  initial: FormState; title: string;
  roles: { id: string; nombre: string }[];
  onSave: (d: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm]         = useState<FormState>(initial);
  const [showPass, setShowPass] = useState(false);
  const isEdit                  = title.startsWith("Editar");

  const set = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (!form.correo.trim()) { toast.error("El correo es obligatorio"); return; }
    onSave(form);
  };

  const iconColor = C.textLight;

  return (
    <form onSubmit={handleSubmit}>
      {/* ── HEADER ── */}
      <div style={{
        padding: "1.4rem 1.8rem 1.2rem",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "rgba(57,169,0,.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <UserCheck size={18} color={C.primary} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>
              Gestión de accesos
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1 }}>{title}</h2>
          </div>
        </div>
        <button type="button" onClick={onCancel} style={{
          width: 34, height: 34, borderRadius: 9,
          border: `1px solid ${C.border}`, background: "#fff",
          cursor: "pointer", color: C.textLight,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <X size={16} />
        </button>
      </div>

      {/* ── BODY ── */}
      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* Sección: Documento */}
        <section style={{ borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.textLight, textTransform: "uppercase" }}>
              Documento de identidad
            </p>
          </div>
          <div style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Tipo de documento">
              <select
                value={form.tipoDocumento}
                onChange={(e) => set("tipoDocumento", e.target.value)}
                style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="TI">Tarjeta de Identidad (TI)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
              </select>
            </Field>
            <Field label="Número de identificación">
              <div style={{ position: "relative" }}>
                <IdCard size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: iconColor }} />
                <input
                  placeholder="ej. 1001234567"
                  value={form.identificacion}
                  onChange={(e) => set("identificacion", e.target.value)}
                  style={inputIconStyle}
                />
              </div>
            </Field>
          </div>
        </section>

        {/* Sección: Datos personales */}
        <section style={{ borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.textLight, textTransform: "uppercase" }}>
              Datos personales
            </p>
          </div>
          <div style={{ padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: 10 }}>
            <Field label="Nombre completo">
              <input
                placeholder="ej. María García López"
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Correo electrónico">
                <div style={{ position: "relative" }}>
                  <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: iconColor }} />
                  <input
                    type="email" placeholder="correo@sena.edu.co"
                    value={form.correo}
                    onChange={(e) => set("correo", e.target.value)}
                    style={inputIconStyle}
                  />
                </div>
              </Field>
              <Field label="Teléfono">
                <div style={{ position: "relative" }}>
                  <Phone size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: iconColor }} />
                  <input
                    placeholder="300 000 0000"
                    value={form.numero}
                    onChange={(e) => set("numero", e.target.value)}
                    style={inputIconStyle}
                  />
                </div>
              </Field>
            </div>
          </div>
        </section>

        {/* Sección: Credenciales */}
        <section style={{ borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", background: C.bg, borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.textLight, textTransform: "uppercase" }}>
              Credenciales y acceso
            </p>
          </div>
          <div style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Contraseña" hint={isEdit ? "vacío = sin cambios" : undefined}>
              <div style={{ position: "relative" }}>
                <KeyRound size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: iconColor }} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  style={{ ...inputIconStyle, paddingRight: 38 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: iconColor,
                    display: "flex", alignItems: "center",
                  }}
                >
                  {showPass ? <EyeOff size={14} /> : <EyeIcon size={14} />}
                </button>
              </div>
            </Field>

            <Field label="Rol del sistema">
              <select
                value={form.rol}
                onChange={(e) => set("rol", e.target.value)}
                style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
              >
                <option value="">Seleccionar rol…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.nombre}>{r.nombre}</option>
                ))}
              </select>
            </Field>

            {/* Estado toggle */}
            <div style={{ gridColumn: "1 / -1" }}>
              <Field label="Estado de la cuenta">
                <div style={{ display: "flex", gap: 8 }}>
                  {(["activo", "inactivo"] as const).map((s) => (
                    <button
                      key={s} type="button"
                      onClick={() => set("estado", s)}
                      style={{
                        flex: 1, padding: "11px 10px", borderRadius: 11,
                        fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                        border: form.estado === s ? "1px solid transparent" : `1px solid ${C.border}`,
                        background: form.estado === s
                          ? s === "activo" ? "rgba(57,169,0,.1)" : "rgba(239,68,68,.08)"
                          : C.bg,
                        color: form.estado === s
                          ? s === "activo" ? C.primaryDark : "#B91C1C"
                          : C.textLight,
                      }}
                    >
                      {s === "activo" ? "✓ Activo" : "✗ Inactivo"}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </div>
        </section>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        padding: "1rem 1.8rem",
        borderTop: `1px solid ${C.border}`,
        display: "flex", gap: 10, justifyContent: "flex-end",
      }}>
        <button type="button" onClick={onCancel} style={{
          padding: "11px 20px", borderRadius: 12,
          border: `1px solid ${C.border}`, background: "#fff",
          color: C.text, fontSize: 13, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Cancelar
        </button>
        <button type="submit" style={{
          padding: "11px 24px", borderRadius: 12,
          border: "none", background: C.primary, color: "#fff",
          fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 6px 18px rgba(57,169,0,.22)",
        }}>
          {isEdit ? "Guardar cambios" : "Crear Usuario"}
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════════
   MODAL DETALLE — Ver usuario
══════════════════════════════════════════════════ */
function ViewModal({
  usuario, onClose, onEdit,
}: {
  usuario: Usuario; onClose: () => void; onEdit: () => void;
}) {
  const [c1, c2]  = avatarColors(usuario.nombre);
  const ini       = initials(usuario.nombre);
  const activo    = usuario.estado === "activo";
  const roleStyle = getRoleAccent(usuario.rol);
  const protegido = USUARIOS_PROTEGIDOS.includes(usuario.correo);

  return (
    <>
      {/* Header con gradiente del avatar */}
      <div style={{
        padding: "1.6rem 1.8rem 1.4rem",
        background: `linear-gradient(135deg,${c1},${c2})`,
        color: "#fff", borderRadius: "24px 24px 0 0",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,.07)", top: -80, right: -60,
        }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "rgba(255,255,255,.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 900,
            }}>
              {ini}
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 9,
              background: "rgba(255,255,255,.15)", border: "none",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <X size={15} />
            </button>
          </div>
          <h2 style={{ marginTop: 14, fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{usuario.nombre}</h2>
          <p style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,.8)" }}>
            {usuario.tipoDocumento} · {usuario.identificacion}
          </p>
          <div style={{ marginTop: 10, display: "flex", gap: 7, flexWrap: "wrap" }}>
            {[
              usuario.estado,
              usuario.rol || "Sin rol",
              ...(protegido ? ["🔒 Protegido"] : []),
            ].map((tag) => (
              <span key={tag} style={{
                padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
                textTransform: "uppercase", letterSpacing: 0.5,
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { icon: <Mail size={14} />,  label: usuario.correo },
          { icon: <Phone size={14} />, label: usuario.numero || "—" },
          {
            icon: <Shield size={14} style={{ color: roleStyle.dot }} />,
            label: <span style={{ fontWeight: 700, color: roleStyle.text }}>{usuario.rol || "Sin rol"}</span>,
          },
          {
            icon: activo
              ? <CheckCircle2 size={14} color={C.primary} />
              : <XCircle      size={14} color="#EF4444"   />,
            label: <span style={{ fontWeight: 700, color: activo ? C.primaryDark : "#B91C1C" }}>
              {activo ? "Cuenta activa" : "Cuenta inactiva"}
            </span>,
          },
        ].map((row, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 11,
            border: `1px solid ${C.border}`, background: C.bg,
            fontSize: 13, color: C.text,
          }}>
            <span style={{ color: C.textLight, flexShrink: 0 }}>{row.icon}</span>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {row.label}
            </span>
          </div>
        ))}

        <button onClick={onEdit} style={{
          marginTop: 6, width: "100%",
          padding: "13px 20px", borderRadius: 12,
          border: "none",
          background: `linear-gradient(135deg,${c1},${c2})`,
          color: "#fff", fontSize: 13, fontWeight: 800,
          cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: `0 6px 18px ${c1}55`,
        }}>
          <Pencil size={14} />
          Editar usuario
        </button>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════ */
const emptyForm = (): FormState => ({
  correo: "", password: "", nombre: "", numero: "",
  rol: "", tipoDocumento: "CC", identificacion: "", estado: "activo",
});

type FormState = {
  correo: string; password: string; nombre: string; numero: string;
  rol: string; tipoDocumento: string; identificacion: string;
  estado: "activo" | "inactivo";
};

export default function Usuarios() {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario, roles } = useData();

  const [dialogOpen,     setDialogOpen]     = useState(false);
  const [viewOpen,       setViewOpen]       = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [viewingUsuario, setViewingUsuario] = useState<Usuario | null>(null);
  const [formInitial,    setFormInitial]    = useState<FormState>(emptyForm());
  const [search,         setSearch]         = useState("");
  const [filterEstado,   setFilterEstado]   = useState<"todos"|"activo"|"inactivo">("todos");
  const [filterRol,      setFilterRol]      = useState("todos");

  const totalActivos   = usuarios.filter((u) => u.estado === "activo").length;
  const totalInactivos = usuarios.filter((u) => u.estado === "inactivo").length;
  const uniqueRoles    = Array.from(new Set(usuarios.map((u) => u.rol).filter(Boolean)));

  const filtered = useMemo(() =>
    usuarios.filter((u) => {
      const q  = search.toLowerCase();
      const ms = u.nombre.toLowerCase().includes(q) || u.correo.toLowerCase().includes(q) || u.identificacion.includes(search);
      const me = filterEstado === "todos" || u.estado === filterEstado;
      const mr = filterRol    === "todos" || u.rol === filterRol;
      return ms && me && mr;
    }),
    [usuarios, search, filterEstado, filterRol]
  );

  const openCreate = () => {
    setEditingUsuario(null);
    setFormInitial(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (u: Usuario) => {
    setEditingUsuario(u);
    setFormInitial({
      correo: u.correo, password: u.password, nombre: u.nombre,
      numero: u.numero, rol: u.rol, tipoDocumento: u.tipoDocumento,
      identificacion: u.identificacion, estado: u.estado,
    });
    setViewOpen(false);
    setDialogOpen(true);
  };

  const handleSave = (data: FormState) => {
    if (editingUsuario) {
      updateUsuario(editingUsuario.id, data);
      toast.success("Usuario actualizado correctamente");
    } else {
      addUsuario(data);
      toast.success("Usuario creado correctamente");
    }
    setDialogOpen(false);
  };

  const handleDelete = (u: Usuario) => {
    if (USUARIOS_PROTEGIDOS.includes(u.correo)) { toast.error("Este usuario está protegido"); return; }
    if (confirm(`¿Eliminar a "${u.nombre}"?`)) { deleteUsuario(u.id); toast.success("Usuario eliminado"); }
  };

  const handleToggleEstado = (u: Usuario) => {
    if (USUARIOS_PROTEGIDOS.includes(u.correo)) { toast.error("Este usuario está protegido"); return; }
    updateUsuario(u.id, { ...u, estado: u.estado === "activo" ? "inactivo" : "activo" });
  };

  /* ─── render ─── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .u-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .u-card{ transition:box-shadow .18s,transform .18s; }
        .u-card:hover{ box-shadow:0 8px 28px rgba(15,23,42,.1); transform:translateY(-2px); }
        .u-btn{ transition:background .15s,opacity .15s; }
        .u-btn:hover{ opacity:.85; }
        input:focus,select:focus,textarea:focus{
          outline:none;
          border-color:${C.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
      `}</style>

      <div className="u-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── HERO ── */}
        <div style={{
          position: "relative", overflow: "hidden", borderRadius: 20,
          background: "linear-gradient(135deg,#39A900,#2D7D00)",
          padding: "1.4rem 1.6rem", color: "#fff",
        }}>
          <div style={{
            position: "absolute", width: 250, height: 250, borderRadius: "50%",
            background: "rgba(255,255,255,.07)", top: -80, right: -60,
          }} />
          <div style={{
            position: "relative", zIndex: 2,
            display: "flex", flexWrap: "wrap", gap: 16,
            alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)",
                padding: "4px 12px", borderRadius: 999,
                fontSize: 10, fontWeight: 800, letterSpacing: 1,
                textTransform: "uppercase", marginBottom: 8,
              }}>
                <Shield size={11} /> Gestión institucional
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
                Gestión de Usuarios
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
                Administra cuentas, accesos, roles y permisos del sistema.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, minWidth: 280 }}>
              {[
                { label: "Total",     value: usuarios.length,    icon: <Users    size={11} /> },
                { label: "Activos",   value: totalActivos,        icon: <UserCheck size={11} /> },
                { label: "Inactivos", value: totalInactivos,      icon: <UserX    size={11} /> },
                { label: "Roles",     value: uniqueRoles.length,  icon: <Shield   size={11} /> },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 12, padding: "8px 10px", textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: 1,
                    color: "rgba(255,255,255,.65)", textTransform: "uppercase",
                    marginBottom: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
                  }}>
                    {s.icon} {s.label}
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
              placeholder="Buscar usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as any)}
            style={{ ...inputStyle, width: "auto", appearance: "none", paddingRight: 28, cursor: "pointer" }}
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
            style={{ ...inputStyle, width: "auto", appearance: "none", paddingRight: 28, cursor: "pointer" }}
          >
            <option value="todos">Todos los roles</option>
            {uniqueRoles.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <button
            className="u-btn"
            onClick={openCreate}
            style={{
              padding: "10px 18px", borderRadius: 11, border: "none",
              background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 7,
              boxShadow: "0 4px 14px rgba(57,169,0,.25)",
            }}
          >
            <Plus size={15} /> Nuevo Usuario
          </button>
        </div>

        {/* contador */}
        {(search || filterEstado !== "todos" || filterRol !== "todos") && (
          <p style={{ fontSize: 11, color: C.textLight }}>
            Mostrando <strong style={{ color: C.text }}>{filtered.length}</strong> resultado{filtered.length !== 1 ? "s" : ""}
            {search && <> para "<strong>{search}</strong>"</>}
          </p>
        )}

        {/* ── GRID ── */}
        {filtered.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "3rem 1rem", borderRadius: 16, border: `2px dashed ${C.border}`,
            background: "#fff", color: C.textLight,
          }}>
            <UserCircle size={40} color={C.border} style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron usuarios</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o crea uno nuevo</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
            gap: 12,
          }}>
            {filtered.map((u) => {
              const protegido  = USUARIOS_PROTEGIDOS.includes(u.correo);
              const activo     = u.estado === "activo";
              const roleStyle  = getRoleAccent(u.rol);
              const [c1, c2]   = avatarColors(u.nombre);
              const ini        = initials(u.nombre);

              return (
                <div key={u.id} className="u-card" style={{
                  borderRadius: 16, border: `1px solid ${C.border}`,
                  background: "#fff", overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(15,23,42,.05)",
                }}>
                  {/* stripe del rol */}
                  <div style={{
                    height: 3,
                    background: `linear-gradient(90deg,${roleStyle.dot},${roleStyle.dot}66)`,
                  }} />

                  {/* card header */}
                  <div style={{ padding: "14px 14px 10px", display: "flex", alignItems: "flex-start", gap: 12 }}>
                    {/* avatar */}
                    <div style={{
                      width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                      background: `linear-gradient(135deg,${c1},${c2})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, fontWeight: 900, color: "#fff",
                      boxShadow: `0 3px 10px ${c1}44`,
                    }}>
                      {ini}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            fontSize: 13, fontWeight: 800, color: C.text, lineHeight: 1.2,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          }}>
                            {u.nombre}
                          </p>
                          <p style={{ fontSize: 10, color: C.textLight, marginTop: 1 }}>
                            {u.tipoDocumento} · {u.identificacion}
                          </p>
                        </div>

                        {/* toggle estado */}
                        <button
                          onClick={() => handleToggleEstado(u)}
                          title={activo ? "Desactivar" : "Activar"}
                          style={{
                            flexShrink: 0, width: 36, height: 20, borderRadius: 999,
                            border: "none", cursor: "pointer", position: "relative",
                            background: activo ? C.primary : "#CBD5E1",
                            transition: "background .2s",
                          }}
                        >
                          <span style={{
                            position: "absolute", top: 3,
                            left: activo ? 18 : 3,
                            width: 14, height: 14, borderRadius: "50%",
                            background: "#fff",
                            transition: "left .2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                          }} />
                        </button>
                      </div>

                      {/* badges */}
                      <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 5 }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                          background: roleStyle.bg, color: roleStyle.text,
                          border: `1px solid ${roleStyle.border}`,
                        }}>
                          <Shield size={9} /> {u.rol || "Sin rol"}
                        </span>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: 0.3,
                          background: activo ? "rgba(57,169,0,.1)" : "rgba(239,68,68,.08)",
                          color: activo ? "#166534" : "#B91C1C",
                        }}>
                          <span style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: activo ? C.primary : "#EF4444",
                          }} />
                          {u.estado}
                        </span>
                        {protegido && (
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "3px 9px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                            background: "#FFFBEB", color: "#92400E", border: "1px solid #FDE68A",
                          }}>
                            <Lock size={9} /> Protegido
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* datos de contacto */}
                  <div style={{ padding: "0 14px 12px", display: "flex", flexDirection: "column", gap: 5 }}>
                    {[
                      { icon: <Mail  size={12} />, text: u.correo },
                      { icon: <Phone size={12} />, text: u.numero || "—" },
                    ].map((row, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", borderRadius: 9,
                        border: `1px solid ${C.border}`, background: C.bg,
                        fontSize: 11, color: C.textLight,
                      }}>
                        <span style={{ color: C.textLight, flexShrink: 0 }}>{row.icon}</span>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {row.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* acciones */}
                  <div style={{
                    borderTop: `1px solid ${C.border}`, padding: "8px 12px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.textLight }}>
                      <UserCheck size={12} color={C.primary} />
                      Registrado
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[
                        {
                          icon: <Eye size={12} />, title: "Ver",
                          color: C.textLight, bg: C.bg,
                          onClick: () => { setViewingUsuario(u); setViewOpen(true); },
                        },
                        {
                          icon: <Pencil size={12} />, title: "Editar",
                          color: C.textLight, bg: C.bg,
                          onClick: () => openEdit(u),
                        },
                        ...(!protegido ? [{
                          icon: <Trash2 size={12} />, title: "Eliminar",
                          color: "#EF4444", bg: "#FEF2F2",
                          onClick: () => handleDelete(u),
                        }] : []),
                      ].map((btn, i) => (
                        <button
                          key={i} title={btn.title} onClick={btn.onClick}
                          className="u-btn"
                          style={{
                            width: 28, height: 28, borderRadius: 8,
                            border: `1px solid ${C.border}`, background: btn.bg,
                            color: btn.color, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {btn.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL CREAR / EDITAR ── */}
      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={640}>
        <UsuarioForm
          key={editingUsuario?.id ?? "new"}
          initial={formInitial}
          title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"}
          roles={roles}
          onSave={handleSave}
          onCancel={() => setDialogOpen(false)}
        />
      </Modal>

      {/* ── MODAL VER ── */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} maxWidth={420}>
        {viewingUsuario && (
          <ViewModal
            usuario={viewingUsuario}
            onClose={() => setViewOpen(false)}
            onEdit={() => openEdit(viewingUsuario)}
          />
        )}
      </Modal>
    </>
  );
}