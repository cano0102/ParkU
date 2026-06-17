import React, { useMemo, useState, useEffect } from "react";

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
  Calendar,
  Palette,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Hash,
  MapPin,
} from "lucide-react";

import { toast } from "sonner";
import { useData, Vehiculo } from "../context/DataContext";

/* ─── Paleta (misma que Roles) ─── */
const C = {
  primary:     "#39A900",
  primaryDark: "#2D7D00",
  text:        "#0F172A",
  textLight:   "#64748B",
  border:      "#E2E8F0",
  bg:          "#F5F7F8",
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

/* ─── Tipo vehículo styles ─── */
function getTipoStyles(tipo: "carro" | "moto") {
  if (tipo === "carro") {
    return { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE", dot: "#3B82F6", label: "Carro", icon: Car };
  }
  return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", dot: "#F59E0B", label: "Moto", icon: Bike };
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT - Vehículos (estilo Roles)
══════════════════════════════════════════════════════ */
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
  const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);
  const [viewingVehiculo, setViewingVehiculo] = useState<Vehiculo | null>(null);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");

  const [formData, setFormData] = useState({
    conductorId: "",
    placa: "",
    tipo: "carro" as "carro" | "moto",
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    color: "",
    descripcion: "",
    estado: "activo" as "activo" | "inactivo",
  });

  /* ─── helpers ─── */
  const getConductor = (conductorId: string) => conductores.find((c) => c.id === conductorId);
  const getUsuarioConductor = (conductorId: string) => {
    const conductor = getConductor(conductorId);
    if (!conductor) return null;
    return usuarios.find((u) => u.id === conductor.usuarioId);
  };

  /* ─── stats ─── */
  const totalActivos = vehiculos.filter((v) => v.estado === "activo").length;
  const totalInactivos = vehiculos.filter((v) => v.estado === "inactivo").length;
  const totalCarros = vehiculos.filter((v) => v.tipo === "carro").length;
  const totalMotos = vehiculos.filter((v) => v.tipo === "moto").length;

  /* ─── filtered list ─── */
  const filteredVehiculos = useMemo(() =>
    vehiculos.filter((vehiculo) => {
      const usuario = getUsuarioConductor(vehiculo.conductorId);
      const q = search.toLowerCase();
      const matchesSearch =
        vehiculo.placa.toLowerCase().includes(q) ||
        vehiculo.marca.toLowerCase().includes(q) ||
        vehiculo.modelo.toLowerCase().includes(q) ||
        (usuario?.nombre.toLowerCase().includes(q) || false) ||
        (usuario?.identificacion.includes(search) || false);
      const matchesTipo = filterTipo === "todos" ? true : vehiculo.tipo === filterTipo;
      const matchesEstado = filterEstado === "todos" ? true : vehiculo.estado === filterEstado;
      return matchesSearch && matchesTipo && matchesEstado;
    }),
    [vehiculos, search, filterTipo, filterEstado]
  );

  /* ─── handlers ─── */
  const openCreate = () => {
    setEditingVehiculo(null);
    setFormData({
      conductorId: "", placa: "", tipo: "carro", marca: "", modelo: "",
      año: new Date().getFullYear(), color: "", descripcion: "", estado: "activo",
    });
    setDialogOpen(true);
  };

  const openEdit = (vehiculo: Vehiculo) => {
    setEditingVehiculo(vehiculo);
    setFormData({
      conductorId: vehiculo.conductorId,
      placa: vehiculo.placa,
      tipo: vehiculo.tipo,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      año: vehiculo.año,
      color: vehiculo.color,
      descripcion: vehiculo.descripcion,
      estado: vehiculo.estado,
    });
    setViewOpen(false);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.placa) { toast.error("La placa es requerida"); return; }
    if (!formData.marca) { toast.error("La marca es requerida"); return; }
    if (!formData.modelo) { toast.error("El modelo es requerido"); return; }
    if (!formData.conductorId) { toast.error("Selecciona un conductor"); return; }

    if (editingVehiculo) {
      updateVehiculo(editingVehiculo.id, formData);
      toast.success("Vehículo actualizado correctamente");
    } else {
      addVehiculo(formData);
      toast.success("Vehículo registrado correctamente");
    }
    setDialogOpen(false);
  };

  const handleDelete = (vehiculo: Vehiculo) => {
    if (confirm(`¿Eliminar el vehículo "${vehiculo.placa}"?`)) {
      deleteVehiculo(vehiculo.id);
      toast.success("Vehículo eliminado");
    }
  };

  const handleChangeEstado = (id: string, nuevoEstado: "activo" | "inactivo") => {
    updateVehiculo(id, { estado: nuevoEstado });
    toast.success(`Vehículo ${nuevoEstado === "activo" ? "activado" : "desactivado"}`);
  };

  const activeFiltersCount = [search, filterTipo !== "todos" ? filterTipo : "", filterEstado !== "todos" ? filterEstado : ""].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setFilterTipo("todos");
    setFilterEstado("todos");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .vehiculos-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .vehiculo-card{ transition:box-shadow .18s,transform .18s; }
        .vehiculo-card:hover{ box-shadow:0 8px 28px rgba(15,23,42,.1); transform:translateY(-1px); }
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

      <div className="vehiculos-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

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
                <Shield size={11} /> Parque automotor
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
                Gestión de Vehículos
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
                Administra vehículos registrados, conductores autorizados y estado operativo del parque automotor.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, minWidth: 280 }}>
              {[
                { label: "Total", value: vehiculos.length, icon: Car },
                { label: "Activos", value: totalActivos, icon: CheckCircle2 },
                { label: "Carros", value: totalCarros, icon: Car },
                { label: "Motos", value: totalMotos, icon: Bike },
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
          <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />
            <input
              placeholder="Buscar por placa, marca, modelo o conductor..."
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
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            style={{
              padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`,
              fontSize: 13, background: "#fff", fontFamily: "inherit", cursor: "pointer",
            }}
          >
            <option value="todos">Todos los tipos</option>
            <option value="carro">Carros</option>
            <option value="moto">Motos</option>
          </select>

          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value as any)}
            style={{
              padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`,
              fontSize: 13, background: "#fff", fontFamily: "inherit", cursor: "pointer",
            }}
          >
            <option value="todos">Todos los estados</option>
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
            <Plus size={15} /> Nuevo Vehículo
          </button>
        </div>

        {/* ── ACTIVE FILTERS ── */}
        {activeFiltersCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 11, color: C.textLight }}>
              Mostrando <strong>{filteredVehiculos.length}</strong> resultado{filteredVehiculos.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={clearFilters}
              style={{
                fontSize: 11, fontWeight: 600, color: C.primary,
                background: "none", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
              }}
            >
              <X size={12} /> Limpiar filtros
            </button>
          </div>
        )}

        {/* ── GRID ── */}
        {filteredVehiculos.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "3rem 1rem", borderRadius: 16, border: `2px dashed ${C.border}`,
            background: "#fff", color: C.textLight,
          }}>
            <Car size={36} color={C.border} style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron vehículos</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o registra uno nuevo</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
            gap: 12,
          }}>
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
                    borderRadius: 14, border: `1px solid ${C.border}`,
                    background: "#fff", overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(15,23,42,.05)",
                  }}
                >
                  {/* stripe */}
                  <div style={{ height: 3, background: tipoStyle.dot }} />

                  {/* header */}
                  <div style={{ padding: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div
                        style={{
                          width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                          background: tipoStyle.bg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <TipoIcon size={24} color={tipoStyle.text} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <p style={{ fontSize: 16, fontWeight: 900, color: C.text, letterSpacing: 0.5 }}>
                            {vehiculo.placa}
                          </p>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                            background: tipoStyle.bg, color: tipoStyle.text,
                          }}>
                            {tipoStyle.label}
                          </span>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                            background: activo ? "rgba(57,169,0,.1)" : "rgba(156,163,175,.12)",
                            color: activo ? C.primaryDark : C.textLight,
                          }}>
                            {vehiculo.estado}
                          </span>
                        </div>
                        <p style={{ fontSize: 11, color: C.textLight }}>
                          {vehiculo.marca} {vehiculo.modelo} · {vehiculo.año}
                        </p>
                      </div>
                    </div>

                    {/* detalles */}
                    <div style={{
                      display: "flex", flexWrap: "wrap", gap: 8,
                      padding: "10px 0", marginBottom: 8,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.text }}>
                        <Palette size={12} color={C.textLight} />
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{
                            width: 12, height: 12, borderRadius: 3,
                            background: vehiculo.color.toLowerCase(),
                            border: `1px solid ${C.border}`,
                          }} />
                          {vehiculo.color}
                        </div>
                      </div>
                    </div>

                    {/* conductor */}
                    {usuario && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 10px", borderRadius: 10,
                        background: "#F8FAFC", border: `1px solid ${C.border}`,
                        marginBottom: 8,
                      }}>
                        <UserCircle2 size={14} color={C.textLight} />
                        <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>
                          {usuario.nombre}
                        </span>
                        <span style={{ fontSize: 10, color: C.textLight }}>
                          {usuario.identificacion}
                        </span>
                      </div>
                    )}

                    {/* descripción */}
                    {vehiculo.descripcion && (
                      <p style={{ fontSize: 10, color: C.textLight, marginBottom: 8, lineHeight: 1.4 }}>
                        {vehiculo.descripcion}
                      </p>
                    )}
                  </div>

                  {/* footer actions */}
                  <div style={{
                    borderTop: `1px solid ${C.border}`, padding: "8px 12px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    {/* switch estado */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button
                        onClick={() => handleChangeEstado(vehiculo.id, activo ? "inactivo" : "activo")}
                        style={{
                          width: 36, height: 20, borderRadius: 999,
                          background: activo ? C.primary : "#CBD5E1",
                          border: "none", cursor: "pointer", position: "relative",
                          transition: "background .2s",
                        }}
                      >
                        <div style={{
                          width: 16, height: 16, borderRadius: "50%",
                          background: "#fff", position: "absolute", top: 2,
                          left: activo ? 18 : 2, transition: "left .2s",
                        }} />
                      </button>
                      <span style={{ fontSize: 11, fontWeight: 600, color: C.textLight }}>
                        {activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        className="action-btn"
                        title="Ver detalle"
                        onClick={() => { setViewingVehiculo(vehiculo); setViewOpen(true); }}
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
                        onClick={() => openEdit(vehiculo)}
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
                        onClick={() => handleDelete(vehiculo)}
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
                </div>
              );
            })}
          </div>
        )}
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
                  Registro de vehículo
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                  {editingVehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}
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
              {/* Conductor */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Conductor *
                </label>
                <select
                  value={formData.conductorId}
                  onChange={(e) => setFormData({ ...formData, conductorId: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                >
                  <option value="">Seleccionar conductor...</option>
                  {conductores.map((conductor) => {
                    const usuario = usuarios.find((u) => u.id === conductor.usuarioId);
                    return (
                      <option key={conductor.id} value={conductor.id}>
                        {usuario?.nombre} - {usuario?.identificacion}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Placa */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Placa *
                </label>
                <input
                  type="text"
                  placeholder="ABC123"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC", textTransform: "uppercase",
                  }}
                />
              </div>

              {/* Tipo */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
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
                          flex: 1, padding: "10px", borderRadius: 11, fontSize: 12,
                          fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                          border: isSelected ? "1px solid transparent" : `1px solid ${C.border}`,
                          background: isSelected ? "rgba(57,169,0,.1)" : "#F8FAFC",
                          color: isSelected ? C.primaryDark : C.textLight,
                          textTransform: "capitalize",
                        }}
                      >
                        {tipo === "carro" ? "🚗 Carro" : "🏍️ Moto"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Marca */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Marca *
                </label>
                <input
                  type="text"
                  placeholder="Toyota, Yamaha..."
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                />
              </div>

              {/* Modelo */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Modelo *
                </label>
                <input
                  type="text"
                  placeholder="Corolla, FZ..."
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                />
              </div>

              {/* Año */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Año *
                </label>
                <input
                  type="number"
                  value={formData.año}
                  onChange={(e) => setFormData({ ...formData, año: Number(e.target.value) })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                />
              </div>

              {/* Color */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Color *
                </label>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="Rojo, Azul..."
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{
                      flex: 1, padding: "11px 14px", borderRadius: 11,
                      border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                      fontFamily: "inherit", background: "#F8FAFC",
                    }}
                  />
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: formData.color.toLowerCase() || "#ccc",
                    border: `1px solid ${C.border}`,
                  }} />
                </div>
              </div>

              {/* Descripción */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Descripción
                </label>
                <textarea
                  rows={3}
                  placeholder="Características adicionales del vehículo..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC", resize: "none",
                  }}
                />
              </div>

              {/* Estado */}
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px", borderRadius: 11, background: "#F8FAFC", border: `1px solid ${C.border}`,
                }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Estado del vehículo</p>
                    <p style={{ fontSize: 10, color: C.textLight }}>Controla la disponibilidad en el sistema</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, estado: formData.estado === "activo" ? "inactivo" : "activo" })}
                    style={{
                      width: 40, height: 22, borderRadius: 999,
                      background: formData.estado === "activo" ? C.primary : "#CBD5E1",
                      border: "none", cursor: "pointer", position: "relative",
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", background: "#fff",
                      position: "absolute", top: 2, left: formData.estado === "activo" ? 20 : 2,
                      transition: "left .2s",
                    }} />
                  </button>
                </div>
              </div>
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
              {editingVehiculo ? "Actualizar Vehículo" : "Registrar Vehículo"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL VER DETALLE ── */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} maxWidth={450}>
        {viewingVehiculo && (() => {
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
                      <TipoIcon size={24} />
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
                  <h2 style={{ marginTop: 14, fontSize: 24, fontWeight: 900, lineHeight: 1, letterSpacing: 0.5 }}>
                    {viewingVehiculo.placa}
                  </h2>
                  <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                      background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
                    }}>
                      {tipoStyle.label}
                    </span>
                    <span style={{
                      padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                      background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
                    }}>
                      {viewingVehiculo.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: "1.4rem 1.8rem" }}>
                {[
                  { label: "Marca", value: viewingVehiculo.marca, icon: GaugeCircle },
                  { label: "Modelo", value: viewingVehiculo.modelo, icon: GaugeCircle },
                  { label: "Año", value: viewingVehiculo.año, icon: Calendar },
                  { label: "Color", value: viewingVehiculo.color, icon: Palette },
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

                {/* Conductor */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 12,
                  background: "#F8FAFC", border: `1px solid ${C.border}`,
                  marginBottom: 8,
                }}>
                  <UserCircle2 size={14} color={C.textLight} />
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      Conductor
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                      {usuario ? `${usuario.nombre} - ${usuario.identificacion}` : "Sin conductor"}
                    </div>
                  </div>
                </div>

                {viewingVehiculo.descripcion && (
                  <div style={{
                    padding: "10px 12px", borderRadius: 12,
                    background: "#F8FAFC", border: `1px solid ${C.border}`,
                    marginBottom: 8,
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                      Descripción
                    </div>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4 }}>
                      {viewingVehiculo.descripcion}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => openEdit(viewingVehiculo)}
                  style={{
                    marginTop: 12, width: "100%", padding: "12px 20px", borderRadius: 12,
                    border: "none", background: tipoStyle.dot, color: "#fff",
                    fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
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
    </>
  );
}