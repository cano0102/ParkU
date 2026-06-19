import React, { useMemo, useState, useEffect, useCallback, memo } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  Car,
  Bike,
  Shield,
  GaugeCircle,
  UserCircle2,
  Palette,
  CheckCircle2,
  X,
  Sparkles,
  Users,
  Calendar,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useData, Vehiculo } from "../context/DataContext";

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

const getTipoStyles = (tipo: "carro" | "moto") => {
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

const Modal = memo(
  ({ open, onClose, children, maxWidth = 680 }: ModalProps) => {
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
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
  },
);

Modal.displayName = "Modal";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmDialog = memo(
  ({ open, onConfirm, onCancel, title, message }: ConfirmDialogProps) => {
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
          <h3
            id="confirm-title"
            style={{
              fontSize: 18,
              fontWeight: 900,
              color: COLORS.text,
              marginBottom: 8,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: 13,
              color: COLORS.textLight,
              lineHeight: 1.6,
              marginBottom: 20,
            }}
          >
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
  },
);

ConfirmDialog.displayName = "ConfirmDialog";

interface FormState {
  conductorId: string;
  placa: string;
  tipo: "carro" | "moto";
  marca: string;
  modelo: string;
  color: string;
  descripcion: string;
  estado: "activo" | "inactivo";
}

const emptyForm = (): FormState => ({
  conductorId: "",
  placa: "",
  tipo: "carro",
  marca: "",
  modelo: "",
  color: "",
  descripcion: "",
  estado: "activo",
});

export function Vehiculos() {
  const {
    vehiculos,
    addVehiculo,
    updateVehiculo,
    deleteVehiculo,
    conductores,
    usuarios,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [viewingVehiculo, setViewingVehiculo] = useState<Vehiculo | null>(null);
  const [deletingVehiculo, setDeletingVehiculo] = useState<Vehiculo | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState<
    "todos" | "activo" | "inactivo"
  >("todos");
  const [formData, setFormData] = useState<FormState>(emptyForm());

  const getConductor = useCallback(
    (conductorId: string) => conductores.find((c) => c.id === conductorId),
    [conductores],
  );
  const getUsuarioConductor = useCallback(
    (conductorId: string) => {
      const conductor = getConductor(conductorId);
      if (!conductor) return null;
      return usuarios.find((u) => u.id === conductor.usuarioId);
    },
    [conductores, usuarios, getConductor],
  );

  const totalActivos = useMemo(
    () => vehiculos.filter((v) => v.estado === "activo").length,
    [vehiculos],
  );
  const totalCarros = useMemo(
    () => vehiculos.filter((v) => v.tipo === "carro").length,
    [vehiculos],
  );
  const totalMotos = useMemo(
    () => vehiculos.filter((v) => v.tipo === "moto").length,
    [vehiculos],
  );

  const filteredVehiculos = useMemo(
    () =>
      vehiculos.filter((vehiculo) => {
        const usuario = getUsuarioConductor(vehiculo.conductorId);
        const q = search.toLowerCase();
        const matchesSearch =
          vehiculo.placa.toLowerCase().includes(q) ||
          vehiculo.marca.toLowerCase().includes(q) ||
          vehiculo.modelo.toLowerCase().includes(q) ||
          (usuario?.nombre.toLowerCase().includes(q) || false) ||
          (usuario?.identificacion.includes(search) || false);
        const matchesTipo =
          filterTipo === "todos" ? true : vehiculo.tipo === filterTipo;
        const matchesEstado =
          filterEstado === "todos" ? true : vehiculo.estado === filterEstado;
        return matchesSearch && matchesTipo && matchesEstado;
      }),
    [vehiculos, search, filterTipo, filterEstado, getUsuarioConductor],
  );

  const openCreate = useCallback(() => {
    setEditingVehiculo(null);
    setFormData(emptyForm());
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((vehiculo: Vehiculo) => {
    setEditingVehiculo(vehiculo);
    setFormData({
      conductorId: vehiculo.conductorId,
      placa: vehiculo.placa,
      tipo: vehiculo.tipo,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      color: vehiculo.color,
      descripcion: vehiculo.descripcion,
      estado: vehiculo.estado,
    });
    setViewOpen(false);
    setDialogOpen(true);
  }, []);

  const openView = useCallback((vehiculo: Vehiculo) => {
    setViewingVehiculo(vehiculo);
    setViewOpen(true);
  }, []);

  const openConfirm = useCallback((vehiculo: Vehiculo) => {
    setDeletingVehiculo(vehiculo);
    setConfirmOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    const placaSanitized = sanitizeText(formData.placa.trim().toUpperCase());
    const marcaSanitized = sanitizeText(formData.marca.trim());
    const modeloSanitized = sanitizeText(formData.modelo.trim());

    if (!placaSanitized) {
      toast.error("La placa es requerida");
      return;
    }
    if (!marcaSanitized) {
      toast.error("La marca es requerida");
      return;
    }
    if (!modeloSanitized) {
      toast.error("El modelo es requerido");
      return;
    }
    if (!formData.conductorId) {
      toast.error("Selecciona un conductor");
      return;
    }

    const vehiculoData = {
      conductorId: formData.conductorId,
      placa: placaSanitized,
      tipo: formData.tipo,
      marca: marcaSanitized,
      modelo: modeloSanitized,
      color: sanitizeText(formData.color.trim()),
      descripcion: sanitizeText(formData.descripcion.trim()),
      estado: formData.estado,
    };

    try {
      if (editingVehiculo) {
        updateVehiculo(editingVehiculo.id, vehiculoData);
        toast.success("Vehículo actualizado correctamente");
      } else {
        addVehiculo(vehiculoData);
        toast.success("Vehículo registrado correctamente");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error("Error al guardar el vehículo");
      console.error("Error saving vehicle:", error);
    }
  }, [formData, editingVehiculo, addVehiculo, updateVehiculo]);

  const handleDelete = useCallback(() => {
    if (deletingVehiculo) {
      try {
        deleteVehiculo(deletingVehiculo.id);
        toast.success("Vehículo eliminado correctamente");
        setConfirmOpen(false);
        setDeletingVehiculo(null);
      } catch (error) {
        toast.error("Error al eliminar el vehículo");
        console.error("Error deleting vehicle:", error);
      }
    }
  }, [deletingVehiculo, deleteVehiculo]);

  const handleToggleEstado = useCallback(
    (id: string, currentEstado: "activo" | "inactivo") => {
      try {
        const nuevoEstado = currentEstado === "activo" ? "inactivo" : "activo";
        updateVehiculo(id, { estado: nuevoEstado });
        toast.success(
          `Vehículo ${nuevoEstado === "activo" ? "activado" : "desactivado"}`,
        );
      } catch (error) {
        toast.error("Error al cambiar el estado");
        console.error("Error toggling status:", error);
      }
    },
    [updateVehiculo],
  );

  const clearFilters = useCallback(() => {
    setSearch("");
    setFilterTipo("todos");
    setFilterEstado("todos");
  }, []);

  const activeFiltersCount = useMemo(
    () =>
      [
        search,
        filterTipo !== "todos" ? filterTipo : "",
        filterEstado !== "todos" ? filterEstado : "",
      ].filter(Boolean).length,
    [search, filterTipo, filterEstado],
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .vehiculos-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .vehiculo-card{ 
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          background: #FFFFFF;
          border: 1px solid ${COLORS.border};
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }
        .vehiculo-card:hover{ 
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(15,23,42,.12) !important;
          border-color: ${COLORS.primary};
        }
        .vehiculo-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primary}66);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .vehiculo-card:hover::before {
          opacity: 1;
        }
        .action-btn{ 
          transition: all 0.15s ease;
          border-radius: 8px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          color: ${COLORS.textLight};
        }
        .action-btn:hover{ 
          background: #F1F5F9 !important; 
          color: #0F172A !important;
          transform: scale(1.05);
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
        .vehiculo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 16px;
        }
        @media (max-width: 640px) {
          .vehiculo-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        className="vehiculos-root"
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
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
                <Shield size={11} /> Parque automotor
              </div>
              <h1
                style={{
                  fontSize: "clamp(1.6rem,3vw,2.2rem)",
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                Gestión de Vehículos
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,.8)",
                  lineHeight: 1.5,
                }}
              >
                Administra vehículos registrados, conductores autorizados y
                estado operativo del parque automotor.
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
                { label: "Total", value: vehiculos.length, icon: Users },
                { label: "Activos", value: totalActivos, icon: CheckCircle2 },
                { label: "Carros", value: totalCarros, icon: Car },
                { label: "Motos", value: totalMotos, icon: Bike },
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
                  <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
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
              placeholder="Buscar por placa, marca, modelo o conductor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 36px",
                borderRadius: 11,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                background: "#fff",
                fontFamily: "inherit",
              }}
              aria-label="Buscar vehículos"
            />
          </div>

          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: 11,
              border: `1px solid ${COLORS.border}`,
              fontSize: 13,
              background: "#fff",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
            aria-label="Filtrar por tipo"
          >
            <option value="todos">Todos los tipos</option>
            <option value="carro">Carros</option>
            <option value="moto">Motos</option>
          </select>

          <select
            value={filterEstado}
            onChange={(e) =>
              setFilterEstado(e.target.value as "todos" | "activo" | "inactivo")
            }
            style={{
              padding: "10px 14px",
              borderRadius: 11,
              border: `1px solid ${COLORS.border}`,
              fontSize: 13,
              background: "#fff",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
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
            <Plus size={15} /> Nuevo Vehículo
          </button>
        </div>

        {activeFiltersCount > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ fontSize: 11, color: COLORS.textLight }}>
              Mostrando <strong>{filteredVehiculos.length}</strong> resultado
              {filteredVehiculos.length !== 1 ? "s" : ""}
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

        {filteredVehiculos.length === 0 ? (
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
            <Car size={36} color={COLORS.border} style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: 13 }}>
              No se encontraron vehículos
            </p>
            <p style={{ fontSize: 11, marginTop: 4 }}>
              Prueba con otros filtros o registra uno nuevo
            </p>
          </div>
        ) : (
          <div className="vehiculo-grid">
            {filteredVehiculos.map((vehiculo) => {
              const usuario = getUsuarioConductor(vehiculo.conductorId);
              const tipoStyle = getTipoStyles(vehiculo.tipo);
              const TipoIcon = tipoStyle.icon;
              const activo = vehiculo.estado === "activo";

              return (
                <div
                  key={vehiculo.id}
                  className="vehiculo-card"
                  style={{
                    boxShadow: "0 2px 8px rgba(15,23,42,.05)",
                  }}
                >
                  <div style={{ padding: "16px 16px 12px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            flexShrink: 0,
                            background: `${tipoStyle.dot}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: `2px solid ${tipoStyle.dot}30`,
                          }}
                        >
                          <TipoIcon size={22} color={tipoStyle.dot} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 16,
                                fontWeight: 900,
                                color: COLORS.text,
                                letterSpacing: 0.5,
                                margin: 0,
                              }}
                            >
                              {sanitizeText(vehiculo.placa)}
                            </p>
                            <span className="type-badge" style={{
                              background: tipoStyle.bg,
                              color: tipoStyle.text,
                              border: `1px solid ${tipoStyle.border}`,
                            }}>
                              <TipoIcon size={10} />
                              {tipoStyle.label}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: 12,
                              color: COLORS.textLight,
                              margin: "4px 0 0",
                              fontWeight: 500,
                            }}
                          >
                            {sanitizeText(vehiculo.marca)} {sanitizeText(vehiculo.modelo)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleEstado(vehiculo.id, vehiculo.estado)}
                        style={{
                          width: 36,
                          height: 20,
                          borderRadius: 999,
                          background: activo ? COLORS.primary : "#CBD5E1",
                          border: "none",
                          cursor: "pointer",
                          position: "relative",
                          transition: "all 0.3s ease",
                          flexShrink: 0,
                        }}
                        aria-label={activo ? "Desactivar vehículo" : "Activar vehículo"}
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
                            transition: "all 0.3s ease",
                            boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                          }}
                        />
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 6,
                        marginBottom: 12,
                      }}
                    >
                      <span className={`status-badge ${activo ? "active" : "inactive"}`}>
                        {activo ? "✓ Activo" : "✗ Inactivo"}
                      </span>
                      {vehiculo.color && (
                        <span className="status-badge" style={{
                          background: "#F3F4F6",
                          color: COLORS.text,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}>
                          <span style={{
                            width: 10,
                            height: 10,
                            borderRadius: 3,
                            background: vehiculo.color,
                            border: `1px solid ${COLORS.border}`,
                          }} />
                          {sanitizeText(vehiculo.color)}
                        </span>
                      )}
                    </div>

                    {usuario && (
                      <div className="info-row" style={{ marginBottom: 8 }}>
                        <UserCircle2 size={14} color={COLORS.textLight} />
                        <span style={{ fontSize: 12, color: COLORS.text, fontWeight: 500 }}>
                          {sanitizeText(usuario.nombre)}
                        </span>
                        <span style={{ fontSize: 11, color: COLORS.textLight }}>
                          {usuario.identificacion}
                        </span>
                      </div>
                    )}

                    {vehiculo.descripcion && (
                      <div
                        style={{
                          fontSize: 11,
                          color: COLORS.textLight,
                          lineHeight: 1.5,
                          padding: "8px 12px",
                          borderRadius: 10,
                          background: COLORS.bg,
                          border: `1px solid ${COLORS.border}`,
                          marginBottom: 8,
                        }}
                      >
                        {sanitizeText(vehiculo.descripcion)}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      borderTop: `1px solid ${COLORS.border}`,
                      padding: "10px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: COLORS.bg,
                    }}
                  >
                    <span style={{ fontSize: 10, color: COLORS.textLight, fontWeight: 600 }}>
                      Registrado en sistema
                    </span>
                    <div style={{ display: "flex", gap: 2 }}>
                      <button
                        className="action-btn"
                        title="Ver detalle"
                        onClick={() => openView(vehiculo)}
                        aria-label={`Ver detalle de ${vehiculo.placa}`}
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="action-btn"
                        title="Editar"
                        onClick={() => openEdit(vehiculo)}
                        aria-label={`Editar ${vehiculo.placa}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="action-btn danger"
                        title="Eliminar"
                        onClick={() => openConfirm(vehiculo)}
                        aria-label={`Eliminar ${vehiculo.placa}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth={680}
      >
        <div>
          <div
            style={{
              padding: "1.4rem 1.8rem",
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
                  Registro de vehículo
                </div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: COLORS.text,
                    lineHeight: 1,
                  }}
                >
                  {editingVehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}
                </h2>
              </div>
            </div>
            <button
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

          <div
            style={{
              padding: "1.4rem 1.8rem",
              maxHeight: "65vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 6,
                  }}
                >
                  Conductor *
                </label>
                <select
                  value={formData.conductorId}
                  onChange={(e) =>
                    setFormData({ ...formData, conductorId: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 11,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                    background: "#F8FAFC",
                  }}
                  required
                >
                  <option value="">Seleccionar conductor...</option>
                  {conductores.map((conductor) => {
                    const usuario = usuarios.find(
                      (u) => u.id === conductor.usuarioId,
                    );
                    return (
                      <option key={conductor.id} value={conductor.id}>
                        {usuario
                          ? `${usuario.nombre} - ${usuario.identificacion}`
                          : "Sin usuario"}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 6,
                  }}
                >
                  Placa *
                </label>
                <input
                  type="text"
                  placeholder="ABC123"
                  value={formData.placa}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      placa: e.target.value.toUpperCase(),
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 11,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                    background: "#F8FAFC",
                    textTransform: "uppercase",
                  }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 6,
                  }}
                >
                  Tipo de vehículo *
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["carro", "moto"] as const).map((tipo) => {
                    const isSelected = formData.tipo === tipo;
                    return (
                      <button
                        key={tipo}
                        type="button"
                        onClick={() => setFormData({ ...formData, tipo })}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: 11,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "inherit",
                          border: isSelected
                            ? "1px solid transparent"
                            : `1px solid ${COLORS.border}`,
                          background: isSelected
                            ? "rgba(57,169,0,.1)"
                            : "#F8FAFC",
                          color: isSelected
                            ? COLORS.primaryDark
                            : COLORS.textLight,
                          textTransform: "capitalize",
                        }}
                      >
                        {tipo === "carro" ? "🚗 Carro" : "🏍️ Moto"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 6,
                  }}
                >
                  Marca *
                </label>
                <input
                  type="text"
                  placeholder="Toyota, Yamaha..."
                  value={formData.marca}
                  onChange={(e) =>
                    setFormData({ ...formData, marca: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 11,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                    background: "#F8FAFC",
                  }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 6,
                  }}
                >
                  Modelo *
                </label>
                <input
                  type="text"
                  placeholder="Corolla, FZ..."
                  value={formData.modelo}
                  onChange={(e) =>
                    setFormData({ ...formData, modelo: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 11,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                    background: "#F8FAFC",
                  }}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 6,
                  }}
                >
                  Color *
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    type="color"
                    value={formData.color || "#000000"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        color: e.target.value,
                      })
                    }
                    style={{
                      width: 50,
                      height: 40,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  />

                  <span
                    style={{
                      fontSize: 13,
                      color: COLORS.text,
                      fontWeight: 600,
                    }}
                  >
                    {formData.color}
                  </span>
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 6,
                  }}
                >
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Características adicionales del vehículo..."
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: 11,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: 13,
                    outline: "none",
                    fontFamily: "inherit",
                    background: "#F8FAFC",
                    resize: "none",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px",
                    borderRadius: 11,
                    background: "#F8FAFC",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: COLORS.text,
                      }}
                    >
                      Estado del vehículo
                    </p>
                    <p style={{ fontSize: 10, color: COLORS.textLight }}>
                      Controla la disponibilidad en el sistema
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        estado:
                          formData.estado === "activo" ? "inactivo" : "activo",
                      })
                    }
                    style={{
                      width: 40,
                      height: 22,
                      borderRadius: 999,
                      background:
                        formData.estado === "activo"
                          ? COLORS.primary
                          : "#CBD5E1",
                      border: "none",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    aria-label={
                      formData.estado === "activo"
                        ? "Desactivar vehículo"
                        : "Activar vehículo"
                    }
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#fff",
                        position: "absolute",
                        top: 2,
                        left: formData.estado === "activo" ? 20 : 2,
                        transition: "left .2s",
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
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
              onClick={() => setDialogOpen(false)}
              style={{
                padding: "10px 20px",
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
              onClick={handleSave}
              style={{
                padding: "10px 24px",
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
              {editingVehiculo ? "Actualizar Vehículo" : "Registrar Vehículo"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} maxWidth={450}>
        {viewingVehiculo &&
          (() => {
            const usuario = getUsuarioConductor(viewingVehiculo.conductorId);
            const tipoStyle = getTipoStyles(viewingVehiculo.tipo);
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
                        }}
                      >
                        <TipoIcon size={24} />
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
                    <h2
                      style={{
                        marginTop: 14,
                        fontSize: 24,
                        fontWeight: 900,
                        lineHeight: 1,
                        letterSpacing: 0.5,
                      }}
                    >
                      {sanitizeText(viewingVehiculo.placa)}
                    </h2>
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
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
                        {viewingVehiculo.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "1.4rem 1.8rem" }}>
                  {[
                    {
                      label: "Marca",
                      value: viewingVehiculo.marca,
                      icon: GaugeCircle,
                    },
                    {
                      label: "Modelo",
                      value: viewingVehiculo.modelo,
                      icon: GaugeCircle,
                    },
                    {
                      label: "Color",
                      value: viewingVehiculo.color,
                      icon: Palette,
                    },
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
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: COLORS.text,
                          }}
                        >
                          {sanitizeText(String(item.value))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div
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
                    <UserCircle2 size={14} color={COLORS.textLight} />
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
                        Conductor
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: COLORS.text,
                        }}
                      >
                        {usuario
                          ? `${sanitizeText(usuario.nombre)} - ${usuario.identificacion}`
                          : "Sin conductor"}
                      </div>
                    </div>
                  </div>

                  {viewingVehiculo.descripcion && (
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
                      <div
                        style={{
                          fontSize: 12,
                          color: COLORS.text,
                          lineHeight: 1.4,
                        }}
                      >
                        {sanitizeText(viewingVehiculo.descripcion)}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => openEdit(viewingVehiculo)}
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
          })()}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingVehiculo(null);
        }}
        title="Eliminar Vehículo"
        message={`¿Estás seguro de eliminar el vehículo "${deletingVehiculo?.placa}"? Esta acción no se puede deshacer.`}
      />
    </>
  );
}