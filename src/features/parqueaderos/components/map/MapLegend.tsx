import { CELDA_CONFIG, TIPO_CELDA_CONFIG } from "../../lib/helpers";

/** Leyenda superpuesta del plano: tipo de celda, estado, y la pista de uso. */
export function MapLegend() {
  return (
    <div style={{
      position: "absolute", top: 12, left: 12, zIndex: 10,
      display: "flex", flexDirection: "column", gap: 6, maxWidth: "calc(100% - 120px)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", flexWrap: "wrap", gap: 3,
        background: "rgba(20,22,25,.85)", border: "1px solid rgba(255,255,255,.14)",
        borderRadius: 12, padding: "7px 11px", backdropFilter: "blur(4px)",
        boxShadow: "0 4px 14px rgba(0,0,0,.25)",
      }}>
        {Object.entries(TIPO_CELDA_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} style={{
              display: "flex", alignItems: "center", gap: 5,
              background: `${cfg.accent}26`, border: `1px solid ${cfg.accent}55`,
              borderRadius: 8, padding: "3px 8px 3px 6px", marginRight: 2,
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: 5, background: cfg.accent,
                display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={10} color="#fff" strokeWidth={2.75} />
              </span>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>{cfg.shortLabel}</span>
            </div>
          );
        })}
      </div>
      <div style={{
        display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10,
        background: "rgba(20,22,25,.85)", border: "1px solid rgba(255,255,255,.14)",
        borderRadius: 12, padding: "6px 11px", backdropFilter: "blur(4px)",
        boxShadow: "0 4px 14px rgba(0,0,0,.25)",
      }}>
        {Object.entries(CELDA_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dotColor, flexShrink: 0, boxShadow: `0 0 6px ${cfg.dotColor}99` }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.9)", whiteSpace: "nowrap" }}>{cfg.label}</span>
          </div>
        ))}
      </div>
      {/* Pista de uso: la placa ya se ve directamente sobre cada carro, pero
          tocar la celda abre el detalle completo (conductor, hora de ingreso, etc). */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
        background: "rgba(20,22,25,.85)", border: "1px solid rgba(255,255,255,.14)",
        borderRadius: 12, padding: "5px 10px", backdropFilter: "blur(4px)",
        boxShadow: "0 4px 14px rgba(0,0,0,.25)",
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.75)", whiteSpace: "nowrap" }}>
          👆 Toca una celda para ver conductor, hora de ingreso y más detalles
        </span>
      </div>
    </div>
  );
}
