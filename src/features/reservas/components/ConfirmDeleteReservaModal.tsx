import { IconTrash as Trash2 } from "@tabler/icons-react";
import { theme } from "@/styles/theme";

const C = theme;

interface ConfirmDeleteReservaModalProps {
  placa: string;
  fecha: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirmación de eliminación de una reserva. */
export function ConfirmDeleteReservaModal({ placa, fecha, onCancel, onConfirm }: ConfirmDeleteReservaModalProps) {
  return (
    <div style={{ padding: "1.8rem" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <Trash2 size={20} color={C.danger} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>
        ¿Eliminar reserva?
      </h3>
      <p style={{ fontSize: 12, color: C.textLight, marginBottom: 20, lineHeight: 1.5 }}>
        La reserva del vehículo <strong>{placa}</strong>{" "}
        para el {fecha} se eliminará permanentemente. Esta acción no se puede revertir.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{ padding: "9px 16px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: C.text }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: C.danger, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
