import { IconPencil as Pencil, IconSparkles as Sparkles } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";
import { Banner } from "@/components/shared";
import { EntityFormModal } from "@/components/data";
import {
  FormParqueadero,
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
  // Al editar, estas cantidades vienen precargadas con las celdas ACTIVAS reales del
  // parqueadero (ver useParqueaderoForm.ts#openEdit), así que su suma es "celdas actuales".
  const totalCeldas = pqForm.celdasCarros + pqForm.celdasMotos + pqForm.celdasMovilidadReducida;
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
            <div>
              <label style={labelStyle}>Capacidad máxima *</label>
              <input type="number" min={1} max={500} value={pqForm.capacidadMaxima} onChange={e => setPqForm(p => ({ ...p, capacidadMaxima: Math.max(0, parseInt(e.target.value, 10) || 0) }))} style={fieldStyle} />
              <p style={{ fontSize: 11, color: totalCeldas > pqForm.capacidadMaxima ? C.danger : C.textLight, marginTop: 6, fontWeight: totalCeldas > pqForm.capacidadMaxima ? 700 : 400 }}>
                Celdas actuales: <strong>{totalCeldas}</strong> · Capacidad máxima: <strong>{pqForm.capacidadMaxima}</strong>
                {totalCeldas > pqForm.capacidadMaxima ? " — la capacidad no puede quedar por debajo de las celdas configuradas." : ""}
              </p>
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
              Acceso, categoría, zona, piso y horarios quedan con un valor por defecto — no se
              editan desde este formulario. Indica cuántas celdas generar de una vez (podés
              agregar más luego desde Celdas):
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle} htmlFor="pq-capacidad-crear">Capacidad máxima *</label>
              <input id="pq-capacidad-crear" type="number" min={1} max={500} value={pqForm.capacidadMaxima} onChange={e => setPqForm(p => ({ ...p, capacidadMaxima: Math.max(0, parseInt(e.target.value, 10) || 0) }))} style={fieldStyle} />
              <p style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>
                Techo de celdas del parqueadero: las cantidades de abajo no pueden superarlo.
              </p>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Descripción</label>
              <input value={pqForm.descripcion} maxLength={DESCRIPCION_PQ_MAX} onChange={e => setPqForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Ej: Parqueadero cubierto, acceso por la entrada principal" style={fieldStyle} />
            </div>
            {/* El estado NO se pide al crear: un parqueadero nuevo nace activo (ver emptyPqForm
                en useParqueaderoForm.ts). Se cambia después con el switch de la tarjeta, que
                además pide confirmación antes de desactivar. */}
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
