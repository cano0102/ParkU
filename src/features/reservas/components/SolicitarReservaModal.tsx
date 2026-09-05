import { IconCalendar as Calendar, IconSend as Send } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { Banner } from "@/components/shared";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { HORA_OPERACION_INICIO, HORA_OPERACION_FIN } from "@/features/parqueaderos";
import { opcionesDeHoraInicio, opcionesDeHoraFin } from "../lib/reglas";

const C = theme;

interface SolicitarReservaModalProps {
  misVehiculos: Vehiculo[];
  parqueaderosActivos: Parqueadero[];
  celdasDisponibles: Celda[];
  vehiculoId: string;
  parqueaderoId: string;
  celdaId: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
  error: string | null;
  onVehiculoChange: (v: string) => void;
  onParqueaderoChange: (v: string) => void;
  onCeldaChange: (v: string) => void;
  onFechaChange: (v: string) => void;
  onHoraInicioChange: (v: string) => void;
  onHoraFinChange: (v: string) => void;
  onMotivoChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const fieldLabel: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 };
const fieldInput: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`,
  fontSize: 13, outline: "none", fontFamily: "inherit", background: "#F8FAFC",
};

/** Solicitud de reserva para el rol Comunidad SENA: queda "pendiente" hasta que un
 * administrador o vigilante la acepte — no ocupa la celda de inmediato. */
export function SolicitarReservaModal({
  misVehiculos, parqueaderosActivos, celdasDisponibles,
  vehiculoId, parqueaderoId, celdaId, fechaReserva, horaInicio, horaFin, motivo, error,
  onVehiculoChange, onParqueaderoChange, onCeldaChange, onFechaChange, onHoraInicioChange, onHoraFinChange, onMotivoChange,
  onSubmit, onCancel,
}: SolicitarReservaModalProps) {
  const ventana = { desde: HORA_OPERACION_INICIO, hasta: HORA_OPERACION_FIN };
  const horasDeInicio = opcionesDeHoraInicio(fechaReserva, ventana);
  const horasDeFin = opcionesDeHoraFin(horaInicio, ventana);

  return (
    <div>
      <div style={{ padding: "1.4rem 1.8rem", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(57,169,0,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Calendar size={18} color={C.primary} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>Nueva solicitud</div>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, lineHeight: 1 }}>Solicitar reserva de celda</h2>
        </div>
      </div>

      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 12 }}>
        {error && <Banner tone="danger" message={error} />}

        <p style={{ fontSize: 11.5, color: C.textLight, margin: 0, lineHeight: 1.5 }}>
          Tu solicitud queda <strong>pendiente</strong> hasta que un administrador o vigilante la acepte — la celda no se reserva de inmediato.
        </p>

        <div>
          <label style={fieldLabel}>Vehículo *</label>
          <select value={vehiculoId} onChange={(e) => onVehiculoChange(e.target.value)} style={fieldInput}>
            <option value="">Selecciona tu vehículo…</option>
            {misVehiculos.map((v) => (
              <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo ?? ""}</option>
            ))}
          </select>
        </div>

        <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={fieldLabel}>Parqueadero *</label>
            <select value={parqueaderoId} onChange={(e) => onParqueaderoChange(e.target.value)} style={fieldInput}>
              <option value="">Selecciona un parqueadero…</option>
              {parqueaderosActivos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={fieldLabel}>Celda disponible *</label>
            <select value={celdaId} onChange={(e) => onCeldaChange(e.target.value)} disabled={!parqueaderoId} style={fieldInput}>
              <option value="">
                {parqueaderoId ? (celdasDisponibles.length ? "Selecciona una celda…" : "Sin celdas disponibles para tu vehículo") : "Elige primero un parqueadero"}
              </option>
              {celdasDisponibles.map((c) => (
                <option key={c.id} value={c.id}>Celda {c.numero}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={fieldLabel}>Fecha *</label>
            <input type="date" min={new Date().toISOString().split("T")[0]} value={fechaReserva} onChange={(e) => onFechaChange(e.target.value)} style={fieldInput} />
          </div>

          <div />

          {/* Listas, no campos de hora libres: solo se ofrece lo que de verdad se puede
              reservar (horario de operación, media hora de anticipación si es para hoy, y
              una hora de duración mínima). Así una hora inválida no se puede ni elegir, en
              vez de avisar cuando ya se intentó guardar. */}
          <div>
            <label style={fieldLabel}>Hora de inicio *</label>
            <select value={horaInicio} onChange={(e) => onHoraInicioChange(e.target.value)} style={fieldInput}>
              {horasDeInicio.length === 0 && <option value="">Hoy ya no hay horas disponibles</option>}
              {horasDeInicio.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={fieldLabel}>Hora de fin *</label>
            <select value={horaFin} onChange={(e) => onHoraFinChange(e.target.value)} style={fieldInput} disabled={!horaInicio}>
              {horasDeFin.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={fieldLabel}>Motivo / Justificación</label>
            <textarea
              value={motivo}
              onChange={(e) => onMotivoChange(e.target.value)}
              placeholder="Ej. Necesito parquear mientras asisto a clase..."
              rows={2}
              style={{ ...fieldInput, resize: "vertical" }}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: "1rem 1.8rem", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{ padding: "10px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 12, border: "none",
            background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 6px 18px rgba(57,169,0,.22)",
          }}
        >
          <Send size={14} /> Enviar solicitud
        </button>
      </div>
    </div>
  );
}
