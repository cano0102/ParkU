import React, { useMemo, useState, useEffect, useCallback, memo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  ShieldCheck,
  Car,
  Bike,
  Accessibility,
  Building2,
  Sparkles,
  X,
  GraduationCap,
  BookOpen,
  UserCheck,
  User,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { useData, Conductor } from "../context/DataContext";

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  text: "#0F172A",
  textLight: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
} as const;

const AVATAR_GRADIENTS = [
  ["#39A900", "#2D7D00"],
  ["#2563EB", "#1D4ED8"],
  ["#8B5CF6", "#7C3AED"],
  ["#F59E0B", "#D97706"],
  ["#EF4444", "#DC2626"],
  ["#0891B2", "#0E7490"],
] as const;

const getAvatarGradient = (str: string): [string, string] => {
  const idx = (str?.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx] as [string, string];
};

const getInitials = (nombre: string): string => {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getTipoStyle = (tipo: string) => {
  return tipo === "instructor"
    ? { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB", label: "Instructor", icon: GraduationCap }
    : { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", label: "Aprendiz", icon: BookOpen };
};

const sanitizeText = (text: string): string => {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

const Modal = memo(({ open, onClose, children, maxWidth = 780 }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const focusable = document.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) focusable[0]?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(15,23,42,.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 24,
          background: "#fff",
          border: `1px solid ${COLORS.border}`,
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
});

Modal.displayName = "Modal";

interface FieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

const Field = memo(({ label, children, hint }: FieldProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: COLORS.textLight }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
});

Field.displayName = "Field";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 11,
  border: `1px solid ${COLORS.border}`,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  background: COLORS.bg,
  color: COLORS.text,
};

interface FormState {
  usuarioId: string;
  tipoConductor: "aprendiz" | "instructor";
  centroFormacion: string;
  discapacidad: boolean;
  tipoDiscapacidad: string;
  estado: "activo" | "inactivo";
  placa: string;
  tipoVehiculo: "carro" | "moto";
  marca: string;
  modelo: string;
  año: number;
  color: string;
  descripcion: string;
}

const emptyForm = (): FormState => ({
  usuarioId: "",
  tipoConductor: "aprendiz",
  centroFormacion: "",
  discapacidad: false,
  tipoDiscapacidad: "",
  estado: "activo",
  placa: "",
  tipoVehiculo: "carro",
  marca: "",
  modelo: "",
  año: new Date().getFullYear(),
  color: "",
  descripcion: "",
});

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmDialog = memo(({ open, onConfirm, onCancel, title, message }: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(15,23,42,.45)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 20,
          background: "#fff",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 20px 55px rgba(15,23,42,.12)",
          padding: "1.8rem",
          animation: "modalIn .18s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-title" style={{ fontSize: 18, fontWeight: 900, color: COLORS.text, marginBottom: 8 }}>
          {title}
        </h3>
        <p style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.6, marginBottom: 20 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: "#fff",
              color: COLORS.text,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: "#EF4444",
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmDialog.displayName = "ConfirmDialog";

export function Conductores() {
  const {
    conductores,
    addConductor,
    updateConductor,
    deleteConductor,
    usuarios,
    vehiculos,
    addVehiculo,
    updateVehiculo,
    deleteVehiculo,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null);
  const [viewingConductor, setViewingConductor] = useState<Conductor | null>(null);
  const [deletingConductor, setDeletingConductor] = useState<Conductor | null>(null);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [formData, setFormData] = useState<FormState>(emptyForm());

  const getUsuario = useCallback((id: string) => usuarios.find((u) => u.id === id), [usuarios]);
  const getVehiculosConductor = useCallback((id: string) => vehiculos.filter((v) => v.conductorId === id), [vehiculos]);

  const totalActivos = useMemo(() => conductores.filter((c) => c.estado === "activo").length, [conductores]);
  const totalInstructores = useMemo(() => conductores.filter((c) => c.tipoConductor === "instructor").length, [conductores]);
  const totalAprendices = useMemo(() => conductores.filter((c) => c.tipoConductor === "aprendiz").length, [conductores]);
  const totalVehiculos = useMemo(() => vehiculos.length, [vehiculos]);
  const totalConductores = useMemo(() => conductores.length, [conductores]);

  const filteredConductores = useMemo(
    () =>
      conductores.filter((conductor) => {
        const usuario = getUsuario(conductor.usuarioId);
        if (!usuario) return false;
        const q = search.toLowerCase();
        const matchesSearch =
          usuario.nombre.toLowerCase().includes(q) ||
          usuario.identificacion.includes(search) ||
          conductor.centroFormacion.toLowerCase().includes(q);
        const matchesTipo = filterTipo === "todos" ? true : conductor.tipoConductor === filterTipo;
        const matchesEstado = filterEstado === "todos" ? true : conductor.estado === filterEstado;
        return matchesSearch && matchesTipo && matchesEstado;
      }),
    [conductores, search, filterTipo, filterEstado, getUsuario]
  );

  const openCreate = useCallback(() => {
    setEditingConductor(null);
    setFormData(emptyForm());
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback(
    (conductor: Conductor) => {
      setEditingConductor(conductor);
      const v = vehiculos.find((veh) => veh.conductorId === conductor.id);
      setFormData({
        usuarioId: conductor.usuarioId,
        tipoConductor: conductor.tipoConductor,
        centroFormacion: conductor.centroFormacion,
        discapacidad: conductor.discapacidad,
        tipoDiscapacidad: conductor.tipoDiscapacidad || "",
        estado: conductor.estado,
        placa: v?.placa || "",
        tipoVehiculo: (v?.tipo as "carro" | "moto") || "carro",
        marca: v?.marca || "",
        modelo: v?.modelo || "",
        año: v?.año || new Date().getFullYear(),
        color: v?.color || "",
        descripcion: v?.descripcion || "",
      });
      setViewOpen(false);
      setDialogOpen(true);
    },
    [vehiculos]
  );

  const openView = useCallback((conductor: Conductor) => {
    setViewingConductor(conductor);
    setViewOpen(true);
  }, []);

  const openConfirm = useCallback((conductor: Conductor) => {
    setDeletingConductor(conductor);
    setConfirmOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.usuarioId) {
      toast.error("Selecciona un usuario");
      return;
    }
    if (!formData.centroFormacion.trim()) {
      toast.error("El centro de formación es requerido");
      return;
    }

    const conductorData = {
      usuarioId: formData.usuarioId,
      tipoConductor: formData.tipoConductor,
      centroFormacion: sanitizeText(formData.centroFormacion.trim()),
      discapacidad: formData.discapacidad,
      tipoDiscapacidad: sanitizeText(formData.tipoDiscapacidad.trim()),
      estado: formData.estado,
    };

    try {
      if (editingConductor) {
        updateConductor(editingConductor.id, conductorData);

        const existingVehiculo = vehiculos.find((v) => v.conductorId === editingConductor.id);
        if (existingVehiculo) {
          updateVehiculo(existingVehiculo.id, {
            placa: formData.placa.toUpperCase().trim(),
            tipo: formData.tipoVehiculo,
            marca: sanitizeText(formData.marca.trim()),
            modelo: sanitizeText(formData.modelo.trim()),
            año: formData.año,
            color: sanitizeText(formData.color.trim()),
            descripcion: sanitizeText(formData.descripcion.trim()),
            estado: "activo",
          });
        } else if (formData.placa.trim()) {
          addVehiculo({
            conductorId: editingConductor.id,
            placa: formData.placa.toUpperCase().trim(),
            tipo: formData.tipoVehiculo,
            marca: sanitizeText(formData.marca.trim()),
            modelo: sanitizeText(formData.modelo.trim()),
            año: formData.año,
            color: sanitizeText(formData.color.trim()),
            descripcion: sanitizeText(formData.descripcion.trim()),
            estado: "activo",
          });
        }
        toast.success("Conductor actualizado correctamente");
      } else {
        addConductor(conductorData);
        const newConductor = conductores[conductores.length - 1];
        if (newConductor && formData.placa.trim()) {
          addVehiculo({
            conductorId: newConductor.id,
            placa: formData.placa.toUpperCase().trim(),
            tipo: formData.tipoVehiculo,
            marca: sanitizeText(formData.marca.trim()),
            modelo: sanitizeText(formData.modelo.trim()),
            año: formData.año,
            color: sanitizeText(formData.color.trim()),
            descripcion: sanitizeText(formData.descripcion.trim()),
            estado: "activo",
          });
        }
        toast.success("Conductor creado correctamente");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Error al guardar el conductor");
      console.error("Error saving conductor:", error);
    }
  }, [formData, editingConductor, conductores, vehiculos, addConductor, updateConductor, deleteConductor, addVehiculo, updateVehiculo]);

  const handleDelete = useCallback(() => {
    if (deletingConductor) {
      try {
        const vehiculosConductor = vehiculos.filter((v) => v.conductorId === deletingConductor.id);
        vehiculosConductor.forEach((v) => deleteVehiculo(v.id));
        deleteConductor(deletingConductor.id);
        toast.success("Conductor eliminado correctamente");
        setConfirmOpen(false);
        setDeletingConductor(null);
      } catch (error) {
        toast.error("Error al eliminar el conductor");
        console.error("Error deleting conductor:", error);
      }
    }
  }, [deletingConductor, vehiculos, deleteConductor, deleteVehiculo]);

  const handleToggleEstado = useCallback(
    (id: string, currentEstado: "activo" | "inactivo") => {
      try {
        const nuevoEstado = currentEstado === "activo" ? "inactivo" : "activo";
        updateConductor(id, { estado: nuevoEstado });
        toast.success(`Conductor ${nuevoEstado === "activo" ? "activado" : "desactivado"}`);
      } catch (error) {
        toast.error("Error al cambiar el estado");
        console.error("Error toggling status:", error);
      }
    },
    [updateConductor]
  );

  const isEdit = !!editingConductor;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .conductores-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .conductor-card{ transition:box-shadow .18s,transform .18s; }
        .conductor-card:hover{ box-shadow:0 8px 28px rgba(15,23,42,.1); transform:translateY(-2px); }
        .action-btn{ transition:background .15s,color .15s; }
        .action-btn:hover{ background:#F1F5F9 !important; color:#0F172A !important; }
        input:focus,textarea:focus,select:focus{
          outline:none;
          border-color:${COLORS.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
      `}</style>

      <div className="conductores-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 20,
            background: "linear-gradient(135deg,#39A900,#2D7D00)",
            padding: "1.4rem 1.6rem",
            color: "#fff",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 250,
              height: 250,
              borderRadius: "50%",
              background: "rgba(255,255,255,.07)",
              top: -80,
              right: -60,
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(255,255,255,.15)",
                  border: "1px solid rgba(255,255,255,.2)",
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                <ShieldCheck size={11} /> Gestión de conductores
              </div>
              <h1
                style={{
                  fontSize: "clamp(1.6rem,3vw,2.2rem)",
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                Gestión de Conductores
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
                Administra conductores, aprendices, instructores y vehículos autorizados del sistema SENA.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 8,
                minWidth: 280,
              }}
            >
              {[
                { label: "Total", value: totalConductores, icon: Users },
                { label: "Activos", value: totalActivos, icon: UserCheck },
                { label: "Instructores", value: totalInstructores, icon: GraduationCap },
                { label: "Vehículos", value: totalVehiculos, icon: Car },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: "rgba(255,255,255,.12)",
                    border: "1px solid rgba(255,255,255,.2)",
                    borderRadius: 12,
                    padding: "8px 10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: "rgba(255,255,255,.65)",
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    {s.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative", minWidth: 180 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: COLORS.textLight,
              }}
            />
            <input
              placeholder="Buscar conductor, identificación o centro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
              aria-label="Buscar conductores"
            />
          </div>

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            style={{
              ...inputStyle,
              width: "auto",
              appearance: "none",
              paddingRight: 28,
              cursor: "pointer",
            }}
            aria-label="Filtrar por tipo"
          >
            <option value="todos">Todos los tipos</option>
            <option value="aprendiz">Aprendiz</option>
            <option value="instructor">Instructor</option>
          </select>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as "todos" | "activo" | "inactivo")}
            style={{
              ...inputStyle,
              width: "auto",
              appearance: "none",
              paddingRight: 28,
              cursor: "pointer",
            }}
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          <button
            onClick={openCreate}
            style={{
              padding: "10px 18px",
              borderRadius: 11,
              border: "none",
              background: COLORS.primary,
              color: "#fff",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 4px 14px rgba(57,169,0,.25)",
            }}
          >
            <Plus size={15} /> Nuevo Conductor
          </button>
        </div>

        {(search || filterTipo !== "todos" || filterEstado !== "todos") && (
          <p style={{ fontSize: 11, color: COLORS.textLight }}>
            Mostrando <strong>{filteredConductores.length}</strong> resultado
            {filteredConductores.length !== 1 ? "s" : ""}
          </p>
        )}

        {filteredConductores.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "3rem 1rem",
              borderRadius: 16,
              border: `2px dashed ${COLORS.border}`,
              background: "#fff",
              color: COLORS.textLight,
            }}
          >
            <User size={36} color={COLORS.border} style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron conductores</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o registra uno nuevo</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
              gap: 12,
            }}
          >
            {filteredConductores.map((conductor) => {
              const usuario = getUsuario(conductor.usuarioId);
              const vehiculosCond = getVehiculosConductor(conductor.id);
              if (!usuario) return null;

              const [g1, g2] = getAvatarGradient(usuario.nombre);
              const initials = getInitials(usuario.nombre);
              const tipoStyle = getTipoStyle(conductor.tipoConductor);
              const activo = conductor.estado === "activo";
              const TipoIcon = tipoStyle.icon;

              return (
                <div
                  key={conductor.id}
                  className="conductor-card"
                  style={{
                    borderRadius: 14,
                    border: `1px solid ${COLORS.border}`,
                    background: "#fff",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(15,23,42,.05)",
                  }}
                >
                  <div style={{ height: 3, background: tipoStyle.dot }} />

                  <div style={{ padding: "14px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          flexShrink: 0,
                          background: `linear-gradient(135deg, ${g1}, ${g2})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 900,
                          fontSize: 16,
                        }}
                      >
                        {initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: COLORS.text,
                            lineHeight: 1.2,
                          }}
                        >
                          {sanitizeText(usuario.nombre)}
                        </p>
                        <p style={{ fontSize: 10, color: COLORS.textLight, marginTop: 2 }}>
                          {usuario.tipoDocumento} · {usuario.identificacion}
                        </p>
                        <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: tipoStyle.bg,
                              color: tipoStyle.text,
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <TipoIcon size={10} />
                            {tipoStyle.label}
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: activo ? "rgba(57,169,0,.1)" : "rgba(156,163,175,.12)",
                              color: activo ? COLORS.primaryDark : COLORS.textLight,
                            }}
                          >
                            {conductor.estado}
                          </span>
                          {conductor.discapacidad && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 999,
                                background: "#F3E8FF",
                                color: "#9333EA",
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              <Accessibility size={10} />
                              Discapacidad
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        borderRadius: 10,
                        background: "#F8FAFC",
                        border: `1px solid ${COLORS.border}`,
                        marginBottom: vehiculosCond.length > 0 ? 12 : 0,
                      }}
                    >
                      <Building2 size={13} color={COLORS.textLight} />
                      <span style={{ fontSize: 11, color: COLORS.text }}>
                        {sanitizeText(conductor.centroFormacion) || "—"}
                      </span>
                    </div>

                    {vehiculosCond.length > 0 && (
                      <div>
                        <p
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: 1,
                            color: COLORS.textLight,
                            textTransform: "uppercase",
                            marginBottom: 8,
                          }}
                        >
                          Vehículos registrados
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {vehiculosCond.map((v) => (
                            <div
                              key={v.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 10px",
                                borderRadius: 10,
                                background: "#F8FAFC",
                                border: `1px solid ${COLORS.border}`,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 8,
                                    background: `${g1}15`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {v.tipo === "moto" ? (
                                    <Bike size={14} color={g1} />
                                  ) : (
                                    <Car size={14} color={g1} />
                                  )}
                                </div>
                                <div>
                                  <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.text }}>
                                    {v.placa}
                                  </p>
                                  <p style={{ fontSize: 9, color: COLORS.textLight }}>
                                    {v.marca} {v.modelo} · {v.color}
                                  </p>
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                  background: `${g1}15`,
                                  color: g1,
                                  textTransform: "capitalize",
                                }}
                              >
                                {v.tipo}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      borderTop: `1px solid ${COLORS.border}`,
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => handleToggleEstado(conductor.id, conductor.estado)}
                        style={{
                          width: 36,
                          height: 20,
                          borderRadius: 999,
                          background: activo ? COLORS.primary : "#CBD5E1",
                          border: "none",
                          cursor: "pointer",
                          position: "relative",
                          transition: "background .2s",
                        }}
                        aria-label={activo ? "Desactivar conductor" : "Activar conductor"}
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            background: "#fff",
                            position: "absolute",
                            top: 2,
                            left: activo ? 18 : 2,
                            transition: "left .2s",
                          }}
                        />
                      </button>
                      <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textLight }}>
                        {activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        className="action-btn"
                        title="Ver detalle"
                        onClick={() => openView(conductor)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          border: "none",
                          background: "transparent",
                          color: COLORS.textLight,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label={`Ver detalle de ${sanitizeText(usuario.nombre)}`}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="action-btn"
                        title="Editar"
                        onClick={() => openEdit(conductor)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          border: "none",
                          background: "transparent",
                          color: COLORS.textLight,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label={`Editar ${sanitizeText(usuario.nombre)}`}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="action-btn"
                        title="Eliminar"
                        onClick={() => openConfirm(conductor)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          border: "none",
                          background: "transparent",
                          color: "#EF4444",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label={`Eliminar ${sanitizeText(usuario.nombre)}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={780}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div
            style={{
              padding: "1.4rem 1.8rem 1.2rem",
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "rgba(57,169,0,.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkles size={18} color={COLORS.primary} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: COLORS.primary,
                    textTransform: "uppercase",
                  }}
                >
                  Registro de conductor
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: COLORS.text, lineHeight: 1 }}>
                  {isEdit ? "Editar Conductor" : "Nuevo Conductor"}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                border: `1px solid ${COLORS.border}`,
                background: "#fff",
                cursor: "pointer",
                color: COLORS.textLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label="Cerrar formulario"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <section
              style={{
                borderRadius: 14,
                border: `1px solid ${COLORS.border}`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  background: COLORS.bg,
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    color: COLORS.textLight,
                    textTransform: "uppercase",
                  }}
                >
                  Datos del conductor
                </p>
              </div>
              <div style={{ padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: 12 }}>
                <Field label="Usuario vinculado *">
                  <select
                    value={formData.usuarioId}
                    onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                    style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
                    required
                  >
                    <option value="">Seleccionar usuario...</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} — {u.identificacion}
                      </option>
                    ))}
                  </select>
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: isEdit ? "1fr 1fr" : "1fr", gap: 10 }}>
                  <Field label="Tipo de conductor">
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["aprendiz", "instructor"] as const).map((tipo) => {
                        const isSelected = formData.tipoConductor === tipo;
                        return (
                          <button
                            key={tipo}
                            type="button"
                            onClick={() => setFormData({ ...formData, tipoConductor: tipo })}
                            style={{
                              flex: 1,
                              padding: "10px",
                              borderRadius: 11,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              border: isSelected ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                              background: isSelected ? "rgba(57,169,0,.1)" : COLORS.bg,
                              color: isSelected ? COLORS.primaryDark : COLORS.textLight,
                              textTransform: "capitalize",
                            }}
                          >
                            {tipo}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  {isEdit && (
                    <Field label="Estado">
                      <div style={{ display: "flex", gap: 8 }}>
                        {(["activo", "inactivo"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setFormData({ ...formData, estado: s })}
                            style={{
                              flex: 1,
                              padding: "11px 10px",
                              borderRadius: 11,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              border: formData.estado === s ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                              background:
                                formData.estado === s
                                  ? s === "activo"
                                    ? "rgba(57,169,0,.1)"
                                    : "rgba(239,68,68,.08)"
                                  : COLORS.bg,
                              color:
                                formData.estado === s
                                  ? s === "activo"
                                    ? COLORS.primaryDark
                                    : "#B91C1C"
                                  : COLORS.textLight,
                            }}
                          >
                            {s === "activo" ? "✓ Activo" : "✗ Inactivo"}
                          </button>
                        ))}
                      </div>
                    </Field>
                  )}
                </div>

                <Field label="Centro de formación *">
                  <input
                    type="text"
                    placeholder="ej. Centro de Tecnología"
                    value={formData.centroFormacion}
                    onChange={(e) => setFormData({ ...formData, centroFormacion: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </Field>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderRadius: 11,
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>
                      ¿Tiene alguna discapacidad?
                    </p>
                    <p style={{ fontSize: 10, color: COLORS.textLight }}>
                      Activa para registrar el tipo
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, discapacidad: !formData.discapacidad })}
                    style={{
                      width: 40,
                      height: 22,
                      borderRadius: 999,
                      background: formData.discapacidad ? COLORS.primary : "#CBD5E1",
                      border: "none",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background .2s",
                    }}
                    aria-label={formData.discapacidad ? "Desactivar discapacidad" : "Activar discapacidad"}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: 2,
                        left: formData.discapacidad ? 20 : 2,
                        transition: "left .2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                      }}
                    />
                  </button>
                </div>

                {formData.discapacidad && (
                  <Field label="Tipo de discapacidad">
                    <input
                      type="text"
                      placeholder="ej. Visual, Motriz, Auditiva…"
                      value={formData.tipoDiscapacidad}
                      onChange={(e) => setFormData({ ...formData, tipoDiscapacidad: e.target.value })}
                      style={inputStyle}
                    />
                  </Field>
                )}
              </div>
            </section>

            <section
              style={{
                borderRadius: 14,
                border: `1px solid ${COLORS.border}`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  background: COLORS.bg,
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1.5,
                    color: COLORS.textLight,
                    textTransform: "uppercase",
                  }}
                >
                  Vehículo asociado
                </p>
              </div>
              <div style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Placa">
                  <input
                    type="text"
                    placeholder="ABC-123"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                    style={{ ...inputStyle, textTransform: "uppercase" }}
                  />
                </Field>

                <Field label="Tipo de vehículo">
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["carro", "moto"] as const).map((tipo) => (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoVehiculo: tipo })}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: 11,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          border: formData.tipoVehiculo === tipo ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                          background: formData.tipoVehiculo === tipo ? "rgba(57,169,0,.1)" : COLORS.bg,
                          color: formData.tipoVehiculo === tipo ? COLORS.primaryDark : COLORS.textLight,
                        }}
                      >
                        {tipo === "carro" ? "🚗 Carro" : "🏍️ Moto"}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label="Marca">
                  <input
                    type="text"
                    placeholder="ej. Chevrolet"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Modelo">
                  <input
                    type="text"
                    placeholder="ej. Spark"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Año">
                  <input
                    type="number"
                    value={formData.año}
                    onChange={(e) => setFormData({ ...formData, año: Number(e.target.value) })}
                    style={inputStyle}
                    min={1900}
                    max={new Date().getFullYear() + 1}
                  />
                </Field>

                <Field label="Color">
                  <input
                    type="text"
                    placeholder="ej. Rojo"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={inputStyle}
                  />
                </Field>

                <Field label="Descripción adicional" style={{ gridColumn: "1 / -1" }}>
                  <textarea
                    rows={2}
                    placeholder="Observaciones sobre el vehículo…"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    style={{ ...inputStyle, resize: "none" }}
                  />
                </Field>
              </div>
            </section>
          </div>

          <div
            style={{
              padding: "1rem 1.8rem",
              borderTop: `1px solid ${COLORS.border}`,
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              style={{
                padding: "11px 20px",
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                background: "#fff",
                color: COLORS.text,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: "11px 24px",
                borderRadius: 12,
                border: "none",
                background: COLORS.primary,
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 6px 18px rgba(57,169,0,.22)",
              }}
            >
              {isEdit ? "Guardar cambios" : "Crear Conductor"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} maxWidth={450}>
        {viewingConductor &&
          (() => {
            const c = viewingConductor;
            const usuario = getUsuario(c.usuarioId);
            const vehs = getVehiculosConductor(c.id);
            if (!usuario) return null;

            const [g1, g2] = getAvatarGradient(usuario.nombre);
            const initials = getInitials(usuario.nombre);
            const tipoStyle = getTipoStyle(c.tipoConductor);
            const TipoIcon = tipoStyle.icon;
            const activo = c.estado === "activo";

            return (
              <div>
                <div
                  style={{
                    padding: "1.6rem 1.8rem 1.4rem",
                    background: `linear-gradient(135deg, ${g1}, ${g2})`,
                    color: "#fff",
                    borderRadius: "24px 24px 0 0",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: 200,
                      height: 200,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,.07)",
                      top: -80,
                      right: -60,
                    }}
                  />
                  <div style={{ position: "relative", zIndex: 2 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          background: "rgba(255,255,255,.18)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          fontWeight: 900,
                        }}
                      >
                        {initials}
                      </div>
                      <button
                        onClick={() => setViewOpen(false)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: "rgba(255,255,255,.15)",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label="Cerrar vista"
                      >
                        <X size={15} />
                      </button>
                    </div>
                    <h2 style={{ marginTop: 14, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
                      {sanitizeText(usuario.nombre)}
                    </h2>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 4 }}>
                      {usuario.tipoDocumento} · {usuario.identificacion}
                    </p>
                    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 800,
                          background: "rgba(255,255,255,.18)",
                          border: "1px solid rgba(255,255,255,.25)",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <TipoIcon size={10} /> {tipoStyle.label}
                      </span>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 800,
                          background: "rgba(255,255,255,.18)",
                          border: "1px solid rgba(255,255,255,.25)",
                        }}
                      >
                        {c.estado}
                      </span>
                      {c.discapacidad && (
                        <span
                          style={{
                            padding: "4px 12px",
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 800,
                            background: "rgba(255,255,255,.18)",
                            border: "1px solid rgba(255,255,255,.25)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Accessibility size={10} /> Discapacidad
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px",
                      borderRadius: 12,
                      background: "#F8FAFC",
                      border: `1px solid ${COLORS.border}`,
                    }}
                  >
                    <Building2 size={16} color={COLORS.textLight} />
                    <span style={{ fontSize: 13, color: COLORS.text }}>
                      {sanitizeText(c.centroFormacion) || "—"}
                    </span>
                  </div>

                  {c.discapacidad && c.tipoDiscapacidad && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px",
                        borderRadius: 12,
                        background: "#F3E8FF",
                        border: `1px solid #E9D5FF`,
                      }}
                    >
                      <Accessibility size={16} color="#9333EA" />
                      <span style={{ fontSize: 13, color: "#9333EA" }}>
                        {sanitizeText(c.tipoDiscapacidad)}
                      </span>
                    </div>
                  )}

                  {vehs.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontSize: 9,
                          fontWeight: 800,
                          letterSpacing: 1,
                          color: COLORS.textLight,
                          textTransform: "uppercase",
                          marginBottom: 8,
                        }}
                      >
                        Vehículos registrados
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {vehs.map((v) => (
                          <div
                            key={v.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              borderRadius: 12,
                              background: "#F8FAFC",
                              border: `1px solid ${COLORS.border}`,
                            }}
                          >
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: `${g1}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {v.tipo === "moto" ? (
                                <Bike size={16} color={g1} />
                              ) : (
                                <Car size={16} color={g1} />
                              )}
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>
                                {v.placa}
                              </p>
                              <p style={{ fontSize: 10, color: COLORS.textLight }}>
                                {v.marca} {v.modelo} · {v.color}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => openEdit(c)}
                    style={{
                      width: "100%",
                      padding: "13px 20px",
                      borderRadius: 12,
                      border: "none",
                      background: g1,
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: `0 6px 18px ${g1}33`,
                    }}
                  >
                    <Pencil size={14} />
                    Editar conductor
                  </button>
                </div>
              </div>
            );
          })()}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingConductor(null);
        }}
        title="Eliminar Conductor"
        message={`¿Estás seguro de eliminar al conductor "${deletingConductor ? sanitizeText(getUsuario(deletingConductor.usuarioId)?.nombre || '') : ''}"? Esta acción eliminará también todos sus vehículos asociados.`}
      />
    </>
  );
}