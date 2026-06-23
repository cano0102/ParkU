import { useEffect, useMemo, useState, useCallback } from "react";
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
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";

// ------------------------------------------------------------
// PALETA DE COLORES (inspirada en la landing page)
// ------------------------------------------------------------
const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  primaryLight: "#B3E6A1",
  primaryPale: "#EAF7E6",
  background: "#F5F7F8",
  surface: "#FFFFFF",
  text: "#000000",
  textLight: "#64748B",
  border: "#E2E8F0",
  dark: "#000000",
  white: "#FFFFFF",
  // complementarios para gráficos
  amber: "#F59E0B",
  red: "#EF4444",
  blue: "#3B82F6",
  purple: "#8B5CF6",
  teal: "#14B8A6",
};

// ------------------------------------------------------------
// TIPOS Y DATOS INICIALES
// ------------------------------------------------------------
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

const INITIAL_LOTS: ParkingLot[] = [
  { id: "pq-norte", name: "PQ Norte", block: "Bloque A", type: "mixed", status: "activo", capacity: 72, occupied: 54, reserved: 5, maintenance: 2 },
  { id: "pq-bienestar", name: "PQ Bienestar", block: "Bloque C", type: "car", status: "activo", capacity: 48, occupied: 28, reserved: 4, maintenance: 1 },
  { id: "pq-motos", name: "PQ Motos", block: "Ingreso Sur", type: "moto", status: "activo", capacity: 64, occupied: 37, reserved: 8, maintenance: 0 },
  { id: "pq-talleres", name: "PQ Talleres", block: "Bloque E", type: "mixed", status: "activo", capacity: 36, occupied: 31, reserved: 1, maintenance: 3 },
  { id: "pq-visitantes", name: "PQ Visitantes", block: "Porteria", type: "car", status: "activo", capacity: 30, occupied: 15, reserved: 7, maintenance: 0 },
  { id: "pq-admin", name: "PQ Administrativo", block: "Bloque B", type: "car", status: "mantenimiento", capacity: 28, occupied: 12, reserved: 2, maintenance: 8 },
];

const INITIAL_MOVEMENTS: Movement[] = [
  { id: "m1", plate: "KLM 842", driver: "Diana Rojas", lotId: "pq-norte", kind: "entrada", vehicle: "Automovil", minutesAgo: 3 },
  { id: "m2", plate: "NQZ 19F", driver: "Carlos Pena", lotId: "pq-motos", kind: "salida", vehicle: "Moto", minutesAgo: 7 },
  { id: "m3", plate: "HTR 221", driver: "Laura Mora", lotId: "pq-bienestar", kind: "entrada", vehicle: "Automovil", minutesAgo: 12 },
  { id: "m4", plate: "MXC 04D", driver: "Juan Torres", lotId: "pq-talleres", kind: "entrada", vehicle: "Moto", minutesAgo: 18 },
  { id: "m5", plate: "BVA 908", driver: "Sofia Arias", lotId: "pq-visitantes", kind: "salida", vehicle: "Automovil", minutesAgo: 24 },
  { id: "m6", plate: "UFP 331", driver: "Nelson Diaz", lotId: "pq-norte", kind: "entrada", vehicle: "Automovil", minutesAgo: 31 },
];

// ------------------------------------------------------------
// HELPERS Y SIMULACIÓN
// ------------------------------------------------------------
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const PLATES = ["ABC 123", "DEF 456", "GHI 789", "JKL 012", "MNO 345", "PQR 678", "STU 901", "VWX 234", "YZ 567", "KLM 890"];
const DRIVERS = ["Ana Gómez", "Luis Pérez", "María Rodríguez", "Carlos Sánchez", "Laura Martínez", "Jorge Fernández", "Sofía López", "Miguel Torres", "Elena Díaz", "David Ruiz"];
const LOT_IDS = ["pq-norte", "pq-bienestar", "pq-motos", "pq-talleres", "pq-visitantes", "pq-admin"];
const VEHICLES: ("Automovil" | "Moto")[] = ["Automovil", "Moto"];

function generateMovement(lots: ParkingLot[]): Movement {
  const lot = randomItem(lots);
  const isEntry = Math.random() > 0.4;
  const vehicle = randomItem(VEHICLES);
  return {
    id: `m${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    plate: randomItem(PLATES),
    driver: randomItem(DRIVERS),
    lotId: lot.id,
    kind: isEntry ? "entrada" : "salida",
    vehicle,
    minutesAgo: randomInt(1, 5),
  };
}

function simulateLotUpdate(lots: ParkingLot[]): ParkingLot[] {
  return lots.map((lot) => {
    if (lot.status === "mantenimiento") return lot;

    let newOccupied = lot.occupied + randomInt(-2, 3);
    let newReserved = lot.reserved + randomInt(-1, 2);
    let newMaintenance = lot.maintenance + randomInt(-1, 1);

    const total = lot.capacity;
    newOccupied = Math.max(0, Math.min(total, newOccupied));
    newReserved = Math.max(0, Math.min(total - newOccupied, newReserved));
    newMaintenance = Math.max(0, Math.min(total - newOccupied - newReserved, newMaintenance));

    let newStatus = lot.status;
    if (Math.random() < 0.05) {
      newStatus = lot.status === "activo" ? "mantenimiento" : "activo";
      if (newStatus === "mantenimiento") {
        newOccupied = Math.max(0, Math.floor(lot.capacity * 0.3));
        newReserved = 0;
        newMaintenance = lot.capacity - newOccupied;
      } else {
        newMaintenance = randomInt(0, 3);
        newOccupied = Math.min(lot.capacity - newMaintenance, randomInt(10, lot.capacity - newMaintenance - 5));
        newReserved = randomInt(0, Math.min(8, lot.capacity - newOccupied - newMaintenance));
      }
    }

    return {
      ...lot,
      occupied: newOccupied,
      reserved: newReserved,
      maintenance: newMaintenance,
      status: newStatus,
    };
  });
}

function availableOf(lot: ParkingLot) {
  return Math.max(lot.capacity - lot.occupied - lot.reserved - lot.maintenance, 0);
}

function occupancyOf(lot: ParkingLot) {
  if (lot.capacity === 0) return 0;
  return Math.round((lot.occupied / lot.capacity) * 100);
}

function statusColor(pct: number) {
  if (pct >= 82) return COLORS.red;
  if (pct >= 62) return COLORS.amber;
  return COLORS.primary;
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

// ------------------------------------------------------------
// HOOKS PERSONALIZADOS
// ------------------------------------------------------------
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

function useParkingData() {
  const [lots, setLots] = useState<ParkingLot[]>(() => {
    const stored = localStorage.getItem("parkingLots");
    if (stored) {
      try { return JSON.parse(stored); } catch { return INITIAL_LOTS; }
    }
    return INITIAL_LOTS;
  });

  const [movements, setMovements] = useState<Movement[]>(() => {
    const stored = localStorage.getItem("movements");
    if (stored) {
      try { return JSON.parse(stored); } catch { return INITIAL_MOVEMENTS; }
    }
    return INITIAL_MOVEMENTS;
  });

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    localStorage.setItem("parkingLots", JSON.stringify(lots));
  }, [lots]);

  useEffect(() => {
    localStorage.setItem("movements", JSON.stringify(movements));
  }, [movements]);

  const updateData = useCallback(() => {
    setIsUpdating(true);
    const newLots = simulateLotUpdate(lots);
    setLots(newLots);

    const numNew = randomInt(0, 2);
    const newMovements: Movement[] = [];
    for (let i = 0; i < numNew; i++) {
      newMovements.push(generateMovement(newLots));
    }

    const updatedMovements = movements.map((m) => ({
      ...m,
      minutesAgo: m.minutesAgo + 2,
    }));

    const combined = [...newMovements, ...updatedMovements]
      .sort((a, b) => a.minutesAgo - b.minutesAgo)
      .slice(0, 12);

    setMovements(combined);
    setLastUpdate(new Date());
    setIsUpdating(false);
  }, [lots, movements]);

  useEffect(() => {
    const interval = setInterval(updateData, 8000);
    return () => clearInterval(interval);
  }, [updateData]);

  const refresh = useCallback(() => {
    updateData();
  }, [updateData]);

  return { lots, movements, lastUpdate, isUpdating, refresh };
}

// ------------------------------------------------------------
// COMPONENTES DE UI REDISEÑADOS
// ------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    variants={fadeUp}
    className={`rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E2E8F0] ${className}`}
  >
    {children}
  </motion.div>
);

const SectionTitle = ({ icon: Icon, title, subtitle, color = COLORS.primary }: { icon: React.ElementType; title: string; subtitle?: string; color?: string }) => (
  <div className="mb-5 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
        <Icon size={18} color={color} strokeWidth={2} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[#1a1a2e]">{title}</h3>
        {subtitle && <p className="text-xs text-[#64748B]">{subtitle}</p>}
      </div>
    </div>
  </div>
);

// ------------------------------------------------------------
// KPI (rediseñado)
// ------------------------------------------------------------
const Kpi = ({ label, value, detail, icon: Icon, color }: { label: string; value: string | number; detail: string; icon: React.ElementType; color: string }) => (
  <motion.div variants={fadeUp} whileHover={{ y: -2, transition: { duration: 0.2 } }} className="cursor-default">
    <div className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E2E8F0] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15` }}>
          <Icon size={24} color={color} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[#1a1a2e] tracking-tight">{value}</p>
          <p className="text-xs text-[#64748B] truncate">{detail}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

// ------------------------------------------------------------
// DONUT (rediseñado)
// ------------------------------------------------------------
const Donut = ({ value, size = 170 }: { value: number; size?: number }) => {
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

// ------------------------------------------------------------
// MAPA DE CELDAS (con leyenda)
// ------------------------------------------------------------
const CellGrid = ({ lot }: { lot: ParkingLot }) => {
  const cells = useMemo(() => makeCells(lot), [lot]);
  const colors: Record<CellStatus, string> = {
    occupied: COLORS.primary,
    available: "#E2E8F0",
    reserved: COLORS.amber,
    maintenance: COLORS.red,
  };

  return (
    <div>
      <div className="rounded-xl bg-[#F8FAF9] p-4 border border-[#E2E8F0]">
        <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-12 md:grid-cols-14">
          {cells.map((cell) => (
            <motion.div
              key={cell.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: cell.delay }}
              className="aspect-square rounded-sm"
              style={{ backgroundColor: colors[cell.status] }}
              title={cell.status}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#64748B]">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.primary }} /> Ocupadas</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: "#E2E8F0" }} /> Libres</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.amber }} /> Reservadas</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS.red }} /> Mantenimiento</span>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// LISTA DE PARQUEADEROS (con barra de progreso)
// ------------------------------------------------------------
const LotRow = ({ lot, selected, onClick }: { lot: ParkingLot; selected: boolean; onClick: () => void }) => {
  const pct = occupancyOf(lot);
  const color = statusColor(pct);
  const Icon = lot.type === "moto" ? Bike : lot.type === "car" ? Car : ParkingCircle;

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition-all duration-200 ${
        selected
          ? "border-[#39A900] bg-[#EAF7E6] shadow-sm"
          : "border-transparent bg-[#F8FAF9] hover:bg-white hover:border-[#E2E8F0] hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Icon size={15} color={color} />
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-[#1a1a2e] truncate">{lot.name}</p>
            <p className="text-[11px] text-[#64748B]">{lot.block}</p>
          </div>
        </div>
        <p className="text-base font-bold shrink-0" style={{ color }}>{pct}%</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
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
};

// ------------------------------------------------------------
// BARRAS HORIZONTALES (apiladas)
// ------------------------------------------------------------
const HorizontalBars = ({ lots }: { lots: ParkingLot[] }) => (
  <div className="space-y-3">
    {lots.map((lot) => {
      const occupiedPct = (lot.occupied / lot.capacity) * 100;
      const reservedPct = (lot.reserved / lot.capacity) * 100;
      const maintenancePct = (lot.maintenance / lot.capacity) * 100;
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

// ------------------------------------------------------------
// GRÁFICO DE ÁREA
// ------------------------------------------------------------
const AreaChart = ({ data }: { data: number[] }) => {
  const w = 340, h = 90;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const coords = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 14) - 7;
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-24 w-full">
      <defs>
        <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.2" />
          <stop offset="100%" stopColor={COLORS.primary} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} d={area} fill="url(#areaGrad)" />
      <motion.path
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        d={line} fill="none" stroke={COLORS.primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"
      />
    </svg>
  );
};

// ------------------------------------------------------------
// GRÁFICO DE DISTRIBUCIÓN (anillo)
// ------------------------------------------------------------
const DistributionChart = ({ items }: { items: { label: string; value: number; color: string }[] }) => {
  const total = items.reduce((a, i) => a + i.value, 0);
  let cursor = 0;
  const gradient = items.map((item) => {
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

// ------------------------------------------------------------
// DASHBOARD PRINCIPAL
// ------------------------------------------------------------
export default function Dashboard() {
  const now = useClock();
  const [filter, setFilter] = useState<"all" | "car" | "moto">("all");
  const [selectedId, setSelectedId] = useState(INITIAL_LOTS[0].id);

  const { lots, movements, lastUpdate, isUpdating, refresh } = useParkingData();

  useEffect(() => {
    if (!lots.some((l) => l.id === selectedId)) {
      setSelectedId(lots[0]?.id || INITIAL_LOTS[0].id);
    }
  }, [lots, selectedId]);

  const visibleLots = useMemo(() => {
    if (filter === "all") return lots;
    return lots.filter((l) => l.type === filter || l.type === "mixed");
  }, [filter, lots]);

  const selectedLot = visibleLots.find((l) => l.id === selectedId) ?? visibleLots[0] ?? lots[0] ?? INITIAL_LOTS[0];

  const totals = useMemo(() => {
    const capacity = lots.reduce((a, l) => a + l.capacity, 0);
    const occupied = lots.reduce((a, l) => a + l.occupied, 0);
    const reserved = lots.reduce((a, l) => a + l.reserved, 0);
    const maintenance = lots.reduce((a, l) => a + l.maintenance, 0);
    const available = lots.reduce((a, l) => a + availableOf(l), 0);
    return {
      capacity, occupied, reserved, maintenance, available,
      pct: capacity > 0 ? Math.round((occupied / capacity) * 100) : 0,
      activeLots: lots.filter((l) => l.status === "activo").length,
    };
  }, [lots]);

  const alerts = useMemo(() => {
    const high = lots.filter((l) => occupancyOf(l) >= 82);
    const result = [];
    if (high.length > 0) {
      result.push({
        label: `${high.length} parqueadero(s) al ${Math.max(...high.map(occupancyOf))}% — casi lleno`,
        tone: "red" as const,
      });
    }
    if (totals.maintenance > 0) {
      result.push({
        label: `${totals.maintenance} celdas en mantenimiento`,
        tone: "amber" as const,
      });
    }
    if (result.length === 0) {
      result.push({
        label: "Todos los sistemas operan con normalidad",
        tone: "green" as const,
      });
    }
    return result;
  }, [lots, totals.maintenance]);

  const selectedStats = useMemo(() => [
    { label: "Ocupadas", value: selectedLot.occupied, color: COLORS.primary },
    { label: "Libres", value: availableOf(selectedLot), color: COLORS.blue },
    { label: "Reservadas", value: selectedLot.reserved, color: COLORS.amber },
    { label: "Mant.", value: selectedLot.maintenance, color: COLORS.red },
  ], [selectedLot]);

  const areaData = useMemo(() => {
    const currentPct = totals.pct;
    return Array.from({ length: 12 }, (_, i) => {
      const variation = Math.sin(i / 2) * 8 + (Math.random() * 6 - 3);
      return Math.max(5, Math.min(95, currentPct + variation));
    });
  }, [totals.pct]);

  const vehicleDistribution = useMemo(() => {
    const cars = lots.reduce((acc, l) => acc + (l.type === "car" || l.type === "mixed" ? l.occupied : 0), 0);
    const motos = lots.reduce((acc, l) => acc + (l.type === "moto" || l.type === "mixed" ? l.occupied : 0), 0);
    return [
      { label: "Automoviles", value: Math.round(cars * 0.7 + motos * 0.1), color: COLORS.blue },
      { label: "Motos", value: Math.round(motos * 0.7 + cars * 0.1), color: COLORS.amber },
      { label: "Reservas", value: totals.reserved, color: COLORS.primary },
    ];
  }, [lots, totals.reserved]);

  const userDistribution = useMemo(() => {
    const totalUsers = 165;
    const base = Math.round(totalUsers * 0.52);
    const admin = Math.round(totalUsers * 0.29);
    const visit = totalUsers - base - admin;
    return [
      { label: "Docentes", value: base, color: COLORS.primary },
      { label: "Administrativos", value: admin, color: COLORS.blue },
      { label: "Visitantes", value: visit, color: COLORS.purple },
    ];
  }, []);

  return (
    <>
      <style>{`
        :root { color-scheme: light; }
        body { margin: 0; background: ${COLORS.background}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        * { box-sizing: border-box; }
        ::selection { background: ${COLORS.primary}; color: white; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>

      <main className="min-h-screen bg-[#F5F7F8] text-[#1a1a2e]">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-[#39A900]/[0.05] blur-3xl" />
          <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/4 rounded-full bg-[#39A900]/[0.04] blur-3xl" />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          className="relative mx-auto max-w-[1440px] px-5 py-5"
        >
          {/* ========== HEADER REDISEÑADO ========== */}
          <motion.header variants={fadeUp} className="mb-6 flex flex-col gap-4 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#E2E8F0]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#39A900] text-white shadow-md">
                  <ParkingCircle size={24} strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#1a1a2e]">SENA Parqueaderos</h1>
                  <p className="text-sm text-[#64748B]">Centro de control en tiempo real</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 rounded-xl bg-[#F5F7F8] px-4 py-2">
                  <CalendarDays size={16} className="text-[#64748B]" />
                  <span className="text-sm font-medium text-[#1a1a2e] capitalize">{formatDate(now)}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#F5F7F8] px-4 py-2">
                  <Clock3 size={16} className="text-[#64748B]" />
                  <span className="text-sm font-mono font-bold text-[#1a1a2e]">{formatClock(now)}</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-[#EAF7E6] px-4 py-2">
                  <Gauge size={16} className="text-[#39A900]" />
                  <div>
                    <p className="text-xs font-medium text-[#64748B]">Ocupación</p>
                    <p className="text-lg font-bold text-[#2D7D00]">{totals.pct}%</p>
                  </div>
                </div>
                <button
                  onClick={refresh}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 rounded-xl bg-[#39A900] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2D7D00] disabled:opacity-60 shadow-sm"
                >
                  <RefreshCw size={16} className={isUpdating ? "animate-spin" : ""} />
                  Actualizar
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#64748B]">
              <span>Última actualización: {lastUpdate.toLocaleTimeString("es-CO")}</span>
              {isUpdating && <span className="inline-block h-2 w-2 rounded-full bg-[#39A900] animate-pulse" />}
              <span className="inline-flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39A900] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39A900]" />
                </span>
                Datos en vivo
              </span>
            </div>
          </motion.header>

          {/* ========== KPIS ========== */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Celdas totales" value={totals.capacity} detail={`${totals.activeLots} parqueaderos activos`} icon={ParkingCircle} color={COLORS.primary} />
            <Kpi label="Disponibles" value={totals.available} detail={`${totals.reserved} reservas vigentes`} icon={DoorOpen} color={COLORS.blue} />
            <Kpi label="Vehiculos dentro" value={totals.occupied} detail="Automoviles y motos" icon={Car} color={COLORS.amber} />
            <Kpi label="Conductores" value="165" detail="Usuarios registrados" icon={Users} color={COLORS.purple} />
          </div>

          {/* ========== FILA PRINCIPAL ========== */}
          <div className="grid gap-6 xl:grid-cols-12">
            {/* Mapa de celdas (8 columnas) */}
            <Card className="xl:col-span-8">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SectionTitle icon={LayoutDashboard} title="Mapa inteligente de celdas" subtitle="Selecciona un parqueadero" color={COLORS.primary} />
                <div className="inline-flex items-center gap-1 rounded-lg bg-[#F5F7F8] p-1">
                  {[
                    { id: "all", label: "Todos" },
                    { id: "car", label: "Autos" },
                    { id: "moto", label: "Motos" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id as "all" | "car" | "moto")}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                        filter === tab.id ? "bg-white text-[#2D7D00] shadow-sm border border-[#E2E8F0]" : "text-[#64748B] hover:text-[#1a1a2e]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[15rem_1fr]">
                <div className="max-h-[32rem] space-y-1.5 overflow-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {visibleLots.map((lot) => (
                      <LotRow key={lot.id} lot={lot} selected={selectedLot.id === lot.id} onClick={() => setSelectedId(lot.id)} />
                    ))}
                  </AnimatePresence>
                </div>

                <div className="flex min-w-0 flex-col gap-4">
                  <div className="flex items-end justify-between gap-4 rounded-2xl bg-gradient-to-br from-[#2D7D00] to-[#39A900] p-4 text-white shadow-md">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">Vista seleccionada</p>
                      <h3 className="mt-1 text-2xl font-bold">{selectedLot.name}</h3>
                      <p className="text-xs text-white/70">{selectedLot.block} · {selectedLot.type === "mixed" ? "Mixto" : selectedLot.type === "moto" ? "Motos" : "Automoviles"}</p>
                    </div>
                    <div className="rounded-xl bg-white/20 px-4 py-2 text-right backdrop-blur-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-white">Capacidad</p>
                      <p className="text-2xl font-bold text-white">{selectedLot.capacity}</p>
                    </div>
                  </div>

                  <CellGrid lot={selectedLot} />

                  <div className="grid grid-cols-4 gap-2">
                    {selectedStats.map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-[#F8FAF9] p-3 text-center border border-[#E2E8F0]">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">{stat.label}</p>
                        <p className="mt-1 text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Panorama + alertas (4 columnas) */}
            <Card className="xl:col-span-4 flex flex-col">
              <SectionTitle icon={Gauge} title="Panorama general" subtitle="Estado consolidado" color={statusColor(totals.pct)} />
              <Donut value={totals.pct} />
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Ocupadas", value: totals.occupied, color: COLORS.primary },
                  { label: "Libres", value: totals.available, color: COLORS.blue },
                  { label: "Mant.", value: totals.maintenance, color: COLORS.red },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-[#F8FAF9] p-3 text-center border border-[#E2E8F0]">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">{item.label}</p>
                    <p className="mt-1 text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex-1 space-y-2.5">
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
          </div>

          {/* ========== FILA INTERMEDIA ========== */}
          <div className="mt-6 grid gap-6 xl:grid-cols-12">
            {/* Flujo del día */}
            <Card className="xl:col-span-5">
              <SectionTitle icon={Activity} title="Flujo del día" subtitle="Entradas y salidas por franja" color={COLORS.primary} />
              <AreaChart data={areaData} />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#EAF7E6] p-4 border border-[#B3E6A1]">
                  <div className="flex items-center gap-2 text-[#2D7D00]">
                    <DoorOpen size={18} />
                    <p className="text-xs font-semibold uppercase tracking-wider">Entradas</p>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-[#2D7D00]">{movements.filter(m => m.kind === "entrada").length}</p>
                </div>
                <div className="rounded-2xl bg-[#F1F5F9] p-4 border border-[#E2E8F0]">
                  <div className="flex items-center gap-2 text-[#64748B]">
                    <DoorClosed size={18} />
                    <p className="text-xs font-semibold uppercase tracking-wider">Salidas</p>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-[#1a1a2e]">{movements.filter(m => m.kind === "salida").length}</p>
                </div>
              </div>
            </Card>

            {/* Ocupación por parqueadero */}
            <Card className="xl:col-span-4">
              <SectionTitle icon={Building2} title="Ocupación por parqueadero" subtitle="Ocupadas, reservas y mantenimiento" color={COLORS.blue} />
              <HorizontalBars lots={lots} />
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-[#64748B]">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />Ocupadas</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.amber }} />Reservadas</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.red }} />Mant.</span>
              </div>
            </Card>

            {/* Distribución */}
            <Card className="xl:col-span-3">
              <SectionTitle icon={ShieldCheck} title="Distribución" subtitle="Vehículos y usuarios" color={COLORS.purple} />
              <div className="space-y-5">
                <DistributionChart items={vehicleDistribution} />
                <div className="h-px bg-[#E2E8F0]" />
                <DistributionChart items={userDistribution} />
              </div>
            </Card>
          </div>

          {/* ========== FILA INFERIOR ========== */}
          <div className="mt-6 grid gap-6 xl:grid-cols-12">
            {/* Movimientos recientes */}
            <Card className="xl:col-span-8">
              <SectionTitle icon={Zap} title="Movimientos recientes" subtitle="Últimos registros de acceso" color={COLORS.teal} />
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
                      className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAF9] p-3 hover:bg-white hover:shadow-sm transition-all duration-200"
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
                        <p className="truncate text-xs text-[#64748B]">{move.driver} · {move.vehicle} · {lot?.name || move.lotId}</p>
                      </div>
                      <p className="shrink-0 text-xs font-semibold text-[#64748B]">{move.minutesAgo} min</p>
                    </motion.div>
                  );
                })}
              </div>
            </Card>

            {/* Estado operativo */}
            <Card className="xl:col-span-4">
              <SectionTitle icon={Wrench} title="Estado operativo" subtitle="Equipos de acceso y seguridad" color={COLORS.amber} />
              <div className="space-y-2.5">
                {[
                  { label: "Barreras automáticas", value: "100%", icon: CheckCircle2, color: COLORS.primary },
                  { label: "Cámaras LPR", value: "12/12", icon: ShieldCheck, color: COLORS.primary },
                  { label: "Celdas bloqueadas", value: totals.maintenance, icon: Wrench, color: COLORS.amber },
                  { label: "Tiempo medio ingreso", value: "18s", icon: Clock3, color: COLORS.blue },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAF9] p-3 border border-[#E2E8F0]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-[#E2E8F0]">
                        <item.icon size={16} color={item.color} />
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