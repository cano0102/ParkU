import { Shield, Layers3, Sparkles, ShieldCheck, type LucideIcon } from "lucide-react";

export const PERMISOS = {
  administracion: { usuarios: "Usuarios", roles: "Roles", dashboard: "Dashboard" },
  operaciones: { entradaSalida: "Entrada / Salida", reservas: "Reservas", asignaciones: "Asignaciones" },
  parqueadero: { parqueaderos: "Parqueaderos", celdas: "Celdas", vehiculos: "Vehículos", conductores: "Conductores" },
  seguridad: { incidentes: "Incidentes", reconocimientoPlacas: "Reconocimiento" },
} as const;

export type PermisosKeys = keyof typeof PERMISOS;

export const GRUPO_ICON_COMPONENTS: Record<PermisosKeys, LucideIcon> = {
  administracion: Shield,
  operaciones: Layers3,
  parqueadero: Sparkles,
  seguridad: ShieldCheck,
};

export const GRUPO_LABELS: Record<PermisosKeys, string> = {
  administracion: "Administración",
  operaciones: "Operaciones",
  parqueadero: "Parqueadero",
  seguridad: "Seguridad",
};

export const GRUPO_COLORS: Record<PermisosKeys, string> = {
  administracion: "#EF4444",
  operaciones: "#2563EB",
  parqueadero: "#F59E0B",
  seguridad: "#8B5CF6",
};

export interface PermisosState {
  dashboard: boolean;
  roles: boolean;
  usuarios: boolean;
  conductores: boolean;
  vehiculos: boolean;
  parqueaderos: boolean;
  celdas: boolean;
  asignaciones: boolean;
  entradaSalida: boolean;
  reservas: boolean;
  incidentes: boolean;
  reconocimientoPlacas: boolean;
}

export const initialPermisos: PermisosState = {
  dashboard: false,
  roles: false,
  usuarios: false,
  conductores: false,
  vehiculos: false,
  parqueaderos: false,
  celdas: false,
  asignaciones: false,
  entradaSalida: false,
  reservas: false,
  incidentes: false,
  reconocimientoPlacas: false,
};

export const PERMISO_LABELS: Record<string, string> = Object.values(PERMISOS).reduce(
  (acc, g) => ({ ...acc, ...g }),
  {} as Record<string, string>
);

export const countActive = (p: PermisosState): number => Object.values(p).filter(Boolean).length;
