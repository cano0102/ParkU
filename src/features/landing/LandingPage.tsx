import { useNavigate } from "react-router-dom";
import { useLandingPage } from "./hooks/useLandingPage";
import { landingStyles } from "./lib/styles";
import { LandingNavbar } from "./components/LandingNavbar";
import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { CtaSection } from "./components/CtaSection";
import { LandingFooter } from "./components/LandingFooter";

export default function SenaLanding() {
  const navigate = useNavigate();
  const { heroVisible, scrolled, menuOpen, setMenuOpen, statsRef, statsVisible, scrollToId } = useLandingPage();

  const goToLogin = () => navigate("/login");

  return (
    <>
      <style>{landingStyles}</style>

      <div style={{ overflow: "hidden" }}>
        <LandingNavbar
          scrolled={scrolled}
          menuOpen={menuOpen}
          onToggleMenu={() => setMenuOpen((v) => !v)}
          onScrollTo={scrollToId}
          onLogin={goToLogin}
        />

        <HeroSection
          heroVisible={heroVisible}
          statsRef={statsRef}
          statsVisible={statsVisible}
          onLogin={goToLogin}
          onScrollTo={scrollToId}
        />

        <FeaturesSection />
        <HowItWorksSection />
        <CtaSection onLogin={goToLogin} />
        <LandingFooter onScrollTo={scrollToId} />
      </div>
    </>
  );
}
