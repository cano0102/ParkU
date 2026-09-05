import { useState } from "react";
import { IconBan as Ban } from "@tabler/icons-react";
import { theme } from "@/styles/theme";

const C = theme;

export type AccionConMotivo = "rechazar" | "cancelar";

interface MotivoReservaModalProps {
  accion: AccionConMotivo;
  placa: string;
  fecha: string;
  onCancel: () => void;
  onConfirm: (motivo: string) => void;
}

const TEXTOS: Record<AccionConMotivo, { titulo: string; explicacion: string; etiqueta: string; ejemplo: string; boton: string; error: string }> = {
  rechazar: {
    titulo: "¿Rechazar reserva?",
    explicacion: "quedará marcada como rechazada",
    etiqueta: "Motivo del rechazo *",
    ejemplo: "Ej: La celda ya fue asignada a otro vehículo con prioridad institucional.",
    boton: "Rechazar",
    error: "Debe ingresar un motivo para rechazar la reserva.",
  },
  cancelar: {
    titulo: "¿Cancelar reserva?",
    explicacion: "se cancelará y la celda quedará libre para otra persona",
    etiqueta: "Motivo de la cancelación *",
    ejemplo: "Ej: El conductor avisó que ya no va a usar la celda hoy.",
    boton: "Cancelar reserva",
    error: "Debe ingresar un motivo para cancelar la reserva.",
  },
};

/**
 * Rechazar o cancelar una reserva, siempre con el motivo escrito: son las dos acciones que
 * cambian los planes de otra persona, y el motivo es lo que verá en su historial.
 *
 * Es el mismo formulario en los dos sitios desde los que se puede hacer — el módulo de
 * Reservas y la celda reservada en el plano de Parqueaderos — para que la información que se
 * pide sea idéntica se entre por donde se entre.
 */
export function MotivoReservaModal({ accion, placa, fecha, onCancel, onConfirm }: MotivoReservaModalProps) {
  const t = TEXTOS[accion];
  const [motivo, setMotivo] = useState("");
  const [touched, setTouched] = useState(false);
  const error = !motivo.trim() ? t.error : undefined;

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
      <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>{t.titulo}</h3>
      <p style={{ fontSize: 12, color: C.textLight, marginBottom: 14, lineHeight: 1.5 }}>
        La reserva del vehículo <strong>{placa}</strong> para el {fecha} {t.explicacion}.
        El conductor podrá ver el motivo en su historial.
      </p>

      <label htmlFor="motivo-reserva" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: C.text, fontSize: 13 }}>
        {t.etiqueta}
      </label>
      <textarea
        id="motivo-reserva"
        rows={3}
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={t.ejemplo}
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
          Volver
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
          {t.boton}
        </button>
      </div>
    </div>
  );
}
