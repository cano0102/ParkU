import { IconCarSuv as CarFront } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { Reveal } from "./Reveal";

const COLORS = theme;

interface CtaSectionProps {
  onLogin: () => void;
}

/** Banner final invitando a iniciar sesión. */
export function CtaSection({ onLogin }: CtaSectionProps) {
  return (
    <section style={{ padding: "6rem 0", background: "#fff" }}>
      <div className="container">
        <Reveal
          style={{
            background: "linear-gradient(135deg,#39A900,#2D7D00)",
            borderRadius: 40,
            padding: "5rem 3rem",
            textAlign: "center",
          }}
        >
          <CarFront size={58} color="#fff" />

          <h2
            style={{
              color: "#fff",
              fontSize: "clamp(2.5rem,5vw,4rem)",
              fontWeight: 900,
              marginTop: "2rem",
              marginBottom: "1rem",
            }}
          >
            Accede a ParkU
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,.9)",
              maxWidth: 720,
              margin: "auto",
              lineHeight: 1.8,
              fontSize: 18,
            }}
          >
            Gestiona el acceso vehicular institucional de
            forma moderna, rápida y segura.
          </p>

          <button
            onClick={onLogin}
            style={{
              marginTop: "2rem",
              border: "none",
              background: "#fff",
              color: COLORS.primary,
              padding: "18px 34px",
              borderRadius: 18,
              fontWeight: 900,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Iniciar Sesión
          </button>
        </Reveal>
      </div>
    </section>
  );
}
