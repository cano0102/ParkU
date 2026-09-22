/**
 * Evidencias de un incidente: las fotos que lo prueban.
 *
 * La API las modela como un sub-recurso de la novedad (`/novedades/:id/evidencias`), no como
 * un campo del reporte, y **sube un archivo por petición**. De ahí dos consecuencias que se
 * notan en la interfaz: las fotos se envían DESPUÉS de crear el reporte (antes no hay id al
 * que colgarlas) y varias fotos son varias llamadas.
 */
import { apiFetch } from '../core/http';
import { getToken } from '../core/tokenStorage';

/** El backend rechaza la cuarta (ver evidenciaNovedad.service.js). */
export const MAX_EVIDENCIAS = 3;

/** Lo que el backend acepta como imagen (ver el middleware de subida de novedades.routes.js). */
export const FORMATOS_EVIDENCIA = ['image/jpeg', 'image/png', 'image/webp'];
export const EXTENSIONES_EVIDENCIA = 'JPG, PNG o WEBP';

/** Límite por archivo del backend, en megabytes. */
export const MAX_MB_EVIDENCIA = 15;

export interface Evidencia {
  id: string;
  /** Ruta pública devuelta por la API. */
  url: string;
  tipo: string;
  descripcion: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? '';
const API_ROOT = API_BASE.replace(/\/api\/?$/, '');

/** Convierte la ruta que devuelve la API en la URL pública real del archivo. */
export function resolverUrlEvidencia(url: string): string {
  const valor = url.trim();
  if (!valor) return '';
  if (/^(https?:|data:|blob:)/i.test(valor)) return valor;
  if (valor.startsWith('/api/')) return `${API_ROOT}${valor}`;
  if (valor.startsWith('/')) return `${API_ROOT}${valor}`;
  return `${API_ROOT}/${valor}`;
}

/** Descarga una evidencia con el token de sesión y devuelve una URL temporal para el navegador. */
export async function cargarEvidencia(url: string): Promise<string> {
  const src = resolverUrlEvidencia(url);
  if (!src || /^(data:|blob:)/i.test(src)) return src;

  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const respuesta = await fetch(src, { headers });
  if (!respuesta.ok) throw new Error(`No se pudo cargar la evidencia (${respuesta.status}).`);
  return URL.createObjectURL(await respuesta.blob());
}

interface ApiEvidencia {
  id: number;
  url: string;
  tipo: string;
  descripcion?: string | null;
}

function toFrontend(e: ApiEvidencia): Evidencia {
  return {
    id: String(e.id),
    url: e.url,
    tipo: (e.tipo ?? 'FOTO').toLowerCase(),
    descripcion: e.descripcion ?? '',
  };
}

/**
 * Por qué este archivo no sirve como evidencia, o null si sí sirve.
 *
 * Se comprueba antes de enviarlo: subir 15 MB para que el servidor lo rechace al final es una
 * espera inútil, y el mensaje que devuelve no dice qué formatos valen.
 */
export function motivoArchivoInvalido(archivo: File): string | null {
  if (!FORMATOS_EVIDENCIA.includes(archivo.type)) {
    return `"${archivo.name}" no es una imagen ${EXTENSIONES_EVIDENCIA}.`;
  }
  if (archivo.size > MAX_MB_EVIDENCIA * 1024 * 1024) {
    return `"${archivo.name}" pesa más de ${MAX_MB_EVIDENCIA} MB.`;
  }
  return null;
}

/** Las evidencias ya guardadas de un incidente. */
export async function listar(incidenteId: string): Promise<Evidencia[]> {
  const filas = await apiFetch<ApiEvidencia[]>(`/novedades/${incidenteId}/evidencias`);
  return (filas ?? []).map(toFrontend);
}

/** Sube UNA imagen. Para varias, se llama varias veces (la API no admite lotes). */
export async function subir(incidenteId: string, archivo: File): Promise<Evidencia | null> {
  const cuerpo = new FormData();
  cuerpo.append('archivo', archivo);
  cuerpo.append('tipo', 'FOTO');
  const creada = await apiFetch<ApiEvidencia | null>(`/novedades/${incidenteId}/evidencias`, {
    method: 'POST',
    body: cuerpo,
  });
  return creada ? toFrontend(creada) : null;
}

/**
 * Sube varias, una tras otra, y devuelve cuántas entraron y qué falló.
 *
 * En serie y no en paralelo a propósito: el backend cuenta las existentes para aplicar el
 * máximo de tres, y tres peticiones simultáneas pueden leer ese conteo antes de que las otras
 * escriban. Además, si una falla, las anteriores ya quedaron guardadas — por eso se informa
 * del resultado en vez de dar todo por perdido.
 */
export async function subirVarias(
  incidenteId: string,
  archivos: File[],
): Promise<{ subidas: number; errores: string[] }> {
  let subidas = 0;
  const errores: string[] = [];
  for (const archivo of archivos) {
    try {
      await subir(incidenteId, archivo);
      subidas += 1;
    } catch (error) {
      errores.push(error instanceof Error ? error.message : `No se pudo subir "${archivo.name}".`);
    }
  }
  return { subidas, errores };
}

export async function remove(evidenciaId: string): Promise<void> {
  await apiFetch<void>(`/evidencias/${evidenciaId}`, { method: 'DELETE' });
}
