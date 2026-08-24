import { AlertTriangle, Car, Calendar, Clock as ClockIcon, ChevronRight, Clock, MapPin, UserCircle2, X } from "lucide-react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Reserva } from "@/services/api/reservas";
import type { Vehiculo } from "@/services/api/vehiculos";
import { theme } from "@/theme";
import { Modal } from "@/components/shared";
import { EstadoBadge, TipoBadge } from "./UiBits";
import { Ocupante, formatearFechaHora, formatearDuracion } from "./helpers";

const C = theme;

interface CeldaInfoModalProps {
  open: boolean;
  celdaActiva: Celda | null;
  ocupanteActivo: Ocupante | null;
  reservaActiva: Reserva | null;
  vehiculoReservado: Vehiculo | null;
  parqueaderoActivo: Parqueadero | null;
  onClose: () => void;
  onCancelarReserva: () => void;
  onEstacionarOficial: () => void;
  onNavigateConductor: (nombre: string) => void;
  onLiberar: () => void;
  onReportarIncidente: () => void;
  onEstacionarVehiculo: () => void;
  onReservarCelda: () => void;
}

export function CeldaInfoModal({
  open, celdaActiva, ocupanteActivo, reservaActiva, vehiculoReservado, parqueaderoActivo, onClose,
  onCancelarReserva, onEstacionarOficial, onNavigateConductor, onLiberar,
  onReportarIncidente, onEstacionarVehiculo, onReservarCelda,
}: CeldaInfoModalProps) {
  const parqueaderoInactivo = parqueaderoActivo?.estado !== "activo";
  return (
    <Modal open={open} onClose={onClose} maxWidth={480}>
      <div style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, borderRadius: "24px 24px 0 0", padding: "1.6rem 1.8rem", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.07)", top: -80, right: -60 }} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}><Car size={24} /></div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "rgba(255,255,255,.7)", textTransform: "uppercase" }}>Celda {celdaActiva?.numero}</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, marginTop: 2 }}>{celdaActiva?.estado === "no_disponible" && ocupanteActivo ? ocupanteActivo.vehiculo.placa : celdaActiva?.estado === "reservada" ? (vehiculoReservado?.placa || "Reservada") : "Celda Libre"}</h2>
          {celdaActiva?.estado === "no_disponible" && ocupanteActivo && <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 4 }}>{ocupanteActivo.conductor?.nombre || "—"}</p>}
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>{celdaActiva && <EstadoBadge estado={celdaActiva.estado} />}{celdaActiva && <TipoBadge tipo={celdaActiva.tipo} />}</div>
        </div>
      </div>
      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 10 }}>
        {celdaActiva?.estado === "reservada" ? (
          <>
            <div style={{ padding: "12px 14px", borderRadius: 11, background: C.amberBg, border: `1px solid ${C.amberBg}`, fontSize: 12, color: "#92400E", fontWeight: 600 }}>Celda reservada.</div>
            {reservaActiva && [
              { icon: Car, label: "Vehículo", value: vehiculoReservado ? `${vehiculoReservado.placa} — ${vehiculoReservado.marca} ${vehiculoReservado.modelo}` : "—" },
              { icon: Calendar, label: "Fecha", value: reservaActiva.fechaReserva },
              { icon: ClockIcon, label: "Horario", value: `${reservaActiva.horaInicio} – ${reservaActiva.horaFin}` },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 11, background: "#F8FAFC", border: `1px solid ${C.border}` }}>
                <r.icon size={14} color={C.textLight} />
                <div><div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: .5 }}>{r.label}</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.value}</div></div>
              </div>
            ))}
            {parqueaderoInactivo && (
              <div style={{ padding: "10px 12px", borderRadius: 11, background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, fontSize: 11, color: C.danger, fontWeight: 700 }}>
                Este parqueadero está inactivo: no se pueden registrar nuevos ingresos.
              </div>
            )}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={onCancelarReserva} style={{ flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: C.text }}>🔓 Cancelar Reserva</button>
              {!parqueaderoInactivo && (
                <button onClick={onEstacionarOficial} style={{ flex: 1, padding: "10px", borderRadius: 11, border: "none", background: C.text, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Estacionar Oficial</button>
              )}
            </div>
          </>
        ) : celdaActiva?.estado === "no_disponible" && ocupanteActivo ? (
          <>
            {[
              { icon: Car,    label: "Placa",        value: <span style={{ fontFamily: "monospace", fontWeight: 900 }}>{ocupanteActivo.vehiculo.placa}{ocupanteActivo.esOficial && <span style={{ marginLeft: 6, fontSize: 9, background: C.primaryPale, color: C.primaryDark, padding: "1px 6px", borderRadius: 4 }}>OFICIAL</span>}</span> },
              ...(ocupanteActivo.conductor ? [{ icon: UserCircle2, label: "Conductor", value: ocupanteActivo.conductor.nombre, onClick: () => onNavigateConductor(ocupanteActivo.conductor!.nombre) }] : []),
              { icon: MapPin, label: "Parqueadero",  value: parqueaderoActivo?.nombre },
              { icon: Clock,  label: "Ingreso",      value: `${formatearFechaHora(ocupanteActivo.fechaEntrada).fecha} ${formatearFechaHora(ocupanteActivo.fechaEntrada).hora}` },
              { icon: Clock,  label: "Estadía",      value: formatearDuracion(ocupanteActivo.fechaEntrada) },
            ].map((r, i) => (
              <div
                key={i}
                onClick={r.onClick}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 11, background: "#F8FAFC", border: `1px solid ${C.border}`, cursor: r.onClick ? "pointer" : "default" }}
                onMouseEnter={r.onClick ? (e => (e.currentTarget.style.background = "#F1F5F9")) : undefined}
                onMouseLeave={r.onClick ? (e => (e.currentTarget.style.background = "#F8FAFC")) : undefined}
              >
                <r.icon size={14} color={C.textLight} />
                <div><div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: .5 }}>{r.label}</div><div style={{ fontSize: 13, fontWeight: 600, color: r.onClick ? C.primary : C.text }}>{r.value}</div></div>
                {r.onClick && <ChevronRight size={14} color={C.textLight} style={{ marginLeft: "auto" }} />}
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 4, flexWrap: "wrap" }}>
              <button onClick={onLiberar} style={{ flex: 1, padding: "10px", borderRadius: 11, border: "none", background: C.danger, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(239,68,68,.25)" }}>Liberar Celda</button>
              <button
                onClick={onReportarIncidente}
                title="Reportar Incidente"
                style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0, padding: "8px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", color: C.textLight, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                <AlertTriangle size={13} />
                Incidente
              </button>
            </div>
          </>
        ) : celdaActiva?.estado === "disponible" ? (
          parqueaderoInactivo ? (
            <div style={{ padding: "12px 14px", borderRadius: 11, background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, fontSize: 12, color: C.danger, fontWeight: 600 }}>
              ⚠️ Este parqueadero está inactivo y no acepta nuevos registros. Actívalo en el módulo Parqueaderos.
            </div>
          ) : (
            <>
              <div style={{ padding: "12px 14px", borderRadius: 11, background: C.primaryPale, border: `1px solid ${C.primaryLight}`, fontSize: 12, color: C.primaryDark, fontWeight: 600 }}>
                ✅ Celda disponible para estacionar.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={onEstacionarVehiculo} style={{ flex: 1, padding: "10px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(57,169,0,.25)" }}>Estacionar Vehículo</button>
                <button
                  onClick={onReservarCelda}
                  style={{ flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: C.text }}
                >
                  📅 Reservar Celda
                </button>
              </div>
            </>
          )
        ) : null}
      </div>
    </Modal>
  );
}
