import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  ArrowLeftRight,
  Search,
  LogIn,
  LogOut as LogOutIcon,
  Car,
  MapPin,
  X,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useData, ControlSalida } from '../context/DataContext';

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
  maxWidth = 580,
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

/* ─── Badge component inline ─── */
function BadgeInline({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "warning" | "info" }) {
  const styles = {
    default: { background: "#F1F5F9", color: C.textLight, border: C.border },
    success: { background: "#DCFCE7", color: "#166534", border: "#BBF7D0" },
    warning: { background: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
    info: { background: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE" },
  };
  const style = styles[variant];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
      background: style.background, color: style.color, border: `1px solid ${style.border}`,
    }}>
      {children}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT - Control de Entrada y Salida (estilo Roles)
══════════════════════════════════════════════════════ */
export function ControlSalidaPage() {
  const {
    controlesSalida,
    addControlSalida,
    updateControlSalida,
    vehiculos,
    celdas,
    conductores,
    usuarios,
    parqueaderos,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'en_parqueadero' | 'finalizado'>('todos');

  const [formData, setFormData] = useState({
    vehiculoId: '',
    celdaId: '',
    fechaEntrada: new Date().toISOString().slice(0, 16),
    fechaSalida: '',
    estado: 'en_parqueadero' as 'en_parqueadero' | 'finalizado',
  });

  /* ─── helpers ─── */
  const getVehiculo = (vehiculoId: string) => vehiculos.find((v) => v.id === vehiculoId);
  const getCelda = (celdaId: string) => celdas.find((c) => c.id === celdaId);
  const getParqueadero = (parqueaderoId: string) => parqueaderos.find((p) => p.id === parqueaderoId);
  
  const getConductorVehiculo = (vehiculoId: string) => {
    const vehiculo = getVehiculo(vehiculoId);
    if (!vehiculo) return null;
    return conductores.find((c) => c.id === vehiculo.conductorId);
  };

  const getUsuarioConductor = (vehiculoId: string) => {
    const conductor = getConductorVehiculo(vehiculoId);
    if (!conductor) return null;
    return usuarios.find((u) => u.id === conductor.usuarioId);
  };

  /* ─── stats ─── */
  const celdasDisponibles = celdas.filter((c) => c.estado === 'disponible');
  const vehiculosEnParqueadero = controlesSalida.filter((c) => c.estado === 'en_parqueadero');
  const vehiculosSalidos = controlesSalida.filter((c) => c.estado === 'finalizado');

  /* ─── filtered list ─── */
  const filteredControles = useMemo(() =>
    controlesSalida.filter((control) => {
      const vehiculo = getVehiculo(control.vehiculoId);
      const celda = getCelda(control.celdaId);
      const usuario = getUsuarioConductor(control.vehiculoId);
      
      const q = search.toLowerCase();
      const matchesSearch =
        vehiculo?.placa.toLowerCase().includes(q) ||
        celda?.numero.toLowerCase().includes(q) ||
        usuario?.nombre.toLowerCase().includes(q) ||
        usuario?.identificacion.includes(q);
      const matchesEstado = filterEstado === 'todos' ? true : control.estado === filterEstado;
      return matchesSearch && matchesEstado;
    }),
    [controlesSalida, search, filterEstado]
  );

  /* ─── handlers ─── */
  const openCreate = () => {
    setFormData({
      vehiculoId: '',
      celdaId: '',
      fechaEntrada: new Date().toISOString().slice(0, 16),
      fechaSalida: '',
      estado: 'en_parqueadero',
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.vehiculoId) { toast.error("Selecciona un vehículo"); return; }
    if (!formData.celdaId) { toast.error("Selecciona una celda"); return; }
    
    addControlSalida(formData);
    toast.success('Entrada registrada exitosamente');
    setDialogOpen(false);
  };

  const handleRegistrarSalida = (id: string) => {
    const now = new Date().toISOString().slice(0, 16);
    updateControlSalida(id, {
      fechaSalida: now,
      estado: 'finalizado',
    });
    toast.success('Salida registrada exitosamente');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .control-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .control-row{ transition:background .15s; }
        .control-row:hover{ background:#F8FAF8; }
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

      <div className="control-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

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
                <ArrowLeftRight size={11} /> Movimiento de vehículos
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
                Entrada y Salida
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
                Registra y gestiona el flujo de vehículos en el parqueadero institucional.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, minWidth: 280 }}>
              {[
                { label: "En parqueadero", value: vehiculosEnParqueadero.length, icon: LogIn },
                { label: "Salidas", value: vehiculosSalidos.length, icon: LogOutIcon },
                { label: "Celdas libres", value: celdasDisponibles.length, icon: MapPin },
                { label: "Total registros", value: controlesSalida.length, icon: Clock },
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
              placeholder="Buscar por placa, celda o conductor..."
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
            <option value="en_parqueadero">En parqueadero</option>
            <option value="finalizado">Finalizados</option>
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
            <Plus size={15} /> Registrar Entrada
          </button>
        </div>

        {/* ── RESULT HINT ── */}
        {(search || filterEstado !== "todos") && (
          <p style={{ fontSize: 11, color: C.textLight }}>
            Mostrando <strong>{filteredControles.length}</strong> registro{filteredControles.length !== 1 ? "s" : ""}
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
            gridTemplateColumns: "minmax(180px,1fr) minmax(160px,1fr) 100px minmax(160px,1fr) 170px 170px 100px 100px",
            background: "#F8FAF8",
            borderBottom: `1px solid ${C.border}`,
            padding: "12px 16px",
            fontSize: 11, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            <div>Vehículo</div>
            <div>Conductor</div>
            <div>Celda</div>
            <div>Parqueadero</div>
            <div>Entrada</div>
            <div>Salida</div>
            <div>Estado</div>
            <div style={{ textAlign: "right" }}>Acciones</div>
          </div>

          {/* Tabla body */}
          <div style={{ maxHeight: "calc(100vh - 400px)", overflowY: "auto" }}>
            {filteredControles.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "48px 24px", color: C.textLight,
              }}>
                <ArrowLeftRight size={36} color={C.border} style={{ marginBottom: 12 }} />
                <p style={{ fontWeight: 600, fontSize: 13 }}>No se encontraron registros</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros o registra una entrada</p>
              </div>
            ) : (
              filteredControles.map((control) => {
                const vehiculo = getVehiculo(control.vehiculoId);
                const celda = getCelda(control.celdaId);
                const usuario = getUsuarioConductor(control.vehiculoId);
                const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;
                const esActivo = control.estado === 'en_parqueadero';

                return (
                  <div
                    key={control.id}
                    className="control-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(180px,1fr) minmax(160px,1fr) 100px minmax(160px,1fr) 170px 170px 100px 100px",
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
                        <div style={{ fontWeight: 800, color: C.text }}>{vehiculo?.placa}</div>
                        <div style={{ fontSize: 10, color: C.textLight }}>{vehiculo?.marca} {vehiculo?.modelo}</div>
                      </div>
                    </div>

                    {/* Conductor */}
                    <div>
                      <div style={{ fontWeight: 600, color: C.text }}>{usuario?.nombre || "—"}</div>
                      <div style={{ fontSize: 10, color: C.textLight }}>{usuario?.identificacion}</div>
                    </div>

                    {/* Celda */}
                    <div>
                      <span style={{
                        padding: "2px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700,
                        background: "#F1F5F9", color: C.textLight,
                      }}>
                        {celda?.numero}
                      </span>
                    </div>

                    {/* Parqueadero */}
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={12} color={C.textLight} />
                      <span style={{ fontSize: 11, color: C.text }}>{parqueadero?.nombre || "—"}</span>
                    </div>

                    {/* Entrada */}
                    <div style={{ fontSize: 11, color: C.text }}>
                      {new Date(control.fechaEntrada).toLocaleString('es-CO')}
                    </div>

                    {/* Salida */}
                    <div style={{ fontSize: 11, color: control.fechaSalida ? C.text : C.textLight }}>
                      {control.fechaSalida ? new Date(control.fechaSalida).toLocaleString('es-CO') : "—"}
                    </div>

                    {/* Estado */}
                    <div>
                      {esActivo ? (
                        <BadgeInline variant="info">
                          <LogIn size={10} /> En parqueadero
                        </BadgeInline>
                      ) : (
                        <BadgeInline variant="default">
                          <CheckCircle2 size={10} /> Finalizado
                        </BadgeInline>
                      )}
                    </div>

                    {/* Acciones */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      {esActivo && (
                        <button
                          onClick={() => handleRegistrarSalida(control.id)}
                          style={{
                            padding: "6px 14px", borderRadius: 10,
                            border: `1px solid ${C.primary}30`,
                            background: "transparent",
                            color: C.primary, fontSize: 11, fontWeight: 700,
                            cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", gap: 6,
                            transition: "all .15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = C.primary;
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = C.primary;
                          }}
                        >
                          <LogOutIcon size={13} />
                          Registrar Salida
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer count */}
          {filteredControles.length > 0 && (
            <div style={{
              padding: "10px 16px", borderTop: `1px solid ${C.border}`,
              background: "#F8FAF8", fontSize: 11, color: C.textLight,
            }}>
              Mostrando <strong>{filteredControles.length}</strong> de <strong>{controlesSalida.length}</strong> registros
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL REGISTRAR ENTRADA ── */}
      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={580}>
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
                <LogIn size={18} color={C.primary} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>
                  Movimiento de vehículos
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                  Registrar Entrada
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
          <div style={{ padding: "1.4rem 1.8rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Vehículo */}
              <div>
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
                  {vehiculos.map((v) => {
                    const conductor = conductores.find((c) => c.id === v.conductorId);
                    const usuario = conductor ? usuarios.find((u) => u.id === conductor.usuarioId) : null;
                    return (
                      <option key={v.id} value={v.id}>
                        {v.placa} — {v.marca} {v.modelo} ({usuario?.nombre || "Sin conductor"})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Celda */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Celda disponible *
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
                  {celdasDisponibles.map((c) => {
                    const parq = parqueaderos.find((p) => p.id === c.parqueaderoId);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.numero} — {parq?.nombre} ({c.tipo})
                      </option>
                    );
                  })}
                </select>
                {celdasDisponibles.length === 0 && (
                  <p style={{ fontSize: 10, color: "#EF4444", marginTop: 4 }}>
                    No hay celdas disponibles. Por favor libera alguna celda primero.
                  </p>
                )}
              </div>

              {/* Fecha entrada */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Fecha y hora de entrada *
                </label>
                <input
                  type="datetime-local"
                  value={formData.fechaEntrada}
                  onChange={(e) => setFormData({ ...formData, fechaEntrada: e.target.value })}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                />
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
              Registrar Entrada
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}