import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Copy, Link2, Mail } from "lucide-react";
import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface ForgotPasswordSuccessProps {
  email: string;
  resetLink: string | null;
}

/** Estado tras generar el enlace: muestra el enlace de recuperación (con copiar), recomendaciones y accesos. */
export function ForgotPasswordSuccess({ email, resetLink }: ForgotPasswordSuccessProps) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: "0.8rem" }}>
        <img src={logoSena} alt="Logo SENA" style={{ height: 38, width: "auto", objectFit: "contain" }} />
      </div>

      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ECFDF3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem" }}>
        <Mail size={34} color={COLORS.primary} />
      </div>

      <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 900, color: COLORS.text, marginBottom: 10, lineHeight: 1 }}>
        Enlace
        <br />
        generado
      </h2>

      <p style={{ color: COLORS.textLight, lineHeight: 1.6, fontSize: 13, marginBottom: "1rem" }}>
        {resetLink ? (
          <>
            Cuenta: <strong style={{ color: COLORS.text }}>{email}</strong>. Como
            ParkU no tiene un servidor de correo propio, el enlace de recuperación
            se genera y se muestra aquí directamente.
          </>
        ) : (
          <>
            Si <strong style={{ color: COLORS.text }}>{email}</strong> tiene una
            cuenta registrada, en breve podrás usar el enlace de recuperación que
            genere el sistema.
          </>
        )}
      </p>

      {resetLink && (
        <div style={{ background: "#F8FAFC", border: `1px solid ${COLORS.border}`, padding: "12px 14px", borderRadius: 12, marginBottom: "1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ flex: 1, fontSize: 11, fontFamily: "monospace", color: COLORS.text, wordBreak: "break-all", textAlign: "left" }}>
            {resetLink}
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(resetLink);
              toast.success("Enlace copiado");
            }}
            title="Copiar enlace"
            style={{ flexShrink: 0, border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex" }}
          >
            <Copy size={14} color={COLORS.textLight} />
          </button>
        </div>
      )}

      <div style={{ background: "#ECFDF3", padding: "14px 16px", borderRadius: 12, textAlign: "left", marginBottom: "1.2rem" }}>
        <p style={{ fontWeight: 700, color: COLORS.primaryDark, marginBottom: 8, fontSize: 13 }}>
          Recomendaciones
        </p>
        <div style={{ display: "grid", gap: 6, color: COLORS.primaryDark, fontSize: 13 }}>
          <span>• El enlace es válido por 30 minutos</span>
          <span>• Solo puede usarse una vez</span>
          <span>• No lo compartas con nadie más</span>
        </div>
      </div>

      {resetLink && (
        <Link to={resetLink.replace(window.location.origin, "")} style={{ textDecoration: "none" }}>
          <button
            style={{
              width: "100%", border: "none", background: COLORS.primary, color: "#fff",
              padding: "14px 20px", borderRadius: 14, fontWeight: 800, cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 8px 22px rgba(57,169,0,.2)", marginBottom: 10,
            }}
          >
            <Link2 size={15} />
            Abrir Enlace de Recuperación
          </button>
        </Link>
      )}

      <Link to="/login" style={{ textDecoration: "none" }}>
        <button
          style={{
            width: "100%", border: `1px solid ${COLORS.border}`, background: "#fff", color: COLORS.text,
            padding: "14px 20px", borderRadius: 14, fontWeight: 700, cursor: "pointer", fontSize: 14,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <ArrowLeft size={15} />
          Volver al Login
        </button>
      </Link>
    </div>
  );
}
