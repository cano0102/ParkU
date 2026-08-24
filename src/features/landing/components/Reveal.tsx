import type { ReactNode, CSSProperties } from "react";
import { useReveal } from "../hooks/useReveal";

interface RevealProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

/** Envuelve a sus hijos con un fade-in que se dispara la primera vez que entran en el viewport. */
export function Reveal({ children, style, className }: RevealProps) {
  const [ref, visible] = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`fade ${visible ? "active" : ""} ${className ?? ""}`}
      style={style}
    >
      {children}
    </div>
  );
}
