import { FormField } from "@/components/shared";
import { COLORS, TIPOS_DOCUMENTO, NUMERO_DOCUMENTO_MAX, inputStyle, inputErrorStyle, quitarDigitos, filtrarTelefono, type FormState } from "../lib/helpers";

interface DatosConductorFieldsProps {
  form: FormState;
  errors: { nombre?: string; numeroDocumento?: string; correo?: string; numeroTelefonico?: string };
  touched: Record<string, boolean>;
  onChange: (patch: Partial<FormState>) => void;
  onBlur: (field: string) => void;
  onToggleEstado: () => void;
  /**
   * Todo en solo lectura. Se enciende al EDITAR: la identidad de una persona (nombre,
   * documento) no se corrige desde aquí, y su contacto lo mantiene su cuenta. Lo único que
   * se cambia al editar es qué cuenta tiene vinculada y si está activa.
   */
  soloLectura?: boolean;
  /** Muestra el interruptor de activo/inactivo (solo al editar). */
  mostrarEstado?: boolean;
}

/** Identidad, documento y contacto del conductor. */
export function DatosConductorFields({
  form, errors, touched, onChange, onBlur, onToggleEstado,
  soloLectura = false, mostrarEstado = false,
}: DatosConductorFieldsProps) {
  const err = (field: keyof typeof errors) => (touched[field] ? errors[field] : undefined);
  /** Con una cuenta vinculada, el contacto lo aporta esa cuenta y no se edita desde aquí. */
  const deLaCuenta = !!form.usuarioId;
  const bloqueado = (extra = false) => soloLectura || extra;
  const estiloBloqueado = { background: COLORS.bg, color: COLORS.textLight, cursor: "not-allowed" as const };

  return (
    <div className="cf-modal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 10 }}>
      <FormField label="Nombre completo *" error={err("nombre")} style={{ gridColumn: "1 / -1" }}>
        <input
          type="text"
          placeholder="ej. María García López"
          value={form.nombre}
          readOnly={bloqueado(deLaCuenta)}
          aria-readonly={bloqueado(deLaCuenta)}
          onChange={(e) => onChange({ nombre: quitarDigitos(e.target.value) })}
          onBlur={() => onBlur("nombre")}
          style={{ ...inputStyle, ...(err("nombre") ? inputErrorStyle : {}), ...(bloqueado(deLaCuenta) ? estiloBloqueado : {}) }}
        />
      </FormField>

      <FormField label="Tipo de documento">
        <select
          value={form.tipoDocumento}
          disabled={bloqueado()}
          onChange={(e) => onChange({ tipoDocumento: e.target.value as FormState["tipoDocumento"] })}
          style={{ ...inputStyle, appearance: "none", cursor: bloqueado() ? "not-allowed" : "pointer", ...(bloqueado() ? estiloBloqueado : {}) }}
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
          readOnly={bloqueado()}
          aria-readonly={bloqueado()}
          onChange={(e) => onChange({ numeroDocumento: e.target.value.replace(/[^0-9]/g, "") })}
          onBlur={() => onBlur("numeroDocumento")}
          maxLength={NUMERO_DOCUMENTO_MAX}
          style={{ ...inputStyle, ...(err("numeroDocumento") ? inputErrorStyle : {}), ...(bloqueado() ? estiloBloqueado : {}) }}
        />
      </FormField>

      {/* Con una cuenta vinculada el correo lo aporta esa cuenta y no se edita aquí: no se
          añade un segundo campo, es el mismo en modo lectura. Se cambia desde el módulo de
          Usuarios, o vinculando otra cuenta. */}
      <FormField
        label={deLaCuenta ? "Correo (de la cuenta vinculada)" : "Correo"}
        error={err("correo")}
      >
        <input
          type="email"
          placeholder="correo@sena.edu.co"
          value={form.correo}
          readOnly={bloqueado(deLaCuenta)}
          aria-readonly={bloqueado(deLaCuenta)}
          title={deLaCuenta ? "Se toma de la cuenta vinculada; cámbiala desde el módulo de Usuarios" : undefined}
          onChange={(e) => onChange({ correo: e.target.value })}
          onBlur={() => onBlur("correo")}
          style={{ ...inputStyle, ...(err("correo") ? inputErrorStyle : {}), ...(bloqueado(deLaCuenta) ? estiloBloqueado : {}) }}
        />
      </FormField>

      <FormField label="Teléfono (opcional)" error={err("numeroTelefonico")}>
        <input
          type="tel"
          placeholder="300 000 0000"
          value={form.numeroTelefonico}
          readOnly={bloqueado(deLaCuenta)}
          aria-readonly={bloqueado(deLaCuenta)}
          onChange={(e) => onChange({ numeroTelefonico: filtrarTelefono(e.target.value) })}
          onBlur={() => onBlur("numeroTelefonico")}
          maxLength={15}
          style={{ ...inputStyle, ...(err("numeroTelefonico") ? inputErrorStyle : {}), ...(bloqueado(deLaCuenta) ? estiloBloqueado : {}) }}
        />
      </FormField>

      {mostrarEstado && (
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
    </div>
  );
}
