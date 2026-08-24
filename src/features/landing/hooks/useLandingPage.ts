import { useCallback, useEffect, useState } from "react";
import { useReveal } from "./useReveal";

/** Estado de la landing: aparición del hero, sombra de navbar al hacer scroll, menú móvil y scroll suave a secciones. */
export function useLandingPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [statsRef, statsVisible] = useReveal<HTMLDivElement>();

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToId = useCallback((id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return {
    heroVisible,
    scrolled,
    menuOpen,
    setMenuOpen,
    statsRef,
    statsVisible,
    scrollToId,
  };
}
