import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Comprobador de enlaces internos: toda ruta a la que la aplicación navega con `navigate("/…")`
 * tiene que existir en el árbol de rutas.
 *
 * Existe por un fallo real: el botón "Solicitar esta celda" del plano de parqueaderos llevaba
 * a `/reservas`, pero las pantallas de la aplicación viven bajo `/app`, así que caía en la
 * pantalla de "404 ruta no encontrada" y no había forma de reservar desde ahí. Es el tipo de
 * error que TypeScript no ve (una ruta es solo un string) y que solo aparece al hacer clic.
 */

const RAIZ = join(process.cwd(), 'src');

/** Todos los archivos de código bajo src/, sin pruebas. */
function archivosDeCodigo(dir: string): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) return archivosDeCodigo(ruta);
    if (!/\.tsx?$/.test(nombre) || /\.test\.tsx?$/.test(nombre)) return [];
    return [ruta];
  });
}

/**
 * Rutas declaradas en routes/index.tsx. Se leen del propio archivo (no se importa el router:
 * `createBrowserRouter` necesita un DOM con historial y arrastraría media aplicación).
 */
function rutasDeclaradas(): Set<string> {
  const fuente = readFileSync(join(RAIZ, 'routes', 'index.tsx'), 'utf8');
  const paths = [...fuente.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);

  const absolutas = paths.filter((p) => p.startsWith('/'));
  const hijas = paths.filter((p) => !p.startsWith('/') && p !== '*');
  // Todas las hijas cuelgan de /app (es el único layout con hijos en este árbol).
  return new Set([...absolutas, ...hijas.map((p) => `/app/${p}`), '/app']);
}

describe('rutas internas', () => {
  const rutas = rutasDeclaradas();

  it('el árbol de rutas se lee correctamente', () => {
    expect(rutas.has('/login')).toBe(true);
    expect(rutas.has('/app/reservas')).toBe(true);
    expect(rutas.has('/app/parqueaderos')).toBe(true);
  });

  it('cada navigate("/…") apunta a una ruta que existe', () => {
    const rotos: string[] = [];

    for (const archivo of archivosDeCodigo(RAIZ)) {
      const fuente = readFileSync(archivo, 'utf8');
      for (const m of fuente.matchAll(/navigate\(\s*["'](\/[^"'`]*)["']/g)) {
        // Se compara sin query ni hash: lo que tiene que existir es la ruta.
        const destino = m[1].split(/[?#]/)[0].replace(/\/$/, '') || '/';
        if (destino !== '/' && !rutas.has(destino)) {
          rotos.push(`${archivo.replace(RAIZ, 'src')} → ${destino}`);
        }
      }
    }

    expect(rotos).toEqual([]);
  });
});
