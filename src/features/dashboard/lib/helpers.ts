import { theme } from "@/styles/theme";

const COLORS = theme;

export type VehicleType = "car" | "moto" | "mixed";
export type LotStatus = "activo" | "mantenimiento";

export interface ParkingLot {
  id: string;
  name: string;
  block: string;
  type: VehicleType;
  status: LotStatus;
  capacity: number;
  occupied: number;
  reserved: number;
  maintenance: number;
}

export interface Movement {
  id: string;
  plate: string;
  driver: string;
  lotId: string;
  kind: "entrada" | "salida";
  vehicle: "Automovil" | "Moto";
  fecha: string;
}

export function availableOf(lot: ParkingLot) {
  return Math.max(lot.capacity - lot.occupied - lot.reserved - lot.maintenance, 0);
}

export function occupancyOf(lot: ParkingLot) {
  if (lot.capacity === 0) return 0;
  return Math.round((lot.occupied / lot.capacity) * 100);
}

export function statusColor(pct: number) {
  if (pct >= 82) return COLORS.red;
  if (pct >= 62) return COLORS.amber;
  return COLORS.primary;
}

export function formatClock(now: Date) {
  return now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(now: Date) {
  return now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}

export function formatMovementTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function daysAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  if (days === 0) return "Hoy";
  if (days === 1) return "Hace 1 día";
  return `Hace ${days} días`;
}
