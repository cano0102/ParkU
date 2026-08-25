import { useNavigate } from "react-router-dom";
import { ArrowLeft, BadgeCheck, ShieldCheck } from "lucide-react";
import logoSena from "@/assets/images/logoSena.png";

const HIGHLIGHTS = ["Acceso institucional seguro", "Protección de credenciales", "Sistema protegido ParkU"];

/** Columna izquierda decorativa de la pantalla de restablecer contraseña (oculta en móvil). */
export function ResetPasswordLeftPanel() {
  const navigate = useNavigate();

  return (
    <div
      className="reset-left"
      style={{
        padding: "2rem 2.2rem",
        background: "linear-gradient(135deg,#39A900,#2D7D00)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,.08)", top: -150, right: -120 }} />

      <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
              background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.12)",
              color: "#fff", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 13,
              backdropFilter: "blur(10px)",
            }}
          >
            <ArrowLeft size={15} />
            Volver
          </button>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.12)", padding: "8px 14px", borderRadius: 999, fontWeight: 800, fontSize: 12 }}>
            <BadgeCheck size={15} />
            Plataforma Oficial
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: "1rem" }}>
            <img src={logoSena} alt="Logo SENA" style={{ height: 46, width: "auto", filter: "brightness(0) invert(1)", objectFit: "contain" }} />
          </div>

          <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)", lineHeight: 0.95, fontWeight: 900, marginBottom: "1rem" }}>
            Nueva
            <br />
            Contraseña
          </h1>

          <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,.92)", maxWidth: 420 }}>
            Protege tu cuenta
            institucional actualizando
            tu contraseña de acceso al
            sistema ParkU.
          </p>

          <div style={{ marginTop: "1.8rem", display: "grid", gap: "0.6rem" }}>
            {HIGHLIGHTS.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,.08)", padding: "10px 14px", borderRadius: 12 }}>
                <ShieldCheck size={17} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
