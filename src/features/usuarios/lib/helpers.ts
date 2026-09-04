import type React from "react";
import { theme } from "@/styles/theme";
import { getAvatarGradient, getInitials } from "@/utils/format";
import { NOMBRE_MIN, NOMBRE_MAX, PASSWORD_MIN, PASSWORD_MAX, TELEFONO_REGEX, EMAIL_REGEX, quitarDigitos, filtrarTelefono, validarTelefono } from "@/utils/validation";

export const COLORS = theme;

/** La cuenta súper admin real: no se puede editar ni desactivar desde esta pantalla (por
 *  nadie, ni siquiera otro Admin), y es la única que puede asignarle el rol Administrador
 *  a alguien más — ver `useUsuarioForm.ts` y `useUsuarioFormState.ts`. */
export const SUPER_ADMIN_CORREO = "admin@parku.sena.edu.co";

export const USUARIOS_PROTEGIDOS = ["admin@sena.edu.co", "superadmin@sena.edu.co", SUPER_ADMIN_CORREO];

export const getRoleAccent = (rol: string) => {
  switch (rol) {
    case "Administrador": return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", dot: "#EF4444" };
    case "SuperAdmin": return { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6" };
    case "Supervisor": return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB" };
    case "Vigilante": return { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B" };
    default: return { bg: "#ECFDF5", text: "#166534", border: "#A7F3D0", dot: "#39A900" };
  }
};

export const avatarColors = getAvatarGradient;
export const initials = getInitials;
export { NOMBRE_MIN, NOMBRE_MAX, PASSWORD_MIN, PASSWORD_MAX, TELEFONO_REGEX, EMAIL_REGEX, quitarDigitos, filtrarTelefono, validarTelefono };

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 11,
  border: `1px solid ${COLORS.border}`,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  background: COLORS.bg,
  color: COLORS.text,
};

export const inputErrorStyle: React.CSSProperties = {
  borderColor: "#DC2626",
};

export const inputIconStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: 38,
};

export interface FormState {
  correo: string;
  password: string;
  /** Repetición de la contraseña al crear; debe coincidir con `password`. No viaja a la API. */
  confirmPassword: string;
  nombre: string;
  /** Teléfono de contacto de la cuenta (opcional). */
  numero: string;
  /** Id del Rol (string, p. ej. "1") — se convierte a rol_id numérico al guardar. */
  rol: string;
  estado: "activo" | "inactivo";
  /** Documento de identidad, obligatorio para toda cuenta. La tabla `usuario` no tiene
   *  columnas de documento: el dato se guarda en el `conductor` vinculado por `usuario_id`
   *  — ver useUsuariosData.guardarDocumentoDeUsuario. */
  tipoDocumento: string;
  numeroDocumento: string;
  /** FK obligatoria de `conductor` (Aprendiz/Instructor/…), del catálogo /catalogos/tipos-usuario. */
  tipoUsuarioId: string;
}

export const emptyForm = (): FormState => ({
  correo: "",
  password: "",
  confirmPassword: "",
  nombre: "",
  numero: "",
  rol: "",
  estado: "activo",
  tipoDocumento: "CC",
  numeroDocumento: "",
  tipoUsuarioId: "",
});
