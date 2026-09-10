import {
  IconAlertTriangle as AlertTriangle,
  IconCar as Car,
  IconCircleCheck as CheckCircle,
  IconClock as Clock,
  IconEdit as Edit,
  IconEye as Eye,
  IconLock as Lock,
  IconMapPin as MapPin,
  IconTrash as Trash2,
  IconUser as User,
  IconUserPlus as UserPlus,
} from "@tabler/icons-react";
import type { Incidente } from "@/services/api/incidentes";
import type { Celda } from "@/services/api/celdas";
import { theme } from "@/styles/theme";
import { ESTADO_CONFIG, PRIORIDAD_CONFIG, TIPO_NOVEDAD_LABEL, type EstadoIncidente } from "../lib/constants";
import { esEstadoFinal, transicionesDe } from "../lib/transiciones";
import { CeldaBadgeInline, EstadoBadgeInline } from "./IncidenteBadges";

const C = theme;

interface IncidenteCardProps {
  incidente: Incidente;
  celda: Celda | undefined;
  vehiculoPlaca?: string;
  /** Dueño del vehículo implicado, cuando el reporte lleva uno. */
  propietarioNombre?: string;
  /** Quién levantó el reporte. Sin esto no hay a quién volver a preguntarle. */
  reportanteNombre?: string;
  asignadoNombre?: string;
  nombreParqueadero: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCambiarEstado: (estado: EstadoIncidente) => void;
}

/** Tarjeta de un incidente en el grid: resumen, ubicación y acciones rápidas. */
export function IncidenteCard({
  incidente,
  celda,
  vehiculoPlaca,
  propietarioNombre,
  reportanteNombre,
  asignadoNombre,
  nombreParqueadero,
  onView,
  onEdit,
  onDelete,
  onCambiarEstado,
}: IncidenteCardProps) {
  const cfg = ESTADO_CONFIG[incidente.estado];
  const fecha = new Date(incidente.fecha);
  // Resuelto, rechazado y cancelado son finales: en vez del selector se muestra la etiqueta
  // con un candado (la guarda equivalente vive en useIncidentesData.cambiarEstado, y el
  // backend debe impedirlo también). Ver lib/transiciones.ts.
  const estadoBloqueado = esEstadoFinal(incidente.estado);
  const destinos = transicionesDe(incidente.estado);
  /* La urgencia tiene que verse antes de leer la tarjeta: en una lista de veinte iguales,
     saber cuál es crítica obligaba a abrirlas una por una. El color va en la barra superior
     (lo que se ve de lejos) y repetido en una etiqueta, para no depender solo del color. */
  const prioridad = PRIORIDAD_CONFIG[incidente.prioridad];
  const esNovedad = incidente.clase === "novedad";
  /* El título de la tarjeta es la clase del incidente (antes "tipo" en los formularios).
     Cuando es "otro" se usa la precisión escrita a mano; en novedades se cae a "Novedad"
     porque no hay tipoNovedad asociado. */
  const claseTexto = esNovedad
    ? "Novedad"
    : incidente.tipoNovedad === "otro" && incidente.tipoOtro
      ? incidente.tipoOtro
      : TIPO_NOVEDAD_LABEL[incidente.tipoNovedad];

  return (
    /* Alto fijo: una descripción larga estiraba su tarjeta y descuadraba toda la fila de la
       rejilla. Lo que no cabe ahora scrollea dentro del bloque de datos —la ficha completa
       sigue a un clic— y las acciones quedan siempre a la misma altura. */
    <div
      className="incidente-card"
      style={{
        borderRadius: 14, border: `1px solid ${C.border}`,
        background: "#fff", overflow: "hidden",
        boxShadow: "0 2px 8px rgba(15,23,42,.05)",
        height: 340, display: "flex", flexDirection: "column",
      }}
    >
      <div
        style={{ height: 4, background: esNovedad ? "#818CF8" : prioridad.barra }}
        title={esNovedad ? "Novedad de la operación" : `Prioridad ${prioridad.label.toLowerCase()}`}
      />

      <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: `${cfg.bg}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {incidente.estado === "resuelto" ? (
              <CheckCircle size={24} color={C.success} />
            ) : (
              <AlertTriangle size={24} color={C.warning} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Título = clase del incidente. Se recorta a una línea con elipsis para no
                empujar los badges hacia abajo; el valor completo está en el tooltip. */}
            <p
              title={claseTexto}
              style={{
                fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.3, marginBottom: 6,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {claseTexto}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {/* Un incidente y una novedad se atienden distinto: si no se distinguen en la
                  lista, una observación de turno parece una avería sin resolver. */}
              <span style={{
                padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800,
                background: esNovedad ? "#EEF2FF" : "#FEF2F2",
                color: esNovedad ? "#4338CA" : "#991B1B",
                border: `1px solid ${esNovedad ? "#C7D2FE" : "#FECACA"}`,
              }}>
                {esNovedad ? "Novedad" : "Incidente"}
              </span>
              <EstadoBadgeInline estado={incidente.estado} />
              {!esNovedad && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999,
                  fontSize: 10, fontWeight: 800, background: prioridad.bg, color: prioridad.text,
                  border: `1px solid ${prioridad.border}`,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: prioridad.barra }} />
                  {prioridad.label}
                </span>
              )}
              {celda && <CeldaBadgeInline numero={celda.numero} estado={celda.estado} />}
            </div>
          </div>
        </div>

        {/* El alto fijo mantiene la rejilla cuadrada, pero lo que no cabe no puede
            desaparecer —el motivo de un rechazo es justo lo que hay que leer—: este bloque
            hace scroll dentro de la propia tarjeta. La descripción va al final, como texto
            de cuerpo, para que la ficha se lea de lo general (ubicación, vehículo, quién)
            a lo particular (qué pasó). */}
        <div
          className="incidente-card-datos"
          style={{
            display: "flex", flexDirection: "column", gap: 8, marginBottom: 12,
            flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text }}>
            <MapPin size={12} color={C.textLight} />
            <span>
              {nombreParqueadero}
              {celda && <> · Celda <strong>{celda.numero}</strong></>}
            </span>
          </div>
          {vehiculoPlaca && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text }}>
              <Car size={12} color={C.textLight} />
              <span>
                {vehiculoPlaca}
                {propietarioNombre && <span style={{ color: C.textLight }}> · {propietarioNombre}</span>}
              </span>
            </div>
          )}
          {/* Quién reportó: sin esto no hay a quién volver a preguntarle qué pasó. */}
          {reportanteNombre && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text }}>
              <UserPlus size={12} color={C.textLight} />
              <span>Reportó <strong>{reportanteNombre}</strong></span>
            </div>
          )}
          {asignadoNombre && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.text }}>
              <User size={12} color={C.textLight} />
              <span>A cargo de {asignadoNombre}</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: C.textLight }}>
            <Clock size={10} />
            <span>{fecha.toLocaleDateString("es-CO")} · {fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          {incidente.justificacionCierre && (
            <div style={{ padding: "8px 10px", borderRadius: 9, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: cfg.text, textTransform: "uppercase", letterSpacing: .5 }}>
                Motivo
              </div>
              <div style={{ fontSize: 11, color: cfg.text, lineHeight: 1.45 }}>
                {incidente.justificacionCierre}
              </div>
            </div>
          )}

          {/* Descripción: al final, como texto de cuerpo. Respeta saltos de línea y palabras
              largas, y si no cabe el scroll del contenedor se encarga. Sin clamp ni tooltip
              porque aquí sí se lee completa. */}
          {incidente.descripcion && (
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                lineHeight: 1.5,
                color: C.text,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
              }}
            >
              {incidente.descripcion}
            </p>
          )}
        </div>

        <div style={{
          borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: "auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {estadoBloqueado ? (
              <span
                title={`Un incidente ${cfg.label.toLowerCase()} ya no puede cambiar de estado`}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 999,
                  fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.text,
                  border: `1px solid ${cfg.border}`,
                }}
              >
                <Lock size={10} aria-hidden="true" />
                {cfg.label}
              </span>
            ) : (
              <select
                aria-label="Cambiar estado del incidente"
                value={incidente.estado}
                onChange={(e) => onCambiarEstado(e.target.value as EstadoIncidente)}
                style={{
                  padding: "5px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                  fontFamily: "inherit", cursor: "pointer", appearance: "none",
                  background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
                }}
              >
                <option value={incidente.estado}>{cfg.label}</option>
                {destinos.map((estado) => (
                  <option key={estado} value={estado}>
                    Cambiar a: {ESTADO_CONFIG[estado].label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: "flex", gap: 4 }}>
            <button
              className="action-btn"
              title="Ver detalle"
              aria-label="Ver detalle del incidente"
              onClick={onView}
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: "none", background: "transparent",
                color: C.textLight, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Eye size={13} />
            </button>
            <button
              className="action-btn"
              title="Editar"
              aria-label="Editar incidente"
              onClick={onEdit}
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: "none", background: "transparent",
                color: C.textLight, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Edit size={13} />
            </button>
            <button
              className="delete-btn"
              title="Eliminar"
              aria-label="Eliminar incidente"
              onClick={onDelete}
              style={{
                width: 28, height: 28, borderRadius: 7,
                border: "none", background: "transparent",
                color: C.danger, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}