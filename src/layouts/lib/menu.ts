import {
  LayoutDashboard,
  Users,
  ParkingCircle,
  UserCog,
  ShieldCheck,
  ArrowLeftRight,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import type { PermisosRol } from "@/services/core/roles";

export interface MenuItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
  group: string;
  permission: keyof PermisosRol;
}

export const menuItems: MenuItem[] = [
  { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "principal", permission: "dashboard" },
  { path: "/app/roles", label: "Roles", icon: ShieldCheck, group: "admin", permission: "roles" },
  { path: "/app/usuarios", label: "Usuarios", icon: Users, group: "admin", permission: "usuarios" },
  { path: "/app/conductores", label: "Conductores", icon: UserCog, group: "admin", permission: "conductores" },
  { path: "/app/parqueaderos", label: "Parqueaderos", icon: ParkingCircle, group: "operacion", permission: "parqueaderos" },
  { path: "/app/entrada-salida", label: "Entrada / Salida", icon: ArrowLeftRight, group: "operacion", permission: "entradaSalida" },
  { path: "/app/reservas", label: "Reservas", icon: Calendar, group: "operacion", permission: "reservas" },
  { path: "/app/incidentes", label: "Incidentes", icon: AlertTriangle, group: "operacion", permission: "incidentes" },
];

export const groups: Record<string, string> = {
  principal: "Principal",
  admin: "Administración",
  operacion: "Operación",
};

export const SIDEBAR_W = 256;

export const HIDE_LAYOUT_ROUTES = ["/app/usuarios/editar", "/app/usuarios/nuevo"];
