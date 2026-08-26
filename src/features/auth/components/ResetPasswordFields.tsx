import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface ResetPasswordFieldsProps {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  passwordError?: string;
  confirmPasswordError?: string;
  onPasswordChange: (value: string) => void;
  onPasswordBlur: () => void;
  onConfirmPasswordChange: (value: string) => void;
  onConfirmPasswordBlur: () => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
}

/** Campos de nueva contraseña y confirmación, con alternar mostrar/ocultar y error en línea. */
export function ResetPasswordFields({
  password, confirmPassword, showPassword, showConfirmPassword,
  passwordError, confirmPasswordError,
  onPasswordChange, onPasswordBlur, onConfirmPasswordChange, onConfirmPasswordBlur,
  onToggleShowPassword, onToggleShowConfirmPassword,
}: ResetPasswordFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="reset-password" style={{ display: "block", marginBottom: 10, fontWeight: 700, color: COLORS.text }}>
          Nueva Contraseña
        </label>

        <div style={{ position: "relative" }}>
          <input
            id="reset-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onBlur={onPasswordBlur}
            placeholder="••••••••"
            required
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "reset-password-error" : undefined}
            style={{
              width: "100%", padding: "18px 55px 18px 18px", borderRadius: 16,
              border: `1px solid ${passwordError ? COLORS.danger : COLORS.border}`, background: "#fff", fontSize: 15,
              outline: "none", transition: ".25s ease",
            }}
          />

          <button
            type="button"
            onClick={onToggleShowPassword}
            style={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: COLORS.textLight }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {passwordError && (
          <p id="reset-password-error" role="alert" style={{ marginTop: 8, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={13} />
            {passwordError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="reset-confirm-password" style={{ display: "block", marginBottom: 10, fontWeight: 700, color: COLORS.text }}>
          Confirmar Contraseña
        </label>

        <div style={{ position: "relative" }}>
          <input
            id="reset-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            onBlur={onConfirmPasswordBlur}
            placeholder="••••••••"
            required
            aria-invalid={!!confirmPasswordError}
            aria-describedby={confirmPasswordError ? "reset-confirm-password-error" : undefined}
            style={{
              width: "100%", padding: "18px 55px 18px 18px", borderRadius: 16,
              border: `1px solid ${confirmPasswordError ? COLORS.danger : COLORS.border}`, background: "#fff", fontSize: 15,
              outline: "none", transition: ".25s ease",
            }}
          />

          <button
            type="button"
            onClick={onToggleShowConfirmPassword}
            style={{ position: "absolute", top: "50%", right: 16, transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: COLORS.textLight }}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {confirmPasswordError && (
          <p id="reset-confirm-password-error" role="alert" style={{ marginTop: 8, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={13} />
            {confirmPasswordError}
          </p>
        )}
      </div>
    </>
  );
}
