import { AlertCircle, Mail, Phone, User } from "lucide-react";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface NombreCorreoTelefonoFieldsProps {
  nombre: string;
  correo: string;
  numero: string;
  nombreError?: string;
  correoError?: string;
  numeroError?: string;
  /** Hay una consulta en curso a /auth/existe-correo (chequeo de disponibilidad en vivo). */
  checkingCorreo?: boolean;
  /** Ídem, para /auth/existe-numero. */
  checkingNumero?: boolean;
  onNombreChange: (value: string) => void;
  onNombreBlur: () => void;
  onCorreoChange: (value: string) => void;
  onCorreoBlur: () => void;
  onNumeroChange: (value: string) => void;
  onNumeroBlur: () => void;
}

/** Campos nombre completo, correo y teléfono del formulario de registro. */
export function NombreCorreoTelefonoFields({
  nombre, correo, numero, nombreError, correoError, numeroError, checkingCorreo, checkingNumero,
  onNombreChange, onNombreBlur, onCorreoChange, onCorreoBlur, onNumeroChange, onNumeroBlur,
}: NombreCorreoTelefonoFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="register-nombre" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
          Nombre Completo
        </label>
        <div style={{ position: "relative" }}>
          <User size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            id="register-nombre"
            type="text"
            autoComplete="name"
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            onBlur={onNombreBlur}
            placeholder="Ej. Juan Pérez"
            className={nombreError ? "input-error" : ""}
            aria-invalid={!!nombreError}
            style={{
              width: "100%", padding: "13px 16px 13px 42px", borderRadius: 12,
              border: `1px solid ${nombreError ? COLORS.danger : COLORS.border}`,
              background: "#fff", fontSize: 14, outline: "none", transition: "border-color .2s",
            }}
          />
        </div>
        {nombreError && (
          <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <AlertCircle size={13} />
            {nombreError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="register-email" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
          Correo Electrónico
        </label>
        <div style={{ position: "relative" }}>
          <Mail size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            id="register-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={correo}
            onChange={(e) => onCorreoChange(e.target.value)}
            onBlur={onCorreoBlur}
            placeholder="correo@sena.edu.co"
            className={correoError ? "input-error" : ""}
            aria-invalid={!!correoError}
            style={{
              width: "100%", padding: "13px 16px 13px 42px", borderRadius: 12,
              border: `1px solid ${correoError ? COLORS.danger : COLORS.border}`,
              background: "#fff", fontSize: 14, outline: "none", transition: "border-color .2s",
            }}
          />
        </div>
        {correoError ? (
          <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <AlertCircle size={13} />
            {correoError}
          </p>
        ) : checkingCorreo ? (
          <p style={{ marginTop: 6, fontSize: 12, color: COLORS.textLight }}>Verificando disponibilidad…</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="register-telefono" style={{ display: "block", marginBottom: 6, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
          Teléfono
        </label>
        <div style={{ position: "relative" }}>
          <Phone size={16} color={COLORS.textLight} style={{ position: "absolute", top: "50%", left: 16, transform: "translateY(-50%)", pointerEvents: "none" }} />
          <input
            id="register-telefono"
            type="tel"
            autoComplete="tel"
            value={numero}
            onChange={(e) => onNumeroChange(e.target.value)}
            onBlur={onNumeroBlur}
            placeholder="3101234567"
            className={numeroError ? "input-error" : ""}
            aria-invalid={!!numeroError}
            style={{
              width: "100%", padding: "13px 16px 13px 42px", borderRadius: 12,
              border: `1px solid ${numeroError ? COLORS.danger : COLORS.border}`,
              background: "#fff", fontSize: 14, outline: "none", transition: "border-color .2s",
            }}
          />
        </div>
        {numeroError ? (
          <p role="alert" style={{ marginTop: 6, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <AlertCircle size={13} />
            {numeroError}
          </p>
        ) : checkingNumero ? (
          <p style={{ marginTop: 6, fontSize: 12, color: COLORS.textLight }}>Verificando disponibilidad…</p>
        ) : null}
      </div>
    </>
  );
}
