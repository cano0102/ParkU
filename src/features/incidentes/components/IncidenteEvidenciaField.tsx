import { Upload, X } from "lucide-react";
import { theme } from "@/styles/theme";
import { MAX_EVIDENCIA_MB } from "../lib/constants";

const C = theme;

interface IncidenteEvidenciaFieldProps {
  evidencia: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

/** Campo de carga/preview de la evidencia fotográfica del incidente. */
export function IncidenteEvidenciaField({ evidencia, onFileChange, onRemove }: IncidenteEvidenciaFieldProps) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
        Evidencia fotográfica
      </label>
      <div style={{
        borderRadius: 11, border: `2px dashed ${C.border}`,
        background: "#F8FAFC", overflow: "hidden",
        transition: "border-color .2s",
      }}>
        <input
          type="file"
          id="evidencia"
          accept="image/*"
          onChange={onFileChange}
          style={{ display: "none" }}
        />
        {evidencia ? (
          <div style={{ padding: "12px", textAlign: "center", position: "relative" }}>
            <button
              onClick={onRemove}
              aria-label="Quitar evidencia"
              style={{
                position: "absolute", top: 8, right: 8,
                width: 24, height: 24, borderRadius: 7,
                border: "none", background: "rgba(15,23,42,.55)",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={13} />
            </button>
            <img
              src={evidencia}
              alt="Evidencia"
              style={{ maxHeight: 120, margin: "0 auto", borderRadius: 8 }}
            />
            <p style={{ fontSize: 11, color: C.primary, marginTop: 8 }}>Evidencia cargada ✓</p>
          </div>
        ) : (
          <label htmlFor="evidencia" style={{ cursor: "pointer", display: "block" }}>
            <div style={{ padding: "24px", textAlign: "center" }}>
              <Upload size={32} color={C.textLight} style={{ margin: "0 auto 8px" }} />
              <p style={{ fontSize: 12, color: C.textLight }}>Toca para cargar imagen de evidencia</p>
              <p style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Máximo {MAX_EVIDENCIA_MB}MB</p>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}
