import {
  IconCircleCheck as CheckCircle2,
  IconClipboardList as ClipboardList,
  IconFileAlert as FileWarning,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { daysAgo, type ParkingLot } from "../lib/helpers";
import type { Incidente } from "@/services/api/incidentes";
import { Card, SectionTitle } from "./DashboardPrimitives";

const COLORS = theme;

interface ReservasIncidentesPanelProps {
  reservaCounts: { pendiente: number; activa: number; completada: number; cancelada: number };
  incidentesPendientes: Incidente[];
  lots: ParkingLot[];
  onVerIncidentes: () => void;
  onVerReservas: () => void;
}

/** "Reservas e incidentes": conteo de reservas por estado + los incidentes pendientes más recientes. */
export function ReservasIncidentesPanel({ reservaCounts, incidentesPendientes, lots, onVerIncidentes, onVerReservas }: ReservasIncidentesPanelProps) {
  const stats = [
    { label: "Pendientes", value: reservaCounts.pendiente, color: COLORS.amber },
    { label: "Activas", value: reservaCounts.activa, color: COLORS.primary },
    { label: "Completas", value: reservaCounts.completada, color: COLORS.blue },
    { label: "Canceladas", value: reservaCounts.cancelada, color: COLORS.textLight },
  ];

  return (
    <Card className="xl:col-span-4">
      <SectionTitle icon={ClipboardList} title="Reservas e incidentes" subtitle="Actividad reportada en el sistema" color={COLORS.amber} actionLabel="Ver incidentes" onAction={onVerIncidentes} />

      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((item) => (
          <button
            key={item.label}
            onClick={onVerReservas}
            className="rounded-xl bg-[#F8FAF9] p-3 text-center border border-[#E2E8F0] hover:bg-white hover:border-[#CBD5E1] transition-colors"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">{item.label}</p>
            <p className="mt-1.5 text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
          </button>
        ))}
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#64748B]">Incidentes pendientes</p>

      {incidentesPendientes.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-[#EAF7E6] p-3 border border-[#B3E6A1]">
          <CheckCircle2 size={18} color={COLORS.primary} />
          <p className="text-sm font-medium text-[#2D7D00]">Sin incidentes pendientes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {incidentesPendientes.slice(0, 3).map((inc) => {
            const lot = lots.find((l) => l.id === inc.parqueaderoId);
            return (
              <button
                key={inc.id}
                onClick={onVerIncidentes}
                className="flex w-full items-start gap-3 rounded-xl bg-[#FEF3C7] p-3 border border-[#F59E0B]/30 text-left hover:brightness-[0.98] transition"
              >
                <FileWarning size={16} color={COLORS.amber} className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#1a1a2e] truncate">{inc.descripcion}</p>
                  <p className="text-xs text-[#64748B]">{lot?.name || "—"} · {daysAgo(inc.fecha)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
