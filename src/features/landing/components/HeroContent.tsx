import { IconRosetteDiscountCheck as BadgeCheck } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { trustBadges } from "../lib/content";

const COLORS = theme;

interface HeroContentProps {
  visible: boolean;
  onLogin: () => void;
  onScrollTo: (id: string) => void;
}

/** Columna izquierda del hero: título, descripción, botones de acción y badges de confianza. */
export function HeroContent({ visible, onLogin, onScrollTo }: HeroContentProps) {
  return (
    <div className={`fade ${visible ? "active" : ""}`}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "#E8F5E1",
          color: COLORS.primaryDark,
          padding: "10px 18px",
          borderRadius: 999,
          fontWeight: 800,
          marginBottom: "2rem",
        }}
      >
        <BadgeCheck size={18} />
        Plataforma Oficial SENA
      </div>

      <h1
        className="hero-title"
        style={{
          fontSize: "clamp(3rem,7vw,5.8rem)",
          lineHeight: 0.95,
          fontWeight: 900,
          marginBottom: "1.5rem",
          color: COLORS.text,
        }}
      >
        Gestión
        <br />
        <span style={{ color: COLORS.primary }}>Inteligente</span>
        <br />
        de Parqueaderos
      </h1>

      <p
        style={{
          color: COLORS.textLight,
          fontSize: 18,
          lineHeight: 1.8,
          maxWidth: 650,
          marginBottom: "2rem",
        }}
      >
        ParkU es la plataforma institucional del SENA
        diseñada para optimizar el control vehicular,
        automatizar accesos y monitorear en tiempo real
        la ocupación de parqueaderos.
      </p>

      <div
        className="hero-buttons"
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <button
          onClick={onLogin}
          style={{
            border: "none",
            background: COLORS.primary,
            color: "#fff",
            padding: "18px 30px",
            borderRadius: 16,
            fontWeight: 800,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 15,
          }}
        >
          Acceder al Sistema
        </button>

        <button
          onClick={() => onScrollTo("beneficios")}
          style={{
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            color: COLORS.text,
            padding: "18px 30px",
            borderRadius: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Ver Información
        </button>
      </div>

      <div
        className="trust-badges"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.8rem",
          flexWrap: "wrap",
        }}
      >
        {trustBadges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: COLORS.textLight,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <Icon size={18} color={COLORS.primary} />
              {badge.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
