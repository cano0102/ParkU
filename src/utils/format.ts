/**
 * Utilidades de formateo de texto compartidas. Antes existían casi idénticas
 * (mismo algoritmo, distinto nombre) en `features/conductores/helpers.ts`,
 * `features/usuarios/lib/helpers.ts` y `features/roles/index.tsx` — se centralizan
 * aquí como única implementación.
 */

const AVATAR_GRADIENTS = [
  ["#39A900", "#2D7D00"],
  ["#2563EB", "#1D4ED8"],
  ["#8B5CF6", "#7C3AED"],
  ["#F59E0B", "#D97706"],
  ["#EF4444", "#DC2626"],
  ["#0891B2", "#0E7490"],
] as const;

export const getAvatarGradient = (str: string): [string, string] => {
  const idx = (str?.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx] as [string, string];
};

export const getInitials = (nombre: string): string => {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export const sanitizeText = (text: string): string => {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
};
