import type { ReactNode } from "react";
import { AlertTriangle, Clock, CheckCircle, Archive, XCircle } from "lucide-react";
import type { Celda } from "@/services/api/celdas";
import type { EstadoNovedad, TipoNovedad, PrioridadNovedad } from "@/services/api/incidentes";

/** Config visual del estado de celda (mismo modelo que el módulo de Parqueaderos/Celdas). */
export const CELDA_ESTADO_CONFIG: Record<Celda["estado"], { bg: string; text: string; border: string; label: string }> = {
  disponible: { bg: "#F0FBE8", text: "#2F6B00", border: "#A8D888", label: "Disponible" },
  no_disponible: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5", label: "Ocupada" },
  reservada: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A", label: "Reservada" },
  mantenimiento: { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", label: "Mantenimiento" },
  inactiva: { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", label: "Inactiva" },
};

export type EstadoIncidente = EstadoNovedad;

/** Estados en los que un incidente sigue "abierto" (activo): se usa para bloquear un reporte
 *  duplicado sobre la misma celda/vehículo mientras el anterior no se resuelva, cierre o
 *  cancele — ver useIncidenteDialogs.ts y useIncidenteReporte.ts. */
export const ESTADOS_ABIERTOS: EstadoIncidente[] = ["pendiente", "en_proceso"];

export const ESTADO_CONFIG: Record<EstadoIncidente, {
  bg: string; text: string; border: string; dot: string; label: string; icon: ReactNode;
}> = {
  pendiente: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A", dot: "#F59E0B", label: "Pendiente", icon: <AlertTriangle size={10} /> },
  en_proceso: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE", dot: "#2563EB", label: "En proceso", icon: <Clock size={10} /> },
  resuelto: { bg: "#DCFCE7", text: "#166534", border: "#BBF7D0", dot: "#22C55E", label: "Resuelto", icon: <CheckCircle size={10} /> },
  cerrado: { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1", dot: "#64748B", label: "Cerrado", icon: <Archive size={10} /> },
  cancelado: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5", dot: "#EF4444", label: "Cancelado", icon: <XCircle size={10} /> },
};

export const TIPO_NOVEDAD_LABEL: Record<TipoNovedad, string> = {
  danio: "Daño",
  accidente: "Accidente",
  mal_estacionamiento: "Mal estacionamiento",
  queja: "Queja",
  otro: "Otro",
};

export const PRIORIDAD_LABEL: Record<PrioridadNovedad, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica",
};
