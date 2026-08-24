import { memo, useEffect, useState } from "react";
import { Camera, Sparkles } from "lucide-react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { theme } from "@/theme";
import { Modal } from "@/components/shared";
import { ModalHeader, Banner } from "@/components/shared";
import {
  getTipoCeldaConfig, capitalizar, validarPlacaPorTipo, validarNombreConductor,
  tipoVehiculoDesdePlaca, esPlacaOficial, normalizarTexto, CONDUCTORES_SUGERIDOS,
} from "../../lib/helpers";

const C = theme;

/* ============================================================
   SMART ASSIGN MODAL
============================================================ */
export const SmartAssignModal = memo(({ open, parqueaderos, celdas, onClose, onAssign, openScanner, scannedPlate }: {
  open: boolean;
  parqueaderos: Parqueadero[];
  celdas: Celda[];
  onClose: () => void;
  onAssign: (celda: Celda, placa: string, conductor: string, esOficial: boolean) => void;
  openScanner: () => void;
  scannedPlate?: string;
}) => {
  const [placa, setPlaca] = useState("");
  const [conductor, setConductor] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState<"carro" | "moto">("carro");
  const [rol, setRol] = useState<"Estudiante" | "Docente" | "Administrativo" | "Visitante" | "Oficial">("Estudiante");
  const [recomendacion, setRecomendacion] = useState<{ celda: Celda; pq: Parqueadero; motivo: string } | null>(null);
  const [tocado, setTocado] = useState(false);

  useEffect(() => {
    if (!scannedPlate) return;
    setPlaca(scannedPlate);
    const detectado = tipoVehiculoDesdePlaca(scannedPlate);
    if (detectado) setTipoVehiculo(detectado);
  }, [scannedPlate]);

  useEffect(() => { if (open) setTocado(false); }, [open]);

  useEffect(() => {
    if (!open) return;
    let tipoPref = "general";
    if (rol === "Docente") tipoPref = "docentes";
    else if (rol === "Administrativo") tipoPref = "administrativos";
    else if (rol === "Visitante") tipoPref = "visitantes";
    if (tipoVehiculo === "moto") tipoPref = "motos";

    let found: { celda: Celda; pq: Parqueadero; motivo: string } | null = null;
    const buscarEn = (pqs: Parqueadero[], motivoBase: string) => {
      for (const pq of pqs) {
        const libre = celdas.find(c => c.parqueaderoId === pq.id && c.estado === "disponible" && c.tipo === tipoVehiculo);
        if (libre) return { celda: libre, pq, motivo: motivoBase };
      }
      return null;
    };
    found = buscarEn(parqueaderos.filter(p => p.tipo === tipoPref && p.estado === "activo"), `Zona preferencial ${tipoPref} disponible.`);
    if (!found) found = buscarEn(parqueaderos.filter(p => p.tipo === "general" && p.estado === "activo"), "Zona preferencial ocupada. Asignada zona general.");
    if (!found) found = buscarEn(parqueaderos.filter(p => p.estado === "activo"), "No hay cupo en la zona preferencial. Celda disponible en otra zona.");
    setRecomendacion(found);
  }, [open, tipoVehiculo, rol, parqueaderos, celdas]);

  const placaOk = validarPlacaPorTipo(placa, tipoVehiculo);
  const conductorOk = validarNombreConductor(conductor);
  const valid = placaOk && conductorOk && recomendacion !== null;
  const placaErrorMsg = tocado && placa.trim() && !placaOk
    ? `Formato inválido para ${tipoVehiculo === "moto" ? "moto (ej. ABC12D o ABC12)" : "carro (ej. ABC123)"}.`
    : null;
  const conductorErrorMsg = tocado && conductor.trim() && !conductorOk
    ? "Ingresa nombre y apellido del conductor."
    : null;

  return (
    <Modal open={open} onClose={onClose} maxWidth={560}>
      <ModalHeader eyebrow="Asistente Virtual" title="Asignación Inteligente" icon={<Sparkles size={18} color={C.primary} />} onClose={onClose} />
      <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 14 }}>
        <Banner tone="info" message="El sistema buscará la celda óptima libre según el perfil y tipo de vehículo." />
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Placa del Vehículo *</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={placa}
              onChange={e => setPlaca(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              onBlur={() => setTocado(true)}
              maxLength={6}
              placeholder={tipoVehiculo === "moto" ? "ABC12D" : "ABC123"}
              style={{ flex: 1, padding: "11px 14px", borderRadius: 11, border: `1px solid ${placaErrorMsg ? C.danger : C.border}`, fontSize: 13, fontFamily: "monospace", fontWeight: 700, outline: "none", background: "#F8FAFC" }}
            />
            <button onClick={openScanner} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 16px", borderRadius: 11, border: "none", background: C.text, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Camera size={14} />Escanear</button>
          </div>
          {placaErrorMsg
            ? <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>{placaErrorMsg}</p>
            : <p style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>Formato {tipoVehiculo === "moto" ? "moto: 3 letras + 2 números + letra final opcional (ABC12D o ABC12)" : "carro: 3 letras + 3 números (ABC123)"}</p>}
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Nombre Conductor *</label>
          <input list="smart-drivers" value={conductor} onChange={e => setConductor(e.target.value)} onBlur={() => setTocado(true)} placeholder="Nombre completo" style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${conductorErrorMsg ? C.danger : C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", background: "#F8FAFC" }} />
          <datalist id="smart-drivers">{CONDUCTORES_SUGERIDOS.map(c => <option key={c} value={c} />)}</datalist>
          {conductorErrorMsg && <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>{conductorErrorMsg}</p>}
        </div>
        <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Vehículo</label>
            <div style={{ display: "flex", borderRadius: 11, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              {(["carro", "moto"] as const).map(t => {
                const cfg = getTipoCeldaConfig(t);
                const Icon = cfg.icon;
                const active = tipoVehiculo === t;
                return (
                  <button key={t} onClick={() => setTipoVehiculo(t)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 8px", fontSize: 12, fontWeight: 700, border: "none", background: active ? cfg.accent : "#fff", color: active ? "#fff" : C.textLight, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                    <Icon size={13} strokeWidth={2.5}/>{capitalizar(t)}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Rol</label>
            <select value={rol} onChange={e => setRol(e.target.value as any)} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC", outline: "none" }}>
              <option value="Estudiante">Estudiante</option>
              <option value="Docente">Docente</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Visitante">Visitante</option>
              <option value="Oficial">Oficial SENA</option>
            </select>
          </div>
        </div>
        {recomendacion ? (
          <div style={{ borderRadius: 11, border: `1px solid ${C.border}`, background: "#F8FAFC", padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Asignación Sugerida</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: getTipoCeldaConfig(recomendacion.celda.tipo).accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontWeight: 900, fontSize: 13, color: getTipoCeldaConfig(recomendacion.celda.tipo).accentDark }}>{recomendacion.celda.numero}</div>
              <div><div style={{ fontWeight: 800, color: C.text, fontSize: 13 }}>{recomendacion.pq.nombre}</div><div style={{ fontSize: 10, color: C.textLight }}>{capitalizar(recomendacion.pq.tipo)} · Bloque {recomendacion.pq.bloque}</div></div>
            </div>
            <div style={{ padding: "8px 10px", borderRadius: 9, background: "#fff", border: `1px solid ${C.border}`, fontSize: 11, color: C.textLight }}>💡 {recomendacion.motivo}</div>
          </div>
        ) : <Banner tone="danger" message="No hay celdas libres disponibles para esta categoría." />}
      </div>
      <div style={{ display: "flex", gap: 10, borderTop: `1px solid ${C.border}`, padding: "1rem 1.8rem" }}>
        <button onClick={onClose} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", fontSize: 13, fontWeight: 700, color: C.text, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
        <button disabled={!valid} onClick={() => {
          if (!recomendacion) return;
          const eo = rol === "Oficial" || esPlacaOficial(placa);
          onAssign(recomendacion.celda, placa.toUpperCase(), normalizarTexto(conductor), eo);
          setPlaca(""); setConductor(""); setTocado(false); onClose();
        }} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "none", background: valid ? C.primary : "#E2E8F0", fontSize: 13, fontWeight: 800, color: valid ? "#fff" : C.textLight, cursor: valid ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: valid ? "0 6px 18px rgba(57,169,0,.22)" : undefined }}>
          Confirmar Asignación
        </button>
      </div>
    </Modal>
  );
});
SmartAssignModal.displayName="SmartAssignModal";
