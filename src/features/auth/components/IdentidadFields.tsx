import type { Ref } from "react";
import { IconAlertCircle as AlertCircle, IconId as IdCard } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { TIPOS_DOCUMENTO } from "@/utils/validation";

const COLORS = theme;

interface IdentidadFieldsProps {
  tipoDocumento: string;
  identificacion: string;
  identificacionRef: Ref<HTMLInputElement>;
  identificacionError?: string;
  /** Hay una consulta en curso a /auth/existe-documento (chequeo de disponibilidad en vivo). */
  checkingDocumento?: boolean;
  /** Catálogo /catalogos/tipos-usuario. Vacío si no cargó: entonces el campo no se muestra. */
  tiposUsuario?: { id: string; nombre: string }[];
  tipoUsuarioId?: string;
  tipoUsuarioIdError?: string;
  onTipoDocumentoChange: (value: string) => void;
  onIdentificacionChange: (value: string) => void;
  onIdentificacionBlur: () => void;
  onTipoUsuarioIdChange?: (value: string) => void;
}

/**
 * Documento (tipo + número) y perfil SENA del formulario de registro.
 *
 * El "tipo de usuario" (Aprendiz/Instructor/Administrativo) se pide AQUÍ y no en el alta de
 * cuentas del panel: es un dato del conductor, y el registro crea el perfil de conductor de
 * quien se inscribe. Si el catálogo no cargó, el campo no se pinta y la cuenta se crea igual.
 */
export function IdentidadFields({
  tipoDocumento, identificacion, identificacionRef,
  identificacionError, checkingDocumento,
  tiposUsuario = [], tipoUsuarioId = "", tipoUsuarioIdError,
  onTipoDocumentoChange, onIdentificacionChange, onIdentificacionBlur, onTipoUsuarioIdChange,
}: IdentidadFieldsProps) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10 }}>
        <div>
          <label htmlFor="register-tipo-doc" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
            Documento
          </label>
          <select
            id="register-tipo-doc"
            value={tipoDocumento}
            onChange={(e) => onTipoDocumentoChange(e.target.value)}
            style={{
              width: "100%", padding: "13px 12px", borderRadius: 12,
              border: `1px solid ${COLORS.border}`, background: "#fff",
              fontSize: 14, outline: "none", cursor: "pointer", appearance: "none",
            }}
          >
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="register-identificacion" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
            N.º de identificación
          </label>
          <div style={{ position: "relative" }}>
            <IdCard size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              id="register-identificacion"
              ref={identificacionRef}
              type="text"
              inputMode="numeric"
              value={identificacion}
              onChange={(e) => onIdentificacionChange(e.target.value)}
              onBlur={onIdentificacionBlur}
              placeholder="1001234567"
              className={identificacionError ? "input-error" : ""}
              aria-invalid={!!identificacionError}
              style={{
                width: "100%", padding: "13px 14px 13px 38px", borderRadius: 12,
                border: `1px solid ${identificacionError ? COLORS.danger : COLORS.border}`,
                background: "#fff", fontSize: 14, outline: "none", transition: "border-color .2s",
              }}
            />
          </div>
        </div>
      </div>
      {identificacionError ? (
        <p role="alert" style={{ marginTop: -6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
          <AlertCircle size={13} />
          {identificacionError}
        </p>
      ) : checkingDocumento ? (
        <p style={{ marginTop: -6, fontSize: 12, color: COLORS.textLight }}>Verificando disponibilidad…</p>
      ) : null}

      {tiposUsuario.length > 0 && (
        <div>
          <label htmlFor="register-tipo-usuario" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
            Tipo de usuario
          </label>
          <select
            id="register-tipo-usuario"
            value={tipoUsuarioId}
            onChange={(e) => onTipoUsuarioIdChange?.(e.target.value)}
            aria-invalid={!!tipoUsuarioIdError}
            style={{
              width: "100%", padding: "13px 12px", borderRadius: 12,
              border: `1px solid ${tipoUsuarioIdError ? COLORS.danger : COLORS.border}`,
              background: "#fff", fontSize: 14, outline: "none", cursor: "pointer", appearance: "none",
            }}
          >
            <option value="">Seleccionar…</option>
            {tiposUsuario.map((t) => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
          {tipoUsuarioIdError && (
            <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <AlertCircle size={13} />
              {tipoUsuarioIdError}
            </p>
          )}
        </div>
      )}
    </>
  );
}
