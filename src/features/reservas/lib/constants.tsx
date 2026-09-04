import type { ReactNode } from "react";
import {
  IconCircleCheck as CheckCircle2,
  IconClockHour3 as Clock3,
  IconCircleX as XCircle,
  IconBan as Ban,
} from "@tabler/icons-react";
import type { EstadoReserva } from "@/services/api/reservas";

export type { EstadoReserva };

export const ESTADO_CONFIG: Record<EstadoReserva, {
  bg: string; text: string; border: string; dot: string; label: string; icon: ReactNode;
}> = {
  pendiente: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", label: "Pendiente", icon: <Clock3 size={10} /> },
  activa: { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0", dot: "#22C55E", label: "Activa", icon: <CheckCircle2 size={10} /> },
  rechazada: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA", dot: "#EF4444", label: "Rechazada", icon: <Ban size={10} /> },
  completada: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE", dot: "#3B82F6", label: "Completada", icon: <CheckCircle2 size={10} /> },
  cancelada: { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", dot: "#64748B", label: "Cancelada", icon: <XCircle size={10} /> },
};

export const todayStr = () => new Date().toISOString().split("T")[0];
