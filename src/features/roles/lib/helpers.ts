import { theme } from "@/styles/theme";
import { initialPermisos, type PermisosState } from "./permisos";

const COLORS = theme;

export const ROLES_PROTEGIDOS = ["Administrador", "SuperAdmin"] as const;

export const getRolAccent = (nombre: string): string => {
  switch (nombre) {
    case "Administrador": return "#EF4444";
    case "SuperAdmin": return "#8B5CF6";
    case "Supervisor": return "#2563EB";
    case "Vigilante": return "#F59E0B";
    default: return COLORS.primary;
  }
};

export interface FormState {
  nombre: string;
  descripcion: string;
  permisos: PermisosState;
  estado: "activo" | "inactivo";
}

export const emptyForm = (): FormState => ({
  nombre: "",
  descripcion: "",
  permisos: { ...initialPermisos },
  estado: "activo",
});
