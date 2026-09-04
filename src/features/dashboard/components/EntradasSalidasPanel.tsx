import {
  IconActivity as Activity,
  IconDoor as DoorClosed,
  IconDoorExit as DoorOpen,
} from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { Card, SectionTitle } from "./DashboardPrimitives";

const COLORS = theme;

interface EntradasSalidasPanelProps {
  entradas: number;
  salidas: number;
  totalMovimientos: number;
  onVerControlAcceso: () => void;
}

/** Conteo de entradas/salidas recientes. */
export function EntradasSalidasPanel({ entradas, salidas, totalMovimientos, onVerControlAcceso }: EntradasSalidasPanelProps) {
  return (
    <Card className="xl:col-span-4">
      <SectionTitle icon={Activity} title="Entradas y salidas" subtitle="Últimos registros de movimiento" color={COLORS.primary} actionLabel="Control de acceso" onAction={onVerControlAcceso} />
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#EAF7E6] p-5 border border-[#B3E6A1]">
          <div className="flex items-center gap-2 text-[#2D7D00]">
            <DoorOpen size={18} />
            <p className="text-xs font-semibold uppercase tracking-wider">Entradas</p>
          </div>
          <p className="mt-2.5 text-3xl font-bold text-[#2D7D00]">{entradas}</p>
        </div>
        <div className="rounded-2xl bg-[#F1F5F9] p-5 border border-[#E2E8F0]">
          <div className="flex items-center gap-2 text-[#64748B]">
            <DoorClosed size={18} />
            <p className="text-xs font-semibold uppercase tracking-wider">Salidas</p>
          </div>
          <p className="mt-2.5 text-3xl font-bold text-[#1a1a2e]">{salidas}</p>
        </div>
      </div>
      <p className="mt-5 text-xs text-[#64748B]">
        Basado en los últimos {totalMovimientos} movimientos registrados en el sistema.
      </p>
    </Card>
  );
}
