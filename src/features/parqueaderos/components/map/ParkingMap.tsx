import { memo, useLayoutEffect, useRef, useState } from "react";
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
  celdaTieneIncidenteAbierto: (c: Celda) => boolean;
  /** Si se pasa, se agrega un badge de estado clicable a la cabecera de cada
   *  parqueadero (mismo toggle activar/desactivar que ya existía en la vista tabla). */
  onToggleEstado?: (pq: Parqueadero) => void;
  canManage?: boolean;
}

export const ParkingMap = memo(({ parqueaderos, celdas, getOcupante, onCellClick, cellMatchesSearch, celdaTieneIncidenteAbierto, onToggleEstado, canManage }: ParkingMapProps) => {
  const { lots, totalW, totalH } = useMapLayout(parqueaderos, celdas);

  // Ancho real del contenedor visible: en móvil el plano (min. 960px de contenido) nunca
  // cabe entero, así que el zoom inicial se ajusta a este valor en vez de arrancar en 100%.
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const fitZoom = containerWidth && totalW ? Math.min(1, (containerWidth - 2) / totalW) : 1;

  const {
    zoom, pan, isDragging, isDraggedRef, hover, setCellHover, clearHover,
    handlePointerDown, handlePointerMove, handlePointerUp, handleCellPointerDown, handleLotPointerDown,
    zoomIn, zoomOut, resetView,
  } = useParkingMapInteraction(onCellClick, onToggleEstado, fitZoom);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative", width: "100%", overflow: "hidden",
        borderRadius: 16, border: `1px solid ${C.border}`,
        background: MAP_THEME.asphalt, boxShadow: "0 2px 8px rgba(15,23,42,.05)",
      }}
    >
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
              celdaTieneIncidenteAbierto={celdaTieneIncidenteAbierto}
              onCellPointerDown={handleCellPointerDown}
              onCellHover={setCellHover}
              onCellHoverLeave={clearHover}
              onLotPointerDown={canManage ? handleLotPointerDown : undefined}
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
