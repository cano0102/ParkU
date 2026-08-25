import { FormField } from "@/components/shared";
import { COLORS, inputStyle } from "../lib/helpers";

interface DiscapacidadFieldsProps {
  discapacidad: boolean;
  tipoDiscapacidad: string;
  onToggleDiscapacidad: () => void;
  onTipoDiscapacidadChange: (value: string) => void;
}

/** Toggle "¿tiene alguna discapacidad?" y, si está activo, el campo de tipo. */
export function DiscapacidadFields({ discapacidad, tipoDiscapacidad, onToggleDiscapacidad, onTipoDiscapacidadChange }: DiscapacidadFieldsProps) {
  return (
    <>
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "9px 12px", borderRadius: 11, background: COLORS.bg, border: `1px solid ${COLORS.border}`,
        }}
      >
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>¿Tiene alguna discapacidad?</p>
          <p style={{ fontSize: 10, color: COLORS.textLight }}>Activa para registrar el tipo</p>
        </div>
        <button
          type="button"
          onClick={onToggleDiscapacidad}
          style={{
            width: 40, height: 22, borderRadius: 999,
            background: discapacidad ? COLORS.primary : "#CBD5E1",
            border: "none", cursor: "pointer", position: "relative", transition: "background .2s",
          }}
          aria-label={discapacidad ? "Desactivar discapacidad" : "Activar discapacidad"}
        >
          <div
            style={{
              width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute",
              top: 2, left: discapacidad ? 20 : 2, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
            }}
          />
        </button>
      </div>

      {discapacidad && (
        <FormField label="Tipo de discapacidad">
          <input
            type="text"
            placeholder="ej. Visual, Motriz, Auditiva…"
            value={tipoDiscapacidad}
            onChange={(e) => onTipoDiscapacidadChange(e.target.value)}
            style={inputStyle}
          />
        </FormField>
      )}
    </>
  );
}
