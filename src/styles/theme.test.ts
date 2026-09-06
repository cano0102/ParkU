import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { theme } from "./theme";

/** Las pantallas de "ver detalle": son las que revisó el módulo 8. */
const PANTALLAS_DE_DETALLE = [
  "src/features/incidentes/components/IncidenteViewModal.tsx",
  "src/features/controlSalida/components/ControlSalidaDetalleModal.tsx",
  "src/features/reservas/components/ReservaViewModal.tsx",
  "src/features/roles/components/RolViewModal.tsx",
  "src/features/conductores/components/VehiculoView.tsx",
];

const leer = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

/* Un color escrito a mano no se nota al añadirlo y se nota cuando ya hay quince: cada pantalla
   acaba con su propio gris "casi igual" y la aplicación deja de verse como un solo sistema.
   Esta guarda lo corta donde ya se limpió. */
describe("paleta — las pantallas de detalle usan el tema, no colores sueltos", () => {
  it.each(PANTALLAS_DE_DETALLE)("%s no escribe colores a mano", (rel) => {
    const codigo = leer(rel);
    // Se ignora lo que va dentro de un `rgba(...)`, que se usa para transparencias puntuales.
    const literales = codigo.match(/#[0-9A-Fa-f]{6}\b/g) ?? [];
    expect(literales).toEqual([]);
  });
});

/**
 * Contraste mínimo de un texto sobre su fondo (WCAG AA para texto normal: 4.5).
 *
 * Los pares texto/fondo del tema se eligen a ojo, y a ojo un gris claro sobre blanco parece
 * legible hasta que alguien lo mira en un monitor con brillo bajo o de lejos.
 */
function contraste(colorA: string, colorB: string): number {
  const luminancia = (hex: string) => {
    const canales = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const [r, g, b] = canales.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [claro, oscuro] = [luminancia(colorA), luminancia(colorB)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

describe("paleta — el texto se lee sobre su fondo", () => {
  const pares: [string, string, string][] = [
    ["texto principal sobre superficie", theme.text, theme.surface],
    ["texto principal sobre la fila de datos", theme.text, theme.surfaceSubtle],
    ["texto secundario sobre superficie", theme.textLight, theme.surface],
    ["rojo de texto sobre su fondo", theme.dangerText, theme.dangerBg],
    ["verde de texto sobre su fondo", theme.successText, theme.successBg],
    ["marca oscura sobre su fondo pálido", theme.primaryDark, theme.primaryPale],
  ];

  it.each(pares)("%s cumple el mínimo de 4.5", (_, texto, fondo) => {
    expect(contraste(texto, fondo)).toBeGreaterThanOrEqual(4.5);
  });
});
