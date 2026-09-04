import { describe, it, expect } from 'vitest';
import { procesarFotoCuadrada, FOTO_PERFIL_MAX_MB } from './imagen';

/** El recorte en sí (canvas) no se puede ejercitar en jsdom, que no decodifica imágenes; lo
 *  que sí se prueba acá es el filtro previo, que es lo que ve la persona como mensaje. */
describe('utils/imagen — procesarFotoCuadrada', () => {
  it('rechaza un archivo que no es una imagen', async () => {
    const pdf = new File(['no soy una imagen'], 'documento.pdf', { type: 'application/pdf' });

    await expect(procesarFotoCuadrada(pdf)).rejects.toThrow('El archivo debe ser una imagen');
  });

  it('rechaza una imagen más pesada que el máximo permitido', async () => {
    const gigante = new File(['x'], 'foto.png', { type: 'image/png' });
    Object.defineProperty(gigante, 'size', { value: (FOTO_PERFIL_MAX_MB + 1) * 1024 * 1024 });

    await expect(procesarFotoCuadrada(gigante)).rejects.toThrow(
      `La imagen no debe superar ${FOTO_PERFIL_MAX_MB}MB`
    );
  });
});
