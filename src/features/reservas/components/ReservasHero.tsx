import { Calendar, CheckCircle2, Clock3, Shield, XCircle } from "lucide-react";
import type { EstadoReserva } from "../lib/constants";

interface ReservasHeroProps {
  counts: { pendiente: number; activa: number; completada: number; cancelada: number };
  filterEstado: "todos" | EstadoReserva;
  onFilterEstadoChange: (estado: "todos" | EstadoReserva) => void;
}

/** Banner superior de Reservas: las pastillas de estado también filtran al hacer clic. */
export function ReservasHero({ counts, filterEstado, onFilterEstadoChange }: ReservasHeroProps) {
  const stats = [
    { label: "Pendientes", value: counts.pendiente, estado: "pendiente" as const, icon: Clock3 },
    { label: "Activas", value: counts.activa, estado: "activa" as const, icon: CheckCircle2 },
    { label: "Completadas", value: counts.completada, estado: "completada" as const, icon: Calendar },
    { label: "Canceladas", value: counts.cancelada, estado: "cancelada" as const, icon: XCircle },
  ];

  return (
    <div
      style={{
        position: "relative", overflow: "hidden", borderRadius: 20,
        background: "linear-gradient(135deg,#39A900,#2D7D00)",
        padding: "1.4rem 1.6rem", color: "#fff",
      }}
    >
      <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,.07)", top: -80, right: -60 }} />
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

        <div className="reservas-hero-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, minWidth: 280, maxWidth: 420 }}>
          {stats.map((s) => {
            const isActive = filterEstado === s.estado;
            return (
              <div
                key={s.label}
                className="stat-card"
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                onClick={() => onFilterEstadoChange(isActive ? "todos" : s.estado)}
                onKeyDown={(e) => { if (e.key === "Enter") onFilterEstadoChange(isActive ? "todos" : s.estado); }}
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
  );
}
