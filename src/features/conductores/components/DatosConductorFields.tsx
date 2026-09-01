import { FormField } from "@/components/shared";
import { useTiposUsuario } from "../hooks/useTiposUsuario";
import { COLORS, TIPOS_DOCUMENTO, NUMERO_DOCUMENTO_MAX, inputStyle, inputErrorStyle, quitarDigitos, type FormState } from "../lib/helpers";

interface DatosConductorFieldsProps {
  isEdit: boolean;
  form: FormState;
  errors: { nombre?: string; numeroDocumento?: string; tipoUsuarioId?: string };
  touched: Record<string, boolean>;
  onChange: (patch: Partial<FormState>) => void;
  onBlur: (field: string) => void;
  onToggleEstado: () => void;
}

/** Identidad, documento, contacto, tipo de usuario y formación del conductor. */
export function DatosConductorFields({ isEdit, form, errors, touched, onChange, onBlur, onToggleEstado }: DatosConductorFieldsProps) {
  const { data: tiposUsuario = [] } = useTiposUsuario();
  const err = (field: keyof typeof errors) => (touched[field] ? errors[field] : undefined);

  return (
    <div className="cf-modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <FormField label="Nombre completo *" error={err("nombre")} style={{ gridColumn: "1 / -1" }}>
        <input
          type="text"
          placeholder="ej. María García López"
          value={form.nombre}
          onChange={(e) => onChange({ nombre: quitarDigitos(e.target.value) })}
          onBlur={() => onBlur("nombre")}
          style={{ ...inputStyle, ...(err("nombre") ? inputErrorStyle : {}) }}
        />
      </FormField>

      <FormField label="Tipo de documento">
        <select
          value={form.tipoDocumento}
          onChange={(e) => onChange({ tipoDocumento: e.target.value as FormState["tipoDocumento"] })}
          style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}
        >
          {TIPOS_DOCUMENTO.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Número de documento *" error={err("numeroDocumento")}>
        <input
          type="text"
          placeholder="ej. 1001234567"
          value={form.numeroDocumento}
          onChange={(e) => onChange({ numeroDocumento: e.target.value.replace(/[^0-9]/g, "") })}
          onBlur={() => onBlur("numeroDocumento")}
          maxLength={NUMERO_DOCUMENTO_MAX}
          style={{ ...inputStyle, ...(err("numeroDocumento") ? inputErrorStyle : {}) }}
        />
      </FormField>

      <FormField label="Correo (opcional)">
        <input
          type="email"
          placeholder="correo@sena.edu.co"
          value={form.correo}
          onChange={(e) => onChange({ correo: e.target.value })}
          style={inputStyle}
        />
      </FormField>

      <FormField label="Teléfono (opcional)">
        <input
          type="tel"
          placeholder="300 000 0000"
          value={form.numeroTelefonico}
          onChange={(e) => onChange({ numeroTelefonico: e.target.value })}
          style={inputStyle}
        />
      </FormField>

      <FormField label="Tipo de usuario *" error={err("tipoUsuarioId")}>
        <select
          value={form.tipoUsuarioId}
          onChange={(e) => onChange({ tipoUsuarioId: e.target.value })}
          style={{ ...inputStyle, ...(err("tipoUsuarioId") ? inputErrorStyle : {}), appearance: "none", cursor: "pointer" }}
        >
          <option value="">Seleccionar…</option>
          {tiposUsuario.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
      </FormField>

      {isEdit && (
        <FormField label="Estado">
          <div style={{ display: "flex", alignItems: "center", gap: 10, height: 42 }}>
            <button
              type="button"
              onClick={onToggleEstado}
              style={{
                width: 44, height: 24, borderRadius: 999,
                background: form.estado === "activo" ? COLORS.primary : "#CBD5E1",
                border: "none", cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0,
              }}
              aria-label={form.estado === "activo" ? "Desactivar" : "Activar"}
            >
              <div
                style={{
                  width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute",
                  top: 2, left: form.estado === "activo" ? 22 : 2, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                }}
              />
            </button>
            <span style={{ fontSize: 12, fontWeight: 700, color: form.estado === "activo" ? COLORS.primaryDark : "#B91C1C" }}>
              {form.estado === "activo" ? "Activo" : "Inactivo"}
            </span>
          </div>
        </FormField>
      )}

      <FormField label="Centro de formación (opcional)" style={{ gridColumn: isEdit ? "1 / -1" : undefined }}>
        <input
          type="text"
          placeholder="ej. Centro de Tecnología"
          value={form.centroFormacion}
          onChange={(e) => onChange({ centroFormacion: e.target.value })}
          style={{ ...inputStyle }}
        />
      </FormField>

      <FormField label="Regional (opcional)">
        <input
          type="text"
          placeholder="ej. Antioquia"
          value={form.regionalFormacion}
          onChange={(e) => onChange({ regionalFormacion: e.target.value })}
          style={inputStyle}
        />
      </FormField>

      <FormField label="Programa de formación (opcional)" style={{ gridColumn: "1 / -1" }}>
        <input
          type="text"
          placeholder="ej. Análisis y Desarrollo de Software"
          value={form.programaFormacion}
          onChange={(e) => onChange({ programaFormacion: e.target.value })}
          style={inputStyle}
        />
      </FormField>
    </div>
  );
}
