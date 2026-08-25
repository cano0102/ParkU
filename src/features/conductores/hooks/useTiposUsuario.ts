import { useQuery } from '@tanstack/react-query';
import * as catalogosService from '@/services/api/catalogos';

/** Catálogo de tipos de usuario (Aprendiz, Instructor, ...) para el formulario de Conductores. */
export function useTiposUsuario() {
  return useQuery({ queryKey: ['tipos-usuario'], queryFn: catalogosService.getTiposUsuario });
}
