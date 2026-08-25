import { motion } from "framer-motion";
import { DoorClosed, DoorOpen, Zap } from "lucide-react";
import { theme } from "@/styles/theme";
import { formatMovementTime, type Movement, type ParkingLot } from "../lib/helpers";
import { Card, SectionTitle } from "./DashboardPrimitives";

const COLORS = theme;

interface MovimientosPanelProps {
  movements: Movement[];
  lots: ParkingLot[];
  onVerTodos: () => void;
}

/** "Movimientos recientes": los últimos registros de entrada/salida. */
export function MovimientosPanel({ movements, lots, onVerTodos }: MovimientosPanelProps) {
  return (
    <Card className="xl:col-span-8">
      <SectionTitle icon={Zap} title="Movimientos recientes" subtitle="Últimos registros de acceso" color={COLORS.teal} actionLabel="Ver todos" onAction={onVerTodos} />
      <div className="grid gap-3 md:grid-cols-2">
        {movements.map((move, index) => {
          const lot = lots.find((item) => item.id === move.lotId);
          const isEntry = move.kind === "entrada";
          return (
            <motion.div
              key={move.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
              onClick={onVerTodos}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAF9] p-3 hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: isEntry ? "#EAF7E6" : "#F1F5F9" }}>
                {isEntry ? <DoorOpen size={18} color={COLORS.primary} /> : <DoorClosed size={18} color="#64748B" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#1a1a2e]">{move.plate}</p>
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase" style={{ backgroundColor: isEntry ? "#EAF7E6" : "#F1F5F9", color: isEntry ? "#2D7D00" : "#64748B" }}>
                    {move.kind}
                  </span>
                </div>
                <p className="truncate text-xs text-[#64748B]">{move.driver} · {move.vehicle} · {lot?.name || "—"}</p>
              </div>
              <p className="shrink-0 text-xs font-semibold text-[#64748B]">{formatMovementTime(move.fecha)}</p>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
