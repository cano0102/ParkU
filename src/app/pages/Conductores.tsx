import React, { useMemo, useState, useEffect } from "react";

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
  Hash,
  Palette,
  CalendarDays,
  UserCheck,
  User,
  Lock,
} from "lucide-react";

import { toast } from "sonner";
import { useData, Conductor } from "../context/DataContext";

/* ─── Paleta (misma que Roles) ─── */
const C = {
  primary:     "#39A900",
  primaryDark: "#2D7D00",
  text:        "#0F172A",
  textLight:   "#64748B",
  border:      "#E2E8F0",
  bg:          "#F5F7F8",
};

/* ─── Avatar helpers ─── */
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

/* ─── Tipo conductor style ─── */
function getTipoStyle(tipo: string) {
  return tipo === "instructor"
    ? { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB", label: "Instructor", icon: GraduationCap }
    : { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", label: "Aprendiz", icon: BookOpen };
}

/* ─── Modal reutilizable (mismo que Roles) ─── */
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
   MAIN COMPONENT - Conductores (estilo Roles)
══════════════════════════════════════════════════════ */
export function Conductores() {
  const {
    conductores, addConductor, updateConductor, deleteConductor,
    usuarios, vehiculos, addVehiculo, updateVehiculo, deleteVehiculo,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null);
  const [viewingConductor, setViewingConductor] = useState<Conductor | null>(null);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");

  const [formData, setFormData] = useState({
    usuarioId: "",
    tipoConductor: "aprendiz" as "aprendiz" | "instructor",
    centroFormacion: "",
    discapacidad: false,
    tipoDiscapacidad: "",
    estado: "activo" as "activo" | "inactivo",
    placa: "",
    tipoVehiculo: "carro" as "carro" | "moto",
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    color: "",
    descripcion: "",
  });

  /* ─── helpers ─── */
  const getUsuario = (id: string) => usuarios.find((u) => u.id === id);
  const getVehiculosConductor = (id: string) => vehiculos.filter((v) => v.conductorId === id);

  /* ─── stats ─── */
  const totalActivos = conductores.filter((c) => c.estado === "activo").length;
  const totalInstructores = conductores.filter((c) => c.tipoConductor === "instructor").length;
  const totalAprendices = conductores.filter((c) => c.tipoConductor === "aprendiz").length;
  const totalVehiculos = vehiculos.length;

  /* ─── filtered list ─── */
  const filteredConductores = useMemo(() =>
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
    [conductores, search, filterTipo, filterEstado]
  );

  /* ─── handlers ─── */
  const openCreate = () => {
    setEditingConductor(null);
    setFormData({
      usuarioId: "", tipoConductor: "aprendiz", centroFormacion: "",
      discapacidad: false, tipoDiscapacidad: "", estado: "activo",
      placa: "", tipoVehiculo: "carro", marca: "", modelo: "",
      año: new Date().getFullYear(), color: "", descripcion: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (conductor: Conductor) => {
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
      tipoVehiculo: v?.tipo || "carro",
      marca: v?.marca || "",
      modelo: v?.modelo || "",
      año: v?.año || new Date().getFullYear(),
      color: v?.color || "",
      descripcion: v?.descripcion || "",
    });
    setViewOpen(false);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.usuarioId) { toast.error("Selecciona un usuario"); return; }
    if (!formData.centroFormacion) { toast.error("El centro de formación es requerido"); return; }

    const conductorData = {
      usuarioId: formData.usuarioId,
      tipoConductor: formData.tipoConductor,
      centroFormacion: formData.centroFormacion,
      discapacidad: formData.discapacidad,
      tipoDiscapacidad: formData.tipoDiscapacidad,
      estado: formData.estado,
    };

    if (editingConductor) {
      updateConductor(editingConductor.id, conductorData);
      
      // Actualizar vehículo asociado
      const existingVehiculo = vehiculos.find((v) => v.conductorId === editingConductor.id);
      if (existingVehiculo) {
        updateVehiculo(existingVehiculo.id, {
          placa: formData.placa,
          tipo: formData.tipoVehiculo,
          marca: formData.marca,
          modelo: formData.modelo,
          año: formData.año,
          color: formData.color,
          descripcion: formData.descripcion,
          estado: "activo",
        });
      } else if (formData.placa) {
        addVehiculo({
          conductorId: editingConductor.id,
          placa: formData.placa,
          tipo: formData.tipoVehiculo,
          marca: formData.marca,
          modelo: formData.modelo,
          año: formData.año,
          color: formData.color,
          descripcion: formData.descripcion,
          estado: "activo",
        });
      }
      toast.success("Conductor actualizado correctamente");
    } else {
      addConductor(conductorData);
      // Pequeño delay para obtener el ID del nuevo conductor
      setTimeout(() => {
        const nuevoConductor = conductores[conductores.length - 1];
        if (nuevoConductor && formData.placa) {
          addVehiculo({
            conductorId: nuevoConductor.id,
            placa: formData.placa,
            tipo: formData.tipoVehiculo,
            marca: formData.marca,
            modelo: formData.modelo,
            año: formData.año,
            color: formData.color,
            descripcion: formData.descripcion,
            estado: "activo",
          });
        }
      }, 100);
      toast.success("Conductor creado correctamente");
    }
    setDialogOpen(false);
  };

  const handleDelete = (conductor: Conductor) => {
    if (confirm(`¿Eliminar al conductor "${getUsuario(conductor.usuarioId)?.nombre}"?`)) {
      deleteConductor(conductor.id);
      toast.success("Conductor eliminado");
    }
  };

  const handleChangeEstado = (id: string, nuevoEstado: "activo" | "inactivo") => {
    updateConductor(id, { estado: nuevoEstado });
    toast.success(`Conductor ${nuevoEstado === "activo" ? "activado" : "desactivado"}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .conductores-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .conductor-card{ transition:box-shadow .18s,transform .18s; }
        .conductor-card:hover{ box-shadow:0 8px 28px rgba(15,23,42,.1); transform:translateY(-1px); }
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

      <div className="conductores-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

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
                <ShieldCheck size={11} /> Gestión de conductores
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
                Gestión de Conductores
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
                Administra conductores, aprendices, instructores y vehículos autorizados del sistema SENA.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, minWidth: 280 }}>
              {[
                { label: "Activos", value: totalActivos, icon: UserCheck },
                { label: "Instructores", value: totalInstructores, icon: GraduationCap },
                { label: "Aprendices", value: totalAprendices, icon: BookOpen },
                { label: "Vehículos", value: totalVehiculos, icon: Car },
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
              placeholder="Buscar conductor, identificación o centro..."
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
            <option value="aprendiz">Aprendiz</option>
            <option value="instructor">Instructor</option>
          </select>

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
            <Plus size={15} /> Nuevo Conductor
          </button>
        </div>

        {/* ── RESULT HINT ── */}
        {(search || filterTipo !== "todos" || filterEstado !== "todos") && (
          <p style={{ fontSize: 11, color: C.textLight }}>
            Mostrando <strong>{filteredConductores.length}</strong> resultado{filteredConductores.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* ── GRID ── */}
        {filteredConductores.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "3rem 1rem", borderRadius: 16, border: `2px dashed ${C.border}`,
            background: "#fff", color: C.textLight,
          }}>
            <User size={36} color={C.border} style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron conductores</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o registra uno nuevo</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
            gap: 12,
          }}>
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
                          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                          background: `linear-gradient(135deg, ${g1}, ${g2})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 900, fontSize: 16,
                        }}
                      >
                        {initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.2 }}>
                          {usuario.nombre}
                        </p>
                        <p style={{ fontSize: 10, color: C.textLight, marginTop: 2 }}>
                          {usuario.tipoDocumento} · {usuario.identificacion}
                        </p>
                        <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                            background: tipoStyle.bg, color: tipoStyle.text,
                            display: "flex", alignItems: "center", gap: 3,
                          }}>
                            <TipoIcon size={10} />
                            {tipoStyle.label}
                          </span>
                          <span style={{
                            fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                            background: activo ? "rgba(57,169,0,.1)" : "rgba(156,163,175,.12)",
                            color: activo ? C.primaryDark : C.textLight,
                          }}>
                            {conductor.estado}
                          </span>
                          {conductor.discapacidad && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                              background: "#F3E8FF", color: "#9333EA",
                              display: "flex", alignItems: "center", gap: 3,
                            }}>
                              <Accessibility size={10} />
                              Discapacidad
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* centro formación */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 10px", borderRadius: 10,
                      background: "#F8FAFC", border: `1px solid ${C.border}`,
                      marginBottom: 12,
                    }}>
                      <Building2 size={13} color={C.textLight} />
                      <span style={{ fontSize: 11, color: C.text }}>{conductor.centroFormacion || "—"}</span>
                    </div>

                    {/* vehículos */}
                    {vehiculosCond.length > 0 && (
                      <div>
                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: C.textLight, textTransform: "uppercase", marginBottom: 8 }}>
                          Vehículos registrados
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {vehiculosCond.map((v) => (
                            <div
                              key={v.id}
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "8px 10px", borderRadius: 10,
                                background: "#F8FAFC", border: `1px solid ${C.border}`,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{
                                  width: 28, height: 28, borderRadius: 8,
                                  background: `${g1}15`, display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                  {v.tipo === "moto" ? <Bike size={14} color={g1} /> : <Car size={14} color={g1} />}
                                </div>
                                <div>
                                  <p style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{v.placa}</p>
                                  <p style={{ fontSize: 9, color: C.textLight }}>{v.marca} {v.modelo} · {v.color}</p>
                                </div>
                              </div>
                              <span style={{
                                fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                                background: `${g1}15`, color: g1, textTransform: "capitalize",
                              }}>
                                {v.tipo}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
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
                        onClick={() => handleChangeEstado(conductor.id, activo ? "inactivo" : "activo")}
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
                        onClick={() => { setViewingConductor(conductor); setViewOpen(true); }}
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
                        onClick={() => openEdit(conductor)}
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
                        onClick={() => handleDelete(conductor)}
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
      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={780}>
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
                  Registro de conductor
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                  {editingConductor ? "Editar Conductor" : "Nuevo Conductor"}
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
            {/* Datos del conductor */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.textLight, textTransform: "uppercase", marginBottom: 12 }}>
                Datos del conductor
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Usuario (full width) */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                    Usuario vinculado *
                  </label>
                  <select
                    value={formData.usuarioId}
                    onChange={(e) => setFormData({ ...formData, usuarioId: e.target.value })}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 11,
                      border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                      fontFamily: "inherit", background: "#F8FAFC",
                    }}
                  >
                    <option value="">Seleccionar usuario...</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>{u.nombre} — {u.identificacion}</option>
                    ))}
                  </select>
                </div>

                {/* Tipo conductor */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                    Tipo de conductor
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["aprendiz", "instructor"] as const).map((tipo) => {
                      const isSelected = formData.tipoConductor === tipo;
                      return (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setFormData({ ...formData, tipoConductor: tipo })}
                          style={{
                            flex: 1, padding: "10px", borderRadius: 11, fontSize: 12,
                            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                            border: isSelected ? "1px solid transparent" : `1px solid ${C.border}`,
                            background: isSelected ? "rgba(57,169,0,.1)" : "#F8FAFC",
                            color: isSelected ? C.primaryDark : C.textLight,
                            textTransform: "capitalize",
                          }}
                        >
                          {tipo}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Centro formación */}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                    Centro de formación *
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Centro de Tecnología"
                    value={formData.centroFormacion}
                    onChange={(e) => setFormData({ ...formData, centroFormacion: e.target.value })}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 11,
                      border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                      fontFamily: "inherit", background: "#F8FAFC",
                    }}
                  />
                </div>
              </div>

              {/* Discapacidad */}
              <div style={{
                marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px", borderRadius: 11, background: "#F8FAFC", border: `1px solid ${C.border}`,
              }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>¿Tiene alguna discapacidad?</p>
                  <p style={{ fontSize: 10, color: C.textLight }}>Activa para registrar el tipo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, discapacidad: !formData.discapacidad })}
                  style={{
                    width: 40, height: 22, borderRadius: 999,
                    background: formData.discapacidad ? C.primary : "#CBD5E1",
                    border: "none", cursor: "pointer", position: "relative",
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 2, left: formData.discapacidad ? 20 : 2,
                    transition: "left .2s",
                  }} />
                </button>
              </div>

              {formData.discapacidad && (
                <div style={{ marginTop: 12 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                    Tipo de discapacidad
                  </label>
                  <input
                    type="text"
                    placeholder="ej. Visual, Motriz, Auditiva…"
                    value={formData.tipoDiscapacidad}
                    onChange={(e) => setFormData({ ...formData, tipoDiscapacidad: e.target.value })}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 11,
                      border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                      fontFamily: "inherit", background: "#F8FAFC",
                    }}
                  />
                </div>
              )}

              {/* Estado */}
              <div style={{
                marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px", borderRadius: 11, background: "#F8FAFC", border: `1px solid ${C.border}`,
              }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>Estado del conductor</p>
                  <p style={{ fontSize: 10, color: C.textLight }}>Activa o desactiva el acceso al sistema</p>
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

            {/* Vehículo asociado (solo en creación o si no tiene) */}
            {(!editingConductor || !vehiculos.find(v => v.conductorId === editingConductor?.id)) && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: C.textLight, textTransform: "uppercase", marginBottom: 12 }}>
                  Vehículo asociado
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                      Placa
                    </label>
                    <input
                      type="text"
                      placeholder="ABC-123"
                      value={formData.placa}
                      onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 11,
                        border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                        fontFamily: "inherit", background: "#F8FAFC", textTransform: "uppercase",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                      Tipo de vehículo
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {(["carro", "moto"] as const).map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setFormData({ ...formData, tipoVehiculo: tipo })}
                          style={{
                            flex: 1, padding: "10px", borderRadius: 11, fontSize: 12,
                            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                            border: formData.tipoVehiculo === tipo ? "1px solid transparent" : `1px solid ${C.border}`,
                            background: formData.tipoVehiculo === tipo ? "rgba(57,169,0,.1)" : "#F8FAFC",
                            color: formData.tipoVehiculo === tipo ? C.primaryDark : C.textLight,
                          }}
                        >
                          {tipo === "carro" ? "🚗 Carro" : "🏍️ Moto"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                      Marca
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Chevrolet"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 11,
                        border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                        fontFamily: "inherit", background: "#F8FAFC",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                      Modelo
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Spark"
                      value={formData.modelo}
                      onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 11,
                        border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                        fontFamily: "inherit", background: "#F8FAFC",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                      Año
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

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                      Color
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Rojo"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 11,
                        border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                        fontFamily: "inherit", background: "#F8FAFC",
                      }}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                      Descripción adicional
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Observaciones sobre el vehículo…"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      style={{
                        width: "100%", padding: "11px 14px", borderRadius: 11,
                        border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                        fontFamily: "inherit", background: "#F8FAFC", resize: "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
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
              {editingConductor ? "Actualizar Conductor" : "Crear Conductor"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL VER DETALLE ── */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} maxWidth={450}>
        {viewingConductor && (() => {
          const c = viewingConductor;
          const usuario = getUsuario(c.usuarioId);
          const vehs = getVehiculosConductor(c.id);
          if (!usuario) return null;

          const [g1, g2] = getAvatarGradient(usuario.nombre);
          const initials = getInitials(usuario.nombre);
          const tipoStyle = getTipoStyle(c.tipoConductor);
          const TipoIcon = tipoStyle.icon;

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
                        fontSize: 22, fontWeight: 900,
                      }}
                    >
                      {initials}
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
                  <h2 style={{ marginTop: 14, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{usuario.nombre}</h2>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 4 }}>
                    {usuario.tipoDocumento} · {usuario.identificacion}
                  </p>
                  <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{
                      padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                      background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
                      display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <TipoIcon size={10} /> {tipoStyle.label}
                    </span>
                    <span style={{
                      padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                      background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
                    }}>
                      {c.estado}
                    </span>
                    {c.discapacidad && (
                      <span style={{
                        padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                        background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <Accessibility size={10} /> Discapacidad
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ padding: "1.4rem 1.8rem" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px", borderRadius: 12,
                  background: "#F8FAFC", border: `1px solid ${C.border}`,
                  marginBottom: 16,
                }}>
                  <Building2 size={16} color={C.textLight} />
                  <span style={{ fontSize: 13, color: C.text }}>{c.centroFormacion || "—"}</span>
                </div>

                {c.discapacidad && c.tipoDiscapacidad && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "12px", borderRadius: 12,
                    background: "#F3E8FF", border: `1px solid #E9D5FF`,
                    marginBottom: 16,
                  }}>
                    <Accessibility size={16} color="#9333EA" />
                    <span style={{ fontSize: 13, color: "#9333EA" }}>{c.tipoDiscapacidad}</span>
                  </div>
                )}

                {vehs.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: C.textLight, textTransform: "uppercase", marginBottom: 8 }}>
                      Vehículos registrados
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {vehs.map((v) => (
                        <div
                          key={v.id}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 12px", borderRadius: 12,
                            background: "#F8FAFC", border: `1px solid ${C.border}`,
                          }}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: `${g1}15`, display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            {v.tipo === "moto" ? <Bike size={16} color={g1} /> : <Car size={16} color={g1} />}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{v.placa}</p>
                            <p style={{ fontSize: 10, color: C.textLight }}>{v.marca} {v.modelo} · {v.color}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => openEdit(c)}
                  style={{
                    width: "100%", padding: "12px 20px", borderRadius: 12,
                    border: "none", background: g1, color: "#fff",
                    fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
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
    </>
  );
}