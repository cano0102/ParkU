/* =========================================================
   PARQUEADEROS — Versión mejorada & responsive
   ========================================================= */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Car,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  BadgeCheck,
  X,
  Camera,
  User,
  ParkingCircle,
  Shield,
  LayoutGrid,
} from "lucide-react";

/* ─── Design tokens ───────────────────────────────────── */
const C = {
  primary:      "#2F8F00",
  primaryDark:  "#1E6000",
  primaryLight: "#E8F5E1",
  primaryBorder:"#C5E0AD",
  bg:           "#F4F7F2",
  surface:      "#FFFFFF",
  text:         "#0D1F05",
  textSoft:     "#4B6642",
  textMuted:    "#8FA884",
  border:       "#E2EBD9",
  danger:       "#C92020",
  dangerBg:     "#FFF0F0",
  dangerBorder: "#FAC5C5",
};

/* ─── Celda config ────────────────────────────────────── */
type CeldaEstado = "libre" | "ocupado" | "sena";

interface Celda {
  codigo: string;
  estado: CeldaEstado;
  placa?: string;
  conductor?: string;
}

interface Parqueadero {
  id: number;
  nombre: string;
  total: number;
  celdas: Celda[];
}

const CELDA_CONFIG: Record<CeldaEstado, {
  bg: string; border: string; text: string; label: string; dotColor: string;
}> = {
  libre:   { bg: "#F0FBE8", border: "#A8D888", text: "#2F6B00", label: "Libre",    dotColor: "#4CAF50" },
  ocupado: { bg: "#1A1A1A", border: "#EF4444", text: "#FFFFFF", label: "Ocupado",  dotColor: "#EF4444" },
  sena:    { bg: "#FFFBEB", border: "#FCD34D", text: "#78350F", label: "SENA",     dotColor: "#F59E0B" },
};

/* ─── Modal wrapper ───────────────────────────────────── */
function Modal({ open, onClose, children, maxW = 480 }: {
  open: boolean; onClose: () => void; children: React.ReactNode; maxW?: number;
}) {
  if (!open) return null;
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,.45)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{
        width: "100%", maxWidth: maxW,
        background: C.surface, borderRadius: 24,
        boxShadow: "0 24px 60px rgba(0,0,0,.18)",
        overflow: "hidden",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Input / Select primitives ──────────────────────── */
const inputStyle: React.CSSProperties = {
  height: 48, width: "100%", borderRadius: 12,
  border: `1.5px solid ${C.border}`,
  padding: "0 16px", fontSize: 14, fontWeight: 500,
  color: C.text, background: C.surface,
  outline: "none", boxSizing: "border-box",
  transition: "border-color .15s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700,
  color: C.textSoft, marginBottom: 6,
  textTransform: "uppercase", letterSpacing: ".06em",
};

/* ─── Stat pill ───────────────────────────────────────── */
function StatPill({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,.15)", borderRadius: 16,
      padding: "14px 18px",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,.2)",
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.75)", letterSpacing: ".1em", textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

/* ─── Celda card ──────────────────────────────────────── */
function CeldaCard({ celda, onClick }: { celda: Celda; onClick: () => void }) {
  const cfg = CELDA_CONFIG[celda.estado];
  const isLibre = celda.estado === "libre";

  return (
    <button
      onClick={onClick}
      disabled={!isLibre}
      style={{
        background: cfg.bg,
        border: `2px ${isLibre ? "dashed" : "solid"} ${cfg.border}`,
        borderRadius: 16,
        padding: "10px 8px",
        cursor: isLibre ? "pointer" : "default",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        gap: 6,
        minHeight: 100,
        transition: "transform .15s, box-shadow .15s",
        outline: "none",
        width: "100%",
      }}
      onMouseEnter={e => {
        if (isLibre) {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.04)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(47,143,0,.18)";
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Código */}
      <span style={{ fontSize: 12, fontWeight: 900, color: cfg.text, letterSpacing: ".05em" }}>
        {celda.codigo}
      </span>

      {/* Icono */}
      <Car size={22} color={cfg.text} strokeWidth={celda.estado === "ocupado" ? 2.2 : 1.6} />

      {/* Info */}
      {celda.estado === "ocupado" ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: cfg.text }}>{celda.placa}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)", marginTop: 1, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {celda.conductor}
          </div>
        </div>
      ) : (
        <span style={{ fontSize: 9, fontWeight: 700, color: cfg.text, textTransform: "uppercase", letterSpacing: ".08em", opacity: .75 }}>
          {cfg.label}
        </span>
      )}
    </button>
  );
}

/* ─── Main component ──────────────────────────────────── */
export default function Parqueaderos() {

  /* State */
  const [parqueaderos, setParqueaderos] = useState<Parqueadero[]>([
    {
      id: 1,
      nombre: "CARRIL 01 — ZONA CENTRAL",
      total: 8,
      celdas: [
        { codigo: "A01", estado: "libre" },
        { codigo: "A02", estado: "ocupado", placa: "ABC123", conductor: "Carlos Ramirez" },
        { codigo: "A03", estado: "libre" },
        { codigo: "A04", estado: "sena" },
        { codigo: "A05", estado: "libre" },
        { codigo: "A06", estado: "libre" },
        { codigo: "A07", estado: "ocupado", placa: "XYZ987", conductor: "Laura Torres" },
        { codigo: "A08", estado: "libre" },
      ],
    },
  ]);

  const [createOpen, setCreateOpen]   = useState(false);
  const [editOpen,   setEditOpen]     = useState(false);
  const [ingresoOpen, setIngresoOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const [parqueaderoSeleccionado, setParqueaderoSeleccionado] = useState<Parqueadero | null>(null);
  const [celdaSeleccionada, setCeldaSeleccionada]             = useState<{ parqueaderoId: number; codigo: string } | null>(null);

  const [form, setForm] = useState({ nombre: "", total: 10 });
  const [vehiculoForm, setVehiculoForm] = useState({ placa: "", conductor: "" });

  const videoRef = useRef<HTMLVideoElement>(null);

  const conductores = ["Carlos Ramirez", "Laura Torres", "Andres Perez", "Maria Gomez", "Daniel Castro"];

  /* Stats */
  const stats = useMemo(() => {
    const todas = parqueaderos.flatMap(p => p.celdas);
    return {
      disponibles: todas.filter(c => c.estado === "libre").length,
      ocupados:    todas.filter(c => c.estado === "ocupado").length,
      reservados:  todas.filter(c => c.estado === "sena").length,
      total:       todas.length,
    };
  }, [parqueaderos]);

  /* Camera */
  useEffect(() => {
    if (scannerOpen) iniciarCamara();
  }, [scannerOpen]);

  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { console.error(err); }
  };

  const cerrarCamara = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
  };

  const tomarFoto = () => {
    setVehiculoForm(v => ({ ...v, placa: "ABC123" }));
    cerrarCamara();
    setScannerOpen(false);
  };

  /* CRUD */
  const handleCreate = () => {
    if (!form.nombre.trim()) return;
    const nuevo: Parqueadero = {
      id: Date.now(),
      nombre: form.nombre,
      total: form.total,
      celdas: Array.from({ length: form.total }).map((_, i) => ({
        codigo: `P${String(i + 1).padStart(2, "0")}`,
        estado: "libre",
      })),
    };
    setParqueaderos(p => [...p, nuevo]);
    setCreateOpen(false);
    setForm({ nombre: "", total: 10 });
  };

  const openEdit = (p: Parqueadero) => {
    setParqueaderoSeleccionado(p);
    setForm({ nombre: p.nombre, total: p.total });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!parqueaderoSeleccionado) return;
    setParqueaderos(prev =>
      prev.map(p => p.id === parqueaderoSeleccionado.id ? { ...p, nombre: form.nombre, total: form.total } : p)
    );
    setEditOpen(false);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("¿Eliminar parqueadero?")) return;
    setParqueaderos(p => p.filter(x => x.id !== id));
  };

  const handleClickCelda = (parqueaderoId: number, celda: Celda) => {
    if (celda.estado !== "libre") return;
    setCeldaSeleccionada({ parqueaderoId, codigo: celda.codigo });
    setVehiculoForm({ placa: "", conductor: "" });
    setIngresoOpen(true);
  };

  const registrarVehiculo = () => {
    if (!vehiculoForm.placa || !vehiculoForm.conductor || !celdaSeleccionada) return;
    setParqueaderos(prev =>
      prev.map(parq => {
        if (parq.id !== celdaSeleccionada.parqueaderoId) return parq;
        return {
          ...parq,
          celdas: parq.celdas.map(c =>
            c.codigo !== celdaSeleccionada.codigo ? c : {
              ...c, estado: "ocupado" as CeldaEstado,
              placa: vehiculoForm.placa, conductor: vehiculoForm.conductor,
            }
          ),
        };
      })
    );
    setIngresoOpen(false);
  };

  /* ── Form modal shared ──────────────────────────────── */
  const FormModal = ({ title, onSubmit, onClose, submitLabel }: {
    title: string; onSubmit: () => void; onClose: () => void; submitLabel: string;
  }) => (
    <>
      {/* Header */}
      <div style={{
        padding: "20px 24px 16px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 2 }}>
            Parqueaderos
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, margin: 0 }}>{title}</h2>
        </div>
        <button onClick={onClose} style={{
          width: 34, height: 34, borderRadius: 10,
          border: `1px solid ${C.border}`, background: C.bg,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: C.textSoft,
        }}>
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Nombre del parqueadero</label>
          <input
            style={inputStyle}
            placeholder="Ej. CARRIL 02 — ZONA NORTE"
            value={form.nombre}
            onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
            onFocus={e => (e.target.style.borderColor = C.primary)}
            onBlur={e => (e.target.style.borderColor = C.border)}
          />
        </div>
        <div>
          <label style={labelStyle}>Número de celdas</label>
          <input
            type="number"
            min={1}
            max={50}
            style={inputStyle}
            value={form.total}
            onChange={e => setForm(f => ({ ...f, total: parseInt(e.target.value) || 1 }))}
            onFocus={e => (e.target.style.borderColor = C.primary)}
            onBlur={e => (e.target.style.borderColor = C.border)}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: "14px 24px 20px",
        display: "flex", gap: 10, justifyContent: "flex-end",
      }}>
        <button onClick={onClose} style={{
          height: 42, padding: "0 20px", borderRadius: 12,
          border: `1.5px solid ${C.border}`, background: C.surface,
          fontSize: 13, fontWeight: 700, color: C.textSoft, cursor: "pointer",
        }}>
          Cancelar
        </button>
        <button onClick={onSubmit} style={{
          height: 42, padding: "0 24px", borderRadius: 12,
          border: "none", background: C.primary,
          fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer",
        }}>
          {submitLabel}
        </button>
      </div>
    </>
  );

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "16px" }}>
      <style>{`
        @media (min-width: 640px) {
          .park-hero { padding: 28px 32px !important; }
          .park-stats { grid-template-columns: repeat(4, 1fr) !important; }
          .park-hero-row { flex-direction: row !important; align-items: center !important; }
          .park-btn-new { width: auto !important; }
          .park-celdas { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .park-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .park-celdas { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (min-width: 1280px) {
          .park-celdas-lg { grid-template-columns: repeat(6, 1fr) !important; }
        }
        .park-celda-btn:disabled { cursor: default !important; }
      `}</style>

      {/* ── HERO ────────────────────────────────────────── */}
      <div className="park-hero" style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`,
        borderRadius: 24, padding: "20px 20px", marginBottom: 16,
        boxShadow: `0 12px 40px rgba(47,143,0,.25)`,
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: -40, right: -40, width: 180, height: 180,
          borderRadius: "50%", background: "rgba(255,255,255,.06)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, right: 80, width: 240, height: 240,
          borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none",
        }} />

        {/* Row: title + button */}
        <div className="park-hero-row" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20, position: "relative" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.15)", borderRadius: 99, padding: "5px 12px", marginBottom: 10 }}>
              <Shield size={12} color="rgba(255,255,255,.85)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.85)", letterSpacing: ".06em", textTransform: "uppercase" }}>
                Gestión SENA
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              Panel de Parqueaderos
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,.75)" }}>
              Gestión de celdas vehiculares en tiempo real
            </p>
          </div>
          <button
            className="park-btn-new"
            onClick={() => setCreateOpen(true)}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              height: 44, padding: "0 20px", borderRadius: 14,
              background: "#fff", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 800, color: C.primaryDark,
              boxShadow: "0 4px 14px rgba(0,0,0,.12)",
              width: "100%",
            }}
          >
            <Plus size={16} />
            Nuevo Parqueadero
          </button>
        </div>

        {/* Stats */}
        <div className="park-stats" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          <StatPill label="Disponibles" value={stats.disponibles} dot="#4CAF50" />
          <StatPill label="Ocupados"    value={stats.ocupados}    dot="#EF4444" />
          <StatPill label="Reservados"  value={stats.reservados}  dot="#F59E0B" />
          <StatPill label="Total"       value={stats.total}       dot="rgba(255,255,255,.6)" />
        </div>
      </div>

      {/* ── Leyenda ─────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {(Object.entries(CELDA_CONFIG) as [CeldaEstado, typeof CELDA_CONFIG["libre"]][]).map(([key, cfg]) => (
          <div key={key} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: C.surface, borderRadius: 99, padding: "5px 12px",
            border: `1px solid ${C.border}`,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dotColor }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.textSoft }}>{cfg.label}</span>
          </div>
        ))}
        <div style={{
          marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
          fontSize: 12, color: C.textMuted, fontWeight: 500,
        }}>
          <LayoutGrid size={13} />
          {parqueaderos.length} parqueadero{parqueaderos.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Grid de parqueaderos ────────────────────────── */}
      {parqueaderos.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          background: C.surface, borderRadius: 20, border: `1px dashed ${C.border}`,
        }}>
          <ParkingCircle size={40} color={C.textMuted} style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: C.textSoft, margin: "0 0 4px" }}>
            No hay parqueaderos registrados
          </p>
          <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
            Crea el primero con el botón de arriba
          </p>
        </div>
      ) : (
        <div className="park-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {parqueaderos.map(parqueadero => {
            const libres   = parqueadero.celdas.filter(c => c.estado === "libre").length;
            const ocupados = parqueadero.celdas.filter(c => c.estado === "ocupado").length;
            const pct      = Math.round((ocupados / parqueadero.celdas.length) * 100);

            return (
              <div key={parqueadero.id} style={{
                background: C.surface, borderRadius: 20,
                border: `1px solid ${C.border}`,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,.04)",
              }}>
                {/* Card header */}
                <div style={{
                  padding: "16px 18px 14px",
                  borderBottom: `1px solid ${C.border}`,
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <ParkingCircle size={16} color={C.primary} />
                      </div>
                      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: C.text, letterSpacing: ".01em" }}>
                        {parqueadero.nombre}
                      </h2>
                    </div>

                    {/* mini stats */}
                    <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                      {[
                        { dot: "#4CAF50", label: `${libres} libres` },
                        { dot: "#EF4444", label: `${ocupados} ocupados` },
                        { dot: "#F59E0B", label: `${parqueadero.celdas.filter(c => c.estado === "sena").length} SENA` },
                      ].map(s => (
                        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: C.textSoft }}>{s.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Occupancy bar */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ height: 4, borderRadius: 99, background: C.border, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: pct > 80 ? "#EF4444" : pct > 50 ? "#F59E0B" : C.primary,
                          borderRadius: 99, transition: "width .3s ease",
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3, fontWeight: 600 }}>
                        {pct}% de ocupación
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => openEdit(parqueadero)} style={{
                      width: 34, height: 34, borderRadius: 10,
                      border: `1px solid ${C.border}`, background: C.bg,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      color: C.textSoft,
                    }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(parqueadero.id)} style={{
                      width: 34, height: 34, borderRadius: 10,
                      border: `1px solid ${C.dangerBorder}`, background: C.dangerBg,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      color: C.danger,
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Celdas grid */}
                <div className="park-celdas park-celdas-lg" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 8, padding: 16,
                }}>
                  {parqueadero.celdas.map(celda => (
                    <CeldaCard
                      key={celda.codigo}
                      celda={celda}
                      onClick={() => handleClickCelda(parqueadero.id, celda)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal: Crear parqueadero ─────────────────────── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <FormModal
          title="Nuevo Parqueadero"
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
          submitLabel="Crear Parqueadero"
        />
      </Modal>

      {/* ── Modal: Editar parqueadero ────────────────────── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <FormModal
          title="Editar Parqueadero"
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
          submitLabel="Guardar Cambios"
        />
      </Modal>

      {/* ── Modal: Registrar vehículo ────────────────────── */}
      <Modal open={ingresoOpen} onClose={() => setIngresoOpen(false)}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 2 }}>
              Celda {celdaSeleccionada?.codigo}
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: C.text }}>
              Registrar Vehículo
            </h2>
          </div>
          <button onClick={() => setIngresoOpen(false)} style={{
            width: 34, height: 34, borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.bg,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: C.textSoft,
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Placa */}
          <div>
            <label style={labelStyle}>Matrícula</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={vehiculoForm.placa}
                onChange={e => setVehiculoForm(v => ({ ...v, placa: e.target.value.toUpperCase() }))}
                placeholder="ABC123"
                style={{ ...inputStyle, flex: 1, fontSize: 18, fontWeight: 900, letterSpacing: ".06em" }}
                onFocus={e => (e.target.style.borderColor = C.primary)}
                onBlur={e => (e.target.style.borderColor = C.border)}
              />
              <button
                onClick={() => setScannerOpen(true)}
                style={{
                  height: 48, padding: "0 16px", borderRadius: 12,
                  border: "none", background: C.text, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 7,
                  fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}
              >
                <Camera size={16} />
                <span style={{ display: "none" }} className="scan-label">Escanear</span>
              </button>
            </div>
          </div>

          {/* Conductor */}
          <div>
            <label style={labelStyle}>Conductor</label>
            <select
              value={vehiculoForm.conductor}
              onChange={e => setVehiculoForm(v => ({ ...v, conductor: e.target.value }))}
              style={{ ...inputStyle, appearance: "none" }}
            >
              <option value="">Seleccionar conductor…</option>
              {conductores.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
          <button onClick={() => setIngresoOpen(false)} style={{
            flex: 1, height: 46, borderRadius: 12,
            border: `1.5px solid ${C.border}`, background: C.surface,
            fontSize: 13, fontWeight: 700, color: C.textSoft, cursor: "pointer",
          }}>
            Cancelar
          </button>
          <button
            onClick={registrarVehiculo}
            disabled={!vehiculoForm.placa || !vehiculoForm.conductor}
            style={{
              flex: 2, height: 46, borderRadius: 12,
              border: "none",
              background: vehiculoForm.placa && vehiculoForm.conductor ? C.primary : C.border,
              fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer",
              transition: "background .2s",
            }}
          >
            Registrar Vehículo
          </button>
        </div>
      </Modal>

      {/* ── Modal: Cámara ────────────────────────────────── */}
      <Modal open={scannerOpen} onClose={() => { cerrarCamara(); setScannerOpen(false); }} maxW={720}>
        {/* Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: C.text }}>Escanear Matrícula</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textMuted }}>Simulación de captura</p>
          </div>
          <button onClick={() => { cerrarCamara(); setScannerOpen(false); }} style={{
            width: 34, height: 34, borderRadius: 10,
            border: `1px solid ${C.border}`, background: C.bg,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: C.textSoft,
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Video */}
        <div style={{ position: "relative", background: "#000", aspectRatio: "16/9" }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {/* Frame */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              width: "55%", maxWidth: 300, aspectRatio: "3/1",
              border: `3px solid ${C.primary}`,
              borderRadius: 16,
              boxShadow: "0 0 0 9999px rgba(0,0,0,.5)",
            }} />
          </div>
          {/* Corner accents */}
          {[["0", "0"], ["0", "auto"], ["auto", "0"], ["auto", "auto"]].map(([t, r], i) => (
            <div key={i} style={{
              position: "absolute",
              top: t === "0" ? 16 : "auto", bottom: t === "auto" ? 16 : "auto",
              left: r === "0" ? 16 : "auto", right: r === "auto" ? 16 : "auto",
              width: 20, height: 20,
              borderTop: t === "0" ? `3px solid ${C.primary}` : "none",
              borderBottom: t === "auto" ? `3px solid ${C.primary}` : "none",
              borderLeft: r === "0" ? `3px solid ${C.primary}` : "none",
              borderRight: r === "auto" ? `3px solid ${C.primary}` : "none",
              borderRadius: 3,
            }} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, padding: "14px 20px 20px", justifyContent: "center" }}>
          <button onClick={() => { cerrarCamara(); setScannerOpen(false); }} style={{
            height: 44, padding: "0 24px", borderRadius: 12,
            border: `1.5px solid ${C.border}`, background: C.surface,
            fontSize: 13, fontWeight: 700, color: C.textSoft, cursor: "pointer",
          }}>
            Cancelar
          </button>
          <button onClick={tomarFoto} style={{
            height: 44, padding: "0 28px", borderRadius: 12,
            border: "none", background: C.primary,
            fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <Camera size={15} />
            Tomar Foto
          </button>
        </div>
      </Modal>
    </div>
  );
}