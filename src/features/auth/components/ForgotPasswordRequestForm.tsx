import { Link } from "react-router-dom";
import {
  IconAlertCircle as AlertCircle,
  IconArrowLeft as ArrowLeft,
  IconMail as Mail,
  IconId as IdCard,
  IconUser as UserIcon,
} from "@tabler/icons-react";
import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/styles/theme";
import { TIPOS_DOCUMENTO } from "@/utils/validation";
import type { useForgotPasswordForm } from "../hooks/useForgotPasswordForm";

const COLORS = theme;

interface ForgotPasswordRequestFormProps {
  form: ReturnType<typeof useForgotPasswordForm>;
}

const inputStyle = (hasError: boolean) => ({
  width: "100%", padding: "14px 16px 14px 40px", borderRadius: 12,
  border: `1px solid ${hasError ? COLORS.danger : COLORS.border}`,
  background: "#fff", fontSize: 14, outline: "none",
});

/** Verifica la identidad con datos que ya tiene el sistema (correo, documento y nombre),
 * sin enviar nada por correo ni SMS: si coinciden con una cuenta, pasa directo a fijar la
 * contraseña nueva. */
export function ForgotPasswordRequestForm({ form }: ForgotPasswordRequestFormProps) {
  return (
    <>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "0.8rem" }}>
          <img src={logoSena} alt="Logo SENA" style={{ height: 38, width: "auto", objectFit: "contain" }} />
        </div>

        <div style={{ color: COLORS.primary, fontWeight: 800, marginBottom: 10, letterSpacing: 1, fontSize: 12 }}>
          RECUPERACIÓN
        </div>

        <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 900, color: COLORS.text, lineHeight: 1, marginBottom: "0.6rem" }}>
          ¿Olvidaste
          <br />
          tu contraseña?
        </h2>

        <p style={{ color: COLORS.textLight, lineHeight: 1.6, fontSize: 13 }}>
          Confirma tus datos y podrás crear una contraseña nueva de inmediato,
          sin esperar ningún correo.
        </p>
      </div>

      <form onSubmit={form.handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
            Correo Electrónico
          </label>

          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", color: form.errors.correo ? COLORS.danger : COLORS.textLight }} />
            <input
              type="text"
              placeholder="correo@sena.edu.co"
              value={form.correo}
              onChange={form.handleCorreoChange}
              onBlur={() => form.handleBlur("correo")}
              className={form.errors.correo ? "error" : ""}
              style={inputStyle(!!form.errors.correo)}
            />
            {form.errors.correo && (
              <AlertCircle size={16} style={{ position: "absolute", top: "50%", right: 14, transform: "translateY(-50%)", color: COLORS.danger }} />
            )}
          </div>

          {form.errors.correo && (
            <div style={{ marginTop: 8, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={14} />
              {form.errors.correo}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
            Nombre completo
          </label>

          <div style={{ position: "relative" }}>
            <UserIcon size={16} style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", color: form.errors.nombre ? COLORS.danger : COLORS.textLight }} />
            <input
              type="text"
              placeholder="Como aparece en tu cuenta"
              value={form.nombre}
              onChange={form.handleNombreChange}
              onBlur={() => form.handleBlur("nombre")}
              className={form.errors.nombre ? "error" : ""}
              style={inputStyle(!!form.errors.nombre)}
            />
          </div>

          {form.errors.nombre && (
            <div style={{ marginTop: 8, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={14} />
              {form.errors.nombre}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
              Documento
            </label>
            <select
              value={form.tipoDocumento}
              onChange={(e) => form.handleTipoDocumentoChange(e.target.value)}
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
            <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
              N.º de documento
            </label>
            <div style={{ position: "relative" }}>
              <IdCard size={16} style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", color: form.errors.numeroDocumento ? COLORS.danger : COLORS.textLight }} />
              <input
                type="text"
                inputMode="numeric"
                placeholder="1001234567"
                value={form.numeroDocumento}
                onChange={form.handleNumeroDocumentoChange}
                onBlur={() => form.handleBlur("numeroDocumento")}
                className={form.errors.numeroDocumento ? "error" : ""}
                style={inputStyle(!!form.errors.numeroDocumento)}
              />
            </div>
          </div>
        </div>
        {form.errors.numeroDocumento && (
          <div style={{ marginTop: -8, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={14} />
            {form.errors.numeroDocumento}
          </div>
        )}

        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ fontSize: 13, color: "#1E3A8A", lineHeight: 1.6, fontWeight: 500 }}>
            Verificamos tus datos contra tu cuenta. Si coinciden, pasas
            directo a crear tu contraseña nueva.
          </p>
        </div>

        <button
          type="submit"
          disabled={form.loading}
          style={{
            border: "none", background: form.loading ? "#94A3B8" : COLORS.primary, color: "#fff",
            padding: "14px 20px", borderRadius: 14, fontWeight: 800,
            cursor: form.loading ? "not-allowed" : "pointer", fontSize: 14,
            boxShadow: "0 8px 22px rgba(57,169,0,.2)",
          }}
        >
          {form.loading ? "Verificando..." : "Verificar identidad"}
        </button>

        <Link to="/login" style={{ textDecoration: "none" }}>
          <button
            type="button"
            style={{
              width: "100%", border: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.text,
              padding: "14px 20px", borderRadius: 14, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 13,
            }}
          >
            <ArrowLeft size={15} />
            Volver al Login
          </button>
        </Link>
      </form>
    </>
  );
}
