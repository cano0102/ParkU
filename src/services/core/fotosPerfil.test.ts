import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/** Cada prueba carga el módulo de cero: el snapshot en memoria es de módulo, así que
 *  reimportarlo es la única forma de probar la lectura inicial desde localStorage. */
async function cargarModulo() {
  vi.resetModules();
  return import('./fotosPerfil');
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('services/core/fotosPerfil', () => {
  it('lee las fotos que ya estaban en localStorage, separadas por ámbito', async () => {
    localStorage.setItem('parkuFotoPerfil:7', 'data:image/jpeg;base64,usuario7');
    localStorage.setItem('parkuFotoConductor:7', 'data:image/jpeg;base64,conductor7');
    localStorage.setItem('parkuToken', 'no-es-una-foto');
    // Una llave del ámbito pero vacía no es una foto: no debe entrar al snapshot.
    localStorage.setItem('parkuFotoPerfil:8', '');

    const { leerFoto, fotosDe } = await cargarModulo();

    expect(leerFoto('usuario', '7')).toBe('data:image/jpeg;base64,usuario7');
    expect(leerFoto('conductor', '7')).toBe('data:image/jpeg;base64,conductor7');
    // Ninguna llave ajena (el token de sesión, p. ej.) ni vacía se cuela como foto.
    expect(fotosDe('usuario').size).toBe(1);
    expect(leerFoto('usuario', '8')).toBeUndefined();
  });

  it('adopta una foto escrita en localStorage después de tomar el snapshot', async () => {
    const { leerFoto, fotosDe } = await cargarModulo();
    expect(fotosDe('usuario').size).toBe(0);

    // Otra pestaña (o la sesión que se restaura después de cargar el módulo) escribe la llave.
    localStorage.setItem('parkuFotoPerfil:12', 'data:image/jpeg;base64,deotrapestana');

    expect(leerFoto('usuario', '12')).toBe('data:image/jpeg;base64,deotrapestana');
    expect(leerFoto('usuario', '13')).toBeUndefined();
  });

  it('tolera que localStorage reporte una llave inexistente al recorrerlo', async () => {
    vi.spyOn(Storage.prototype, 'length', 'get').mockReturnValue(1);
    vi.spyOn(Storage.prototype, 'key').mockReturnValue(null as unknown as string);

    const { fotosDe } = await cargarModulo();

    expect(fotosDe('usuario').size).toBe(0);
  });

  it('guarda una foto, la persiste y devuelve un snapshot nuevo', async () => {
    const { fotosDe, guardarFoto, leerFoto } = await cargarModulo();
    const antes = fotosDe('usuario');

    guardarFoto('usuario', '3', 'data:image/jpeg;base64,nueva');

    expect(leerFoto('usuario', '3')).toBe('data:image/jpeg;base64,nueva');
    expect(localStorage.getItem('parkuFotoPerfil:3')).toBe('data:image/jpeg;base64,nueva');
    // Identidad distinta: es lo que hace que useSyncExternalStore re-renderice.
    expect(fotosDe('usuario')).not.toBe(antes);
  });

  it('borra la foto (y su llave) cuando se guarda vacía', async () => {
    const { guardarFoto, leerFoto } = await cargarModulo();
    guardarFoto('conductor', '9', 'data:image/jpeg;base64,algo');

    guardarFoto('conductor', '9', '');

    expect(leerFoto('conductor', '9')).toBeUndefined();
    expect(localStorage.getItem('parkuFotoConductor:9')).toBeNull();
  });

  it('avisa a los suscriptores en cada cambio real, y deja de hacerlo al desuscribirse', async () => {
    const { guardarFoto, suscribirseAFotos, fotosDe } = await cargarModulo();
    const avisar = vi.fn();
    const desuscribir = suscribirseAFotos(avisar);

    guardarFoto('usuario', '1', 'data:image/jpeg;base64,a');
    expect(avisar).toHaveBeenCalledTimes(1);

    // Guardar el MISMO valor no es un cambio: ni notifica ni rompe la identidad del snapshot.
    const snapshot = fotosDe('usuario');
    guardarFoto('usuario', '1', 'data:image/jpeg;base64,a');
    expect(avisar).toHaveBeenCalledTimes(1);
    expect(fotosDe('usuario')).toBe(snapshot);

    desuscribir();
    guardarFoto('usuario', '1', 'data:image/jpeg;base64,b');
    expect(avisar).toHaveBeenCalledTimes(1);
  });

  it('ignora las escrituras y lecturas sin id (pasa al crear, antes de que el backend lo asigne)', async () => {
    const { guardarFoto, leerFoto, fotosDe } = await cargarModulo();

    guardarFoto('usuario', '', 'data:image/jpeg;base64,huerfana');

    expect(fotosDe('usuario').size).toBe(0);
    expect(leerFoto('usuario', '')).toBeUndefined();
  });

  it('sigue funcionando en memoria si localStorage no está disponible', async () => {
    const key = vi.spyOn(Storage.prototype, 'key').mockImplementation(() => {
      throw new Error('localStorage bloqueado');
    });
    vi.spyOn(Storage.prototype, 'length', 'get').mockReturnValue(1);
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage bloqueado');
    });
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('localStorage bloqueado');
    });
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage bloqueado');
    });

    const { guardarFoto, leerFoto } = await cargarModulo();
    guardarFoto('usuario', '4', 'data:image/jpeg;base64,enmemoria');
    expect(leerFoto('usuario', '4')).toBe('data:image/jpeg;base64,enmemoria');

    guardarFoto('usuario', '4', '');
    expect(leerFoto('usuario', '4')).toBeUndefined();

    expect(leerFoto('usuario', '5')).toBeUndefined();

    expect(key).toHaveBeenCalled();
    expect(setItem).toHaveBeenCalled();
    expect(removeItem).toHaveBeenCalled();
    expect(getItem).toHaveBeenCalled();
  });
});
