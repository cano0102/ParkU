import React from "react";

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

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  primarySoft: "rgba(57,169,0,.12)",
  background: "#EEF3EC",
  surface: "#FFFFFF",
  surfaceSoft: "#F7FAF5",
  text: "#111827",
  textLight: "#6B7280",
  border: "rgba(15,23,42,.06)",
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = COLORS.primary,
  progress = 50,
  rotate = "0deg",
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: React.ElementType;
  color?: string;
  progress?: number;
  rotate?: string;
}) {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 28,
        padding: "1.2rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 15px 35px rgba(0,0,0,.04)",
        transform: `rotate(${rotate})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 130,
          height: 130,
          borderRadius: "50%",
          background: `${color}12`,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div>
          <div
            style={{
              color: COLORS.textLight,
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
              fontSize: 40,
              fontWeight: 900,
              lineHeight: 1,
              color: COLORS.text,
              fontFamily: "'Barlow Condensed', sans-serif",
            }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${color}25`,
          }}
        >
          <Icon size={26} color={color} />
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          color: COLORS.textLight,
          fontSize: 13,
        }}
      >
        {sub}
      </div>

      <div
        style={{
          marginTop: 14,
          height: 6,
          borderRadius: 999,
          background: "#E5E7EB",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: color,
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}

export function Dashboard() {
  const {
    parqueaderos,
    celdas,
    vehiculos,
    conductores,
    controlesSalida,
    reservas,
  } = useData();

  const incidentes: any[] = [];

  const totalCeldas = celdas.length;

  const celdasOcupadas = celdas.filter(
    (c) => c.estado === "no_disponible"
  ).length;

  const celdasDisponibles = celdas.filter(
    (c) => c.estado === "disponible"
  ).length;

  const celdasReservadas = celdas.filter(
    (c) => c.estado === "reservada"
  ).length;

  const celdasMantenimiento = celdas.filter(
    (c) => c.estado === "mantenimiento"
  ).length;

  const ocupacionPorcentaje =
    totalCeldas > 0
      ? (celdasOcupadas / totalCeldas) * 100
      : 0;

  const vehiculosEnParqueadero =
    controlesSalida.filter(
      (c) => c.estado === "en_parqueadero"
    ).length;

  const movimientosRecientes =
    controlesSalida.slice(-5).reverse();

  const alertas = [];

  if (ocupacionPorcentaje > 80) {
    alertas.push(
      `Alta ocupación (${ocupacionPorcentaje.toFixed(0)}%)`
    );
  }

  if (celdasMantenimiento > 0) {
    alertas.push(
      `${celdasMantenimiento} celdas en mantenimiento`
    );
  }

  const pieData = {
    labels: [
      "Disponibles",
      "Ocupadas",
      "Reservadas",
      "Mantenimiento",
    ],

    datasets: [
      {
        data: [
          celdasDisponibles,
          celdasOcupadas,
          celdasReservadas,
          celdasMantenimiento,
        ],

        backgroundColor: [
          "#39A900",
          "#2563EB",
          "#F59E0B",
          "#EF4444",
        ],

        borderWidth: 0,
        borderRadius: 10,
        spacing: 4,
      },
    ],
  };

  const lineData = {
    labels: parqueaderos.map((p) => p.nombre),

    datasets: [
      {
        label: "Celdas Ocupadas",

        data: parqueaderos.map((parqueadero) => {
          return celdas.filter(
            (c) =>
              c.parqueaderoId === parqueadero.id &&
              c.estado === "no_disponible"
          ).length;
        }),

        borderColor: "#39A900",
        backgroundColor: "rgba(57,169,0,.12)",
        tension: 0.45,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#39A900",
      },
    ],
  };

  const chartOptions = {
    responsive: true,

    plugins: {
      legend: {
        labels: {
          color: "#4B5563",
          font: {
            family: "Barlow",
          },
        },
      },
    },

    scales: {
      x: {
        ticks: {
          color: "#6B7280",
        },

        grid: {
          display: false,
        },
      },

      y: {
        ticks: {
          color: "#6B7280",
        },

        grid: {
          color: "rgba(0,0,0,.04)",
        },
      },
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.background,
        padding: "1.5rem",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      {/* HERO */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#39A900 0%,#2D7D00 100%)",
          borderRadius: 40,
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
          marginBottom: "2rem",
          boxShadow: "0 25px 50px rgba(57,169,0,.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -100,
            top: -100,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(255,255,255,.08)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: -80,
            bottom: -80,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,.05)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: "1.2fr .9fr",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                borderRadius: 999,
                background: "rgba(255,255,255,.14)",
                border:
                  "1px solid rgba(255,255,255,.18)",
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                marginBottom: "1.2rem",
              }}
            >
              <BadgeCheck size={15} />
              SISTEMA ACTIVO
            </div>

            <h1
              style={{
                margin: 0,
                color: "#fff",
                fontSize: "clamp(2.6rem,5vw,4.2rem)",
                lineHeight: 0.95,
                fontWeight: 900,
                fontFamily:
                  "'Barlow Condensed', sans-serif",
              }}
            >
              Dashboard
              <br />
              Institucional
            </h1>

            <p
              style={{
                marginTop: "1rem",
                color: "rgba(255,255,255,.88)",
                maxWidth: 650,
                lineHeight: 1.7,
                fontSize: 15,
              }}
            >
              Monitoreo avanzado de ocupación,
              accesos vehiculares, reservas y
              estado operativo de los parqueaderos.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: "1rem",
            }}
          >
            {[
              {
                label: "Ocupación",
                value: `${ocupacionPorcentaje.toFixed(
                  0
                )}%`,
              },

              {
                label: "Vehículos",
                value: vehiculosEnParqueadero,
              },

              {
                label: "Reservas",
                value: reservas.length,
              },

              {
                label: "Alertas",
                value: alertas.length,
              },
            ].map((item, index) => (
              <div
                key={item.label}
                style={{
                  background:
                    "rgba(255,255,255,.14)",
                  border:
                    "1px solid rgba(255,255,255,.18)",
                  borderRadius:
                    index % 2 === 0
                      ? "32px 16px 32px 16px"
                      : "16px 32px 16px 32px",
                  padding: "1.2rem",
                  backdropFilter: "blur(10px)",
                  transform:
                    index % 2 === 0
                      ? "translateY(10px)"
                      : "translateY(-10px)",
                }}
              >
                <div
                  style={{
                    color:
                      "rgba(255,255,255,.75)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    color: "#fff",
                    fontSize: 38,
                    fontWeight: 900,
                    lineHeight: 1,
                    fontFamily:
                      "'Barlow Condensed', sans-serif",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(240px,1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          label="Celdas Totales"
          value={totalCeldas}
          sub={`${parqueaderos.length} parqueaderos`}
          icon={ParkingCircle}
          progress={100}
          rotate="-1deg"
        />

        <StatCard
          label="Ocupación"
          value={`${ocupacionPorcentaje.toFixed(
            1
          )}%`}
          sub={`${celdasOcupadas} ocupadas`}
          icon={TrendingUp}
          color="#2563EB"
          progress={ocupacionPorcentaje}
          rotate="1deg"
        />

        <StatCard
          label="Vehículos"
          value={vehiculos.length}
          sub={`${vehiculosEnParqueadero} activos`}
          icon={Car}
          color="#F59E0B"
          progress={70}
          rotate="-1deg"
        />

        <StatCard
          label="Conductores"
          value={conductores.length}
          sub="Usuarios registrados"
          icon={Users}
          color="#8B5CF6"
          progress={85}
          rotate="1deg"
        />
      </div>

      {/* MAIN GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr .9fr",
          gap: "1.4rem",
          alignItems: "start",
        }}
      >
        {/* LEFT */}

        <div
          style={{
            display: "grid",
            gap: "1.4rem",
          }}
        >
          {/* ALERTAS */}

          <div
            style={{
              background: COLORS.surface,
              borderRadius: "38px 18px 38px 18px",
              padding: "1.6rem",
              border: `1px solid ${COLORS.border}`,
              boxShadow: "0 15px 30px rgba(0,0,0,.03)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <AlertTriangle
                  size={20}
                  color="#EF4444"
                />

                <h2
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 900,
                    color: COLORS.text,
                  }}
                >
                  Alertas
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.primary,
                }}
              >
                <Clock3 size={14} />
                EN VIVO
              </div>
            </div>

            {alertas.length === 0 ? (
              <div
                style={{
                  background: "#ECFDF3",
                  borderRadius: 18,
                  padding: "1rem",
                  color: "#166534",
                  fontWeight: 700,
                }}
              >
                No hay alertas activas.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: ".8rem",
                }}
              >
                {alertas.map((alerta, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#FEF2F2",
                      color: "#B91C1C",
                      padding: "1rem",
                      borderRadius:
                        index % 2 === 0
                          ? "24px 12px 24px 12px"
                          : "12px 24px 12px 24px",
                      fontWeight: 700,
                    }}
                  >
                    {alerta}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CHARTS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "0.9fr 1.1fr",
              gap: "1.4rem",
            }}
          >
            {/* PIE */}

            <div
              style={{
                background: COLORS.surface,
                borderRadius: "42px 18px 42px 18px",
                padding: "1.6rem",
                border: `1px solid ${COLORS.border}`,
                minHeight: 420,
                transform: "rotate(-1deg)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: "1.2rem",
                  fontSize: 22,
                  fontWeight: 900,
                  color: COLORS.text,
                }}
              >
                Estado de Celdas
              </h2>

              <div
                style={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pie data={pieData} />
              </div>
            </div>

            {/* LINE */}

            <div
              style={{
                background: COLORS.surface,
                borderRadius: "18px 42px 18px 42px",
                padding: "1.6rem",
                border: `1px solid ${COLORS.border}`,
                minHeight: 420,
                transform: "rotate(1deg)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: "1.2rem",
                  fontSize: 22,
                  fontWeight: 900,
                  color: COLORS.text,
                }}
              >
                Ocupación por Parqueadero
              </h2>

              <div
                style={{
                  height: 300,
                }}
              >
                <Line
                  data={lineData}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div
          style={{
            display: "grid",
            gap: "1.4rem",
          }}
        >
          {/* ACTIVIDAD */}

          <div
            style={{
              background: COLORS.surface,
              borderRadius: "18px 42px 18px 42px",
              padding: "1.6rem",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "1.2rem",
              }}
            >
              <Activity
                size={20}
                color={COLORS.primary}
              />

              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                Actividad Reciente
              </h2>
            </div>

            {movimientosRecientes.map(
              (movimiento: any, index) => (
                <div
                  key={movimiento.id}
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    padding: "1rem 0",
                    borderBottom:
                      "1px solid rgba(0,0,0,.05)",
                    transform:
                      index % 2 === 0
                        ? "translateX(4px)"
                        : "translateX(-4px)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 900,
                        color: COLORS.text,
                        marginBottom: 4,
                      }}
                    >
                      {movimiento.placa}
                    </div>

                    <div
                      style={{
                        color: COLORS.textLight,
                        fontSize: 13,
                      }}
                    >
                      {movimiento.estado ===
                      "en_parqueadero"
                        ? "Entrada registrada"
                        : "Salida registrada"}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "8px 14px",
                      borderRadius: 999,
                      background:
                        movimiento.estado ===
                        "en_parqueadero"
                          ? "rgba(57,169,0,.12)"
                          : "rgba(245,158,11,.12)",

                      color:
                        movimiento.estado ===
                        "en_parqueadero"
                          ? "#166534"
                          : "#92400E",

                      fontWeight: 800,
                      fontSize: 11,
                    }}
                  >
                    {movimiento.estado ===
                    "en_parqueadero"
                      ? "ACTIVO"
                      : "SALIDA"}
                  </div>
                </div>
              )
            )}
          </div>

          {/* CENTRO */}

          <div
            style={{
              background: COLORS.surface,
              borderRadius: "42px 18px 42px 18px",
              padding: "1.6rem",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "1.2rem",
              }}
            >
              <ShieldAlert
                size={20}
                color="#2563EB"
              />

              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                Centro Operativo
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              {[
                {
                  label: "Reservas",
                  value: reservas.length,
                  color: "#39A900",
                },

                {
                  label: "Incidentes",
                  value: incidentes.length,
                  color: "#EF4444",
                },

                {
                  label: "Activos",
                  value: parqueaderos.filter(
                    (p) => p.estado === "activo"
                  ).length,
                  color: "#2563EB",
                },

                {
                  label: "Disponibles",
                  value: celdasDisponibles,
                  color: "#F59E0B",
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  style={{
                    background:
                      COLORS.surfaceSoft,
                    border:
                      `1px solid ${COLORS.border}`,
                    borderRadius:
                      index % 2 === 0
                        ? "26px 12px 26px 12px"
                        : "12px 26px 12px 26px",
                    padding: "1rem",
                    transform:
                      index % 2 === 0
                        ? "translateY(6px)"
                        : "translateY(-6px)",
                  }}
                >
                  <div
                    style={{
                      color: COLORS.textLight,
                      marginBottom: 10,
                      fontSize: 11,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    style={{
                      fontSize: 42,
                      fontWeight: 900,
                      lineHeight: 1,
                      color: item.color,
                      fontFamily:
                        "'Barlow Condensed', sans-serif",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}