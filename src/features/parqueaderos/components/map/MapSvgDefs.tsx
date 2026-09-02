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
      {/* Sombra suave para los paneles de zona: los despega un poco del asfalto de fondo
          en vez de depender solo del stroke plano que ya tenían. */}
      <filter id="lotShadow" x="-15%" y="-15%" width="130%" height="140%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity=".35" />
      </filter>
      {/* Brillo vertical genérico: blanco arriba que se desvanece a la mitad — reutilizado sobre
          cualquier rect sólido (cabecera de zona) para darle un poco de volumen sin tener que
          generar un degradado nuevo por cada color dinámico (`hc` varía según ocupación). */}
      <linearGradient id="sheenV" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fff" stopOpacity=".22" />
        <stop offset="55%" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="roadG" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#2D3748" /><stop offset="100%" stopColor="#1A202C" />
      </linearGradient>
      <linearGradient id="grassG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#065F46" /><stop offset="100%" stopColor="#064E3B" />
      </linearGradient>
      {/* Viñeta radial sobre el asfalto: un plano grande de un solo color plano se ve
          "impreso"; esta capa (pintada encima, sin afectar el layout) le da algo de
          profundidad — más clara al centro, se oscurece hacia los bordes. */}
      <radialGradient id="vignette" cx="50%" cy="38%" r="75%">
        <stop offset="0%" stopColor="#3a4048" stopOpacity="0" />
        <stop offset="70%" stopColor="#3a4048" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity=".38" />
      </radialGradient>
      {/* Relleno de celda con un ligerísimo degradado (en vez de un solo color plano),
          para que cada espacio se lea con un poco de volumen. Uno por estado, mismo tono
          base que `CELDA_CONFIG[estado].mapFill` con un extremo un poco más claro. */}
      {Object.entries(CELDA_CONFIG).map(([estado, cfg]) => (
        <linearGradient key={estado} id={`cellG-${estado}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={cfg.mapFill} stopOpacity=".55" />
          <stop offset="100%" stopColor={cfg.mapFill} />
        </linearGradient>
      ))}
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
