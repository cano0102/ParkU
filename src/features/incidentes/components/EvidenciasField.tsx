import { useEffect, useState } from "react";
import {
  IconFile as FileIcon,
  IconPhotoOff as PhotoOff,
  IconX as X,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import type { Evidencia } from "@/services/api/evidencias";

const C = theme;

/* Si el backend sirve archivos desde otro host/puerto, define VITE_API_URL en tu .env.
   Solo se usa para completar URLs relativas; las absolutas y data URLs no se tocan. */
const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "";

function resolverUrl(url: string): string {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return `${API_BASE}/${url}`;
}

/**
 * Carga una evidencia y devuelve un blob URL listo para <img>. Necesario cuando el backend
 * exige el header Authorization: un <img src> plano no lo manda y la imagen sale rota.
 * Si la URL ya es accesible sin auth, se puede saltar esta ruta.
 */
function useEvidenciaBlob(url: string, activo: boolean) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!activo || !url) return;
    // data: y blob: no necesitan fetch, se usan tal cual.
    if (/^(data:|blob:)/i.test(url)) { setBlobUrl(url); return; }

    let cancelado = false;
    let objectUrl: string | null = null;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(url, { headers, credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((blob) => {
        if (cancelado) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      })
      .catch(() => { if (!cancelado) setError(true); });

    return () => {
      cancelado = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, activo]);

  return { blobUrl, error };
}

function EvidenciaThumb({
  evidencia, onPreview,
}: {
  evidencia: Evidencia;
  onPreview: (url: string, nombre: string) => void;
}) {
  const url = resolverUrl(evidencia.url || "");
  const nombre = evidencia.descripcion?.trim() || "Evidencia del incidente";
  const { blobUrl, error } = useEvidenciaBlob(url, true);

  const cargando = !blobUrl && !error;

  return (
    <button
      type="button"
      onClick={() => blobUrl && onPreview(blobUrl, nombre)}
      title={nombre}
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
        cursor: blobUrl ? "zoom-in" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {blobUrl ? (
        <img
          src={blobUrl}
          alt={nombre}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : cargando ? (
        <span style={{ fontSize: 10, color: C.textLight }}>Cargando…</span>
      ) : (
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 6, padding: 10, color: C.textLight,
          fontSize: 10, textAlign: "center", lineHeight: 1.2,
        }}>
          <PhotoOff size={22} />
          <span>No se pudo cargar</span>
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
        {evidencias.map((ev) => (
          <EvidenciaThumb
            key={ev.id}
            evidencia={ev}
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