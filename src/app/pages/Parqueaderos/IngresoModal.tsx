import { AlertTriangle, Camera, Car, ChevronRight, UserCheck } from "lucide-react";
import type { Celda, Conductor, Vehiculo } from "../../context/DataContext";
import { theme } from "../../theme";
import { Modal } from "../../components/shared";
import { ModalHeader } from "./UiBits";
import { VehiculoForm } from "./helpers";

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
  ingresoConductorOk: boolean;
  ingresoValid: boolean;
  ingresoPlacaHint: string;
  /** Vehículo ya registrado en el sistema con esa placa, si existe. */
  vehiculoEncontrado: Vehiculo | null;
  /** Conductor asociado a ese vehículo, si el vehículo existe y tiene uno vinculado. */
  conductorEncontrado: Conductor | null;
  /** Conductor identificado por placa o por nombre exacto, activo o no (para avisar si está inactivo). */
  conductorIdentificado: Conductor | null;
  /** Nombres de conductores activos ya registrados en el módulo Conductores, para sugerirlos. */
  conductoresSugeridos: string[];
  /** Vehículos ya registrados a nombre del conductor identificado (por placa o por nombre). */
  vehiculosConductor: Vehiculo[];
  /** true si el parqueadero de la celda activa está desactivado (no acepta nuevos registros). */
  parqueaderoInactivo: boolean;
  onClose: () => void;
  onOpenScanner: () => void;
  onSubmit: () => void;
}

export function IngresoModal({
  open, celdaActiva, vehiculoForm, setVehiculoForm, placaError, onPlacaChange,
  ingresoPlacaOk, ingresoConductorOk, ingresoValid, ingresoPlacaHint,
  vehiculoEncontrado, conductorEncontrado, conductorIdentificado, conductoresSugeridos, vehiculosConductor,
  parqueaderoInactivo,
  onClose, onOpenScanner, onSubmit,
}: IngresoModalProps) {
  const vehiculoRegistrado = !!vehiculoEncontrado;
  const conductorAsociado = conductorEncontrado?.nombre ?? null;
  const conductorInactivo = conductorIdentificado?.estado === "inactivo";
  const datosVehiculoEnFicha = vehiculoEncontrado
    ? [vehiculoEncontrado.marca, vehiculoEncontrado.modelo, vehiculoEncontrado.color].filter(Boolean)
    : [];
  /* Su flota ya conocida, sin repetir la placa que se está tecleando ahora mismo (esa ya
     se muestra en la sección "Datos del vehículo" de más abajo). */
  const placaActual = vehiculoForm.placa.trim().toUpperCase();
  const otrosVehiculos = vehiculosConductor.filter(v => v.placa !== placaActual);
  const nombreConductorMostrado = conductorAsociado || vehiculoForm.conductor.trim();
  /* Si ya sabemos qué vehículos tiene este conductor y todavía no se eligió ninguna placa,
     no tiene sentido pedirle que rellene marca/modelo/color como si fuera un vehículo nuevo:
     mejor que elija una de la lista de arriba. Esos campos solo reaparecen si escribe una
     placa que de verdad no está entre las suyas (un vehículo adicional genuino). */
  const puedeElegirDeLaLista = otrosVehiculos.length > 0 && !placaActual;
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
          {conductorAsociado ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderRadius: 10, background: conductorInactivo ? C.dangerBg : C.primaryPale, border: `1px solid ${conductorInactivo ? C.dangerBorder : C.primaryBorder}`, marginBottom: 8 }}>
                {conductorInactivo ? <AlertTriangle size={14} color={C.danger} /> : <UserCheck size={14} color={C.primaryDark} />}
                <span style={{ fontSize: 11, fontWeight: 800, color: conductorInactivo ? C.danger : C.primaryDark }}>
                  {conductorInactivo ? "Conductor inactivo: no puede registrar vehículos" : "Vehículo ya registrado"}
                </span>
              </div>
              <input
                value={conductorAsociado}
                readOnly
                style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F1F5F9", color: C.text, cursor: "not-allowed" }}
              />
              {conductorInactivo && <p style={{ fontSize: 10, color: C.danger, marginTop: 6, fontWeight: 600 }}>Actívalo en el módulo Conductores para poder estacionar este vehículo.</p>}
            </>
          ) : (
            <>
              <input list="drivers" value={vehiculoForm.conductor} onChange={e => setVehiculoForm(p => ({ ...p, conductor: e.target.value }))} placeholder="Busca un conductor registrado o escribe uno nuevo" style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${vehiculoForm.conductor && !ingresoConductorOk ? C.danger : C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} />
              <datalist id="drivers">{conductoresSugeridos.map(c => <option key={c} value={c} />)}</datalist>
              {conductorInactivo && <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>Este conductor está inactivo y no puede registrar vehículos. Actívalo en el módulo Conductores.</p>}
              {!conductorInactivo && vehiculoForm.conductor && !ingresoConductorOk && <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>Ingresa nombre y apellido del conductor.</p>}
              {!conductorInactivo && !vehiculoForm.conductor && vehiculoRegistrado && <p style={{ fontSize: 11, color: C.warning, marginTop: 6, fontWeight: 700 }}>Este vehículo ya está registrado pero sin conductor asociado. Ingresa su nombre para completarlo.</p>}
              {!conductorInactivo && !vehiculoForm.conductor && !vehiculoRegistrado && ingresoPlacaOk && <p style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>Placa no encontrada: se registrará como un vehículo nuevo.</p>}
            </>
          )}
        </div>
        {otrosVehiculos.length > 0 && (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
              Vehículos ya registrados de {nombreConductorMostrado}
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {otrosVehiculos.map(v => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => { onPlacaChange(); setVehiculoForm(p => ({ ...p, placa: v.placa })); }}
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
            {puedeElegirDeLaLista && (
              <p style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>Toca una placa para usarla, o escribe una nueva arriba si trae otro vehículo.</p>
            )}
          </div>
        )}
        {!puedeElegirDeLaLista && (
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Datos del vehículo</label>
            {vehiculoEncontrado ? (
              datosVehiculoEnFicha.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {vehiculoEncontrado.marca && <span style={{ padding: "5px 10px", borderRadius: 8, background: "#F1F5F9", fontSize: 11, fontWeight: 700, color: C.text }}>{vehiculoEncontrado.marca}</span>}
                  {vehiculoEncontrado.modelo && <span style={{ padding: "5px 10px", borderRadius: 8, background: "#F1F5F9", fontSize: 11, fontWeight: 700, color: C.text }}>{vehiculoEncontrado.modelo}</span>}
                  {vehiculoEncontrado.color && <span style={{ padding: "5px 10px", borderRadius: 8, background: "#F1F5F9", fontSize: 11, fontWeight: 700, color: C.text }}>{vehiculoEncontrado.color}</span>}
                </div>
              ) : (
                <p style={{ fontSize: 10, color: C.textLight }}>Este vehículo no tiene marca, modelo ni color registrados.</p>
              )
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input value={vehiculoForm.marca} onChange={e => setVehiculoForm(p => ({ ...p, marca: e.target.value }))} placeholder="Marca (ej. Toyota)" style={campoInputStyle} />
                  <input value={vehiculoForm.modelo} onChange={e => setVehiculoForm(p => ({ ...p, modelo: e.target.value }))} placeholder="Modelo (ej. Corolla)" style={campoInputStyle} />
                </div>
                <input value={vehiculoForm.color} onChange={e => setVehiculoForm(p => ({ ...p, color: e.target.value }))} placeholder="Color (ej. Blanco)" style={{ ...campoInputStyle, marginTop: 8 }} />
                <p style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>Opcional. Se completa solo al escanear la matrícula con OCR, o puedes escribirlo a mano.</p>
              </>
            )}
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
