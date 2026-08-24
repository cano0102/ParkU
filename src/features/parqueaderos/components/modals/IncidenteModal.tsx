import { AlertTriangle, FileText, Upload, X } from "lucide-react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";
import { ModalHeader, Banner } from "@/components/shared";
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
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveEvidencia: () => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function IncidenteModal({
  open, celdaActiva, ocupanteActivo, parqueaderoActivo, incidenteForm, setIncidenteForm,
  incidenteError, onFileChange, onRemoveEvidencia, onClose, onSubmit,
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
        {incidenteError && <Banner tone="danger" message={incidenteError} />}

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Descripción del incidente *</label>
          <textarea
            rows={3}
            value={incidenteForm.descripcion}
            onChange={(e) => setIncidenteForm(prev => ({ ...prev, descripcion: e.target.value }))}
            placeholder="Describe el incidente o novedad en la celda..."
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 11,
              border: `1px solid ${C.border}`,
              fontSize: 13,
              fontFamily: "inherit",
              background: "#F8FAFC",
              resize: "vertical",
              minHeight: 80,
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Asignar a (opcional)</label>
          <input
            type="text"
            value={incidenteForm.asignadoA}
            onChange={(e) => setIncidenteForm(prev => ({ ...prev, asignadoA: e.target.value }))}
            placeholder="Nombre del responsable"
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 11,
              border: `1px solid ${C.border}`,
              fontSize: 13,
              fontFamily: "inherit",
              background: "#F8FAFC",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Notas de resolución (opcional)</label>
          <textarea
            rows={2}
            value={incidenteForm.notasResolucion}
            onChange={(e) => setIncidenteForm(prev => ({ ...prev, notasResolucion: e.target.value }))}
            placeholder="¿Qué acciones se deben tomar o se tomaron?"
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: 11,
              border: `1px solid ${C.border}`,
              fontSize: 13,
              fontFamily: "inherit",
              background: "#F8FAFC",
              resize: "vertical",
              outline: "none",
            }}
          />
        </div>

        {/* Evidencia fotográfica */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            Evidencia fotográfica (opcional)
          </label>
          <div style={{
            borderRadius: 11, border: `2px dashed ${C.border}`,
            background: "#F8FAFC", overflow: "hidden",
            transition: "border-color .2s",
          }}>
            <input
              type="file"
              id="evidenciaIncidente"
              accept="image/*"
              onChange={onFileChange}
              style={{ display: "none" }}
            />
            {incidenteForm.evidencia ? (
              <div style={{ padding: "12px", textAlign: "center", position: "relative" }}>
                <button
                  onClick={onRemoveEvidencia}
                  aria-label="Quitar evidencia"
                  style={{
                    position: "absolute", top: 8, right: 8,
                    width: 24, height: 24, borderRadius: 7,
                    border: "none", background: "rgba(15,23,42,.55)",
                    color: "#fff", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <X size={13} />
                </button>
                <img
                  src={incidenteForm.evidencia}
                  alt="Evidencia del incidente"
                  style={{ maxHeight: 120, margin: "0 auto", borderRadius: 8 }}
                />
                <p style={{ fontSize: 11, color: C.primary, marginTop: 8 }}>Evidencia cargada ✓</p>
              </div>
            ) : (
              <label htmlFor="evidenciaIncidente" style={{ cursor: "pointer", display: "block" }}>
                <div style={{ padding: "16px", textAlign: "center" }}>
                  <Upload size={32} color={C.textLight} style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 12, color: C.textLight }}>Toca para cargar imagen de evidencia</p>
                  <p style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Formatos: JPG, PNG, GIF · Máximo 5MB</p>
                </div>
              </label>
            )}
          </div>
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
