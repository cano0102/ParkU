import { useQuery } from '@tanstack/react-query';
import * as catalogosService from '@/services/api/catalogos';
import type { TipoUsuario } from '@/services/api/catalogos';

/**
 * Referencia ESTABLE para cuando la consulta todavía no resolvió.
 *
 * Es la parte importante de este archivo. Si cada consumidor escribe
 * `const { data = [] } = useTiposUsuario()`, ese `[]` es un array NUEVO en cada render: un
 * `useMemo`/`useCallback` que dependa de él cambia de identidad siempre, y un `useEffect`
 * que llame a `setState` con esa dependencia entra en bucle infinito. Ya pasó una vez y dejó
 * la suite de pruebas en 558 s con los workers cayéndose.
 *
 * Devolviendo siempre la MISMA lista vacía desde aquí, ningún consumidor puede reintroducirlo.
 */
const SIN_TIPOS: TipoUsuario[] = [];

/**
 * Catálogo de tipos de usuario (Aprendiz, Instructor, …) para los formularios de Conductores
 * y Usuarios. `data` nunca es `undefined`: mientras carga es la lista vacía compartida.
 */
export function useTiposUsuario() {
  const consulta = useQuery({ queryKey: ['tipos-usuario'], queryFn: catalogosService.getTiposUsuario });
  return { ...consulta, data: consulta.data ?? SIN_TIPOS };
}
