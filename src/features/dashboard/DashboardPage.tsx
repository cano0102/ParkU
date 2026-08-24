import { forwardRef, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useParqueaderos } from "@/features/parqueaderos";
import { useCeldas } from "@/features/parqueaderos";
import { useMovimientos } from "@/features/parqueaderos";
import { useVehiculos } from "@/features/conductores";
import { useConductores } from "@/features/conductores";
import { useIncidentes } from "@/features/incidentes";
import { useReservas } from "@/features/reservas";
import { theme } from "@/styles/theme";
import logoSena from "@/assets/images/logoSena.png";
import {
  Accessibility,
  Activity,
  AlertTriangle,
  Bike,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  DoorClosed,
  DoorOpen,
  FileWarning,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  ParkingCircle,
  Users,
  Zap,
} from "lucide-react";

// ------------------------------------------------------------
// PALETA DE COLORES (inspirada en la landing page)
// ------------------------------------------------------------
const COLORS = theme;

// ------------------------------------------------------------
// TIPOS DERIVADOS PARA LA VISTA DEL DASHBOARD
// ------------------------------------------------------------
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
  fecha: string;
};

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

// ------------------------------------------------------------
// HOOKS Y FORMATO
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

function formatMovementTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function daysAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  if (days === 0) return "Hoy";
  if (days === 1) return "Hace 1 día";
  return `Hace ${days} días`;
}

// ------------------------------------------------------------
// COMPONENTES DE UI
// ------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
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

const SectionTitle = ({ icon: Icon, title, subtitle, color = COLORS.primary, actionLabel, onAction }: { icon: React.ElementType; title: string; subtitle?: string; color?: string; actionLabel?: string; onAction?: () => void }) => (
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

const Kpi = ({ label, value, detail, icon: Icon, color, onClick }: { label: string; value: string | number; detail: string; icon: React.ElementType; color: string; onClick?: () => void }) => (
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

const LotRow = forwardRef<HTMLButtonElement, { lot: ParkingLot; selected: boolean; onClick: () => void }>(({ lot, selected, onClick }, ref) => {
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

const HorizontalBars = ({ lots }: { lots: ParkingLot[] }) => (
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

const DistributionChart = ({ items }: { items: { label: string; value: number; color: string }[] }) => {
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

// ------------------------------------------------------------
// DASHBOARD PRINCIPAL
// ------------------------------------------------------------
export default function Dashboard() {
  const navigate = useNavigate();
  const now = useClock();
  const [filter, setFilter] = useState<"all" | "car" | "moto">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: parqueaderos = [] } = useParqueaderos();
  const { data: celdas = [] } = useCeldas();
  const { data: movimientos = [] } = useMovimientos();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: conductores = [] } = useConductores();
  const { data: incidentes = [] } = useIncidentes();
  const { data: reservas = [] } = useReservas();

  // Parqueaderos + celdas reales del contexto
  const lots = useMemo<ParkingLot[]>(() => {
    return parqueaderos.map((pq) => {
      const celdasDelPQ = celdas.filter((c) => c.parqueaderoId === pq.id);
      const ocupadas = celdasDelPQ.filter((c) => c.estado === "no_disponible").length;
      const reservadas = celdasDelPQ.filter((c) => c.estado === "reservada").length;
      const mantenimiento = celdasDelPQ.filter((c) => c.estado === "mantenimiento").length;

      let tipo: VehicleType = "mixed";
      if (pq.celdasMotos === 0) tipo = "car";
      else if (pq.celdasCarros === 0) tipo = "moto";

      return {
        id: pq.id,
        name: pq.nombre,
        block: pq.bloque,
        type: tipo,
        status: pq.estado === "activo" ? "activo" : "mantenimiento",
        capacity: pq.capacidad || celdasDelPQ.length || 1,
        occupied: ocupadas,
        reserved: reservadas,
        maintenance: mantenimiento,
      };
    });
  }, [parqueaderos, celdas]);

  // Movimientos reales (derivados de controles de salida en el contexto)
  const movements = useMemo<Movement[]>(() => {
    return movimientos.slice(0, 10).map((m) => {
      const vehiculo = vehiculos.find((v) => v.placa === m.placa);
      return {
        id: m.id,
        plate: m.placa,
        driver: m.conductorNombre,
        lotId: m.parqueaderoId,
        kind: m.tipo,
        vehicle: vehiculo?.tipo === "moto" ? "Moto" : "Automovil",
        fecha: m.fecha,
      };
    });
  }, [movimientos, vehiculos]);

  useEffect(() => {
    if (lots.length > 0 && !selectedId) {
      setSelectedId(lots[0].id);
    }
  }, [lots, selectedId]);

  const visibleLots = useMemo(() => {
    if (filter === "all") return lots;
    return lots.filter((l) => l.type === filter || l.type === "mixed");
  }, [filter, lots]);

  const selectedLot = visibleLots.find((l) => l.id === selectedId) ?? visibleLots[0] ?? lots[0];

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

  const incidentesPendientes = useMemo(
    () => incidentes.filter((i) => i.estado === "pendiente"),
    [incidentes]
  );

  const reservaCounts = useMemo(() => ({
    pendiente: reservas.filter((r) => r.estado === "pendiente").length,
    activa: reservas.filter((r) => r.estado === "activa").length,
    completada: reservas.filter((r) => r.estado === "completada").length,
    cancelada: reservas.filter((r) => r.estado === "cancelada").length,
  }), [reservas]);

  const alerts = useMemo(() => {
    const high = lots.filter((l) => occupancyOf(l) >= 82);
    const result: { label: string; tone: "red" | "amber" | "green" }[] = [];

    if (high.length > 0) {
      result.push({
        label: `${high.length} parqueadero(s) al ${Math.max(...high.map(occupancyOf))}% — casi lleno`,
        tone: "red",
      });
    }
    if (incidentesPendientes.length > 0) {
      result.push({
        label: `${incidentesPendientes.length} incidente(s) pendiente(s) por resolver`,
        tone: "red",
      });
    }
    if (totals.maintenance > 0) {
      result.push({
        label: `${totals.maintenance} celda(s) en mantenimiento`,
        tone: "amber",
      });
    }
    if (result.length === 0) {
      result.push({ label: "Todos los sistemas operan con normalidad", tone: "green" });
    }
    return result;
  }, [lots, totals.maintenance, incidentesPendientes]);

  const selectedStats = useMemo(() => {
    if (!selectedLot) return [];
    return [
      { label: "Ocupadas", value: selectedLot.occupied, color: COLORS.primary },
      { label: "Libres", value: availableOf(selectedLot), color: COLORS.blue },
      { label: "Reservadas", value: selectedLot.reserved, color: COLORS.amber },
      { label: "Mant.", value: selectedLot.maintenance, color: COLORS.red },
    ];
  }, [selectedLot]);

  // "Inactivo" debe reflejarse en los totales del Dashboard: un vehículo o conductor
  // desactivado ya no cuenta como "registrado" para estas métricas.
  const vehiculosActivos = useMemo(() => vehiculos.filter((v) => v.estado === "activo"), [vehiculos]);
  const conductoresActivos = useMemo(() => conductores.filter((c) => c.estado === "activo"), [conductores]);

  const vehicleDistribution = useMemo(() => {
    const carros = vehiculosActivos.filter((v) => v.tipo === "carro").length;
    const motos = vehiculosActivos.filter((v) => v.tipo === "moto").length;
    return [
      { label: "Carros", value: carros, color: COLORS.blue },
      { label: "Motos", value: motos, color: COLORS.amber },
    ];
  }, [vehiculosActivos]);

  const conductorDistribution = useMemo(() => {
    const aprendices = conductoresActivos.filter((c) => c.tipoConductor === "aprendiz").length;
    const instructores = conductoresActivos.filter((c) => c.tipoConductor === "instructor").length;
    return [
      { label: "Aprendices", value: aprendices, color: COLORS.primary },
      { label: "Instructores", value: instructores, color: COLORS.blue },
    ];
  }, [conductoresActivos]);

  const accessibility = useMemo(() => {
    const celdasMR = celdas.filter((c) => c.tipo === "movilidad reducida");
    const disponiblesMR = celdasMR.filter((c) => c.estado === "disponible").length;
    const conductoresDiscapacidad = conductores.filter((c) => c.discapacidad).length;
    return { totalMR: celdasMR.length, disponiblesMR, conductoresDiscapacidad };
  }, [celdas, conductores]);

  const entradas = movements.filter((m) => m.kind === "entrada").length;
  const salidas = movements.filter((m) => m.kind === "salida").length;

  if (!selectedLot) {
    return null;
  }

  return (
    <>
      <style>{`
        :root { color-scheme: light; }
        body { margin: 0; font-family: 'Montserrat', sans-serif; }
        * { box-sizing: border-box; }
        ::selection { background: ${COLORS.primary}; color: white; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
      `}</style>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="dashboard-root flex flex-col gap-7"
      >
        {/* ========== HEADER ========== */}
        <motion.header
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative overflow-hidden rounded-[20px] p-6 sm:p-7 text-white shadow-[0_10px_28px_rgba(45,125,0,0.22)]"
          style={{ background: "linear-gradient(135deg, #39A900 0%, #2D7D00 100%)" }}
        >
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/[0.07]" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/[0.05]" />

          <div className="relative z-[1] flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 shadow-md">
                <img src={logoSena} alt="SENA" className="h-full w-full object-contain" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                  <LayoutDashboard size={11} /> Panel general
                </span>
                <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">ParkU · SENA</h1>
                <p className="text-sm text-white/75 mt-0.5">Control y monitoreo de parqueaderos institucionales</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/15 border border-white/25 px-4 py-2.5">
                <CalendarDays size={16} />
                <span className="text-sm font-medium capitalize">{formatDate(now)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/15 border border-white/25 px-4 py-2.5">
                <Clock3 size={16} />
                <span className="text-sm font-mono font-bold">{formatClock(now)}</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* ========== KPIS ========== */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi label="Celdas totales" value={totals.capacity} detail={`${totals.activeLots} parqueaderos activos`} icon={ParkingCircle} color={COLORS.primary} onClick={() => navigate("/app/parqueaderos")} />
          <Kpi label="Celdas disponibles" value={totals.available} detail={`${totals.reserved} reservadas · ${totals.maintenance} en mant.`} icon={DoorOpen} color={COLORS.blue} onClick={() => navigate("/app/parqueaderos")} />
          <Kpi label="Vehículos registrados" value={vehiculosActivos.length} detail={`${vehicleDistribution[0].value} carros · ${vehicleDistribution[1].value} motos`} icon={Car} color={COLORS.amber} onClick={() => navigate("/app/conductores")} />
          <Kpi label="Conductores registrados" value={conductoresActivos.length} detail={`${conductorDistribution[0].value} aprendices · ${conductorDistribution[1].value} instructores`} icon={Users} color={COLORS.purple} onClick={() => navigate("/app/conductores")} />
        </div>

        {/* ========== FILA PRINCIPAL ========== */}
        <div className="grid gap-6 xl:grid-cols-12">
            {/* Estado por parqueadero */}
            <Card className="xl:col-span-8">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <SectionTitle icon={LayoutDashboard} title="Estado por parqueadero" subtitle="Selecciona un parqueadero" color={COLORS.primary} actionLabel="Gestionar" onAction={() => navigate("/app/parqueaderos")} />
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

              <div className="grid gap-6 lg:grid-cols-[17rem_1fr]">
                <div className="space-y-2 pr-1">
                  <AnimatePresence mode="popLayout">
                    {visibleLots.map((lot) => (
                      <LotRow key={lot.id} lot={lot} selected={selectedLot.id === lot.id} onClick={() => setSelectedId(lot.id)} />
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

            {/* Panorama + alertas */}
            <Card className="xl:col-span-4 flex flex-col">
              <SectionTitle icon={Gauge} title="Panorama general" subtitle="Estado consolidado" color={statusColor(totals.pct)} />
              <Donut value={totals.pct} />
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Ocupadas", value: totals.occupied, color: COLORS.primary },
                  { label: "Libres", value: totals.available, color: COLORS.blue },
                  { label: "Mant.", value: totals.maintenance, color: COLORS.red },
                ].map((item) => (
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
          </div>

          {/* ========== FILA INTERMEDIA ========== */}
          <div className="grid gap-6 xl:grid-cols-12">
            {/* Entradas y salidas */}
            <Card className="xl:col-span-4">
              <SectionTitle icon={Activity} title="Entradas y salidas" subtitle="Últimos registros de movimiento" color={COLORS.primary} actionLabel="Control de acceso" onAction={() => navigate("/app/entrada-salida")} />
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
                Basado en los últimos {movements.length} movimientos registrados en el sistema.
              </p>
            </Card>

            {/* Ocupación por parqueadero */}
            <Card className="xl:col-span-4">
              <SectionTitle icon={Building2} title="Ocupación por parqueadero" subtitle="Ocupadas, reservas y mantenimiento" color={COLORS.blue} actionLabel="Gestionar" onAction={() => navigate("/app/parqueaderos")} />
              <HorizontalBars lots={lots} />
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-[#64748B]">
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />Ocupadas</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.amber }} />Reservadas</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.red }} />Mant.</span>
              </div>
            </Card>

            {/* Distribución */}
            <Card className="xl:col-span-4">
              <SectionTitle icon={GraduationCap} title="Distribución" subtitle="Vehículos y conductores" color={COLORS.purple} actionLabel="Conductores" onAction={() => navigate("/app/conductores")} />
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
          </div>

          {/* ========== FILA INFERIOR ========== */}
          <div className="grid gap-6 xl:grid-cols-12">
            {/* Movimientos recientes */}
            <Card className="xl:col-span-8">
              <SectionTitle icon={Zap} title="Movimientos recientes" subtitle="Últimos registros de acceso" color={COLORS.teal} actionLabel="Ver todos" onAction={() => navigate("/app/entrada-salida")} />
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
                      onClick={() => navigate("/app/entrada-salida")}
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

            {/* Reservas e incidentes */}
            <Card className="xl:col-span-4">
              <SectionTitle icon={ClipboardList} title="Reservas e incidentes" subtitle="Actividad reportada en el sistema" color={COLORS.amber} actionLabel="Ver incidentes" onAction={() => navigate("/app/incidentes")} />

              <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Pendientes", value: reservaCounts.pendiente, color: COLORS.amber },
                  { label: "Activas", value: reservaCounts.activa, color: COLORS.primary },
                  { label: "Completas", value: reservaCounts.completada, color: COLORS.blue },
                  { label: "Canceladas", value: reservaCounts.cancelada, color: COLORS.textLight },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => navigate("/app/reservas")}
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
                        onClick={() => navigate("/app/incidentes")}
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
          </div>
      </motion.div>
    </>
  );
}
