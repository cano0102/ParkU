import { useEffect, type ReactNode } from 'react';
import { despertarBackend } from '@/services/core/http';
import { precargarRutas } from './paginas';

/**
 * Adelanta lo que viene después de la pantalla pública que envuelve: descarga los chunks de
 * `rutas` y despierta el backend (ver `despertarBackend`), mientras se muestra `children`.
 *
 * Es la forma de que una pantalla prepare la siguiente sin saber nada del router (la
 * landing adelanta el login; el login adelanta la app): las features no importan de
 * `routes/`, así que la decisión de qué va después de qué se toma aquí, en el árbol de
 * rutas, que es donde ya está escrita.
 */
export function Precarga({ rutas, children }: { rutas: string[]; children: ReactNode }) {
  useEffect(() => {
    despertarBackend();
    return precargarRutas(rutas);
  }, [rutas]);
  return <>{children}</>;
}
