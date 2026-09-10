import { useEffect, useRef, useState } from "react";
import {
  IconPhoto as Photo,
  IconPhotoOff as PhotoOff,
  IconTrash as Trash,
  IconUpload as Upload,
  IconX as X,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import {
  MAX_EVIDENCIAS,
  motivoArchivoInvalido,
  type Evidencia,
} from "@/services/api/evidencias";

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
function useEvidenciaSrc(url: string): {
  src: string | null;
  error: boolean;
  cargando: boolean;
} {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!url) {
      setCargando(false);
      setError(true);
      return;
    }
    if (/^(data:|blob:)/i.test(url)) {
      setSrc(url);
      setCargando(false);
      return;
    }

    setSrc(url);
    setCargando(false);
    setError(false);
  }, [url]);

  return { src, error, cargando };
}

export function EvidenciasField({
  archivos,
  onChange,
  existentes = [],
  soloLectura = false,
}: {
  archivos: File[];
  onChange: (archivos: File[]) => void;
  existentes?: Evidencia[];
  soloLectura?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const total = archivos.length + existentes.length;
  const puedeAgregar = !soloLectura && total < MAX_EVIDENCIAS;

  const manejarArchivos = (fileList: FileList | null) => {
    if (!fileList || !fileList.length || soloLectura) return;

    const lista = Array.from(fileList);
    const validos: File[] = [];
    const errores: string[] = [];

    for (const archivo of lista) {
      const motivo = motivoArchivoInvalido(archivo);
      if (motivo) {
        errores.push(motivo);
        continue;
      }
      validos.push(archivo);
    }

    if (!validos.length) {
      setError(errores[0] ?? "Archivo no válido.");
      return;
    }

    const espaciables = Math.max(MAX_EVIDENCIAS - total, 0);
    if (espaciables === 0) {
      setError(`Solo puedes agregar un máximo de ${MAX_EVIDENCIAS} imágenes.`);
      return;
    }

    const aceptados = validos.slice(0, espaciables);
    const rechazados = validos.length - aceptados.length;

    if (rechazados > 0) {
      setError(`Solo puedes agregar un máximo de ${MAX_EVIDENCIAS} imágenes.`);
    } else {
      setError(null);
    }

    if (aceptados.length === 0) return;
    onChange([...archivos, ...aceptados]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  if (soloLectura) {
    return <EvidenciaGallery evidencias={existentes} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: C.text,
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          <Photo size={14} />
          <span>Evidencias</span>
        </div>
        <span style={{ fontSize: 11, color: C.textLight, fontWeight: 700 }}>
          {total} de {MAX_EVIDENCIAS}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        aria-label="Agregar evidencias"
        onChange={(event) => manejarArchivos(event.target.files)}
        style={{ display: "none" }}
      />

      {puedeAgregar && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            width: "fit-content",
            padding: "8px 12px",
            borderRadius: 10,
            border: `1px solid ${C.border}`,
            background: C.surfaceSubtle,
            color: C.text,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Upload size={14} />
          Otra más
        </button>
      )}

      {error && (
        <div style={{ fontSize: 12, color: "#b91c1c", fontWeight: 600 }}>
          {error}
        </div>
      )}

      {archivos.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {archivos.map((archivo, index) => (
            <div
              key={`${archivo.name}-${index}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 999,
                border: `1px solid ${C.border}`,
                background: C.surfaceSubtle,
                fontSize: 11,
                color: C.text,
              }}
            >
              <span
                style={{
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {archivo.name}
              </span>
              <button
                type="button"
                aria-label={`Quitar ${archivo.name}`}
                onClick={() => onChange(archivos.filter((_, i) => i !== index))}
                style={{
                  border: "none",
                  background: "transparent",
                  color: C.textLight,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Trash size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EvidenciaThumb({
  evidencia,
  indice,
  onPreview,
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
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : cargando ? (
        <span style={{ fontSize: 10, color: C.textLight }}>Cargando…</span>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: 10,
            color: C.textLight,
            fontSize: 10,
            textAlign: "center",
            lineHeight: 1.25,
          }}
        >
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
  const [preview, setPreview] = useState<{
    url: string;
    nombre: string;
  } | null>(null);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
          gap: 8,
        }}
      >
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
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15,23,42,.88)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            cursor: "zoom-out",
          }}
        >
          <img
            src={preview.url}
            alt={preview.nombre}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "92vw",
              maxHeight: "88vh",
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
              position: "absolute",
              top: 16,
              right: 16,
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,.15)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
