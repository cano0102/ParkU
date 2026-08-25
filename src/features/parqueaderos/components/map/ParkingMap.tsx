import { memo } from "react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { theme } from "@/styles/theme";
import { Ocupante } from "../../lib/helpers";
import { MAP_THEME } from "./MapVisuals";
import { MapLegend } from "./MapLegend";
import { MapControls } from "./MapControls";
import { MapSvgDefs } from "./MapSvgDefs";
import { MapRoadBackground } from "./MapRoadBackground";
import { ParkingLot } from "./ParkingLot";
import { CeldaHoverTooltip } from "./CeldaHoverTooltip";
import { useMapLayout } from "./useMapLayout";
import { useParkingMapInteraction } from "./useParkingMapInteraction";

const C = theme;

interface ParkingMapProps {
  parqueaderos: Parqueadero[];
  celdas: Celda[];
  getOcupante: (celdaId: string) => Ocupante | null;
  onCellClick: (celda: Celda) => void;
  cellMatchesSearch: (c: Celda) => boolean;
}

export const ParkingMap = memo(({ parqueaderos, celdas, getOcupante, onCellClick, cellMatchesSearch }: ParkingMapProps) => {
  const { lots, totalW, totalH } = useMapLayout(parqueaderos, celdas);
  const {
    zoom, pan, isDragging, isDraggedRef, hover, setCellHover, clearHover,
    handlePointerDown, handlePointerMove, handlePointerUp, handleCellPointerDown,
    zoomIn, zoomOut, resetView,
  } = useParkingMapInteraction(onCellClick);

  return (
    <div style={{
      position: "relative", width: "100%", overflow: "hidden",
      borderRadius: 16, border: `1px solid ${C.border}`,
      background: MAP_THEME.asphalt, boxShadow: "0 2px 8px rgba(15,23,42,.05)",
    }}>
      <MapLegend />
      <MapControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetView} />

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          width: "100%", minHeight: 480, overflow: "hidden",
          cursor: isDragging && isDraggedRef.current ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
        }}
      >
        <svg
          viewBox={`0 0 ${totalW} ${totalH}`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "top left",
            width: totalW, height: totalH,
            display: "block", touchAction: "none",
          }}
        >
          <MapSvgDefs />
          <MapRoadBackground totalW={totalW} totalH={totalH} />

          {lots.map((lot) => (
            <ParkingLot
              key={lot.pq.id}
              {...lot}
              getOcupante={getOcupante}
              cellMatchesSearch={cellMatchesSearch}
              onCellPointerDown={handleCellPointerDown}
              onCellHover={setCellHover}
              onCellHoverLeave={clearHover}
            />
          ))}
        </svg>
      </div>

      {hover && (
        <CeldaHoverTooltip
          hover={hover}
          ocupante={hover.celda.estado === "no_disponible" ? getOcupante(hover.celda.id) : null}
        />
      )}
    </div>
  );
});

ParkingMap.displayName = "ParkingMap";
