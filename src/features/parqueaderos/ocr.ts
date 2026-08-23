import { useCallback, useRef } from "react";
import { createWorker, PSM } from "tesseract.js";
import { extraerDatosDocumento, validarPlacaColombiana } from "./helpers";
import {
  binarizarYEscalar,
  calcularRoiDesdeGuia,
  preprocesarImagenArchivo,
  type RoiRect,
} from "@/services/ocr";

export type { RoiRect };
export { calcularRoiDesdeGuia, preprocesarImagenArchivo };

function preprocesarDocumento(video: HTMLVideoElement, roi?: RoiRect): string {
  if (!video.videoWidth || !video.videoHeight) throw new Error("Cámara no lista.");
  const sx = roi ? Math.round(roi.x) : 0, sy = roi ? Math.round(roi.y) : 0;
  const sw = roi ? Math.round(roi.width) : video.videoWidth, sh = roi ? Math.round(roi.height) : video.videoHeight;
  const src = document.createElement("canvas"); src.width = sw; src.height = sh;
  const ctx = src.getContext("2d"); if (!ctx) throw new Error("Canvas falló.");
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, sw, sh);
  return binarizarYEscalar(src);
}

/* No hay un único modo de segmentación que sirva siempre: una placa de carro fotografiada
   de cerca es una sola línea, pero una placa de moto colombiana real está troquelada en DOS
   líneas físicas (3 letras arriba, 2 números + 1 letra abajo), y un documento (tarjeta de
   propiedad/SOAT) trae varias líneas con etiquetas ("PLACA", "PROPIETARIO"). Sin ningún modo
   fijo, Tesseract no encuentra ningún bloque de texto y devuelve "" siempre. Se intenta de
   más específico a más general y se usa el primer resultado que produzca una placa válida.
   SINGLE_BLOCK cubre el caso de moto (dos líneas tratadas como un solo bloque de texto). */
const PSM_INTENTOS = [PSM.SINGLE_LINE, PSM.SINGLE_BLOCK, PSM.SPARSE_TEXT, PSM.AUTO] as const;

export function useOcrPlaca() {
  const workerRef = useRef<any>(null); const initRef = useRef<Promise<any> | null>(null);
  const getWorker = useCallback(async () => {
    if (workerRef.current) return workerRef.current;
    if (!initRef.current) {
      initRef.current = createWorker("spa").then(async (w: any) => {
        try {
          await w.setParameters({
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑ0123456789 .:-/",
          });
        } catch {}
        workerRef.current = w; return w;
      });
    }
    return initRef.current;
  }, []);
  const procesarImagen = useCallback(async (url: string) => {
    const w = await getWorker();
    for (const psm of PSM_INTENTOS) {
      try {
        await w.setParameters({ tessedit_pageseg_mode: psm });
        const { data } = await w.recognize(url);
        const r = extraerDatosDocumento(data.text || "");
        if (r.placa && validarPlacaColombiana(r.placa)) return r;
      } catch { /* modo no soportado o fallo puntual: intenta el siguiente */ }
    }
    throw new Error("No se detectó una placa válida.");
  }, [getWorker]);
  /* Primero intenta solo la zona del cuadro guía (más nítida, sin fondo que confunda a
     Otsu/Tesseract); si no logra leer una placa válida ahí, reintenta con el frame
     completo por si el usuario no alineó bien la placa dentro del cuadro. */
  const reconocer = useCallback(async (video: HTMLVideoElement, roi?: RoiRect) => {
    if (roi) {
      try { return await procesarImagen(preprocesarDocumento(video, roi)); }
      catch { /* recorte guiado sin éxito: se intenta con el cuadro completo */ }
    }
    return procesarImagen(preprocesarDocumento(video));
  }, [procesarImagen]);
  const reconocerLicencia = useCallback(async (url: string) => procesarImagen(url), [procesarImagen]);
  const liberarWorker = useCallback(async () => { try { if (workerRef.current) await workerRef.current.terminate(); } catch {} finally { workerRef.current = null; initRef.current = null; } }, []);
  return { reconocer, reconocerLicencia, liberarWorker };
}
