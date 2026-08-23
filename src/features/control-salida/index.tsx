import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ArrowLeftRight,
  Search,
  LogIn,
  LogOut as LogOutIcon,
  Car,
  MapPin,
  X,
  Clock,
  User,
  ParkingCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useControlSalida, useRemoveControlSalida } from '@/services/hooks/useControlSalida';
import type { ControlSalida } from '@/services/controlSalida';
import { useVehiculos } from '@/services/hooks/useVehiculos';
import { useCeldas } from '@/services/hooks/useCeldas';
import { useConductores } from '@/services/hooks/useConductores';
import { useUsuarios } from '@/services/hooks/useUsuarios';
import { useParqueaderos } from '@/services/hooks/useParqueaderos';
import { theme } from '@/theme';
import { ConfirmDialog } from '@/components/shared';

const COLORS = theme;
const PAGE_SIZE = 8;

function isSameDay(dateStr: string, ref: Date) {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export function ControlSalidaPage() {
  const { data: controlesSalida = [] } = useControlSalida();
  const { data: vehiculos = [] } = useVehiculos();
  const { data: celdas = [] } = useCeldas();
  const { data: conductores = [] } = useConductores();
  const { data: usuarios = [] } = useUsuarios();
  const { data: parqueaderos = [] } = useParqueaderos();
  const removeControlSalidaMutation = useRemoveControlSalida();
  const deleteControlSalida = useCallback(
    (id: string) => removeControlSalidaMutation.mutate(id),
    [removeControlSalidaMutation]
  );

  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'en_parqueadero' | 'finalizado'>('todos');
  const [filterParqueadero, setFilterParqueadero] = useState<string>('todos');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<ControlSalida | null>(null);

  const getVehiculo = useCallback((vehiculoId: string) => vehiculos.find((v) => v.id === vehiculoId), [vehiculos]);
  const getCelda = useCallback((celdaId: string) => celdas.find((c) => c.id === celdaId), [celdas]);
  const getParqueadero = useCallback((parqueaderoId: string) => parqueaderos.find((p) => p.id === parqueaderoId), [parqueaderos]);

  const getConductorVehiculo = useCallback(
    (vehiculoId: string) => {
      const vehiculo = getVehiculo(vehiculoId);
      if (!vehiculo) return null;
      return conductores.find((c) => c.id === vehiculo.conductorId);
    },
    [vehiculos, conductores, getVehiculo]
  );

  const getUsuarioConductor = useCallback(
    (vehiculoId: string) => {
      const conductor = getConductorVehiculo(vehiculoId);
      if (!conductor) return null;
      return usuarios.find((u) => u.id === conductor.usuarioId);
    },
    [conductores, usuarios, getConductorVehiculo]
  );

  // Celdas disponibles (sin filtrar por tipo)
  const celdasDisponibles = useMemo(
    () => celdas.filter((c) => c.estado === 'disponible'),
    [celdas]
  );

  const vehiculosEnParqueadero = useMemo(
    () => controlesSalida.filter((c) => c.estado === 'en_parqueadero'),
    [controlesSalida]
  );

  const vehiculosSalidos = useMemo(
    () => controlesSalida.filter((c) => c.estado === 'finalizado'),
    [controlesSalida]
  );

  const filteredControles = useMemo(
    () =>
      controlesSalida
        .filter((control) => {
          const vehiculo = getVehiculo(control.vehiculoId);
          const celda = getCelda(control.celdaId);
          const usuario = getUsuarioConductor(control.vehiculoId);
          const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;

          const q = search.toLowerCase();
          const matchesSearch =
            vehiculo?.placa.toLowerCase().includes(q) ||
            celda?.numero.toLowerCase().includes(q) ||
            usuario?.nombre.toLowerCase().includes(q) ||
            usuario?.identificacion.includes(q) ||
            vehiculo?.marca.toLowerCase().includes(q) ||
            vehiculo?.modelo.toLowerCase().includes(q);
          const matchesEstado = filterEstado === 'todos' ? true : control.estado === filterEstado;
          const matchesParqueadero =
            filterParqueadero === 'todos' ? true : parqueadero?.id === filterParqueadero;
          return matchesSearch && matchesEstado && matchesParqueadero;
        })
        .sort((a, b) => new Date(b.fechaEntrada).getTime() - new Date(a.fechaEntrada).getTime()),
    [controlesSalida, search, filterEstado, filterParqueadero, getVehiculo, getCelda, getUsuarioConductor, getParqueadero]
  );

  useEffect(() => {
    setPage(1);
  }, [search, filterEstado, filterParqueadero]);

  const totalPages = Math.max(1, Math.ceil(filteredControles.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedControles = useMemo(
    () => filteredControles.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredControles, currentPage]
  );

  const handleDelete = useCallback((control: ControlSalida) => {
    setConfirmDelete(control);
  }, []);

  const confirmDeleteAction = useCallback(() => {
    if (!confirmDelete) return;
    deleteControlSalida(confirmDelete.id);
    toast.success('Registro eliminado correctamente');
    setConfirmDelete(null);
  }, [confirmDelete, deleteControlSalida]);

  const formatDateTime = useCallback((dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }, []);

  const getTiempoEstadia = useCallback((fechaEntrada: string, fechaSalida?: string) => {
    const entrada = new Date(fechaEntrada);
    const salida = fechaSalida ? new Date(fechaSalida) : new Date();
    const diffMs = salida.getTime() - entrada.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMin}min`;
    }
    return `${diffMin}min`;
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .control-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        .control-row{
          transition: all 0.15s ease;
          border-bottom: 1px solid ${COLORS.border};
        }
        .control-row:hover{
          background: #F8FAF8;
          transform: scale(1.001);
        }
        .action-btn{
          transition: all 0.15s ease;
          border-radius: 8px;
          padding: 6px 12px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
        }
        .action-btn:hover{
          transform: scale(1.02);
        }
        input:focus,textarea:focus,select:focus{
          outline:none;
          border-color:${COLORS.primary} !important;
          box-shadow:0 0 0 3px rgba(57,169,0,.12);
        }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .status-badge.active {
          background: ${COLORS.infoBg};
          color: ${COLORS.info};
        }
        .status-badge.completed {
          background: ${COLORS.successBg};
          color: ${COLORS.success};
        }
        .hero-banner {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
          justify-content: space-between;
        }
        .hero-stats {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 8px;
          min-width: 280px;
        }
        .toolbar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .toolbar-search {
          flex: 1;
          position: relative;
          min-width: 200px;
        }
        .table-header {
          display: grid;
          background: #F8FAF8;
          border-bottom: 2px solid ${COLORS.border};
          padding: 12px 16px;
          font-size: 10px;
          font-weight: 800;
          color: ${COLORS.textLight};
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .table-row {
          display: grid;
          padding: 14px 16px;
          align-items: center;
          font-size: 12px;
        }
        .cell-label {
          display: none;
        }

        @media (max-width: 1024px) {
          .table-header, .table-row {
            grid-template-columns: minmax(140px,1fr) minmax(140px,1fr) 80px minmax(140px,1fr) 150px 150px 90px 110px !important;
            gap: 8px;
          }
        }

        @media (max-width: 768px) {
          .hero-banner {
            flex-direction: column;
            align-items: stretch;
          }
          .hero-stats {
            grid-template-columns: repeat(2,1fr);
            min-width: 0;
            width: 100%;
          }
          .toolbar-search {
            min-width: 100%;
            order: 1;
          }
          .toolbar select {
            flex: 1;
            min-width: 140px;
            order: 2;
          }
          .toolbar > button {
            flex: 1;
            justify-content: center;
            order: 3;
          }
          .table-header, .table-row {
            grid-template-columns: 1fr !important;
            gap: 10px;
            padding: 14px 16px;
          }
          .table-header {
            display: none;
          }
          .table-row {
            border-bottom: none;
            background: #fff;
            border: 1px solid ${COLORS.border};
            border-radius: 14px;
            margin: 0 12px 10px 12px;
            box-shadow: 0 1px 4px rgba(15,23,42,.04);
          }
          .control-row:hover {
            transform: none;
          }
          .cell-label {
            display: block;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: ${COLORS.textMuted};
            margin-bottom: 3px;
          }
          .table-row > div {
            display: flex;
            flex-direction: column;
            align-items: flex-start !important;
          }
          .table-row > div:last-child {
            flex-direction: row;
            align-items: center !important;
            justify-content: flex-end !important;
            padding-top: 6px;
            border-top: 1px dashed ${COLORS.border};
            margin-top: 4px;
          }
        }

        @media (max-width: 480px) {
          .hero-stats {
            grid-template-columns: repeat(2,1fr);
          }
        }
      `}</style>

      <div className="control-root" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 20,
            background: 'linear-gradient(135deg,#39A900,#2D7D00)',
            padding: '1.4rem 1.6rem',
            color: '#fff',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.07)',
              top: -80,
              right: -60,
            }}
          />
          <div className="hero-banner" style={{ position: 'relative', zIndex: 2 }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(255,255,255,.15)',
                  border: '1px solid rgba(255,255,255,.2)',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                <ArrowLeftRight size={11} /> Movimiento de vehículos
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.6rem,3vw,2.2rem)',
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                Entrada y Salida
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,.8)',
                  lineHeight: 1.5,
                }}
              >
                Historial de movimientos. Para registrar una entrada o una salida, hazlo desde la celda en el módulo de Parqueaderos.
              </p>
            </div>

            <div className="hero-stats">
              {[
                { label: 'En parqueadero', value: vehiculosEnParqueadero.length, icon: LogIn, color: '#3B82F6' },
                { label: 'Salidas', value: vehiculosSalidos.length, icon: LogOutIcon, color: '#22C55E' },
                { label: 'Celdas libres', value: celdasDisponibles.length, icon: ParkingCircle, color: '#F59E0B' },
                { label: 'Total registros', value: controlesSalida.length, icon: Clock, color: '#8B5CF6' },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    background: 'rgba(255,255,255,.12)',
                    border: '1px solid rgba(255,255,255,.2)',
                    borderRadius: 12,
                    padding: '8px 10px',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: 1,
                      color: 'rgba(255,255,255,.65)',
                      textTransform: 'uppercase',
                      marginBottom: 2,
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 900,
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <span>{s.value}</span>
                    <span style={{ fontSize: 12, opacity: 0.6 }}>{s.icon && <s.icon size={12} />}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="toolbar">
          <div className="toolbar-search">
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: COLORS.textLight,
              }}
            />
            <input
              placeholder="Buscar por placa, celda, conductor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                borderRadius: 11,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                background: '#fff',
                fontFamily: 'inherit',
              }}
              aria-label="Buscar registros"
            />
          </div>

          <select
            value={filterEstado}
            onChange={(e) =>
              setFilterEstado(e.target.value as 'todos' | 'en_parqueadero' | 'finalizado')
            }
            style={{
              padding: '10px 14px',
              borderRadius: 11,
              border: `1px solid ${COLORS.border}`,
              fontSize: 13,
              background: '#fff',
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos los estados</option>
            <option value="en_parqueadero">En parqueadero</option>
            <option value="finalizado">Finalizados</option>
          </select>

          {parqueaderos.length > 1 && (
            <select
              value={filterParqueadero}
              onChange={(e) => setFilterParqueadero(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 11,
                border: `1px solid ${COLORS.border}`,
                fontSize: 13,
                background: '#fff',
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
              aria-label="Filtrar por parqueadero"
            >
              <option value="todos">Todos los parqueaderos</option>
              {parqueaderos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          )}
        </div>

        {(search || filterEstado !== 'todos' || filterParqueadero !== 'todos') && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              padding: '0 4px',
            }}
          >
            <p style={{ fontSize: 11, color: COLORS.textLight }}>
              Mostrando <strong>{filteredControles.length}</strong> registro
              {filteredControles.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setFilterEstado('todos');
                setFilterParqueadero('todos');
              }}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: COLORS.primary,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <X size={12} /> Limpiar filtros
            </button>
          </div>
        )}

        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
            background: '#fff',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(15,23,42,.05)',
          }}
        >
          <div className="table-header" style={{ gridTemplateColumns: 'minmax(155px,1fr) minmax(135px,1fr) 85px minmax(135px,1fr) 150px 150px 90px 140px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Car size={12} /> Vehículo
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={12} /> Conductor
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={12} /> Celda
            </div>
            <div>Parqueadero</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogIn size={12} /> Entrada
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOutIcon size={12} /> Salida
            </div>
            <div>Estadía</div>
            <div style={{ textAlign: 'right' }}>Acciones</div>
          </div>

          <div>
            {filteredControles.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '48px 24px',
                  color: COLORS.textLight,
                }}
              >
                <ArrowLeftRight size={36} color={COLORS.border} style={{ marginBottom: 12 }} />
                <p style={{ fontWeight: 600, fontSize: 13 }}>No se encontraron registros</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>
                  Prueba con otros filtros. Las entradas se registran desde el módulo de Parqueaderos.
                </p>
              </div>
            ) : (
              paginatedControles.map((control) => {
                const vehiculo = getVehiculo(control.vehiculoId);
                const celda = getCelda(control.celdaId);
                const usuario = getUsuarioConductor(control.vehiculoId);
                const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;
                const esActivo = control.estado === 'en_parqueadero';
                const esHoy = isSameDay(control.fechaEntrada, new Date());

                return (
                  <div
                    key={control.id}
                    className="control-row table-row"
                    style={{
                      gridTemplateColumns: 'minmax(155px,1fr) minmax(135px,1fr) 85px minmax(135px,1fr) 150px 150px 90px 140px',
                      borderLeft: `3px solid ${esActivo ? COLORS.info : 'transparent'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'rgba(57,169,0,.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Car size={16} color={COLORS.primary} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: COLORS.text }}>
                          {vehiculo?.placa || '—'}
                        </div>
                        <div style={{ fontSize: 10, color: COLORS.textLight }}>
                          {vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : '—'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="cell-label">Conductor</span>
                      <div style={{ fontWeight: 600, color: COLORS.text }}>
                        {usuario?.nombre || '—'}
                      </div>
                      <div style={{ fontSize: 10, color: COLORS.textLight }}>
                        {usuario?.identificacion || ''}
                      </div>
                    </div>

                    <div>
                      <span className="cell-label">Celda</span>
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontWeight: 700,
                          background: COLORS.infoBg,
                          color: COLORS.info,
                        }}
                      >
                        {celda?.numero || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="cell-label">Parqueadero</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: COLORS.text }}>
                        <ParkingCircle size={12} color={COLORS.textLight} />
                        {parqueadero?.nombre || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="cell-label">Entrada</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.text }}>
                        {formatDateTime(control.fechaEntrada)}
                        {esHoy && (
                          <span
                            style={{
                              fontSize: 8,
                              fontWeight: 800,
                              letterSpacing: 0.3,
                              textTransform: 'uppercase',
                              color: COLORS.primary,
                              background: 'rgba(57,169,0,.1)',
                              padding: '1px 6px',
                              borderRadius: 999,
                            }}
                          >
                            Hoy
                          </span>
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="cell-label">Salida</span>
                      <span style={{ fontSize: 11, color: control.fechaSalida ? COLORS.text : COLORS.textLight }}>
                        {control.fechaSalida ? formatDateTime(control.fechaSalida) : '—'}
                      </span>
                    </div>

                    <div>
                      <span className="cell-label">Estadía</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textLight }}>
                        {getTiempoEstadia(control.fechaEntrada, control.fechaSalida)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10 }}>
                      {esActivo ? (
                        <span
                          title="En parqueadero"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 9px',
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            background: COLORS.infoBg,
                            color: COLORS.info,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.info, flexShrink: 0 }} />
                          Activo
                        </span>
                      ) : (
                        <span
                          title="Completado"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 9px',
                            borderRadius: 999,
                            fontSize: 10,
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            background: COLORS.successBg,
                            color: COLORS.success,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.success, flexShrink: 0 }} />
                          Completado
                        </span>
                      )}
                      <button
                        className="action-btn"
                        title="Eliminar"
                        aria-label="Eliminar registro"
                        onClick={() => handleDelete(control)}
                        style={{
                          background: 'transparent',
                          color: COLORS.danger,
                          padding: 6,
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {filteredControles.length > 0 && (
            <div
              style={{
                padding: '10px 16px',
                borderTop: `1px solid ${COLORS.border}`,
                background: '#F8FAF8',
                fontSize: 11,
                color: COLORS.textLight,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <span>
                Mostrando{' '}
                <strong>
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredControles.length)}
                </strong>{' '}
                de <strong>{filteredControles.length}</strong> registros
              </span>

              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      border: `1px solid ${COLORS.border}`,
                      background: '#fff',
                      color: currentPage === 1 ? COLORS.textMuted : COLORS.text,
                      cursor: currentPage === 1 ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.text, minWidth: 60, textAlign: 'center' }}>
                    Pág. {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="Página siguiente"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      border: `1px solid ${COLORS.border}`,
                      background: '#fff',
                      color: currentPage === totalPages ? COLORS.textMuted : COLORS.text,
                      cursor: currentPage === totalPages ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
        title="Eliminar registro"
        message={`El registro del vehículo ${confirmDelete ? getVehiculo(confirmDelete.vehiculoId)?.placa || '—' : ''} se eliminará permanentemente. Esta acción no se puede revertir.`}
        confirmLabel="Eliminar"
        tone="danger"
      />
    </>
  );
}