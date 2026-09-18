import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Envuelve la acción de un botón de confirmación para que no se pueda disparar dos veces.
 *
 * Contra la API real, confirmar algo tarda uno o dos segundos (la petición, su preflight y
 * el refetch de la lista). Sin esto, el botón seguía activo mientras tanto y el segundo clic
 * mandaba la misma petición otra vez — y el backend respondía con "ya no se puede editar",
 * "no se encontró el recurso", etc. sobre un cambio que en realidad ya había aplicado.
 *
 * Devuelve la acción envuelta y `enCurso`, para deshabilitar el botón y cambiarle el texto.
 * Si la acción no devuelve una promesa (cierra el diálogo y ya), no hay nada que esperar.
 */
export function useEnCurso<A extends unknown[]>(accion: (...args: A) => void | Promise<unknown>) {
  const [enCurso, setEnCurso] = useState(false);
  const enCursoRef = useRef(false);
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => { montado.current = false; };
  }, []);

  const ejecutar = useCallback(async (...args: A) => {
    // La ref, no el estado: dos clics en el mismo tick llegan antes de que React re-renderice.
    if (enCursoRef.current) return;
    const resultado = accion(...args);
    if (!(resultado instanceof Promise)) return;
    enCursoRef.current = true;
    setEnCurso(true);
    try {
      await resultado;
    } catch {
      // Quien llama ya avisa del error (toast de la mutación); aquí solo interesa liberar el botón.
    } finally {
      enCursoRef.current = false;
      if (montado.current) setEnCurso(false);
    }
  }, [accion]);

  return [ejecutar, enCurso] as const;
}
