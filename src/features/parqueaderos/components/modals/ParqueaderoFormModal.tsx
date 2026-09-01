import { Pencil, Sparkles } from "lucide-react";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";
import { Banner } from "@/components/shared";
import { EntityFormModal } from "@/components/data";
import {
  FormParqueadero, TIPOS_PARQUEADERO, ACCESOS_PARQUEADERO, capitalizar,
  NOMBRE_PQ_MAX, UBICACION_PQ_MAX, DESCRIPCION_PQ_MAX,
} from "../../lib/helpers";

const C = theme;
const fieldStyle = { width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" } as const;
const labelStyle = { display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 } as const;

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
  return (
    <Modal open={open} onClose={onClose}>
      <EntityFormModal
        icon={isEdit ? <Pencil size={18} color={C.primary} /> : <Sparkles size={18} color={C.primary} />}
        eyebrow={isEdit ? "Editar Zona" : "Registro de Zona"}
        title={isEdit ? "Editar Parqueadero" : "Nuevo Parqueadero"}
        onSubmit={onSubmit}
        onCancel={onClose}
        isValid={!formError}
        submitLabel={isEdit ? "Guardar Cambios" : "Crear Parqueadero"}
      >
        {formError && <Banner tone="danger" message={formError} />}
        <div>
          <label style={labelStyle}>Nombre *</label>
          <input value={pqForm.nombre} maxLength={NOMBRE_PQ_MAX} onChange={e => setPqForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: PQ-8 Bloque D" style={fieldStyle} />
        </div>
        <div>
          <label style={labelStyle}>Ubicación *</label>
          <input value={pqForm.ubicacion} maxLength={UBICACION_PQ_MAX} onChange={e => setPqForm(p => ({ ...p, ubicacion: e.target.value }))} placeholder="Ej: Acceso Regional - Torre Sur" style={fieldStyle} />
        </div>
        {isEdit ? (
          <>
            <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Acceso</label>
                <select value={pqForm.acceso} onChange={e => setPqForm(p => ({ ...p, acceso: e.target.value as FormParqueadero["acceso"] }))} style={fieldStyle}>
                  {ACCESOS_PARQUEADERO.map(a => <option key={a} value={a}>{a === "regional" ? "Regional" : "Avenida Boyacá"}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Categoría</label>
                <select value={pqForm.tipo} onChange={e => setPqForm(p => ({ ...p, tipo: e.target.value as FormParqueadero["tipo"] }))} style={fieldStyle}>
                  {TIPOS_PARQUEADERO.map(t => <option key={t} value={t}>{capitalizar(t.replace("_", " "))}</option>)}
                </select>
              </div>
            </div>
            <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Zona</label>
                <input value={pqForm.zona} onChange={e => setPqForm(p => ({ ...p, zona: e.target.value }))} placeholder="Ej: Torre Sur" style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Piso</label>
                <input value={pqForm.piso} onChange={e => setPqForm(p => ({ ...p, piso: e.target.value }))} placeholder="Ej: Nivel 1" style={fieldStyle} />
              </div>
            </div>
            <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Hora apertura</label>
                <input type="time" value={pqForm.horaInicio} onChange={e => setPqForm(p => ({ ...p, horaInicio: e.target.value }))} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Hora cierre</label>
                <input type="time" value={pqForm.horaFin} onChange={e => setPqForm(p => ({ ...p, horaFin: e.target.value }))} style={fieldStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Capacidad máxima *</label>
              <input type="number" min={1} max={500} value={pqForm.capacidadMaxima} onChange={e => setPqForm(p => ({ ...p, capacidadMaxima: Math.max(0, parseInt(e.target.value, 10) || 0) }))} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Descripción</label>
              <input value={pqForm.descripcion} maxLength={DESCRIPCION_PQ_MAX} onChange={e => setPqForm(p => ({ ...p, descripcion: e.target.value }))} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Cantidad de celdas por tipo</label>
              <p style={{ fontSize: 11, color: C.textLight, marginBottom: 10 }}>
                Si subes un número, se generan celdas nuevas (o se reactivan las que ya estuvieran desactivadas). Si lo
                bajas, se desactivan las que sobren — nunca una celda ocupada o con una reserva activa; si no hay
                suficientes libres, esa cantidad puntual no se puede reducir y te lo avisamos al guardar.
              </p>
              <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle} htmlFor="pq-celdas-carro-edit">Celdas de carro</label>
                  <input id="pq-celdas-carro-edit" type="number" min={0} max={200} value={pqForm.celdasCarros} onChange={e => setPqForm(p => ({ ...p, celdasCarros: Math.max(0, parseInt(e.target.value, 10) || 0) }))} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="pq-celdas-moto-edit">Celdas de moto</label>
                  <input id="pq-celdas-moto-edit" type="number" min={0} max={200} value={pqForm.celdasMotos} onChange={e => setPqForm(p => ({ ...p, celdasMotos: Math.max(0, parseInt(e.target.value, 10) || 0) }))} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="pq-celdas-pmr-edit">Movilidad reducida</label>
                  <input id="pq-celdas-pmr-edit" type="number" min={0} max={200} value={pqForm.celdasMovilidadReducida} onChange={e => setPqForm(p => ({ ...p, celdasMovilidadReducida: Math.max(0, parseInt(e.target.value, 10) || 0) }))} style={fieldStyle} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>
            <p style={{ fontSize: 11, color: C.textLight, marginBottom: 10 }}>
              Acceso, categoría, zona, piso, horarios y descripción quedan con un valor por
              defecto — puedes ajustarlos después editando el parqueadero. Indica cuántas celdas
              generar de una vez (podés agregar más luego desde Celdas):
            </p>
            <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle} htmlFor="pq-celdas-carro">Celdas de carro</label>
                <input id="pq-celdas-carro" type="number" min={0} max={200} value={pqForm.celdasCarros} onChange={e => setPqForm(p => ({ ...p, celdasCarros: Math.max(0, parseInt(e.target.value, 10) || 0) }))} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="pq-celdas-moto">Celdas de moto</label>
                <input id="pq-celdas-moto" type="number" min={0} max={200} value={pqForm.celdasMotos} onChange={e => setPqForm(p => ({ ...p, celdasMotos: Math.max(0, parseInt(e.target.value, 10) || 0) }))} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="pq-celdas-pmr">Movilidad reducida</label>
                <input id="pq-celdas-pmr" type="number" min={0} max={200} value={pqForm.celdasMovilidadReducida} onChange={e => setPqForm(p => ({ ...p, celdasMovilidadReducida: Math.max(0, parseInt(e.target.value, 10) || 0) }))} style={fieldStyle} />
              </div>
            </div>
          </div>
        )}
      </EntityFormModal>
    </Modal>
  );
}
