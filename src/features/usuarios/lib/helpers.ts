import type React from "react";
import { theme } from "@/theme";
import { getAvatarGradient, getInitials, sanitizeText } from "@/utils/format";
import { NOMBRE_MIN, NOMBRE_MAX, PASSWORD_MIN, PASSWORD_MAX, TELEFONO_REGEX, EMAIL_REGEX } from "@/utils/validation";

export const COLORS = theme;

export const USUARIOS_PROTEGIDOS = ["admin@sena.edu.co", "superadmin@sena.edu.co"];

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
export { sanitizeText, NOMBRE_MIN, NOMBRE_MAX, PASSWORD_MIN, PASSWORD_MAX, TELEFONO_REGEX, EMAIL_REGEX };

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
  nombre: string;
  numero: string;
  rol: string;
  tipoDocumento: string;
  identificacion: string;
  estado: "activo" | "inactivo";
}

export const emptyForm = (): FormState => ({
  correo: "",
  password: "",
  nombre: "",
  numero: "",
  rol: "",
  tipoDocumento: "CC",
  identificacion: "",
  estado: "activo",
});
