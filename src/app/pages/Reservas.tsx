import React, { useMemo, useState, useEffect } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  Search,
  CheckCircle2,
  Clock3,
  XCircle,
  Car,
  UserCircle2,
  MapPin,
  X,
  Shield,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { toast } from "sonner";
import { useData, Reserva } from "../context/DataContext";

/* ─── Paleta (misma que Roles) ─── */
const C = {
  primary:     "#39A900",
  primaryDark: "#2D7D00",
  text:        "#0F172A",
  textLight:   "#64748B",
  border:      "#E2E8F0",
  bg:          "#F5F7F8",
};

/* ─── Estado config ─────────────────────────────────── */
type EstadoReserva = "pendiente" | "activa" | "completada" | "cancelada";

const ESTADO_CONFIG: Record<EstadoReserva, {
  bg: string; text: string; border: string; dot: string; label: string; icon: React.ReactNode;
}> = {
  pendiente:  { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", label: "Pendiente", icon: <Clock3 size={10} /> },
  activa:     { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0", dot: "#22C55E", label: "Activa", icon: <CheckCircle2 size={10} /> },
  completada: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE", dot: "#3B82F6", label: "Completada", icon: <CheckCircle2 size={10} /> },
  cancelada:  { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA", dot: "#EF4444", label: "Cancelada", icon: <XCircle size={10} /> },
};

/* ─── Modal reutilizable (mismo que Roles) ─── */
function Modal({
  open,
  onClose,
  children,
  maxWidth = 680,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}) {
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

/* ─── Badge de estado inline ─── */
function EstadoBadgeInline({ estado }: { estado: EstadoReserva }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.pendiente;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
      background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT - Reservas (estilo Roles)
══════════════════════════════════════════════════════ */
export function Reservas() {
  const {
    reservas, addReserva, updateReserva, deleteReserva,
    vehiculos, celdas, conductores, usuarios, parqueaderos,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [viewingReserva, setViewingReserva] = useState<Reserva | null>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoReserva>("todos");

  const [formData, setFormData] = useState({
    vehiculoId: "",
    celdaId: "",
    fechaReserva: new Date().toISOString().split("T")[0],
    horaInicio: "08:00",
    horaFin: "18:00",
    estado: "pendiente" as EstadoReserva,
  });

  /* ── Helpers ────────────────────────────────────────── */
  const getVehiculo = (id: string) => vehiculos.find(v => v.id === id);
  const getCelda = (id: string) => celdas.find(c => c.id === id);
  const getParqueadero = (id: string) => parqueaderos.find(p => p.id === id);

  const getConductorVehiculo = (vehiculoId: string) => {
    const v = getVehiculo(vehiculoId);
    return v ? conductores.find(c => c.id === v.conductorId) : null;
  };

  const getUsuarioConductor = (vehiculoId: string) => {
    const c = getConductorVehiculo(vehiculoId);
    return c ? usuarios.find(u => u.id === c.usuarioId) : null;
  };

  const celdasDisponibles = celdas.filter(c => c.estado === "disponible" || c.estado === "reservada");

  /* ── Stats ──────────────────────────────────────────── */
  const counts = {
    pendiente: reservas.filter(r => r.estado === "pendiente").length,
    activa: reservas.filter(r => r.estado === "activa").length,
    completada: reservas.filter(r => r.estado === "completada").length,
    cancelada: reservas.filter(r => r.estado === "cancelada").length,
  };

  /* ── Filtered data ──────────────────────────────────── */
  const filteredReservas = useMemo(() => {
    return reservas.filter(reserva => {
      const vehiculo = getVehiculo(reserva.vehiculoId);
      const celda = getCelda(reserva.celdaId);
      const usuario = getUsuarioConductor(reserva.vehiculoId);
      const q = search.toLowerCase();

      const matchesSearch =
        vehiculo?.placa.toLowerCase().includes(q) ||
        celda?.numero.toLowerCase().includes(q) ||
        usuario?.nombre.toLowerCase().includes(q) ||
        reserva.fechaReserva.includes(search);

      const matchesEstado = filterEstado === "todos" || reserva.estado === filterEstado;
      return matchesSearch && matchesEstado;
    });
  }, [reservas, search, filterEstado]);

  /* ── Handlers ───────────────────────────────────────── */
  const openCreate = () => {
    setEditingReserva(null);
    setFormData({
      vehiculoId: "",
      celdaId: "",
      fechaReserva: new Date().toISOString().split("T")[0],
      horaInicio: "08:00",
      horaFin: "18:00",
      estado: "pendiente",
    });
    setDialogOpen(true);
  };

  const openEdit = (reserva: Reserva) => {
    setEditingReserva(reserva);
    setFormData({
      vehiculoId: reserva.vehiculoId,
      celdaId: reserva.celdaId,
      fechaReserva: reserva.fechaReserva,
      horaInicio: reserva.horaInicio,
      horaFin: reserva.horaFin,
      estado: reserva.estado,
    });
    setViewOpen(false);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.vehiculoId) { toast.error("Selecciona un vehículo"); return; }
    if (!formData.celdaId) { toast.error("Selecciona una celda"); return; }
    if (!formData.fechaReserva) { toast.error("La fecha es requerida"); return; }
    if (!formData.horaInicio || !formData.horaFin) { toast.error("El horario es requerido"); return; }

    if (editingReserva) {
      updateReserva(editingReserva.id, formData);
      toast.success("Reserva actualizada correctamente");
    } else {
      addReserva(formData);
      toast.success("Reserva registrada correctamente");
    }
    setDialogOpen(false);
  };

  const handleDelete = (reserva: Reserva) => {
    if (confirm(`¿Eliminar la reserva para el vehículo ${getVehiculo(reserva.vehiculoId)?.placa}?`)) {
      deleteReserva(reserva.id);
      toast.success("Reserva eliminada correctamente");
    }
  };

  const activeFiltersCount = [search, filterEstado !== "todos" ? filterEstado : ""].filter(Boolean).length;
  const clearFilters = () => { setSearch(""); setFilterEstado("todos"); };

  // Calcular duración
  const getDuracion = () => {
    if (!formData.horaInicio || !formData.horaFin) return null;
    const [h1, m1] = formData.horaInicio.split(":").map(Number);
    const [h2, m2] = formData.horaFin.split(":").map(Number);
    const mins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (mins <= 0) return null;
    const h = Math.floor(mins / 60), m = mins % 60;
    return h > 0 ? `${h}h ${m > 0 ? m + "min" : ""}`.trim() : `${m}min`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .reservas-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .reserva-row{ transition:background .15s; }
        .reserva-row:hover{ background:#F8FAF8; }
        .stat-card{ transition:all .2s; cursor:pointer; }
        .stat-card:hover{ transform:translateY(-2px); }
        .action-btn{ transition:background .15s,color .15s; }
        .action-btn:hover{ background:#F1F5F9 !important; color:#0F172A !important; }
        input:focus,textarea:focus,select:focus{
          outline:none;
          border-color:${C.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
      `}</style>

      <div className="reservas-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── HERO (estilo Roles) ── */}
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
                <Shield size={11} /> Gestión Institucional SENA
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
                Gestión de Reservas
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
                Administra reservas de vehículos, horarios, disponibilidad y control operativo de parqueaderos.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, minWidth: 280 }}>
              {[
                { label: "Pendientes", value: counts.pendiente, estado: "pendiente", icon: Clock3 },
                { label: "Activas", value: counts.activa, estado: "activa", icon: CheckCircle2 },
                { label: "Completadas", value: counts.completada, estado: "completada", icon: Calendar },
                { label: "Canceladas", value: counts.cancelada, estado: "cancelada", icon: XCircle },
              ].map((s) => {
                const cfg = ESTADO_CONFIG[s.estado as EstadoReserva];
                const isActive = filterEstado === s.estado;
                return (
                  <div
                    key={s.label}
                    className="stat-card"
                    onClick={() => setFilterEstado(isActive ? "todos" : s.estado as EstadoReserva)}
                    style={{
                      background: "rgba(255,255,255,.12)",
                      border: `1px solid ${isActive ? "#fff" : "rgba(255,255,255,.2)"}`,
                      borderRadius: 12, padding: "8px 10px", textAlign: "center",
                      cursor: "pointer",
                      transition: "all .2s",
                    }}
                  >
                    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,.65)", textTransform: "uppercase", marginBottom: 2 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── TOPBAR ── */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />
            <input
              placeholder="Buscar por placa, conductor, celda o fecha..."
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
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="activa">Activas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              style={{
                padding: "10px 14px", borderRadius: 11,
                border: `1px solid ${C.border}`,
                background: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                color: C.textLight, fontSize: 12,
              }}
            >
              <X size={14} /> Limpiar
            </button>
          )}

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
            <Plus size={15} /> Nueva Reserva
          </button>
        </div>

        {/* ── RESULT HINT ── */}
        {activeFiltersCount > 0 && (
          <p style={{ fontSize: 11, color: C.textLight }}>
            Mostrando <strong>{filteredReservas.length}</strong> resultado{filteredReservas.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* ── TABLA (estilo Roles) ── */}
        <div style={{
          borderRadius: 16, border: `1px solid ${C.border}`,
          background: "#fff", overflow: "hidden",
          boxShadow: "0 2px 8px rgba(15,23,42,.05)",
        }}>
          {/* Tabla header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(180px,1fr) minmax(160px,1fr) 120px minmax(160px,1fr) 180px 110px 100px",
            background: "#F8FAF8",
            borderBottom: `1px solid ${C.border}`,
            padding: "12px 16px",
            fontSize: 11, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            <div>Vehículo</div>
            <div>Conductor</div>
            <div>Ubicación</div>
            <div>Horario</div>
            <div>Fecha</div>
            <div>Estado</div>
            <div style={{ textAlign: "right" }}>Acciones</div>
          </div>

          {/* Tabla body */}
          <div style={{ maxHeight: "calc(100vh - 400px)", overflowY: "auto" }}>
            {filteredReservas.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "48px 24px", color: C.textLight,
              }}>
                <Calendar size={36} color={C.border} style={{ marginBottom: 12 }} />
                <p style={{ fontWeight: 600, fontSize: 13 }}>No se encontraron reservas</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o crea una nueva reserva</p>
              </div>
            ) : (
              filteredReservas.map((reserva) => {
                const vehiculo = getVehiculo(reserva.vehiculoId);
                const celda = getCelda(reserva.celdaId);
                const usuario = getUsuarioConductor(reserva.vehiculoId);
                const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;
                const cfg = ESTADO_CONFIG[reserva.estado as EstadoReserva];

                return (
                  <div
                    key={reserva.id}
                    className="reserva-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(180px,1fr) minmax(160px,1fr) 120px minmax(160px,1fr) 180px 110px 100px",
                      padding: "14px 16px",
                      borderBottom: `1px solid ${C.border}`,
                      alignItems: "center",
                      fontSize: 12,
                    }}
                  >
                    {/* Vehículo */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "rgba(57,169,0,.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Car size={16} color={C.primary} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: C.text }}>{vehiculo?.placa || "—"}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{vehiculo?.marca} {vehiculo?.modelo}</div>
                      </div>
                    </div>

                    {/* Conductor */}
                    <div>
                      {usuario ? (
                        <>
                          <div style={{ fontWeight: 600, color: C.text }}>{usuario.nombre}</div>
                          <div style={{ fontSize: 10, color: C.textLight }}>{usuario.identificacion}</div>
                        </>
                      ) : (
                        <span style={{ color: C.textLight, fontSize: 11 }}>Sin conductor</span>
                      )}
                    </div>

                    {/* Ubicación */}
                    <div>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "2px 8px", borderRadius: 8,
                        background: "#F1F5F9", fontSize: 11, fontWeight: 600,
                      }}>
                        <MapPin size={10} color={C.primary} />
                        Celda {celda?.numero || "—"}
                      </div>
                      {parqueadero && (
                        <div style={{ fontSize: 9, color: C.textLight, marginTop: 2 }}>
                          {parqueadero.nombre}
                        </div>
                      )}
                    </div>

                    {/* Horario */}
                    <div>
                      <div style={{ fontWeight: 600, color: C.text }}>
                        {reserva.horaInicio} – {reserva.horaFin}
                      </div>
                    </div>

                    {/* Fecha */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Calendar size={10} color={C.textLight} />
                        <span style={{ fontSize: 11, color: C.text }}>{reserva.fechaReserva}</span>
                      </div>
                    </div>

                    {/* Estado */}
                    <div>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                        background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Acciones */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      <button
                        className="action-btn"
                        title="Ver detalle"
                        onClick={() => { setViewingReserva(reserva); setViewOpen(true); }}
                        style={{
                          width: 28, height: 28, borderRadius: 7,
                          border: "none", background: "transparent",
                          color: C.textLight, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="action-btn"
                        title="Editar"
                        onClick={() => openEdit(reserva)}
                        style={{
                          width: 28, height: 28, borderRadius: 7,
                          border: "none", background: "transparent",
                          color: C.textLight, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="action-btn"
                        title="Eliminar"
                        onClick={() => handleDelete(reserva)}
                        style={{
                          width: 28, height: 28, borderRadius: 7,
                          border: "none", background: "transparent",
                          color: "#EF4444", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer count */}
          {filteredReservas.length > 0 && (
            <div style={{
              padding: "10px 16px", borderTop: `1px solid ${C.border}`,
              background: "#F8FAF8", fontSize: 11, color: C.textLight,
            }}>
              Mostrando <strong>{filteredReservas.length}</strong> de <strong>{reservas.length}</strong> reservas
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL CREAR / EDITAR ── */}
      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={680}>
        <div>
          {/* Header */}
          <div
            style={{
              padding: "1.4rem 1.8rem",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
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
                <Sparkles size={18} color={C.primary} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>
                  Registro de reserva
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                  {editingReserva ? "Editar Reserva" : "Nueva Reserva"}
                </h2>
              </div>
            </div>
            <button
              onClick={() => setDialogOpen(false)}
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

          {/* Body */}
          <div style={{ padding: "1.4rem 1.8rem", maxHeight: "65vh", overflowY: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {/* Vehículo */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Vehículo *
                </label>
                <select
                  value={formData.vehiculoId}
                  onChange={(e) => setFormData({ ...formData, vehiculoId: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                >
                  <option value="">Seleccionar vehículo...</option>
                  {vehiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.placa} — {v.marca} {v.modelo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Celda */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Celda *
                </label>
                <select
                  value={formData.celdaId}
                  onChange={(e) => setFormData({ ...formData, celdaId: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                >
                  <option value="">Seleccionar celda...</option>
                  {celdasDisponibles.map(c => {
                    const pq = getParqueadero(c.parqueaderoId);
                    return (
                      <option key={c.id} value={c.id}>
                        Celda {c.numero} — {pq?.nombre || "Parqueadero"}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Fecha de reserva *
                </label>
                <input
                  type="date"
                  value={formData.fechaReserva}
                  onChange={(e) => setFormData({ ...formData, fechaReserva: e.target.value })}
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
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoReserva })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="activa">Activa</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* Hora inicio */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Hora de inicio *
                </label>
                <input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                />
              </div>

              {/* Hora fin */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Hora de fin *
                </label>
                <input
                  type="time"
                  value={formData.horaFin}
                  onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                />
              </div>

              {/* Duration hint */}
              {getDuracion() && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 12px", borderRadius: 11,
                    background: "#F8FAFC", border: `1px solid ${C.border}`,
                  }}>
                    <Clock size={14} color={C.primary} />
                    <span style={{ fontSize: 12, color: C.text }}>
                      Duración: <strong>{getDuracion()}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "1rem 1.8rem",
              borderTop: `1px solid ${C.border}`,
              display: "flex", gap: 10, justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => setDialogOpen(false)}
              style={{
                padding: "10px 20px", borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: "#fff", color: C.text,
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: "10px 24px", borderRadius: 12,
                border: "none", background: C.primary, color: "#fff",
                fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 6px 18px rgba(57,169,0,.22)",
              }}
            >
              {editingReserva ? "Actualizar Reserva" : "Registrar Reserva"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL VER DETALLE ── */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} maxWidth={450}>
        {viewingReserva && (() => {
          const vehiculo = getVehiculo(viewingReserva.vehiculoId);
          const celda = getCelda(viewingReserva.celdaId);
          const usuario = getUsuarioConductor(viewingReserva.vehiculoId);
          const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;
          const cfg = ESTADO_CONFIG[viewingReserva.estado as EstadoReserva];

          return (
            <div>
              <div
                style={{
                  padding: "1.6rem 1.8rem 1.4rem",
                  background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
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
                        width: 52, height: 52, borderRadius: 14,
                        background: "rgba(255,255,255,.18)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Car size={24} />
                    </div>
                    <button
                      onClick={() => setViewOpen(false)}
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
                  <h2 style={{ marginTop: 14, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
                    {vehiculo?.placa || "—"}
                  </h2>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 4 }}>
                    {vehiculo?.marca} {vehiculo?.modelo}
                  </p>
                  <div style={{ marginTop: 12 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                      background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: "1.4rem 1.8rem" }}>
                {[
                  { label: "Conductor", value: usuario ? `${usuario.nombre} · ${usuario.identificacion}` : "Sin conductor", icon: UserCircle2 },
                  { label: "Celda", value: celda ? `Celda ${celda.numero}` : "—", icon: MapPin },
                  { label: "Parqueadero", value: parqueadero?.nombre || "—", icon: MapPin },
                  { label: "Fecha de reserva", value: viewingReserva.fechaReserva, icon: Calendar },
                  { label: "Horario", value: `${viewingReserva.horaInicio} – ${viewingReserva.horaFin}`, icon: Clock },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", borderRadius: 12,
                    background: "#F8FAFC", border: `1px solid ${C.border}`,
                    marginBottom: 8,
                  }}>
                    <item.icon size={14} color={C.textLight} />
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => openEdit(viewingReserva)}
                  style={{
                    marginTop: 12, width: "100%", padding: "12px 20px", borderRadius: 12,
                    border: "none", background: C.primary, color: "#fff",
                    fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: `0 6px 18px ${C.primary}33`,
                  }}
                >
                  <Pencil size={14} />
                  Editar reserva
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}