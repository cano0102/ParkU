import { motion } from "framer-motion";
import { AlertTriangle, Gauge } from "lucide-react";
import { theme } from "@/styles/theme";
import { statusColor } from "../lib/helpers";
import { Card, Donut, SectionTitle } from "./DashboardPrimitives";

const COLORS = theme;

interface PanoramaPanelProps {
  pct: number;
  occupied: number;
  available: number;
  maintenance: number;
  alerts: { label: string; tone: "red" | "amber" | "green" }[];
}

/** "Panorama general": donut de ocupación consolidada, totales y alertas activas. */
export function PanoramaPanel({ pct, occupied, available, maintenance, alerts }: PanoramaPanelProps) {
  const stats = [
    { label: "Ocupadas", value: occupied, color: COLORS.primary },
    { label: "Libres", value: available, color: COLORS.blue },
    { label: "Mant.", value: maintenance, color: COLORS.red },
  ];

  return (
    <Card className="xl:col-span-4 flex flex-col">
      <SectionTitle icon={Gauge} title="Panorama general" subtitle="Estado consolidado" color={statusColor(pct)} />
      <Donut value={pct} />
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-xl bg-[#F8FAF9] p-3.5 text-center border border-[#E2E8F0]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">{item.label}</p>
            <p className="mt-1.5 text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex-1 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Alertas activas</p>
        {alerts.map((alert, i) => {
          const color = alert.tone === "red" ? COLORS.red : alert.tone === "amber" ? COLORS.amber : COLORS.primary;
          const bg = alert.tone === "red" ? "#FEE2E2" : alert.tone === "amber" ? "#FEF3C7" : "#EAF7E6";
          return (
            <motion.div
              key={alert.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 rounded-xl p-3 border"
              style={{ backgroundColor: bg, borderColor: color + "40" }}
            >
              <AlertTriangle size={16} color={color} />
              <p className="text-sm font-medium text-[#1a1a2e]/80">{alert.label}</p>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
