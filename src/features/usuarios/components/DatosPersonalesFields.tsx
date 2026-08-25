import { Mail } from "lucide-react";
import { FormField } from "@/components/shared";
import { COLORS, NOMBRE_MAX, inputErrorStyle, inputIconStyle, inputStyle } from "../lib/helpers";

const iconColor = COLORS.textLight;

interface DatosPersonalesFieldsProps {
  nombre: string;
  correo: string;
  nombreError?: string;
  correoError?: string;
  onNombreChange: (value: string) => void;
  onNombreBlur: () => void;
  onCorreoChange: (value: string) => void;
  onCorreoBlur: () => void;
}

/** Sección "Datos personales": nombre completo y correo. */
export function DatosPersonalesFields({
  nombre, correo, nombreError, correoError,
  onNombreChange, onNombreBlur, onCorreoChange, onCorreoBlur,
}: DatosPersonalesFieldsProps) {
  return (
    <section style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
          Datos personales
        </p>
      </div>
      <div style={{ padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: 10 }}>
        <FormField label="Nombre completo" hint={`${nombre.trim().length}/${NOMBRE_MAX}`} error={nombreError}>
          <input
            placeholder="ej. María García López"
            value={nombre}
            maxLength={NOMBRE_MAX}
            onChange={(e) => onNombreChange(e.target.value)}
            onBlur={onNombreBlur}
            style={nombreError ? { ...inputStyle, ...inputErrorStyle } : inputStyle}
          />
        </FormField>
        <FormField label="Correo electrónico" error={correoError}>
          <div style={{ position: "relative" }}>
            <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: iconColor }} />
            <input
              type="email"
              placeholder="correo@sena.edu.co"
              value={correo}
              onChange={(e) => onCorreoChange(e.target.value)}
              onBlur={onCorreoBlur}
              style={correoError ? { ...inputIconStyle, ...inputErrorStyle } : inputIconStyle}
            />
          </div>
        </FormField>
      </div>
    </section>
  );
}
