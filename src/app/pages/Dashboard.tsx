import React from 'react';

import {
  Car,
  ParkingCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  Activity,
  ShieldAlert,
} from 'lucide-react';

import { useData } from '../context/DataContext';

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
} from 'chart.js';

import { Pie, Line } from 'react-chartjs-2';

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

const SENA_GREEN = '#009e3d';

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = SENA_GREEN,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div
      style={{
        background: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.06)',
        borderTop: `2px solid ${color}`,
        borderRadius: 8,
        padding: '1.25rem 1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#555',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>

        <Icon size={16} color={color} />
      </div>

      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900,
          fontSize: 42,
          color: '#fff',
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      <div style={{ fontSize: 11, color: '#444', marginTop: 6 }}>
        {sub}
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
    (c) => c.estado === 'no_disponible'
  ).length;

  const celdasDisponibles = celdas.filter(
    (c) => c.estado === 'disponible'
  ).length;

  const celdasReservadas = celdas.filter(
    (c) => c.estado === 'reservada'
  ).length;

  const celdasMantenimiento = celdas.filter(
    (c) => c.estado === 'mantenimiento'
  ).length;

  const ocupacionPorcentaje =
    totalCeldas > 0
      ? (celdasOcupadas / totalCeldas) * 100
      : 0;

  const vehiculosEnParqueadero = controlesSalida.filter(
    (c) => c.estado === 'en_parqueadero'
  ).length;

  // =========================
  // ALERTAS
  // =========================

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

  if (incidentes?.length > 0) {
    alertas.push(
      `${incidentes.length} incidentes registrados`
    );
  }

  // =========================
  // GRAFICO TORTA
  // =========================

  const pieData = {
    labels: [
      'Disponibles',
      'Ocupadas',
      'Reservadas',
      'Mantenimiento',
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
          '#4ddb8a',
          '#5ba8ff',
          '#ffaa00',
          '#ff6b6b',
        ],
        borderWidth: 0,
      },
    ],
  };

  // =========================
  // GRAFICO LINEAS
  // =========================

  const lineData = {
    labels: parqueaderos.map((p) => p.nombre),
    datasets: [
      {
        label: 'Celdas Ocupadas',
        data: parqueaderos.map((parqueadero) => {
          return celdas.filter(
            (c) =>
              c.parqueaderoId === parqueadero.id &&
              c.estado === 'no_disponible'
          ).length;
        }),
        borderColor: '#009e3d',
        backgroundColor: 'rgba(0,158,61,0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#aaa',
        },
        grid: {
          color: 'rgba(255,255,255,0.05)',
        },
      },
      y: {
        ticks: {
          color: '#aaa',
        },
        grid: {
          color: 'rgba(255,255,255,0.05)',
        },
      },
    },
  };

  // =========================
  // ACTIVIDAD RECIENTE
  // =========================

  const movimientosRecientes = controlesSalida
    .slice(-5)
    .reverse();

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif" }}>
      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: SENA_GREEN,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Vista General
        </div>

        <h1
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: 36,
            color: '#fff',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Dashboard Administrativo
        </h1>

        <p
          style={{
            fontSize: 13,
            color: '#444',
            marginTop: 6,
          }}
        >
          Sistema Inteligente de Gestión de Parqueaderos
        </p>
      </div>

      {/* KPI */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          label="Celdas Totales"
          value={totalCeldas}
          sub={`En ${parqueaderos.length} parqueaderos`}
          icon={ParkingCircle}
        />

        <StatCard
          label="Ocupación"
          value={`${ocupacionPorcentaje.toFixed(1)}%`}
          sub={`${celdasOcupadas} ocupadas`}
          icon={TrendingUp}
          color="#5ba8ff"
        />

        <StatCard
          label="Vehículos"
          value={vehiculos.length}
          sub={`${vehiculosEnParqueadero} activos`}
          icon={Car}
          color="#ffaa00"
        />

        <StatCard
          label="Conductores"
          value={conductores.length}
          sub="Usuarios registrados"
          icon={Users}
          color="#a78bfa"
        />
      </div>

      {/* ALERTAS */}
      <div
        style={{
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.06)',
          borderLeft: '3px solid #ff6b6b',
          borderRadius: 8,
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: '1rem',
          }}
        >
          <AlertTriangle size={18} color="#ff6b6b" />

          <h2
            style={{
              color: '#fff',
              fontSize: 18,
              margin: 0,
            }}
          >
            Alertas del Sistema
          </h2>
        </div>

        {alertas.length === 0 ? (
          <p style={{ color: '#4ddb8a', fontSize: 13 }}>
            No hay alertas activas
          </p>
        ) : (
          alertas.map((alerta, index) => (
            <div
              key={index}
              style={{
                padding: '0.75rem',
                background: 'rgba(255,107,107,0.08)',
                border: '1px solid rgba(255,107,107,0.2)',
                borderRadius: 6,
                marginBottom: '0.75rem',
                color: '#ffb3b3',
                fontSize: 13,
              }}
            >
              {alerta}
            </div>
          ))
        )}
      </div>

      {/* GRAFICOS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* TORTA */}
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '1.5rem',
          }}
        >
          <h2
            style={{
              color: '#fff',
              marginBottom: '1rem',
              fontSize: 18,
            }}
          >
            Estado de las Celdas
          </h2>

          <Pie data={pieData} />
        </div>

        {/* LINEAS */}
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '1.5rem',
          }}
        >
          <h2
            style={{
              color: '#fff',
              marginBottom: '1rem',
              fontSize: 18,
            }}
          >
            Ocupación por Parqueadero
          </h2>

          <Line data={lineData} options={chartOptions} />
        </div>
      </div>

      {/* ACTIVIDAD RECIENTE + RESUMEN */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '1.5rem',
        }}
      >
        {/* MOVIMIENTOS */}
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: '1rem',
            }}
          >
            <Activity size={18} color={SENA_GREEN} />

            <h2
              style={{
                color: '#fff',
                fontSize: 18,
                margin: 0,
              }}
            >
              Actividad Reciente
            </h2>
          </div>

          {movimientosRecientes.length === 0 ? (
            <p style={{ color: '#666', fontSize: 13 }}>
              No hay movimientos registrados
            </p>
          ) : (
            movimientosRecientes.map((movimiento: any) => (
              <div
                key={movimiento.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '1rem 0',
                  borderBottom:
                    '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {movimiento.placa}
                  </div>

                  <div
                    style={{
                      color: '#666',
                      fontSize: 11,
                    }}
                  >
                    {movimiento.estado === 'en_parqueadero'
                      ? 'Entrada registrada'
                      : 'Salida registrada'}
                  </div>
                </div>

                <div
                  style={{
                    color:
                      movimiento.estado === 'en_parqueadero'
                        ? '#4ddb8a'
                        : '#ffaa00',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {movimiento.estado === 'en_parqueadero'
                    ? 'ACTIVO'
                    : 'SALIDA'}
                </div>
              </div>
            ))
          )}
        </div>

        {/* RESUMEN */}
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: '1rem',
            }}
          >
            <ShieldAlert size={18} color="#5ba8ff" />

            <h2
              style={{
                color: '#fff',
                fontSize: 18,
                margin: 0,
              }}
            >
              Resumen Operativo
            </h2>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#666', fontSize: 11 }}>
              Reservas activas
            </div>

            <div
              style={{
                color: '#fff',
                fontSize: 28,
                fontWeight: 900,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              {reservas?.length || 0}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ color: '#666', fontSize: 11 }}>
              Incidentes registrados
            </div>

            <div
              style={{
                color: '#ff6b6b',
                fontSize: 28,
                fontWeight: 900,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              {incidentes?.length || 0}
            </div>
          </div>

          <div>
            <div style={{ color: '#666', fontSize: 11 }}>
              Parqueaderos activos
            </div>

            <div
              style={{
                color: SENA_GREEN,
                fontSize: 28,
                fontWeight: 900,
                fontFamily: "'Barlow Condensed', sans-serif",
              }}
            >
              {
                parqueaderos.filter(
                  (p) => p.estado === 'activo'
                ).length
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}