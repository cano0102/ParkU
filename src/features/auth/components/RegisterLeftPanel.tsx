import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import logoSena from "@/assets/images/logoSena.png";

const HIGHLIGHTS = ["Registro rápido y seguro", "Reserva tu celda en minutos", "Soporte institucional"];

/** Columna izquierda decorativa de la pantalla de registro (oculta en móvil). */
export function RegisterLeftPanel() {
  const navigate = useNavigate();

  return (
    <div
      className="register-left"
      style={{
        padding: "2rem 2.2rem",
        background: "linear-gradient(135deg, #39A900, #2D7D00)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          top: -100,
          right: -80,
        }}
      />

      <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: "rgba(255, 255, 255, 0.14)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#fff",
              borderRadius: 12,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              backdropFilter: "blur(10px)",
            }}
          >
            <ArrowLeft size={15} />
            Volver
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: "1rem" }}>
            <img
              src={logoSena}
              alt="Logo SENA"
              style={{ height: 46, width: "auto", filter: "brightness(0) invert(1)", objectFit: "contain" }}
            />
          </div>

          <h1
            style={{
              fontSize: "clamp(1.8rem, 3.6vw, 2.6rem)",
              lineHeight: 1,
              fontWeight: 900,
              marginBottom: "1rem",
            }}
          >
            Únete a ParkU
          </h1>

          <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255, 255, 255, 0.92)", maxWidth: 420 }}>
            Crea tu cuenta institucional para gestionar tus reservas y
            acceder al parqueadero del SENA.
          </p>

          <div style={{ marginTop: "1.8rem", display: "grid", gap: "0.6rem" }}>
            {HIGHLIGHTS.map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(255, 255, 255, 0.08)",
                  padding: "10px 14px",
                  borderRadius: 12,
                }}
              >
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
