import { ArrowLeft, BadgeCheck, ShieldCheck } from "lucide-react";

const HIGHLIGHTS = ["Sistema institucional seguro", "Navegación protegida", "Plataforma ParkU SENA"];

interface NotFoundLeftPanelProps {
  onBack: () => void;
}

/** Panel izquierdo decorativo: "Volver", el 404 grande, y los puntos de confianza institucional. */
export function NotFoundLeftPanel({ onBack }: NotFoundLeftPanelProps) {
  return (
    <div
      className="notfound-left"
      style={{
        padding: "3rem 4rem",
        background: "linear-gradient(135deg,#39A900,#2D7D00)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(255,255,255,.08)",
          top: -150,
          right: -120,
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3rem" }}>
          <button
            onClick={onBack}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "12px 18px",
              background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.12)",
              color: "#fff", borderRadius: 14, cursor: "pointer", fontWeight: 700, fontSize: 14,
              backdropFilter: "blur(10px)",
            }}
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          <div
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,.12)", padding: "10px 18px", borderRadius: 999,
              fontWeight: 800, fontSize: 14,
            }}
          >
            <BadgeCheck size={18} />
            Plataforma Oficial SENA
          </div>
        </div>

        <div style={{ fontSize: "clamp(6rem,10vw,10rem)", fontWeight: 900, lineHeight: 1, marginBottom: "1rem" }}>
          404
        </div>

        <h1 style={{ fontSize: "clamp(2.5rem,5vw,4rem)", lineHeight: 1, fontWeight: 900, marginBottom: "2rem" }}>
          Página
          <br />
          no encontrada
        </h1>

        <p style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,.92)", maxWidth: 500 }}>
          La página que estás buscando
          no existe, fue eliminada o
          movida dentro del sistema.
        </p>

        <div style={{ marginTop: "4rem", display: "grid", gap: "1rem" }}>
          {HIGHLIGHTS.map((item) => (
            <div
              key={item}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(255,255,255,.08)", padding: "16px 18px", borderRadius: 18,
              }}
            >
              <ShieldCheck size={20} />
              <span style={{ fontWeight: 700 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
