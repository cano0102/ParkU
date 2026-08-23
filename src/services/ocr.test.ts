import { describe, it, expect } from 'vitest';
import { calcularUmbralOtsu, estirarContraste, desenfoqueSuave, escalaObjetivo, calcularRoiDesdeGuia } from './ocr';

// binarizarYEscalar/preprocesarImagenArchivo dependen de canvas.getContext('2d'),
// que jsdom no implementa — se cubren manualmente/con Playwright, no aquí.

describe('services/ocr — funciones puras', () => {
  it('calcularUmbralOtsu separa un histograma bimodal claro/oscuro', () => {
    const hist = new Array(256).fill(0);
    hist[10] = 100; // píxeles oscuros
    hist[240] = 100; // píxeles claros
    const total = 200;
    const umbral = calcularUmbralOtsu(hist, total);
    expect(umbral).toBeGreaterThanOrEqual(10);
    expect(umbral).toBeLessThan(240);
  });

  it('estirarContraste expande un rango de grises apretado hacia 0-255', () => {
    const gr = new Uint8ClampedArray([100, 110, 120, 130, 140]);
    const hist = new Array(256).fill(0);
    for (const v of gr) hist[v]++;
    const resultado = estirarContraste(gr, hist, gr.length);
    expect(Math.min(...resultado)).toBeLessThan(100);
    expect(Math.max(...resultado)).toBeGreaterThan(140);
  });

  it('desenfoqueSuave promedia con los vecinos (caja 3x3)', () => {
    // 3x3, centro muy distinto a sus 8 vecinos idénticos
    const gr = new Uint8ClampedArray([
      50, 50, 50,
      50, 200, 50,
      50, 50, 50,
    ]);
    const out = desenfoqueSuave(gr, 3, 3);
    // El centro debería acercarse al promedio de sus vecinos, no seguir en 200
    expect(out[4]).toBeLessThan(200);
    expect(out[4]).toBeGreaterThan(50);
  });

  it('escalaObjetivo acerca el lado mayor a ~1100px, con tope [1.2, 6]', () => {
    // Lado mayor pequeño (100px): el factor que lo llevaría a 1100 (11x) se recorta a 6.
    expect(escalaObjetivo(100, 50)).toBe(6);
    // Lado mayor grande (5000px): el factor que lo llevaría a 1100 (0.22x) se recorta a 1.2.
    expect(escalaObjetivo(5000, 3000)).toBe(1.2);
    // Lado mayor de 500px: 1100/500 = 2.2, dentro del rango [1.2, 6], sin recorte.
    expect(escalaObjetivo(500, 200)).toBeCloseTo(2.2, 5);
  });

  it('calcularRoiDesdeGuia devuelve null si el video aún no tiene dimensiones', () => {
    const video = document.createElement('video');
    const guia = document.createElement('div');
    expect(calcularRoiDesdeGuia(video, guia)).toBeNull();
  });
});
