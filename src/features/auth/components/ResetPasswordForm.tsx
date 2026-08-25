import { Link } from "react-router-dom";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { theme } from "@/styles/theme";
import type { useResetPasswordForm } from "../hooks/useResetPasswordForm";
import { ResetPasswordFields } from "./ResetPasswordFields";

const COLORS = theme;

interface ResetPasswordFormProps {
  form: ReturnType<typeof useResetPasswordForm>;
}

/** Encabezado, campos, checklist de requisitos, envío y pie de la columna derecha. */
export function ResetPasswordForm({ form: f }: ResetPasswordFormProps) {
  return (
    <div style={{ width: "100%", maxWidth: 360 }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ color: COLORS.primary, fontWeight: 800, marginBottom: 10, letterSpacing: 1, fontSize: 12 }}>
          SEGURIDAD DE ACCESO
        </div>

        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 900, color: COLORS.text, lineHeight: 1, marginBottom: "0.6rem" }}>
          Restablecer
          <br />
          acceso
        </h2>

        <p style={{ color: COLORS.textLight, lineHeight: 1.6, fontSize: 13 }}>
          Ingresa y confirma tu nueva
          contraseña para recuperar
          el acceso al sistema.
        </p>
      </div>

      <form onSubmit={f.handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
        <ResetPasswordFields
          password={f.password}
          confirmPassword={f.confirmPassword}
          showPassword={f.showPassword}
          showConfirmPassword={f.showConfirmPassword}
          onPasswordChange={f.setPassword}
          onConfirmPasswordChange={f.setConfirmPassword}
          onToggleShowPassword={() => f.setShowPassword(!f.showPassword)}
          onToggleShowConfirmPassword={() => f.setShowConfirmPassword(!f.showConfirmPassword)}
        />

        <div style={{ background: "#F8FAFC", border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, fontWeight: 800, color: COLORS.text }}>
            <LockKeyhole size={18} />
            Requisitos de seguridad
          </div>

          <div style={{ display: "grid", gap: 10, fontSize: 14 }}>
            <div style={{ color: f.passwordLengthOk ? COLORS.primary : COLORS.textLight, fontWeight: 600 }}>
              • Mínimo 8 caracteres
            </div>
            <div style={{ color: f.passwordsMatch ? COLORS.primary : COLORS.textLight, fontWeight: 600 }}>
              • Las contraseñas coinciden
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={f.loading || !f.puedeEnviar}
          style={{
            border: "none",
            background: f.loading || !f.puedeEnviar ? "#94A3B8" : COLORS.primary,
            color: "#fff",
            padding: "18px 24px",
            borderRadius: 18,
            fontWeight: 800,
            cursor: f.loading || !f.puedeEnviar ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 15,
            boxShadow: "0 10px 25px rgba(57,169,0,.2)",
          }}
        >
          {f.loading ? "Actualizando..." : "Actualizar Contraseña"}
        </button>
      </form>

      <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: `1px solid ${COLORS.border}` }}>
        <Link to="/login" style={{ textDecoration: "none" }}>
          <button
            style={{
              width: "100%", border: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.text,
              padding: "18px 24px", borderRadius: 18, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 15,
            }}
          >
            <ArrowLeft size={18} />
            Volver al Login
          </button>
        </Link>

        <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: 10, background: "#ECFDF3", padding: "16px 18px", borderRadius: 16, color: COLORS.primaryDark, fontWeight: 700, fontSize: 14 }}>
          <ShieldCheck size={18} />
          Plataforma protegida y
          segura
        </div>

        <p style={{ marginTop: "1.5rem", textAlign: "center", color: COLORS.textLight, fontSize: 13 }}>
          © 2026 · Plataforma
          Institucional ParkU
        </p>
      </div>
    </div>
  );
}
