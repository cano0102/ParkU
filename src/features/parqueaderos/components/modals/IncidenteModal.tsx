import { AlertTriangle, FileText } from "lucide-react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";
import { ModalHeader } from "@/components/shared";
import { IncidenteForm, Ocupante } from "../../lib/helpers";

const C = theme;

interface IncidenteModalProps {
  open: boolean;
  celdaActiva: Celda | null;
  ocupanteActivo: Ocupante | null;
  parqueaderoActivo: Parqueadero | null;
  incidenteForm: IncidenteForm;
  setIncidenteForm: React.Dispatch<React.SetStateAction<IncidenteForm>>;
  incidenteError: string | null;
  onClose: () => void;
  onSubmit: () => void;
}

export function IncidenteModal({
  open, celdaActiva, ocupanteActivo, parqueaderoActivo, incidenteForm, setIncidenteForm,
  incidenteError, onClose, onSubmit,
}: IncidenteModalProps) {
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
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Descripción del incidente *</label>
          <textarea
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
          <p style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>
            El tipo, la prioridad y la asignación se pueden completar después desde el módulo de Incidentes.
          </p>
        </div>

        <div style={{ fontSize: 12, color: C.textLight, background: C.bg, padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: C.text }}>Información automática:</div>
          <div>Vehículo: <strong>{ocupanteActivo?.vehiculo.placa || "No registrado"}</strong></div>
          <div>Conductor: <strong>{ocupanteActivo?.conductor?.nombre || "No registrado"}</strong></div>
          <div>Parqueadero: <strong>{parqueaderoActivo?.nombre || "No registrado"}</strong></div>
          <div>Celda: <strong>{celdaActiva?.numero || "No registrada"}</strong></div>
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
