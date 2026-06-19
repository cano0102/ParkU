import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bike,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  DoorClosed,
  DoorOpen,
  Gauge,
  LayoutDashboard,
  ParkingCircle,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

type CellStatus = "occupied" | "available" | "reserved" | "maintenance";
type VehicleType = "car" | "moto" | "mixed";
type LotStatus = "activo" | "mantenimiento";

type ParkingLot = {
  id: string;
  name: string;
  block: string;
  type: VehicleType;
  status: LotStatus;
  capacity: number;
  occupied: number;
  reserved: number;
  maintenance: number;
};

type Movement = {
  id: string;
  plate: string;
  driver: string;
  lotId: string;
  kind: "entrada" | "salida";
  vehicle: "Automovil" | "Moto";
  minutesAgo: number;
};

const C = {
  green: "#2E7D32",
  greenLight: "#4CAF50",
  greenPale: "#E8F5E9",
  greenDark: "#1B5E20",
  ink: "#1a1a2e",
  inkSoft: "#2d2d44",
  muted: "#6b7280",
  mutedLight: "#9ca3af",
  bg: "#f4f7f2",
  surface: "#ffffff",
  surfaceHover: "#fafbfa",
  border: "#e8ece6",
  amber: "#f59e0b",
  amberPale: "#fef3c7",
  blue: "#3b82f6",
  bluePale: "#dbeafe",
  red: "#ef4444",
  redPale: "#fee2e2",
  purple: "#8b5cf6",
  purplePale: "#ede9fe",
  teal: "#14b8a6",
};

const parkingLots: ParkingLot[] = [
  { id: "pq-norte", name: "PQ Norte", block: "Bloque A", type: "mixed", status: "activo", capacity: 72, occupied: 54, reserved: 5, maintenance: 2 },
  { id: "pq-bienestar", name: "PQ Bienestar", block: "Bloque C", type: "car", status: "activo", capacity: 48, occupied: 28, reserved: 4, maintenance: 1 },
  { id: "pq-motos", name: "PQ Motos", block: "Ingreso Sur", type: "moto", status: "activo", capacity: 64, occupied: 37, reserved: 8, maintenance: 0 },
  { id: "pq-talleres", name: "PQ Talleres", block: "Bloque E", type: "mixed", status: "activo", capacity: 36, occupied: 31, reserved: 1, maintenance: 3 },
  { id: "pq-visitantes", name: "PQ Visitantes", block: "Porteria", type: "car", status: "activo", capacity: 30, occupied: 15, reserved: 7, maintenance: 0 },
  { id: "pq-admin", name: "PQ Administrativo", block: "Bloque B", type: "car", status: "mantenimiento", capacity: 28, occupied: 12, reserved: 2, maintenance: 8 },
];

const movements: Movement[] = [
  { id: "m1", plate: "KLM 842", driver: "Diana Rojas", lotId: "pq-norte", kind: "entrada", vehicle: "Automovil", minutesAgo: 3 },
  { id: "m2", plate: "NQZ 19F", driver: "Carlos Pena", lotId: "pq-motos", kind: "salida", vehicle: "Moto", minutesAgo: 7 },
  { id: "m3", plate: "HTR 221", driver: "Laura Mora", lotId: "pq-bienestar", kind: "entrada", vehicle: "Automovil", minutesAgo: 12 },
  { id: "m4", plate: "MXC 04D", driver: "Juan Torres", lotId: "pq-talleres", kind: "entrada", vehicle: "Moto", minutesAgo: 18 },
  { id: "m5", plate: "BVA 908", driver: "Sofia Arias", lotId: "pq-visitantes", kind: "salida", vehicle: "Automovil", minutesAgo: 24 },
  { id: "m6", plate: "UFP 331", driver: "Nelson Diaz", lotId: "pq-norte", kind: "entrada", vehicle: "Automovil", minutesAgo: 31 },
];

const vehicleDistribution = [
  { label: "Automoviles", value: 138, color: C.blue },
  { label: "Motos", value: 82, color: C.amber },
  { label: "Reservas", value: 27, color: C.greenLight },
];

const userDistribution = [
  { label: "Docentes", value: 86, color: C.green },
  { label: "Administrativos", value: 48, color: C.blue },
  { label: "Visitantes", value: 31, color: C.purple },
];

function availableOf(lot: ParkingLot) {
  return Math.max(lot.capacity - lot.occupied - lot.reserved - lot.maintenance, 0);
}

function occupancyOf(lot: ParkingLot) {
  return Math.round((lot.occupied / lot.capacity) * 100);
}

function statusColor(pct: number) {
  if (pct >= 82) return C.red;
  if (pct >= 62) return C.amber;
  return C.green;
}

function makeCells(lot: ParkingLot) {
  const available = availableOf(lot);
  const statuses: CellStatus[] = [
    ...Array(lot.occupied).fill("occupied"),
    ...Array(available).fill("available"),
    ...Array(lot.reserved).fill("reserved"),
    ...Array(lot.maintenance).fill("maintenance"),
  ];
  return statuses.map((status, index) => ({
    id: `${lot.id}-${index}`,
    status,
    delay: ((index * 5) % 30) / 100,
  }));
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function formatClock(now: Date) {
  return now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(now: Date) {
  return now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      className={`rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] border border-[#e8ece6] ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, color = C.green }: { icon: React.ElementType; title: string; subtitle?: string; color?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon size={16} color={color} strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#1a1a2e]">{title}</h3>
          {subtitle && <p className="text-xs text-[#9ca3af]">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, detail, icon: Icon, color, trend }: { label: string; value: string | number; detail: string; icon: React.ElementType; color: string; trend?: string }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -2, transition: { duration: 0.2 } }} className="group cursor-default">
      <div className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] border border-[#e8ece6] transition-shadow duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#9ca3af]">{label}</p>
            <p className="mt-1.5 text-2xl font-bold text-[#1a1a2e] tracking-tight">{value}</p>
            <p className="mt-0.5 text-xs text-[#6b7280]">{detail}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-300" style={{ backgroundColor: `${color}12` }}>
            <Icon size={18} color={color} strokeWidth={2} />
          </div>
        </div>
        {trend && (
          <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            <TrendingUp size={11} />
            {trend}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Donut({ value, size = 160 }: { value: number; size?: number }) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = statusColor(value);
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef2ee" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeLinecap="round" strokeWidth={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-[10px] font-medium uppercase tracking-widest text-[#9ca3af]">Ocupacion</p>
        <p className="text-4xl font-bold text-[#1a1a2e] tracking-tighter">{value}<span className="text-lg">%</span></p>
        <p className="text-[11px] font-medium mt-0.5" style={{ color }}>
          {value >= 82 ? "Alta demanda" : value >= 62 ? "Flujo medio" : "Operacion estable"}
        </p>
      </div>
    </div>
  );
}

function CellGrid({ lot }: { lot: ParkingLot }) {
  const cells = useMemo(() => makeCells(lot), [lot]);
  const colors: Record<CellStatus, string> = {
    occupied: C.greenLight,
    available: "#e8ece6",
    reserved: C.amber,
    maintenance: C.red,
  };

  return (
    <div className="rounded-lg bg-[#f8faf7] p-3 border border-[#e8ece6]">
      <div className="grid grid-cols-10 gap-1 sm:grid-cols-12 md:grid-cols-14">
        {cells.map((cell) => (
          <motion.div
            key={cell.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: cell.delay }}
            className="aspect-square rounded-sm"
            style={{ backgroundColor: colors[cell.status] }}
            title={cell.status}
          />
        ))}
      </div>
    </div>
  );
}

function LotRow({ lot, selected, onClick }: { lot: ParkingLot; selected: boolean; onClick: () => void }) {
  const pct = occupancyOf(lot);
  const color = statusColor(pct);
  const Icon = lot.type === "moto" ? Bike : lot.type === "car" ? Car : ParkingCircle;

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-left transition-all duration-200 ${
        selected
          ? "border-[#2E7D32]/30 bg-[#E8F5E9]/60 shadow-sm"
          : "border-transparent bg-[#f8faf7] hover:bg-white hover:border-[#e8ece6] hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${color}12` }}>
            <Icon size={15} color={color} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1a1a2e] truncate">{lot.name}</p>
            <p className="text-[11px] text-[#9ca3af]">{lot.block}</p>
          </div>
        </div>
        <p className="text-base font-bold shrink-0" style={{ color }}>{pct}%</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8ece6]">
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
}

function HorizontalBars({ lots }: { lots: ParkingLot[] }) {
  return (
    <div className="space-y-3">
      {lots.map((lot, index) => {
        const occupiedPct = (lot.occupied / lot.capacity) * 100;
        const reservedPct = (lot.reserved / lot.capacity) * 100;
        const maintenancePct = (lot.maintenance / lot.capacity) * 100;
        const color = statusColor(occupancyOf(lot));

        return (
          <div key={lot.id}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-[#1a1a2e]">{lot.name}</span>
              <span className="text-[#9ca3af] font-medium">{lot.occupied}/{lot.capacity}</span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-[#e8ece6]">
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${occupiedPct}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: index * 0.04 }} style={{ backgroundColor: color }} />
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${reservedPct}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: index * 0.04 + 0.04 }} style={{ backgroundColor: C.amber }} />
              <motion.div initial={{ width: 0 }} whileInView={{ width: `${maintenancePct}%` }} viewport={{ once: true }} transition={{ duration: 0.7, delay: index * 0.04 + 0.08 }} style={{ backgroundColor: C.red }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AreaChart() {
  const points = [18, 28, 24, 40, 36, 52, 45, 61, 58, 76, 68, 84];
  const w = 340, h = 90;
  const max = Math.max(...points), min = Math.min(...points);
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * (h - 14) - 7;
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
      <defs>
        <linearGradient id="a" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={C.green} stopOpacity="0.18" />
          <stop offset="100%" stopColor={C.green} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} d={area} fill="url(#a)" />
      <motion.path
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.3, ease: "easeOut" }}
        d={line} fill="none" stroke={C.green} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"
      />
    </svg>
  );
}

function DistributionChart({ items }: { items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((a, i) => a + i.value, 0);
  let cursor = 0;
  const gradient = items.map((item) => {
    const s = cursor;
    const e = cursor + (item.value / total) * 100;
    cursor = e;
    return `${item.color} ${s}% ${e}%`;
  }).join(", ");

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-lg font-bold text-[#1a1a2e]">{total}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="flex-1 truncate text-xs text-[#6b7280]">{item.label}</span>
            <span className="text-sm font-semibold text-[#1a1a2e]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const now = useClock();
  const [filter, setFilter] = useState<"all" | "car" | "moto">("all");
  const [selectedId, setSelectedId] = useState(parkingLots[0].id);

  const visibleLots = useMemo(() => {
    if (filter === "all") return parkingLots;
    return parkingLots.filter((l) => l.type === filter || l.type === "mixed");
  }, [filter]);

  const selectedLot = visibleLots.find((l) => l.id === selectedId) ?? visibleLots[0] ?? parkingLots[0];

  const totals = useMemo(() => {
    const capacity = parkingLots.reduce((a, l) => a + l.capacity, 0);
    const occupied = parkingLots.reduce((a, l) => a + l.occupied, 0);
    const reserved = parkingLots.reduce((a, l) => a + l.reserved, 0);
    const maintenance = parkingLots.reduce((a, l) => a + l.maintenance, 0);
    const available = parkingLots.reduce((a, l) => a + availableOf(l), 0);
    return {
      capacity, occupied, reserved, maintenance, available,
      pct: Math.round((occupied / capacity) * 100),
      activeLots: parkingLots.filter((l) => l.status === "activo").length,
    };
  }, []);

  const alerts = useMemo(() => {
    const high = parkingLots.filter((l) => occupancyOf(l) >= 82);
    return [
      ...high.map((l) => ({ label: `${l.name} al ${occupancyOf(l)}% — casi lleno`, tone: "red" as const })),
      { label: `${totals.maintenance} celdas en mantenimiento`, tone: "amber" as const },
      { label: "Todos los sistemas operan con normalidad", tone: "green" as const },
    ];
  }, [totals.maintenance]);

  const selectedStats = [
    { label: "Ocupadas", value: selectedLot.occupied, color: C.green },
    { label: "Libres", value: availableOf(selectedLot), color: C.blue },
    { label: "Reservadas", value: selectedLot.reserved, color: C.amber },
    { label: "Mant.", value: selectedLot.maintenance, color: C.red },
  ];

  return (
    <>
      <style>{`
        :root { color-scheme: light; }
        body { margin: 0; background: ${C.bg}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        * { box-sizing: border-box; }
        ::selection { background: ${C.green}; color: white; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      <main className="min-h-screen bg-[#f4f7f2] text-[#1a1a2e]">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-[#2E7D32]/[0.06] blur-3xl" />
          <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/4 rounded-full bg-[#2E7D32]/[0.05] blur-3xl" />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="relative mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 py-5"
        >
          {/* Header */}
          <motion.header variants={fadeUp} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#388E3C] p-6 text-white shadow-lg">
            <div className="absolute right-10 top-6 h-20 w-20 rounded-full border border-white/10" />
            <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/[0.04]" />
            <div className="absolute bottom-0 left-1/4 h-20 w-60 rounded-full bg-black/10 blur-2xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                  <ParkingCircle size={22} className="text-white" />
                </div>
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-white/15">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    </span>
                    Operativo en vivo
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">SENA Parqueaderos</h1>
                  <p className="mt-2 max-w-xl text-sm font-normal leading-relaxed text-white/60">
                    Centro de control visual para ocupacion, flujo vehicular y disponibilidad de celdas en tiempo real.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm">
                  <CalendarDays size={15} className="mb-2 text-white/50" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Fecha</p>
                  <p className="mt-0.5 text-sm font-semibold capitalize">{formatDate(now)}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur-sm">
                  <Clock3 size={15} className="mb-2 text-white/50" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Hora</p>
                  <p className="mt-0.5 text-xl font-bold">{formatClock(now)}</p>
                </div>
                <div className="rounded-xl bg-white px-4 py-3 text-[#1B5E20] shadow-lg">
                  <Gauge size={15} className="mb-2 text-[#1B5E20]/50" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1B5E20]/40">Ocupacion</p>
                  <p className="mt-0.5 text-2xl font-bold">{totals.pct}%</p>
                </div>
              </div>
            </div>
          </motion.header>

          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Celdas totales" value={totals.capacity} detail={`${totals.activeLots} parqueaderos activos`} icon={ParkingCircle} color={C.green} trend="+8% vs. ayer" />
            <Kpi label="Disponibles" value={totals.available} detail={`${totals.reserved} reservas vigentes`} icon={DoorOpen} color={C.blue} />
            <Kpi label="Vehiculos dentro" value={totals.occupied} detail="Automoviles y motos" icon={Car} color={C.amber} trend="Flujo alto" />
            <Kpi label="Conductores" value="165" detail="Usuarios registrados" icon={Users} color={C.purple} />
          </div>

          {/* Main Grid */}
          <div className="grid gap-5 xl:grid-cols-12">
            {/* Mapa */}
            <Card className="xl:col-span-8">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SectionTitle icon={LayoutDashboard} title="Mapa inteligente de celdas" subtitle="Selecciona un parqueadero" />
                <div className="inline-flex items-center gap-1 rounded-lg bg-[#f4f7f2] p-1">
                  {[
                    { id: "all", label: "Todos" },
                    { id: "car", label: "Autos" },
                    { id: "moto", label: "Motos" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id as "all" | "car" | "moto")}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        filter === tab.id ? "bg-white text-[#1B5E20] shadow-sm" : "text-[#6b7280] hover:text-[#1a1a2e]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
                <div className="max-h-[30rem] space-y-1.5 overflow-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {visibleLots.map((lot) => (
                      <LotRow key={lot.id} lot={lot} selected={selectedLot.id === lot.id} onClick={() => setSelectedId(lot.id)} />
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-end justify-between gap-4 rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] p-4 text-white">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Vista seleccionada</p>
                      <h3 className="mt-1 text-2xl font-bold">{selectedLot.name}</h3>
                      <p className="text-xs text-white/50">{selectedLot.block} · {selectedLot.type === "mixed" ? "Mixto" : selectedLot.type === "moto" ? "Motos" : "Automoviles"}</p>
                    </div>
                    <div className="rounded-lg bg-white/10 px-3 py-2 text-right ring-1 ring-white/15">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">Capacidad</p>
                      <p className="text-xl font-bold">{selectedLot.capacity}</p>
                    </div>
                  </div>

                  <CellGrid lot={selectedLot} />

                  <div className="grid grid-cols-4 gap-2">
                    {selectedStats.map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-[#e8ece6] bg-[#f8faf7] p-2.5 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">{stat.label}</p>
                        <p className="mt-1 text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Panorama */}
            <Card className="xl:col-span-4">
              <SectionTitle icon={Gauge} title="Panorama general" subtitle="Estado consolidado" color={statusColor(totals.pct)} />
              <Donut value={totals.pct} />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Ocupadas", value: totals.occupied, color: C.green },
                  { label: "Libres", value: totals.available, color: C.blue },
                  { label: "Mant.", value: totals.maintenance, color: C.red },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-[#f8faf7] p-2.5 text-center border border-[#e8ece6]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">{item.label}</p>
                    <p className="mt-1 text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {alerts.map((alert, i) => {
                  const color = alert.tone === "red" ? C.red : alert.tone === "amber" ? C.amber : C.green;
                  const bg = alert.tone === "red" ? C.redPale : alert.tone === "amber" ? C.amberPale : C.greenPale;
                  return (
                    <motion.div
                      key={alert.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-2.5 rounded-lg p-2.5"
                      style={{ backgroundColor: bg }}
                    >
                      <AlertTriangle size={14} color={color} />
                      <p className="text-xs font-medium text-[#1a1a2e]/80">{alert.label}</p>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Middle Row */}
          <div className="grid gap-5 xl:grid-cols-12">
            {/* Flujo */}
            <Card className="xl:col-span-5">
              <SectionTitle icon={Activity} title="Flujo del dia" subtitle="Entradas y salidas por franja" color={C.green} />
              <AreaChart />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-emerald-50 p-3.5 border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <DoorOpen size={16} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider">Entradas</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-emerald-700">96</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <DoorClosed size={16} />
                    <p className="text-[10px] font-semibold uppercase tracking-wider">Salidas</p>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-700">74</p>
                </div>
              </div>
            </Card>

            {/* Barras */}
            <Card className="xl:col-span-4">
              <SectionTitle icon={Building2} title="Ocupacion por parqueadero" subtitle="Ocupadas, reservas y mantenimiento" color={C.blue} />
              <HorizontalBars lots={parkingLots} />
              <div className="mt-3 flex flex-wrap gap-4 text-[11px] font-medium text-[#6b7280]">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#2E7D32]" />Ocupadas</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#f59e0b]" />Reservadas</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#ef4444]" />Mant.</span>
              </div>
            </Card>

            {/* Distribucion */}
            <Card className="xl:col-span-3">
              <SectionTitle icon={ShieldCheck} title="Distribucion" subtitle="Vehiculos y usuarios" color={C.purple} />
              <div className="space-y-4">
                <DistributionChart items={vehicleDistribution} />
                <div className="h-px bg-[#e8ece6]" />
                <DistributionChart items={userDistribution} />
              </div>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-5 xl:grid-cols-12">
            {/* Movimientos */}
            <Card className="xl:col-span-8">
              <SectionTitle icon={Zap} title="Movimientos recientes" subtitle="Ultimos registros de acceso" color={C.teal} />
              <div className="grid gap-2 md:grid-cols-2">
                {movements.map((move, index) => {
                  const lot = parkingLots.find((item) => item.id === move.lotId);
                  const isEntry = move.kind === "entrada";
                  return (
                    <motion.div
                      key={move.id}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.04 }}
                      className="flex items-center gap-3 rounded-lg border border-[#e8ece6] bg-[#f8faf7] p-3 hover:bg-white hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: isEntry ? C.greenPale : "#f1f5f9" }}>
                        {isEntry ? <DoorOpen size={16} color={C.green} /> : <DoorClosed size={16} color={C.muted} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#1a1a2e]">{move.plate}</p>
                          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase" style={{ backgroundColor: isEntry ? C.greenPale : "#f1f5f9", color: isEntry ? C.greenDark : C.muted }}>
                            {move.kind}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-[#6b7280]">{move.driver} · {move.vehicle} · {lot?.name}</p>
                      </div>
                      <p className="shrink-0 text-[11px] font-semibold text-[#9ca3af]">{move.minutesAgo} min</p>
                    </motion.div>
                  );
                })}
              </div>
            </Card>

            {/* Estado operativo */}
            <Card className="xl:col-span-4">
              <SectionTitle icon={Wrench} title="Estado operativo" subtitle="Equipos de acceso y seguridad" color={C.amber} />
              <div className="space-y-2">
                {[
                  { label: "Barreras automaticas", value: "100%", icon: CheckCircle2, color: C.green },
                  { label: "Camaras LPR", value: "12/12", icon: ShieldCheck, color: C.green },
                  { label: "Celdas bloqueadas", value: totals.maintenance, icon: Wrench, color: C.amber },
                  { label: "Tiempo medio ingreso", value: "18s", icon: Clock3, color: C.blue },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-[#f8faf7] p-2.5 border border-[#e8ece6]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white">
                        <item.icon size={15} color={item.color} />
                      </div>
                      <p className="text-sm font-medium text-[#1a1a2e]">{item.label}</p>
                    </div>
                    <p className="text-sm font-bold" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      </main>
    </>
  );
}
