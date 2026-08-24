import logoSena from "@/assets/images/logoSena.png";
import { theme } from "@/styles/theme";
import { navLinks } from "../lib/content";

const COLORS = theme;

interface LandingFooterProps {
  onScrollTo: (id: string) => void;
}

/** Pie de página: marca institucional, enlaces de anclaje y aviso de derechos. */
export function LandingFooter({ onScrollTo }: LandingFooterProps) {
  return (
    <footer
      id="contacto"
      style={{
        background: "#fff",
        borderTop: `1px solid ${COLORS.border}`,
        padding: "2.5rem 0",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={logoSena} alt="SENA" style={{ width: 46 }} />

          <div>
            <div style={{ fontWeight: 800, color: COLORS.text }}>ParkU · SENA</div>
            <div style={{ color: COLORS.textLight, fontSize: 14 }}>
              Servicio Nacional de Aprendizaje
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1.8rem", flexWrap: "wrap" }}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onScrollTo(link.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: COLORS.textLight,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div style={{ color: COLORS.textLight, fontSize: 14, fontWeight: 500 }}>
          © {new Date().getFullYear()} · Plataforma Institucional ParkU
        </div>
      </div>
    </footer>
  );
}
