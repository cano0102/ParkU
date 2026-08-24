import { memo } from "react";
import type { Celda } from "@/services/api/celdas";
import { CELDA_CONFIG, getTipoCeldaConfig } from "../../lib/helpers";

/**
 * Antes UiBits.tsx: `ModalHeader` y `Banner` (genéricos, sin acoplamiento
 * de dominio) se movieron a components/shared/ en la Fase 5. Lo que queda
 * aquí sí es específico de celdas (parking spots) — badges de estado y tipo.
 */
export const EstadoBadge = memo(({ estado }: { estado: Celda["estado"] }) => {
  const cfg = CELDA_CONFIG[estado];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dotColor }} />
      {cfg.label}
    </span>
  );
});
EstadoBadge.displayName = "EstadoBadge";

/* Insignia reutilizable que muestra el TIPO de celda (carro / moto / movilidad reducida)
   con su propio icono y color, para usarse tanto en la tabla como en las tarjetas expandidas. */
export const TipoBadge = memo(({ tipo, size = "sm" }: { tipo: string; size?: "sm" | "md" }) => {
  const cfg = getTipoCeldaConfig(tipo);
  const Icon = cfg.icon;
  const iconSize = size === "sm" ? 10 : 12;
  const pad = size === "sm" ? "2px 7px" : "3px 9px";
  const font = size === "sm" ? 9.5 : 11;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: pad, borderRadius: 999, fontSize: font, fontWeight: 800, background: cfg.accentSoft, color: cfg.accentDark, border: `1px solid ${cfg.accent}55` }}>
      <Icon size={iconSize} strokeWidth={2.5} />
      {cfg.shortLabel}
    </span>
  );
});
TipoBadge.displayName = "TipoBadge";
