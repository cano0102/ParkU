import type React from "react";
import { Car, Bike, Truck, Bus as BusIcon, Wind, GraduationCap, BookOpen, Briefcase, Handshake, Contact, type LucideIcon } from "lucide-react";
import { theme } from "@/styles/theme";
import { validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca, quitarDigitos } from "@/utils/validation";
import { getAvatarGradient, getInitials, sanitizeText } from "@/utils/format";
import type { Vehiculo } from "@/services/api/vehiculos";

export { validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca, quitarDigitos };
export { getAvatarGradient, getInitials, sanitizeText };

export const COLORS = theme;

export const TIPOS_DOCUMENTO = ["CC", "CE", "TI", "PASAPORTE", "PEP", "NIT"] as const;

/** Estilo por tipo de usuario (catálogo real `/api/catalogos/tipos-usuario`:
 * Aprendiz, Instructor, Administrativo, Contratista, Visitante). Se indexa
 * por el nombre en minúscula; cualquier valor no listado cae al genérico. */
const TIPO_USUARIO_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; icon: LucideIcon }> = {
  instructor:     { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB", icon: GraduationCap },
  aprendiz:       { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", icon: BookOpen },
  administrativo: { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6", icon: Briefcase },
  contratista:    { bg: "#ECFEFF", text: "#0E7490", border: "#A5F3FC", dot: "#0891B2", icon: Handshake },
  visitante:      { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", dot: "#64748B", icon: Contact },
};
const TIPO_USUARIO_DEFAULT = { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", dot: "#64748B", icon: Contact };

export const getTipoUsuarioStyle = (nombre: string) => ({
  ...(TIPO_USUARIO_STYLES[nombre.trim().toLowerCase()] ?? TIPO_USUARIO_DEFAULT),
  label: nombre || "Sin tipo",
});

const TIPO_VEHICULO_STYLES: Record<Vehiculo["tipo"], { bg: string; text: string; border: string; dot: string; label: string; icon: typeof Car }> = {
  carro:     { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE", dot: "#3B82F6", label: "Carro",     icon: Car },
  moto:      { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A", dot: "#F59E0B", label: "Moto",      icon: Bike },
  bicicleta: { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0", dot: "#10B981", label: "Bicicleta", icon: Wind },
  camion:    { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE", dot: "#8B5CF6", label: "Camión",    icon: Truck },
  bus:       { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", dot: "#EF4444", label: "Bus",       icon: BusIcon },
};

export const TIPOS_VEHICULO = ["carro", "moto", "bicicleta", "camion", "bus"] as const;

export const getTipoVehiculoStyle = (tipo: Vehiculo["tipo"]) => TIPO_VEHICULO_STYLES[tipo] ?? TIPO_VEHICULO_STYLES.carro;

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
  /** Cuenta de acceso vinculada (opcional). */
  usuarioId: string;
  nombre: string;
  tipoDocumento: (typeof TIPOS_DOCUMENTO)[number];
  numeroDocumento: string;
  correo: string;
  numeroTelefonico: string;
  tipoUsuarioId: string;
  regionalFormacion: string;
  centroFormacion: string;
  programaFormacion: string;
  movilidadReducida: boolean;
  tipoDiscapacidad: string;
  estado: "activo" | "inactivo";
  placa: string;
  tipoVehiculo: Vehiculo["tipo"];
  marca: string;
  descripcionVehiculo: string;
}

export const emptyForm = (): FormState => ({
  usuarioId: "",
  nombre: "",
  tipoDocumento: "CC",
  numeroDocumento: "",
  correo: "",
  numeroTelefonico: "",
  tipoUsuarioId: "",
  regionalFormacion: "",
  centroFormacion: "",
  programaFormacion: "",
  movilidadReducida: false,
  tipoDiscapacidad: "",
  estado: "activo",
  placa: "",
  tipoVehiculo: "carro",
  marca: "",
  descripcionVehiculo: "",
});

export interface FormErrors {
  nombre?: string;
  numeroDocumento?: string;
  tipoUsuarioId?: string;
  centroFormacion?: string;
  placa?: string;
}
