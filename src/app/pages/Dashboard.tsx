import React from 'react';
import { Car, ParkingCircle, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

const SENA_GREEN = '#009e3d';

function StatCard({ label, value, sub, icon: Icon, color = SENA_GREEN }: {
  label: string; value: number | string; sub: string;
  icon: React.ElementType; color?: string;
}) {
  return (
    <div style={{
      background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
      borderTop: `2px solid ${color}`, borderRadius: 4, padding: '1.25rem 1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: 2, textTransform: 'uppercase' }}>
          {label}
        </span>
        <Icon size={16} color={color} style={{ opacity: 0.7 }} />
      </div>
      <div style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 900, fontSize: 42, color: '#fff', lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#444', marginTop: 6 }}>{sub}</div>
    </div>
  );
}

function ProgressBar({ value, color = SENA_GREEN }: { value: number; color?: string }) {
  return (
    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${value}%`, background: color,
        borderRadius: 2, transition: 'width 0.3s ease',
      }} />
    </div>
  );
}

export function Dashboard() {
  const { parqueaderos, celdas, vehiculos, conductores, controlesSalida } = useData();

  const totalCeldas = celdas.length;
  const celdasOcupadas = celdas.filter(c => c.estado === 'ocupada').length;
  const celdasDisponibles = celdas.filter(c => c.estado === 'disponible').length;
  const celdasReservadas = celdas.filter(c => c.estado === 'reservada').length;
  const celdasMantenimiento = celdas.filter(c => c.estado === 'mantenimiento').length;
  const ocupacionPorcentaje = totalCeldas > 0 ? (celdasOcupadas / totalCeldas) * 100 : 0;

  const celdasCarros = celdas.filter(c => c.tipo === 'carro');
  const celdasMotos = celdas.filter(c => c.tipo === 'moto');
  const celdasMR = celdas.filter(c => c.tipo === 'movilidad reducida');

  const carrosOcupados = celdasCarros.filter(c => c.estado === 'ocupada').length;
  const motosOcupadas = celdasMotos.filter(c => c.estado === 'ocupada').length;
  const mrOcupada = celdasMR.filter(c => c.estado === 'ocupada').length;

  const vehiculosEnParqueadero = controlesSalida.filter(c => c.estado === 'en_parqueadero').length;

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: SENA_GREEN, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>
          Vista General
        </div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 900, fontSize: 36, color: '#fff',
          textTransform: 'uppercase', letterSpacing: -0.5, lineHeight: 1, margin: 0,
        }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: '#444', marginTop: 6 }}>
          Sistema de Gestión de Parqueadero SENA
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Celdas Totales" value={totalCeldas} sub={`En ${parqueaderos.length} parqueaderos`} icon={ParkingCircle} color={SENA_GREEN} />
        <StatCard label="Ocupación Actual" value={celdasOcupadas} sub={`${ocupacionPorcentaje.toFixed(1)}% del total`} icon={TrendingUp} color="#5ba8ff" />
        <StatCard label="Vehículos" value={vehiculos.length} sub={`${vehiculosEnParqueadero} en parqueadero ahora`} icon={Car} color="#ffaa00" />
        <StatCard label="Conductores" value={conductores.length} sub="Usuarios registrados" icon={Users} color="#a78bfa" />
      </div>

      {/* Status + Type grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>

        {/* Estado general */}
        <div style={{
          background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 4, padding: '1.5rem',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            Estado del Parqueadero
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#888' }}>Ocupación General</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}>
                {ocupacionPorcentaje.toFixed(1)}%
              </span>
            </div>
            <ProgressBar value={ocupacionPorcentaje} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Disponibles', value: celdasDisponibles, color: '#4ddb8a' },
              { label: 'Ocupadas', value: celdasOcupadas, color: '#5ba8ff' },
              { label: 'Reservadas', value: celdasReservadas, color: '#ffaa00' },
              { label: 'Mantenimiento', value: celdasMantenimiento, color: '#ff6b6b' },
            ].map(item => (
              <div key={item.label} style={{
                padding: '12px', borderRadius: 4,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderLeft: `2px solid ${item.color}`,
              }}>
                <div style={{ fontSize: 10, color: '#555', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: 28, color: item.color, lineHeight: 1,
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Por tipo */}
        <div style={{
          background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 4, padding: '1.5rem',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            Ocupación por Tipo
          </div>

          {[
            { label: '🚗  Carros', ocupados: carrosOcupados, total: celdasCarros.length, color: SENA_GREEN },
            { label: '🏍️  Motos', ocupados: motosOcupadas, total: celdasMotos.length, color: '#ffaa00' },
            { label: '♿  Movilidad Reducida', ocupados: mrOcupada, total: celdasMR.length, color: '#5ba8ff' },
          ].map(item => {
            const pct = item.total > 0 ? (item.ocupados / item.total) * 100 : 0;
            return (
              <div key={item.label} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#aaa' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color, fontFamily: "'Barlow Condensed', sans-serif" }}>
                    {item.ocupados}/{item.total}
                  </span>
                </div>
                <ProgressBar value={pct} color={item.color} />
                <div style={{ fontSize: 10, color: '#444', marginTop: 4 }}>{pct.toFixed(1)}% ocupado</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parqueaderos table */}
      <div style={{
        background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 4, padding: '1.5rem',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
          Parqueaderos Activos
        </div>

        {parqueaderos.filter(p => p.estado === 'activo').map((parqueadero) => {
          const celdasParq = celdas.filter(c => c.parqueaderoId === parqueadero.id);
          const ocupadasParq = celdasParq.filter(c => c.estado === 'ocupada').length;
          const pct = celdasParq.length > 0 ? (ocupadasParq / celdasParq.length) * 100 : 0;

          return (
            <div key={parqueadero.id} style={{
              display: 'flex', alignItems: 'center', gap: '1.5rem',
              padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{
                width: 32, height: 32, background: 'rgba(0,158,61,0.15)',
                border: '1px solid rgba(0,158,61,0.3)', borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ParkingCircle size={14} color={SENA_GREEN} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e8e8e8' }}>{parqueadero.nombre}</div>
                    <div style={{ fontSize: 11, color: '#444' }}>{parqueadero.direccion}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {ocupadasParq}/{celdasParq.length}
                    </div>
                    <div style={{ fontSize: 10, color: '#444' }}>celdas</div>
                  </div>
                </div>
                <ProgressBar value={pct} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: '#444' }}>
                    Horario: {parqueadero.horaInicio} — {parqueadero.horaFin}
                  </span>
                  <span style={{ fontSize: 10, color: pct > 80 ? '#ff6b6b' : SENA_GREEN, fontWeight: 700 }}>
                    {pct.toFixed(0)}% ocupado
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}