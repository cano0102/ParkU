import {
  IconAlertCircle as AlertCircle,
  IconEye as Eye,
  IconEyeOff as EyeOff,
  IconLock as Lock,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { PASSWORD_MIN } from "@/utils/validation";

const COLORS = theme;

interface PasswordFieldsProps {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  passwordError?: string;
  confirmPasswordError?: string;
  onPasswordChange: (value: string) => void;
  onPasswordBlur: () => void;
  onToggleShowPassword: () => void;
  onConfirmPasswordChange: (value: string) => void;
  onConfirmPasswordBlur: () => void;
  onToggleShowConfirmPassword: () => void;
}

/** Campos de contraseña y confirmación, con alternar mostrar/ocultar. */
export function PasswordFields({
  password, confirmPassword, showPassword, showConfirmPassword,
  passwordError, confirmPasswordError,
  onPasswordChange, onPasswordBlur, onToggleShowPassword,
  onConfirmPasswordChange, onConfirmPasswordBlur, onToggleShowConfirmPassword,
}: PasswordFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="register-password" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
          Contraseña
        </label>
        <div style={{ position: "relative" }}>
          <Lock size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onBlur={onPasswordBlur}
            placeholder="••••••••"
            className={passwordError ? "input-error" : ""}
            aria-invalid={!!passwordError}
            style={{
              width: "100%", padding: "13px 48px 13px 42px", borderRadius: 12,
              border: `1px solid ${passwordError ? COLORS.danger : COLORS.border}`,
              background: "#fff", fontSize: 14, outline: "none", transition: "border-color .2s",
            }}
          />
          <button
            type="button"
            onClick={onToggleShowPassword}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            style={{
              position: "absolute", top: "50%", right: 14, transform: "translateY(-50%)",
              background: "transparent", border: "none", cursor: "pointer", color: COLORS.textLight, padding: 2,
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {passwordError ? (
          <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <AlertCircle size={13} />
            {passwordError}
          </p>
        ) : (
          <p style={{ marginTop: 6, fontSize: 11, color: COLORS.textLight }}>
            Mínimo {PASSWORD_MIN} caracteres.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="register-confirm-password" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
          Confirmar Contraseña
        </label>
        <div style={{ position: "relative" }}>
          <Lock size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            id="register-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            onBlur={onConfirmPasswordBlur}
            placeholder="••••••••"
            className={confirmPasswordError ? "input-error" : ""}
            aria-invalid={!!confirmPasswordError}
            style={{
              width: "100%", padding: "13px 48px 13px 42px", borderRadius: 12,
              border: `1px solid ${confirmPasswordError ? COLORS.danger : COLORS.border}`,
              background: "#fff", fontSize: 14, outline: "none", transition: "border-color .2s",
            }}
          />
          <button
            type="button"
            onClick={onToggleShowConfirmPassword}
            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            style={{
              position: "absolute", top: "50%", right: 14, transform: "translateY(-50%)",
              background: "transparent", border: "none", cursor: "pointer", color: COLORS.textLight, padding: 2,
            }}
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {confirmPasswordError && (
          <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <AlertCircle size={13} />
            {confirmPasswordError}
          </p>
        )}
      </div>
    </>
  );
}
