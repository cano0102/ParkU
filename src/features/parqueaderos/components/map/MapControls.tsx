import { Maximize2, ZoomIn, ZoomOut } from "lucide-react";

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

/** Botones de acercar/alejar/restablecer vista, superpuestos en la esquina superior derecha. */
export function MapControls({ onZoomIn, onZoomOut, onReset }: MapControlsProps) {
  const buttons = [
    { icon: <ZoomIn size={15} />, act: onZoomIn, label: "Acercar" },
    { icon: <ZoomOut size={15} />, act: onZoomOut, label: "Alejar" },
    { icon: <Maximize2 size={14} />, act: onReset, label: "Restablecer vista" },
  ];

  return (
    // Fila horizontal (no columna) para no tapar verticalmente el carril "SALIDA" del plano
    <div style={{
      position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", gap: 6,
      background: "rgba(20,22,25,.85)", border: "1px solid rgba(255,255,255,.14)",
      borderRadius: 12, padding: 4, backdropFilter: "blur(4px)", boxShadow: "0 4px 14px rgba(0,0,0,.25)",
    }}>
      {buttons.map((b, i) => (
        <button
          key={i}
          onClick={(e) => { e.stopPropagation(); b.act(); }}
          title={b.label}
          aria-label={b.label}
          style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.06)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
        >
          {b.icon}
        </button>
      ))}
    </div>
  );
}
