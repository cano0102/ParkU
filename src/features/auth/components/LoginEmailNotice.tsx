import { ArrowRight, Clock, Inbox, MailCheck, Monitor, ShieldCheck } from "lucide-react";
import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/styles/theme";

const COLORS = theme;

/** Qué incluye el correo de notificación de acceso que se envía a la cuenta. */
const DETALLES = [
  { icon: Clock, texto: "Fecha y hora exactas del ingreso" },
  { icon: Monitor, texto: "Dispositivo y navegador utilizados" },
  { icon: ShieldCheck, texto: "Pasos a seguir si no fuiste tú" },
];

interface LoginEmailNoticeProps {
  /** Correo de la cuenta con la que se acabó de iniciar sesión. */
  email: string;
  onContinue: () => void;
}

/** Pantalla que reemplaza al formulario apenas el login es correcto: informa que se
 *  envió un correo de notificación de acceso a la cuenta del usuario y deja continuar
 *  al panel. La sesión YA está iniciada cuando se muestra — no es un paso de
 *  verificación que bloquee el acceso, solo un aviso de seguridad. */
export function LoginEmailNotice({ email, onContinue }: LoginEmailNoticeProps) {
  return (
    <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
      <div style={{ marginBottom: "0.8rem" }}>
        <img src={logoSena} alt="Logo SENA" style={{ height: 38, width: "auto", objectFit: "contain" }} />
      </div>

      <div
        style={{
          width: 72, height: 72, borderRadius: "50%", background: "#ECFDF3",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem",
        }}
      >
        <MailCheck size={34} color={COLORS.primary} />
      </div>

      <div style={{ color: COLORS.primary, fontWeight: 800, marginBottom: 10, letterSpacing: 1, fontSize: 12 }}>
        SESIÓN INICIADA
      </div>

      <h2
        style={{
          fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 900,
          color: COLORS.text, marginBottom: 10, lineHeight: 1,
        }}
      >
        Revisa tu
        <br />
        correo
      </h2>

      <p style={{ color: COLORS.textLight, lineHeight: 1.6, fontSize: 13, marginBottom: "1.2rem" }}>
        Enviamos una notificación de acceso a{" "}
        <strong style={{ color: COLORS.text }}>{email}</strong> para avisarte que se
        ingresó a tu cuenta de ParkU.
      </p>

      <div
        style={{
          background: "#ECFDF3", padding: "14px 16px", borderRadius: 12,
          textAlign: "left", marginBottom: "1rem",
        }}
      >
        <p style={{ fontWeight: 700, color: COLORS.primaryDark, marginBottom: 8, fontSize: 13 }}>
          El correo incluye
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {DETALLES.map(({ icon: Icon, texto }) => (
            <div key={texto} style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.primaryDark, fontSize: 13 }}>
              <Icon size={15} />
              <span>{texto}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: "#F8FAFC", border: `1px solid ${COLORS.border}`, padding: "12px 14px",
          borderRadius: 12, marginBottom: "1.2rem", display: "flex", alignItems: "center",
          gap: 8, textAlign: "left",
        }}
      >
        <Inbox size={15} color={COLORS.textLight} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: COLORS.textLight, lineHeight: 1.5 }}>
          ¿No lo ves? Revisa la carpeta de spam o correo no deseado.
        </span>
      </div>

      <button
        type="button"
        onClick={onContinue}
        style={{
          width: "100%", border: "none", background: COLORS.primary, color: "#fff",
          padding: "14px 20px", borderRadius: 14, fontWeight: 800, cursor: "pointer", fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 8px 22px rgba(57, 169, 0, 0.2)",
        }}
      >
        Continuar al panel
        <ArrowRight size={15} />
      </button>

      <div
        style={{
          marginTop: "1.2rem", paddingTop: "1.2rem", borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <p style={{ textAlign: "center", color: COLORS.textLight, fontSize: 12 }}>
          © {new Date().getFullYear()} · Plataforma Institucional ParkU
        </p>
      </div>
    </div>
  );
}
