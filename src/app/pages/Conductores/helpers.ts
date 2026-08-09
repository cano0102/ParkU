import type React from "react";
import { Car, Bike, GraduationCap, BookOpen } from "lucide-react";
import { theme } from "../../theme";

export const COLORS = theme;

const AVATAR_GRADIENTS = [
  ["#39A900", "#2D7D00"],
  ["#2563EB", "#1D4ED8"],
  ["#8B5CF6", "#7C3AED"],
  ["#F59E0B", "#D97706"],
  ["#EF4444", "#DC2626"],
  ["#0891B2", "#0E7490"],
] as const;

export const getAvatarGradient = (str: string): [string, string] => {
  const idx = (str?.charCodeAt(0) ?? 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx] as [string, string];
};

export const getInitials = (nombre: string): string => {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

export const getTipoStyle = (tipo: string) => {
  return tipo === "instructor"
    ? { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB", label: "Instructor", icon: GraduationCap }
    : { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", label: "Aprendiz", icon: BookOpen };
};

export const getTipoVehiculoStyle = (tipo: "carro" | "moto") => {
  if (tipo === "carro") {
    return {
      bg: "#EFF6FF",
      text: "#2563EB",
      border: "#BFDBFE",
      dot: "#3B82F6",
      label: "Carro",
      icon: Car,
    };
  }
  return {
    bg: "#FFFBEB",
    text: "#D97706",
    border: "#FDE68A",
    dot: "#F59E0B",
    label: "Moto",
    icon: Bike,
  };
};

export const sanitizeText = (text: string): string => {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
};

export const PLACA_REGEX = /^[A-Z0-9]{5,8}$/;

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
  border: "1px solid #FCA5A5",
  background: "#FEF2F2",
};

export interface FormState {
  usuarioId: string;
  tipoConductor: "aprendiz" | "instructor";
  centroFormacion: string;
  discapacidad: boolean;
  tipoDiscapacidad: string;
  estado: "activo" | "inactivo";
  placa: string;
  tipoVehiculo: "carro" | "moto";
  marca: string;
  descripcionVehiculo: string;
}

export const emptyForm = (): FormState => ({
  usuarioId: "",
  tipoConductor: "aprendiz",
  centroFormacion: "",
  discapacidad: false,
  tipoDiscapacidad: "",
  estado: "activo",
  placa: "",
  tipoVehiculo: "carro",
  marca: "",
  descripcionVehiculo: "",
});

export interface FormErrors {
  usuarioId?: string;
  centroFormacion?: string;
  placa?: string;
}
