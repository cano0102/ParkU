import React, { useMemo, useState, useEffect, useCallback, memo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
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
  GaugeCircle,
  Palette,
  Calendar,
  LayoutGrid,
  List,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { useData, Conductor, Vehiculo } from "../context/DataContext";

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  text: "#0F172A",
  textLight: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  bg: "#F5F7F8",
  white: "#FFFFFF",
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

const getTipoVehiculoStyle = (tipo: "carro" | "moto") => {
  if (tipo === "carro") {
    return {
      bg: "#EFF6FF",
      text: "#2563EB",
      border: "#BFDBFE",
      dot: "#3B82F6",
      label: "Carro",
      icon: Car,
    };
  }
  return {
    bg: "#FFFBEB",
    text: "#D97706",
    border: "#FDE68A",
    dot: "#F59E0B",
    label: "Moto",
    icon: Bike,
  };
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
  style?: React.CSSProperties;
}

const Field = memo(({ label, children, hint, style }: FieldProps) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, ...style }}>
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
  descripcionVehiculo: string;
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
  descripcionVehiculo: "",
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

// Sub-componente para vista de vehículo
interface VehiculoViewProps {
  vehiculo: Vehiculo;
  onEdit: () => void;
  onClose: () => void;
}

const VehiculoView = memo(({ vehiculo, onEdit, onClose }: VehiculoViewProps) => {
  const tipoStyle = getTipoVehiculoStyle(vehiculo.tipo);
  const TipoIcon = tipoStyle.icon;

  return (
    <div>
      <div
        style={{
          padding: "1.6rem 1.8rem 1.4rem",
          background: `linear-gradient(135deg, ${tipoStyle.dot}, ${tipoStyle.dot}cc)`,
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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "rgba(255,255,255,.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TipoIcon size={24} />
            </div>
            <button
              onClick={onClose}
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
          <h2 style={{ marginTop: 14, fontSize: 24, fontWeight: 900, lineHeight: 1, letterSpacing: 0.5 }}>
            {sanitizeText(vehiculo.placa)}
          </h2>
          <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
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
              {tipoStyle.label}
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
              {vehiculo.estado}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: "1.4rem 1.8rem" }}>
        {[
          { label: "Marca", value: vehiculo.marca, icon: GaugeCircle },
          { label: "Modelo", value: vehiculo.modelo, icon: GaugeCircle },
          { label: "Color", value: vehiculo.color, icon: Palette },
          { label: "Año", value: vehiculo.año, icon: Calendar },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: "#F8FAFC",
              border: `1px solid ${COLORS.border}`,
              marginBottom: 8,
            }}
          >
            <item.icon size={14} color={COLORS.textLight} />
            <div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: COLORS.textLight,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                {sanitizeText(String(item.value))}
              </div>
            </div>
          </div>
        ))}

        {vehiculo.descripcion && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              background: "#F8FAFC",
              border: `1px solid ${COLORS.border}`,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: COLORS.textLight,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              Descripción
            </div>
            <div style={{ fontSize: 12, color: COLORS.text, lineHeight: 1.4 }}>
              {sanitizeText(vehiculo.descripcion)}
            </div>
          </div>
        )}

        <button
          onClick={onEdit}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "12px 20px",
            borderRadius: 12,
            border: "none",
            background: tipoStyle.dot,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: `0 6px 18px ${tipoStyle.dot}33`,
          }}
        >
          <Pencil size={14} />
          Editar vehículo
        </button>
      </div>
    </div>
  );
});

VehiculoView.displayName = "VehiculoView";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewVehiculoOpen, setViewVehiculoOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null);
  const [viewingVehiculo, setViewingVehiculo] = useState<Vehiculo | null>(null);
  const [deletingConductor, setDeletingConductor] = useState<Conductor | null>(null);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [filterVehiculoTipo, setFilterVehiculoTipo] = useState("todos");
  const [formData, setFormData] = useState<FormState>(emptyForm());

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setViewMode(mode);
    setItemsPerPage(mode === "list" ? 15 : 9);
    setCurrentPage(1);
  }, []);

  const getUsuario = useCallback((id: string) => usuarios.find((u) => u.id === id), [usuarios]);
  const getVehiculosConductor = useCallback((id: string) => vehiculos.filter((v) => v.conductorId === id), [vehiculos]);

  const totalActivos = useMemo(() => conductores.filter((c) => c.estado === "activo").length, [conductores]);
  const totalInstructores = useMemo(() => conductores.filter((c) => c.tipoConductor === "instructor").length, [conductores]);
  const totalAprendices = useMemo(() => conductores.filter((c) => c.tipoConductor === "aprendiz").length, [conductores]);
  const totalVehiculos = useMemo(() => vehiculos.length, [vehiculos]);
  const totalConductores = useMemo(() => conductores.length, [conductores]);
  const totalCarros = useMemo(() => vehiculos.filter((v) => v.tipo === "carro").length, [vehiculos]);
  const totalMotos = useMemo(() => vehiculos.filter((v) => v.tipo === "moto").length, [vehiculos]);

  const filteredConductores = useMemo(
    () =>
      conductores.filter((conductor) => {
        const usuario = getUsuario(conductor.usuarioId);
        if (!usuario) return false;
        const q = search.toLowerCase();
        const vehiculosCond = getVehiculosConductor(conductor.id);
        const matchVehiculoTipo = filterVehiculoTipo === "todos"
          ? true
          : vehiculosCond.some((v) => v.tipo === filterVehiculoTipo);
        const matchesSearch =
          conductor.nombre.toLowerCase().includes(q) ||
          conductor.email.toLowerCase().includes(q) ||
          conductor.centroFormacion.toLowerCase().includes(q) ||
          vehiculosCond.some((v) =>
            v.placa.toLowerCase().includes(q) ||
            v.marca.toLowerCase().includes(q) ||
            v.modelo.toLowerCase().includes(q)
          );
        const matchesTipo = filterTipo === "todos" ? true : conductor.tipoConductor === filterTipo;
        const matchesEstado = filterEstado === "todos" ? true : conductor.estado === filterEstado;
        return matchesSearch && matchesTipo && matchesEstado && matchVehiculoTipo;
      }),
    [conductores, search, filterTipo, filterEstado, filterVehiculoTipo, getUsuario, getVehiculosConductor]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterTipo, filterEstado, filterVehiculoTipo]);

  const totalPages = Math.max(1, Math.ceil(filteredConductores.length / itemsPerPage));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedConductores = useMemo(
    () => filteredConductores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredConductores, currentPage, itemsPerPage]
  );

  const pageNumbers = useMemo(() => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
      (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
    );
    return pages.reduce<(number | "ellipsis")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("ellipsis");
      acc.push(p);
      return acc;
    }, []);
  }, [totalPages, currentPage]);

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
        descripcionVehiculo: v?.descripcion || "",
      });
      setDialogOpen(true);
    },
    [vehiculos]
  );

  const openVehiculoView = useCallback((vehiculo: Vehiculo) => {
    setViewingVehiculo(vehiculo);
    setViewVehiculoOpen(true);
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

    const usuarioSeleccionado = usuarios.find((u) => u.id === formData.usuarioId);
    if (!usuarioSeleccionado) {
      toast.error("El usuario seleccionado no es válido");
      return;
    }

    const conductorData = {
      usuarioId: formData.usuarioId,
      nombre: usuarioSeleccionado.nombre,
      email: usuarioSeleccionado.correo,
      tipoConductor: formData.tipoConductor,
      centroFormacion: sanitizeText(formData.centroFormacion.trim()),
      discapacidad: formData.discapacidad,
      tipoDiscapacidad: sanitizeText(formData.tipoDiscapacidad.trim()),
      estado: formData.estado,
      tipo: editingConductor?.tipo || "docente",
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
            descripcion: sanitizeText(formData.descripcionVehiculo.trim()),
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
            descripcion: sanitizeText(formData.descripcionVehiculo.trim()),
            estado: "activo",
            parqueaderoId: "",
            celdaId: "",
            fechaEntrada: new Date().toISOString(),
          });
        }
        toast.success("Conductor actualizado correctamente");
      } else {
        const newId = addConductor(conductorData);
        if (newId && formData.placa.trim()) {
          addVehiculo({
            conductorId: newId,
            placa: formData.placa.toUpperCase().trim(),
            tipo: formData.tipoVehiculo,
            marca: sanitizeText(formData.marca.trim()),
            modelo: sanitizeText(formData.modelo.trim()),
            año: formData.año,
            color: sanitizeText(formData.color.trim()),
            descripcion: sanitizeText(formData.descripcionVehiculo.trim()),
            estado: "activo",
            parqueaderoId: "",
            celdaId: "",
            fechaEntrada: new Date().toISOString(),
          });
        }
        toast.success("Conductor creado correctamente");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Error al guardar el conductor");
      console.error("Error saving conductor:", error);
    }
  }, [formData, editingConductor, usuarios, vehiculos, addConductor, updateConductor, addVehiculo, updateVehiculo]);

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

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterTipo("todos");
    setFilterEstado("todos");
    setFilterVehiculoTipo("todos");
  }, []);

  const activeFiltersCount = useMemo(
    () =>
      [
        search,
        filterTipo !== "todos" ? filterTipo : "",
        filterEstado !== "todos" ? filterEstado : "",
        filterVehiculoTipo !== "todos" ? filterVehiculoTipo : "",
      ].filter(Boolean).length,
    [search, filterTipo, filterEstado, filterVehiculoTipo]
  );

  const isEdit = !!editingConductor;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap');
        .conductores-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .conductores-root .mono{ font-family:'JetBrains Mono','Montserrat',monospace; }

        .conductor-card{
          --accent: ${COLORS.primary};
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease;
          border: 1px solid ${COLORS.border};
          border-radius: 18px;
          background: #fff;
          overflow: hidden;
          position: relative;
          box-shadow: 0 1px 2px rgba(15,23,42,.04);
          display: flex;
          flex-direction: column;
        }
        .conductor-card:hover{
          transform: translateY(-3px);
          box-shadow: 0 16px 36px rgba(15,23,42,.10);
          border-color: color-mix(in srgb, var(--accent) 45%, ${COLORS.border});
        }
        .conductor-card.is-inactive{
          --accent: #94A3B8;
        }
        .conductor-card.is-inactive .card-top{
          opacity: .82;
        }

        .conductor-card .status-rail{
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 4px;
          background: var(--accent);
        }

        .card-top{
          padding: 18px 18px 14px 22px;
          display: flex;
          gap: 12px;
        }

        .card-avatar{
          width: 46px;
          height: 46px;
          border-radius: 13px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 900;
          font-size: 15px;
          letter-spacing: 0.3px;
          box-shadow: 0 4px 10px -3px rgba(0,0,0,.25);
        }

        .card-identity{
          flex: 1;
          min-width: 0;
        }
        .card-name{
          font-size: 14.5px;
          font-weight: 800;
          color: ${COLORS.text};
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-doc{
          font-size: 10.5px;
          color: ${COLORS.textLight};
          margin-top: 2px;
          font-weight: 600;
        }

        .card-switch{
          width: 34px;
          height: 19px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          transition: background .25s ease;
        }
        .card-switch .knob{
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #fff;
          position: absolute;
          top: 2px;
          transition: left .25s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,.3);
        }

        .card-tags{
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          padding: 0 18px 0 22px;
          margin-top: -2px;
        }
        .card-tag{
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 9.5px;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .plate-block{
          margin: 12px 18px 0 22px;
          border-radius: 12px;
          border: 1.5px dashed ${COLORS.border};
          padding: 9px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: border-color .2s ease, background .2s ease;
        }
        .plate-block.has-plate{
          border-style: solid;
          border-color: color-mix(in srgb, var(--accent) 35%, ${COLORS.border});
          background: color-mix(in srgb, var(--accent) 6%, white);
        }
        .plate-chip{
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 1px;
          color: ${COLORS.text};
          background: #fff;
          border: 1px solid ${COLORS.border};
          border-radius: 7px;
          padding: 4px 9px;
          flex-shrink: 0;
        }
        .plate-meta{
          flex: 1;
          min-width: 0;
          font-size: 10.5px;
          color: ${COLORS.textLight};
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .plate-empty{
          font-size: 11px;
          color: ${COLORS.textMuted};
          font-weight: 600;
          font-style: italic;
        }

        .plate-list{
          margin: 12px 18px 0 22px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .plate-row{
          border-radius: 10px;
          border: 1.5px solid color-mix(in srgb, var(--accent) 30%, ${COLORS.border});
          background: color-mix(in srgb, var(--accent) 5%, white);
          padding: 7px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease, transform .2s ease;
        }
        .plate-row:hover{
          background: color-mix(in srgb, var(--accent) 10%, white);
          border-color: var(--accent);
          transform: translateX(2px);
        }
        .plate-row .plate-chip{
          font-size: 12px;
          padding: 3px 8px;
        }
        .plate-row .plate-meta{
          font-size: 10px;
        }

        .card-center{
          display: flex;
          align-items: center;
          gap: 7px;
          margin: 10px 18px 0 22px;
          font-size: 11px;
          color: ${COLORS.textLight};
        }
        .card-center svg{ flex-shrink: 0; }
        .card-center span{
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .card-footer{
          margin-top: auto;
          border-top: 1px solid ${COLORS.border};
          padding: 9px 14px 9px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: ${COLORS.bg};
        }

        .action-btn{
          transition: all 0.15s ease;
          border-radius: 8px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          color: ${COLORS.textLight};
        }
        .action-btn:hover{
          background: #fff !important;
          color: ${COLORS.text} !important;
          box-shadow: 0 1px 3px rgba(15,23,42,.15);
        }
        .action-btn.danger:hover {
          background: #FEE2E2 !important;
          color: #DC2626 !important;
        }

        input:focus,textarea:focus,select:focus{
          outline:none;
          border-color:${COLORS.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }

        .vehiculo-card {
          transition: all 0.2s ease;
          border-radius: 10px;
          border: 1px solid ${COLORS.border};
          background: #F8FAFC;
          padding: 10px 12px;
          cursor: pointer;
        }
        .vehiculo-card:hover {
          border-color: ${COLORS.primary};
          background: #F0FDF4;
          transform: translateX(4px);
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .status-badge.active {
          background: #DCFCE7;
          color: #166534;
        }
        .status-badge.inactive {
          background: #FEE2E2;
          color: #991B1B;
        }
        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 10px;
          background: ${COLORS.bg};
          border: 1px solid ${COLORS.border};
          transition: all 0.2s ease;
        }
        .info-row:hover {
          border-color: ${COLORS.primary}40;
          background: #F8FAFC;
        }
        .conductores-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 14px;
        }
        @media (max-width: 640px) {
          .conductores-grid {
            grid-template-columns: 1fr;
          }
        }

        .view-toggle {
          display: flex;
          gap: 2px;
          padding: 3px;
          border-radius: 11px;
          border: 1px solid ${COLORS.border};
          background: ${COLORS.bg};
        }
        .view-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          background: transparent;
          color: ${COLORS.textLight};
        }
        .view-toggle-btn.active {
          background: #fff;
          color: ${COLORS.primaryDark};
          box-shadow: 0 1px 4px rgba(15,23,42,.1);
        }

        .conductores-list {
          border-radius: 16px;
          border: 1px solid ${COLORS.border};
          background: #fff;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(15,23,42,.05);
        }
        .list-header {
          display: grid;
          grid-template-columns: minmax(200px,1.6fr) minmax(140px,1fr) 150px 120px 110px 100px;
          gap: 10px;
          padding: 10px 14px;
          background: ${COLORS.bg};
          border-bottom: 1px solid ${COLORS.border};
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: ${COLORS.textLight};
        }
        .list-row {
          display: grid;
          grid-template-columns: minmax(200px,1.6fr) minmax(140px,1fr) 150px 120px 110px 100px;
          gap: 10px;
          align-items: center;
          padding: 10px 14px;
          border-bottom: 1px solid ${COLORS.border};
          font-size: 12px;
          transition: background .15s ease;
        }
        .list-row:last-child { border-bottom: none; }
        .list-row:hover { background: #F8FAFC; }
        .list-plate-chip {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: ${COLORS.text};
          background: #F8FAFC;
          border: 1px solid ${COLORS.border};
          border-radius: 6px;
          padding: 2px 7px;
          display: inline-block;
        }

        .page-btn {
          transition: background .15s, border-color .15s, color .15s;
        }
        .page-btn:not(:disabled):hover {
          border-color: ${COLORS.primary};
          color: ${COLORS.primaryDark};
        }

        @media (max-width: 780px) {
          .view-toggle-label { display: none; }
          .list-header { display: none; }
          .list-row {
            grid-template-columns: 1fr !important;
            grid-auto-flow: row;
            gap: 6px !important;
          }
        }
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
                <ShieldCheck size={11} /> Gestión integral
              </div>
              <h1
                style={{
                  fontSize: "clamp(1.6rem,3vw,2.2rem)",
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                Conductores y Vehículos
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
                { label: "Conductores", value: totalConductores, icon: Users },
                { label: "Activos", value: totalActivos, icon: UserCheck },
                { label: "Vehículos", value: totalVehiculos, icon: Car },
                { label: "Carros/Motos", value: `${totalCarros}/${totalMotos}`, icon: Bike },
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
            <input
              placeholder="Buscar conductor, vehículo, identificación..."
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
            value={filterVehiculoTipo}
            onChange={(e) => setFilterVehiculoTipo(e.target.value)}
            style={{
              ...inputStyle,
              width: "auto",
              appearance: "none",
              paddingRight: 28,
              cursor: "pointer",
            }}
            aria-label="Filtrar por tipo de vehículo"
          >
            <option value="todos">Todos los vehículos</option>
            <option value="carro">Con Carro</option>
            <option value="moto">Con Moto</option>
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

          <div className="view-toggle" role="group" aria-label="Modo de visualización">
            {(
              [
                { mode: "grid" as const, icon: <LayoutGrid size={14} />, label: "Cuadrícula" },
                { mode: "list" as const, icon: <List size={14} />, label: "Lista" },
              ]
            ).map((v) => (
              <button
                key={v.mode}
                type="button"
                onClick={() => handleViewModeChange(v.mode)}
                title={v.label}
                aria-label={v.label}
                aria-pressed={viewMode === v.mode}
                className={`view-toggle-btn${viewMode === v.mode ? " active" : ""}`}
              >
                {v.icon}
                <span className="view-toggle-label">{v.label}</span>
              </button>
            ))}
          </div>

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
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(57,169,0,.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(57,169,0,.25)";
            }}
          >
            <Plus size={15} /> Nuevo Conductor
          </button>
        </div>

        {activeFiltersCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 11, color: COLORS.textLight }}>
              Mostrando <strong>{filteredConductores.length}</strong> resultado
              {filteredConductores.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={clearFilters}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.primary,
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <X size={12} /> Limpiar filtros
            </button>
          </div>
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
          <>
            {viewMode === "grid" ? (
              <div className="conductores-grid">
                {paginatedConductores.map((conductor) => {
                  const usuario = getUsuario(conductor.usuarioId);
                  const vehiculosCond = getVehiculosConductor(conductor.id);
                  if (!usuario) return null;

                  const [g1, g2] = getAvatarGradient(conductor.nombre);
                  const initials = getInitials(conductor.nombre);
                  const tipoStyle = getTipoStyle(conductor.tipoConductor);
                  const activo = conductor.estado === "activo";
                  const TipoIcon = tipoStyle.icon;
                  const vehiculoPrincipal = vehiculosCond[0];
                  const vTipoStyle = vehiculoPrincipal ? getTipoVehiculoStyle(vehiculoPrincipal.tipo) : null;

                  return (
                    <div
                      key={conductor.id}
                      className={`conductor-card${activo ? "" : " is-inactive"}`}
                    >
                      <div className="status-rail" style={{ background: activo ? COLORS.primary : "#CBD5E1" }} />

                      <div className="card-top">
                        <div
                          className="card-avatar"
                          style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                        >
                          {initials}
                        </div>

                        <div className="card-identity">
                          <p className="card-name">{sanitizeText(conductor.nombre)}</p>
                          <p className="card-doc">
                            {usuario.tipoDocumento} · {usuario.identificacion}
                          </p>
                        </div>

                        <button
                          className="card-switch"
                          onClick={() => handleToggleEstado(conductor.id, conductor.estado)}
                          style={{ background: activo ? COLORS.primary : "#CBD5E1" }}
                          aria-label={activo ? "Desactivar conductor" : "Activar conductor"}
                        >
                          <div className="knob" style={{ left: activo ? 17 : 2 }} />
                        </button>
                      </div>

                      <div className="card-tags">
                        <span
                          className="card-tag"
                          style={{ background: tipoStyle.bg, color: tipoStyle.text }}
                        >
                          <TipoIcon size={10} />
                          {tipoStyle.label}
                        </span>
                        <span className={`status-badge ${activo ? "active" : "inactive"}`}>
                          {conductor.estado}
                        </span>
                        {conductor.discapacidad && (
                          <span
                            className="card-tag"
                            style={{ background: "#F3E8FF", color: "#9333EA" }}
                          >
                            <Accessibility size={10} />
                            Discapacidad
                          </span>
                        )}
                      </div>

                      {vehiculosCond.length === 0 ? (
                        <div className="plate-block">
                          <Car size={15} color={COLORS.textMuted} style={{ flexShrink: 0 }} />
                          <span className="plate-empty">Sin vehículo asignado</span>
                        </div>
                      ) : vehiculosCond.length === 1 && vehiculoPrincipal && vTipoStyle ? (
                        <div
                          className="plate-block has-plate"
                          onClick={() => openVehiculoView(vehiculoPrincipal)}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="plate-chip">{vehiculoPrincipal.placa}</span>
                          <span className="plate-meta">
                            {vehiculoPrincipal.marca} {vehiculoPrincipal.modelo}
                          </span>
                          <vTipoStyle.icon size={15} color={vTipoStyle.dot} style={{ flexShrink: 0 }} />
                        </div>
                      ) : (
                        <div className="plate-list">
                          {vehiculosCond.map((v) => {
                            const vStyle = getTipoVehiculoStyle(v.tipo);
                            const VIcon = vStyle.icon;
                            return (
                              <div
                                key={v.id}
                                className="plate-row"
                                onClick={() => openVehiculoView(v)}
                              >
                                <span className="plate-chip">{v.placa}</span>
                                <span className="plate-meta">
                                  {v.marca} {v.modelo}
                                </span>
                                <VIcon size={13} color={vStyle.dot} style={{ flexShrink: 0 }} />
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="card-center">
                        <Building2 size={12} color={COLORS.textLight} />
                        <span>{sanitizeText(conductor.centroFormacion) || "—"}</span>
                      </div>

                      <div className="card-footer">
                        <span style={{ fontSize: 10, color: COLORS.textLight, fontWeight: 700 }}>
                          {vehiculosCond.length} vehículo{vehiculosCond.length !== 1 ? "s" : ""}
                        </span>
                        <div style={{ display: "flex", gap: 2 }}>
                          <button
                            className="action-btn"
                            title="Editar"
                            onClick={() => openEdit(conductor)}
                            aria-label={`Editar ${sanitizeText(conductor.nombre)}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="action-btn danger"
                            title="Eliminar"
                            onClick={() => openConfirm(conductor)}
                            aria-label={`Eliminar ${sanitizeText(conductor.nombre)}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="conductores-list">
                <div className="list-header">
                  <span>Conductor</span>
                  <span>Centro de formación</span>
                  <span>Vehículo(s)</span>
                  <span>Tipo</span>
                  <span>Estado</span>
                  <span style={{ textAlign: "right" }}>Acciones</span>
                </div>

                {paginatedConductores.map((conductor) => {
                  const usuario = getUsuario(conductor.usuarioId);
                  const vehiculosCond = getVehiculosConductor(conductor.id);
                  if (!usuario) return null;

                  const [g1, g2] = getAvatarGradient(conductor.nombre);
                  const initials = getInitials(conductor.nombre);
                  const tipoStyle = getTipoStyle(conductor.tipoConductor);
                  const activo = conductor.estado === "activo";
                  const TipoIcon = tipoStyle.icon;

                  return (
                    <div key={conductor.id} className="list-row">
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            flexShrink: 0,
                            background: `linear-gradient(135deg,${g1},${g2})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 900,
                            color: "#fff",
                          }}
                        >
                          {initials}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              fontWeight: 800,
                              color: COLORS.text,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {sanitizeText(conductor.nombre)}
                          </p>
                          <p style={{ fontSize: 10, color: COLORS.textLight, marginTop: 1 }}>
                            {usuario.tipoDocumento} · {usuario.identificacion}
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          color: COLORS.textLight,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={conductor.centroFormacion}
                      >
                        <Building2 size={11} style={{ flexShrink: 0 }} />
                        {sanitizeText(conductor.centroFormacion) || "—"}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {vehiculosCond.length === 0 ? (
                          <span style={{ fontSize: 11, color: COLORS.textMuted, fontStyle: "italic" }}>
                            Sin vehículo
                          </span>
                        ) : (
                          vehiculosCond.slice(0, 2).map((v) => (
                            <span
                              key={v.id}
                              className="list-plate-chip"
                              style={{ cursor: "pointer", width: "fit-content" }}
                              onClick={() => openVehiculoView(v)}
                            >
                              {v.placa}
                            </span>
                          ))
                        )}
                        {vehiculosCond.length > 2 && (
                          <span style={{ fontSize: 10, color: COLORS.textLight }}>
                            +{vehiculosCond.length - 2} más
                          </span>
                        )}
                      </div>

                      <div>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 9px",
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 700,
                            background: tipoStyle.bg,
                            color: tipoStyle.text,
                            border: `1px solid ${tipoStyle.border}`,
                            whiteSpace: "nowrap",
                          }}
                        >
                          <TipoIcon size={9} /> {tipoStyle.label}
                        </span>
                      </div>

                      <div>
                        <button
                          onClick={() => handleToggleEstado(conductor.id, conductor.estado)}
                          title={activo ? "Desactivar" : "Activar"}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 9px",
                            borderRadius: 999,
                            border: "none",
                            cursor: "pointer",
                            fontSize: 10,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: 0.3,
                            background: activo ? "rgba(57,169,0,.1)" : "rgba(239,68,68,.08)",
                            color: activo ? "#166534" : "#B91C1C",
                            fontFamily: "inherit",
                          }}
                          aria-label={activo ? "Desactivar conductor" : "Activar conductor"}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: activo ? COLORS.primary : "#EF4444",
                            }}
                          />
                          {conductor.estado}
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                        <button
                          title="Editar"
                          onClick={() => openEdit(conductor)}
                          className="action-btn"
                          style={{
                            width: 26,
                            height: 26,
                            border: `1px solid ${COLORS.border}`,
                            background: COLORS.bg,
                          }}
                          aria-label="Editar"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          title="Eliminar"
                          onClick={() => openConfirm(conductor)}
                          className="action-btn danger"
                          style={{
                            width: 26,
                            height: 26,
                            border: `1px solid ${COLORS.border}`,
                            background: "#FEF2F2",
                            color: "#EF4444",
                          }}
                          aria-label="Eliminar"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: COLORS.textLight }}>
                <span>
                  Mostrando{" "}
                  <strong style={{ color: COLORS.text }}>
                    {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredConductores.length)}
                  </strong>{" "}
                  de <strong style={{ color: COLORS.text }}>{filteredConductores.length}</strong>
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    ...inputStyle,
                    width: "auto",
                    padding: "6px 10px",
                    fontSize: 11,
                    appearance: "none",
                    cursor: "pointer",
                  }}
                  aria-label="Conductores por página"
                >
                  {(viewMode === "list" ? [15, 25, 50, 100] : [9, 18, 36, 60]).map((n) => (
                    <option key={n} value={n}>
                      {n} por página
                    </option>
                  ))}
                </select>
              </div>

              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.border}`,
                      background: "#fff",
                      color: currentPage === 1 ? COLORS.border : COLORS.text,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    ← Anterior
                  </button>

                  {pageNumbers.map((p, i) =>
                    p === "ellipsis" ? (
                      <span key={`e-${i}`} style={{ padding: "0 4px", color: COLORS.textLight, fontSize: 11 }}>
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className="page-btn"
                        onClick={() => setCurrentPage(p)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          border: p === currentPage ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                          background: p === currentPage ? COLORS.primary : "#fff",
                          color: p === currentPage ? "#fff" : COLORS.text,
                          fontSize: 11,
                          fontWeight: 800,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 8,
                      border: `1px solid ${COLORS.border}`,
                      background: "#fff",
                      color: currentPage === totalPages ? COLORS.border : COLORS.text,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal de formulario de conductor con vehículo */}
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
                  Registro integral
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
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textLight }}>Inactivo</span>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              estado: formData.estado === "activo" ? "inactivo" : "activo",
                            })
                          }
                          style={{
                            width: 44,
                            height: 24,
                            borderRadius: 999,
                            background: formData.estado === "activo" ? COLORS.primary : "#CBD5E1",
                            border: "none",
                            cursor: "pointer",
                            position: "relative",
                            transition: "background .2s",
                          }}
                          aria-label={formData.estado === "activo" ? "Desactivar" : "Activar"}
                        >
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: "50%",
                              background: "#fff",
                              position: "absolute",
                              top: 2,
                              left: formData.estado === "activo" ? 22 : 2,
                              transition: "left .2s",
                              boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                            }}
                          />
                        </button>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: formData.estado === "activo" ? COLORS.primaryDark : "#B91C1C",
                          }}
                        >
                          {formData.estado === "activo" ? "Activo" : "Inactivo"}
                        </span>
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
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
                {formData.placa && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: COLORS.primary,
                      background: "rgba(57,169,0,.1)",
                      padding: "2px 10px",
                      borderRadius: 999,
                    }}
                  >
                    Placa: {formData.placa}
                  </span>
                )}
              </div>
              <div style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Placa *" style={{ gridColumn: "1 / -1" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)",
                      padding: "4px 14px 4px 4px",
                      borderRadius: 11,
                      border: `2px solid ${COLORS.primary}`,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        background: COLORS.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      <Car size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Ej: ABC-123"
                      value={formData.placa}
                      onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                      style={{
                        ...inputStyle,
                        border: "none",
                        background: "transparent",
                        padding: "11px 0",
                        fontSize: 16,
                        fontWeight: 700,
                        color: COLORS.text,
                      }}
                      required
                    />
                  </div>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                      type="color"
                      value={formData.color || "#000000"}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      style={{
                        width: 50,
                        height: 40,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>
                      {formData.color}
                    </span>
                  </div>
                </Field>

                <Field label="Descripción adicional" style={{ gridColumn: "1 / -1" }}>
                  <textarea
                    rows={2}
                    placeholder="Observaciones sobre el vehículo…"
                    value={formData.descripcionVehiculo}
                    onChange={(e) => setFormData({ ...formData, descripcionVehiculo: e.target.value })}
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

      {/* Modal de vista de vehículo */}
      <Modal open={viewVehiculoOpen} onClose={() => setViewVehiculoOpen(false)} maxWidth={450}>
        {viewingVehiculo && (
          <VehiculoView
            vehiculo={viewingVehiculo}
            onEdit={() => {
              const conductor = conductores.find((c) => c.id === viewingVehiculo.conductorId);
              if (conductor) {
                setViewVehiculoOpen(false);
                openEdit(conductor);
              }
            }}
            onClose={() => setViewVehiculoOpen(false)}
          />
        )}
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