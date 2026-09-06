import { IconAlertTriangle as AlertTriangle, IconFileText as FileText } from "@tabler/icons-react";
import type { Celda } from "@/services/api/celdas";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Usuario } from "@/services/api/usuarios";
import type { TipoNovedad, PrioridadNovedad, ClaseNovedad } from "@/services/api/incidentes";
import { TIPO_NOVEDAD_LABEL, PRIORIDAD_LABEL, opcionesDeVehiculo } from "@/features/incidentes";
import { theme } from "@/styles/theme";
import { Modal, ModalHeader, SelectorBuscable } from "@/components/shared";
import { EvidenciasField } from "@/features/incidentes";
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
  /** Candidatos a "quién reporta". Puede venir vacío: se ofrece igual la propia cuenta. */
  usuariosReportantes?: Usuario[];
  /** Vehículos de quien figura como reportante. Solo se ofrecen cuando el reporte no viene ya
   *  sobre un vehículo concreto (desde una celda ocupada, por ejemplo). */
  vehiculosDelReportante?: Vehiculo[];
  /** true si el contexto ya trae vehículo: entonces no hay nada que elegir. */
  vehiculoFijado?: boolean;
  /** Las fotos elegidas, que se suben cuando el reporte ya existe. */
  evidencias?: File[];
  onEvidenciasChange?: (archivos: File[]) => void;
  /** Solo el personal del parqueadero registra novedades; a Comunidad SENA ni se le ofrece. */
  puedeRegistrarNovedades?: boolean;
  /** Lo que se está mirando al reportar (celda, vehículo, o solo el parqueadero). */
  etiquetaContexto?: string;
  onClose: () => void;
  onSubmit: () => void;
}

export function IncidenteModal({
  open, celdaActiva, ocupanteActivo, parqueaderoActivo, incidenteForm, setIncidenteForm,
  incidenteError, usuariosAsignables, usuariosReportantes = [], puedeRegistrarNovedades = false,
  vehiculosDelReportante = [], vehiculoFijado = false, evidencias = [], onEvidenciasChange,
  etiquetaContexto, onClose, onSubmit,
}: IncidenteModalProps) {
  const entrada = ocupanteActivo ? formatearFechaHora(ocupanteActivo.fechaEntrada) : null;
  /* Una novedad es una observación de la operación: no ocurre sobre una celda ni un vehículo,
     y no hay nada que clasificar ni priorizar. Pedir esos datos solo obligaba a inventarlos. */
  const esNovedad = incidenteForm.clase === "novedad";
  const puedeEnviar = !incidenteError && !!incidenteForm.descripcion.trim()
    && (esNovedad || (!!incidenteForm.tipoNovedad
      && (incidenteForm.tipoNovedad !== "otro" || !!incidenteForm.tipoOtro.trim())));
  return (
    <Modal open={open} onClose={onClose} maxWidth={520}>
      <ModalHeader
        eyebrow={etiquetaContexto ?? `Celda ${celdaActiva?.numero ?? ""} · ${ocupanteActivo?.vehiculo.placa || ""}`}
        title={esNovedad ? "Registrar Novedad" : "Registrar Incidente"}
        icon={<AlertTriangle size={18} color={C.primary} />}
        onClose={onClose}
      />
      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Lo primero, porque cambia todo lo demás: un incidente pide tipo, prioridad y ocurre
            sobre una celda; una novedad es solo una observación de la operación. */}
        <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: puedeRegistrarNovedades ? "1fr 1fr" : "1fr", gap: 12, alignItems: "start" }}>
        {puedeRegistrarNovedades && (
          <div>
            <label style={labelStyle} htmlFor="incidente-clase">¿Qué vas a reportar? *</label>
            <select
              id="incidente-clase"
              value={incidenteForm.clase}
              onChange={(e) => setIncidenteForm(prev => ({ ...prev, clase: e.target.value as ClaseNovedad }))}
              style={selectStyle}
            >
              <option value="incidente">Incidente — daño o problemática</option>
              <option value="novedad">Novedad — observación</option>
            </select>
          </div>
        )}

        {/* Un reporte sin autor no se le puede devolver a nadie. Por defecto es de quien está
            usando la aplicación; el personal puede dejarlo a nombre de quien se lo comunicó. */}
        {/* Con una sola opción no hay nada que buscar: solo un Administrador puede dejar el
            reporte a nombre de otra persona; el resto reporta siempre a su nombre. */}
        <SelectorBuscable
          id="incidente-reporta"
          label="Reportado por *"
          opciones={usuariosReportantes.map((u) => ({ id: u.id, titulo: u.nombre, subtitulo: u.correo }))}
          valor={incidenteForm.usuarioReportaId}
          onChange={(id) => setIncidenteForm(prev => ({ ...prev, usuarioReportaId: id }))}
          deshabilitado={usuariosReportantes.length <= 1}
          placeholder="Buscar por nombre o correo…"
          textoVacio="Ninguna cuenta coincide"
        />
        </div>

        <div>
          <label style={labelStyle} htmlFor="incidente-descripcion">{esNovedad ? "Descripción de la novedad *" : "Descripción del incidente *"}</label>
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

        {!esNovedad && (
          <>
            <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle} htmlFor="incidente-tipo">Tipo *</label>
                <select
                  id="incidente-tipo"
                  value={incidenteForm.tipoNovedad}
                  onChange={(e) => setIncidenteForm(prev => ({ ...prev, tipoNovedad: e.target.value as TipoNovedad | "" }))}
                  style={selectStyle}
                >
                  <option value="">Selecciona el tipo…</option>
                  {(Object.keys(TIPO_NOVEDAD_LABEL) as TipoNovedad[]).map((t) => (
                    <option key={t} value={t}>{TIPO_NOVEDAD_LABEL[t]}</option>
                  ))}
                </select>
              </div>
              {/* La prioridad la define el personal autorizado al aceptar el reporte: a
                  Comunidad SENA ni se le ofrece, y la API rechaza que la mande. */}
              {puedeRegistrarNovedades && (
                <div>
                  <label style={labelStyle} htmlFor="incidente-prioridad">Prioridad *</label>
                  <select
                    id="incidente-prioridad"
                    value={incidenteForm.prioridad}
                    onChange={(e) => setIncidenteForm(prev => ({ ...prev, prioridad: e.target.value as PrioridadNovedad | "" }))}
                    style={selectStyle}
                  >
                    <option value="">Selecciona la prioridad…</option>
                    {(Object.keys(PRIORIDAD_LABEL) as PrioridadNovedad[]).map((p) => (
                      <option key={p} value={p}>{PRIORIDAD_LABEL[p]}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Solo los vehículos de quien reporta: ofrecer la flota entera obligaba a buscar
                una placa entre cientos, y casi siempre es uno de los suyos. */}
            {!vehiculoFijado && (
              <SelectorBuscable
                id="incidente-vehiculo"
                label="Vehículo implicado"
                opciones={opcionesDeVehiculo(vehiculosDelReportante)}
                valor={incidenteForm.vehiculoId}
                onChange={(id) => setIncidenteForm(prev => ({ ...prev, vehiculoId: id }))}
                sugerirAlDesplegar={false}
                placeholder="Escribe la placa o el nombre del dueño…"
                textoVacio={vehiculosDelReportante.length === 0
                  ? "Quien reporta no tiene vehículos registrados"
                  : "Ninguna placa coincide"}
                textoSinSeleccion="Ninguno en particular"
              />
            )}

            {/* Una foto prueba lo que la descripción solo cuenta. No se piden en una novedad:
                una observación de turno no necesita respaldo gráfico. */}
            {onEvidenciasChange && (
              <EvidenciasField archivos={evidencias} onChange={onEvidenciasChange} />
            )}

            {/* "Otro" sin decir qué es no clasifica nada: esa precisión se perdía. */}
            {incidenteForm.tipoNovedad === "otro" && (
              <div>
                <label style={labelStyle} htmlFor="incidente-tipo-otro">¿De qué tipo se trata? *</label>
                <input
                  id="incidente-tipo-otro"
                  value={incidenteForm.tipoOtro}
                  onChange={(e) => setIncidenteForm(prev => ({ ...prev, tipoOtro: e.target.value }))}
                  maxLength={100}
                  placeholder="Ej.: fuga de agua, falla eléctrica…"
                  style={{ ...selectStyle, background: "#fff" }}
                />
              </div>
            )}
          </>
        )}

        {puedeRegistrarNovedades && (
          <SelectorBuscable
            id="incidente-asignado"
            label="Encargado"
            opciones={usuariosAsignables.map((u) => ({ id: u.id, titulo: u.nombre, subtitulo: u.correo }))}
            valor={incidenteForm.usuarioAsignadoId}
            onChange={(id) => setIncidenteForm(prev => ({ ...prev, usuarioAsignadoId: id }))}
            placeholder="Buscar por nombre o correo…"
            textoVacio="No hay nadie disponible para asignar"
            textoSinSeleccion="Sin asignar"
            ayuda="Se recomienda, no es obligatorio: es a quien se le pregunta después."
          />
        )}

        {!esNovedad && (
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
        )}
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "1rem 1.8rem", borderTop: `1px solid ${C.border}` }}>
        <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
        <button
          onClick={onSubmit}
          disabled={!puedeEnviar}
          style={{
            padding: "10px 24px",
            borderRadius: 12,
            border: "none",
            background: puedeEnviar ? C.primary : "#E2E8F0",
            color: puedeEnviar ? "#fff" : C.textLight,
            fontSize: 13,
            fontWeight: 800,
            cursor: puedeEnviar ? "pointer" : "not-allowed",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: puedeEnviar ? "0 6px 18px rgba(57,169,0,.22)" : undefined,
          }}
        >
          <FileText size={16} />
          {esNovedad ? "Registrar Novedad" : "Registrar Incidente"}
        </button>
      </div>
    </Modal>
  );
}
