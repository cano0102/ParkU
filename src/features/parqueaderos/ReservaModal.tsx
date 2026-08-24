import { Calendar, MapPin, X } from "lucide-react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Vehiculo } from "@/services/api/vehiculos";
import { theme } from "@/theme";
import { Modal } from "@/components/shared";
import { Banner } from "./UiBits";

const C = theme;

export interface ReservaFormState {
  vehiculoId: string;
  parqueaderoId: string;
  celdaId: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  estado: "pendiente" | "activa" | "completada" | "cancelada";
}

interface ReservaModalProps {
  open: boolean;
  celdaActiva: Celda | null;
  parqueaderoActivo: Parqueadero | null;
  vehiculos: Vehiculo[];
  reservaForm: ReservaFormState;
  setReservaForm: React.Dispatch<React.SetStateAction<ReservaFormState>>;
  reservaError: string | null;
  onClose: () => void;
  onSubmit: () => void;
}

export function ReservaModal({
  open, celdaActiva, parqueaderoActivo, vehiculos, reservaForm, setReservaForm, reservaError, onClose, onSubmit,
}: ReservaModalProps) {
  const formValido = !!(reservaForm.vehiculoId && reservaForm.fechaReserva && reservaForm.horaInicio && reservaForm.horaFin);

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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label htmlFor="vehiculoReserva" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                Vehículo *
              </label>
              <select
                id="vehiculoReserva"
                value={reservaForm.vehiculoId}
                onChange={(e) => setReservaForm(prev => ({ ...prev, vehiculoId: e.target.value }))}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 11,
                  border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                  fontFamily: "inherit", background: "#F8FAFC",
                }}
              >
                <option value="">Seleccionar vehículo...</option>
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.placa} — {v.marca} {v.modelo}
                  </option>
                ))}
              </select>
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
