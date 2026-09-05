import { IconPassword as KeyRound } from "@tabler/icons-react";
import { FormField } from "@/components/shared";
import { COLORS, inputStyle, inputErrorStyle } from "../lib/helpers";

interface CuentaNuevaFieldsProps {
  password: string;
  confirmPassword: string;
  passwordError?: string;
  confirmPasswordError?: string;
  onPasswordChange: (valor: string) => void;
  onConfirmPasswordChange: (valor: string) => void;
  onBlur: () => void;
}

/**
 * Contraseña de la cuenta que se va a crear con el conductor ("No tengo usuario").
 *
 * Va al FINAL del formulario, después de la discapacidad: es el último paso del trámite, y
 * ponerla en medio -- junto al buscador de cuentas -- partía en dos la lectura de los datos
 * de la persona.
 */
export function CuentaNuevaFields({
  password, confirmPassword, passwordError, confirmPasswordError,
  onPasswordChange, onConfirmPasswordChange, onBlur,
}: CuentaNuevaFieldsProps) {
  return (
    <section style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
          Contraseña de la cuenta nueva *
        </p>
      </div>
      <div className="cf-modal-grid" style={{ padding: "0.85rem 1.1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 10 }}>
        <FormField label="Contraseña *" error={passwordError}>
          <div style={{ position: "relative" }}>
            <KeyRound size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.textLight }} />
            <input
              type="password"
              placeholder="••••••••"
              aria-label="Contraseña"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onBlur={onBlur}
              style={{ ...inputStyle, paddingLeft: 34, ...(passwordError ? inputErrorStyle : {}) }}
            />
          </div>
        </FormField>
        <FormField label="Confirmar contraseña *" error={confirmPasswordError}>
          <div style={{ position: "relative" }}>
            <KeyRound size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.textLight }} />
            <input
              type="password"
              placeholder="Repite la contraseña"
              aria-label="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              onBlur={onBlur}
              style={{ ...inputStyle, paddingLeft: 34, ...(confirmPasswordError ? inputErrorStyle : {}) }}
            />
          </div>
        </FormField>
      </div>
    </section>
  );
}
