import { FormField } from "@/components/shared";
import { COLORS, inputErrorStyle, inputStyle } from "../lib/helpers";

interface RolSistemaFieldProps {
  rol: string;
  rolError?: string;
  /** Roles reales (`/api/roles`) — se selecciona por `id`, no por nombre. */
  rolesDisponibles: { id: string; nombre: string }[];
  onRolChange: (value: string) => void;
}

/**
 * Sección "Rol del sistema", al principio del formulario.
 *
 * Vivía dentro de "Credenciales y acceso", al final. Se sacó aquí porque el rol condiciona
 * lo que viene después: al elegir Conductor aparece el "Tipo de usuario" en la sección del
 * documento, y con el selector al fondo había que rellenar medio formulario para descubrir
 * que faltaba un campo más arriba.
 */
export function RolSistemaField({ rol, rolError, rolesDisponibles, onRolChange }: RolSistemaFieldProps) {
  return (
    <section style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
          Rol del sistema *
        </p>
      </div>
      <div style={{ padding: "1rem 1.2rem" }}>
        <FormField label="Rol del sistema" error={rolError}>
          <select
            value={rol}
            aria-label="Rol del sistema"
            onChange={(e) => onRolChange(e.target.value)}
            style={rolError
              ? { ...inputStyle, ...inputErrorStyle, appearance: "none", cursor: "pointer" }
              : { ...inputStyle, appearance: "none", cursor: "pointer" }}
          >
            <option value="">Seleccionar rol…</option>
            {rolesDisponibles.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </FormField>
      </div>
    </section>
  );
}
