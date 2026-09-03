import { AlertTriangle, Camera, Car, ChevronRight, IdCard, Plus, UserCheck, UserPlus } from "lucide-react";
import type { Celda } from "@/services/api/celdas";
import type { Conductor } from "@/services/api/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";
import { ModalHeader } from "@/components/shared";
import { VehiculoForm } from "../../lib/helpers";
import { ConductorSearchField } from "@/features/conductores";

const C = theme;

const campoInputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`,
  fontSize: 13, fontFamily: "inherit", background: "#F8FAFC",
};

interface IngresoModalProps {
  open: boolean;
  celdaActiva: Celda | null;
  vehiculoForm: VehiculoForm;
  setVehiculoForm: React.Dispatch<React.SetStateAction<VehiculoForm>>;
  placaError: string | null;
  onPlacaChange: () => void;
  ingresoPlacaOk: boolean;
  ingresoValid: boolean;
  ingresoPlacaHint: string;
  /** true si la placa escrita ya está estacionada en otra celda distinta a la activa. */
  placaYaEstacionada: boolean;
  /** Vehículo ya registrado en el sistema con esa placa, si existe. */
  vehiculoEncontrado: Vehiculo | null;
  /** Coincidencias parciales mientras se escribe la placa (p. ej. "AB" -> ABC123, ABD456...),
   *  vacío una vez que la placa ya coincide exacto con `vehiculoEncontrado`. */
  sugerenciasPlaca: Vehiculo[];
  /** Conductor identificado (buscador estructurado, placa, o nombre exacto por OCR), activo o
   *  no (para avisar si está inactivo). */
  conductorIdentificado: Conductor | null;
  /** Lista completa de conductores, para el buscador por documento/nombre/correo. */
  conductores: Conductor[];
  /** Texto del buscador de conductor (paso 1 del asistente) — independiente del nombre ya
   *  confirmado en `vehiculoForm.conductor`. */
  conductorQuery: string;
  onConductorQueryChange: (value: string) => void;
  onSelectConductor: (conductor: Conductor) => void;
  /** Vuelve al paso de búsqueda de conductor (botón "Cambiar"). */
  onCambiarConductor: () => void;
  /** Abre el formulario completo de alta de conductor (con su primer vehículo). */
  onCrearConductor: () => void;
  /** Abre el formulario de alta de un vehículo nuevo para el conductor ya identificado. */
  onCrearVehiculo: () => void;
  /** Selecciona uno de los vehículos ya registrados del conductor identificado. */
  onSelectVehiculo: (vehiculo: Vehiculo) => void;
  /** Vehículos ya registrados a nombre del conductor identificado. */
  vehiculosConductor: Vehiculo[];
  /** true si el parqueadero de la celda activa está desactivado (no acepta nuevos registros). */
  parqueaderoInactivo: boolean;
  /** Motivo por el que no se puede estacionar este vehículo aquí ahora mismo (celda reservada
   *  para otro vehículo, o el conductor ya tiene otro vehículo suyo en uso), o null si no aplica. */
  motivoBloqueoLive: string | null;
  onClose: () => void;
  onOpenScanner: () => void;
  onSubmit: () => void;
}

export function IngresoModal({
  open, celdaActiva, vehiculoForm, setVehiculoForm, placaError, onPlacaChange,
  ingresoPlacaOk, ingresoValid, ingresoPlacaHint, placaYaEstacionada,
  vehiculoEncontrado, sugerenciasPlaca, conductorIdentificado, conductores, conductorQuery, onConductorQueryChange,
  onSelectConductor, onCambiarConductor, onCrearConductor, onCrearVehiculo, onSelectVehiculo, vehiculosConductor,
  parqueaderoInactivo, motivoBloqueoLive,
  onClose, onOpenScanner, onSubmit,
}: IngresoModalProps) {
  const conductorInactivo = conductorIdentificado?.estado === "inactivo";
  const datosVehiculoEnFicha = vehiculoEncontrado
    ? [vehiculoEncontrado.marca, vehiculoEncontrado.modelo, vehiculoEncontrado.color].filter(Boolean)
    : [];
  /* Su flota ya conocida, sin repetir la placa que ya está seleccionada ahora mismo. */
  const placaActual = vehiculoForm.placa.trim().toUpperCase();
  const otrosVehiculos = vehiculosConductor.filter(v => v.placa !== placaActual);
  /* El bloque de "Datos del vehículo" (marca/modelo/color escritos a mano) solo tiene sentido
     como respaldo del escáner OCR: una placa ya tecleada/detectada que no coincide con ningún
     vehículo del conductor identificado. El alta estructurada de un vehículo nuevo pasa por
     "Agregar vehículo nuevo" (onCrearVehiculo), que sí exige marca y color. */
  const mostrarDatosVehiculoManual = !!placaActual && !vehiculoEncontrado;
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader eyebrow={`Celda ${celdaActiva?.numero ?? ""}`} title="Registrar Vehículo" icon={<Car size={18} color={C.primary} />} onClose={onClose} />
      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 14 }}>
        {parqueaderoInactivo && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: C.dangerBg, border: `1px solid ${C.dangerBorder}` }}>
            <AlertTriangle size={15} color={C.danger} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.danger }}>Este parqueadero está inactivo y no acepta nuevos registros.</span>
          </div>
        )}
        {motivoBloqueoLive && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, background: C.dangerBg, border: `1px solid ${C.dangerBorder}` }}>
            <AlertTriangle size={15} color={C.danger} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.danger }}>{motivoBloqueoLive}</span>
          </div>
        )}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Placa *</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={vehiculoForm.placa}
              onChange={e => { onPlacaChange(); setVehiculoForm(p => ({ ...p, placa: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })); }}
              placeholder={celdaActiva?.tipo === "moto" ? "ABC12D" : "ABC123"}
              maxLength={6}
              style={{ flex: 1, padding: "11px 14px", borderRadius: 11, border: `1px solid ${(vehiculoForm.placa && !ingresoPlacaOk) || placaYaEstacionada ? C.danger : C.border}`, fontSize: 13, fontFamily: "monospace", fontWeight: 700, background: "#F8FAFC" }}
            />
            <button onClick={onOpenScanner} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 14px", borderRadius: 11, border: "none", background: C.text, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Camera size={14} />OCR</button>
          </div>
          {placaError ? (
            <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>{placaError}</p>
          ) : vehiculoForm.placa && !ingresoPlacaOk ? (
            <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>{ingresoPlacaHint}</p>
          ) : placaYaEstacionada ? (
            <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>Este vehículo ya está estacionado en otra celda.</p>
          ) : (
            <p style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>{ingresoPlacaHint}</p>
          )}
          {sugerenciasPlaca.length > 0 && (
            <div style={{ marginTop: 8, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              {sugerenciasPlaca.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => { onPlacaChange(); setVehiculoForm(p => ({ ...p, placa: v.placa })); }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
                    padding: "8px 12px", border: "none", borderBottom: `1px solid ${C.border}`, background: "#fff",
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  }}
                >
                  <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 12, color: C.text }}>{v.placa}</span>
                  <span style={{ fontSize: 11, color: C.textLight }}>{v.conductorNombre || "Sin conductor"}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Conductor *</label>
          {conductorIdentificado ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 10, background: conductorInactivo ? C.dangerBg : C.primaryPale, border: `1px solid ${conductorInactivo ? C.dangerBorder : C.primaryBorder}` }}>
                {conductorInactivo ? <AlertTriangle size={14} color={C.danger} /> : <UserCheck size={14} color={C.primaryDark} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: conductorInactivo ? C.danger : C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conductorIdentificado.nombre}</p>
                  <p style={{ fontSize: 10, color: conductorInactivo ? C.danger : C.textLight, display: "flex", alignItems: "center", gap: 4 }}>
                    <IdCard size={10} /> {conductorIdentificado.numeroDocumento}
                  </p>
                </div>
                <button type="button" onClick={onCambiarConductor} style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cambiar</button>
              </div>
              {conductorInactivo && <p style={{ fontSize: 10, color: C.danger, marginTop: 6, fontWeight: 600 }}>Este conductor está inactivo y no puede registrar vehículos. Actívalo en el módulo Conductores.</p>}
            </>
          ) : (
            <>
              <ConductorSearchField
                conductores={conductores}
                query={conductorQuery}
                onQueryChange={onConductorQueryChange}
                onSelect={onSelectConductor}
                placeholder="Busca por documento, nombre o correo..."
              />
              <button type="button" onClick={onCrearConductor} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, padding: "8px 12px", borderRadius: 10, border: `1px dashed ${C.border}`, background: "transparent", color: C.primaryDark, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                <UserPlus size={14} /> Crear conductor nuevo
              </button>
              {vehiculoForm.conductor && (
                <p style={{ fontSize: 10, color: C.warning, marginTop: 6, fontWeight: 600 }}>
                  No se encontró un conductor registrado como "{vehiculoForm.conductor}". Búscalo arriba por documento o correo, o créalo.
                </p>
              )}
            </>
          )}
        </div>
        {conductorIdentificado && !conductorInactivo && (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Vehículo *</label>
            {otrosVehiculos.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                {otrosVehiculos.map(v => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => { onPlacaChange(); onSelectVehiculo(v); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 9, border: `1px solid ${C.border}`, background: "#F8FAFC", cursor: "pointer", fontFamily: "inherit", width: "100%", textAlign: "left" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F1F5F9")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#F8FAFC")}
                  >
                    <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 12, color: C.text }}>{v.placa}</span>
                    <span style={{ fontSize: 10, color: C.textLight, textTransform: "capitalize" }}>{v.tipo}</span>
                    <span style={{ fontSize: 11, color: C.textLight, flex: 1, textAlign: "right" }}>
                      {[v.marca, v.modelo].filter(Boolean).join(" ") || "Sin datos"}{v.color ? ` · ${v.color}` : ""}
                    </span>
                    <ChevronRight size={13} color={C.textLight} />
                  </button>
                ))}
              </div>
            )}
            {vehiculoEncontrado && placaActual && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 10, background: C.primaryPale, border: `1px solid ${C.primaryBorder}`, marginBottom: 8 }}>
                <Car size={14} color={C.primaryDark} />
                <span style={{ fontSize: 12, fontWeight: 800, color: C.primaryDark, fontFamily: "monospace" }}>{vehiculoEncontrado.placa}</span>
                <span style={{ fontSize: 11, color: C.primaryDark, flex: 1 }}>{datosVehiculoEnFicha.join(" · ") || "Sin marca/color registrados"}</span>
              </div>
            )}
            {otrosVehiculos.length === 0 && !vehiculoEncontrado && (
              <p style={{ fontSize: 11, color: C.textLight, marginBottom: 8 }}>{conductorIdentificado.nombre} no tiene vehículos registrados todavía.</p>
            )}
            <button type="button" onClick={onCrearVehiculo} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 10, border: `1px dashed ${C.border}`, background: "transparent", color: C.primaryDark, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              <Plus size={14} /> Agregar vehículo nuevo
            </button>
          </div>
        )}
        {mostrarDatosVehiculoManual && (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Datos del vehículo detectado</label>
            <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 8 }}>
              <input value={vehiculoForm.marca} onChange={e => setVehiculoForm(p => ({ ...p, marca: e.target.value }))} placeholder="Marca (ej. Toyota) *" style={campoInputStyle} />
              <input value={vehiculoForm.modelo} onChange={e => setVehiculoForm(p => ({ ...p, modelo: e.target.value }))} placeholder="Modelo (ej. Corolla)" style={campoInputStyle} />
            </div>
            <input value={vehiculoForm.color} onChange={e => setVehiculoForm(p => ({ ...p, color: e.target.value }))} placeholder="Color (ej. Blanco) *" style={{ ...campoInputStyle, marginTop: 8 }} />
            <p style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>
              Esta placa no está entre los vehículos registrados de {conductorIdentificado?.nombre ?? "este conductor"} (típico tras escanearla con OCR). Marca y color son obligatorios para registrarla.
            </p>
          </div>
        )}
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
