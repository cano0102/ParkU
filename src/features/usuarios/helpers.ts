import type React from "react";
import { theme } from "../../theme";

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

const AVATAR_PALETTE = [
  ["#39A900", "#2D7D00"], ["#2563EB", "#1D4ED8"], ["#8B5CF6", "#7C3AED"],
  ["#F59E0B", "#D97706"], ["#EF4444", "#DC2626"], ["#0891B2", "#0E7490"],
] as const;

export const avatarColors = (nombre: string): [string, string] => {
  const idx = (nombre.charCodeAt(0) || 0) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx] as [string, string];
};

export const initials = (nombre: string): string => {
  return nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
};

export const sanitizeText = (text: string): string => {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
};

// ----------------------------------------------
// 🔧 REGLAS DE VALIDACIÓN (correcciones)
// ----------------------------------------------
export const NOMBRE_MIN = 3;
export const NOMBRE_MAX = 100;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;
export const TELEFONO_REGEX = /^[0-9()+\-\s]{7,15}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
