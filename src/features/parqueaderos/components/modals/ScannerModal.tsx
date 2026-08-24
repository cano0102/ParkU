import { Camera, CheckCircle2, Loader2, ScanLine, Upload } from "lucide-react";
import { theme } from "@/styles/theme";
import { CameraScanner } from "@/components/scanner";
import { Banner } from "@/components/shared";
import { PLACAS_DEMO } from "../../lib/helpers";

const C = theme;

interface ScannerModalProps {
  open: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  guiaRef: React.RefObject<HTMLDivElement>;
  camaraLista: boolean;
  onCamaraLista: () => void;
  ocrLoading: boolean;
  ocrError: string | null;
  ocrFlash: boolean;
  onClose: () => void;
  onCapture: () => void;
  onFileOCR: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSimOCR: (placa: string, conductor: string, rol: string, marca: string, modelo: string, color: string) => void;
}

export function ScannerModal({
  open, videoRef, guiaRef, camaraLista, onCamaraLista, ocrLoading, ocrError, ocrFlash,
  onClose, onCapture, onFileOCR, onSimOCR,
}: ScannerModalProps) {
  return (
    <CameraScanner
      open={open}
      onClose={onClose}
      icon={<ScanLine size={18} color={C.primary} />}
      eyebrow="Reconocimiento Óptico"
      title="Escanear Placa"
      maxWidth={440}
    >
      <div style={{ position: "relative", background: "#000", aspectRatio: "4/3", maxHeight: 320, overflow: "hidden" }}>
        <video ref={videoRef} autoPlay playsInline muted onLoadedMetadata={onCamaraLista} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div ref={guiaRef} style={{ width: "78%", maxWidth: 300, aspectRatio: "3/1", border: `3px solid ${C.primary}`, borderRadius: 10, boxShadow: `0 0 0 9999px rgba(15,23,42,.65)` }} />
        </div>
        {!camaraLista && !ocrError && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(15,23,42,.9)", color: "#fff" }}><Loader2 size={28} color={C.primary} style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 12, fontWeight: 700 }}>Iniciando cámara...</span></div>}
        {ocrLoading && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,.85)", color: "#fff" }}><Loader2 size={28} color={C.primary} style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 12, fontWeight: 700, marginTop: 8 }}>Analizando matrícula...</span></div>}
        {ocrFlash && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(57,169,0,.9)", color: "#fff" }}><CheckCircle2 size={36} /><span style={{ fontSize: 13, fontWeight: 800, marginTop: 8 }}>¡Detectada!</span></div>}
      </div>
      {ocrError && <div style={{ padding: "12px 1.8rem", background: C.dangerBg, borderBottom: `1px solid ${C.dangerBorder}` }}><Banner tone="danger" message={ocrError} /></div>}
      <div style={{ padding: "1rem 1.8rem", display: "flex", flexDirection: "column", gap: 12, background: "#F8FAFC", borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, color: C.textLight, cursor: "pointer" }}>
            <Upload size={14} />Cargar foto<input type="file" accept="image/*" onChange={onFileOCR} style={{ display: "none" }} />
          </label>
          <button onClick={onCapture} disabled={ocrLoading || !camaraLista} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(57,169,0,.25)" }}>
            <Camera size={15} />Capturar
          </button>
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Matrículas de prueba</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PLACAS_DEMO.map(d => (
              <button key={d.placa} onClick={() => onSimOCR(d.placa, d.conductor, d.rol, d.marca, d.modelo, d.color)} disabled={ocrLoading}
                style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", fontSize: 11, fontWeight: 700, color: C.text, cursor: "pointer", fontFamily: "monospace" }}>
                {d.placa} <span style={{ fontFamily: "sans-serif", color: C.textLight, fontSize: 9 }}>({d.rol})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </CameraScanner>
  );
}
