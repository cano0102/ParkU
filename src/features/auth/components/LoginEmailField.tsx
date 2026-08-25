import type { Ref } from "react";
import { AlertCircle, Mail } from "lucide-react";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface LoginEmailFieldProps {
  value: string;
  inputRef: Ref<HTMLInputElement>;
  error?: string;
  touched: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}

/** Campo de correo electrónico del login, con error en línea. */
export function LoginEmailField({ value, inputRef, error, touched, onChange, onBlur }: LoginEmailFieldProps) {
  const showError = !!error && touched;

  return (
    <div>
      <label htmlFor="login-email" style={{ display: "block", marginBottom: 8, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
        Correo Electrónico
      </label>

      <div style={{ position: "relative" }}>
        <Mail size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />

        <input
          id="login-email"
          ref={inputRef}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="correo@sena.edu.co"
          className={showError ? "input-error" : ""}
          aria-invalid={showError}
          aria-describedby={showError ? "login-email-error" : undefined}
          style={{
            width: "100%",
            padding: "14px 16px 14px 42px",
            borderRadius: 12,
            border: `1px solid ${showError ? COLORS.danger : COLORS.border}`,
            background: "#fff",
            fontSize: 14,
            outline: "none",
            transition: "border-color .2s",
          }}
        />
      </div>

      {showError && (
        <p id="login-email-error" role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
