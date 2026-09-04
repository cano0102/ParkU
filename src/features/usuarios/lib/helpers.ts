import type React from "react";
import { theme } from "@/styles/theme";
import { getAvatarGradient, getInitials } from "@/utils/format";
import { NOMBRE_MIN, NOMBRE_MAX, PASSWORD_MIN, PASSWORD_MAX, PASSWORD_REQUISITOS, PASSWORD_AYUDA, TELEFONO_REGEX, EMAIL_REGEX, quitarDigitos, filtrarTelefono, validarTelefono, validarPassword } from "@/utils/validation";

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
export { NOMBRE_MIN, NOMBRE_MAX, PASSWORD_MIN, PASSWORD_MAX, PASSWORD_REQUISITOS, PASSWORD_AYUDA, TELEFONO_REGEX, EMAIL_REGEX, quitarDigitos, filtrarTelefono, validarTelefono, validarPassword };

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

/**
 * Orden del listado: los usuarios creados más recientemente primero.
 *
 * Se usa la fecha de creación que devuelva la API cuando está disponible. Si el backend no
 * la expone, se ordena por id descendente: en una tabla con id autoincremental un id mayor
 * significa dado de alta después, así que sigue siendo el dato del backend y no un
 * reordenamiento inventado en pantalla.
 */
export function compararUsuariosPorRecientes(
  a: { id: string; fechaCreacion?: string },
  b: { id: string; fechaCreacion?: string }
): number {
  const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : NaN;
  const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : NaN;
  if (!Number.isNaN(fechaA) && !Number.isNaN(fechaB) && fechaA !== fechaB) {
    return fechaB - fechaA;
  }
  return Number(b.id) - Number(a.id);
}

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
  /** Documento de identidad, obligatorio para toda cuenta. Son columnas de `usuario`
   *  (migración 002 del backend), así que viajan en el mismo POST/PUT que el resto.
   *  El "tipo de usuario" (Aprendiz/Instructor/…) NO se pide aquí: es del conductor. */
  tipoDocumento: string;
  numeroDocumento: string;
  /** Foto de perfil (data URL) para reconocer a la persona en el listado. Opcional, y como
   *  `usuario` tampoco tiene columna de foto en la API, se guarda en este navegador —
   *  ver services/core/fotosPerfil.ts. */
  foto: string;
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
  foto: "",
});
