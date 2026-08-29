import { useState } from "react";
import { Ban } from "lucide-react";
import { theme } from "@/styles/theme";

const C = theme;

interface ConfirmRechazarReservaModalProps {
  placa: string;
  fecha: string;
  onCancel: () => void;
  onConfirm: (motivo: string) => void;
}

/** Confirmación de rechazo de una solicitud de reserva — el motivo es obligatorio. */
export function ConfirmRechazarReservaModal({ placa, fecha, onCancel, onConfirm }: ConfirmRechazarReservaModalProps) {
  const [motivo, setMotivo] = useState("");
  const [touched, setTouched] = useState(false);
  const error = !motivo.trim() ? "Debe ingresar un motivo para rechazar la reserva." : undefined;

  const handleConfirm = () => {
    setTouched(true);
    if (error) return;
    onConfirm(motivo.trim());
  };

  return (
    <div style={{ padding: "1.8rem" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Ban size={20} color={C.danger} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>
        ¿Rechazar reserva?
      </h3>
      <p style={{ fontSize: 12, color: C.textLight, marginBottom: 14, lineHeight: 1.5 }}>
        La reserva del vehículo <strong>{placa}</strong> para el {fecha} quedará marcada como rechazada.
        El conductor podrá ver el motivo en su historial.
      </p>

      <label htmlFor="motivo-rechazo" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: C.text, fontSize: 13 }}>
        Motivo del rechazo *
      </label>
      <textarea
        id="motivo-rechazo"
        rows={3}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="Ej: La celda ya fue asignada a otro vehículo con prioridad institucional."
        aria-invalid={!!(touched && error)}
        style={{
          width: "100%", padding: "10px 12px", borderRadius: 10, resize: "none",
          border: `1px solid ${touched && error ? C.danger : C.border}`,
          fontSize: 13, fontFamily: "inherit", outline: "none",
        }}
      />
      {touched && error && (
        <p role="alert" style={{ marginTop: 6, fontSize: 12, color: C.danger, fontWeight: 600 }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
        <button
          onClick={onCancel}
          style={{ padding: "9px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: C.text }}
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={touched && !!error}
          style={{
            padding: "9px 16px", borderRadius: 10, border: "none",
            background: touched && error ? "#FCA5A5" : C.danger, color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: touched && error ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}
        >
          Rechazar
        </button>
      </div>
    </div>
  );
}
