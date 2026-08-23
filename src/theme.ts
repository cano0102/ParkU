/**
 * Tema visual compartido de ParkU.
 *
 * Antes cada página definía su propia paleta de colores local (14 objetos
 * distintos con valores ligeramente diferentes para el mismo concepto:
 * texto, bordes, fondos...). Esto hacía que la app no se sintiera como un
 * solo sistema. Este archivo es la única fuente de verdad: cada página
 * reasigna su constante local (`COLORS` o `C`) a este objeto, así que el
 * código interno de cada página no cambia, solo de dónde vienen los valores.
 */
export const theme = {
  // Marca (verde institucional SENA)
  primary: "#39A900",
  primaryDark: "#2D7D00",
  primaryLight: "#B3E6A1",
  primaryPale: "#EAF7E6",
  primaryBorder: "#C5E0AD",

  // Fondos y superficies
  background: "#F5F7F8",
  bg: "#F5F7F8",
  surface: "#FFFFFF",
  surfaceHover: "#F8FAF8",
  white: "#FFFFFF",

  // Texto
  text: "#0F172A",
  textLight: "#64748B",
  textSoft: "#475569",
  textMuted: "#94A3B8",
  dark: "#0F172A",

  // Bordes
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",

  // Estados
  danger: "#EF4444",
  dangerBg: "#FEE2E2",
  dangerBorder: "#FECACA",

  success: "#16A34A",
  successBg: "#DCFCE7",

  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  amber: "#F59E0B",
  amberBg: "#FEF3C7",

  info: "#3B82F6",
  infoBg: "#EFF6FF",
  blue: "#3B82F6",

  purple: "#8B5CF6",
  teal: "#14B8A6",
  red: "#EF4444",

  slate: "#94A3B8",
  slateBg: "#F1F5F9",
} as const;

export type Theme = typeof theme;
