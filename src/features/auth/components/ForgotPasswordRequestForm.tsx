import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Mail } from "lucide-react";
import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/styles/theme";
import type { useForgotPasswordForm } from "../hooks/useForgotPasswordForm";

const COLORS = theme;

interface ForgotPasswordRequestFormProps {
  form: ReturnType<typeof useForgotPasswordForm>;
}

/** Estado inicial: encabezado, campo de correo y envío para generar el enlace de recuperación. */
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
          Ingresa tu correo institucional y genera un enlace
          para recuperar tu acceso.
        </p>
      </div>

      <form onSubmit={form.handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 700, color: COLORS.text, fontSize: 13 }}>
            Correo Electrónico
          </label>

          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", color: form.errors.email ? COLORS.danger : COLORS.textLight }} />
            <input
              type="text"
              placeholder="correo@sena.edu.co"
              value={form.email}
              onChange={form.handleEmailChange}
              onBlur={form.handleBlur}
              className={form.errors.email ? "error" : ""}
              style={{
                width: "100%", padding: "14px 16px 14px 40px", borderRadius: 12,
                border: `1px solid ${form.errors.email ? COLORS.danger : COLORS.border}`,
                background: "#fff", fontSize: 14, outline: "none",
              }}
            />
            {form.errors.email && (
              <AlertCircle size={16} style={{ position: "absolute", top: "50%", right: 14, transform: "translateY(-50%)", color: COLORS.danger }} />
            )}
          </div>

          {form.errors.email && (
            <div style={{ marginTop: 8, fontSize: 12, color: COLORS.danger, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={14} />
              {form.errors.email}
            </div>
          )}
        </div>

        <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 12, padding: "12px 14px" }}>
          <p style={{ fontSize: 13, color: "#1E3A8A", lineHeight: 1.6, fontWeight: 500 }}>
            Se generará un enlace de recuperación de un solo uso,
            válido por 30 minutos.
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
          {form.loading ? "Generando..." : "Generar Enlace"}
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
