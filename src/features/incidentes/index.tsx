import React, { useState, useMemo } from 'react';
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
  ParkingCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useParqueaderos } from '@/services/hooks/useParqueaderos';
import { useCeldas } from '@/services/hooks/useCeldas';
import { useVehiculos } from '@/services/hooks/useVehiculos';
import { useConductores } from '@/services/hooks/useConductores';
import {
  useIncidentes,
  useCreateIncidente,
  useUpdateIncidente,
  useRemoveIncidente,
} from '@/services/hooks/useIncidentes';
import type { Celda } from '@/services/celdas';
import type { Incidente } from '@/services/incidentes';
import { theme } from '@/theme';
import { Modal } from '@/components/shared';

/* ─── Paleta compartida (src/theme.ts) ─── */
const C = theme;

const MAX_EVIDENCIA_MB = 5;

/* ─── Config visual del estado de celda (mismo modelo que el módulo de Parqueaderos/Celdas) ─── */
const CELDA_ESTADO_CONFIG: Record<Celda['estado'], { bg: string; text: string; border: string; label: string }> = {
  disponible:    { bg: "#F0FBE8", text: "#2F6B00", border: "#A8D888", label: "Disponible" },
  no_disponible: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5", label: "Ocupada" },
  reservada:     { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A", label: "Reservada" },
  mantenimiento: { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", label: "Mantenimiento" },
};

/* ─── Tipo de estado del incidente ─── */
type EstadoIncidente = 'resuelto' | 'pendiente';

/* ─── Configuración de estado del incidente ─── */
const ESTADO_CONFIG: Record<EstadoIncidente, {
  bg: string; text: string; border: string; dot: string; label: string; icon: React.ReactNode;
}> = {
  pendiente: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", label: "Pendiente", icon: <AlertTriangle size={10} /> },
  resuelto:  { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0", dot: "#22C55E", label: "Resuelto", icon: <CheckCircle size={10} /> },
};

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

/* ─── Badge de celda inline (usa la paleta del módulo de Parqueaderos/Celdas) ─── */
function CeldaBadgeInline({ numero, estado }: { numero: string; estado?: Celda['estado'] }) {
  const cfg = estado ? CELDA_ESTADO_CONFIG[estado] : { bg: "#F1F5F9", text: C.textLight, border: C.border, label: "" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
      background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
    }}>
      <ParkingCircle size={10} />
      Celda {numero}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT - Incidentes (estilo Roles)
══════════════════════════════════════════════════════ */
export function Incidentes() {
  const navigate = useNavigate();
  const { data: parqueaderos = [] } = useParqueaderos();
  const { data: celdas = [] } = useCeldas();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: conductores = [] } = useConductores();
  const { data: incidentes = [] } = useIncidentes();
  const createIncidenteMutation = useCreateIncidente();
  const updateIncidenteMutation = useUpdateIncidente();
  const removeIncidenteMutation = useRemoveIncidente();
  const addIncidente = (data: Omit<Incidente, 'id'>) => createIncidenteMutation.mutate(data);
  const updateIncidente = (id: string, data: Partial<Omit<Incidente, 'id'>>) =>
    updateIncidenteMutation.mutate({ id, data });
  const deleteIncidente = (id: string) => removeIncidenteMutation.mutate(id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | EstadoIncidente>('todos');
  const [selectedIncidente, setSelectedIncidente] = useState<Incidente | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Incidente | null>(null);

  const [formData, setFormData] = useState({
    descripcion: '',
    parqueaderoId: '',
    celdaId: '',
    vehiculo: '',
    asignadoA: '',
    evidencia: '',
    notasResolucion: '',
  });

  /* ─── Lookups rápidos hacia el módulo de Parqueaderos/Celdas ─── */
  const parqueaderoPorId = useMemo(() => new Map(parqueaderos.map((p) => [p.id, p])), [parqueaderos]);
  const celdaPorId = useMemo(() => new Map(celdas.map((c) => [c.id, c])), [celdas]);

  const nombreParqueadero = (id: string) => parqueaderoPorId.get(id)?.nombre ?? '—';
  const celdaDe = (id?: string) => (id ? celdaPorId.get(id) : undefined);

  const ocupanteDeCelda = (celdaId?: string) => {
    if (!celdaId) return null;
    const veh = vehiculos.find((v) => v.celdaId === celdaId);
    if (!veh) return null;
    const cond = conductores.find((c) => c.id === veh.conductorId);
    return { vehiculo: veh, conductorNombre: cond?.nombre };
  };

  const celdasDelParqueadero = useMemo(
    () => celdas.filter((c) => c.parqueaderoId === formData.parqueaderoId),
    [celdas, formData.parqueaderoId]
  );
  const ocupanteSeleccionado = ocupanteDeCelda(formData.celdaId);

  /* ─── Stats ──────────────────────────────────────────── */
  const pendientes = incidentes.filter(i => i.estado === 'pendiente').length;
  const resueltos = incidentes.filter(i => i.estado === 'resuelto').length;
  const conEvidencia = incidentes.filter(i => i.evidencia).length;

  /* ─── Handlers ───────────────────────────────────────── */
  const resetForm = () => {
    setFormData({ descripcion: '', parqueaderoId: '', celdaId: '', vehiculo: '', asignadoA: '', evidencia: '', notasResolucion: '' });
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
      parqueaderoId: incidente.parqueaderoId,
      celdaId: incidente.celdaId || '',
      vehiculo: incidente.vehiculo || '',
      asignadoA: incidente.asignadoA || '',
      evidencia: incidente.evidencia || '',
      notasResolucion: incidente.notasResolucion || '',
    });
    setIsEditing(true);
    setViewOpen(false);
    setDialogOpen(true);
  };

  const handleParqueaderoChange = (parqueaderoId: string) => {
    setFormData({ ...formData, parqueaderoId, celdaId: '' });
  };

  const handleCeldaChange = (celdaId: string) => {
    const ocupante = ocupanteDeCelda(celdaId);
    setFormData({
      ...formData,
      celdaId,
      vehiculo: ocupante ? ocupante.vehiculo.placa : formData.vehiculo,
    });
  };

  const handleSave = () => {
    if (!formData.descripcion || !formData.parqueaderoId) {
      toast.error('Descripción y Parqueadero son obligatorios');
      return;
    }

    if (isEditing && selectedIncidente) {
      updateIncidente(selectedIncidente.id, {
        ...formData,
        celdaId: formData.celdaId || undefined,
        vehiculo: formData.vehiculo || undefined,
        notasResolucion: formData.notasResolucion || undefined,
      });
      toast.success('Incidente actualizado correctamente');
    } else {
      addIncidente({
        ...formData,
        celdaId: formData.celdaId || undefined,
        vehiculo: formData.vehiculo || undefined,
        notasResolucion: formData.notasResolucion || undefined,
        fecha: new Date().toISOString(),
        estado: 'pendiente',
      });
      toast.success('Incidente registrado correctamente');
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (incidente: Incidente) => {
    setConfirmDelete(incidente);
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    deleteIncidente(confirmDelete.id);
    toast.success('Incidente eliminado');
    setConfirmDelete(null);
  };

  const toggleEstado = (id: string) => {
    const incidente = incidentes.find(i => i.id === id);
    if (incidente) {
      updateIncidente(id, {
        estado: incidente.estado === 'resuelto' ? 'pendiente' : 'resuelto'
      });
      toast.success('Estado del incidente actualizado');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }

    if (file.size > MAX_EVIDENCIA_MB * 1024 * 1024) {
      toast.error(`La imagen no debe superar ${MAX_EVIDENCIA_MB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, evidencia: reader.result as string });
      toast.success('Evidencia cargada');
    };
    reader.onerror = () => toast.error('No se pudo cargar la imagen');
    reader.readAsDataURL(file);
  };

  const removeEvidencia = () => {
    setFormData({ ...formData, evidencia: '' });
  };

  /* ─── Filtered + sorted data ─────────────────────────── */
  const filteredIncidentes = useMemo(() =>
    incidentes
      .filter(inc => {
        const q = search.toLowerCase();
        const pqNombre = nombreParqueadero(inc.parqueaderoId).toLowerCase();
        const celdaNumero = celdaDe(inc.celdaId)?.numero.toLowerCase() ?? '';
        const matchesSearch =
          inc.descripcion.toLowerCase().includes(q) ||
          pqNombre.includes(q) ||
          celdaNumero.includes(q) ||
          (inc.vehiculo && inc.vehiculo.toLowerCase().includes(q));
        const matchesEstado = filterEstado === 'todos' ? true : inc.estado === filterEstado;
        return matchesSearch && matchesEstado;
      })
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [incidentes, search, filterEstado, parqueaderoPorId, celdaPorId]
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
        select:disabled{ opacity:.55; cursor:not-allowed; }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }

        @media (max-width: 640px) {
          .incidentes-hero-stats { grid-template-columns: repeat(2, 1fr) !important; min-width: 0 !important; }
        }
        @media (max-width: 480px) {
          .incidentes-form-grid { grid-template-columns: 1fr !important; }
        }
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

            <div className="incidentes-hero-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, minWidth: 280, maxWidth: 420 }}>
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
              aria-label="Buscar incidente"
              placeholder="Buscar por descripción, parqueadero, celda o placa..."
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
                aria-label="Limpiar búsqueda"
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
            aria-label="Filtrar por estado"
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
              const celdaObj = celdaDe(incidente.celdaId);

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
                  <div style={{ height: 3, background: incidente.estado === 'resuelto' ? C.success : C.warning }} />

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
                          {celdaObj && (
                            <CeldaBadgeInline numero={celdaObj.numero} estado={celdaObj.estado} />
                          )}
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

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text }}>
                        <MapPin size={12} color={C.textLight} />
                        <span>
                          {nombreParqueadero(incidente.parqueaderoId)}
                          {celdaObj && <> · Celda <strong>{celdaObj.numero}</strong></>}
                        </span>
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

                    <div style={{
                      borderTop: `1px solid ${C.border}`, paddingTop: 12,
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          onClick={() => toggleEstado(incidente.id)}
                          role="switch"
                          aria-checked={incidente.estado === 'resuelto'}
                          aria-label={`Marcar incidente como ${incidente.estado === 'resuelto' ? 'pendiente' : 'resuelto'}`}
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
                          aria-label="Ver detalle del incidente"
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
                          aria-label="Editar incidente"
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
                          aria-label="Eliminar incidente"
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
              aria-label="Cerrar"
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

          <div style={{ padding: "1.4rem 1.8rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label htmlFor="descripcion" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Descripción *
                </label>
                <textarea
                  id="descripcion"
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

              <div className="incidentes-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label htmlFor="parqueadero" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                    Parqueadero *
                  </label>
                  <select
                    id="parqueadero"
                    value={formData.parqueaderoId}
                    onChange={(e) => handleParqueaderoChange(e.target.value)}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 11,
                      border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                      fontFamily: "inherit", background: "#F8FAFC",
                    }}
                  >
                    <option value="">Seleccionar parqueadero...</option>
                    {parqueaderos.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="celda" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                    Celda
                  </label>
                  <select
                    id="celda"
                    value={formData.celdaId}
                    onChange={(e) => handleCeldaChange(e.target.value)}
                    disabled={!formData.parqueaderoId || celdasDelParqueadero.length === 0}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 11,
                      border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                      fontFamily: "inherit", background: "#F8FAFC",
                    }}
                  >
                    <option value="">
                      {formData.parqueaderoId ? "Sin celda específica" : "Elige un parqueadero primero"}
                    </option>
                    {celdasDelParqueadero.map((c) => {
                      const ocupante = ocupanteDeCelda(c.id);
                      return (
                        <option key={c.id} value={c.id}>
                          {c.numero} · {CELDA_ESTADO_CONFIG[c.estado].label}
                          {ocupante ? ` (${ocupante.vehiculo.placa})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {formData.celdaId && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: -8 }}>
                  <CeldaBadgeInline
                    numero={celdaDe(formData.celdaId)?.numero ?? ''}
                    estado={celdaDe(formData.celdaId)?.estado}
                  />
                  {ocupanteSeleccionado && (
                    <span style={{ fontSize: 11, color: C.textLight }}>
                      Ocupada por <strong>{ocupanteSeleccionado.vehiculo.placa}</strong>
                      {ocupanteSeleccionado.conductorNombre ? ` — ${ocupanteSeleccionado.conductorNombre}` : ''}
                    </span>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="vehiculo" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Vehículo (opcional)
                </label>
                <select
                  id="vehiculo"
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
                <p style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>
                  Si seleccionas una celda ocupada, la placa se sugiere automáticamente.
                </p>
              </div>

              <div>
                <label htmlFor="asignadoA" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Asignar a
                </label>
                <input
                  id="asignadoA"
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

              {isEditing && selectedIncidente?.estado === 'resuelto' && (
                <div>
                  <label htmlFor="notasResolucion" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                    Notas de resolución
                  </label>
                  <textarea
                    id="notasResolucion"
                    rows={2}
                    placeholder="¿Qué se hizo para resolver el incidente?"
                    value={formData.notasResolucion}
                    onChange={(e) => setFormData({ ...formData, notasResolucion: e.target.value })}
                    style={{
                      width: "100%", padding: "11px 14px", borderRadius: 11,
                      border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                      fontFamily: "inherit", background: "#F8FAFC", resize: "none",
                    }}
                  />
                </div>
              )}

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
                  {formData.evidencia ? (
                    <div style={{ padding: "12px", textAlign: "center", position: "relative" }}>
                      <button
                        onClick={removeEvidencia}
                        aria-label="Quitar evidencia"
                        style={{
                          position: "absolute", top: 8, right: 8,
                          width: 24, height: 24, borderRadius: 7,
                          border: "none", background: "rgba(15,23,42,.55)",
                          color: "#fff", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        <X size={13} />
                      </button>
                      <img
                        src={formData.evidencia}
                        alt="Evidencia"
                        style={{ maxHeight: 120, margin: "0 auto", borderRadius: 8 }}
                      />
                      <p style={{ fontSize: 11, color: C.primary, marginTop: 8 }}>Evidencia cargada ✓</p>
                    </div>
                  ) : (
                    <label htmlFor="evidencia" style={{ cursor: "pointer", display: "block" }}>
                      <div style={{ padding: "24px", textAlign: "center" }}>
                        <Upload size={32} color={C.textLight} style={{ margin: "0 auto 8px" }} />
                        <p style={{ fontSize: 12, color: C.textLight }}>Toca para cargar imagen de evidencia</p>
                        <p style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Máximo {MAX_EVIDENCIA_MB}MB</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

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
          const celdaObj = celdaDe(selectedIncidente.celdaId);

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
                      {selectedIncidente.estado === 'resuelto' ? (
                        <CheckCircle size={24} />
                      ) : (
                        <AlertTriangle size={24} />
                      )}
                    </div>
                    <button
                      onClick={() => setViewOpen(false)}
                      aria-label="Cerrar"
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
                  <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                      background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
                      {cfg.label}
                    </span>
                    {celdaObj && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                        background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
                      }}>
                        <ParkingCircle size={11} /> Celda {celdaObj.numero}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ padding: "1.4rem 1.8rem" }}>
                {[
                  { label: "Parqueadero", value: nombreParqueadero(selectedIncidente.parqueaderoId), icon: MapPin, onClick: () => navigate(`/app/parqueaderos?q=${encodeURIComponent(celdaObj?.numero || nombreParqueadero(selectedIncidente.parqueaderoId))}`) },
                  ...(celdaObj
                    ? [{ label: "Celda", value: `${celdaObj.numero} · ${CELDA_ESTADO_CONFIG[celdaObj.estado].label} actualmente`, icon: ParkingCircle, onClick: () => navigate(`/app/parqueaderos?q=${encodeURIComponent(celdaObj.numero)}`) }]
                    : []),
                  { label: "Fecha y hora", value: fecha.toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }), icon: Clock, onClick: undefined },
                  ...(selectedIncidente.vehiculo ? [{ label: "Vehículo", value: selectedIncidente.vehiculo, icon: Car, onClick: undefined }] : []),
                  ...(selectedIncidente.asignadoA ? [{ label: "Asignado a", value: selectedIncidente.asignadoA, icon: User, onClick: undefined }] : []),
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={item.onClick}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 12px", borderRadius: 12,
                      background: "#F8FAFC", border: `1px solid ${C.border}`,
                      marginBottom: 8,
                      cursor: item.onClick ? "pointer" : "default",
                    }}
                  >
                    <item.icon size={14} color={C.textLight} />
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: item.onClick ? C.primary : C.text }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}

                {selectedIncidente.notasResolucion && (
                  <div style={{
                    padding: "10px 12px", borderRadius: 12,
                    background: "#F0FDF4", border: `1px solid ${C.success}33`,
                    marginBottom: 8,
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.success, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                      Notas de resolución
                    </div>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.4 }}>
                      {selectedIncidente.notasResolucion}
                    </div>
                  </div>
                )}

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

      {/* ── MODAL CONFIRMAR ELIMINACIÓN ── */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth={380}>
        <div style={{ padding: "1.8rem" }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: "#FEE2E2",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
          }}>
            <Trash2 size={20} color={C.danger} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>
            ¿Eliminar incidente?
          </h3>
          <p style={{ fontSize: 12, color: C.textLight, marginBottom: 20, lineHeight: 1.5 }}>
            "{confirmDelete?.descripcion}" se eliminará permanentemente. Esta acción no se puede revertir.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setConfirmDelete(null)}
              style={{
                padding: "9px 16px", borderRadius: 10,
                border: `1px solid ${C.border}`, background: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                color: C.text,
              }}
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteAction}
              style={{
                padding: "9px 16px", borderRadius: 10,
                border: "none", background: C.danger, color: "#fff",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}