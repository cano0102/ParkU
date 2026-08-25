import { MAP_THEME, CAR_PALETTE, CAR_PALETTE_LIGHT } from "./MapVisuals";
import { CELDA_CONFIG } from "../../lib/helpers";

/** Patrones, gradientes y filtros SVG reutilizados por todo el plano. */
export function MapSvgDefs() {
  return (
    <defs>
      <pattern id="asp" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill={MAP_THEME.asphalt} />
      </pattern>
      <pattern id="resH" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <rect width="10" height="10" fill={CELDA_CONFIG.reservada.mapFill} />
        <line x1="0" y1="0" x2="0" y2="10" stroke={CELDA_CONFIG.reservada.mapStroke} strokeWidth="1.4" opacity=".4" />
      </pattern>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <linearGradient id="roadG" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2D3748" /><stop offset="100%" stopColor="#1A202C" />
      </linearGradient>
      <linearGradient id="grassG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#065F46" /><stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      {/* Degradado por color de carrocería, para que carros y motos se vean con
          un poco de volumen/brillo en vez de un relleno plano. */}
      {CAR_PALETTE.map((base, i) => (
        <linearGradient key={i} id={`carG${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={CAR_PALETTE_LIGHT[i]} />
          <stop offset="100%" stopColor={base} />
        </linearGradient>
      ))}
    </defs>
  );
}
