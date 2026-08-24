import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle } from "lucide-react";
import type { Celda } from "@/services/api/celdas";

export const MAX_EVIDENCIA_MB = 5;

/** Config visual del estado de celda (mismo modelo que el módulo de Parqueaderos/Celdas). */
export const CELDA_ESTADO_CONFIG: Record<Celda["estado"], { bg: string; text: string; border: string; label: string }> = {
  disponible: { bg: "#F0FBE8", text: "#2F6B00", border: "#A8D888", label: "Disponible" },
  no_disponible: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5", label: "Ocupada" },
  reservada: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A", label: "Reservada" },
  mantenimiento: { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", label: "Mantenimiento" },
};

export type EstadoIncidente = "resuelto" | "pendiente";

export const ESTADO_CONFIG: Record<EstadoIncidente, {
  bg: string; text: string; border: string; dot: string; label: string; icon: ReactNode;
}> = {
  pendiente: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", label: "Pendiente", icon: <AlertTriangle size={10} /> },
  resuelto: { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0", dot: "#22C55E", label: "Resuelto", icon: <CheckCircle size={10} /> },
};
