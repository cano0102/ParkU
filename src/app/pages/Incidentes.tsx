import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  MapPin,
  Car,
  User,
  Clock,
  X,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '../context/DataContext';

/* ─── Paleta (misma que Roles) ─── */
const C = {
  primary:     "#39A900",
  primaryDark: "#2D7D00",
  text:        "#0F172A",
  textLight:   "#64748B",
  border:      "#E2E8F0",
  bg:          "#F5F7F8",
  danger:      "#EF4444",
  warning:     "#F59E0B",
  success:     "#22C55E",
};

/* ─── Tipo de estado ─── */
type EstadoIncidente = 'resuelto' | 'pendiente';
type Incidente = {
  id: string;
  descripcion: string;
  parqueadero: string;
  vehiculo?: string;
  evidencia?: string;
  fecha: string;
  estado: EstadoIncidente;
  asignadoA?: string;
};

/* ─── Configuración de estado ─── */
const ESTADO_CONFIG: Record<EstadoIncidente, {
  bg: string; text: string; border: string; dot: string; label: string; icon: React.ReactNode;
}> = {
  pendiente: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", label: "Pendiente", icon: <AlertTriangle size={10} /> },
  resuelto:  { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0", dot: "#22C55E", label: "Resuelto", icon: <CheckCircle size={10} /> },
};

/* ─── Modal reutilizable ─── */
function Modal({
  open,
  onClose,
  children,
  maxWidth = 640,
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
function EstadoBadgeInline({ estado }: { estado: EstadoIncidente }) {
  const cfg = ESTADO_CONFIG[estado];
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
   MAIN COMPONENT - Incidentes (estilo Roles)
══════════════════════════════════════════════════════ */
export function Incidentes() {
  const { parqueaderos, vehiculos } = useData();

  // Estado local con datos de ejemplo (en producción vendrían de useData)
  const [incidentes, setIncidentes] = useState<Incidente[]>([
    {
      id: '1',
      descripcion: 'Vehículo mal estacionado bloqueando entrada',
      parqueadero: 'Parqueadero Principal',
      vehiculo: 'ABC123',
      fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      estado: 'pendiente',
      asignadoA: 'Juan Pérez',
    },
    {
      id: '2',
      descripcion: 'Luminaria averiada en zona norte',
      parqueadero: 'Parqueadero Norte',
      fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      estado: 'resuelto',
    },
    {
      id: '3',
      descripcion: 'Derrame de aceite en celda B-15',
      parqueadero: 'Parqueadero Principal',
      vehiculo: 'XYZ789',
      fecha: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      estado: 'pendiente',
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | EstadoIncidente>('todos');
  const [selectedIncidente, setSelectedIncidente] = useState<Incidente | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    descripcion: '',
    parqueadero: '',
    vehiculo: '',
    evidencia: '',
    asignadoA: '',
  });

  /* ─── Stats ──────────────────────────────────────────── */
  const pendientes = incidentes.filter(i => i.estado === 'pendiente').length;
  const resueltos = incidentes.filter(i => i.estado === 'resuelto').length;
  const conEvidencia = incidentes.filter(i => i.evidencia).length;

  /* ─── Handlers ───────────────────────────────────────── */
  const resetForm = () => {
    setFormData({ descripcion: '', parqueadero: '', vehiculo: '', evidencia: '', asignadoA: '' });
    setIsEditing(false);
    setSelectedIncidente(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (incidente: Incidente) => {
    setSelectedIncidente(incidente);
    setFormData({
      descripcion: incidente.descripcion,
      parqueadero: incidente.parqueadero,
      vehiculo: incidente.vehiculo || '',
      evidencia: incidente.evidencia || '',
      asignadoA: incidente.asignadoA || '',
    });
    setIsEditing(true);
    setViewOpen(false);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.descripcion || !formData.parqueadero) {
      toast.error('Descripción y Parqueadero son obligatorios');
      return;
    }

    if (isEditing && selectedIncidente) {
      setIncidentes(incidentes.map(inc =>
        inc.id === selectedIncidente.id ? { ...inc, ...formData, vehiculo: formData.vehiculo || undefined } : inc
      ));
      toast.success('Incidente actualizado correctamente');
    } else {
      const nuevo: Incidente = {
        id: Date.now().toString(),
        ...formData,
        vehiculo: formData.vehiculo || undefined,
        evidencia: formData.evidencia || undefined,
        asignadoA: formData.asignadoA || undefined,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
      };
      setIncidentes([nuevo, ...incidentes]);
      toast.success('Incidente registrado correctamente');
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (incidente: Incidente) => {
    if (confirm(`¿Eliminar el incidente?`)) {
      setIncidentes(incidentes.filter(i => i.id !== incidente.id));
      toast.success('Incidente eliminado');
    }
  };

  const toggleEstado = (id: string) => {
    setIncidentes(incidentes.map(inc =>
      inc.id === id
        ? { ...inc, estado: inc.estado === 'resuelto' ? 'pendiente' : 'resuelto' }
        : inc
    ));
    toast.success('Estado del incidente actualizado');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, evidencia: reader.result as string });
      };
      reader.readAsDataURL(file);
      toast.success('Evidencia cargada');
    }
  };

  /* ─── Filtered data ──────────────────────────────────── */
  const filteredIncidentes = useMemo(() =>
    incidentes.filter(inc => {
      const q = search.toLowerCase();
      const matchesSearch =
        inc.descripcion.toLowerCase().includes(q) ||
        inc.parqueadero.toLowerCase().includes(q) ||
        (inc.vehiculo && inc.vehiculo.toLowerCase().includes(q));
      const matchesEstado = filterEstado === 'todos' ? true : inc.estado === filterEstado;
      return matchesSearch && matchesEstado;
    }),
    [incidentes, search, filterEstado]
  );

  const activeFiltersCount = [search, filterEstado !== 'todos' ? filterEstado : ''].filter(Boolean).length;
  const clearFilters = () => { setSearch(''); setFilterEstado('todos'); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .incidentes-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .incidente-card{ transition:box-shadow .18s,transform .18s; }
        .incidente-card:hover{ box-shadow:0 8px 28px rgba(15,23,42,.1); transform:translateY(-1px); }
        .action-btn{ transition:background .15s,color .15s; }
        .action-btn:hover{ background:#F1F5F9 !important; color:#0F172A !important; }
        .delete-btn:hover{ background:#FEE2E2 !important; color:#DC2626 !important; }
        input:focus,textarea:focus,select:focus{
          outline:none;
          border-color:${C.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
      `}</style>

      <div className="incidentes-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

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
                <ShieldAlert size={11} /> Seguridad operativa
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
                Incidentes y Novedades
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
                Gestiona y haz seguimiento a los incidentes reportados en el parqueadero institucional.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, minWidth: 280 }}>
              {[
                { label: "Pendientes", value: pendientes, icon: AlertTriangle, color: C.warning },
                { label: "Resueltos", value: resueltos, icon: CheckCircle, color: C.success },
                { label: "Con evidencia", value: conEvidencia, icon: ImageIcon, color: C.primary },
                { label: "Total", value: incidentes.length, icon: ShieldAlert, color: "#fff" },
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
              placeholder="Buscar incidente por descripción, parqueadero o placa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px 10px 36px", borderRadius: 11,
                border: `1px solid ${C.border}`, fontSize: 13, background: "#fff",
                fontFamily: "inherit",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: C.textLight,
                }}
              >
                <X size={14} />
              </button>
            )}
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
            <option value="resuelto">Resueltos</option>
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
              <X size={14} /> Limpiar filtros
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
            <Plus size={15} /> Registrar Incidente
          </button>
        </div>

        {/* ── RESULT HINT ── */}
        {activeFiltersCount > 0 && (
          <p style={{ fontSize: 11, color: C.textLight }}>
            Mostrando <strong>{filteredIncidentes.length}</strong> incidente{filteredIncidentes.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* ── GRID DE INCIDENTES ── */}
        {filteredIncidentes.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "3rem 1rem", borderRadius: 16, border: `2px dashed ${C.border}`,
            background: "#fff", color: C.textLight,
          }}>
            <AlertTriangle size={36} color={C.border} style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, fontSize: 13 }}>No se encontraron incidentes</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o registra uno nuevo</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(360px,1fr))",
            gap: 12,
          }}>
            {filteredIncidentes.map((incidente) => {
              const cfg = ESTADO_CONFIG[incidente.estado];
              const fecha = new Date(incidente.fecha);

              return (
                <div
                  key={incidente.id}
                  className="incidente-card"
                  style={{
                    borderRadius: 14, border: `1px solid ${C.border}`,
                    background: "#fff", overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(15,23,42,.05)",
                  }}
                >
                  {/* stripe */}
                  <div style={{ height: 3, background: incidente.estado === 'resuelto' ? C.success : C.warning }} />

                  {/* header */}
                  <div style={{ padding: "14px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <div
                        style={{
                          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                          background: `${cfg.bg}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {incidente.estado === 'resuelto' ? (
                          <CheckCircle size={24} color={C.success} />
                        ) : (
                          <AlertTriangle size={24} color={C.warning} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 6 }}>
                          {incidente.descripcion}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          <EstadoBadgeInline estado={incidente.estado} />
                          {incidente.evidencia && (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                              background: "#F1F5F9", color: C.textLight,
                            }}>
                              <ImageIcon size={10} /> Evidencia
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* detalles */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text }}>
                        <MapPin size={12} color={C.textLight} />
                        <span>{incidente.parqueadero}</span>
                      </div>
                      {incidente.vehiculo && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text }}>
                          <Car size={12} color={C.textLight} />
                          <span>{incidente.vehiculo}</span>
                        </div>
                      )}
                      {incidente.asignadoA && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text }}>
                          <User size={12} color={C.textLight} />
                          <span>{incidente.asignadoA}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: C.textLight }}>
                        <Clock size={10} />
                        <span>{fecha.toLocaleDateString('es-CO')} · {fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* footer actions */}
                    <div style={{
                      borderTop: `1px solid ${C.border}`, paddingTop: 12,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      {/* switch estado */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => toggleEstado(incidente.id)}
                          style={{
                            width: 36, height: 20, borderRadius: 999,
                            background: incidente.estado === 'resuelto' ? C.success : C.warning,
                            border: "none", cursor: "pointer", position: "relative",
                            transition: "background .2s",
                          }}
                        >
                          <div style={{
                            width: 16, height: 16, borderRadius: "50%",
                            background: "#fff", position: "absolute", top: 2,
                            left: incidente.estado === 'resuelto' ? 18 : 2,
                            transition: "left .2s",
                          }} />
                        </button>
                        <span style={{ fontSize: 11, fontWeight: 600, color: C.textLight }}>
                          {incidente.estado === 'resuelto' ? "Resuelto" : "Pendiente"}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          className="action-btn"
                          title="Ver detalle"
                          onClick={() => { setSelectedIncidente(incidente); setViewOpen(true); }}
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
                          onClick={() => openEdit(incidente)}
                          style={{
                            width: 28, height: 28, borderRadius: 7,
                            border: "none", background: "transparent",
                            color: C.textLight, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          className="delete-btn"
                          title="Eliminar"
                          onClick={() => handleDelete(incidente)}
                          style={{
                            width: 28, height: 28, borderRadius: 7,
                            border: "none", background: "transparent",
                            color: C.danger, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL CREAR / EDITAR ── */}
      <Modal open={dialogOpen} onClose={() => { setDialogOpen(false); resetForm(); }} maxWidth={640}>
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
                  Reporte de incidente
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                  {isEditing ? "Editar Incidente" : "Nuevo Incidente"}
                </h2>
              </div>
            </div>
            <button
              onClick={() => { setDialogOpen(false); resetForm(); }}
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
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Descripción */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Descripción *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe el incidente o novedad..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC", resize: "none",
                  }}
                />
              </div>

              {/* Parqueadero */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Parqueadero *
                </label>
                <select
                  value={formData.parqueadero}
                  onChange={(e) => setFormData({ ...formData, parqueadero: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                >
                  <option value="">Seleccionar parqueadero...</option>
                  {parqueaderos.map((p) => (
                    <option key={p.id} value={p.nombre}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Vehículo */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Vehículo (opcional)
                </label>
                <select
                  value={formData.vehiculo}
                  onChange={(e) => setFormData({ ...formData, vehiculo: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                >
                  <option value="">Ninguno</option>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.placa}>
                      {v.placa} — {v.marca} {v.modelo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asignado a */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Asignar a
                </label>
                <input
                  type="text"
                  placeholder="Nombre del responsable"
                  value={formData.asignadoA}
                  onChange={(e) => setFormData({ ...formData, asignadoA: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                />
              </div>

              {/* Evidencia fotográfica */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Evidencia fotográfica
                </label>
                <div style={{
                  borderRadius: 11, border: `2px dashed ${C.border}`,
                  background: "#F8FAFC", overflow: "hidden",
                  transition: "border-color .2s",
                }}>
                  <input
                    type="file"
                    id="evidencia"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="evidencia" style={{ cursor: "pointer", display: "block" }}>
                    {formData.evidencia ? (
                      <div style={{ padding: "12px", textAlign: "center" }}>
                        <img
                          src={formData.evidencia}
                          alt="Evidencia"
                          style={{ maxHeight: 120, margin: "0 auto", borderRadius: 8 }}
                        />
                        <p style={{ fontSize: 11, color: C.primary, marginTop: 8 }}>Evidencia cargada ✓</p>
                      </div>
                    ) : (
                      <div style={{ padding: "24px", textAlign: "center" }}>
                        <Upload size={32} color={C.textLight} style={{ margin: "0 auto 8px" }} />
                        <p style={{ fontSize: 12, color: C.textLight }}>Toca para cargar imagen de evidencia</p>
                      </div>
                    )}
                  </label>
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
              onClick={() => { setDialogOpen(false); resetForm(); }}
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
              {isEditing ? "Actualizar Incidente" : "Registrar Incidente"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL VER DETALLE ── */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)} maxWidth={480}>
        {selectedIncidente && (() => {
          const cfg = ESTADO_CONFIG[selectedIncidente.estado];
          const fecha = new Date(selectedIncidente.fecha);

          return (
            <div>
              <div
                style={{
                  padding: "1.6rem 1.8rem 1.4rem",
                  background: `linear-gradient(135deg, ${selectedIncidente.estado === 'resuelto' ? C.success : C.warning}, ${selectedIncidente.estado === 'resuelto' ? C.success : C.warning}cc)`,
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
                      {selectedIncidente.estado === 'resuelto' ? (
                        <CheckCircle size={24} />
                      ) : (
                        <AlertTriangle size={24} />
                      )}
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
                  <h2 style={{ marginTop: 12, fontSize: 18, fontWeight: 800, lineHeight: 1.3 }}>
                    {selectedIncidente.descripcion}
                  </h2>
                  <div style={{ marginTop: 10 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                      background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: "1.4rem 1.8rem" }}>
                {[
                  { label: "Parqueadero", value: selectedIncidente.parqueadero, icon: MapPin },
                  { label: "Fecha y hora", value: fecha.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }), icon: Clock },
                  ...(selectedIncidente.vehiculo ? [{ label: "Vehículo", value: selectedIncidente.vehiculo, icon: Car }] : []),
                  ...(selectedIncidente.asignadoA ? [{ label: "Asignado a", value: selectedIncidente.asignadoA, icon: User }] : []),
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

                {selectedIncidente.evidencia && (
                  <div style={{
                    padding: "10px 12px", borderRadius: 12,
                    background: "#F8FAFC", border: `1px solid ${C.border}`,
                    marginBottom: 8,
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                      Evidencia fotográfica
                    </div>
                    <img
                      src={selectedIncidente.evidencia}
                      alt="Evidencia"
                      style={{ width: "100%", borderRadius: 10 }}
                    />
                  </div>
                )}

                <button
                  onClick={() => openEdit(selectedIncidente)}
                  style={{
                    marginTop: 12, width: "100%", padding: "12px 20px", borderRadius: 12,
                    border: "none", background: C.primary, color: "#fff",
                    fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: `0 6px 18px ${C.primary}33`,
                  }}
                >
                  <Edit size={14} />
                  Editar incidente
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}