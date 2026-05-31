import React, { useState, useEffect } from "react";

import {
  Car,
  ParkingCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  ShieldAlert,
  BadgeCheck,
  Clock3,
  Menu,
  X,
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
} from "chart.js";

import { Pie, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

/* ─── responsive hook ─── */
function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return { isMobile: width < 640, isTablet: width < 1024, width };
}

/* ─── tokens ─── */
const C = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  primaryGlow: "rgba(57,169,0,.18)",
  bg: "#EEF3EC",
  surface: "#FFFFFF",
  surfaceSoft: "#F7FAF5",
  text: "#111827",
  textMuted: "#6B7280",
  border: "rgba(15,23,42,.07)",
};

/* ─── StatCard ─── */
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = C.primary,
  progress = 50,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: React.ElementType;
  color?: string;
  progress?: number;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 24,
        padding: "1.25rem 1.4rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,.04)",
        transition: "box-shadow .2s,transform .2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 32px rgba(0,0,0,.09)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 24px rgba(0,0,0,.04)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* bg blob */}
      <div
        style={{
          position: "absolute",
          top: -36,
          right: -36,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: `${color}14`,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 2 }}>
        <div>
          <div
            style={{
              color: C.textMuted,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              lineHeight: 1,
              color: C.text,
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${color}28`,
            flexShrink: 0,
          }}
        >
          <Icon size={22} color={color} />
        </div>
      </div>

      <div style={{ marginTop: 10, color: C.textMuted, fontSize: 13 }}>{sub}</div>

      <div
        style={{
          marginTop: 12,
          height: 5,
          borderRadius: 999,
          background: "#E5E7EB",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(progress, 100)}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            borderRadius: 999,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Card wrapper ─── */
function Card({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: C.surface,
        borderRadius: 24,
        padding: "1.5rem",
        border: `1px solid ${C.border}`,
        boxShadow: "0 4px 20px rgba(0,0,0,.03)",
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
        marginBottom: "1.25rem",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon size={18} color={iconColor} />
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 900,
            color: C.text,
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: 0.3,
          }}
        >
          {children}
        </h2>
      </div>
      {badge}
    </div>
  );
}

/* ─── main Dashboard ─── */
export function Dashboard() {
  const { parqueaderos, celdas, vehiculos, conductores, controlesSalida, reservas } =
    useData();
  const { isMobile, isTablet } = useBreakpoint();

  const incidentes: any[] = [];

  const totalCeldas = celdas.length;
  const celdasOcupadas = celdas.filter((c) => c.estado === "no_disponible").length;
  const celdasDisponibles = celdas.filter((c) => c.estado === "disponible").length;
  const celdasReservadas = celdas.filter((c) => c.estado === "reservada").length;
  const celdasMantenimiento = celdas.filter((c) => c.estado === "mantenimiento").length;
  const ocupacionPorcentaje = totalCeldas > 0 ? (celdasOcupadas / totalCeldas) * 100 : 0;
  const vehiculosEnParqueadero = controlesSalida.filter(
    (c) => c.estado === "en_parqueadero"
  ).length;
  const movimientosRecientes = controlesSalida.slice(-5).reverse();

  const alertas: string[] = [];
  if (ocupacionPorcentaje > 80)
    alertas.push(`Alta ocupación (${ocupacionPorcentaje.toFixed(0)}%)`);
  if (celdasMantenimiento > 0)
    alertas.push(`${celdasMantenimiento} celdas en mantenimiento`);

  /* charts */
  const pieData = {
    labels: ["Disponibles", "Ocupadas", "Reservadas", "Mantenimiento"],
    datasets: [
      {
        data: [celdasDisponibles, celdasOcupadas, celdasReservadas, celdasMantenimiento],
        backgroundColor: ["#39A900", "#2563EB", "#F59E0B", "#EF4444"],
        borderWidth: 0,
        borderRadius: 8,
        spacing: 3,
      },
    ],
  };

  const lineData = {
    labels: parqueaderos.map((p) => p.nombre),
    datasets: [
      {
        label: "Celdas Ocupadas",
        data: parqueaderos.map(
          (p) =>
            celdas.filter((c) => c.parqueaderoId === p.id && c.estado === "no_disponible")
              .length
        ),
        borderColor: "#39A900",
        backgroundColor: "rgba(57,169,0,.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#39A900",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#4B5563",
          font: { family: "Barlow", size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#6B7280", font: { family: "Barlow" } },
        grid: { display: false },
      },
      y: {
        ticks: { color: "#6B7280", font: { family: "Barlow" } },
        grid: { color: "rgba(0,0,0,.04)" },
      },
    },
  };

  /* layout helpers */
  const mainGridCols = isTablet ? "1fr" : "1.3fr 1fr";
  const chartsGridCols = isMobile ? "1fr" : "1fr 1.15fr";
  const heroGridCols = isMobile ? "1fr" : "1.2fr 1fr";
  const heroMiniCols = isMobile ? "repeat(2,1fr)" : "repeat(2,1fr)";
  const operCols = isMobile ? "repeat(2,1fr)" : "repeat(2,1fr)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        padding: isMobile ? "1rem" : "1.5rem",
        fontFamily: "'Barlow', sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* ── HERO ── */}
      <div
        style={{
          background: "linear-gradient(135deg,#39A900 0%,#2D7D00 100%)",
          borderRadius: 32,
          padding: isMobile ? "1.5rem" : "2rem",
          position: "relative",
          overflow: "hidden",
          marginBottom: "1.75rem",
          boxShadow: "0 20px 48px rgba(57,169,0,.22)",
        }}
      >
        {/* decorative blobs */}
        <div
          style={{
            position: "absolute",
            right: -100,
            top: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -80,
            bottom: -80,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255,255,255,.05)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: heroGridCols,
            gap: isMobile ? "1.5rem" : "2rem",
            alignItems: "center",
          }}
        >
          {/* text */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,.16)",
                border: "1px solid rgba(255,255,255,.2)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: 1,
                marginBottom: "1rem",
              }}
            >
              <BadgeCheck size={13} />
              SISTEMA ACTIVO
            </div>

            <h1
              style={{
                margin: 0,
                color: "#fff",
                fontSize: isMobile ? "2.4rem" : "clamp(2.4rem,4vw,3.8rem)",
                lineHeight: 0.95,
                fontWeight: 900,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              Dashboard
              <br />
              Institucional
            </h1>

            <p
              style={{
                marginTop: "1rem",
                color: "rgba(255,255,255,.85)",
                maxWidth: 560,
                lineHeight: 1.65,
                fontSize: 14,
                marginBottom: 0,
              }}
            >
              Monitoreo avanzado de ocupación, accesos vehiculares, reservas y estado
              operativo de los parqueaderos.
            </p>
          </div>

          {/* mini stats grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: heroMiniCols,
              gap: "0.8rem",
            }}
          >
            {[
              { label: "Ocupación", value: `${ocupacionPorcentaje.toFixed(0)}%` },
              { label: "Vehículos", value: vehiculosEnParqueadero },
              { label: "Reservas", value: reservas.length },
              { label: "Alertas", value: alertas.length },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(255,255,255,.14)",
                  border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 20,
                  padding: isMobile ? "1rem" : "1.2rem",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  style={{
                    color: "rgba(255,255,255,.72)",
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    color: "#fff",
                    fontSize: isMobile ? "2rem" : "2.4rem",
                    fontWeight: 900,
                    lineHeight: 1,
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit,minmax(${isMobile ? "140px" : "200px"},1fr))`,
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        <StatCard
          label="Celdas Totales"
          value={totalCeldas}
          sub={`${parqueaderos.length} parqueaderos`}
          icon={ParkingCircle}
          progress={100}
        />
        <StatCard
          label="Ocupación"
          value={`${ocupacionPorcentaje.toFixed(1)}%`}
          sub={`${celdasOcupadas} ocupadas`}
          icon={TrendingUp}
          color="#2563EB"
          progress={ocupacionPorcentaje}
        />
        <StatCard
          label="Vehículos"
          value={vehiculos.length}
          sub={`${vehiculosEnParqueadero} activos`}
          icon={Car}
          color="#F59E0B"
          progress={70}
        />
        <StatCard
          label="Conductores"
          value={conductores.length}
          sub="Usuarios registrados"
          icon={Users}
          color="#8B5CF6"
          progress={85}
        />
      </div>

      {/* ── MAIN GRID ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: mainGridCols,
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {/* ── LEFT COLUMN ── */}
        <div style={{ display: "grid", gap: "1.25rem" }}>

          {/* ALERTAS */}
          <Card>
            <SectionTitle
              icon={AlertTriangle}
              iconColor="#EF4444"
              badge={
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.primary,
                  }}
                >
                  <Clock3 size={13} />
                  EN VIVO
                </span>
              }
            >
              Alertas
            </SectionTitle>

            {alertas.length === 0 ? (
              <div
                style={{
                  background: "#ECFDF3",
                  borderRadius: 14,
                  padding: "1rem 1.2rem",
                  color: "#166534",
                  fontWeight: 700,
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <BadgeCheck size={16} color="#16a34a" />
                No hay alertas activas
              </div>
            ) : (
              <div style={{ display: "grid", gap: ".7rem" }}>
                {alertas.map((alerta, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#FEF2F2",
                      color: "#B91C1C",
                      padding: "0.9rem 1.1rem",
                      borderRadius: 14,
                      fontWeight: 700,
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderLeft: "3px solid #EF4444",
                    }}
                  >
                    <AlertTriangle size={14} />
                    {alerta}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* CHARTS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: chartsGridCols,
              gap: "1.25rem",
            }}
          >
            {/* PIE */}
            <Card>
              <SectionTitle icon={ParkingCircle}>Estado de Celdas</SectionTitle>
              <div style={{ height: isMobile ? 220 : 260, position: "relative" }}>
                <Pie
                  data={pieData}
                  options={{ responsive: true, maintainAspectRatio: false, ...chartOptions.plugins ? { plugins: chartOptions.plugins } : {} }}
                />
              </div>
            </Card>

            {/* LINE */}
            <Card>
              <SectionTitle icon={TrendingUp} iconColor="#2563EB">
                Ocupación por Parqueadero
              </SectionTitle>
              <div style={{ height: isMobile ? 220 : 260, position: "relative" }}>
                <Line data={lineData} options={chartOptions as any} />
              </div>
            </Card>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: "grid", gap: "1.25rem" }}>

          {/* ACTIVIDAD */}
          <Card>
            <SectionTitle icon={Activity}>Actividad Reciente</SectionTitle>

            {movimientosRecientes.length === 0 ? (
              <div style={{ color: C.textMuted, fontSize: 14, padding: "0.5rem 0" }}>
                Sin movimientos recientes.
              </div>
            ) : (
              movimientosRecientes.map((mov: any) => (
                <div
                  key={mov.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.85rem 0",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: C.text, marginBottom: 2, fontSize: 14 }}>
                      {mov.placa}
                    </div>
                    <div style={{ color: C.textMuted, fontSize: 12 }}>
                      {mov.estado === "en_parqueadero"
                        ? "Entrada registrada"
                        : "Salida registrada"}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "5px 12px",
                      borderRadius: 999,
                      background:
                        mov.estado === "en_parqueadero"
                          ? "rgba(57,169,0,.12)"
                          : "rgba(245,158,11,.12)",
                      color:
                        mov.estado === "en_parqueadero" ? "#166534" : "#92400E",
                      fontWeight: 800,
                      fontSize: 10,
                      letterSpacing: 1,
                    }}
                  >
                    {mov.estado === "en_parqueadero" ? "ACTIVO" : "SALIDA"}
                  </span>
                </div>
              ))
            )}
          </Card>

          {/* CENTRO OPERATIVO */}
          <Card>
            <SectionTitle icon={ShieldAlert} iconColor="#2563EB">
              Centro Operativo
            </SectionTitle>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: operCols,
                gap: "0.9rem",
              }}
            >
              {[
                { label: "Reservas", value: reservas.length, color: "#39A900" },
                { label: "Incidentes", value: incidentes.length, color: "#EF4444" },
                {
                  label: "Activos",
                  value: parqueaderos.filter((p) => p.estado === "activo").length,
                  color: "#2563EB",
                },
                { label: "Disponibles", value: celdasDisponibles, color: "#F59E0B" },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: C.surfaceSoft,
                    border: `1px solid ${C.border}`,
                    borderRadius: 18,
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      color: C.textMuted,
                      marginBottom: 8,
                      fontSize: 10,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: item.color,
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}