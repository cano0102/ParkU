import { IconWheelchair as Accessibility, IconSchool as GraduationCap } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { Card, DistributionChart, SectionTitle } from "./DashboardPrimitives";

const COLORS = theme;

interface DistribucionPanelProps {
  vehicleDistribution: { label: string; value: number; color: string }[];
  conductorDistribution: { label: string; value: number; color: string }[];
  accessibility: { totalMR: number; disponiblesMR: number };
  onVerConductores: () => void;
}

/** "Distribución": vehículos por tipo, conductores por tipo, y celdas de movilidad reducida. */
export function DistribucionPanel({ vehicleDistribution, conductorDistribution, accessibility, onVerConductores }: DistribucionPanelProps) {
  return (
    <Card className="xl:col-span-4">
      <SectionTitle icon={GraduationCap} title="Distribución" subtitle="Vehículos y conductores" color={COLORS.purple} actionLabel="Conductores" onAction={onVerConductores} />
      <div className="space-y-4">
        <DistributionChart items={vehicleDistribution} />
        <div className="h-px bg-[#E2E8F0]" />
        <DistributionChart items={conductorDistribution} />
        <div className="h-px bg-[#E2E8F0]" />
        <div className="flex items-center gap-3 rounded-xl bg-[#F8FAF9] p-3 border border-[#E2E8F0]">
          <Accessibility size={18} color={COLORS.primary} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#1a1a2e]">Movilidad reducida</p>
            <p className="text-[11px] text-[#64748B]">{accessibility.disponiblesMR} de {accessibility.totalMR} celdas disponibles</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
