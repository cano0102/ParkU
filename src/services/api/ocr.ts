/**
 * Pipeline de preprocesamiento de imagen para el reconocimiento de placas
 * (OCR), extraído de Parqueaderos/ocr.ts. Son funciones puras (sin React, sin
 * Tesseract) que Parqueaderos/ocr.ts reusa en vez de duplicar.
 *
 * El worker de Tesseract y el hook `useOcrPlaca` (ciclo de vida atado a un
 * componente) se quedan en Parqueaderos/ocr.ts por ahora: dependen de
 * `extraerDatosDocumento`, que sigue siendo específico de ese flujo. La
 * validación de placas (`validarPlacaColombiana` y compañía) ya vive en
 * `@/utils/validation` desde la Fase 5.
 */

export interface RoiRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calcularUmbralOtsu(hist: number[], total: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, pesoB = 0, maxV = 0, umbral = 127;
  for (let t = 0; t < 256; t++) {
    pesoB += hist[t]; if (!pesoB) continue;
    const pesoF = total - pesoB; if (!pesoF) break;
    sumB += t * hist[t];
    const mB = sumB / pesoB, mF = (sum - sumB) / pesoF;
    const v = pesoB * pesoF * (mB - mF) * (mB - mF);
    if (v > maxV) { maxV = v; umbral = t; }
  }
  return umbral;
}

/* Cuánto escalar la imagen antes de binarizar: Tesseract necesita los caracteres con
   varias decenas de píxeles de alto para resolver bien las formas. Un recorte guiado
   (ROI de la placa) llega mucho más pequeño que el cuadro completo de la cámara, así
   que en vez de un factor fijo se calcula el que acerca el lado mayor a ~1100px. */
export function escalaObjetivo(w: number, h: number): number {
  const lado = Math.max(w, h);
  return Math.min(6, Math.max(1.2, 1100 / lado));
}

/* Recorta el 1% de píxeles más oscuros/claros (outliers de ruido o brillos puntuales)
   y estira el resto del histograma a 0-255. Esto evita que una foto con poco contraste
   (placa sucia, luz de tarde) le gane al umbral de Otsu con un histograma aplastado. */
export function estirarContraste(gr: Uint8ClampedArray, hist: number[], total: number): Uint8ClampedArray {
  const corte = Math.floor(total * 0.01);
  let acum = 0, lo = 0; for (; lo < 255; lo++) { acum += hist[lo]; if (acum > corte) break; }
  acum = 0; let hi = 255; for (; hi > 0; hi--) { acum += hist[hi]; if (acum > corte) break; }
  if (hi <= lo) return gr;
  const rango = hi - lo;
  for (let i = 0; i < gr.length; i++) gr[i] = Math.max(0, Math.min(255, Math.round((gr[i] - lo) * 255 / rango)));
  return gr;
}

/* Desenfoque de caja 3x3: suaviza el ruido de sensor de la cámara del celular para que
   no se convierta, tras el umbral, en pixeles negros sueltos que Tesseract confunde con
   trazos de caracteres. */
export function desenfoqueSuave(gr: Uint8ClampedArray, w: number, h: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(gr.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let suma = 0, c = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= w) continue;
          suma += gr[yy * w + xx]; c++;
        }
      }
      out[y * w + x] = Math.round(suma / c);
    }
  }
  return out;
}

/* Pipeline común de binarización: escala de grises -> desenfoque -> estiramiento de
   contraste -> umbral de Otsu. Se reusa tanto para el frame de cámara (recortado o no)
   como para archivos subidos, para que ambos caminos se beneficien de las mismas mejoras. */
export function binarizarYEscalar(src: HTMLCanvasElement): string {
  const escala = escalaObjetivo(src.width, src.height);
  const dest = document.createElement('canvas');
  dest.width = Math.max(1, Math.round(src.width * escala));
  dest.height = Math.max(1, Math.round(src.height * escala));
  const dctx = dest.getContext('2d'); if (!dctx) throw new Error('Canvas OCR falló.');
  dctx.imageSmoothingEnabled = true; dctx.imageSmoothingQuality = 'high';
  dctx.drawImage(src, 0, 0, dest.width, dest.height);
  const img = dctx.getImageData(0, 0, dest.width, dest.height); const d = img.data;
  let gr = new Uint8ClampedArray(d.length / 4);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) gr[p] = Math.round(d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114);
  gr = desenfoqueSuave(gr, dest.width, dest.height);
  const hist = new Array(256).fill(0); for (let p = 0; p < gr.length; p++) hist[gr[p]]++;
  gr = estirarContraste(gr, hist, gr.length);
  const hist2 = new Array(256).fill(0); for (let p = 0; p < gr.length; p++) hist2[gr[p]]++;
  const u = calcularUmbralOtsu(hist2, gr.length);
  for (let p = 0, i = 0; p < gr.length; p++, i += 4) { const v = gr[p] > u ? 255 : 0; d[i] = v; d[i + 1] = v; d[i + 2] = v; }
  dctx.putImageData(img, 0, 0); return dest.toDataURL('image/png');
}

/* Traduce la posición del cuadro guía (el rectángulo que ve el usuario sobre el video)
   a coordenadas de píxeles reales del stream de la cámara, para poder recortar justo
   esa zona antes de binarizar. El video se muestra con object-fit:cover, así que hay
   que reconstruir cuánto de la imagen nativa queda oculto fuera del contenedor.
   Se añade un margen generoso (más alto que ancho) porque una placa de moto colombiana
   real son DOS líneas apiladas y puede no encajar perfecto en un cuadro pensado para el
   formato ancho de una placa de carro; el margen evita cortar la segunda línea. */
export function calcularRoiDesdeGuia(video: HTMLVideoElement, guiaEl: HTMLElement): RoiRect | null {
  if (!video.videoWidth || !video.videoHeight) return null;
  const videoRect = video.getBoundingClientRect();
  const guiaRect = guiaEl.getBoundingClientRect();
  if (!videoRect.width || !videoRect.height || !guiaRect.width || !guiaRect.height) return null;
  const escala = Math.max(videoRect.width / video.videoWidth, videoRect.height / video.videoHeight);
  const renderW = video.videoWidth * escala, renderH = video.videoHeight * escala;
  const offX = (renderW - videoRect.width) / 2, offY = (renderH - videoRect.height) / 2;
  const left = guiaRect.left - videoRect.left, top = guiaRect.top - videoRect.top;
  const padX = guiaRect.width * 0.18, padY = guiaRect.height * 0.55;
  const x = (left + offX - padX) / escala, y = (top + offY - padY) / escala;
  const w = (guiaRect.width + padX * 2) / escala, h = (guiaRect.height + padY * 2) / escala;
  const cx = Math.max(0, Math.min(video.videoWidth, x));
  const cy = Math.max(0, Math.min(video.videoHeight, y));
  const cw = Math.max(1, Math.min(video.videoWidth - cx, w));
  const ch = Math.max(1, Math.min(video.videoHeight - cy, h));
  return { x: cx, y: cy, width: cw, height: ch };
}

export function preprocesarImagenArchivo(dataUrl: string): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      try {
        const src = document.createElement('canvas'); src.width = img.width; src.height = img.height;
        const sctx = src.getContext('2d'); if (!sctx) return rej(new Error('Canvas OCR falló.'));
        sctx.drawImage(img, 0, 0);
        res(binarizarYEscalar(src));
      } catch (e) { rej(e); }
    };
    img.onerror = () => rej(new Error('No se pudo cargar la imagen.'));
    img.src = dataUrl;
  });
}
