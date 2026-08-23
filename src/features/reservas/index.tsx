import React, { useMemo, useState } from "react";

import {
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
  AlertCircle,
} from "lucide-react";

import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useReservas, useRemoveReserva } from "@/services/hooks/useReservas";
import type { Reserva } from "@/services/reservas";
import { useUpdateCelda } from "@/services/hooks/useCeldas";
import type { Celda } from "@/services/celdas";
import { useVehiculos } from "@/services/hooks/useVehiculos";
import { useCeldas } from "@/services/hooks/useCeldas";
import { useConductores } from "@/services/hooks/useConductores";
import { useUsuarios } from "@/services/hooks/useUsuarios";
import { useParqueaderos } from "@/services/hooks/useParqueaderos";
import { theme } from "@/theme";
import { Modal } from "@/components/shared";

/* ─── Paleta compartida (src/theme.ts) ─── */
const C = theme;

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

const todayStr = () => new Date().toISOString().split("T")[0];

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT - Reservas (estilo Roles)
══════════════════════════════════════════════════════ */
export function Reservas() {
  const navigate = useNavigate();
  const { data: reservas = [] } = useReservas();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: celdas = [] } = useCeldas();
  const { data: conductores = [] } = useConductores();
  const { data: usuarios = [] } = useUsuarios();
  const { data: parqueaderos = [] } = useParqueaderos();
  const removeReservaMutation = useRemoveReserva();
  const updateCeldaMutation = useUpdateCelda();
  const deleteReserva = (id: string) => removeReservaMutation.mutate(id);
  const updateCelda = (id: string, data: Partial<Omit<Celda, "id">>) => updateCeldaMutation.mutate({ id, data });

  const [viewOpen, setViewOpen] = useState(false);
  const [viewingReserva, setViewingReserva] = useState<Reserva | null>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | EstadoReserva>("todos");
  const [confirmDelete, setConfirmDelete] = useState<Reserva | null>(null);

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

  /* ── Stats ──────────────────────────────────────────── */
  const counts = {
    pendiente: reservas.filter(r => r.estado === "pendiente").length,
    activa: reservas.filter(r => r.estado === "activa").length,
    completada: reservas.filter(r => r.estado === "completada").length,
    cancelada: reservas.filter(r => r.estado === "cancelada").length,
  };

  /* ── Filtered data ──────────────────────────────────── */
  const filteredReservas = useMemo(() => {
    return reservas
      .filter(reserva => {
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
      })
      .sort((a, b) => {
        // Más próximas primero (fecha + hora de inicio)
        const da = `${a.fechaReserva} ${a.horaInicio}`;
        const db = `${b.fechaReserva} ${b.horaInicio}`;
        return da.localeCompare(db);
      });
  }, [reservas, search, filterEstado]);

  /* ── Handlers ───────────────────────────────────────── */
  const handleDelete = (reserva: Reserva) => {
    setConfirmDelete(reserva);
  };

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    // Si la reserva seguía activa, libera la celda al eliminar el registro
    if (confirmDelete.estado === "pendiente" || confirmDelete.estado === "activa") {
      updateCelda(confirmDelete.celdaId, { estado: "disponible" });
    }
    deleteReserva(confirmDelete.id);
    toast.success("Reserva eliminada correctamente");
    setConfirmDelete(null);
  };

  const activeFiltersCount = [search, filterEstado !== "todos" ? filterEstado : ""].filter(Boolean).length;
  const clearFilters = () => { setSearch(""); setFilterEstado("todos"); };

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
                Historial de reservas de celdas. Para crear o cancelar una reserva, hazlo desde la celda en el módulo de Parqueaderos.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, minWidth: 280 }}>
              {[
                { label: "Pendientes", value: counts.pendiente, estado: "pendiente", icon: Clock3 },
                { label: "Activas", value: counts.activa, estado: "activa", icon: CheckCircle2 },
                { label: "Completadas", value: counts.completada, estado: "completada", icon: Calendar },
                { label: "Canceladas", value: counts.cancelada, estado: "cancelada", icon: XCircle },
              ].map((s) => {
                const isActive = filterEstado === s.estado;
                return (
                  <div
                    key={s.label}
                    className="stat-card"
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    onClick={() => setFilterEstado(isActive ? "todos" : s.estado as EstadoReserva)}
                    onKeyDown={(e) => { if (e.key === "Enter") setFilterEstado(isActive ? "todos" : s.estado as EstadoReserva); }}
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
              aria-label="Buscar reserva"
              placeholder="Buscar por placa, conductor, celda o fecha..."
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
                onClick={() => setSearch("")}
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
          <div>
            {filteredReservas.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "48px 24px", color: C.textLight,
              }}>
                <Calendar size={36} color={C.border} style={{ marginBottom: 12 }} />
                <p style={{ fontWeight: 600, fontSize: 13 }}>No se encontraron reservas</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>Prueba con otros filtros. Las reservas se crean desde el módulo de Parqueaderos.</p>
              </div>
            ) : (
              filteredReservas.map((reserva) => {
                const vehiculo = getVehiculo(reserva.vehiculoId);
                const celda = getCelda(reserva.celdaId);
                const usuario = getUsuarioConductor(reserva.vehiculoId);
                const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;
                const cfg = ESTADO_CONFIG[reserva.estado as EstadoReserva];
                const esPasada = reserva.fechaReserva < todayStr() && reserva.estado !== "completada" && reserva.estado !== "cancelada";

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
                      {esPasada && (
                        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                          <AlertCircle size={9} color={C.danger} />
                          <span style={{ fontSize: 9, color: C.danger, fontWeight: 700 }}>Vencida</span>
                        </div>
                      )}
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
                        aria-label="Ver detalle de la reserva"
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
                        title="Eliminar"
                        aria-label="Eliminar reserva"
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
                  { label: "Conductor", value: usuario ? `${usuario.nombre} · ${usuario.identificacion}` : "Sin conductor", icon: UserCircle2, onClick: usuario ? () => navigate(`/app/conductores?q=${encodeURIComponent(usuario.nombre)}`) : undefined },
                  { label: "Vehículo", value: vehiculo?.placa || "—", icon: Car, onClick: undefined },
                  { label: "Celda", value: celda ? `Celda ${celda.numero}` : "—", icon: MapPin, onClick: celda ? () => navigate(`/app/parqueaderos?q=${encodeURIComponent(celda.numero)}`) : undefined },
                  { label: "Parqueadero", value: parqueadero?.nombre || "—", icon: MapPin, onClick: parqueadero ? () => navigate(`/app/parqueaderos?q=${encodeURIComponent(celda?.numero || parqueadero.nombre)}`) : undefined },
                  { label: "Fecha de reserva", value: viewingReserva.fechaReserva, icon: Calendar, onClick: undefined },
                  { label: "Horario", value: `${viewingReserva.horaInicio} – ${viewingReserva.horaFin}`, icon: Clock, onClick: undefined },
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
            ¿Eliminar reserva?
          </h3>
          <p style={{ fontSize: 12, color: C.textLight, marginBottom: 20, lineHeight: 1.5 }}>
            La reserva del vehículo <strong>{confirmDelete ? getVehiculo(confirmDelete.vehiculoId)?.placa || "—" : ""}</strong>{" "}
            para el {confirmDelete?.fechaReserva} se eliminará permanentemente. Esta acción no se puede revertir.
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