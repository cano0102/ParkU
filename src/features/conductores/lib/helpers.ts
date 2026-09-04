import type React from "react";
import {
  IconCar as Car,
  IconBike as Bike,
  IconTruck as Truck,
  IconBus as BusIcon,
  IconWind as Wind,
  IconSchool as GraduationCap,
  IconBook2 as BookOpen,
  IconBriefcase as Briefcase,
  IconHeartHandshake as Handshake,
  IconAddressBook as Contact,
  type TablerIcon,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import {
  validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca, quitarDigitos, TIPOS_DOCUMENTO,
  validarNumeroDocumento, NUMERO_DOCUMENTO_MAX, validarTelefono, filtrarTelefono, EMAIL_REGEX,
} from "@/utils/validation";
import { getAvatarGradient, getInitials } from "@/utils/format";
import type { Vehiculo } from "@/services/api/vehiculos";

export { validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca, quitarDigitos, TIPOS_DOCUMENTO };
export { validarNumeroDocumento, NUMERO_DOCUMENTO_MAX, validarTelefono, filtrarTelefono, EMAIL_REGEX };
export { getAvatarGradient, getInitials };

export const COLORS = theme;

/** Estilo por tipo de usuario (catálogo real `/api/catalogos/tipos-usuario`:
 * Aprendiz, Instructor, Administrativo, Contratista, Visitante). Se indexa
 * por el nombre en minúscula; cualquier valor no listado cae al genérico. */
const TIPO_USUARIO_STYLES: Record<string, { bg: string; text: string; border: string; dot: string; icon: TablerIcon }> = {
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
  /** Foto de perfil (data URL) para reconocer al conductor en el listado. Opcional: el modelo
   *  real de `conductor` no tiene columna de foto, así que se guarda en este navegador
   *  — ver services/core/fotosPerfil.ts. */
  foto: string;
  placa: string;
  tipoVehiculo: Vehiculo["tipo"];
  marca: string;
  color: string;
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
  foto: "",
  placa: "",
  tipoVehiculo: "carro",
  marca: "",
  color: "",
  descripcionVehiculo: "",
});

export interface FormErrors {
  nombre?: string;
  numeroDocumento?: string;
  correo?: string;
  numeroTelefonico?: string;
  tipoUsuarioId?: string;
  placa?: string;
  marca?: string;
  color?: string;
}
