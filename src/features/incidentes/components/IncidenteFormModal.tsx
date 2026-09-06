import { IconSparkles as Sparkles, IconX as X } from "@tabler/icons-react";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Usuario } from "@/services/api/usuarios";
import type { Celda } from "@/services/api/celdas";
import type { TipoNovedad, PrioridadNovedad, Incidente, ClaseNovedad } from "@/services/api/incidentes";
import { theme } from "@/styles/theme";
import { IncidenteBasicFields } from "./IncidenteBasicFields";
import { IncidenteVehiculoAsignadoFields } from "./IncidenteVehiculoAsignadoFields";

const C = theme;

interface IncidenteFormData {
  clase: ClaseNovedad;
  /** En qué consiste, cuando el tipo es "otro". */
  tipoOtro: string;
  /** Quién reporta: por defecto quien está usando la aplicación. */
  usuarioReportaId: string;
  descripcion: string;
  parqueaderoId: string;
  celdaId: string;
  vehiculoId: string;
  usuarioAsignadoId: string;
  tipoNovedad: TipoNovedad;
  prioridad: PrioridadNovedad;
  estado: Incidente["estado"];
  justificacionCierre: string;
}

const etiqueta = { display: "block", fontSize: 12, fontWeight: 700, color: theme.text, marginBottom: 6 } as const;
const campo = {
  width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${theme.border}`,
  fontSize: 13, fontFamily: "inherit", background: "#F8FAFC", outline: "none",
} as const;

interface IncidenteFormModalProps {
  isEditing: boolean;
  /** Candidatos a autor del reporte. Con uno solo el campo queda fijo: solo un Administrador
   *  puede dejarlo a nombre de otra persona. */
  usuariosReportantes: Usuario[];
  /** Solo el personal del parqueadero registra novedades. */
  puedeRegistrarNovedades: boolean;
  showJustificacionCierre: boolean;
  formData: IncidenteFormData;
  setFormData: (updater: (f: IncidenteFormData) => IncidenteFormData) => void;
  formTouched: { descripcion?: boolean; parqueaderoId?: boolean };
  formErrors: { descripcion: string; parqueaderoId: string };
  formInvalido: boolean;
  markTouched: (campo: "descripcion" | "parqueaderoId") => void;
  parqueaderos: Parqueadero[];
  vehiculos: Vehiculo[];
  usuarios: Usuario[];
  /** false para el flujo de Comunidad SENA (solo reporta): oculta prioridad y "Asignar a" —
   *  ver IncidenteVehiculoAsignadoFields. Por defecto true (Admin/Vigilante). */
  puedeClasificar?: boolean;
  celdasDelParqueadero: Celda[];
  celdaSeleccionada: Celda | undefined;
  ocupanteSeleccionado: { vehiculo: { id: string; placa: string }; conductorNombre?: string } | null;
  ocupanteDeCelda: (celdaId?: string) => { vehiculo: { placa: string } } | null;
  onParqueaderoChange: (value: string) => void;
  onCeldaChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

/** Modal de crear/editar incidente: header, campos y acciones. */
export function IncidenteFormModal({
  isEditing, usuariosReportantes, puedeRegistrarNovedades, showJustificacionCierre,
  formData, setFormData, formTouched, formErrors, formInvalido, markTouched,
  parqueaderos, vehiculos, usuarios, puedeClasificar = true, celdasDelParqueadero, celdaSeleccionada, ocupanteSeleccionado, ocupanteDeCelda,
  onParqueaderoChange, onCeldaChange, onClose, onSave,
}: IncidenteFormModalProps) {
  return (
    <div>
      <div
        style={{
          padding: "1.4rem 1.8rem",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: "rgba(57,169,0,.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Sparkles size={18} color={C.primary} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>
              Reporte de incidente
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1 }}>
              {isEditing ? "Editar Incidente" : "Nuevo Incidente"}
            </h2>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            width: 34, height: 34, borderRadius: 9,
            border: `1px solid ${C.border}`,
            background: "#fff", cursor: "pointer", color: C.textLight,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: "1.4rem 1.8rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Lo primero, porque cambia el resto: un incidente ocurre sobre una celda y exige
              tipo y prioridad; una novedad es una observación de la operación. */}
          {puedeRegistrarNovedades && (
            <div>
              <label htmlFor="incidente-form-clase" style={etiqueta}>¿Qué vas a registrar? *</label>
              <select
                id="incidente-form-clase"
                value={formData.clase}
                onChange={(e) => setFormData((f) => ({ ...f, clase: e.target.value as ClaseNovedad }))}
                style={campo}
              >
                <option value="incidente">Incidente — daño, choque o problemática</option>
                <option value="novedad">Novedad — observación de la operación</option>
              </select>
            </div>
          )}

          {/* Un reporte sin autor no se le puede devolver a nadie. */}
          <div>
            <label htmlFor="incidente-form-reporta" style={etiqueta}>Reportado por *</label>
            <select
              id="incidente-form-reporta"
              value={formData.usuarioReportaId}
              onChange={(e) => setFormData((f) => ({ ...f, usuarioReportaId: e.target.value }))}
              disabled={usuariosReportantes.length <= 1}
              style={{ ...campo, cursor: usuariosReportantes.length <= 1 ? "not-allowed" : "pointer" }}
            >
              {usuariosReportantes.map((u) => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </div>

          <IncidenteBasicFields
            descripcion={formData.descripcion}
            parqueaderoId={formData.parqueaderoId}
            celdaId={formData.celdaId}
            parqueaderos={parqueaderos}
            celdasDelParqueadero={celdasDelParqueadero}
            celdaSeleccionada={celdaSeleccionada}
            ocupanteSeleccionado={ocupanteSeleccionado}
            descripcionError={formTouched.descripcion ? formErrors.descripcion : undefined}
            parqueaderoError={formTouched.parqueaderoId ? formErrors.parqueaderoId : undefined}
            onDescripcionChange={(value) => setFormData((f) => ({ ...f, descripcion: value }))}
            onDescripcionBlur={() => markTouched("descripcion")}
            onParqueaderoChange={onParqueaderoChange}
            onParqueaderoBlur={() => markTouched("parqueaderoId")}
            onCeldaChange={onCeldaChange}
            ocupanteDeCelda={ocupanteDeCelda}
          />

          <IncidenteVehiculoAsignadoFields
            vehiculoId={formData.vehiculoId}
            usuarioAsignadoId={formData.usuarioAsignadoId}
            tipoNovedad={formData.tipoNovedad}
            tipoOtro={formData.tipoOtro}
            onTipoOtroChange={(value) => setFormData((f) => ({ ...f, tipoOtro: value }))}
            prioridad={formData.prioridad}
            vehiculos={vehiculos}
            usuarios={usuarios}
            puedeClasificar={puedeClasificar}
            showJustificacionCierre={showJustificacionCierre}
            justificacionCierre={formData.justificacionCierre}
            onVehiculoChange={(value) => setFormData((f) => ({ ...f, vehiculoId: value }))}
            onUsuarioAsignadoChange={(value) => setFormData((f) => ({ ...f, usuarioAsignadoId: value }))}
            onTipoNovedadChange={(value) => setFormData((f) => ({ ...f, tipoNovedad: value }))}
            onPrioridadChange={(value) => setFormData((f) => ({ ...f, prioridad: value }))}
            onJustificacionCierreChange={(value) => setFormData((f) => ({ ...f, justificacionCierre: value }))}
          />
        </div>
      </div>

      <div
        style={{
          padding: "1rem 1.8rem",
          borderTop: `1px solid ${C.border}`,
          display: "flex", gap: 10, justifyContent: "flex-end",
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: "10px 20px", borderRadius: 12,
            border: `1px solid ${C.border}`,
            background: "#fff", color: C.text,
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onSave}
          disabled={formInvalido}
          style={{
            padding: "10px 24px", borderRadius: 12,
            border: "none", background: formInvalido ? "#E2E8F0" : C.primary, color: formInvalido ? C.textLight : "#fff",
            fontSize: 13, fontWeight: 800, cursor: formInvalido ? "not-allowed" : "pointer", fontFamily: "inherit",
            boxShadow: formInvalido ? undefined : "0 6px 18px rgba(57,169,0,.22)",
          }}
        >
          {isEditing ? "Actualizar Incidente" : "Registrar Incidente"}
        </button>
      </div>
    </div>
  );
}
