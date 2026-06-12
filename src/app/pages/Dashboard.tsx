import React, { useState, useEffect, useMemo } from "react";

import {
  Car,
  ParkingCircle,
  AlertTriangle,
  Activity,
  ShieldAlert,
  BadgeCheck,
  Clock3,
  BarChart3,
  Zap,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  DoorOpen,
  DoorClosed,
  Bike,
  Building2,
} from "lucide-react";

import { useData } from "../context/DataContext";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  BarElement,
} from "chart.js";
import type { ChartOptions } from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler,
  BarElement,
);

/* ─── extended types (todas las propiedades explícitas) ─── */
interface PqStats {
  id: string;
  nombre: string;
  estado: string;
  capacidad: number;
  tipo: string;
  bloque: string;
  celdasPq: {
    id: string;
    parqueaderoId: string;
    estado: string;
    nombre?: string;
    codigo?: string;
  }[];
  ocupadas: number;
  disponibles: number;
  reservadas: number;
  mant: number;
  pct: number;
}

/* ─── responsive ─── */
function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: width < 640, isTablet: width < 1024, width };
}

/* ─── tokens ─── */
const C = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  bg: "#F0F4ED",
  surface: "#FFFFFF",
  text: "#0F172A",
  textMuted: "#64748B",
  border: "#E8EDE4",
  greenLight: "#ECFDF5",
  greenText: "#166534",
  redLight: "#FEF2F2",
  redText: "#B91C1C",
  yellowLight: "#FFFBEB",
  yellowText: "#92400E",
  blueLight: "#EFF6FF",
  blueText: "#1D4ED8",
};

/* ─── Card ─── */
function Card({
  children,
  style = {},
  noPad,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  noPad?: boolean;
}) {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 20,
        padding: noPad ? 0 : "1rem 1.1rem",
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 8px rgba(15,23,42,.04)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── SectionTitle ─── */
function SectionTitle({
  icon: Icon,
  iconColor = C.primary,
  children,
  badge,
}: {
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "0.7rem",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${iconColor}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} color={iconColor} />
        </div>
        <h2 style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.text }}>
          {children}
        </h2>
      </div>
      {badge}
    </div>
  );
}

/* ─── KPI Pill ─── */
function KpiPill({
  label,
  value,
  sub,
  icon: Icon,
  color = C.primary,
  trend,
  dark,
}: {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color?: string;
  trend?: { value: number };
  dark?: boolean;
}) {
  const UpIcon = trend && trend.value >= 0 ? ArrowUpRight : ArrowDownRight;
  const trendColor = trend && trend.value >= 0 ? "#16a34a" : "#dc2626";
  return (
    <div
      style={{
        background: dark ? "rgba(255,255,255,.12)" : C.surface,
        border: dark
          ? "1px solid rgba(255,255,255,.15)"
          : `1px solid ${C.border}`,
        borderRadius: 16,
        padding: "0.75rem 0.85rem",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "transform .2s",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: dark ? "rgba(255,255,255,.15)" : `${color}12`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={17} color={dark ? "#fff" : color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: dark ? "rgba(255,255,255,.6)" : C.textMuted,
            }}
          >
            {label}
          </span>
          {trend && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: 10,
                fontWeight: 800,
                color: trendColor,
              }}
            >
              <UpIcon size={11} />
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1.1,
            color: dark ? "#fff" : C.text,
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 10,
              color: dark ? "rgba(255,255,255,.55)" : C.textMuted,
              fontWeight: 500,
              marginTop: 1,
            }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/* ─── MAIN DASHBOARD ─── */
/* ═══════════════════════════════════════ */
export function Dashboard() {
  const { parqueaderos, celdas, vehiculos, conductores, movimientos } =
    useData();
  const { isMobile, isTablet } = useBreakpoint();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  /* ── Cálculos ── */
  const totalCeldas = celdas.length;
  const celdasOcupadas = useMemo(
    () => celdas.filter((c) => c.estado === "no_disponible").length,
    [celdas],
  );
  const celdasDisponibles = useMemo(
    () => celdas.filter((c) => c.estado === "disponible").length,
    [celdas],
  );
  const celdasReservadas = useMemo(
    () => celdas.filter((c) => c.estado === "reservada").length,
    [celdas],
  );
  const celdasMantenimiento = useMemo(
    () => celdas.filter((c) => c.estado === "mantenimiento").length,
    [celdas],
  );
  const ocupacionPct =
    totalCeldas > 0 ? Math.round((celdasOcupadas / totalCeldas) * 100) : 0;

  const vehiculosActivos = useMemo(
    () => vehiculos.filter((v) => v.celdaId).length,
    [vehiculos],
  );
  const totalMotos = useMemo(
    () => vehiculos.filter((v) => v.tipo === "moto").length,
    [vehiculos],
  );
  const totalAutos = useMemo(
    () => vehiculos.filter((v) => v.tipo === "automovil").length,
    [vehiculos],
  );

  const entradasHoy = useMemo(
    () => movimientos.filter((m) => m.tipo === "entrada").length,
    [movimientos],
  );
  const salidasHoy = useMemo(
    () => movimientos.filter((m) => m.tipo === "salida").length,
    [movimientos],
  );

  const parqueaderosActivos = useMemo(
    () => parqueaderos.filter((p) => p.estado === "activo"),
    [parqueaderos],
  );
  const parqueaderosMantenimiento = useMemo(
    () => parqueaderos.filter((p) => p.estado === "mantenimiento"),
    [parqueaderos],
  );

  const conductoresDocentes = useMemo(
    () => conductores.filter((c) => c.tipo === "docente").length,
    [conductores],
  );
  const conductoresAdmin = useMemo(
    () => conductores.filter((c) => c.tipo === "administrativo").length,
    [conductores],
  );
  const conductoresVisitantes = useMemo(
    () => conductores.filter((c) => c.tipo === "visitante").length,
    [conductores],
  );

  /* Ocupación por parqueadero — con tipo explícito PqStats */
  const ocupacionPorPq: PqStats[] = useMemo(
    () =>
      parqueaderosActivos.map((p): PqStats => {
        const celdasPq = celdas.filter((c) => c.parqueaderoId === p.id);
        const ocupadas = celdasPq.filter(
          (c) => c.estado === "no_disponible",
        ).length;
        const disponibles = celdasPq.filter(
          (c) => c.estado === "disponible",
        ).length;
        const reservadas = celdasPq.filter(
          (c) => c.estado === "reservada",
        ).length;
        const mant = celdasPq.filter(
          (c) => c.estado === "mantenimiento",
        ).length;
        const pct =
          celdasPq.length > 0
            ? Math.round((ocupadas / celdasPq.length) * 100)
            : 0;
        return {
          id: p.id,
          nombre: p.nombre,
          estado: p.estado,
          capacidad: p.capacidad,
          tipo: p.tipo,
          bloque: p.bloque,
          celdasPq,
          ocupadas,
          disponibles,
          reservadas,
          mant,
          pct,
        };
      }),
    [parqueaderosActivos, celdas],
  );

  /* Alertas — memoizado */
  const alertas = useMemo((): {
    msg: string;
    sev: "critical" | "warning" | "info";
  }[] => {
    const a: { msg: string; sev: "critical" | "warning" | "info" }[] = [];
    for (const p of ocupacionPorPq) {
      const nombre = p.nombre || "Parqueadero";
      if (p.pct > 85)
        a.push({
          msg: `${nombre} al ${p.pct}% — casi lleno`,
          sev: "critical",
        });
      else if (p.pct > 70)
        a.push({
          msg: `${nombre} al ${p.pct}% — alta ocupación`,
          sev: "warning",
        });
    }
    if (parqueaderosMantenimiento.length > 0)
      a.push({
        msg: `${parqueaderosMantenimiento.length} parqueadero(s) en mantenimiento`,
        sev: "info",
      });
    if (celdasMantenimiento > 3)
      a.push({
        msg: `${celdasMantenimiento} celdas fuera de servicio`,
        sev: "warning",
      });
    if (totalCeldas > 0 && celdasDisponibles < 10)
      a.push({
        msg: "Quedan menos de 10 celdas disponibles en total",
        sev: "critical",
      });
    if (a.length === 0)
      a.push({
        msg: "Todos los parqueaderos operan con normalidad",
        sev: "info",
      });
    return a;
  }, [
    ocupacionPorPq,
    parqueaderosMantenimiento.length,
    celdasMantenimiento,
    celdasDisponibles,
    totalCeldas,
  ]);

  /* Movimientos recientes — memoizado y filtrado */
  const movimientosRecientes = useMemo(
    () =>
      [...movimientos]
        .filter((m) => m && m.fecha)
        .sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
        )
        .slice(0, 8),
    [movimientos],
  );

  /* ─── Charts ─── */
  const pieStatusData = {
    labels: ["Ocupadas", "Disponibles", "Reservadas", "Mant."],
    datasets: [
      {
        data: [
          celdasOcupadas,
          celdasDisponibles,
          celdasReservadas,
          celdasMantenimiento,
        ],
        backgroundColor: ["#39A900", "#2563EB", "#F59E0B", "#EF4444"],
        borderWidth: 0,
        borderRadius: 6,
        spacing: 2,
      },
    ],
  };

  const pieTipoData = {
    labels: ["Automóviles", "Motos"],
    datasets: [
      {
        data: [totalAutos, totalMotos],
        backgroundColor: ["#2563EB", "#F59E0B"],
        borderWidth: 0,
        borderRadius: 6,
        spacing: 2,
      },
    ],
  };

  const pieUsuarioData = {
    labels: ["Docentes", "Administrativos", "Visitantes"],
    datasets: [
      {
        data: [conductoresDocentes, conductoresAdmin, conductoresVisitantes],
        backgroundColor: ["#39A900", "#2563EB", "#8B5CF6"],
        borderWidth: 0,
        borderRadius: 6,
        spacing: 2,
      },
    ],
  };

  const barOcupacionData = {
    labels: parqueaderosActivos.map((p) =>
      (p.nombre || "PQ").toString().replace("PQ-", "PQ "),
    ),
    datasets: [
      {
        label: "Ocupadas",
        data: ocupacionPorPq.map((p) => p.ocupadas),
        backgroundColor: ocupacionPorPq.map((p) =>
          p.pct > 75 ? "#EF4444" : p.pct > 50 ? "#F59E0B" : "#39A900",
        ),
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: "Disponibles",
        data: ocupacionPorPq.map((p) => p.disponibles),
        backgroundColor: "#CBD5E1",
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  /* Pie options — ChartOptions<"pie"> (NO "doughnut", pie no soporta cutout) */
  const pieOpts: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#64748B",
          font: { size: 9 },
          padding: 6,
          usePointStyle: true,
          pointStyleWidth: 5,
        },
      },
    },
  };

  /* Bar options — ChartOptions<"bar"> con indexAxis "y" para barras horizontales */
  const barOpts: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#64748B",
          font: { size: 9 },
          padding: 8,
          usePointStyle: true,
          pointStyleWidth: 5,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: "#94A3B8", font: { size: 10 } },
        grid: { color: "rgba(0,0,0,.035)" },
      },
      y: {
        stacked: true,
        ticks: { color: "#64748B", font: { size: 9 } },
        grid: { display: false },
      },
    },
  };

  /* ── Layout ── */
  const gridCols = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1.3fr 1fr 0.9fr";
  const rowH = "1fr";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: ${C.bg}; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
      `}</style>

      <div
        style={{
          height: "100vh",
          background: C.bg,
          padding: isMobile ? "0.5rem" : "0.7rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.7rem",
          overflow: "hidden",
        }}
      >
        {/* ═══════════ HEADER ═══════════ */}
        <div
          style={{
            background: "linear-gradient(135deg, #39A900 0%, #1B6B00 100%)",
            borderRadius: 18,
            padding: isMobile ? "0.7rem 1rem" : "0.7rem 1.2rem",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "rgba(255,255,255,.05)",
              top: -50,
              right: -20,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,.04)",
              bottom: -40,
              left: 60,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <img
                src="https://www.sena.edu.co/Style%20Library/alayout/images/logoSena.png"
                alt="SENA"
                style={{
                  height: 32,
                  filter: "brightness(0) invert(1)",
                  objectFit: "contain",
                  flexShrink: 0,
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <div
                style={{
                  width: 1,
                  height: 28,
                  background: "rgba(255,255,255,.2)",
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <h1
                  style={{
                    margin: 0,
                    color: "#fff",
                    fontSize: isMobile ? "1rem" : "1.2rem",
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  Gestión de Parqueaderos
                </h1>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,.55)",
                    fontSize: 10,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Centro de monitoreo institucional ·{" "}
                  {now.toLocaleDateString("es-CO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  ·{" "}
                  {now.toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,.14)",
                  border: "1px solid rgba(255,255,255,.18)",
                }}
              >
                <BadgeCheck size={12} color="#fff" />
                <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>
                  OPERATIVO
                </span>
              </div>
              <div
                style={{
                  padding: "5px 14px",
                  borderRadius: 999,
                  background:
                    ocupacionPct > 80
                      ? "rgba(239,68,68,.2)"
                      : ocupacionPct > 60
                        ? "rgba(245,158,11,.2)"
                        : "rgba(255,255,255,.14)",
                  border: "1px solid rgba(255,255,255,.18)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,.6)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Ocupación
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {ocupacionPct}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ KPI ROW ═══════════ */}
        <div
          style={{
            display: "grid",
            flexShrink: 0,
            gridTemplateColumns: `repeat(${isMobile ? 3 : 6}, 1fr)`,
            gap: "0.5rem",
          }}
        >
          <KpiPill
            label="Celdas Totales"
            value={totalCeldas}
            sub={`${parqueaderos.length} parqueaderos`}
            icon={ParkingCircle}
            color="#39A900"
          />
          <KpiPill
            label="Ocupadas"
            value={celdasOcupadas}
            sub={`${ocupacionPct}% del total`}
            icon={Car}
            color="#2563EB"
            trend={{ value: 5 }}
          />
          <KpiPill
            label="Disponibles"
            value={celdasDisponibles}
            sub={`${celdasReservadas} reservadas`}
            icon={DoorOpen}
            color="#F59E0B"
          />
          <KpiPill
            label="Vehículos"
            value={vehiculosActivos}
            sub={`${totalAutos} autos · ${totalMotos} motos`}
            icon={Activity}
            color="#06B6D4"
          />
          <KpiPill
            label="Movimientos Hoy"
            value={entradasHoy + salidasHoy}
            sub={`${entradasHoy} entradas · ${salidasHoy} salidas`}
            icon={ArrowUpRight}
            color="#8B5CF6"
            trend={{ value: 8 }}
          />
          <KpiPill
            label="Conductores"
            value={conductores.length}
            sub={`${conductoresDocentes} docentes`}
            icon={Users}
            color="#EC4899"
          />
        </div>

        {/* ═══════════ BENTO GRID ═══════════ */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: gridCols,
            gridTemplateRows: `${rowH} ${rowH}`,
            gap: "0.7rem",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* ── 1: MAPA DE OCUPACIÓN (col 1, span 2 rows) ── */}
          <div style={{ gridRow: isTablet ? "auto" : "span 2", minHeight: 0 }}>
            <Card>
              <SectionTitle icon={Building2}>Mapa de Parqueaderos</SectionTitle>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  overflow: "auto",
                  minHeight: 0,
                }}
              >
                {ocupacionPorPq.length === 0 ? (
                  <div style={{ padding: "1rem", textAlign: "center", color: C.textMuted, fontSize: 12 }}>
                    Sin parqueaderos activos.
                  </div>
                ) : (
                  ocupacionPorPq.map((p) => {
                    const clr =
                      p.pct > 75 ? "#EF4444" : p.pct > 50 ? "#F59E0B" : "#39A900";
                    const tipoLower = (p.tipo || "general").toString().toLowerCase();
                    const isMoto = tipoLower.includes("moto");
                    const Icon = isMoto ? Bike : Car;
                    const tipoLabel = p.tipo ? p.tipo.toString() : "general";
                    return (
                      <div
                        key={p.id}
                        style={{
                          border: `1px solid ${C.border}`,
                          borderRadius: 14,
                          padding: "0.7rem 0.8rem",
                          background:
                            p.pct > 75
                              ? "#FEF2F2"
                              : p.pct > 50
                                ? "#FFFBEB"
                                : "#F7FAF5",
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 6,
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              flexWrap: "wrap",
                              minWidth: 0,
                            }}
                          >
                            <Icon size={13} color={clr} />
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                color: C.text,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {p.nombre || "Parqueadero"}
                            </span>
                            <span
                              style={{
                                fontSize: 8,
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: 6,
                                background: `${clr}18`,
                                color: clr,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                flexShrink: 0,
                              }}
                            >
                              {tipoLabel}
                            </span>
                            {p.mant > 0 && (
                              <span
                                style={{
                                  fontSize: 8,
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: 6,
                                  background: "#EF444418",
                                  color: "#B91C1C",
                                  flexShrink: 0,
                                }}
                              >
                                ⚠ {p.mant} mant.
                              </span>
                            )}
                          </div>
                          <span
                            style={{ fontSize: 16, fontWeight: 900, color: clr, flexShrink: 0 }}
                          >
                            {p.pct}%
                          </span>
                        </div>

                        <div
                          style={{
                            height: 6,
                            borderRadius: 999,
                            background: "#E8EDE4",
                            overflow: "hidden",
                            marginBottom: 6,
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(p.pct, 100)}%`,
                              height: "100%",
                              background: clr,
                              borderRadius: 999,
                              transition: "width .8s",
                            }}
                          />
                        </div>

                        {p.celdasPq.length > 0 && (
                          <div
                            style={{ display: "flex", gap: 2, flexWrap: "wrap" }}
                          >
                            {p.celdasPq.map((cell, idx) => {
                              const dotClr =
                                cell.estado === "no_disponible"
                                  ? "#39A900"
                                  : cell.estado === "disponible"
                                    ? "#CBD5E1"
                                    : cell.estado === "reservada"
                                      ? "#F59E0B"
                                      : "#EF4444";
                              const cellName = cell.nombre || cell.codigo || `C${idx + 1}`;
                              const cellEstado = (cell.estado || "").toString().replace("_", " ");
                              return (
                                <div
                                  key={cell.id ?? idx}
                                  title={`${cellName}: ${cellEstado}`}
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 2,
                                    background: dotClr,
                                    opacity: 0.85,
                                  }}
                                />
                              );
                            })}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                          <span
                            style={{
                              fontSize: 9,
                              color: C.textMuted,
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ color: "#39A900", fontWeight: 800 }}>
                              {p.ocupadas}
                            </span>{" "}
                            ocupadas
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              color: C.textMuted,
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ color: "#2563EB", fontWeight: 800 }}>
                              {p.disponibles}
                            </span>{" "}
                            libres
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              color: C.textMuted,
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ color: "#F59E0B", fontWeight: 800 }}>
                              {p.reservadas}
                            </span>{" "}
                            reserv.
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* ── 2: GRÁFICO BARRAS HORIZONTAL ── */}
          <div style={{ minHeight: 0 }}>
            <Card>
              <SectionTitle icon={BarChart3} iconColor="#2563EB">
                Ocupación por Parqueadero
              </SectionTitle>
              <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                {ocupacionPorPq.length === 0 ? (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontSize: 12 }}>
                    Sin datos
                  </div>
                ) : (
                  <Bar data={barOcupacionData} options={barOpts} />
                )}
              </div>
            </Card>
          </div>

          {/* ── 3: PIE STATUS + ALERTAS ── */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.7rem", minHeight: 0 }}
          >
            <Card style={{ flex: 1, minHeight: 0 }}>
              <SectionTitle icon={ParkingCircle}>Estado General</SectionTitle>
              <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                {totalCeldas === 0 ? (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontSize: 12 }}>
                    Sin datos
                  </div>
                ) : (
                  <Pie data={pieStatusData} options={pieOpts} />
                )}
              </div>
            </Card>
            <Card style={{ flex: 1, minHeight: 0 }}>
              <SectionTitle
                icon={AlertTriangle}
                iconColor={
                  alertas.some((a) => a.sev === "critical")
                    ? "#EF4444"
                    : "#F59E0B"
                }
                badge={
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: 9,
                      fontWeight: 700,
                      color: C.primary,
                    }}
                  >
                    <Clock3 size={9} /> EN VIVO
                  </span>
                }
              >
                Alertas
              </SectionTitle>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                  overflow: "auto",
                  minHeight: 0,
                }}
              >
                {alertas.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      background:
                        a.sev === "critical"
                          ? "#FEF2F2"
                          : a.sev === "warning"
                            ? "#FFFBEB"
                            : "#ECFDF5",
                      color:
                        a.sev === "critical"
                          ? "#B91C1C"
                          : a.sev === "warning"
                            ? "#92400E"
                            : "#166534",
                      padding: "0.45rem 0.6rem",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      flexShrink: 0,
                      borderLeft: `3px solid ${a.sev === "critical" ? "#EF4444" : a.sev === "warning" ? "#F59E0B" : "#22C55E"}`,
                    }}
                  >
                    <AlertTriangle size={10} />
                    {a.msg}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── 4: MOVIMIENTOS RECIENTES ── */}
          <div style={{ minHeight: 0 }}>
            <Card>
              <SectionTitle
                icon={Activity}
                iconColor="#06B6D4"
                badge={
                  <span
                    style={{ fontSize: 9, fontWeight: 700, color: C.textMuted }}
                  >
                    Hoy
                  </span>
                }
              >
                Movimientos del Día
              </SectionTitle>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                  overflow: "auto",
                  minHeight: 0,
                }}
              >
                {movimientosRecientes.length === 0 ? (
                  <div style={{ padding: "1rem", textAlign: "center", color: C.textMuted, fontSize: 12 }}>
                    Sin movimientos registrados.
                  </div>
                ) : (
                  movimientosRecientes.map((mov, idx) => {
                    const isEntrada = mov.tipo === "entrada";
                    let hora = "";
                    try {
                      hora = new Date(mov.fecha).toLocaleTimeString("es-CO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    } catch {
                      hora = "";
                    }
                    const pq = parqueaderos.find(
                      (p) => p.id === mov.parqueaderoId,
                    );
                    const pqNombre = (pq?.nombre || "").toString().replace("PQ-", "PQ ");
                    const pqBloque = (pq?.bloque || "").toString();
                    return (
                      <div
                        key={mov.id ?? idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "0.45rem 0.6rem",
                          borderRadius: 10,
                          background: "#F7FAF5",
                          border: `1px solid ${C.border}`,
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            flexShrink: 0,
                            background: isEntrada
                              ? "rgba(57,169,0,.1)"
                              : "rgba(100,116,139,.08)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isEntrada ? (
                            <DoorOpen size={12} color="#166534" />
                          ) : (
                            <DoorClosed size={12} color="#64748B" />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: C.text,
                                letterSpacing: 0.5,
                              }}
                            >
                              {mov.placa || "—"}
                            </span>
                            <span
                              style={{
                                fontSize: 8,
                                fontWeight: 800,
                                padding: "1px 5px",
                                borderRadius: 4,
                                background: isEntrada
                                  ? "rgba(57,169,0,.1)"
                                  : "rgba(239,68,68,.1)",
                                color: isEntrada ? "#166534" : "#B91C1C",
                                textTransform: "uppercase",
                              }}
                            >
                              {isEntrada ? "↑" : "↓"}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 9,
                              color: C.textMuted,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {mov.conductorNombre || "—"}{pqBloque && ` · ${pqBloque}`}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: C.text,
                            }}
                          >
                            {hora}
                          </div>
                          <div style={{ fontSize: 8, color: C.textMuted }}>
                            {pqNombre}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* ── 5: RESUMEN + PIE USUARIO + PIE TIPO ── */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.7rem", minHeight: 0 }}
          >
            <Card style={{ flexShrink: 0 }}>
              <SectionTitle icon={ShieldAlert} iconColor="#2563EB">
                Resumen Operativo
              </SectionTitle>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "0.4rem",
                }}
              >
                {[
                  {
                    l: "Parq. Activos",
                    v: parqueaderosActivos.length,
                    c: "#39A900",
                    i: Building2,
                  },
                  {
                    l: "En Mant.",
                    v: parqueaderosMantenimiento.length,
                    c: "#EF4444",
                    i: Zap,
                  },
                  { l: "Autos", v: totalAutos, c: "#2563EB", i: Car },
                  { l: "Motos", v: totalMotos, c: "#F59E0B", i: Bike },
                  { l: "Entradas", v: entradasHoy, c: "#06B6D4", i: DoorOpen },
                  { l: "Salidas", v: salidasHoy, c: "#8B5CF6", i: DoorClosed },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      background: "#F7FAF5",
                      border: `1px solid ${C.border}`,
                      borderRadius: 12,
                      padding: "0.5rem 0.6rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 7,
                        background: `${s.c}12`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <s.i size={12} color={s.c} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                          lineHeight: 1,
                          color: s.c,
                        }}
                      >
                        {s.v}
                      </div>
                      <div
                        style={{
                          fontSize: 8,
                          color: C.textMuted,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {s.l}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ flex: 1, minHeight: 0 }}>
              <SectionTitle icon={Users} iconColor="#8B5CF6">
                Por Tipo de Usuario
              </SectionTitle>
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <div style={{ minHeight: 0, position: "relative", height: "100%" }}>
                  {conductores.length === 0 ? (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontSize: 12 }}>
                      Sin datos
                    </div>
                  ) : (
                    <Pie data={pieUsuarioData} options={pieOpts} />
                  )}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {[
                    { l: "Docentes", v: conductoresDocentes, c: "#39A900" },
                    { l: "Admin.", v: conductoresAdmin, c: "#2563EB" },
                    { l: "Visitantes", v: conductoresVisitantes, c: "#8B5CF6" },
                  ].map((s) => (
                    <div
                      key={s.l}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "0.4rem 0.5rem",
                        borderRadius: 8,
                        background: "#F7FAF5",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 3,
                          background: s.c,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          color: C.textMuted,
                          fontWeight: 600,
                          flex: 1,
                        }}
                      >
                        {s.l}
                      </span>
                      <span
                        style={{ fontSize: 13, fontWeight: 900, color: s.c }}
                      >
                        {s.v}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      marginTop: 4,
                      padding: "0.4rem 0.5rem",
                      borderRadius: 8,
                      background: "#F7FAF5",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 8,
                        color: C.textMuted,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      Total Registrados
                    </div>
                    <div
                      style={{ fontSize: 18, fontWeight: 900, color: C.text }}
                    >
                      {conductores.length}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card style={{ flex: 1, minHeight: 0 }}>
              <SectionTitle icon={Car}>Tipo de Vehículo</SectionTitle>
              <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
                {vehiculos.length === 0 ? (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.textMuted, fontSize: 12 }}>
                    Sin datos
                  </div>
                ) : (
                  <Pie data={pieTipoData} options={pieOpts} />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
