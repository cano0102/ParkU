import { Pencil, Sparkles } from "lucide-react";
import { theme } from "@/theme";
import { Modal } from "@/components/shared";
import { ModalHeader, Banner } from "./UiBits";
import {
  FormParqueadero, TIPOS_PARQUEADERO, capitalizar,
  NOMBRE_PQ_MAX, BLOQUE_PQ_MAX, DIRECCION_PQ_MAX, DESCRIPCION_PQ_MAX,
} from "./helpers";

const C = theme;

interface ParqueaderoFormModalProps {
  open: boolean;
  isEdit: boolean;
  pqForm: FormParqueadero;
  setPqForm: React.Dispatch<React.SetStateAction<FormParqueadero>>;
  formError: string | null;
  onClose: () => void;
  onSubmit: () => void;
}

export function ParqueaderoFormModal({ open, isEdit, pqForm, setPqForm, formError, onClose, onSubmit }: ParqueaderoFormModalProps) {
  const capacidadForm = pqForm.celdasCarros + pqForm.celdasMotos + pqForm.celdasMovilidadReducida;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader eyebrow={isEdit ? "Editar Zona" : "Registro de Zona"} title={isEdit ? "Editar Parqueadero" : "Nuevo Parqueadero"} icon={isEdit ? <Pencil size={18} color={C.primary} /> : <Sparkles size={18} color={C.primary} />} onClose={onClose} />
      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 14 }}>
        {formError && <Banner tone="danger" message={formError} />}
        <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Nombre *</label><input value={pqForm.nombre} maxLength={NOMBRE_PQ_MAX} onChange={e => setPqForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: PQ-8 Bloque D" style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
        <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Bloque *</label><input value={pqForm.bloque} maxLength={BLOQUE_PQ_MAX} onChange={e => setPqForm(p => ({ ...p, bloque: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
          <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Categoría</label><select value={pqForm.tipo} onChange={e => setPqForm(p => ({ ...p, tipo: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }}>{TIPOS_PARQUEADERO.map(t => <option key={t} value={t}>{capitalizar(t)}</option>)}</select></div>
        </div>
        <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Dirección</label><input value={pqForm.direccion} maxLength={DIRECCION_PQ_MAX} onChange={e => setPqForm(p => ({ ...p, direccion: e.target.value }))} placeholder="Ej: Calle 100 # 50-30" style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
        <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Hora apertura</label><input type="time" value={pqForm.horaInicio} onChange={e => setPqForm(p => ({ ...p, horaInicio: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
          <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Hora cierre</label><input type="time" value={pqForm.horaFin} onChange={e => setPqForm(p => ({ ...p, horaFin: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Celdas por tipo</label>
          <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <div>
              <span style={{ fontSize: 10, color: C.textLight, fontWeight: 700 }}>Carros</span>
              <input type="number" min={0} max={60} value={pqForm.celdasCarros} onChange={e => setPqForm(p => ({ ...p, celdasCarros: Math.max(0, Math.min(60, parseInt(e.target.value, 10) || 0)) }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} />
            </div>
            <div>
              <span style={{ fontSize: 10, color: C.textLight, fontWeight: 700 }}>Motos</span>
              <input type="number" min={0} max={60} value={pqForm.celdasMotos} onChange={e => setPqForm(p => ({ ...p, celdasMotos: Math.max(0, Math.min(60, parseInt(e.target.value, 10) || 0)) }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} />
            </div>
            <div>
              <span style={{ fontSize: 10, color: C.textLight, fontWeight: 700 }}>M. reducida</span>
              <input type="number" min={0} max={60} value={pqForm.celdasMovilidadReducida} onChange={e => setPqForm(p => ({ ...p, celdasMovilidadReducida: Math.max(0, Math.min(60, parseInt(e.target.value, 10) || 0)) }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} />
            </div>
          </div>
          <p style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>Capacidad total: <strong>{capacidadForm}</strong> celdas</p>
        </div>
        <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Descripción</label><input value={pqForm.descripcion} maxLength={DESCRIPCION_PQ_MAX} onChange={e => setPqForm(p => ({ ...p, descripcion: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "1rem 1.8rem", borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
        <button onClick={onSubmit} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 18px rgba(57,169,0,.22)" }}>{isEdit ? "Guardar Cambios" : "Crear Parqueadero"}</button>
      </div>
    </Modal>
  );
}
