import type { Vehiculo } from "@/services/api/vehiculos";
import type { Usuario } from "@/services/api/usuarios";
import type { TipoNovedad, PrioridadNovedad } from "@/services/api/incidentes";
import { theme } from "@/styles/theme";
import { TIPO_NOVEDAD_LABEL, PRIORIDAD_LABEL } from "../lib/constants";

const C = theme;
const selectStyle = {
  width: "100%", padding: "11px 14px", borderRadius: 11,
  border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
  fontFamily: "inherit", background: "#F8FAFC",
} as const;

interface IncidenteVehiculoAsignadoFieldsProps {
  vehiculoId: string;
  usuarioAsignadoId: string;
  tipoNovedad: TipoNovedad;
  prioridad: PrioridadNovedad;
  vehiculos: Vehiculo[];
  /** Solo tiene datos si el usuario actual es Admin (único rol que puede listar /api/usuarios). */
  usuarios: Usuario[];
  showJustificacionCierre: boolean;
  justificacionCierre: string;
  onVehiculoChange: (value: string) => void;
  onUsuarioAsignadoChange: (value: string) => void;
  onTipoNovedadChange: (value: TipoNovedad) => void;
  onPrioridadChange: (value: PrioridadNovedad) => void;
  onJustificacionCierreChange: (value: string) => void;
}

/** Campos tipo/prioridad, vehículo, asignar a (solo Admin), y justificación de cierre. */
export function IncidenteVehiculoAsignadoFields({
  vehiculoId, usuarioAsignadoId, tipoNovedad, prioridad, vehiculos, usuarios,
  showJustificacionCierre, justificacionCierre,
  onVehiculoChange, onUsuarioAsignadoChange, onTipoNovedadChange, onPrioridadChange, onJustificacionCierreChange,
}: IncidenteVehiculoAsignadoFieldsProps) {
  return (
    <>
      <div className="incidentes-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label htmlFor="tipoNovedad" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            Tipo
          </label>
          <select id="tipoNovedad" value={tipoNovedad} onChange={(e) => onTipoNovedadChange(e.target.value as TipoNovedad)} style={selectStyle}>
            {(Object.keys(TIPO_NOVEDAD_LABEL) as TipoNovedad[]).map((t) => (
              <option key={t} value={t}>{TIPO_NOVEDAD_LABEL[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="prioridad" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            Prioridad
          </label>
          <select id="prioridad" value={prioridad} onChange={(e) => onPrioridadChange(e.target.value as PrioridadNovedad)} style={selectStyle}>
            {(Object.keys(PRIORIDAD_LABEL) as PrioridadNovedad[]).map((p) => (
              <option key={p} value={p}>{PRIORIDAD_LABEL[p]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="vehiculo" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
          Vehículo (opcional)
        </label>
        <select id="vehiculo" value={vehiculoId} onChange={(e) => onVehiculoChange(e.target.value)} style={selectStyle}>
          <option value="">Ninguno</option>
          {vehiculos.map((v) => (
            <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo ?? ""}</option>
          ))}
        </select>
        <p style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>
          Si seleccionas una celda ocupada, el vehículo se sugiere automáticamente.
        </p>
      </div>

      <div>
        <label htmlFor="asignadoA" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
          Asignar a
        </label>
        <select id="asignadoA" value={usuarioAsignadoId} onChange={(e) => onUsuarioAsignadoChange(e.target.value)} style={selectStyle}>
          <option value="">Sin asignar</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>{u.nombre}</option>
          ))}
        </select>
        {usuarios.length === 0 && (
          <p style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>
            Solo se puede asignar a un Vigilante — no hay ninguno disponible (o no tienes permiso para ver la lista de usuarios).
          </p>
        )}
      </div>

      {showJustificacionCierre && (
        <div>
          <label htmlFor="justificacionCierre" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
            Justificación de cierre
          </label>
          <textarea
            id="justificacionCierre"
            rows={2}
            placeholder="¿Qué se hizo para resolver el incidente?"
            value={justificacionCierre}
            onChange={(e) => onJustificacionCierreChange(e.target.value)}
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 11,
              border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
              fontFamily: "inherit", background: "#F8FAFC", resize: "none",
            }}
          />
        </div>
      )}
    </>
  );
}
