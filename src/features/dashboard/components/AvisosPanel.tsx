import { motion } from "framer-motion";
import {
  IconCalendarClock as CalendarClock,
  IconCircleCheck as CheckCircle2,
  IconFileAlert as FileWarning,
  IconChevronRight as ChevronRight,
} from "@tabler/icons-react";
import type { ElementType } from "react";
import { theme } from "@/styles/theme";
import { fadeUp } from "./DashboardPrimitives";

const C = theme;

interface AvisosPanelProps {
  reservasPendientes: number;
  incidentesPendientes: number;
  onVerReservas: () => void;
  onVerIncidentes: () => void;
}

interface Aviso {
  clave: string;
  icono: ElementType;
  titulo: string;
  detalle: string;
  color: string;
  fondo: string;
  borde: string;
  onClick: () => void;
}

/**
 * Lo que está esperando a alguien, cada cosa en su propio recuadro.
 *
 * Una solicitud de reserva o un incidente reportado no avisan por sí solos: se quedan en su
 * módulo hasta que alguien entra a mirarlos. Esto los pone donde sí se ven, con el número y
 * un camino directo — y cuando no hay nada pendiente lo dice, que también es información.
 */
export function AvisosPanel({ reservasPendientes, incidentesPendientes, onVerReservas, onVerIncidentes }: AvisosPanelProps) {
  const avisos: Aviso[] = [];

  if (reservasPendientes > 0) {
    avisos.push({
      clave: "reservas",
      icono: CalendarClock,
      titulo: `${reservasPendientes} ${reservasPendientes === 1 ? "solicitud de reserva" : "solicitudes de reserva"}`,
      detalle: reservasPendientes === 1 ? "Esperando aprobación" : "Esperando aprobación",
      color: "#92400E",
      fondo: "#FEF3C7",
      borde: "#FCD34D",
      onClick: onVerReservas,
    });
  }

  if (incidentesPendientes > 0) {
    avisos.push({
      clave: "incidentes",
      icono: FileWarning,
      titulo: `${incidentesPendientes} ${incidentesPendientes === 1 ? "incidente reportado" : "incidentes reportados"}`,
      detalle: "Sin atender",
      color: "#991B1B",
      fondo: "#FEF2F2",
      borde: "#FECACA",
      onClick: onVerIncidentes,
    });
  }

  if (avisos.length === 0) {
    return (
      <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-[#B3E6A1] bg-[#EAF7E6] p-4">
          <CheckCircle2 size={20} color={C.primary} className="shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#2D7D00]">Nada pendiente por revisar</p>
            <p className="text-xs text-[#3F7D2E]">Sin solicitudes de reserva ni incidentes sin atender</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2">
      {avisos.map((aviso) => (
        <button
          key={aviso.clave}
          onClick={aviso.onClick}
          className="flex items-center gap-3 rounded-2xl border p-4 text-left transition hover:brightness-[0.98]"
          style={{ background: aviso.fondo, borderColor: aviso.borde }}
        >
          <aviso.icono size={20} color={aviso.color} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold" style={{ color: aviso.color }}>{aviso.titulo}</p>
            <p className="text-xs" style={{ color: aviso.color, opacity: 0.85 }}>{aviso.detalle}</p>
          </div>
          <ChevronRight size={16} color={aviso.color} className="ml-auto shrink-0 opacity-70" />
        </button>
      ))}
    </motion.div>
  );
}
