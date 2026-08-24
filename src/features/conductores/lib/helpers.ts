import type React from "react";
import { Car, Bike, GraduationCap, BookOpen, Briefcase, UserCog, Contact } from "lucide-react";
import { theme } from "@/theme";
import { validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca } from "@/utils/validation";
import { getAvatarGradient, getInitials, sanitizeText } from "@/utils/format";

export { validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca };
export { getAvatarGradient, getInitials, sanitizeText };

export const COLORS = theme;

const TIPO_CONDUCTOR_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; label: string; icon: typeof GraduationCap }> = {
  instructor:     { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB", label: "Instructor",     icon: GraduationCap },
  aprendiz:       { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", label: "Aprendiz",       icon: BookOpen },
  administrativo: { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6", label: "Administrativo", icon: Briefcase },
  coordinador:    { bg: "#ECFEFF", text: "#0E7490", border: "#A5F3FC", dot: "#0891B2", label: "Coordinador",    icon: UserCog },
  visitante:      { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", dot: "#64748B", label: "Visitante",      icon: Contact },
};

export const TIPOS_CONDUCTOR = ["aprendiz", "instructor", "administrativo", "coordinador", "visitante"] as const;

export const getTipoStyle = (tipo: string) => TIPO_CONDUCTOR_STYLES[tipo] ?? TIPO_CONDUCTOR_STYLES.aprendiz;

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

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 14px",
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
  tipoConductor: "aprendiz" | "instructor" | "administrativo" | "coordinador" | "visitante";
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
