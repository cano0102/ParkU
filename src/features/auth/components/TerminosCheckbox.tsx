import { AlertCircle } from "lucide-react";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface TerminosCheckboxProps {
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
}

/** Checkbox de aceptación de términos y tratamiento de datos personales. */
export function TerminosCheckbox({ checked, error, onChange }: TerminosCheckboxProps) {
  return (
    <div>
      <label
        htmlFor="register-terminos"
        style={{
          display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer",
          fontSize: 12.5, color: COLORS.textLight, fontWeight: 600, userSelect: "none",
        }}
      >
        <input
          id="register-terminos"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: 15, height: 15, marginTop: 1, accentColor: COLORS.primary, cursor: "pointer", flexShrink: 0 }}
        />
        Acepto los términos y el tratamiento de mis datos personales
        conforme a la política institucional del SENA.
      </label>
      {error && (
        <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
