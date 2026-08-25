import { Eye as EyeIcon, EyeOff, KeyRound } from "lucide-react";
import { FormField } from "@/components/shared";
import {
  COLORS, PASSWORD_MAX, PASSWORD_MIN, TIPOS_USUARIO, TIPO_USUARIO_LABEL,
  inputErrorStyle, inputIconStyle, inputStyle,
} from "../lib/helpers";

const iconColor = COLORS.textLight;

interface CredencialesAccesoFieldsProps {
  isEdit: boolean;
  password: string;
  showPass: boolean;
  rol: string;
  tipoUsuario: string;
  estado: "activo" | "inactivo";
  passwordError?: string;
  rolError?: string;
  tipoUsuarioError?: string;
  rolesDisponibles: { id: string; nombre: string }[];
  onPasswordChange: (value: string) => void;
  onPasswordBlur: () => void;
  onToggleShowPass: () => void;
  onRolChange: (value: string) => void;
  onTipoUsuarioChange: (value: string) => void;
  onEstadoChange: (value: "activo" | "inactivo") => void;
}

/** Sección "Credenciales y acceso": contraseña, rol, tipo de usuario y (al editar) estado de la cuenta. */
export function CredencialesAccesoFields({
  isEdit, password, showPass, rol, tipoUsuario, estado, passwordError, rolError, tipoUsuarioError, rolesDisponibles,
  onPasswordChange, onPasswordBlur, onToggleShowPass, onRolChange, onTipoUsuarioChange, onEstadoChange,
}: CredencialesAccesoFieldsProps) {
  return (
    <section style={{ borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}` }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: COLORS.textLight, textTransform: "uppercase" }}>
          Credenciales y acceso
        </p>
      </div>
      <div className="uf-modal-grid" style={{ padding: "1rem 1.2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FormField label="Contraseña" hint={isEdit ? "vacío = sin cambios" : `mín. ${PASSWORD_MIN} caracteres`} error={passwordError}>
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
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: iconColor, display: "flex", alignItems: "center",
              }}
              aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPass ? <EyeOff size={14} /> : <EyeIcon size={14} />}
            </button>
          </div>
        </FormField>

        <FormField label="Rol del sistema" error={rolError}>
          <select
            value={rol}
            onChange={(e) => onRolChange(e.target.value)}
            style={rolError ? { ...inputStyle, ...inputErrorStyle, appearance: "none", cursor: "pointer" } : { ...inputStyle, appearance: "none", cursor: "pointer" }}
          >
            <option value="">Seleccionar rol…</option>
            {rolesDisponibles.map((r) => (
              <option key={r.id} value={r.nombre}>{r.nombre}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Tipo de usuario" error={tipoUsuarioError}>
          <select
            value={tipoUsuario}
            onChange={(e) => onTipoUsuarioChange(e.target.value)}
            style={tipoUsuarioError ? { ...inputStyle, ...inputErrorStyle, appearance: "none", cursor: "pointer" } : { ...inputStyle, appearance: "none", cursor: "pointer" }}
          >
            <option value="">Seleccionar tipo…</option>
            {TIPOS_USUARIO.map((t) => (
              <option key={t} value={t}>{TIPO_USUARIO_LABEL[t]}</option>
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
