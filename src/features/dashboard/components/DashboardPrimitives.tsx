import { forwardRef, type ElementType, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { Bike, Car, ChevronRight, ParkingCircle } from "lucide-react";
import { theme } from "@/styles/theme";
import { occupancyOf, statusColor, type ParkingLot } from "../lib/helpers";

const COLORS = theme;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    className={`rounded-2xl bg-white p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E2E8F0] ${className}`}
  >
    {children}
  </motion.div>
);

export const SectionTitle = ({ icon: Icon, title, subtitle, color, actionLabel, onAction }: { icon: ElementType; title: string; subtitle?: string; color: string; actionLabel?: string; onAction?: () => void }) => (
  <div className="mb-6 flex items-center justify-between gap-3">
    <div className="flex items-center gap-3.5 min-w-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
        <Icon size={19} color={color} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-[#1a1a2e]">{title}</h3>
        {subtitle && <p className="text-xs text-[#64748B] truncate mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="shrink-0 flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#2D7D00] hover:bg-[#EAF7E6] transition-colors"
      >
        {actionLabel}
        <ChevronRight size={13} />
      </button>
    )}
  </div>
);

export const Kpi = ({ label, value, detail, icon: Icon, color, onClick }: { label: string; value: string | number; detail: string; icon: ElementType; color: string; onClick?: () => void }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
    className={onClick ? "cursor-pointer" : "cursor-default"}
    onClick={onClick}
  >
    <div className="group rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E2E8F0] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-4">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, height: 52, width: 52 }}>
          <Icon size={25} color={color} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{label}</p>
          <p className="mt-1.5 text-[28px] leading-none font-bold text-[#1a1a2e] tracking-tight">{value}</p>
          <p className="mt-1.5 text-xs text-[#64748B] truncate">{detail}</p>
        </div>
        {onClick && <ChevronRight size={16} className="shrink-0 text-[#CBD5E1] transition-transform group-hover:translate-x-0.5 group-hover:text-[#94A3B8]" />}
      </div>
    </div>
  </motion.div>
);

export const Donut = ({ value, size = 170 }: { value: number; size?: number }) => {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = statusColor(value);
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeLinecap="round" strokeWidth={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-[10px] font-medium uppercase tracking-widest text-[#64748B]">Ocupación</p>
        <p className="text-4xl font-bold text-[#1a1a2e] tracking-tighter">{value}<span className="text-lg">%</span></p>
        <p className="text-xs font-medium mt-1" style={{ color }}>
          {value >= 82 ? "Alta demanda" : value >= 62 ? "Flujo medio" : "Operación estable"}
        </p>
      </div>
    </div>
  );
};

export const LotRow = forwardRef<HTMLButtonElement, { lot: ParkingLot; selected: boolean; onClick: () => void }>(({ lot, selected, onClick }, ref) => {
  const pct = occupancyOf(lot);
  const color = statusColor(pct);
  const Icon = lot.type === "moto" ? Bike : lot.type === "car" ? Car : ParkingCircle;

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`w-full rounded-xl border p-3.5 text-left transition-all duration-200 ${
        selected
          ? "border-[#39A900] bg-[#EAF7E6] shadow-sm"
          : "border-transparent bg-[#F8FAF9] hover:bg-white hover:border-[#E2E8F0] hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Icon size={16} color={color} />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-[#1a1a2e] truncate">{lot.name}</p>
            <p className="text-[11px] text-[#64748B] mt-0.5">{lot.block}</p>
          </div>
        </div>
        <p className="text-base font-bold shrink-0" style={{ color }}>{pct}%</p>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </button>
  );
});
LotRow.displayName = "LotRow";

export const HorizontalBars = ({ lots }: { lots: ParkingLot[] }) => (
  <div className="space-y-3">
    {lots.map((lot) => {
      const occupiedPct = lot.capacity > 0 ? (lot.occupied / lot.capacity) * 100 : 0;
      const reservedPct = lot.capacity > 0 ? (lot.reserved / lot.capacity) * 100 : 0;
      const maintenancePct = lot.capacity > 0 ? (lot.maintenance / lot.capacity) * 100 : 0;
      const color = statusColor(occupancyOf(lot));

      return (
        <div key={lot.id}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-[#1a1a2e]">{lot.name}</span>
            <span className="text-[#64748B] font-medium">{lot.occupied}/{lot.capacity}</span>
          </div>
          <div className="flex h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${occupiedPct}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.05 }} style={{ backgroundColor: color }} />
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${reservedPct}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.1 }} style={{ backgroundColor: COLORS.amber }} />
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${maintenancePct}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }} style={{ backgroundColor: COLORS.red }} />
          </div>
        </div>
      );
    })}
  </div>
);

export const DistributionChart = ({ items }: { items: { label: string; value: number; color: string }[] }) => {
  const total = items.reduce((a, i) => a + i.value, 0);
  let cursor = 0;
  const gradient = total === 0
    ? "#E2E8F0 0% 100%"
    : items.map((item) => {
        const s = cursor;
        const e = cursor + (item.value / total) * 100;
        cursor = e;
        return `${item.color} ${s}% ${e}%`;
      }).join(", ");

  return (
    <div className="flex items-center gap-5">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-lg font-bold text-[#1a1a2e]">{total}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="flex-1 truncate text-xs text-[#64748B]">{item.label}</span>
            <span className="text-sm font-semibold text-[#1a1a2e]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
