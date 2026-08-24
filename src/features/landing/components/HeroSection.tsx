import type { Ref } from "react";
import { HeroContent } from "./HeroContent";
import { HeroStatsCard } from "./HeroStatsCard";

interface HeroSectionProps {
  heroVisible: boolean;
  statsRef: Ref<HTMLDivElement>;
  statsVisible: boolean;
  onLogin: () => void;
  onScrollTo: (id: string) => void;
}

/** Sección "inicio": grid de dos columnas con el contenido del hero y la tarjeta de estadísticas. */
export function HeroSection({ heroVisible, statsRef, statsVisible, onLogin, onScrollTo }: HeroSectionProps) {
  return (
    <section
      id="inicio"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background:
          "radial-gradient(1100px 500px at 85% -10%, #E8F5E1 0%, rgba(232,245,225,0) 60%), linear-gradient(180deg,#ffffff 0%,#F3F8F1 100%)",
        paddingTop: 100,
      }}
    >
      <div
        className="container hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr .9fr",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        <HeroContent visible={heroVisible} onLogin={onLogin} onScrollTo={onScrollTo} />
        <HeroStatsCard visible={heroVisible} statsRef={statsRef} statsVisible={statsVisible} />
      </div>
    </section>
  );
}
