import type { Ref } from "react";
import { AlertCircle, IdCard } from "lucide-react";
import { theme } from "@/styles/theme";
import { TIPOS_DOCUMENTO } from "@/utils/validation";

const COLORS = theme;

interface IdentidadFieldsProps {
  tipoDocumento: string;
  identificacion: string;
  tipoUsuario: string;
  identificacionRef: Ref<HTMLInputElement>;
  identificacionError?: string;
  tipoUsuarioError?: string;
  /** Hay una consulta en curso a /auth/existe-documento (chequeo de disponibilidad en vivo). */
  checkingDocumento?: boolean;
  onTipoDocumentoChange: (value: string) => void;
  onIdentificacionChange: (value: string) => void;
  onIdentificacionBlur: () => void;
  onTipoUsuarioChange: (value: string) => void;
  onTipoUsuarioBlur: () => void;
}

/** Documento (tipo + número) y "¿cómo te identificas?" del formulario de registro. */
export function IdentidadFields({
  tipoDocumento, identificacion, tipoUsuario, identificacionRef,
  identificacionError, tipoUsuarioError, checkingDocumento,
  onTipoDocumentoChange, onIdentificacionChange, onIdentificacionBlur,
  onTipoUsuarioChange, onTipoUsuarioBlur,
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

      <div>
        <label htmlFor="register-tipo-usuario" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
          ¿Cómo te identificas?
        </label>
        <select
          id="register-tipo-usuario"
          value={tipoUsuario}
          onChange={(e) => onTipoUsuarioChange(e.target.value)}
          onBlur={onTipoUsuarioBlur}
          className={tipoUsuarioError ? "input-error" : ""}
          aria-invalid={!!tipoUsuarioError}
          style={{
            width: "100%", padding: "13px 14px", borderRadius: 12,
            border: `1px solid ${tipoUsuarioError ? COLORS.danger : COLORS.border}`,
            background: "#fff", fontSize: 14, outline: "none", cursor: "pointer", appearance: "none",
          }}
        >
          <option value="">Selecciona una opción...</option>
          <option value="visitante">Visitante</option>
          <option value="estudiante">Estudiante</option>
          <option value="docente">Docente</option>
          <option value="administrativo">Administrativo</option>
          <option value="otro">Otro</option>
        </select>
        {tipoUsuarioError && (
          <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <AlertCircle size={13} />
            {tipoUsuarioError}
          </p>
        )}
      </div>
    </>
  );
}
