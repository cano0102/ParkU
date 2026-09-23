import { IconPower as Power, IconX as X } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { useEnCurso } from "@/hooks/useEnCurso";

const C = theme;

interface ConfirmDeleteIncidenteModalProps {
  descripcion: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<unknown>;
}

/** Confirmación de desactivación de un incidente. */
export function ConfirmDeleteIncidenteModal({ descripcion, onCancel, onConfirm }: ConfirmDeleteIncidenteModalProps) {
  const [confirmar, enCurso] = useEnCurso(onConfirm);
  return (
    <div style={{ padding: "1.8rem", position: "relative" }}>
      <button
        type="button"
        onClick={onCancel}
        disabled={enCurso}
        aria-label="Cerrar modal"
        title="Cerrar"
        style={{
          position: "absolute", top: 12, right: 12, width: 30, height: 30,
          border: "none", borderRadius: 8, background: "transparent", color: C.textLight,
          cursor: enCurso ? "not-allowed" : "pointer", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <X size={18} />
      </button>
      <div style={{
        width: 44, height: 44, borderRadius: 12, background: "#FEE2E2",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
      }}>
        <Power size={20} color={C.danger} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>
        ¿Desactivar incidente?
      </h3>
      <p style={{ fontSize: 12, color: C.textLight, marginBottom: 20, lineHeight: 1.5 }}>
        "{descripcion}" dejará de mostrarse en la lista, pero se conservará su historial.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button
          onClick={onCancel}
          disabled={enCurso}
          style={{
            padding: "9px 16px", borderRadius: 10,
            border: `1px solid ${C.border}`, background: "#fff",
            fontSize: 13, fontWeight: 700, cursor: enCurso ? "not-allowed" : "pointer", fontFamily: "inherit",
            color: C.text,
          }}
        >
          Cancelar
        </button>
        <button
          onClick={confirmar}
          disabled={enCurso}
          aria-busy={enCurso}
          style={{
            padding: "9px 16px", borderRadius: 10,
            border: "none", background: C.danger, color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: enCurso ? "wait" : "pointer", opacity: enCurso ? 0.7 : 1, fontFamily: "inherit",
          }}
        >
          {enCurso ? "Desactivando…" : "Desactivar"}
        </button>
      </div>
    </div>
  );
}
