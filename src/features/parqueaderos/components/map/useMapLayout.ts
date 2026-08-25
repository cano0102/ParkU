import { useMemo } from "react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import {
  LotLayout, FilaLayout,
  SPACE_W, SPACE_H, GAP_X, ROW_GAP, LANE_H, PADDING, SECTION_GAP, ROAD_Y, ROAD_H,
} from "../../lib/helpers";

/** Calcula la disposición (posiciones, tamaños, franjas de carril) de cada parqueadero en el plano. */
export function useMapLayout(parqueaderos: Parqueadero[], celdas: Celda[]) {
  const lots = useMemo<LotLayout[]>(() => {
    const result: LotLayout[] = [];
    let currentTop = ROAD_Y + ROAD_H + 28;
    parqueaderos.forEach((pq) => {
      const celdasPq = celdas.filter((c) => c.parqueaderoId === pq.id);
      const celdasPorFila = Math.min(8, Math.max(1, celdasPq.length || 1));
      const rowWidth = celdasPorFila * (SPACE_W + GAP_X) - GAP_X;
      const ancho = Math.max(PADDING + rowWidth + 20, 420);
      const filas: FilaLayout[] = [];
      let y = currentTop;
      const rowCount = Math.max(1, Math.ceil(celdasPq.length / celdasPorFila));
      for (let row = 0; row < rowCount; row++) {
        const start = row * celdasPorFila;
        const rowCells = celdasPq.slice(start, start + celdasPorFila);
        filas.push({
          esCarril: false, y,
          celdas: rowCells.map((celda, index) => ({ ...celda, x: PADDING + index * (SPACE_W + GAP_X), y })),
        });
        y += SPACE_H + ROW_GAP;
        if (row < rowCount - 1) { filas.push({ esCarril: true, y, celdas: [] }); y += LANE_H; }
      }
      const libres = celdasPq.filter((c) => c.estado === "disponible").length;
      const ocupados = celdasPq.filter((c) => c.estado === "no_disponible").length;
      const reservadas = celdasPq.filter((c) => c.estado === "reservada").length;
      const mantenimiento = celdasPq.filter((c) => c.estado === "mantenimiento").length;
      const pct = celdasPq.length ? Math.round((ocupados / celdasPq.length) * 100) : 0;
      const lotHeight = y - currentTop + 20;
      result.push({ pq, filas, lotTop: currentTop, lotHeight, ancho, celdasPorFila, libres, ocupados, reservadas, mantenimiento, pct });
      currentTop = y + SECTION_GAP;
    });
    return result;
  }, [parqueaderos, celdas]);

  const totalW = useMemo(() => {
    const maxAncho = lots.length ? Math.max(...lots.map((l) => l.ancho)) : 0;
    return Math.max(960, maxAncho + PADDING);
  }, [lots]);

  const totalH = useMemo(() => {
    if (!lots.length) return ROAD_Y + ROAD_H + 80;
    return Math.max(ROAD_Y + ROAD_H + 80, lots[lots.length - 1].lotTop + lots[lots.length - 1].lotHeight + 20);
  }, [lots]);

  return { lots, totalW, totalH };
}
