import { theme } from "@/styles/theme";
import { PADDING, ROAD_Y, ROAD_H } from "../../lib/helpers";

const C = theme;

interface MapRoadBackgroundProps {
  totalW: number;
  totalH: number;
}

/** Fondo del plano: asfalto, franjas de césped y el carril central con ENTRADA/SALIDA. */
export function MapRoadBackground({ totalW, totalH }: MapRoadBackgroundProps) {
  return (
    <>
      <rect width={totalW} height={totalH} fill="url(#asp)" />
      <rect x={10} y={10} width={36} height={totalH - 20} rx="6" fill="url(#grassG)" opacity=".4" />
      <rect x={totalW - 46} y={10} width={36} height={totalH - 20} rx="6" fill="url(#grassG)" opacity=".4" />
      <rect x={PADDING - 10} y={ROAD_Y} width={totalW - PADDING * 2 + 20} height={ROAD_H} fill="url(#roadG)" rx="4" />
      <line x1={PADDING} y1={ROAD_Y + ROAD_H / 2} x2={totalW - PADDING} y2={ROAD_Y + ROAD_H / 2} stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="8,8" opacity=".5" />
      <g transform={`translate(${PADDING + 10},${ROAD_Y + ROAD_H / 2 + 3.5})`}>
        <rect x="-8" y="-9" width="58" height="18" rx="4" fill={C.primary} />
        <text textAnchor="middle" x="21" y="3" fontSize="8" fontWeight="900" fill="#fff">ENTRADA</text>
      </g>
      <g transform={`translate(${totalW - PADDING - 50},${ROAD_Y + ROAD_H / 2 + 3.5})`}>
        <rect x="-8" y="-9" width="58" height="18" rx="4" fill={C.danger} />
        <text textAnchor="middle" x="21" y="3" fontSize="8" fontWeight="900" fill="#fff">SALIDA</text>
      </g>
    </>
  );
}
