import { IconId as IdCard } from "@tabler/icons-react";
import { FormField } from "@/components/shared";
import { TIPOS_DOCUMENTO } from "@/utils/validation";
import { COLORS, inputErrorStyle, inputIconStyle, inputStyle } from "../lib/helpers";

const iconColor = COLORS.textLight;

interface DocumentoIdentidadFieldsProps {
  tipoDocumento: string;
  numeroDocumento: string;
  numeroDocumentoError?: string;
  onTipoDocumentoChange: (value: string) => void;
  onNumeroDocumentoChange: (value: string) => void;
  onNumeroDocumentoBlur: () => void;
}

/**
 * Sección "Documento de identidad" del formulario de cuenta.
 *
 * `tipo_documento` y `numero_documento` son columnas de `usuario` (migración 002 del
 * backend), así que se guardan con la cuenta y ya no hace falta crear un conductor para
 * tener dónde ponerlas.
 *
 * Aquí también se pedía el "tipo de usuario" (Aprendiz/Instructor/…). Se quitó: es un campo
 * del CONDUCTOR, no de la cuenta — la tabla `usuario` no tiene nada equivalente, lo único
 * que clasifica a una cuenta es su rol. Se sigue pidiendo donde corresponde: en el módulo de
 * Conductores y en el registro público, donde la persona se da de alta a sí misma.
 */
export function DocumentoIdentidadFields({
  tipoDocumento, numeroDocumento, numeroDocumentoError,
  onTipoDocumentoChange, onNumeroDocumentoChange, onNumeroDocumentoBlur,
}: DocumentoIdentidadFieldsProps) {
  return (
    <section style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
          Documento de identidad *
        </p>
      </div>
      <div className="uf-modal-grid" style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FormField label="Tipo de documento">
          <select
            value={tipoDocumento}
            aria-label="Tipo de documento"
            onChange={(e) => onTipoDocumentoChange(e.target.value)}
            style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
          >
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Número de documento" error={numeroDocumentoError}>
          <div style={{ position: "relative" }}>
            <IdCard size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: iconColor }} />
            <input
              inputMode="numeric"
              placeholder="1001234567"
              aria-label="Número de documento"
              value={numeroDocumento}
              /* Solo dígitos y máximo 10: el mismo formato que valida
                 `validarNumeroDocumento` (6-10 dígitos) en @/utils/validation. */
              onChange={(e) => onNumeroDocumentoChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onBlur={onNumeroDocumentoBlur}
              style={numeroDocumentoError ? { ...inputIconStyle, ...inputErrorStyle } : inputIconStyle}
            />
          </div>
        </FormField>
      </div>
    </section>
  );
}
