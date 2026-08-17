import { Camera, Car } from "lucide-react";
import type { Celda } from "../../context/DataContext";
import { theme } from "../../theme";
import { Modal } from "../../components/shared";
import { ModalHeader } from "./UiBits";
import { VehiculoForm, CONDUCTORES_SUGERIDOS } from "./helpers";

const C = theme;

interface IngresoModalProps {
  open: boolean;
  celdaActiva: Celda | null;
  vehiculoForm: VehiculoForm;
  setVehiculoForm: React.Dispatch<React.SetStateAction<VehiculoForm>>;
  placaError: string | null;
  onPlacaChange: () => void;
  ingresoPlacaOk: boolean;
  ingresoConductorOk: boolean;
  ingresoValid: boolean;
  ingresoPlacaHint: string;
  onClose: () => void;
  onOpenScanner: () => void;
  onSubmit: () => void;
}

export function IngresoModal({
  open, celdaActiva, vehiculoForm, setVehiculoForm, placaError, onPlacaChange,
  ingresoPlacaOk, ingresoConductorOk, ingresoValid, ingresoPlacaHint,
  onClose, onOpenScanner, onSubmit,
}: IngresoModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader eyebrow={`Celda ${celdaActiva?.numero ?? ""}`} title="Registrar Vehículo" icon={<Car size={18} color={C.primary} />} onClose={onClose} />
      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Placa *</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={vehiculoForm.placa}
              onChange={e => { onPlacaChange(); setVehiculoForm(p => ({ ...p, placa: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })); }}
              placeholder={celdaActiva?.tipo === "moto" ? "ABC12D" : "ABC123"}
              maxLength={6}
              style={{ flex: 1, padding: "11px 14px", borderRadius: 11, border: `1px solid ${vehiculoForm.placa && !ingresoPlacaOk ? C.danger : C.border}`, fontSize: 13, fontFamily: "monospace", fontWeight: 700, background: "#F8FAFC" }}
            />
            <button onClick={onOpenScanner} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 14px", borderRadius: 11, border: "none", background: C.text, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Camera size={14} />OCR</button>
          </div>
          {placaError ? (
            <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>{placaError}</p>
          ) : vehiculoForm.placa && !ingresoPlacaOk ? (
            <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>{ingresoPlacaHint}</p>
          ) : (
            <p style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>{ingresoPlacaHint}</p>
          )}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Conductor *</label>
          <input list="drivers" value={vehiculoForm.conductor} onChange={e => setVehiculoForm(p => ({ ...p, conductor: e.target.value }))} placeholder="Nombre y apellido" style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${vehiculoForm.conductor && !ingresoConductorOk ? C.danger : C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} />
          <datalist id="drivers">{CONDUCTORES_SUGERIDOS.map(c => <option key={c} value={c} />)}</datalist>
          {vehiculoForm.conductor && !ingresoConductorOk && <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>Ingresa nombre y apellido del conductor.</p>}
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#F8FAFC", cursor: "pointer" }}>
          <input type="checkbox" checked={vehiculoForm.esOficial} onChange={e => setVehiculoForm(p => ({ ...p, esOficial: e.target.checked }))} style={{ width: 16, height: 16, accentColor: C.primary }} />
          <div><div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>Oficial SENA</div><div style={{ fontSize: 10, color: C.textLight }}>Vehículo institucional</div></div>
        </label>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "1rem 1.8rem", borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
        <button disabled={!ingresoValid} onClick={onSubmit}
          style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: ingresoValid ? C.primary : "#E2E8F0", color: ingresoValid ? "#fff" : C.textLight, fontSize: 13, fontWeight: 800, cursor: ingresoValid ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: ingresoValid ? "0 6px 18px rgba(57,169,0,.22)" : undefined }}>
          Registrar Vehículo
        </button>
      </div>
    </Modal>
  );
}
