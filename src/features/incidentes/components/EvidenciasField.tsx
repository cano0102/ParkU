import { useEffect, useState } from "react";
import {
  IconPhotoOff as PhotoOff,
  IconX as X,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import type { Evidencia } from "@/services/api/evidencias";

const C = theme;

/* Define VITE_API_URL en tu .env si el backend sirve archivos desde otro host.
   Ej: VITE_API_URL=http://localhost:8000  (sin barra final) */
const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "";

function resolverUrl(url: string): string {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}

/** Nombre visible: descripción si la hay, si no "Evidencia N". */
function nombreDe(ev: Evidencia, i: number): string {
  const d = (ev.descripcion ?? "").trim();
  return d || `Evidencia ${i + 1}`;
}

/**
 * Carga la evidencia con fetch (para mandar el token) y devuelve un blob URL.
 * Si el fetch falla, deja que el <img> intente directo por si el backend no pide auth.
 */
function useEvidenciaSrc(url: string): { src: string | null; error: boolean; cargando: boolean } {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!url) { setCargando(false); setError(true); return; }
    if (/^(data:|blob:)/i.test(url)) { setSrc(url); setCargando(false); return; }

    let cancelado = false;
    let objectUrl: string | null = null;
    setCargando(true); setError(false); setSrc(null);

    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") ?? localStorage.getItem("access_token")
      : null;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(url, { headers, credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (cancelado) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
        setCargando(false);
      })
      .catch(() => {
        // Fallback: algunos backends sirven la imagen sin auth por CORS simple.
        // Probar directo por si el token no era necesario o la ruta es pública.
        if (cancelado) return;
        const img = new Image();
        img.onload = () => { if (!cancelado) { setSrc(url); setCargando(false); } };
        img.onerror = () => { if (!cancelado) { setError(true); setCargando(false); } };
        img.src = url;
      });

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  return { src, error, cargando };
}

function EvidenciaThumb({
  evidencia, indice, onPreview,
}: {
  evidencia: Evidencia;
  indice: number;
  onPreview: (url: string, nombre: string) => void;
}) {
  const urlOriginal = (evidencia.url ?? "").trim();
  const url = resolverUrl(urlOriginal);
  const nombre = nombreDe(evidencia, indice);
  const { src, error, cargando } = useEvidenciaSrc(url);

  return (
    <button
      type="button"
      onClick={() => src && onPreview(src, nombre)}
      /* El title muestra la URL cruda: pásale el ratón por encima y sabrás si viene vacía,
         relativa o absoluta sin abrir la consola. */
      title={urlOriginal ? `URL: ${urlOriginal}` : "Sin URL en la respuesta"}
      aria-label={`Ver ${nombre}`}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        width: "100%",
        borderRadius: 10,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        background: C.surfaceSubtle,
        padding: 0,
        cursor: src ? "zoom-in" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={nombre}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : cargando ? (
        <span style={{ fontSize: 10, color: C.textLight }}>Cargando…</span>
      ) : (
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 6, padding: 10, color: C.textLight,
          fontSize: 10, textAlign: "center", lineHeight: 1.25,
        }}>
          <PhotoOff size={22} />
          <span style={{ wordBreak: "break-word", maxWidth: "100%" }}>
            {!urlOriginal ? "Sin URL" : error ? "No se pudo cargar" : "Error"}
          </span>
        </div>
      )}
    </button>
  );
}

/** Galería de evidencias: thumbnails cuadradas, con lightbox al hacer clic. */
export function EvidenciaGallery({ evidencias }: { evidencias: Evidencia[] }) {
  const [preview, setPreview] = useState<{ url: string; nombre: string } | null>(null);

  return (
    <>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
        gap: 8,
      }}>
        {evidencias.map((ev, i) => (
          <EvidenciaThumb
            key={ev.id ?? i}
            evidencia={ev}
            indice={i}
            onPreview={(url, nombre) => setPreview({ url, nombre })}
          />
        ))}
      </div>

      {preview && (
        <div
          onClick={() => setPreview(null)}
          role="dialog"
          aria-label={preview.nombre}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(15,23,42,.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24, cursor: "zoom-out",
          }}
        >
          <img
            src={preview.url}
            alt={preview.nombre}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "92vw", maxHeight: "88vh",
              borderRadius: 12,
              boxShadow: "0 24px 64px rgba(0,0,0,.55)",
              cursor: "default",
            }}
          />
          <button
            type="button"
            onClick={() => setPreview(null)}
            aria-label="Cerrar vista previa"
            style={{
              position: "absolute", top: 16, right: 16,
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,.15)", border: "none",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}