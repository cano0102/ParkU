import { theme } from "@/styles/theme";
import type { FormState } from "../lib/helpers";

const COLORS = theme;

interface RolBasicInfoFieldsProps {
  form: FormState;
  isEditing: boolean;
  nombreErrorVisible: string;
  onNombreChange: (value: string) => void;
  onNombreBlur: () => void;
  onDescripcionChange: (value: string) => void;
  onEstadoChange: (estado: "activo" | "inactivo") => void;
}

/** Campos "Información básica" del formulario de rol: nombre, estado (al editar) y descripción. */
export function RolBasicInfoFields({
  form,
  isEditing,
  nombreErrorVisible,
  onNombreChange,
  onNombreBlur,
  onDescripcionChange,
  onEstadoChange,
}: RolBasicInfoFieldsProps) {
  return (
    <section>
      <p
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 1.5,
          color: COLORS.textLight,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        Información básica
      </p>
      <div className="roles-form-grid" style={{ display: "grid", gridTemplateColumns: isEditing ? "1fr 1fr" : "1fr", gap: 10 }}>
        <div>
          <label
            htmlFor="role-name"
            style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}
          >
            Nombre del rol
          </label>
          <input
            id="role-name"
            type="text"
            placeholder="ej. Operador de turno"
            value={form.nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            onBlur={onNombreBlur}
            style={{
              width: "100%",
              padding: "9px 14px",
              borderRadius: 11,
              border: `1px solid ${nombreErrorVisible ? "#EF4444" : COLORS.border}`,
              fontSize: 13,
              outline: "none",
              fontFamily: "inherit",
              background: "#F8FAFC",
            }}
            required
            aria-required="true"
            aria-invalid={!!nombreErrorVisible}
            aria-describedby={nombreErrorVisible ? "role-name-error" : undefined}
          />
          {nombreErrorVisible && (
            <p
              id="role-name-error"
              style={{ marginTop: 5, fontSize: 11, fontWeight: 700, color: "#EF4444" }}
            >
              {nombreErrorVisible}
            </p>
          )}
        </div>

        {isEditing && (
          <div>
            <label
              htmlFor="role-status"
              style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}
            >
              Estado
            </label>
            <select
              id="role-status"
              value={form.estado}
              onChange={(e) => onEstadoChange(e.target.value as "activo" | "inactivo")}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: 11,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                background: "#F8FAFC",
                cursor: "pointer",
              }}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ marginTop: 8 }}>
        <label
          htmlFor="role-description"
          style={{ display: "block", fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}
        >
          Descripción
        </label>
        <textarea
          id="role-description"
          placeholder="Describe las responsabilidades de este rol..."
          value={form.descripcion}
          onChange={(e) => onDescripcionChange(e.target.value)}
          rows={1}
          style={{
            width: "100%",
            padding: "9px 14px",
            borderRadius: 11,
            border: `1px solid ${COLORS.border}`,
            fontSize: 13,
            outline: "none",
            fontFamily: "inherit",
            background: "#F8FAFC",
            resize: "none",
          }}
        />
      </div>
    </section>
  );
}
