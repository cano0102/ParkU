import {
  IconAlertTriangle as AlertTriangle,
  IconCar as Car,
  IconCalendar as Calendar,
  IconClock as ClockIcon,
  IconChevronRight as ChevronRight,
  IconClock as Clock,
  IconMapPin as MapPin,
  IconUserCircle as UserCircle2,
  IconTool as Wrench,
  IconX as X,
} from "@tabler/icons-react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Reserva } from "@/services/api/reservas";
import type { Vehiculo } from "@/services/api/vehiculos";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";
import { EstadoBadge, TipoBadge } from "../map/CeldaBadges";
import { Ocupante, formatearFechaHora, formatearDuracion, estaFueraDeHorarioOperacion, HORA_OPERACION_FIN } from "../../lib/helpers";

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
  /** Registrar el ingreso del vehículo que tiene la reserva de esta celda: abre el asistente
   *  ya precargado con esa placa y ese conductor (los únicos que el ingreso aceptará). */
  onEstacionarReservado: () => void;
  onReservarCelda: () => void;
  /** Solicitar la celda sin poder gestionarla: es lo que hace un Conductor desde el plano.
   *  Lleva al módulo de Reservas con esta celda ya elegida, y la solicitud queda pendiente
   *  de que un administrador o vigilante la acepte. */
  canSolicitarReserva?: boolean;
  onSolicitarReserva?: () => void;
  /** Nombre de quien hizo la reserva que retiene esta celda. */
  conductorReserva?: string;
  /** true si el rol del usuario logueado tiene el permiso "celdas" — controla si se muestra
   *  el ajuste manual de estado (ver onSetEstadoManual) y el botón "Reservar Celda". Ese botón
   *  usa `handleCrearReserva` (ver useReservaCelda.ts), que crea la reserva y la ACTIVA de
   *  inmediato sin pasar por aprobación — exclusivo de Admin/Vigilante. Comunidad SENA
   *  (Conductor) reserva por un camino aparte, "Solicitar reserva" (useSolicitarReserva.ts),
   *  que sí queda pendiente hasta que alguien la acepte — no por este modal. */
  canManageCeldas?: boolean;
  /** true si el rol tiene el permiso "entradaSalida" — controla si se muestran
   *  las acciones de estacionar/liberar/cancelar reserva (portería). Comunidad
   *  SENA (Conductor) no lo tiene. */
  canRegistrarIngreso: boolean;
  /** true si el rol tiene el permiso "incidentes" — controla el botón de
   *  reportar incidente. */
  canReportarIncidentes: boolean;
  /** true si ya hay un incidente abierto (pendiente/en proceso) para esta celda u ocupante —
   *  deshabilita el botón de reportar en vez de dejar que se acumulen duplicados. Opcional:
   *  por defecto no bloquea, para no exigirle este dato a cada consumidor del modal. */
  incidenteAbiertoExiste?: boolean;
  /** Fuerza el estado de la celda sin pasar por el flujo normal (estacionar/
   *  liberar/reservar). Es la vía de escape para una celda que quedó
   *  atascada en un estado (p. ej. datos inconsistentes) o para marcarla en
   *  mantenimiento, algo que hoy no tiene ningún otro camino en la UI. */
  onSetEstadoManual?: (estado: Celda["estado"]) => void;
}

const ESTADOS_MANUALES: { estado: Celda["estado"]; label: string }[] = [
  { estado: "disponible", label: "Disponible" },
  { estado: "no_disponible", label: "Ocupada" },
  { estado: "reservada", label: "Reservada" },
  { estado: "mantenimiento", label: "Mantenimiento" },
];

export function CeldaInfoModal({
  open, celdaActiva, ocupanteActivo, reservaActiva, vehiculoReservado, parqueaderoActivo, onClose,
  onCancelarReserva, onEstacionarOficial, onNavigateConductor, onLiberar,
  onReportarIncidente, onEstacionarVehiculo, onEstacionarReservado, onReservarCelda,
  canSolicitarReserva = false, onSolicitarReserva, conductorReserva,
  canManageCeldas, canRegistrarIngreso, canReportarIncidentes, incidenteAbiertoExiste, onSetEstadoManual,
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
        {canManageCeldas && celdaActiva && onSetEstadoManual && (
          <div style={{ padding: "10px 12px", borderRadius: 11, border: `1px dashed ${C.border}`, background: "#F8FAFC" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <Wrench size={12} color={C.textLight} />
              <span style={{ fontSize: 10, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: .5 }}>Ajuste manual de estado</span>
            </div>
            {/* Una celda realmente ocupada (o con una reserva activa) no se toca a mano: forzarle
                "disponible" por aquí dejaría el ingreso/reserva abierto en la base de datos y la
                celda libre en pantalla — datos desincronizados. Primero se registra la salida
                (o se cancela la reserva) por su flujo normal, y ahí sí se puede ajustar. */}
            {ocupanteActivo || reservaActiva ? (
              <p style={{ fontSize: 11, color: C.text, fontWeight: 600, lineHeight: 1.5 }}>
                {ocupanteActivo
                  ? "La celda está ocupada. Debe registrarse la salida del vehículo para poder modificar su estado."
                  : "La celda tiene una reserva activa. Debe cancelarse la reserva para poder modificar su estado."}
              </p>
            ) : (
              <>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {ESTADOS_MANUALES.map(({ estado, label }) => {
                    const activo = celdaActiva.estado === estado;
                    return (
                      <button
                        key={estado}
                        disabled={activo}
                        onClick={() => onSetEstadoManual(estado)}
                        style={{
                          padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, fontFamily: "inherit",
                          border: `1px solid ${activo ? C.primary : C.border}`,
                          background: activo ? C.primaryPale : "#fff",
                          color: activo ? C.primaryDark : C.text,
                          cursor: activo ? "default" : "pointer",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 9, color: C.textLight, marginTop: 6 }}>Cambia el estado sin pasar por el flujo normal (estacionar/reservar/liberar). Úsalo solo para corregir una celda atascada o ponerla en mantenimiento.</p>
              </>
            )}
          </div>
        )}
        {celdaActiva?.estado === "mantenimiento" && (
          <div style={{ padding: "12px 14px", borderRadius: 11, background: "#F1F5F9", border: `1px solid ${C.border}`, fontSize: 12, color: C.textLight, fontWeight: 600 }}>
            🔧 Esta celda está en mantenimiento y no acepta vehículos ni reservas.
          </div>
        )}
        {celdaActiva?.estado === "reservada" ? (
          <>
            <div style={{ padding: "12px 14px", borderRadius: 11, background: C.amberBg, border: `1px solid ${C.amberBg}`, fontSize: 12, color: "#92400E", fontWeight: 600 }}>Celda reservada.</div>
            {reservaActiva && [
              { icon: Car, label: "Vehículo", value: vehiculoReservado ? `${vehiculoReservado.placa} — ${vehiculoReservado.marca} ${vehiculoReservado.modelo}` : "—" },
              // Una reserva aparta la celda para una PERSONA, no solo para un vehículo: es
              // quien tiene que llegar, y sin su nombre no hay forma de saber a quién se le
              // está guardando la celda.
              { icon: UserCircle2, label: "Reservada por", value: conductorReserva || "—" },
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
            {canRegistrarIngreso && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {/* Camino normal de una reserva: el vehículo reservado llega y se estaciona.
                    Sin esto solo quedaba cancelar la reserva o estacionar un oficial. */}
                {!parqueaderoInactivo && vehiculoReservado && (
                  <button
                    onClick={onEstacionarReservado}
                    style={{ flex: "1 1 100%", padding: "10px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(57,169,0,.25)" }}
                  >
                    Estacionar {vehiculoReservado.placa}
                  </button>
                )}
                <button onClick={onCancelarReserva} style={{ flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: C.text }}>🔓 Cancelar Reserva</button>
                {!parqueaderoInactivo && (
                  <button onClick={onEstacionarOficial} style={{ flex: 1, padding: "10px", borderRadius: 11, border: "none", background: C.text, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Estacionar Oficial</button>
                )}
              </div>
            )}
          </>
        ) : celdaActiva?.estado === "no_disponible" && ocupanteActivo ? (
          <>
            {estaFueraDeHorarioOperacion() && (
              <div style={{ padding: "12px 14px", borderRadius: 11, background: "#FEF2F2", border: `1px solid #FECACA`, fontSize: 12, color: "#991B1B", fontWeight: 700 }}>
                ⏰ Este vehículo sigue estacionado fuera del horario permitido (hasta las {HORA_OPERACION_FIN}).
                {canReportarIncidentes ? " Considera generar un incidente." : ""}
              </div>
            )}
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
            {(canRegistrarIngreso || canReportarIncidentes) && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 4, flexWrap: "wrap" }}>
                {canRegistrarIngreso && (
                  <button onClick={onLiberar} style={{ flex: 1, padding: "10px", borderRadius: 11, border: "none", background: C.danger, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(239,68,68,.25)" }}>Liberar Celda</button>
                )}
                {canReportarIncidentes && (
                  <button
                    onClick={incidenteAbiertoExiste ? undefined : onReportarIncidente}
                    disabled={incidenteAbiertoExiste}
                    title={incidenteAbiertoExiste ? "Ya existe un incidente abierto para esta celda o vehículo." : "Reportar Incidente"}
                    style={{
                      display: "flex", alignItems: "center", gap: 5, flexShrink: 0, padding: "8px 12px", borderRadius: 10,
                      border: `1px solid ${C.border}`, background: "#fff", color: C.textLight, fontSize: 11, fontWeight: 700,
                      fontFamily: "inherit",
                      cursor: incidenteAbiertoExiste ? "not-allowed" : "pointer",
                      opacity: incidenteAbiertoExiste ? 0.55 : 1,
                    }}
                  >
                    <AlertTriangle size={13} />
                    {incidenteAbiertoExiste ? "Ya reportado" : "Incidente"}
                  </button>
                )}
              </div>
            )}
          </>
        ) : celdaActiva?.estado === "disponible" ? (
          parqueaderoInactivo ? (
            <div style={{ padding: "12px 14px", borderRadius: 11, background: C.dangerBg, border: `1px solid ${C.dangerBorder}`, fontSize: 12, color: C.danger, fontWeight: 600 }}>
              ⚠️ Este parqueadero está inactivo y no acepta nuevos registros. Actívalo en el módulo Parqueaderos.
            </div>
          ) : (
            <>
              <div style={{ padding: "12px 14px", borderRadius: 11, background: C.primaryPale, border: `1px solid ${C.primaryLight}`, fontSize: 12, color: C.primaryDark, fontWeight: 600 }}>
                {canRegistrarIngreso ? "✅ Celda disponible para estacionar." : "✅ Celda disponible: puedes solicitarla."}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {canRegistrarIngreso && (
                  <button onClick={onEstacionarVehiculo} style={{ flex: 1, padding: "10px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(57,169,0,.25)" }}>Estacionar Vehículo</button>
                )}
                {/* `handleCrearReserva` (ver useReservaCelda.ts) crea la reserva y la ACTIVA de
                 * inmediato con un segundo PATCH, sin pasar por "pendiente" — el mismo atajo
                 * exclusivo de Admin/Vigilante que ya usa `onEstacionarVehiculo` de al lado.
                 * Antes este botón no verificaba ningún permiso: cualquier rol que llegara a
                 * abrir este modal podía saltarse el flujo de aprobación de Comunidad SENA. */}
                {canManageCeldas && (
                  <button
                    onClick={onReservarCelda}
                    style={{ flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: C.text }}
                  >
                    📅 Reservar Celda
                  </button>
                )}
                {canSolicitarReserva && onSolicitarReserva && (
                  <button
                    onClick={onSolicitarReserva}
                    style={{ flex: 1, padding: "10px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(57,169,0,.25)" }}
                  >
                    📅 Solicitar esta celda
                  </button>
                )}
              </div>
            </>
          )
        ) : null}
      </div>
    </Modal>
  );
}
