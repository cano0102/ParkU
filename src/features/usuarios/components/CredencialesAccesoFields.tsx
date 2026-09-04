import { Eye as EyeIcon, EyeOff, Info, KeyRound } from "lucide-react";
import { FormField } from "@/components/shared";
import {
  COLORS, PASSWORD_MAX, PASSWORD_REQUISITOS, PASSWORD_AYUDA,
  inputErrorStyle, inputIconStyle, inputStyle,
} from "../lib/helpers";

const iconColor = COLORS.textLight;

interface CredencialesAccesoFieldsProps {
  isEdit: boolean;
  password: string;
  confirmPassword: string;
  showPass: boolean;
  rol: string;
  estado: "activo" | "inactivo";
  passwordError?: string;
  confirmPasswordError?: string;
  rolError?: string;
  /** Roles reales (`/api/roles`) — se selecciona por `id`, no por nombre. */
  rolesDisponibles: { id: string; nombre: string }[];
  onPasswordChange: (value: string) => void;
  onPasswordBlur: () => void;
  onConfirmPasswordChange: (value: string) => void;
  onConfirmPasswordBlur: () => void;
  onToggleShowPass: () => void;
  onRolChange: (value: string) => void;
  onEstadoChange: (value: "activo" | "inactivo") => void;
}

/** Sección "Credenciales y acceso": contraseña, rol y (al editar) estado de la cuenta. */
export function CredencialesAccesoFields({
  isEdit, password, confirmPassword, showPass, rol, estado, passwordError, confirmPasswordError, rolError, rolesDisponibles,
  onPasswordChange, onPasswordBlur, onConfirmPasswordChange, onConfirmPasswordBlur, onToggleShowPass, onRolChange, onEstadoChange,
}: CredencialesAccesoFieldsProps) {
  return (
    <section style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
          Credenciales y acceso
        </p>
      </div>
      <div className="uf-modal-grid" style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {isEdit ? (
          // La API real no tiene forma de que un Admin restablezca la contraseña de otro
          // usuario sin conocerla (no hay endpoint para eso) — antes se mostraba este campo
          // igual, con el hint "vacío = sin cambios", pero cualquier valor que se escribiera
          // se descartaba en silencio al guardar y el formulario avisaba "éxito" de todos
          // modos. Se reemplaza por una nota explícita para no prometer algo que no pasa.
          <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 11, background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
            <Info size={14} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11.5, color: "#1E3A8A", lineHeight: 1.5, margin: 0 }}>
              La contraseña de otro usuario no se puede cambiar desde aquí. Pide a la persona que la actualice desde su Perfil, o usa "¿Olvidaste tu contraseña?" en el login.
            </p>
          </div>
        ) : (
          <FormField label="Contraseña" hint={PASSWORD_REQUISITOS} error={passwordError}>
            <div style={{ position: "relative" }}>
              <KeyRound size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: iconColor }} />
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                maxLength={PASSWORD_MAX}
                onChange={(e) => onPasswordChange(e.target.value)}
                onBlur={onPasswordBlur}
                style={passwordError ? { ...inputIconStyle, ...inputErrorStyle, paddingRight: 38 } : { ...inputIconStyle, paddingRight: 38 }}
              />
              <button
                type="button"
                onClick={onToggleShowPass}
                tabIndex={-1}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: iconColor, display: "flex", alignItems: "center",
                }}
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? <EyeOff size={14} /> : <EyeIcon size={14} />}
              </button>
            </div>
            {!passwordError && (
              <span style={{ fontSize: 10.5, color: COLORS.textLight, lineHeight: 1.4 }}>
                {PASSWORD_AYUDA}
              </span>
            )}
          </FormField>
        )}

        {!isEdit && (
          <FormField label="Confirmar contraseña" error={confirmPasswordError}>
            <div style={{ position: "relative" }}>
              <KeyRound size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: iconColor }} />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Repite la contraseña"
                aria-label="Confirmar contraseña"
                value={confirmPassword}
                maxLength={PASSWORD_MAX}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                onBlur={onConfirmPasswordBlur}
                style={confirmPasswordError ? { ...inputIconStyle, ...inputErrorStyle } : inputIconStyle}
              />
            </div>
          </FormField>
        )}

        <FormField label="Rol del sistema" error={rolError}>
          <select
            value={rol}
            aria-label="Rol del sistema"
            onChange={(e) => onRolChange(e.target.value)}
            style={rolError ? { ...inputStyle, ...inputErrorStyle, appearance: "none", cursor: "pointer" } : { ...inputStyle, appearance: "none", cursor: "pointer" }}
          >
            <option value="">Seleccionar rol…</option>
            {rolesDisponibles.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </FormField>

        {isEdit && (
          <div style={{ gridColumn: "1 / -1" }}>
            <FormField label="Estado de la cuenta">
              <div style={{ display: "flex", gap: 8 }}>
                {(["activo", "inactivo"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onEstadoChange(s)}
                    style={{
                      flex: 1, padding: "11px 10px", borderRadius: 11, fontSize: 12, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                      border: estado === s ? "1px solid transparent" : `1px solid ${COLORS.border}`,
                      background: estado === s ? (s === "activo" ? "rgba(57,169,0,.1)" : "rgba(239,68,68,.08)") : COLORS.bg,
                      color: estado === s ? (s === "activo" ? COLORS.primaryDark : "#B91C1C") : COLORS.textLight,
                    }}
                  >
                    {s === "activo" ? "✓ Activo" : "✗ Inactivo"}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        )}
      </div>
    </section>
  );
}
