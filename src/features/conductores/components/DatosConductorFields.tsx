import { FormField } from "@/components/shared";
import { COLORS, getTipoStyle, TIPOS_CONDUCTOR, inputStyle, inputErrorStyle, type FormState } from "../lib/helpers";

interface DatosConductorFieldsProps {
  isEdit: boolean;
  tipoConductor: FormState["tipoConductor"];
  centroFormacion: string;
  centroFormacionError?: string;
  estado: FormState["estado"];
  onTipoConductorChange: (tipo: FormState["tipoConductor"]) => void;
  onCentroFormacionChange: (value: string) => void;
  onCentroFormacionBlur: () => void;
  onToggleEstado: () => void;
}

/** Tipo de conductor, centro de formación y (al editar) el estado activo/inactivo. */
export function DatosConductorFields({
  isEdit, tipoConductor, centroFormacion, centroFormacionError, estado,
  onTipoConductorChange, onCentroFormacionChange, onCentroFormacionBlur, onToggleEstado,
}: DatosConductorFieldsProps) {
  return (
    <div className="cf-modal-grid" style={{ display: "grid", gridTemplateColumns: isEdit ? "1fr 1fr 1fr" : "1fr 1fr", gap: 10 }}>
      <FormField label="Tipo de conductor">
        <select
          value={tipoConductor}
          onChange={(e) => onTipoConductorChange(e.target.value as FormState["tipoConductor"])}
          style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
        >
          {TIPOS_CONDUCTOR.map((tipo) => (
            <option key={tipo} value={tipo}>{getTipoStyle(tipo).label}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Centro de formación *" error={centroFormacionError}>
        <input
          type="text"
          placeholder="ej. Centro de Tecnología"
          value={centroFormacion}
          onChange={(e) => onCentroFormacionChange(e.target.value)}
          onBlur={onCentroFormacionBlur}
          style={{ ...inputStyle, ...(centroFormacionError ? inputErrorStyle : {}) }}
          required
        />
      </FormField>

      {isEdit && (
        <FormField label="Estado">
          <div style={{ display: "flex", alignItems: "center", gap: 10, height: 42 }}>
            <button
              type="button"
              onClick={onToggleEstado}
              style={{
                width: 44, height: 24, borderRadius: 999,
                background: estado === "activo" ? COLORS.primary : "#CBD5E1",
                border: "none", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0,
              }}
              aria-label={estado === "activo" ? "Desactivar" : "Activar"}
            >
              <div
                style={{
                  width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute",
                  top: 2, left: estado === "activo" ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                }}
              />
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, color: estado === "activo" ? COLORS.primaryDark : "#B91C1C" }}>
              {estado === "activo" ? "Activo" : "Inactivo"}
            </span>
          </div>
        </FormField>
      )}
    </div>
  );
}
