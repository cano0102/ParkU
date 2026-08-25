import { Eye, EyeOff } from "lucide-react";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface ResetPasswordFieldsProps {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
}

/** Campos de nueva contraseña y confirmación, con alternar mostrar/ocultar. */
export function ResetPasswordFields({
  password, confirmPassword, showPassword, showConfirmPassword,
  onPasswordChange, onConfirmPasswordChange, onToggleShowPassword, onToggleShowConfirmPassword,
}: ResetPasswordFieldsProps) {
  return (
    <>
      <div>
        <label style={{ display: "block", marginBottom: 10, fontWeight: 700, color: COLORS.text }}>
          Nueva Contraseña
        </label>

        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="••••••••"
            required
            style={{
              width: "100%", padding: "18px 55px 18px 18px", borderRadius: 16,
              border: `1px solid ${COLORS.border}`, background: "#fff", fontSize: 15,
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
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 10, fontWeight: 700, color: COLORS.text }}>
          Confirmar Contraseña
        </label>

        <div style={{ position: "relative" }}>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            placeholder="••••••••"
            required
            style={{
              width: "100%", padding: "18px 55px 18px 18px", borderRadius: 16,
              border: `1px solid ${COLORS.border}`, background: "#fff", fontSize: 15,
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
      </div>
    </>
  );
}
