import { theme } from "@/styles/theme";
import { formatearDuracion, getCeldaVisualConfig, Ocupante } from "../../lib/helpers";
import type { HoverInfo } from "./useParkingMapInteraction";
import type { MarcaReserva } from "../../lib/agendaCelda";

const C = theme;

interface CeldaHoverTooltipProps {
  hover: HoverInfo;
  ocupante: Ocupante | null;
  /** Reservas por delante de esta celda, si tiene alguna (ver agendaCelda.ts). */
  marcaReserva?: MarcaReserva | null;
}

/** Tarjeta flotante que sigue al cursor con el detalle rápido de la celda bajo el mouse. */
export function CeldaHoverTooltip({ hover, ocupante, marcaReserva = null }: CeldaHoverTooltipProps) {
  const estaOcupada = hover.celda.estado === "no_disponible" && ocupante !== null;
  const tipoCfg = getCeldaVisualConfig(hover.celda);
  const TipoIcon = tipoCfg.icon;

  return (
    <div style={{
      position: "fixed",
      left: Math.min(hover.clientX + 16, window.innerWidth - 224),
      top: Math.min(hover.clientY + 16, window.innerHeight - 200),
      zIndex: 100, pointerEvents: "none", width: 208,
      borderRadius: 14, border: "1px solid rgba(255,255,255,.12)",
      background: "rgba(15,17,20,.95)", padding: 12, color: "#fff",
      boxShadow: "0 10px 30px rgba(0,0,0,.35)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,.08)", paddingBottom: 6, marginBottom: 8 }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 900, color: C.primaryLight }}>{hover.celda.numero}</span>
        <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,.45)", textTransform: "uppercase" }}>{hover.tipoPq}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 5, background: tipoCfg.accent }}>
          <TipoIcon size={10} color="#fff" strokeWidth={2.5} />
        </span>
        <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.8)" }}>{tipoCfg.label}</span>
      </div>
      {estaOcupada && ocupante ? (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 900, background: "rgba(255,255,255,.08)", padding: "2px 6px", borderRadius: 6 }}>{ocupante.vehiculo.placa}</span>
            {ocupante.esOficial && <span style={{ fontSize: 8, fontWeight: 900, color: C.primaryLight, border: `1px solid ${C.primary}`, borderRadius: 4, padding: "1px 4px" }}>OFICIAL</span>}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.75)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ocupante.conductor?.nombre || "—"}</div>
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,.08)", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.55)" }}>
            <div>Estadía: {formatearDuracion(ocupante.fechaEntrada)}</div>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.7)" }}>
          {hover.celda.estado === "reservada" || marcaReserva?.enCurso ? "Celda reservada" :
            hover.celda.estado === "mantenimiento" ? "En mantenimiento" :
              hover.celda.estado === "no_disponible" ? "Ocupada, sin datos de vehículo" :
                "Celda libre"}
        </div>
      )}
      {/* Lo que pasa con esta celda más tarde: el aviso pesa más que la hora suelta, porque
          es el que pide hacer algo ahora. */}
      {marcaReserva && (marcaReserva.aviso || marcaReserva.proximaHora) && (
        <div style={{
          marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,.08)",
          fontSize: 10, fontWeight: 700, lineHeight: 1.45,
          color: marcaReserva.aviso ? (marcaReserva.aviso.tono === "urgente" ? "#FCA5A5" : "#FCD34D") : "rgba(255,255,255,.7)",
        }}>
          {marcaReserva.aviso ? marcaReserva.aviso.titulo : `Próxima reserva a las ${marcaReserva.proximaHora}`}
        </div>
      )}
    </div>
  );
}
