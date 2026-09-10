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
  /** Conductor dueño del vehículo (vehiculo -> conductor_principal), para no perder la
   *  trazabilidad hacia la persona aunque `novedad` no tenga un conductor_id directo. */
  conductorNombre?: string;
  conductorDocumento?: string;
  asignadoNombre?: string;
  asignadoCorreo?: string;
  /** Quién levantó el reporte: sin esto no hay a quién volver a preguntarle qué pasó. */
  reportanteNombre?: string;
  reportanteCorreo?: string;
  /** true si quien mira puede abrir la ficha de esas personas (Administrador o Vigilante).
   *  Comunidad SENA ve el nombre y el correo, pero no navega a módulos que no le tocan. */
  puedeAbrirPerfiles?: boolean;
  /** Las fotos guardadas del reporte. */
  evidencias?: Evidencia[];
  nombreParqueadero: string;
  onClose: () => void;
  onEdit: () => void;
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

  /* El título del modal es la clase del incidente (antes "tipo" en los formularios).
     Cuando es "otro" se usa la precisión escrita a mano; en novedades se cae a
     "Novedad de la operación" porque no hay subtipo asociado. La descripción dejó de
     ser el título: ahora vive al final, como texto de cuerpo. */
  const claseTexto = esNovedad
    ? "Novedad de la operación"
    : incidente.tipoNovedad === "otro" && incidente.tipoOtro
      ? incidente.tipoOtro
      : TIPO_NOVEDAD_LABEL[incidente.tipoNovedad];

  const items = [
    /* El subtipo (cuando es incidente) acompaña al título: el título dice "choque" o
       "otro · rayón profundo", aquí queda desglosado. Las novedades no tienen subtipo. */
    ...(esNovedad
      ? []
      : [{
          label: "Tipo",
          value: incidente.tipoNovedad === "otro" && incidente.tipoOtro
            ? `Otro · ${incidente.tipoOtro}`
            : TIPO_NOVEDAD_LABEL[incidente.tipoNovedad],
          icon: AlertTriangle, onClick: undefined,
        }]),
    /* Quién reportó y quién está a cargo, con su correo: es lo que permite contactarlos sin
       salir a buscarlos. Y si quien mira puede gestionarlos, la fila lleva a su ficha —a
       Conductores para quien reportó, a Usuarios para el encargado—, que es donde está el
       resto de sus datos. */
    ...(reportanteNombre
      ? [{
          label: "Reportado por",
          value: reportanteCorreo ? `${reportanteNombre} · ${reportanteCorreo}` : reportanteNombre,
          icon: UserPlus,
          onClick: puedeAbrirPerfiles
            ? () => navigate(`/app/conductores?q=${encodeURIComponent(reportanteCorreo || reportanteNombre)}`)
            : undefined,
        }]
      : []),
    {
      label: "Parqueadero", value: nombreParqueadero, icon: MapPin,
      onClick: () => navigate(`/app/parqueaderos?q=${encodeURIComponent(celda?.numero || nombreParqueadero)}`),
    },
    ...(celda
      ? [{
          label: "Celda", value: `${celda.numero} · ${CELDA_ESTADO_CONFIG[celda.estado].label} actualmente`, icon: ParkingCircle,
          onClick: () => navigate(`/app/parqueaderos?q=${encodeURIComponent(celda.numero)}`),
        }]
      : []),
    { label: "Fecha y hora", value: fecha.toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }), icon: Clock, onClick: undefined },
    ...(vehiculoPlaca ? [{ label: "Vehículo", value: vehiculoPlaca, icon: Car, onClick: undefined }] : []),
    ...(conductorNombre
      ? [{ label: "Conductor", value: conductorDocumento ? `${conductorNombre} · ${conductorDocumento}` : conductorNombre, icon: User, onClick: undefined }]
      : []),
    ...(asignadoNombre
      ? [{
          label: "A cargo de",
          value: asignadoCorreo ? `${asignadoNombre} · ${asignadoCorreo}` : asignadoNombre,
          icon: User,
          onClick: puedeAbrirPerfiles
            ? () => navigate(`/app/usuarios?q=${encodeURIComponent(asignadoCorreo || asignadoNombre)}`)
            : undefined,
        }]
      : []),
    /* Ojo: la justificación de cierre ya no va aquí como item. Aparece destacada más abajo,
       junto a la descripción — tenerla dos veces (una como dato y otra como bloque) era
       ruido. */
  ];

  return (
    <div>
      <div
        style={{
          padding: "1.6rem 1.8rem 1.4rem",
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
          color: "#fff",
          borderRadius: "24px 24px 0 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,.07)", top: -80, right: -60,
        }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: 14,
                background: "rgba(255,255,255,.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {incidente.estado === "resuelto" ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: "rgba(255,255,255,.15)", border: "none",
                color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={15} />
            </button>
          </div>
          {/* Título = clase del incidente. Se recorta a dos líneas por si el subtipo escrito
              a mano es largo; el valor completo queda en el tooltip. */}
          <h2
            title={claseTexto}
            style={{
              marginTop: 12, fontSize: 18, fontWeight: 800, lineHeight: 1.3,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              overflow: "hidden", wordBreak: "break-word",
            }}
          >
            {claseTexto}
          </h2>
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
              background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
              {cfg.label}
            </span>
            {celda && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.25)",
              }}>
                <ParkingCircle size={11} /> Celda {celda.numero}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "1.4rem 1.8rem" }}>
        {items.map((item) => (
          <div
            key={item.label}
            onClick={item.onClick}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 12,
              background: C.surfaceSubtle, border: `1px solid ${C.border}`,
              marginBottom: 8,
              cursor: item.onClick ? "pointer" : "default",
            }}
          >
            <item.icon size={14} color={C.textLight} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {item.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: item.onClick ? C.primary : C.text, wordBreak: "break-word" }}>
                {item.value}
              </div>
            </div>
          </div>
        ))}

        {/* Descripción: al final del resto de datos y como texto de cuerpo, no como título.
            Conserva saltos de línea y rompe palabras largas para no desbordar el modal. El
            modal padre gestiona el scroll cuando el contenido crece. */}
        {incidente.descripcion && (
          <div style={{
            padding: "10px 12px", borderRadius: 12,
            background: C.surfaceSubtle, border: `1px solid ${C.border}`,
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Descripción
            </div>
            <p style={{
              margin: 0,
              fontSize: 12.5,
              color: C.text,
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "anywhere",
            }}>
              {incidente.descripcion}
            </p>
          </div>
        )}

        {/* Las fotos que respaldan el reporte: es lo que evita tener que ir a mirarlo en
            persona. Una novedad no las lleva. */}
        {!esNovedad && evidencias.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <EvidenciasField archivos={[]} onChange={() => {}} existentes={evidencias} soloLectura />
          </div>
        )}

        {incidente.justificacionCierre && (
          <div style={{
            padding: "10px 12px", borderRadius: 12,
            background: C.successBg, border: `1px solid ${C.success}33`,
            marginBottom: 8,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.success, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              Justificación de cierre
            </div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {incidente.justificacionCierre}
            </div>
          </div>
        )}

        <button
          onClick={onEdit}
          style={{
            marginTop: 12, width: "100%", padding: "12px 20px", borderRadius: 12,
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