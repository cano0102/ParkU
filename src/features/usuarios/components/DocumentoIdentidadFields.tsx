import { IconId as IdCard } from "@tabler/icons-react";
import { FormField } from "@/components/shared";
import { TIPOS_DOCUMENTO } from "@/utils/validation";
import { useTiposUsuario } from "@/features/conductores";
import { COLORS, inputErrorStyle, inputIconStyle, inputStyle } from "../lib/helpers";

const iconColor = COLORS.textLight;

interface DocumentoIdentidadFieldsProps {
  tipoDocumento: string;
  numeroDocumento: string;
  numeroDocumentoError?: string;
  /** true solo al CREAR una cuenta de rol Conductor: entonces se pide su perfil SENA. */
  pedirTipoUsuario?: boolean;
  tipoUsuarioId?: string;
  tipoUsuarioIdError?: string;
  onTipoDocumentoChange: (value: string) => void;
  onNumeroDocumentoChange: (value: string) => void;
  onNumeroDocumentoBlur: () => void;
  onTipoUsuarioIdChange?: (value: string) => void;
}

/**
 * Sección "Documento de identidad" del formulario de cuenta.
 *
 * `tipo_documento` y `numero_documento` son columnas de `usuario` (migración 002 del
 * backend), así que se guardan con la cuenta y ya no hace falta crear un conductor para
 * tener dónde ponerlas.
 *
 * El "tipo de usuario" (Aprendiz/Instructor/…) no es un dato de la cuenta: `usuario` no
 * tiene nada equivalente, lo único que la clasifica es su rol. Se pide solo al CREAR una
 * cuenta de rol Conductor, porque el backend le crea de paso su perfil de conductor y ahí sí
 * existe ese campo. Para los demás roles no aparece, y al editar tampoco: ese perfil se
 * corrige desde el módulo de Conductores.
 */
export function DocumentoIdentidadFields({
  tipoDocumento, numeroDocumento, numeroDocumentoError,
  pedirTipoUsuario = false, tipoUsuarioId = "", tipoUsuarioIdError,
  onTipoDocumentoChange, onNumeroDocumentoChange, onNumeroDocumentoBlur, onTipoUsuarioIdChange,
}: DocumentoIdentidadFieldsProps) {
  const { data: tiposUsuario } = useTiposUsuario();

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

        {pedirTipoUsuario && tiposUsuario.length > 0 && (
          <div style={{ gridColumn: "1 / -1" }}>
            <FormField label="Tipo de usuario" error={tipoUsuarioIdError}>
              <select
                value={tipoUsuarioId}
                aria-label="Tipo de usuario"
                onChange={(e) => onTipoUsuarioIdChange?.(e.target.value)}
                style={tipoUsuarioIdError
                  ? { ...inputStyle, ...inputErrorStyle, appearance: "none", cursor: "pointer" }
                  : { ...inputStyle, appearance: "none", cursor: "pointer" }}
              >
                <option value="">Seleccionar tipo…</option>
                {tiposUsuario.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
            </FormField>
          </div>
        )}
      </div>
    </section>
  );
}
