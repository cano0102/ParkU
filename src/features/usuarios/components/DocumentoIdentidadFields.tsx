import { Camera, IdCard } from "lucide-react";
import { FormField } from "@/components/shared";
import { COLORS, inputErrorStyle, inputIconStyle, inputStyle } from "../lib/helpers";

const iconColor = COLORS.textLight;

interface DocumentoIdentidadFieldsProps {
  tipoDocumento: string;
  identificacion: string;
  identificacionError?: string;
  onTipoDocumentoChange: (value: string) => void;
  onIdentificacionChange: (value: string) => void;
  onIdentificacionBlur: () => void;
  onOpenScanner: () => void;
}

/** Sección "Documento de identidad": tipo + número, con botón de escaneo QR. */
export function DocumentoIdentidadFields({
  tipoDocumento, identificacion, identificacionError,
  onTipoDocumentoChange, onIdentificacionChange, onIdentificacionBlur, onOpenScanner,
}: DocumentoIdentidadFieldsProps) {
  return (
    <section style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
          Documento de identidad
        </p>
      </div>
      <div className="uf-modal-grid" style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FormField label="Tipo de documento">
          <select
            value={tipoDocumento}
            onChange={(e) => onTipoDocumentoChange(e.target.value)}
            style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
          >
            <option value="CC">Cédula de Ciudadanía (CC)</option>
            <option value="TI">Tarjeta de Identidad (TI)</option>
            <option value="CE">Cédula de Extranjería (CE)</option>
            <option value="PPTE">Cédula de Extranjera (PPTE)</option>
          </select>
        </FormField>
        <FormField label="Número de identificación" error={identificacionError}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <IdCard size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: iconColor, zIndex: 1 }} />
            <input
              placeholder="ej. 1001234567"
              value={identificacion}
              onChange={(e) => onIdentificacionChange(e.target.value.replace(/[^0-9]/g, ""))}
              onBlur={onIdentificacionBlur}
              style={{ ...(identificacionError ? { ...inputIconStyle, ...inputErrorStyle } : inputIconStyle), paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={onOpenScanner}
              title="Escanear cédula (código QR)"
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: COLORS.primary,
                display: "flex", alignItems: "center", padding: 4, borderRadius: 6, transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(57,169,0,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Camera size={18} />
            </button>
          </div>
        </FormField>
      </div>
    </section>
  );
}
