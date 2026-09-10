import { useNavigate } from "react-router-dom";
import {
  IconAlertTriangle as AlertTriangle,
  IconCar as Car,
  IconCircleCheck as CheckCircle,
  IconClock as Clock,
  IconEdit as Edit,
  IconMapPin as MapPin,
  IconCircleLetterP as ParkingCircle,
  IconUser as User,
  IconUserPlus as UserPlus,
  IconX as X,
} from "@tabler/icons-react";
import type { Incidente } from "@/services/api/incidentes";
import type { Celda } from "@/services/api/celdas";
import { theme } from "@/styles/theme";
import { CELDA_ESTADO_CONFIG, ESTADO_CONFIG, TIPO_NOVEDAD_LABEL } from "../lib/constants";
import type { Evidencia } from "@/services/api/evidencias";
import { EvidenciasField } from "./EvidenciasField";

const C = theme;

interface IncidenteViewModalProps {
  incidente: Incidente;
  celda: Celda | undefined;
  vehiculoPlaca?: string;
  conductorNombre?: string;
  conductorDocumento?: string;
  asignadoNombre?: string;
  asignadoCorreo?: string;
  reportanteNombre?: string;
  reportanteCorreo?: string;
  puedeAbrirPerfiles?: boolean;
  evidencias?: Evidencia[];
  nombreParqueadero: string;
  onClose: () => void;
  onEdit: () => void;
}

/** Fila de dato en la ficha. Compacta, con o sin acción de navegación. */
function DatoFila({
  label, value, icon: Icon, onClick, span = 1,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onClick?: () => void;
  span?: 1 | 2;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        gridColumn: span === 2 ? "span 2" : undefined,
        display: "flex", alignItems: "flex-start", gap: 10,
        padding: "9px 12px", borderRadius: 10,
        background: C.surfaceSubtle, border: `1px solid ${C.border}`,
        cursor: onClick ? "pointer" : "default",
        minWidth: 0,
      }}
    >
      <div style={{
        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
        background: "#fff", border: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginTop: 1,
      }}>
        <Icon size={13} color={C.textLight} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 9, fontWeight: 800, color: C.textLight,
          textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 2,
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 12.5, fontWeight: 600,
          color: onClick ? C.primary : C.text,
          lineHeight: 1.35, wordBreak: "break-word",
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}

/** Vista de solo lectura del detalle de un incidente. */
export function IncidenteViewModal({
  incidente,
  celda,
  vehiculoPlaca,
  conductorNombre,
  conductorDocumento,
  asignadoNombre,
  asignadoCorreo,
  reportanteNombre,
  reportanteCorreo,
  puedeAbrirPerfiles = false,
  evidencias = [],
  nombreParqueadero,
  onClose,
  onEdit,
}: IncidenteViewModalProps) {
  const navigate = useNavigate();
  const cfg = ESTADO_CONFIG[incidente.estado];
  const fecha = new Date(incidente.fecha);
  const esNovedad = incidente.clase === "novedad";

  /* El título es la clase del incidente, no la descripción: la descripción larga vive en el
     cuerpo, donde se puede leer completa sin reventar la cabecera. */
  const claseTexto = esNovedad
    ? "Novedad de la operación"
    : incidente.tipoNovedad === "otro" && incidente.tipoOtro
      ? incidente.tipoOtro
      : TIPO_NOVEDAD_LABEL[incidente.tipoNovedad];

  const tipoDetalle = !esNovedad && incidente.tipoNovedad !== "otro" && incidente.tipoOtro
    ? incidente.tipoOtro
    : null;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      maxHeight: "88vh", borderRadius: 24, overflow: "hidden",
      background: "#fff",
    }}>
      {/* Header compacto: el alto lo define el título corto y los badges, no la descripción. */}
      <div
        style={{
          padding: "1.1rem 1.4rem 1.1rem",
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", width: 180, height: 180, borderRadius: "50%",
          background: "rgba(255,255,255,.07)", top: -70, right: -50,
        }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 10, fontWeight: 800, letterSpacing: 0.7,
                textTransform: "uppercase", opacity: 0.85, marginBottom: 4,
              }}>
                {esNovedad ? "Novedad" : "Incidente"} · {cfg.label}
              </div>
              <h2
                title={claseTexto}
                style={{
                  margin: 0, fontSize: 19, fontWeight: 800, lineHeight: 1.25,
                  wordBreak: "break-word",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {claseTexto}
              </h2>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                background: "rgba(255,255,255,.15)", border: "none",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={15} />
            </button>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {celda && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
              }}>
                <ParkingCircle size={11} /> Celda {celda.numero}
              </span>
            )}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 10px", borderRadius: 999, fontSize: 10, fontWeight: 800,
              background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
            }}>
              <Clock size={11} />
              {fecha.toLocaleDateString("es-CO", { day: "2-digit", month: "short" })} · {fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>

      {/* Cuerpo con scroll propio para no desbordar la ventana. */}
      <div style={{ padding: "1rem 1.4rem 1.2rem", overflowY: "auto", flex: 1, minHeight: 0 }}>
        {/* Datos cortos en grid de 2 columnas: la ficha se lee en la mitad de alto. */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {!esNovedad && (
            <DatoFila
              label="Tipo"
              value={tipoDetalle
                ? `${TIPO_NOVEDAD_LABEL[incidente.tipoNovedad]} · ${tipoDetalle}`
                : TIPO_NOVEDAD_LABEL[incidente.tipoNovedad]}
              icon={AlertTriangle}
            />
          )}
          {celda && (
            <DatoFila
              label="Celda"
              value={`${celda.numero} · ${CELDA_ESTADO_CONFIG[celda.estado].label}`}
              icon={ParkingCircle}
              onClick={() => navigate(`/app/parqueaderos?q=${encodeURIComponent(celda.numero)}`)}
            />
          )}
          <DatoFila
            label="Parqueadero"
            value={nombreParqueadero}
            icon={MapPin}
            onClick={() => navigate(`/app/parqueaderos?q=${encodeURIComponent(celda?.numero || nombreParqueadero)}`)}
          />
          {vehiculoPlaca && (
            <DatoFila label="Vehículo" value={vehiculoPlaca} icon={Car} />
          )}
          {conductorNombre && (
            <DatoFila
              label="Conductor"
              value={conductorDocumento ? `${conductorNombre} · ${conductorDocumento}` : conductorNombre}
              icon={User}
            />
          )}
          {reportanteNombre && (
            <DatoFila
              label="Reportado por"
              value={reportanteCorreo ? `${reportanteNombre} · ${reportanteCorreo}` : reportanteNombre}
              icon={UserPlus}
              onClick={puedeAbrirPerfiles
                ? () => navigate(`/app/conductores?q=${encodeURIComponent(reportanteCorreo || reportanteNombre)}`)
                : undefined}
            />
          )}
          {asignadoNombre && (
            <DatoFila
              label="A cargo de"
              value={asignadoCorreo ? `${asignadoNombre} · ${asignadoCorreo}` : asignadoNombre}
              icon={User}
              onClick={puedeAbrirPerfiles
                ? () => navigate(`/app/usuarios?q=${encodeURIComponent(asignadoCorreo || asignadoNombre)}`)
                : undefined}
            />
          )}
        </div>

        {/* Descripción: al final, ancho completo, con scroll propio si es muy larga. */}
        {incidente.descripcion && (
          <div style={{
            marginTop: 12,
            padding: "10px 12px", borderRadius: 10,
            background: C.surfaceSubtle, border: `1px solid ${C.border}`,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 800, color: C.textLight,
              textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6,
            }}>
              Descripción
            </div>
            <p style={{
              margin: 0,
              maxHeight: 160, overflowY: "auto",
              fontSize: 12.5, color: C.text, lineHeight: 1.5,
              whiteSpace: "pre-wrap", wordBreak: "break-word", overflowWrap: "anywhere",
              paddingRight: 4,
            }}>
              {incidente.descripcion}
            </p>
          </div>
        )}

        {incidente.justificacionCierre && (
          <div style={{
            marginTop: 10,
            padding: "10px 12px", borderRadius: 10,
            background: C.successBg, border: `1px solid ${C.success}33`,
          }}>
            <div style={{
              fontSize: 9, fontWeight: 800, color: C.success,
              textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4,
            }}>
              Justificación de cierre
            </div>
            <div style={{
              fontSize: 12, color: C.text, lineHeight: 1.45,
              whiteSpace: "pre-wrap", wordBreak: "break-word",
            }}>
              {incidente.justificacionCierre}
            </div>
          </div>
        )}

        {/* Evidencias: solo incidentes, con las fotos guardadas. */}
        {!esNovedad && evidencias.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{
              fontSize: 9, fontWeight: 800, color: C.textLight,
              textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6,
            }}>
              Evidencias
            </div>
            <EvidenciasField archivos={[]} onChange={() => {}} existentes={evidencias} soloLectura />
          </div>
        )}
      </div>

      {/* Footer fijo: el CTA de editar siempre visible, sin importar cuánto scrollee el cuerpo. */}
      <div style={{
        padding: "0.9rem 1.4rem 1.1rem",
        borderTop: `1px solid ${C.border}`,
        background: "#fff", flexShrink: 0,
      }}>
        <button
          onClick={onEdit}
          style={{
            width: "100%", padding: "11px 20px", borderRadius: 12,
            border: "none", background: C.primary, color: "#fff",
            fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: `0 6px 18px ${C.primary}33`,
          }}
        >
          <Edit size={14} />
          Editar incidente
        </button>
      </div>
    </div>
  );
}