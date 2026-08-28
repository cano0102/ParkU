import { useMemo, useState } from "react";
import { Calendar, Car, MapPin, Search, X } from "lucide-react";
import type { Celda } from "@/services/api/celdas";
import type { Conductor } from "@/services/api/conductores";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Vehiculo } from "@/services/api/vehiculos";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";
import { Banner } from "@/components/shared";
import { horaAMinutos } from "../../lib/helpers";

const C = theme;

export interface ReservaFormState {
  vehiculoId: string;
  parqueaderoId: string;
  celdaId: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  /** Motivo/justificación de la reserva — se envía a la API pero antes no tenía campo en el formulario. */
  motivo: string;
  estado: "pendiente" | "activa" | "completada" | "cancelada";
}

interface ReservaModalProps {
  open: boolean;
  celdaActiva: Celda | null;
  parqueaderoActivo: Parqueadero | null;
  vehiculos: Vehiculo[];
  conductores: Conductor[];
  reservaForm: ReservaFormState;
  setReservaForm: React.Dispatch<React.SetStateAction<ReservaFormState>>;
  reservaError: string | null;
  onClose: () => void;
  onSubmit: () => void;
}

export function ReservaModal({
  open, celdaActiva, parqueaderoActivo, vehiculos, conductores, reservaForm, setReservaForm, reservaError, onClose, onSubmit,
}: ReservaModalProps) {
  const [vehiculoQuery, setVehiculoQuery] = useState("");
  const [vehiculoAbierto, setVehiculoAbierto] = useState(false);

  const getConductorDe = (vehiculoId: string) => {
    const v = vehiculos.find(v => v.id === vehiculoId);
    return v ? conductores.find(c => c.id === v.conductorId) ?? null : null;
  };

  const vehiculoSeleccionado = vehiculos.find(v => v.id === reservaForm.vehiculoId) ?? null;
  const conductorSeleccionado = vehiculoSeleccionado ? getConductorDe(vehiculoSeleccionado.id) : null;
  const labelVehiculo = (v: Vehiculo) => `${v.placa} — ${v.marca} ${v.modelo}`.trim();

  const vehiculosFiltrados = useMemo(() => {
    const q = vehiculoQuery.trim().toLowerCase();
    if (!q) return vehiculos;
    return vehiculos.filter(v => {
      const conductor = getConductorDe(v.id);
      return (
        v.placa.toLowerCase().includes(q) ||
        (conductor?.nombre || "").toLowerCase().includes(q) ||
        `${v.marca} ${v.modelo}`.toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehiculos, conductores, vehiculoQuery]);

  const seleccionarVehiculo = (v: Vehiculo) => {
    setReservaForm(prev => ({ ...prev, vehiculoId: v.id }));
    setVehiculoQuery("");
    setVehiculoAbierto(false);
  };

  const limpiarVehiculo = () => {
    setReservaForm(prev => ({ ...prev, vehiculoId: "" }));
    setVehiculoQuery("");
  };

  const horarioInvalido = !!(reservaForm.horaInicio && reservaForm.horaFin && horaAMinutos(reservaForm.horaFin) <= horaAMinutos(reservaForm.horaInicio));
  const formValido = !!(reservaForm.vehiculoId && reservaForm.fechaReserva && reservaForm.horaInicio && reservaForm.horaFin && !horarioInvalido);

  return (
    <Modal open={open} onClose={onClose} maxWidth={680}>
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
              <Calendar size={18} color={C.primary} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>
                Reserva de celda
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                Reservar Celda {celdaActiva?.numero || ""}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
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
          {reservaError && <Banner tone="danger" message={reservaError} />}

          <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1", position: "relative" }}>
              <label htmlFor="vehiculoReserva" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Vehículo *
              </label>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />
                <input
                  id="vehiculoReserva"
                  value={vehiculoAbierto ? vehiculoQuery : (vehiculoSeleccionado ? `${labelVehiculo(vehiculoSeleccionado)}${conductorSeleccionado ? ` · ${conductorSeleccionado.nombre}` : ""}` : "")}
                  onChange={(e) => { setVehiculoQuery(e.target.value); setVehiculoAbierto(true); if (reservaForm.vehiculoId) setReservaForm(prev => ({ ...prev, vehiculoId: "" })); }}
                  onFocus={() => { setVehiculoQuery(""); setVehiculoAbierto(true); }}
                  onBlur={() => setTimeout(() => setVehiculoAbierto(false), 150)}
                  placeholder="Busca por placa o nombre del conductor..."
                  autoComplete="off"
                  style={{
                    width: "100%", padding: "11px 36px 11px 34px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                />
                {reservaForm.vehiculoId && (
                  <button
                    type="button"
                    onClick={limpiarVehiculo}
                    aria-label="Quitar vehículo seleccionado"
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textLight }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {vehiculoAbierto && (
                <div style={{
                  position: "absolute", zIndex: 10, top: "100%", left: 0, right: 0, marginTop: 4,
                  maxHeight: 220, overflowY: "auto", borderRadius: 11, border: `1px solid ${C.border}`,
                  background: "#fff", boxShadow: "0 10px 28px rgba(15,23,42,.12)",
                }}>
                  {vehiculosFiltrados.length === 0 ? (
                    <div style={{ padding: "12px 14px", fontSize: 12, color: C.textLight }}>Sin resultados para "{vehiculoQuery}"</div>
                  ) : (
                    vehiculosFiltrados.map(v => {
                      const conductor = getConductorDe(v.id);
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); seleccionarVehiculo(v); }}
                          style={{
                            width: "100%", display: "flex", alignItems: "center", gap: 8,
                            padding: "9px 12px", border: "none", background: "#fff",
                            borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFC")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                        >
                          <Car size={13} color={C.primary} />
                          <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 12, color: C.text }}>{v.placa}</span>
                          <span style={{ fontSize: 11, color: C.textLight, flex: 1 }}>{conductor?.nombre || "Sin conductor"}</span>
                          <span style={{ fontSize: 10, color: C.textLight }}>{v.marca} {v.modelo}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="fechaReserva" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Fecha de reserva *
              </label>
              <input
                id="fechaReserva"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={reservaForm.fechaReserva}
                onChange={(e) => setReservaForm(prev => ({ ...prev, fechaReserva: e.target.value }))}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 11,
                  border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                  fontFamily: "inherit", background: "#F8FAFC",
                }}
              />
            </div>

            <div>
              <label htmlFor="horaInicioReserva" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Hora de inicio *
              </label>
              <input
                id="horaInicioReserva"
                type="time"
                value={reservaForm.horaInicio}
                onChange={(e) => setReservaForm(prev => ({ ...prev, horaInicio: e.target.value }))}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 11,
                  border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                  fontFamily: "inherit", background: "#F8FAFC",
                }}
              />
            </div>

            <div>
              <label htmlFor="horaFinReserva" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Hora de fin *
              </label>
              <input
                id="horaFinReserva"
                type="time"
                value={reservaForm.horaFin}
                onChange={(e) => setReservaForm(prev => ({ ...prev, horaFin: e.target.value }))}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 11,
                  border: `1px solid ${horarioInvalido ? C.danger : C.border}`, fontSize: 13, outline: "none",
                  fontFamily: "inherit", background: "#F8FAFC",
                }}
              />
              {horarioInvalido && (
                <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>La hora de fin debe ser posterior a la de inicio.</p>
              )}
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="motivoReserva" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Motivo / Justificación
              </label>
              <textarea
                id="motivoReserva"
                value={reservaForm.motivo}
                onChange={(e) => setReservaForm(prev => ({ ...prev, motivo: e.target.value }))}
                placeholder="Ej. Reserva para gira institucional, visita programada, movilidad reducida..."
                rows={2}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 11, resize: "vertical",
                  border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                  fontFamily: "inherit", background: "#F8FAFC",
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px", borderRadius: 11,
                background: "#F8FAFC", border: `1px solid ${C.border}`,
              }}>
                <MapPin size={14} color={C.primary} />
                <span style={{ fontSize: 12, color: C.text }}>
                  Reservando para: <strong>Celda {celdaActiva?.numero}</strong> ·
                  {parqueaderoActivo && ` ${parqueaderoActivo.nombre}`}
                </span>
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
            onClick={onClose}
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
            onClick={onSubmit}
            disabled={!formValido}
            style={{
              padding: "10px 24px", borderRadius: 12,
              border: "none",
              background: formValido ? C.primary : "#E2E8F0",
              color: formValido ? "#fff" : C.textLight,
              fontSize: 13, fontWeight: 800,
              cursor: formValido ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              boxShadow: formValido ? "0 6px 18px rgba(57,169,0,.22)" : undefined,
            }}
          >
            📅 Crear Reserva
          </button>
        </div>
      </div>
    </Modal>
  );
}
