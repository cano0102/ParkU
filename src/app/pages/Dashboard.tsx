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
  Title
);

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  primarySoft: "rgba(57,169,0,.12)",
  background: "#F4F7F2",
  surface: "#FFFFFF",
  surfaceSoft: "#F8FAF7",
  text: "#111827",
  textLight: "#6B7280",
  border: "rgba(15,23,42,.08)",
};

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = COLORS.primary,
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
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        padding: "1.1rem",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(57,169,0,.04)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `${color}10`,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: ".8rem",
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
              textTransform: "uppercase",
              letterSpacing: 1.5,
              marginBottom: 8,
            }}
          >
            {label}
          </div>

          <div
            style={{
              fontSize: 32,
              fontWeight: 900,
              color: COLORS.text,
              lineHeight: 1,
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
            borderRadius: 16,
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${color}25`,
          }}
        >
          <Icon size={24} color={color} />
        </div>
      </div>

      <div
        style={{
          color: COLORS.textLight,
          fontSize: 12,
          marginBottom: 12,
        }}
      >
        {sub}
      </div>

      <div
        style={{
          height: 5,
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

  if (incidentes.length > 0) {
    alertas.push(
      `${incidentes.length} incidentes registrados`
    );
  }

  const movimientosRecientes =
    controlesSalida.slice(-5).reverse();

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
        tension: 0.4,
        fill: true,
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
          color: "rgba(0,0,0,.05)",
        },
      },

      y: {
        ticks: {
          color: "#6B7280",
        },

        grid: {
          color: "rgba(0,0,0,.05)",
        },
      },
    },
  };

  return (
    <div
      style={{
        padding: "1.25rem",
        background: COLORS.background,
        minHeight: "100vh",
        color: COLORS.text,
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      {/* HERO */}

      <div
        style={{
          background:
            "linear-gradient(135deg,#39A900 0%,#2D7D00 100%)",
          borderRadius: 24,
          padding: "1.8rem 2rem",
          marginBottom: "1.5rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 15px 30px rgba(57,169,0,.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "2rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, minWidth: 320 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,.15)",
                border:
                  "1px solid rgba(255,255,255,.18)",
                marginBottom: "1rem",
                fontWeight: 700,
                color: "#fff",
                fontSize: 12,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              <BadgeCheck size={14} />
              Sistema Operativo Activo
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem,4vw,3.2rem)",
                lineHeight: 1,
                margin: 0,
                fontWeight: 900,
                color: "#fff",
                fontFamily:
                  "'Barlow Condensed', sans-serif",
              }}
            >
              Dashboard Institucional
            </h1>

            <p
              style={{
                marginTop: ".8rem",
                maxWidth: 700,
                lineHeight: 1.6,
                color: "rgba(255,255,255,.9)",
                fontSize: 14,
              }}
            >
              Monitoreo centralizado de
              parqueaderos, accesos y ocupación
              institucional SENA.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "1rem",
              minWidth: 500,
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
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background:
                    "rgba(255,255,255,.14)",
                  border:
                    "1px solid rgba(255,255,255,.18)",
                  borderRadius: 18,
                  padding: "1rem",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    color:
                      "rgba(255,255,255,.75)",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    color: "#fff",
                    fontSize: 30,
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
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
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
          value={`${ocupacionPorcentaje.toFixed(
            1
          )}%`}
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

      {/* CONTENT */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr .9fr",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        {/* LEFT */}

        <div
          style={{
            display: "grid",
            gap: "1rem",
          }}
        >
          {/* ALERTAS */}

          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 22,
              padding: "1.4rem",
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
                    fontSize: 20,
                    color: COLORS.text,
                    fontWeight: 800,
                  }}
                >
                  Alertas del Sistema
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  color: COLORS.primary,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <Clock3 size={14} />
                Tiempo real
              </div>
            </div>

            {alertas.length === 0 ? (
              <div
                style={{
                  background: "#ECFDF3",
                  border:
                    "1px solid rgba(57,169,0,.15)",
                  padding: "14px 16px",
                  borderRadius: 16,
                  color: "#166534",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                No hay alertas activas.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: ".75rem",
                }}
              >
                {alertas.map((alerta, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#FEF2F2",
                      border:
                        "1px solid rgba(239,68,68,.1)",
                      padding: "14px 16px",
                      borderRadius: 16,
                      color: "#B91C1C",
                      fontWeight: 600,
                      fontSize: 14,
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
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 22,
                padding: "1.4rem",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: "1rem",
                  fontSize: 20,
                  color: COLORS.text,
                  fontWeight: 800,
                }}
              >
                Estado de Celdas
              </h2>

              <Pie data={pieData} />
            </div>

            <div
              style={{
                background: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 22,
                padding: "1.4rem",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: "1rem",
                  fontSize: 20,
                  color: COLORS.text,
                  fontWeight: 800,
                }}
              >
                Ocupación por Parqueadero
              </h2>

              <Line
                data={lineData}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}

        <div
          style={{
            display: "grid",
            gap: "1rem",
          }}
        >
          {/* ACTIVIDAD */}

          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 22,
              padding: "1.4rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "1rem",
              }}
            >
              <Activity
                size={20}
                color={COLORS.primary}
              />

              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  color: COLORS.text,
                  fontWeight: 800,
                }}
              >
                Actividad Reciente
              </h2>
            </div>

            {movimientosRecientes.length === 0 ? (
              <div
                style={{
                  color: COLORS.textLight,
                  fontSize: 14,
                }}
              >
                No hay movimientos registrados
              </div>
            ) : (
              movimientosRecientes.map(
                (movimiento: any) => (
                  <div
                    key={movimiento.id}
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      padding: ".75rem 0",
                      borderBottom:
                        "1px solid rgba(0,0,0,.06)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: COLORS.text,
                          marginBottom: 4,
                        }}
                      >
                        {movimiento.placa}
                      </div>

                      <div
                        style={{
                          color:
                            COLORS.textLight,
                          fontSize: 12,
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
                        padding: "7px 12px",
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

                        fontSize: 11,

                        fontWeight: 800,
                      }}
                    >
                      {movimiento.estado ===
                      "en_parqueadero"
                        ? "ACTIVO"
                        : "SALIDA"}
                    </div>
                  </div>
                )
              )
            )}
          </div>

          {/* CENTRO OPERATIVO */}

          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 22,
              padding: "1.4rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "1rem",
              }}
            >
              <ShieldAlert
                size={20}
                color="#2563EB"
              />

              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  color: COLORS.text,
                  fontWeight: 800,
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
                  label: "Reservas activas",
                  value: reservas.length,
                  color: "#39A900",
                },

                {
                  label: "Incidentes",
                  value: incidentes.length,
                  color: "#EF4444",
                },

                {
                  label: "Parqueaderos activos",
                  value: parqueaderos.filter(
                    (p) => p.estado === "activo"
                  ).length,
                  color: "#2563EB",
                },

                {
                  label: "Celdas disponibles",
                  value: celdasDisponibles,
                  color: "#F59E0B",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background:
                      COLORS.surfaceSoft,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 18,
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      color: COLORS.textLight,
                      marginBottom: 10,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      fontWeight: 700,
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 900,
                      color: item.color,
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
      </div>
    </div>
  );
}