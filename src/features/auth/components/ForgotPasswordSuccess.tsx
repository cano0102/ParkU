import { Link } from "react-router-dom";
import {
  IconArrowLeft as ArrowLeft,
  IconMail as Mail,
  IconRefresh as Refresh,
} from "@tabler/icons-react";
import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/styles/theme";

const COLORS = theme;

interface ForgotPasswordSuccessProps {
  email: string;
  /** Vuelve al formulario para pedir otro enlace (no llegó, expiró, se escribió mal el correo). */
  onVolverAEnviar: () => void;
}

/** Estado tras pedir el enlace: "revisa tu correo", qué hacer si no llega, y accesos.
 *  No dice si la cuenta existe: el backend responde igual en los dos casos. */
export function ForgotPasswordSuccess({ email, onVolverAEnviar }: ForgotPasswordSuccessProps) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ marginBottom: "0.8rem" }}>
        <img src={logoSena} alt="Logo SENA" style={{ height: 38, width: "auto", objectFit: "contain" }} />
      </div>

      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#ECFDF3", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem" }}>
        <Mail size={34} color={COLORS.primary} />
      </div>

      <h2 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 900, color: COLORS.text, marginBottom: 10, lineHeight: 1 }}>
        Revisa tu
        <br />
        correo
      </h2>

      <p style={{ color: COLORS.textLight, lineHeight: 1.6, fontSize: 13, marginBottom: "1rem" }}>
        Si <strong style={{ color: COLORS.text }}>{email.trim()}</strong> tiene una cuenta en
        ParkU, te enviamos un enlace para crear una contraseña nueva.
      </p>

      <div style={{ background: "#ECFDF3", padding: "14px 16px", borderRadius: 12, textAlign: "left", marginBottom: "1.2rem" }}>
        <p style={{ fontWeight: 700, color: COLORS.primaryDark, marginBottom: 8, fontSize: 13 }}>
          Recomendaciones
        </p>
        <div style={{ display: "grid", gap: 6, color: COLORS.primaryDark, fontSize: 13 }}>
          <span>• El enlace es válido por 60 minutos</span>
          <span>• Solo puede usarse una vez; si pides otro, el anterior deja de servir</span>
          <span>• Si no llega en unos minutos, revisa la carpeta de spam</span>
          <span>• No lo compartas con nadie más</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onVolverAEnviar}
        style={{
          width: "100%", border: "none", background: COLORS.primary, color: "#fff",
          padding: "14px 20px", borderRadius: 14, fontWeight: 800, cursor: "pointer", fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 8px 22px rgba(57,169,0,.2)", marginBottom: 10,
        }}
      >
        <Refresh size={15} />
        Enviar otro enlace
      </button>

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
