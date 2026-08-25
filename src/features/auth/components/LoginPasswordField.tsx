import { AlertCircle, AlertTriangle, Eye, EyeOff, Lock } from "lucide-react";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface LoginPasswordFieldProps {
  value: string;
  showPassword: boolean;
  capsLockOn: boolean;
  error?: string;
  touched: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onKeyEvent: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onToggleShow: () => void;
}

/** Campo de contraseña del login: mostrar/ocultar, aviso de Bloq Mayús y error en línea. */
export function LoginPasswordField({ value, showPassword, capsLockOn, error, touched, onChange, onBlur, onKeyEvent, onToggleShow }: LoginPasswordFieldProps) {
  const showError = !!error && touched;

  return (
    <div>
      <label htmlFor="login-password" style={{ display: "block", marginBottom: 8, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
        Contraseña
      </label>

      <div style={{ position: "relative" }}>
        <Lock size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />

        <input
          id="login-password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyUp={onKeyEvent}
          onKeyDown={onKeyEvent}
          placeholder="••••••••"
          className={showError ? "input-error" : ""}
          aria-invalid={showError}
          aria-describedby={showError ? "login-password-error" : undefined}
          style={{
            width: "100%",
            padding: "14px 48px 14px 42px",
            borderRadius: 12,
            border: `1px solid ${showError ? COLORS.danger : COLORS.border}`,
            background: "#fff",
            fontSize: 14,
            outline: "none",
            transition: "border-color .2s",
          }}
        />

        <button
          type="button"
          onClick={onToggleShow}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          style={{
            position: "absolute",
            top: "50%",
            right: 14,
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: COLORS.textLight,
            padding: 2,
          }}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {capsLockOn && (
        <p role="status" style={{ marginTop: 6, fontSize: 12, color: "#B45309", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <AlertTriangle size={13} />
          Bloq Mayús está activado
        </p>
      )}

      {showError && (
        <p id="login-password-error" role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
