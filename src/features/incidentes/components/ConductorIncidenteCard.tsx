import {
  IconClock as Clock,
  IconEdit as Edit,
  IconMapPin as MapPin,
  IconCircleX as XCircle,
} from "@tabler/icons-react";
import type { Incidente } from "@/services/api/incidentes";
import type { Celda } from "@/services/api/celdas";
import { theme } from "@/styles/theme";
import { TIPO_NOVEDAD_LABEL, PRIORIDAD_LABEL } from "../lib/constants";
import { EstadoBadgeInline, CeldaBadgeInline } from "./IncidenteBadges";

const C = theme;

interface ConductorIncidenteCardProps {
  incidente: Incidente;
  celda: Celda | undefined;
  nombreParqueadero: string;
  onEdit: () => void;
  onCancelar: () => void;
}

// Solo se puede editar/cancelar mientras nadie de vigilancia lo haya tomado — una vez en
// proceso o resuelto, el cambio ya no le corresponde al conductor que lo reportó.
const ESTADOS_GESTIONABLES: Incidente["estado"][] = ["pendiente"];

// `PUT /novedades/:id` (usado tanto por "Editar" como por "Cancelar", que internamente es un
// cambio de estado vía ese mismo endpoint) da 403 para Comunidad SENA en la API real hoy — ver
// el comentario junto a `PERMISOS_POR_ROL[CONDUCTOR].incidentes` en services/core/roles.ts. El
// frontend ya tiene el flujo completo listo; se deja el botón visible pero deshabilitado (no se
// elimina el código) para que se habilite solo con este flag el día que el backend abra esa
// ruta para que un Conductor gestione sus propios recursos.
const ACCIONES_BACKEND_DISPONIBLES = false;
const TOOLTIP_ACCION_NO_DISPONIBLE = "Disponible próximamente: el backend aún no permite esta acción a Comunidad SENA.";

/** Tarjeta de "Mis incidentes" (rol Comunidad SENA): resumen de solo lo que el propio
 *  conductor reportó, sin las acciones de gestión que sí ve Admin/Vigilante. */
export function ConductorIncidenteCard({ incidente, celda, nombreParqueadero, onEdit, onCancelar }: ConductorIncidenteCardProps) {
  const fecha = new Date(incidente.fecha);
  const gestionable = ESTADOS_GESTIONABLES.includes(incidente.estado);

  return (
    <div
      style={{
        borderRadius: 14, border: `1px solid ${C.border}`, background: "#fff",
        overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)",
      }}
    >
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: C.text, lineHeight: 1.3 }}>{incidente.descripcion}</p>
          <EstadoBadgeInline estado={incidente.estado} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.textLight, background: "#F1F5F9", padding: "2px 8px", borderRadius: 999 }}>
            {TIPO_NOVEDAD_LABEL[incidente.tipoNovedad]}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: C.textLight, background: "#F1F5F9", padding: "2px 8px", borderRadius: 999 }}>
            Prioridad {PRIORIDAD_LABEL[incidente.prioridad]}
          </span>
          {celda && <CeldaBadgeInline numero={celda.numero} estado={celda.estado} />}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12, fontSize: 11, color: C.textLight }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MapPin size={12} />
            <span>{nombreParqueadero}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={12} />
            <span>{fecha.toLocaleDateString("es-CO")} · {fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        {gestionable ? (
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, display: "flex", gap: 8 }}>
            <button
              onClick={onEdit}
              disabled={!ACCIONES_BACKEND_DISPONIBLES}
              title={ACCIONES_BACKEND_DISPONIBLES ? undefined : TOOLTIP_ACCION_NO_DISPONIBLE}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px 10px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff",
                color: C.text, fontSize: 11, fontWeight: 700, fontFamily: "inherit",
                cursor: ACCIONES_BACKEND_DISPONIBLES ? "pointer" : "not-allowed",
                opacity: ACCIONES_BACKEND_DISPONIBLES ? 1 : 0.5,
              }}
            >
              <Edit size={12} />Editar
            </button>
            <button
              onClick={onCancelar}
              disabled={!ACCIONES_BACKEND_DISPONIBLES}
              title={ACCIONES_BACKEND_DISPONIBLES ? undefined : TOOLTIP_ACCION_NO_DISPONIBLE}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px 10px", borderRadius: 9, border: `1px solid ${C.danger}33`, background: "#fff",
                color: C.danger, fontSize: 11, fontWeight: 700, fontFamily: "inherit",
                cursor: ACCIONES_BACKEND_DISPONIBLES ? "pointer" : "not-allowed",
                opacity: ACCIONES_BACKEND_DISPONIBLES ? 1 : 0.5,
              }}
            >
              <XCircle size={12} />Cancelar
            </button>
          </div>
        ) : (
          <p style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, fontSize: 10, color: C.textLight }}>
            Ya está siendo gestionado — no se puede editar ni cancelar desde aquí.
          </p>
        )}
      </div>
    </div>
  );
}
