import { useEffect, useMemo, useRef, useState } from "react";
import {
  IconCamera as Camera,
  IconPhotoPlus as PhotoPlus,
  IconX as X,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import {
  MAX_EVIDENCIAS, MAX_MB_EVIDENCIA, EXTENSIONES_EVIDENCIA, FORMATOS_EVIDENCIA,
  motivoArchivoInvalido, type Evidencia,
} from "@/services/api/evidencias";

const C = theme;

interface EvidenciasFieldProps {
  /** Las que aún no se han enviado: se pueden quitar y cambiar. */
  archivos: File[];
  onChange: (archivos: File[]) => void;
  /** Las que ya están guardadas (al editar o al ver). Cuentan para el máximo. */
  existentes?: Evidencia[];
  /** Solo lectura: en "ver detalle" se miran, no se tocan. */
  soloLectura?: boolean;
}

/**
 * Las fotos que prueban un incidente.
 *
 * Se eligen varias de una vez o de una en una, se ven antes de enviarlas y se pueden quitar
 * mientras el reporte no se haya guardado — describir un golpe con palabras y no poder
 * enseñarlo obligaba a que alguien fuera a mirarlo en persona.
 *
 * El máximo son tres, y lo aplica también el backend. Aquí se avisa antes de intentarlo, con
 * el motivo concreto: qué formato falta, qué archivo pesa de más o que ya no caben.
 */
export function EvidenciasField({ archivos, onChange, existentes = [], soloLectura = false }: EvidenciasFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Las miniaturas viven en memoria del navegador: hay que soltarlas al cambiar la lista o al
     cerrar, o cada foto elegida se queda ocupando memoria hasta recargar la página. */
  const previsualizaciones = useMemo(
    () => archivos.map((archivo) => ({ archivo, url: URL.createObjectURL(archivo) })),
    [archivos],
  );
  useEffect(() => () => {
    previsualizaciones.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previsualizaciones]);

  const total = existentes.length + archivos.length;
  const disponibles = MAX_EVIDENCIAS - total;

  const agregar = (nuevos: FileList | null) => {
    if (!nuevos?.length) return;
    const lista = Array.from(nuevos);

    const invalidos = lista.map(motivoArchivoInvalido).filter(Boolean) as string[];
    const validos = lista.filter((a) => !motivoArchivoInvalido(a));

    if (validos.length > disponibles) {
      setError(`Solo puedes agregar un máximo de ${MAX_EVIDENCIAS} imágenes.`);
      onChange([...archivos, ...validos.slice(0, disponibles)]);
      return;
    }

    setError(invalidos[0] ?? null);
    if (validos.length) onChange([...archivos, ...validos]);
  };

  const quitar = (indice: number) => {
    setError(null);
    onChange(archivos.filter((_, i) => i !== indice));
  };

  const marco = {
    width: 74, height: 74, borderRadius: 10, objectFit: "cover" as const,
    border: `1px solid ${C.border}`, background: "#F1F5F9",
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: C.text }}>
          {soloLectura ? "Evidencias" : "Evidencias (opcional)"}
        </label>
        {!soloLectura && (
          <span style={{ fontSize: 10, color: C.textLight }}>
            {total} de {MAX_EVIDENCIAS} · {EXTENSIONES_EVIDENCIA}, hasta {MAX_MB_EVIDENCIA} MB
          </span>
        )}
      </div>

      {soloLectura && existentes.length === 0 && (
        <p style={{ fontSize: 11, color: C.textLight }}>Este reporte no tiene fotos.</p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {existentes.map((e) => (
          <a
            key={e.id}
            href={e.url}
            target="_blank"
            rel="noreferrer"
            title="Abrir la imagen en grande"
            style={{ display: "block", lineHeight: 0 }}
          >
            <img src={e.url} alt={e.descripcion || "Evidencia del incidente"} style={marco} />
          </a>
        ))}

        {previsualizaciones.map((p, i) => (
          <div key={`${p.archivo.name}-${i}`} style={{ position: "relative", lineHeight: 0 }}>
            <img src={p.url} alt={`Evidencia por subir: ${p.archivo.name}`} style={marco} />
            {!soloLectura && (
              <button
                type="button"
                onClick={() => quitar(i)}
                aria-label={`Quitar ${p.archivo.name}`}
                title="Quitar esta imagen"
                style={{
                  position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                  border: `1px solid ${C.border}`, background: "#fff", color: C.danger,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0, boxShadow: "0 1px 4px rgba(15,23,42,.18)",
                }}
              >
                <X size={11} />
              </button>
            )}
          </div>
        ))}

        {/* Se puede volver aquí tantas veces como haga falta: elegir las tres de una vez o
            añadirlas de una en una son el mismo camino. */}
        {!soloLectura && disponibles > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              ...marco, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3, cursor: "pointer", background: "#fff",
              borderStyle: "dashed", color: C.textLight, fontFamily: "inherit", fontSize: 9.5,
              fontWeight: 700,
            }}
          >
            {total === 0 ? <Camera size={18} /> : <PhotoPlus size={18} />}
            {total === 0 ? "Agregar" : "Otra más"}
          </button>
        )}
      </div>

      {/* Solo existe cuando se puede subir algo: en "ver detalle" un selector de archivos
          invisible sigue siendo un control que estorba a quien navega con teclado. */}
      {!soloLectura && (
        <input
          ref={inputRef}
          type="file"
          accept={FORMATOS_EVIDENCIA.join(",")}
          multiple
          aria-label="Agregar evidencias"
          onChange={(e) => { agregar(e.target.files); e.target.value = ""; }}
          style={{ display: "none" }}
        />
      )}

      {error && (
        <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>{error}</p>
      )}
    </div>
  );
}
