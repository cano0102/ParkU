import { AnimatePresence } from "framer-motion";
import { LayoutDashboard } from "lucide-react";
import { theme } from "@/styles/theme";
import type { ParkingLot } from "../lib/helpers";
import { Card, LotRow, SectionTitle } from "./DashboardPrimitives";

const COLORS = theme;

const TABS = [
  { id: "all", label: "Todos" },
  { id: "car", label: "Autos" },
  { id: "moto", label: "Motos" },
] as const;

interface ParqueaderosPanelProps {
  filter: "all" | "car" | "moto";
  onFilterChange: (filter: "all" | "car" | "moto") => void;
  visibleLots: ParkingLot[];
  selectedLot: ParkingLot;
  onSelectLot: (id: string) => void;
  selectedStats: { label: string; value: number; color: string }[];
  onManage: () => void;
}

/** "Estado por parqueadero": filtro por tipo, lista de parqueaderos y detalle del seleccionado. */
export function ParqueaderosPanel({ filter, onFilterChange, visibleLots, selectedLot, onSelectLot, selectedStats, onManage }: ParqueaderosPanelProps) {
  return (
    <Card className="xl:col-span-8">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SectionTitle icon={LayoutDashboard} title="Estado por parqueadero" subtitle="Selecciona un parqueadero" color={COLORS.primary} actionLabel="Gestionar" onAction={onManage} />
        <div className="inline-flex items-center gap-1 rounded-lg bg-[#F5F7F8] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                filter === tab.id ? "bg-white text-[#2D7D00] shadow-sm border border-[#E2E8F0]" : "text-[#64748B] hover:text-[#1a1a2e]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
        <div className="space-y-2 pr-1">
          <AnimatePresence mode="popLayout">
            {visibleLots.map((lot) => (
              <LotRow key={lot.id} lot={lot} selected={selectedLot.id === lot.id} onClick={() => onSelectLot(lot.id)} />
            ))}
          </AnimatePresence>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-end justify-between gap-4 rounded-2xl bg-gradient-to-br from-[#2D7D00] to-[#39A900] p-5 text-white shadow-md">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Vista seleccionada</p>
              <h3 className="mt-1 text-2xl font-bold">{selectedLot.name}</h3>
              <p className="text-xs text-white/70 mt-0.5">{selectedLot.block} · {selectedLot.type === "mixed" ? "Mixto" : selectedLot.type === "moto" ? "Motos" : "Automoviles"}</p>
            </div>
            <div className="rounded-xl bg-white/20 px-4 py-2.5 text-right backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white">Capacidad</p>
              <p className="text-2xl font-bold text-white">{selectedLot.capacity}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {selectedStats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-[#F8FAF9] p-3.5 text-center border border-[#E2E8F0]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">{stat.label}</p>
                <p className="mt-1.5 text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
