import { IconAlertTriangle as AlertTriangle, IconFileText as FileText } from "@tabler/icons-react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Usuario } from "@/services/api/usuarios";
import type { TipoNovedad, PrioridadNovedad } from "@/services/api/incidentes";
import { TIPO_NOVEDAD_LABEL, PRIORIDAD_LABEL } from "@/features/incidentes";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";
import { ModalHeader } from "@/components/shared";
import { IncidenteForm, Ocupante, formatearFechaHora, formatearDuracion } from "../../lib/helpers";

const C = theme;
const selectStyle = { width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", background: "#F8FAFC" } as const;
const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 } as const;

interface IncidenteModalProps {
  open: boolean;
  celdaActiva: Celda | null;
  ocupanteActivo: Ocupante | null;
  parqueaderoActivo: Parqueadero | null;
  incidenteForm: IncidenteForm;
  setIncidenteForm: React.Dispatch<React.SetStateAction<IncidenteForm>>;
  incidenteError: string | null;
  /** Ya filtrados a rol Vigilante — ver useParqueaderosData.ts. Vacío si el usuario actual no
   *  puede listar /api/usuarios (no es Admin) o no hay ningún Vigilante registrado. */
  usuariosAsignables: Usuario[];
  onClose: () => void;
  onSubmit: () => void;
}

export function IncidenteModal({
  open, celdaActiva, ocupanteActivo, parqueaderoActivo, incidenteForm, setIncidenteForm,
  incidenteError, usuariosAsignables, onClose, onSubmit,
}: IncidenteModalProps) {
  const entrada = ocupanteActivo ? formatearFechaHora(ocupanteActivo.fechaEntrada) : null;
  return (
    <Modal open={open} onClose={onClose} maxWidth={520}>
      <ModalHeader
        eyebrow={`Celda ${celdaActiva?.numero ?? ""} · ${ocupanteActivo?.vehiculo.placa || ""}`}
        title="Registrar Incidente"
        icon={<AlertTriangle size={18} color={C.primary} />}
        onClose={onClose}
      />
      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle} htmlFor="incidente-descripcion">Descripción del incidente *</label>
          <textarea
            id="incidente-descripcion"
            rows={3}
            value={incidenteForm.descripcion}
            onChange={(e) => setIncidenteForm(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Describe el incidente o novedad en la celda..."
            aria-invalid={!!incidenteError}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 11,
              border: `1px solid ${incidenteError ? C.danger : C.border}`,
              fontSize: 13,
              fontFamily: "inherit",
              background: "#F8FAFC",
              resize: "vertical",
              minHeight: 80,
              outline: "none",
            }}
          />
          {incidenteError && (
            <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>{incidenteError}</p>
          )}
        </div>

        <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle} htmlFor="incidente-tipo">Tipo</label>
            <select
              id="incidente-tipo"
              value={incidenteForm.tipoNovedad}
              onChange={(e) => setIncidenteForm(prev => ({ ...prev, tipoNovedad: e.target.value as TipoNovedad }))}
              style={selectStyle}
            >
              {(Object.keys(TIPO_NOVEDAD_LABEL) as TipoNovedad[]).map((t) => (
                <option key={t} value={t}>{TIPO_NOVEDAD_LABEL[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle} htmlFor="incidente-prioridad">Prioridad *</label>
            <select
              id="incidente-prioridad"
              value={incidenteForm.prioridad}
              onChange={(e) => setIncidenteForm(prev => ({ ...prev, prioridad: e.target.value as PrioridadNovedad }))}
              style={selectStyle}
            >
              {(Object.keys(PRIORIDAD_LABEL) as PrioridadNovedad[]).map((p) => (
                <option key={p} value={p}>{PRIORIDAD_LABEL[p]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle} htmlFor="incidente-asignado">Asignar a</label>
          <select
            id="incidente-asignado"
            value={incidenteForm.usuarioAsignadoId}
            onChange={(e) => setIncidenteForm(prev => ({ ...prev, usuarioAsignadoId: e.target.value }))}
            style={selectStyle}
          >
            <option value="">Sin asignar</option>
            {usuariosAsignables.map((u) => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
          {usuariosAsignables.length === 0 && (
            <p style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>
              Solo se puede asignar a un Vigilante — no hay ninguno disponible (o no tienes permiso para ver la lista de usuarios).
            </p>
          )}
        </div>

        <div data-testid="incidente-info-automatica" style={{ fontSize: 12, color: C.textLight, background: C.bg, padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: C.text }}>Información automática:</div>
          <div>Parqueadero: <strong>{parqueaderoActivo?.nombre || "No registrado"}</strong></div>
          <div>Celda: <strong>{celdaActiva?.numero || "No registrada"}</strong></div>
          <div>Vehículo: <strong>{ocupanteActivo?.vehiculo.placa || "No registrado"}</strong>{ocupanteActivo?.vehiculo.tipo ? ` (${ocupanteActivo.vehiculo.tipo})` : ""}</div>
          <div>Conductor: <strong>{ocupanteActivo?.conductor?.nombre || "No registrado"}</strong></div>
          {ocupanteActivo?.conductor && (
            <div>Documento: <strong>{ocupanteActivo.conductor.tipoDocumento} {ocupanteActivo.conductor.numeroDocumento}</strong></div>
          )}
          {entrada && (
            <>
              <div>Hora de entrada: <strong>{entrada.hora}</strong></div>
              <div>Tiempo de estadía: <strong>{formatearDuracion(ocupanteActivo!.fechaEntrada)}</strong></div>
            </>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "1rem 1.8rem", borderTop: `1px solid ${C.border}` }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
        <button
          onClick={onSubmit}
          disabled={!incidenteForm.descripcion.trim()}
          style={{
            padding: "10px 24px",
            borderRadius: 12,
            border: "none",
            background: incidenteForm.descripcion.trim() ? C.primary : "#E2E8F0",
            color: incidenteForm.descripcion.trim() ? "#fff" : C.textLight,
            fontSize: 13,
            fontWeight: 800,
            cursor: incidenteForm.descripcion.trim() ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: incidenteForm.descripcion.trim() ? "0 6px 18px rgba(57,169,0,.22)" : undefined,
          }}
        >
          <FileText size={16} />
          Registrar Incidente
        </button>
      </div>
    </Modal>
  );
}
