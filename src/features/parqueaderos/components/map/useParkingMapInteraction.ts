import { useCallback, useRef, useState } from "react";
import type { Celda } from "@/services/api/celdas";

const DRAG_THRESHOLD = 8;

export interface HoverInfo {
  celda: Celda;
  pqNombre: string;
  tipoPq: string;
  clientX: number;
  clientY: number;
}

/** Pan, zoom y el gesto de clic-vs-arrastre sobre el plano (una celda solo se abre si no hubo arrastre). */
export function useParkingMapInteraction(onCellClick: (celda: Celda) => void) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hover, setHover] = useState<HoverInfo | null>(null);

  const dragOriginRef = useRef({ x: 0, y: 0 });
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const isDraggedRef = useRef(false);
  const pendingCellRef = useRef<Celda | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isDraggedRef.current = false;
    pendingCellRef.current = null;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    dragOriginRef.current = { x: pan.x, y: pan.y };
    setIsDragging(true);
  }, [pan]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      isDraggedRef.current = true;
      pendingCellRef.current = null;
    }
    if (isDraggedRef.current) {
      setPan({ x: dragOriginRef.current.x + dx, y: dragOriginRef.current.y + dy });
    }
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    if (!isDraggedRef.current && pendingCellRef.current) {
      onCellClick(pendingCellRef.current);
    }
    isDraggedRef.current = false;
    pendingCellRef.current = null;
  }, [onCellClick]);

  const handleCellPointerDown = useCallback((e: React.PointerEvent<SVGGElement>, celda: Celda) => {
    e.stopPropagation();
    pendingCellRef.current = celda;
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(2.5, z + 0.15)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.4, z - 0.15)), []);
  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const setCellHover = useCallback((info: HoverInfo | null) => {
    if (!isDraggedRef.current) setHover(info);
  }, []);

  return {
    zoom, pan, isDragging, isDraggedRef, hover, setCellHover, clearHover: () => setHover(null),
    handlePointerDown, handlePointerMove, handlePointerUp, handleCellPointerDown,
    zoomIn, zoomOut, resetView,
  };
}
