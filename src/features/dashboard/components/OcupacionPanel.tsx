import { IconBuilding as Building2 } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import type { ParkingLot } from "../lib/helpers";
import { Card, HorizontalBars, SectionTitle } from "./DashboardPrimitives";

const COLORS = theme;

interface OcupacionPanelProps {
  lots: ParkingLot[];
  onGestionar: () => void;
}

/** "Ocupación por parqueadero": barras de ocupadas/reservadas/mantenimiento por parqueadero. */
export function OcupacionPanel({ lots, onGestionar }: OcupacionPanelProps) {
  return (
    <Card className="xl:col-span-4">
      <SectionTitle icon={Building2} title="Ocupación por parqueadero" subtitle="Ocupadas, reservas y mantenimiento" color={COLORS.blue} actionLabel="Gestionar" onAction={onGestionar} />
      <HorizontalBars lots={lots} />
      <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-[#64748B]">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />Ocupadas</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.amber }} />Reservadas</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.red }} />Mant.</span>
      </div>
    </Card>
  );
}
