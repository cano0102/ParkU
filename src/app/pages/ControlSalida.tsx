import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import {
  Plus,
  ArrowLeftRight,
  Search,
  LogIn,
  LogOut as LogOutIcon,
  Car,
  MapPin,
  X,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  Truck,
  ParkingCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useData, ControlSalida } from '../context/DataContext';

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  primaryLight: "#E8F5E1",
  text: "#0F172A",
  textLight: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  bg: "#F5F7F8",
  white: "#FFFFFF",
  danger: "#EF4444",
  dangerBg: "#FEE2E2",
  success: "#22C55E",
  successBg: "#DCFCE7",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  info: "#3B82F6",
  infoBg: "#DBEAFE",
} as const;

const sanitizeText = (text: string): string => {
  if (!text) return '';
  const element = document.createElement('div');
  element.textContent = text;
  return element.innerHTML;
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

const Modal = memo(({ open, onClose, children, maxWidth = 580 }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const focusable = document.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) focusable[0]?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(15,23,42,.45)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 24,
          background: '#fff',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 20px 55px rgba(15,23,42,.12)',
          animation: 'modalIn .18s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
      <style>{`
        @keyframes modalIn{
          from{opacity:0;transform:translateY(16px) scale(.97)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
      `}</style>
    </div>
  );
});

Modal.displayName = 'Modal';

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmDialog = memo(({ open, onConfirm, onCancel, title, message }: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(15,23,42,.45)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 20,
          background: '#fff',
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 20px 55px rgba(15,23,42,.12)',
          padding: '1.8rem',
          animation: 'modalIn .18s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="confirm-title"
          style={{
            fontSize: 18,
            fontWeight: 900,
            color: COLORS.text,
            marginBottom: 8,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: COLORS.textLight,
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: '#fff',
              color: COLORS.text,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: COLORS.danger,
              color: '#fff',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

interface FormState {
  vehiculoId: string;
  celdaId: string;
  fechaEntrada: string;
  fechaSalida: string;
  estado: 'en_parqueadero' | 'finalizado';
}

const emptyForm = (): FormState => ({
  vehiculoId: '',
  celdaId: '',
  fechaEntrada: new Date().toISOString().slice(0, 16),
  fechaSalida: '',
  estado: 'en_parqueadero',
});

export function ControlSalidaPage() {
  const {
    controlesSalida,
    addControlSalida,
    updateControlSalida,
    vehiculos,
    celdas,
    conductores,
    usuarios,
    parqueaderos,
  } = useData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'en_parqueadero' | 'finalizado'>('todos');
  const [formData, setFormData] = useState<FormState>(emptyForm());
  const [salidaPendiente, setSalidaPendiente] = useState<string | null>(null);

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
      controlesSalida.filter((control) => {
        const vehiculo = getVehiculo(control.vehiculoId);
        const celda = getCelda(control.celdaId);
        const usuario = getUsuarioConductor(control.vehiculoId);

        const q = search.toLowerCase();
        const matchesSearch =
          vehiculo?.placa.toLowerCase().includes(q) ||
          celda?.numero.toLowerCase().includes(q) ||
          usuario?.nombre.toLowerCase().includes(q) ||
          usuario?.identificacion.includes(q) ||
          vehiculo?.marca.toLowerCase().includes(q) ||
          vehiculo?.modelo.toLowerCase().includes(q);
        const matchesEstado = filterEstado === 'todos' ? true : control.estado === filterEstado;
        return matchesSearch && matchesEstado;
      }),
    [controlesSalida, search, filterEstado, getVehiculo, getCelda, getUsuarioConductor]
  );

  const openCreate = useCallback(() => {
    setFormData(emptyForm());
    setDialogOpen(true);
  }, []);

  const openConfirmSalida = useCallback((id: string) => {
    setSalidaPendiente(id);
    setConfirmOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.vehiculoId) {
      toast.error('Selecciona un vehículo');
      return;
    }
    if (!formData.celdaId) {
      toast.error('Selecciona una celda');
      return;
    }

    // Verificar que el vehículo no esté ya en el parqueadero
    const vehiculoEnParqueadero = vehiculosEnParqueadero.some(
      (c) => c.vehiculoId === formData.vehiculoId
    );
    if (vehiculoEnParqueadero) {
      toast.error('Este vehículo ya se encuentra en el parqueadero');
      return;
    }

    try {
      addControlSalida(formData);
      toast.success('Entrada registrada exitosamente');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Error al registrar la entrada');
      console.error('Error saving entry:', error);
    }
  }, [formData, addControlSalida, vehiculosEnParqueadero]);

  const handleRegistrarSalida = useCallback(() => {
    if (!salidaPendiente) return;
    try {
      const now = new Date().toISOString().slice(0, 16);
      updateControlSalida(salidaPendiente, {
        fechaSalida: now,
        estado: 'finalizado',
      });
      toast.success('Salida registrada exitosamente');
      setConfirmOpen(false);
      setSalidaPendiente(null);
    } catch (error) {
      toast.error('Error al registrar la salida');
      console.error('Error registering exit:', error);
    }
  }, [salidaPendiente, updateControlSalida]);

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
                Registra y gestiona el flujo de vehículos en el parqueadero institucional.
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
            <option value="todos">Todos</option>
            <option value="en_parqueadero">En parqueadero</option>
            <option value="finalizado">Finalizados</option>
          </select>

          <button
            onClick={openCreate}
            style={{
              padding: '10px 18px',
              borderRadius: 11,
              border: 'none',
              background: COLORS.primary,
              color: '#fff',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              boxShadow: '0 4px 14px rgba(57,169,0,.25)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(57,169,0,.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(57,169,0,.25)';
            }}
          >
            <Plus size={15} /> Registrar Entrada
          </button>
        </div>

        {(search || filterEstado !== 'todos') && (
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
          <div className="table-header" style={{ gridTemplateColumns: 'minmax(180px,1fr) minmax(160px,1fr) 90px minmax(160px,1fr) 160px 160px 100px 120px' }}>
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
                  Prueba con otros filtros o registra una entrada
                </p>
              </div>
            ) : (
              filteredControles.map((control) => {
                const vehiculo = getVehiculo(control.vehiculoId);
                const celda = getCelda(control.celdaId);
                const usuario = getUsuarioConductor(control.vehiculoId);
                const parqueadero = celda ? getParqueadero(celda.parqueaderoId) : null;
                const esActivo = control.estado === 'en_parqueadero';

                return (
                  <div
                    key={control.id}
                    className="control-row table-row"
                    style={{
                      gridTemplateColumns: 'minmax(180px,1fr) minmax(160px,1fr) 90px minmax(160px,1fr) 160px 160px 100px 120px',
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
                      <span style={{ fontSize: 11, color: COLORS.text }}>
                        {formatDateTime(control.fechaEntrada)}
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

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      {esActivo && (
                        <button
                          className="action-btn"
                          onClick={() => openConfirmSalida(control.id)}
                          style={{
                            background: COLORS.primary,
                            color: '#fff',
                            padding: '6px 14px',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = COLORS.primaryDark;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = COLORS.primary;
                          }}
                        >
                          <LogOutIcon size={13} />
                          Salida
                        </button>
                      )}
                      {!esActivo && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: COLORS.success,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <CheckCircle2 size={14} />
                          Completado
                        </span>
                      )}
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
                gap: 6,
              }}
            >
              <span>
                Mostrando <strong>{filteredControles.length}</strong> de{' '}
                <strong>{controlesSalida.length}</strong> registros
              </span>
              <span style={{ fontSize: 10, color: COLORS.textMuted }}>
                Última actualización: {new Date().toLocaleTimeString('es-CO')}
              </span>
            </div>
          )}
        </div>
      </div>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth={580}>
        <div>
          <div
            style={{
              padding: '1.4rem 1.8rem',
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(57,169,0,.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <LogIn size={18} color={COLORS.primary} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: COLORS.primary,
                    textTransform: 'uppercase',
                  }}
                >
                  Movimiento de vehículos
                </div>
                <h2
                  style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: COLORS.text,
                    lineHeight: 1,
                  }}
                >
                  Registrar Entrada
                </h2>
              </div>
            </div>
            <button
              onClick={() => setDialogOpen(false)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                border: `1px solid ${COLORS.border}`,
                background: '#fff',
                cursor: 'pointer',
                color: COLORS.textLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-label="Cerrar formulario"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: '1.4rem 1.8rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 6,
                  }}
                >
                  Vehículo *
                </label>
                <select
                  value={formData.vehiculoId}
                  onChange={(e) => setFormData({ ...formData, vehiculoId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 11,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: 'inherit',
                    background: '#F8FAFC',
                  }}
                  required
                >
                  <option value="">Seleccionar vehículo...</option>
                  {vehiculos.map((v) => {
                    const conductor = conductores.find((c) => c.id === v.conductorId);
                    const usuario = conductor ? usuarios.find((u) => u.id === conductor.usuarioId) : null;
                    const enParqueadero = vehiculosEnParqueadero.some((c) => c.vehiculoId === v.id);
                    return (
                      <option key={v.id} value={v.id}>
                        {v.placa} — {v.marca} {v.modelo} ({usuario?.nombre || 'Sin conductor'})
                        {enParqueadero ? ' ⚠️ Ya en parqueadero' : ''}
                      </option>
                    );
                  })}
                </select>
                {formData.vehiculoId &&
                  vehiculosEnParqueadero.some((c) => c.vehiculoId === formData.vehiculoId) && (
                    <p style={{ fontSize: 10, color: COLORS.danger, marginTop: 4 }}>
                      ⚠️ Este vehículo ya se encuentra en el parqueadero
                    </p>
                  )}
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 6,
                  }}
                >
                  Celda disponible *
                </label>
                <select
                  value={formData.celdaId}
                  onChange={(e) => setFormData({ ...formData, celdaId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 11,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: 'inherit',
                    background: '#F8FAFC',
                  }}
                  required
                >
                  <option value="">Seleccionar celda...</option>
                  {celdasDisponibles.map((c) => {
                    const parq = parqueaderos.find((p) => p.id === c.parqueaderoId);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.numero} — {parq?.nombre || 'Sin parqueadero'} ({c.tipo})
                      </option>
                    );
                  })}
                </select>
                {celdasDisponibles.length === 0 && (
                  <p style={{ fontSize: 10, color: COLORS.danger, marginTop: 4 }}>
                    ⚠️ No hay celdas disponibles. Por favor libera alguna celda primero.
                  </p>
                )}
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 6,
                  }}
                >
                  Fecha y hora de entrada *
                </label>
                <input
                  type="datetime-local"
                  value={formData.fechaEntrada}
                  onChange={(e) => setFormData({ ...formData, fechaEntrada: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 11,
                    border: `1px solid ${COLORS.border}`,
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: 'inherit',
                    background: '#F8FAFC',
                  }}
                  required
                />
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '1rem 1.8rem',
              borderTop: `1px solid ${COLORS.border}`,
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => setDialogOpen(false)}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                background: '#fff',
                color: COLORS.text,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                flex: '1 1 auto',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={
                !formData.vehiculoId ||
                !formData.celdaId ||
                vehiculosEnParqueadero.some((c) => c.vehiculoId === formData.vehiculoId)
              }
              style={{
                padding: '10px 24px',
                borderRadius: 12,
                border: 'none',
                background:
                  formData.vehiculoId &&
                  formData.celdaId &&
                  !vehiculosEnParqueadero.some((c) => c.vehiculoId === formData.vehiculoId)
                    ? COLORS.primary
                    : COLORS.border,
                color:
                  formData.vehiculoId &&
                  formData.celdaId &&
                  !vehiculosEnParqueadero.some((c) => c.vehiculoId === formData.vehiculoId)
                    ? '#fff'
                    : COLORS.textLight,
                fontSize: 13,
                fontWeight: 800,
                cursor:
                  formData.vehiculoId &&
                  formData.celdaId &&
                  !vehiculosEnParqueadero.some((c) => c.vehiculoId === formData.vehiculoId)
                    ? 'pointer'
                    : 'default',
                fontFamily: 'inherit',
                boxShadow:
                  formData.vehiculoId &&
                  formData.celdaId &&
                  !vehiculosEnParqueadero.some((c) => c.vehiculoId === formData.vehiculoId)
                    ? '0 6px 18px rgba(57,169,0,.22)'
                    : 'none',
                flex: '1 1 auto',
              }}
            >
              Registrar Entrada
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleRegistrarSalida}
        onCancel={() => {
          setConfirmOpen(false);
          setSalidaPendiente(null);
        }}
        title="Registrar Salida"
        message="¿Estás seguro de registrar la salida de este vehículo? Esta acción actualizará el estado de la celda a disponible."
      />
    </>
  );
}