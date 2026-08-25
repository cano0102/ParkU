/**
 * Catálogos de referencia de solo lectura (`/api/catalogos/*`, cualquier
 * usuario autenticado). Hoy solo expone tipos de usuario (Aprendiz,
 * Instructor, Administrativo, Contratista, Visitante), usado por el
 * formulario de Conductores (`tipo_usuario_id`).
 */
import { apiFetch } from '../core/http';

export interface TipoUsuario {
  id: string;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

interface ApiTipoUsuario {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: boolean;
}

export async function getTiposUsuario(): Promise<TipoUsuario[]> {
  const rows = await apiFetch<ApiTipoUsuario[]>('/catalogos/tipos-usuario');
  return rows.map((t) => ({ id: String(t.id), nombre: t.nombre, descripcion: t.descripcion ?? '', estado: t.estado }));
}
