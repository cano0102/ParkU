import { useState } from "react";
import {
  IconUserCog as UserCog,
  IconMessage2 as Message,
} from "@tabler/icons-react";
import type { Usuario } from "@/services/api/usuarios";
import { theme } from "@/styles/theme";
import { ESTADO_CONFIG, type EstadoIncidente } from "../lib/constants";
import { recomiendaEncargado } from "../lib/transiciones";

const C = theme;

export interface CambioEstadoIncidenteModalProps {
  /** Estado al que se quiere mover el incidente. */
  destino: EstadoIncidente;
  /** Descripción del incidente, para saber cuál se está tocando. */
  descripcion: string;
  /** Candidatos a encargado: Administradores y Vigilantes. */
  usuariosAsignables: Usuario[];
  onCancel: () => void;
  onConfirm: (datos: { usuarioAsignadoId?: string; justificacionCierre?: string }) => void;
}

/**
 * El paso de confirmación que falta antes de mover un incidente de estado.
 *
 * Son dos cosas que el estado por sí solo no dice, y que después nadie puede reconstruir:
 *
 * - **Quién responde por él.** Es a quien se le pregunta después, así que se sugiere al
 *   avanzar — pero seguir sin asignarlo es una decisión válida y tiene su propio botón:
 *   bloquear el trabajo real por un dato administrativo no ayuda a nadie.
 * - **Por qué se descartó.** Esto sí se exige. Un reporte rechazado o cancelado sin motivo
 *   desaparece sin respuesta para quien se tomó el trabajo de levantarlo — y es justo lo que
 *   esa persona ve al entrar a mirar qué pasó con él.
 *
 * Nunca hacen falta las dos a la vez: avanzar sugiere encargado, descartar exige motivo.
 */
export function CambioEstadoIncidenteModal({
  destino, descripcion, usuariosAsignables, onCancel, onConfirm,
}: CambioEstadoIncidenteModalProps) {
  const pideEncargado = recomiendaEncargado(destino);
  const [usuarioAsignadoId, setUsuarioAsignadoId] = useState("");
  const [motivo, setMotivo] = useState("");

  const cfg = ESTADO_CONFIG[destino];
  /* El encargado se recomienda; el motivo se exige. Descartar un reporte sin explicar por qué
     lo deja sin respuesta para quien lo levantó, y eso sí bloquea. */
  const invalido = pideEncargado ? false : !motivo.trim();

  const confirmar = (conEncargado = true) => {
    if (invalido) return;
    onConfirm(pideEncargado
      ? (conEncargado && usuarioAsignadoId ? { usuarioAsignadoId } : {})
      : { justificacionCierre: motivo.trim() });
  };

  return (
    <div style={{ padding: "1.6rem 1.8rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{
          width: 34, height: 34, borderRadius: 10, background: cfg.bg, color: cfg.text,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {pideEncargado ? <UserCog size={17} /> : <Message size={17} />}
        </span>
        <h2 style={{ fontSize: 16, fontWeight: 900, color: C.text }}>
          {pideEncargado ? "¿Quién se hace cargo?" : `Motivo para marcar como ${cfg.label.toLowerCase()}`}
        </h2>
      </div>

      <p style={{ fontSize: 12, color: C.textLight, lineHeight: 1.5, marginBottom: 14 }}>
        {pideEncargado
          ? `Conviene que alguien responda por el incidente al pasarlo a "${cfg.label}": es a quien se le pregunta después. Puedes seguir sin asignarlo. Solo pueden encargarse Administradores y Vigilantes.`
          : "Quien reportó el incidente verá este motivo en su panel, así que explica por qué no procede."}
      </p>

      <div style={{ padding: "10px 12px", borderRadius: 10, background: "#F8FAFC", border: `1px solid ${C.border}`, marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: .5 }}>Incidente</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{descripcion}</div>
      </div>

      {pideEncargado ? (
        <label style={{ display: "block" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: C.text }}>Encargado</span>
          <select
            aria-label="Encargado del incidente"
            value={usuarioAsignadoId}
            onChange={(e) => setUsuarioAsignadoId(e.target.value)}
            style={{
              width: "100%", marginTop: 6, padding: "9px 10px", borderRadius: 10,
              border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#fff", color: C.text,
            }}
          >
            <option value="">Selecciona quién se hace cargo…</option>
            {usuariosAsignables.map((u) => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
          {usuariosAsignables.length === 0 && (
            <span style={{ display: "block", marginTop: 6, fontSize: 11, color: C.danger, fontWeight: 600 }}>
              No hay administradores ni vigilantes disponibles para asignar.
            </span>
          )}
        </label>
      ) : (
        <label style={{ display: "block" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: C.text }}>Motivo</span>
          <textarea
            aria-label="Motivo del cambio de estado"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            maxLength={255}
            placeholder="Explica por qué no procede este reporte…"
            style={{
              width: "100%", marginTop: 6, padding: "9px 10px", borderRadius: 10, resize: "vertical",
              border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", color: C.text,
            }}
          />
        </label>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${C.border}`,
            background: "#fff", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Cancelar
        </button>
        {/* Seguir sin encargado es una decisión válida, no un descuido: se ofrece como tal. */}
        {pideEncargado && (
          <button
            onClick={() => confirmar(false)}
            style={{
              flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${C.border}`,
              background: "#fff", color: C.textLight, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Continuar sin encargado
          </button>
        )}
        <button
          onClick={() => confirmar(true)}
          disabled={invalido || (pideEncargado && !usuarioAsignadoId)}
          style={{
            flex: 1, padding: "10px", borderRadius: 11, border: "none",
            background: invalido || (pideEncargado && !usuarioAsignadoId) ? C.border : C.primary, color: "#fff",
            fontSize: 13, fontWeight: 800,
            cursor: invalido || (pideEncargado && !usuarioAsignadoId) ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {pideEncargado ? "Asignar y continuar" : "Guardar motivo"}
        </button>
      </div>
    </div>
  );
}
