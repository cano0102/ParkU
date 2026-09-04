/**
 * Procesado de imágenes de perfil en el propio navegador (recorte cuadrado + escalado)
 * antes de guardarlas. Sin esto, una foto de varios MB terminaría entera en el estado en
 * memoria y en localStorage (que ronda los 5MB en total por origen).
 *
 * Estaba embebido en features/perfil/hooks/useFotoPerfil.ts; se sube a utils/ porque ahora
 * lo usan también los formularios de Usuarios y Conductores.
 */

/** Lado (px) del cuadrado al que se recorta y escala toda foto de perfil. */
export const FOTO_PERFIL_LADO = 256;

/** Tamaño máximo del archivo ORIGINAL que se acepta (ya recortado pesa ~15KB). */
export const FOTO_PERFIL_MAX_MB = 5;

/**
 * Recorta la imagen al cuadrado centrado más grande que quepa, la escala a `lado` px y la
 * devuelve como data URL JPEG. Rechaza con un `Error` cuyo mensaje es el que se le puede
 * mostrar tal cual a la persona.
 */
export function procesarFotoCuadrada(file: File, lado: number = FOTO_PERFIL_LADO): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('El archivo debe ser una imagen'));
  }
  if (file.size > FOTO_PERFIL_MAX_MB * 1024 * 1024) {
    return Promise.reject(new Error(`La imagen no debe superar ${FOTO_PERFIL_MAX_MB}MB`));
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = lado;
        canvas.height = lado;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo procesar la imagen'));
          return;
        }
        const side = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, lado, lado);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('No se pudo procesar la imagen'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    reader.readAsDataURL(file);
  });
}
