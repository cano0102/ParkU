import { Pencil, Sparkles } from "lucide-react";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";
import { Banner } from "@/components/shared";
import { EntityFormModal } from "@/components/data";
import {
  FormParqueadero, TIPOS_PARQUEADERO, capitalizar,
  NOMBRE_PQ_MAX, BLOQUE_PQ_MAX, DIRECCION_PQ_MAX, DESCRIPCION_PQ_MAX,
} from "../../lib/helpers";

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
      <EntityFormModal
        icon={isEdit ? <Pencil size={18} color={C.primary} /> : <Sparkles size={18} color={C.primary} />}
        eyebrow={isEdit ? "Editar Zona" : "Registro de Zona"}
        title={isEdit ? "Editar Parqueadero" : "Nuevo Parqueadero"}
        onSubmit={onSubmit}
        onCancel={onClose}
        isValid={true}
        submitLabel={isEdit ? "Guardar Cambios" : "Crear Parqueadero"}
      >
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
      </EntityFormModal>
    </Modal>
  );
}
