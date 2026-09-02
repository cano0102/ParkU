import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { theme } from "@/styles/theme";
import {
  CELDA_CONFIG, LotLayout, Ocupante, getTipoCeldaConfig,
  SPACE_W, GAP_X, LANE_H, PADDING,
} from "../../lib/helpers";
import { MAP_THEME } from "./MapVisuals";
import { ParkingCell } from "./ParkingCell";
import type { HoverInfo } from "./useParkingMapInteraction";

const C = theme;

interface ParkingLotProps extends LotLayout {
  getOcupante: (celdaId: string) => Ocupante | null;
  cellMatchesSearch: (c: Celda) => boolean;
  celdaTieneIncidenteAbierto: (c: Celda) => boolean;
  onCellPointerDown: (e: React.PointerEvent<SVGGElement>, celda: Celda) => void;
  onCellHover: (info: HoverInfo) => void;
  onCellHoverLeave: () => void;
  /** Si se pasa (rol con permiso "celdas"), el badge de estado se vuelve clicable. */
  onLotPointerDown?: (e: React.PointerEvent<SVGGElement>, pq: Parqueadero) => void;
}

/** Un parqueadero dibujado en el plano: cabecera con nombre/composición/stats, y sus filas de celdas. */
export function ParkingLot({
  pq, celdasPorFila, libres, ocupados, reservadas, pct, filas, lotTop, lotHeight, ancho,
  getOcupante, cellMatchesSearch, celdaTieneIncidenteAbierto, onCellPointerDown, onCellHover, onCellHoverLeave,
  onLotPointerDown,
}: ParkingLotProps) {
  const activo = pq.estado === "activo";
  const estadoColor = activo ? CELDA_CONFIG.disponible.dotColor : C.danger;
  const hc = pct >= 90 ? C.danger : pct >= 50 ? C.amber : C.primary;
  // Composición de la zona por tipo de vehículo, para distinguir de un vistazo
  // qué parqueaderos son de carro, de moto o mixtos (celdas de movilidad reducida incluidas).
  // Ya no viene precalculada en el parqueadero (la API real no la guarda ahí) — se cuenta
  // directo sobre las celdas ya posicionadas en este plano.
  const celdasLot = filas.flatMap((f) => f.celdas);
  const composicion = ([
    { t: "carro" as const, n: celdasLot.filter((c) => c.tipo === "carro").length },
    { t: "moto" as const, n: celdasLot.filter((c) => c.tipo === "moto").length },
    { t: "movilidad reducida" as const, n: celdasLot.filter((c) => c.usabilidad === "movilidad_reducida").length },
  ]).filter((x) => x.n > 0);
  const chipW = 32, chipGap = 5;
  const chipsW = composicion.length * chipW + Math.max(0, composicion.length - 1) * chipGap;
  let chipX = ancho - chipsW;

  return (
    <g>
      <rect x={PADDING - 20} y={lotTop - 12} width={ancho - PADDING + 40} height={lotHeight + 12} rx="14" fill={MAP_THEME.asphaltPanel} stroke={MAP_THEME.panelBorder} strokeWidth="1.5" filter="url(#lotShadow)" />
      {/* Filo superior más claro: el panel se lee como una superficie ligeramente elevada
          sobre el asfalto en vez de un rectángulo plano del mismo tono. */}
      <line x1={PADDING - 16} y1={lotTop - 11.3} x2={ancho + 18} y2={lotTop - 11.3} stroke="rgba(255,255,255,.14)" strokeWidth="1" />
      <rect x={PADDING - 10} y={lotTop - 6} width={ancho - PADDING + 10} height={34} rx="8" fill={hc} />
      {/* Brillo superior sutil (mismo contorno redondeado que la cabecera, sin artefactos en las
          esquinas): le da un poco de volumen en vez de un color plano. */}
      <rect x={PADDING - 10} y={lotTop - 6} width={ancho - PADDING + 10} height={34} rx="8" fill="url(#sheenV)" />
      <text x={PADDING + 2} y={lotTop + 10} fill="#fff" fontSize="10.5" fontWeight="900">{pq.nombre.toUpperCase()}</text>
      <text x={PADDING + 2} y={lotTop + 22} fill="rgba(255,255,255,.8)" fontSize="7.5" fontWeight="bold">{pq.zona ? `ZONA ${pq.zona.toUpperCase()}` : pq.ubicacion.toUpperCase()}</text>
      {/* Chips de composición: cuántas celdas de cada tipo tiene esta zona */}
      {composicion.map(({ t, n }) => {
        const cfg = getTipoCeldaConfig(t);
        const Icon = cfg.icon;
        const x = chipX;
        chipX += chipW + chipGap;
        return (
          <g key={t} transform={`translate(${x},${lotTop + 3})`}>
            <rect width={chipW} height={18} rx="6" fill="rgba(255,255,255,.24)" />
            <Icon x={4} y={4} width={10} height={10} color="#fff" strokeWidth={2.75} />
            <text x={chipW - 5} y={13} textAnchor="end" fontSize="9" fontWeight="900" fill="#fff">{n}</text>
          </g>
        );
      })}
      <g transform={`translate(${PADDING - 10},${lotTop + 47})`}>
        <circle cx="5" cy="-2.5" r="3.5" fill={CELDA_CONFIG.disponible.dotColor} />
        <text x="13" y="1" fill={MAP_THEME.textDim} fontSize="8.5" fontWeight="bold">{libres} libres</text>
        <circle cx="70" cy="-2.5" r="3.5" fill={CELDA_CONFIG.no_disponible.dotColor} />
        <text x="78" y="1" fill={MAP_THEME.textDim} fontSize="8.5" fontWeight="bold">{ocupados} ocupados</text>
        {reservadas > 0 && (
          <g transform="translate(150,0)">
            <circle cx="5" cy="-2.5" r="3.5" fill={CELDA_CONFIG.reservada.dotColor} />
            <text x="13" y="1" fill={MAP_THEME.textDim} fontSize="8.5" fontWeight="bold">{reservadas} reservadas</text>
          </g>
        )}
        {/* Badge de estado activo/inactivo — mismo toggle que la vista tabla, clicable solo con permiso "celdas". */}
        <g
          transform={`translate(${ancho - PADDING + 10 - 64},0)`}
          onPointerDown={onLotPointerDown ? (e) => onLotPointerDown(e, pq) : undefined}
          style={{ cursor: onLotPointerDown ? "pointer" : "default" }}
        >
          {onLotPointerDown && <title>{activo ? "Desactivar parqueadero" : "Activar parqueadero"}</title>}
          <circle cx="5" cy="-2.5" r="3.5" fill={estadoColor} />
          <text x="13" y="1" fill={activo ? MAP_THEME.textDim : "#F87171"} fontSize="8.5" fontWeight="bold" style={{ textTransform: "uppercase" }}>
            {pq.estado}
          </text>
        </g>
      </g>

      {filas.map((fila, fi) => fila.esCarril ? (
        <g key={`c-${fi}`}>
          <rect x={PADDING - 8} y={fila.y - 4} width={celdasPorFila * (SPACE_W + GAP_X) + 16} height={LANE_H - 8} fill="url(#roadG)" rx="4" />
          <line x1={PADDING} y1={fila.y + LANE_H / 2 - 4} x2={PADDING + celdasPorFila * (SPACE_W + GAP_X) - GAP_X} y2={fila.y + LANE_H / 2 - 4} stroke="#F5C344" strokeWidth="1.2" strokeDasharray="6,5" opacity=".4" />
        </g>
      ) : (
        <g key={`f-${fi}`}>
          {fila.celdas.map((celda) => (
            <ParkingCell
              key={celda.id}
              celda={celda}
              pqNombre={pq.nombre}
              tipoPq={pq.tipo}
              matches={cellMatchesSearch(celda)}
              tieneIncidente={celdaTieneIncidenteAbierto(celda)}
              ocupante={celda.estado === "no_disponible" ? getOcupante(celda.id) : null}
              onPointerDown={onCellPointerDown}
              onHover={onCellHover}
              onHoverLeave={onCellHoverLeave}
            />
          ))}
        </g>
      ))}
    </g>
  );
}
