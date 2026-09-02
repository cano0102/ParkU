import { CELDA_CONFIG, TIPO_CELDA_CONFIG } from "../../lib/helpers";

const panelDivider = { height: 1, background: "rgba(255,255,255,.1)", margin: "7px 0" } as const;

/** Leyenda superpuesta del plano: tipo de celda, estado, y la pista de uso — un solo panel de
 *  vidrio con divisores internos (antes eran 3 tarjetas flotantes separadas con su propio
 *  fondo/sombra cada una, que se leían como elementos sueltos en vez de un único HUD). */
export function MapLegend() {
  return (
    <div style={{
      position: "absolute", top: 12, left: 12, zIndex: 10, maxWidth: "calc(100% - 120px)",
      background: "rgba(18,20,23,.88)", border: "1px solid rgba(255,255,255,.14)",
      borderRadius: 14, padding: "9px 12px", backdropFilter: "blur(6px)",
      boxShadow: "0 6px 20px rgba(0,0,0,.3)",
    }}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
        {Object.entries(TIPO_CELDA_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} style={{
              display: "flex", alignItems: "center", gap: 5,
              background: `${cfg.accent}26`, border: `1px solid ${cfg.accent}55`,
              borderRadius: 8, padding: "3px 8px 3px 6px",
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

      <div style={panelDivider} />

      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        {Object.entries(CELDA_CONFIG).map(([key, cfg]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dotColor, flexShrink: 0, boxShadow: `0 0 6px ${cfg.dotColor}99` }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.9)", whiteSpace: "nowrap" }}>{cfg.label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {/* Mismo cuadrado redondeado que la insignia real sobre la celda (ParkingCell.tsx),
              no un punto — para que la leyenda coincida con la forma que se ve en el plano. */}
          <span style={{
            width: 13, height: 13, borderRadius: 4, background: "#F59E0B", border: "1px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: "#111318", lineHeight: 1 }}>!</span>
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.9)", whiteSpace: "nowrap" }}>Incidente abierto</span>
        </div>
      </div>

      <div style={panelDivider} />

      {/* Pista de uso: la placa ya se ve directamente sobre cada carro, pero
          tocar la celda abre el detalle completo (conductor, hora de ingreso, etc). */}
      <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.75)" }}>
        👆 Toca una celda para ver conductor, hora de ingreso y más detalles
      </div>
    </div>
  );
}
