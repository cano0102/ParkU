import { ParkingCircle } from "lucide-react";
import type { Celda } from "@/services/api/celdas";
import { theme } from "@/styles/theme";
import { CELDA_ESTADO_CONFIG, ESTADO_CONFIG, type EstadoIncidente } from "../lib/constants";

const C = theme;

/** Pastilla de estado de un incidente (pendiente/resuelto). */
export function EstadoBadgeInline({ estado }: { estado: EstadoIncidente }) {
  const cfg = ESTADO_CONFIG[estado];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
      background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

/** Pastilla de celda inline (usa la paleta del módulo de Parqueaderos/Celdas). */
export function CeldaBadgeInline({ numero, estado }: { numero: string; estado?: Celda["estado"] }) {
  const cfg = estado ? CELDA_ESTADO_CONFIG[estado] : { bg: "#F1F5F9", text: C.textLight, border: C.border, label: "" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700,
      background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}`,
    }}>
      <ParkingCircle size={10} />
      Celda {numero}
    </span>
  );
}
