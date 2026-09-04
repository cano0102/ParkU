import { IdCard } from "lucide-react";
import { FormField } from "@/components/shared";
import { TIPOS_DOCUMENTO } from "@/utils/validation";
import { useTiposUsuario } from "@/features/conductores";
import { COLORS, inputErrorStyle, inputIconStyle, inputStyle } from "../lib/helpers";

const iconColor = COLORS.textLight;

interface DocumentoIdentidadFieldsProps {
  tipoDocumento: string;
  numeroDocumento: string;
  tipoUsuarioId: string;
  numeroDocumentoError?: string;
  tipoUsuarioIdError?: string;
  onTipoDocumentoChange: (value: string) => void;
  onNumeroDocumentoChange: (value: string) => void;
  onNumeroDocumentoBlur: () => void;
  onTipoUsuarioIdChange: (value: string) => void;
}

/**
 * Sección "Documento de identidad", visible solo para cuentas con rol Comunidad SENA.
 *
 * La tabla `usuario` de la API no tiene columnas de documento: ese dato vive en el
 * `conductor` vinculado por `usuario_id` (ver services/api/usuarios.ts). Por eso aquí
 * también se pide el tipo de usuario (Aprendiz/Instructor/…), que es una FK obligatoria
 * de `conductor`. No se piden regional/centro/programa de formación: son opcionales en
 * el modelo y se gestionan desde el módulo de Conductores.
 */
export function DocumentoIdentidadFields({
  tipoDocumento, numeroDocumento, tipoUsuarioId, numeroDocumentoError, tipoUsuarioIdError,
  onTipoDocumentoChange, onNumeroDocumentoChange, onNumeroDocumentoBlur, onTipoUsuarioIdChange,
}: DocumentoIdentidadFieldsProps) {
  const { data: tiposUsuario = [] } = useTiposUsuario();

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

        {tiposUsuario.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "9px 12px", borderRadius: 10, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p style={{ fontSize: 11, color: "#92400E", lineHeight: 1.5, margin: 0 }}>
              No se pudo cargar el catálogo de tipos de usuario, así que el documento no se
              podrá guardar todavía. La cuenta sí se puede crear; el documento se registra
              después desde el módulo Conductores.
            </p>
          </div>
        )}

        <div style={{ gridColumn: "1 / -1" }}>
          <FormField label="Tipo de usuario" error={tipoUsuarioIdError}>
            <select
              value={tipoUsuarioId}
              aria-label="Tipo de usuario"
              onChange={(e) => onTipoUsuarioIdChange(e.target.value)}
              style={tipoUsuarioIdError ? { ...inputStyle, ...inputErrorStyle, appearance: "none", cursor: "pointer" } : { ...inputStyle, appearance: "none", cursor: "pointer" }}
            >
              <option value="">Seleccionar tipo…</option>
              {tiposUsuario.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </FormField>
        </div>
      </div>
    </section>
  );
}
