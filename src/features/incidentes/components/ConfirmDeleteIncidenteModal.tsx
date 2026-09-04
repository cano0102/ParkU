import { IconTrash as Trash2 } from "@tabler/icons-react";
import { theme } from "@/styles/theme";

const C = theme;

interface ConfirmDeleteIncidenteModalProps {
  descripcion: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirmación de eliminación de un incidente. */
export function ConfirmDeleteIncidenteModal({ descripcion, onCancel, onConfirm }: ConfirmDeleteIncidenteModalProps) {
  return (
    <div style={{ padding: "1.8rem" }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: "#FEE2E2",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
      }}>
        <Trash2 size={20} color={C.danger} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>
        ¿Eliminar incidente?
      </h3>
      <p style={{ fontSize: 12, color: C.textLight, marginBottom: 20, lineHeight: 1.5 }}>
        "{descripcion}" se eliminará permanentemente. Esta acción no se puede revertir.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          style={{
            padding: "9px 16px", borderRadius: 10,
            border: `1px solid ${C.border}`, background: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            color: C.text,
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: "9px 16px", borderRadius: 10,
            border: "none", background: C.danger, color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
