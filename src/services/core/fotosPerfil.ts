/**
 * Fotos de perfil de personas (cuentas de `usuario` y `conductor`), guardadas en el
 * navegador.
 *
 * El modelo real de la API NO tiene columna de foto ni en `usuario` ni en `conductor`
 * (ver el encabezado de services/api/usuarios.ts y de services/api/conductores.ts), así
 * que no hay dónde persistirlas en el backend: viven en localStorage del navegador donde
 * se cargaron, exactamente como ya lo hacía la foto del propio perfil (AuthContext). Este
 * módulo centraliza ese almacenamiento para que la MISMA foto se vea en Perfil, en el
 * listado de Usuarios y en el de Conductores, y avisa a React cuando cambia
 * (`useSyncExternalStore`, ver hooks/useFotos.ts).
 *
 * La llave del ámbito `usuario` es exactamente la que ya usaba AuthContext
 * (`parkuFotoPerfil:<id>`): la foto que alguien se pone desde su propia pantalla de Perfil
 * aparece en el listado de Usuarios sin migrar ni duplicar nada.
 */

export type AmbitoFoto = 'usuario' | 'conductor';

const PREFIJOS: Record<AmbitoFoto, string> = {
  usuario: 'parkuFotoPerfil:',
  conductor: 'parkuFotoConductor:',
};

/** Snapshot en memoria por ámbito. Se REEMPLAZA (nunca se muta) en cada escritura: es lo que
 *  permite que `useSyncExternalStore` detecte el cambio comparando identidades. */
const cache: Partial<Record<AmbitoFoto, ReadonlyMap<string, string>>> = {};

const listeners = new Set<() => void>();

function cargar(ambito: AmbitoFoto): ReadonlyMap<string, string> {
  const prefijo = PREFIJOS[ambito];
  const fotos = new Map<string, string>();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const llave = localStorage.key(i);
      if (!llave || !llave.startsWith(prefijo)) continue;
      const foto = localStorage.getItem(llave);
      if (foto) fotos.set(llave.slice(prefijo.length), foto);
    }
  } catch {
    // localStorage no disponible (modo privado, etc.) — las fotos solo duran esta pestaña.
  }
  return fotos;
}

/** Todas las fotos del ámbito, indexadas por id. La misma referencia mientras nada cambie. */
export function fotosDe(ambito: AmbitoFoto): ReadonlyMap<string, string> {
  const guardadas = cache[ambito] ?? cargar(ambito);
  cache[ambito] = guardadas;
  return guardadas;
}

export function leerFoto(ambito: AmbitoFoto, id: string): string | undefined {
  if (!id) return undefined;
  const fotos = fotosDe(ambito);
  if (fotos.has(id)) return fotos.get(id);

  // La llave puede haberse escrito DESPUÉS de que este módulo tomara su snapshot (otra
  // pestaña, o la sesión restaurada tras cargar el módulo): se lee de localStorage y se
  // adopta, en vez de responder "sin foto" solo porque la caché estaba fría.
  let guardada: string | null = null;
  try {
    guardada = localStorage.getItem(PREFIJOS[ambito] + id);
  } catch {
    // ver nota en `cargar`
  }
  if (!guardada) return undefined;
  cache[ambito] = new Map(fotos).set(id, guardada);
  return guardada;
}

/** Guarda (o borra, con `foto` vacía) la foto de una persona y notifica a los suscriptores. */
export function guardarFoto(ambito: AmbitoFoto, id: string, foto: string): void {
  // Sin id no hay a quién asociarla: pasa al crear, antes de que el backend devuelva el id.
  if (!id) return;
  if (leerFoto(ambito, id) === (foto || undefined)) return;

  const siguiente = new Map(fotosDe(ambito));
  if (foto) siguiente.set(id, foto);
  else siguiente.delete(id);
  cache[ambito] = siguiente;

  try {
    if (foto) localStorage.setItem(PREFIJOS[ambito] + id, foto);
    else localStorage.removeItem(PREFIJOS[ambito] + id);
  } catch {
    // ver nota en `cargar`
  }

  listeners.forEach((avisar) => avisar());
}

export function suscribirseAFotos(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
