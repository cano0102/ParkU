import type { ReactNode } from "react";
import { AlertCircle, X } from "lucide-react";
import { theme } from "@/styles/theme";

const COLORS = theme;

export interface EntityFormModalProps {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
  isValid: boolean;
  submitLabel: string;
  /** Se muestra en el pie cuando el formulario no es válido y ya se tocó algún campo. */
  validationMessage?: string;
  showValidationMessage?: boolean;
  children: ReactNode;
}

/**
 * Shell de formulario-en-modal (encabezado con ícono+título, cuerpo, pie con
 * Cancelar/Guardar) compartido por los formularios de alta/edición de una
 * entidad. Se apoya en el `Modal` genérico de components/shared (que ya
 * resuelve el open/close y el backdrop) — este componente es solo el
 * contenido interno, antes duplicado entre ConductorFormModal y
 * UsuarioFormModal.
 */
export function EntityFormModal({
  icon, eyebrow, title, onSubmit, onCancel, isValid, submitLabel,
  validationMessage = "Revisa los campos marcados",
  showValidationMessage = false,
  children,
}: EntityFormModalProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div
        style={{
          padding: "1.1rem 1.6rem 0.9rem",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "rgba(57,169,0,.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: COLORS.primary, textTransform: "uppercase" }}>
              {eyebrow}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: COLORS.text, lineHeight: 1 }}>{title}</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            cursor: "pointer",
            color: COLORS.textLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Cerrar formulario"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: "1rem 1.6rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        {children}
      </div>

      <div
        style={{
          padding: "0.8rem 1.6rem",
          borderTop: `1px solid ${COLORS.border}`,
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {showValidationMessage && !isValid && (
          <span
            style={{
              fontSize: 11,
              color: "#DC2626",
              fontWeight: 600,
              marginRight: "auto",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <AlertCircle size={13} /> {validationMessage}
          </span>
        )}
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "11px 20px",
            borderRadius: 12,
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            color: COLORS.text,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!isValid}
          style={{
            padding: "11px 24px",
            borderRadius: 12,
            border: "none",
            background: isValid ? COLORS.primary : COLORS.textMuted,
            color: "#fff",
            fontSize: 13,
            fontWeight: 800,
            cursor: isValid ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            boxShadow: isValid ? "0 6px 18px rgba(57,169,0,.22)" : "none",
            opacity: isValid ? 1 : 0.65,
            transition: "opacity .15s ease",
          }}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
