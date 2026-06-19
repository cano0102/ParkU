import React, { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import {
  Car,
  Plus,
  Pencil,
  Trash2,
  X,
  Camera,
  ParkingCircle,
  Shield,
  LayoutGrid,
  Map as MapIcon,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

const COLORS = {
  primary: "#2F8F00",
  primaryDark: "#1E6000",
  primaryLight: "#E8F5E1",
  primaryBorder: "#C5E0AD",
  bg: "#F4F7F2",
  surface: "#FFFFFF",
  text: "#0D1F05",
  textSoft: "#4B6642",
  textMuted: "#8FA884",
  border: "#E2EBD9",
  danger: "#C92020",
  dangerBg: "#FFF0F0",
  dangerBorder: "#FAC5C5",
} as const;

type CeldaEstado = "libre" | "ocupado" | "sena";

interface Celda {
  codigo: string;
  estado: CeldaEstado;
  placa?: string;
  conductor?: string;
}

interface Parqueadero {
  id: number;
  nombre: string;
  total: number;
  celdas: Celda[];
  bloque: string;
  tipo: string;
}

const CELDA_CONFIG: Record<
  CeldaEstado,
  {
    bg: string;
    border: string;
    text: string;
    label: string;
    dotColor: string;
    mapFill: string;
    mapStroke: string;
  }
> = {
  libre: {
    bg: "#F0FBE8",
    border: "#A8D888",
    text: "#2F6B00",
    label: "Libre",
    dotColor: "#4CAF50",
    mapFill: "#D4EDC8",
    mapStroke: "#7BC35A",
  },
  ocupado: {
    bg: "#1A1A1A",
    border: "#EF4444",
    text: "#FFFFFF",
    label: "Ocupado",
    dotColor: "#EF4444",
    mapFill: "#2D2D2D",
    mapStroke: "#EF4444",
  },
  sena: {
    bg: "#FFFBEB",
    border: "#FCD34D",
    text: "#78350F",
    label: "SENA",
    dotColor: "#F59E0B",
    mapFill: "#FDE68A",
    mapStroke: "#F59E0B",
  },
};

const sanitizeText = (text: string): string => {
  if (!text) return "";
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
};

const inputStyle: React.CSSProperties = {
  height: 48,
  width: "100%",
  borderRadius: 12,
  border: `1.5px solid ${COLORS.border}`,
  padding: "0 16px",
  fontSize: 14,
  fontWeight: 500,
  color: COLORS.text,
  background: COLORS.surface,
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: COLORS.textSoft,
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: ".06em",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxW?: number;
}

const Modal = memo(({ open, onClose, children, maxW = 480 }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const focusable = document.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) focusable[0]?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: maxW,
          background: COLORS.surface,
          borderRadius: 24,
          boxShadow: "0 24px 60px rgba(0,0,0,.18)",
          overflow: "hidden",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
});

Modal.displayName = "Modal";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmDialog = memo(({ open, onConfirm, onCancel, title, message }: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: COLORS.surface,
          borderRadius: 24,
          padding: "24px",
          boxShadow: "0 24px 60px rgba(0,0,0,.18)",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-title" style={{ fontSize: 18, fontWeight: 900, color: COLORS.text, margin: 0 }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: COLORS.textSoft, marginTop: 8, lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              height: 42,
              padding: "0 20px",
              borderRadius: 12,
              border: `1.5px solid ${COLORS.border}`,
              background: COLORS.surface,
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.textSoft,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              height: 42,
              padding: "0 24px",
              borderRadius: 12,
              border: "none",
              background: COLORS.danger,
              fontSize: 13,
              fontWeight: 800,
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmDialog.displayName = "ConfirmDialog";

const StatPill = memo(({ label, value, dot }: { label: string; value: number; dot: string }) => {
  return (
    <div
      style={{
        background: "rgba(255,255,255,.15)",
        borderRadius: 16,
        padding: "14px 18px",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,.2)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: dot,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,.75)",
            letterSpacing: ".1em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
});

StatPill.displayName = "StatPill";

const CeldaCard = memo(({ celda, onClick }: { celda: Celda; onClick: () => void }) => {
  const cfg = CELDA_CONFIG[celda.estado];
  const isLibre = celda.estado === "libre";

  return (
    <button
      onClick={onClick}
      disabled={!isLibre}
      className="park-celda-btn"
      style={{
        background: cfg.bg,
        border: `2px ${isLibre ? "dashed" : "solid"} ${cfg.border}`,
        borderRadius: 16,
        padding: "10px 8px",
        cursor: isLibre ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        minHeight: 100,
        transition: "transform .15s, box-shadow .15s",
        outline: "none",
        width: "100%",
      }}
      onMouseEnter={(e) => {
        if (isLibre) {
          e.currentTarget.style.transform = "scale(1.04)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(47,143,0,.18)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
      aria-label={`Celda ${celda.codigo} - ${cfg.label}`}
    >
      <span style={{ fontSize: 12, fontWeight: 900, color: cfg.text, letterSpacing: ".05em" }}>
        {celda.codigo}
      </span>
      <Car size={22} color={cfg.text} strokeWidth={celda.estado === "ocupado" ? 2.2 : 1.6} />
      {celda.estado === "ocupado" ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: cfg.text }}>{celda.placa}</div>
          <div
            style={{
              fontSize: 9,
              color: "rgba(255,255,255,.6)",
              marginTop: 1,
              maxWidth: 80,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {celda.conductor}
          </div>
        </div>
      ) : (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: cfg.text,
            textTransform: "uppercase",
            letterSpacing: ".08em",
            opacity: 0.75,
          }}
        >
          {cfg.label}
        </span>
      )}
    </button>
  );
});

CeldaCard.displayName = "CeldaCard";

const ParkingMap = memo(
  ({
    parqueaderos,
    onCellClick,
  }: {
    parqueaderos: Parqueadero[];
    onCellClick: (parqueaderoId: number, celda: Celda) => void;
  }) => {
    const [zoom, setZoom] = useState(1);
    const [hoveredCell, setHoveredCell] = useState<string | null>(null);
    const [selectedCell, setSelectedCell] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const SPACE_W = 44;
    const SPACE_H = 24;
    const LANE_H = 36;
    const GAP_X = 4;
    const PADDING = 60;
    const SECTION_GAP = 28;
    const ROAD_W = 50;

    const lotLayouts = useMemo(() => {
      let currentY = PADDING;
      return parqueaderos.map((pq) => {
        const celdasPerRow = Math.ceil(Math.sqrt(pq.total * 1.6));
        const numRows = Math.ceil(pq.total / celdasPerRow);
        const rowsPerSection = Math.min(numRows, 4);
        const numSections = Math.ceil(numRows / rowsPerSection);

        const rows: { cells: (Celda & { x: number; y: number })[]; isLane: boolean; y: number }[] = [];
        let cellIndex = 0;
        let yOffset = currentY;

        for (let sec = 0; sec < numSections; sec++) {
          for (let row = 0; row < rowsPerSection && cellIndex < pq.total; row++) {
            const rowCells: (Celda & { x: number; y: number })[] = [];
            const rowY = yOffset;

            for (let col = 0; col < celdasPerRow && cellIndex < pq.total; col++) {
              const celda = pq.celdas[cellIndex];
              rowCells.push({
                ...celda,
                x: PADDING + col * (SPACE_W + GAP_X),
                y: rowY,
              });
              cellIndex++;
            }

            rows.push({ cells: rowCells, isLane: false, y: rowY });
            yOffset += SPACE_H + 4;
          }

          if (sec < numSections - 1 && cellIndex < pq.total) {
            rows.push({ cells: [], isLane: true, y: yOffset });
            yOffset += LANE_H;
          }
        }

        const lotHeight = yOffset - currentY + SPACE_H + 10;
        const lotY = currentY;
        const libres = pq.celdas.filter((c) => c.estado === "libre").length;
        const ocupados = pq.celdas.filter((c) => c.estado === "ocupado").length;
        const senaCount = pq.celdas.filter((c) => c.estado === "sena").length;

        const layout = { pq, rows, lotHeight, lotY, celdasPerRow, numSections, libres, ocupados, senaCount };
        currentY = lotY + lotHeight + SECTION_GAP + 20;
        return layout;
      });
    }, [parqueaderos]);

    const totalWidth = useMemo(
      () =>
        Math.max(
          ...parqueaderos.map((pq) => PADDING + Math.ceil(Math.sqrt(pq.total * 1.6)) * (SPACE_W + GAP_X) + PADDING),
          400
        ),
      [parqueaderos]
    );

    const totalHeight = useMemo(() => {
      if (lotLayouts.length === 0) return PADDING * 2;
      const last = lotLayouts[lotLayouts.length - 1];
      return last.lotY + last.lotHeight + PADDING;
    }, [lotLayouts]);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const handler = (e: WheelEvent) => {
        e.preventDefault();
        setZoom((z) => Math.max(0.5, Math.min(2, z + (e.deltaY > 0 ? -0.1 : 0.1))));
      };
      el.addEventListener("wheel", handler, { passive: false });
      return () => el.removeEventListener("wheel", handler);
    }, []);

    const handleCellClick = useCallback(
      (parqueaderoId: number, celda: Celda, cellKey: string) => {
        if (celda.estado === "libre") {
          onCellClick(parqueaderoId, celda);
          setSelectedCell(cellKey === selectedCell ? null : cellKey);
        }
      },
      [onCellClick, selectedCell]
    );

    return (
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          borderRadius: 20,
          border: `1px solid ${COLORS.border}`,
          background: "#FAFCF8",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.2))}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,.08)",
            }}
            aria-label="Acercar"
          >
            <ZoomIn size={16} color={COLORS.textSoft} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,.08)",
            }}
            aria-label="Alejar"
          >
            <ZoomOut size={16} color={COLORS.textSoft} />
          </button>
          <button
            onClick={() => setZoom(1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,.08)",
            }}
            aria-label="Reiniciar zoom"
          >
            <Maximize2 size={14} color={COLORS.textSoft} />
          </button>
        </div>

        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <Navigation size={18} color={COLORS.primary} />
        </div>

        <div
          style={{
            overflow: "auto",
            maxHeight: "calc(100vh - 320px)",
            cursor: "grab",
          }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            style={{
              width: totalWidth,
              height: totalHeight,
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              display: "block",
            }}
          >
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E8EDE4" strokeWidth="0.5" />
              </pattern>
              <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
              </filter>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4CFC4" />
                <stop offset="50%" stopColor="#DDD8CF" />
                <stop offset="100%" stopColor="#D4CFC4" />
              </linearGradient>
            </defs>

            <rect width={totalWidth} height={totalHeight} fill="url(#grid)" />

            <rect x={0} y={PADDING - 20} width={totalWidth} height={ROAD_W} fill="url(#roadGrad)" rx="2" />
            <line
              x1={0}
              y1={PADDING - 20 + ROAD_W / 2}
              x2={totalWidth}
              y2={PADDING - 20 + ROAD_W / 2}
              stroke="#FFF"
              strokeWidth="2"
              strokeDasharray="8,6"
              opacity="0.6"
            />

            <g transform={`translate(${PADDING + 10}, ${PADDING - 20 + ROAD_W / 2 - 6})`}>
              <rect x={-22} y={-10} width={44} height={20} rx={10} fill="#2F8F00" />
              <text x={0} y={4} textAnchor="middle" fill="#fff" fontSize={8} fontWeight="800">
                ENTRADA
              </text>
              <polygon points="-16,-4 -10,0 -16,4" fill="#fff" />
            </g>

            <g transform={`translate(${totalWidth - PADDING - 10}, ${PADDING - 20 + ROAD_W / 2 - 6})`}>
              <rect x={-22} y={-10} width={44} height={20} rx={10} fill="#C92020" />
              <text x={0} y={4} textAnchor="middle" fill="#fff" fontSize={8} fontWeight="800">
                SALIDA
              </text>
              <polygon points="10,-4 16,0 10,4" fill="#fff" />
            </g>

            {lotLayouts.map((layout, idx) => {
              const { pq, rows, lotHeight, lotY, celdasPerRow, libres, ocupados, senaCount } = layout;
              const lotWidth = PADDING + celdasPerRow * (SPACE_W + GAP_X) + PADDING;
              const isEven = idx % 2 === 0;

              return (
                <g key={pq.id}>
                  <rect
                    x={20}
                    y={lotY - 10}
                    width={lotWidth - 20}
                    height={lotHeight + 10}
                    fill="#FFFFFF"
                    stroke={COLORS.border}
                    strokeWidth="1.5"
                    rx="16"
                    filter="url(#shadow)"
                  />

                  <rect
                    x={20}
                    y={lotY - 10}
                    width={lotWidth - 20}
                    height={32}
                    fill={isEven ? "#2F8F00" : "#1E6000"}
                    rx="16"
                  />

                  <text
                    x={lotWidth / 2}
                    y={lotY + 8}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={11}
                    fontWeight="800"
                  >
                    {sanitizeText(pq.nombre).toUpperCase()}
                  </text>

                  <text
                    x={lotWidth - 80}
                    y={lotY + 8}
                    textAnchor="end"
                    fill="rgba(255,255,255,.8)"
                    fontSize={8}
                    fontWeight="600"
                  >
                    {libres} libres · {ocupados} ocup. {senaCount > 0 ? `· ${senaCount} SENA` : ""}
                  </text>

                  <text
                    x={30}
                    y={lotY + 42}
                    fill={COLORS.textMuted}
                    fontSize={8}
                    fontWeight="700"
                  >
                    BLOQUE: {pq.bloque.toUpperCase()}
                  </text>

                  <rect
                    x={PADDING - 8}
                    y={lotY + 20}
                    width={8}
                    height={lotHeight - 30}
                    fill="url(#roadGrad)"
                    rx="2"
                  />

                  <text x={PADDING - 4} y={lotY + 40} textAnchor="middle" fill={COLORS.textMuted} fontSize={10}>
                    ↑
                  </text>
                  <text
                    x={PADDING - 4}
                    y={lotY + lotHeight - 20}
                    textAnchor="middle"
                    fill={COLORS.textMuted}
                    fontSize={10}
                  >
                    ↓
                  </text>

                  {rows.map((row, rowIdx) => {
                    if (row.isLane) {
                      return (
                        <g key={`lane-${rowIdx}`}>
                          <rect
                            x={PADDING - 4}
                            y={row.y - 4}
                            width={celdasPerRow * (SPACE_W + GAP_X) + 8}
                            height={LANE_H - 4}
                            fill="url(#roadGrad)"
                            rx="3"
                          />
                          <line
                            x1={PADDING}
                            y1={row.y + LANE_H / 2 - 6}
                            x2={PADDING + celdasPerRow * (SPACE_W + GAP_X)}
                            y2={row.y + LANE_H / 2 - 6}
                            stroke="#FFF"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                            opacity="0.5"
                          />
                          <text
                            x={PADDING + (celdasPerRow * (SPACE_W + GAP_X)) / 2}
                            y={row.y + LANE_H / 2 - 2}
                            textAnchor="middle"
                            fill={COLORS.textMuted}
                            fontSize={12}
                            opacity="0.5"
                          >
                            ← →
                          </text>
                        </g>
                      );
                    }

                    return (
                      <g key={`row-${rowIdx}`}>
                        <rect
                          x={PADDING - 4}
                          y={row.y - 3}
                          width={celdasPerRow * (SPACE_W + GAP_X) + 8}
                          height={SPACE_H + 6}
                          fill="#FAFCF8"
                          rx="3"
                        />

                        {row.cells.map((celda) => {
                          const cfg = CELDA_CONFIG[celda.estado];
                          const cellKey = `${pq.id}-${celda.codigo}`;
                          const isHovered = hoveredCell === cellKey;
                          const isSelected = selectedCell === cellKey;

                          return (
                            <g
                              key={celda.codigo}
                              onClick={() => handleCellClick(pq.id, celda, cellKey)}
                              onMouseEnter={() => setHoveredCell(cellKey)}
                              onMouseLeave={() => setHoveredCell(null)}
                              style={{ cursor: celda.estado === "libre" ? "pointer" : "default" }}
                            >
                              <rect
                                x={celda.x}
                                y={celda.y}
                                width={SPACE_W}
                                height={SPACE_H}
                                fill={cfg.mapFill}
                                stroke={isSelected ? COLORS.primary : isHovered ? cfg.dotColor : cfg.mapStroke}
                                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                                rx="4"
                                filter={isSelected ? "url(#glow)" : undefined}
                              />

                              <text
                                x={celda.x + SPACE_W / 2}
                                y={celda.y + SPACE_H / 2 - 2}
                                textAnchor="middle"
                                fill={cfg.text}
                                fontSize={9}
                                fontWeight="800"
                              >
                                {celda.codigo}
                              </text>

                              {celda.estado === "ocupado" && (
                                <>
                                  <rect
                                    x={celda.x + 14}
                                    y={celda.y + SPACE_H / 2 + 1}
                                    width={SPACE_W - 28}
                                    height={7}
                                    rx="3"
                                    fill="#444"
                                    opacity="0.8"
                                  />
                                  <text
                                    x={celda.x + SPACE_W / 2}
                                    y={celda.y + SPACE_H - 2}
                                    textAnchor="middle"
                                    fill="#FF6B6B"
                                    fontSize={6.5}
                                    fontWeight="800"
                                    letterSpacing="0.5"
                                  >
                                    {celda.placa}
                                  </text>
                                </>
                              )}

                              {celda.estado === "libre" && (
                                <rect
                                  x={celda.x + 2}
                                  y={celda.y + 2}
                                  width={SPACE_W - 4}
                                  height={SPACE_H - 4}
                                  fill="none"
                                  stroke="#4CAF50"
                                  strokeWidth="0.5"
                                  strokeDasharray="2,2"
                                  rx="2"
                                  opacity="0.4"
                                />
                              )}

                              {celda.estado === "sena" && (
                                <text
                                  x={celda.x + SPACE_W / 2}
                                  y={celda.y + SPACE_H / 2 + 2}
                                  textAnchor="middle"
                                  fill="#78350F"
                                  fontSize={7}
                                  fontWeight="900"
                                >
                                  SENA
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}

                  <g opacity="0.3">
                    <circle cx={lotWidth - 10} cy={lotY + lotHeight / 2} r={8} fill="#4CAF50" />
                    <circle cx={lotWidth - 16} cy={lotY + lotHeight / 2 - 6} r={5} fill="#388E3C" />
                    <circle cx={lotWidth - 6} cy={lotY + lotHeight / 2 + 7} r={4} fill="#388E3C" />
                  </g>
                </g>
              );
            })}

            <g>
              <rect
                x={PADDING}
                y={totalHeight - PADDING + 10}
                width={totalWidth - PADDING * 2}
                height={28}
                fill="#F0F4ED"
                rx="8"
                stroke={COLORS.border}
                strokeWidth="1"
              />
              <text
                x={totalWidth / 2}
                y={totalHeight - PADDING + 28}
                textAnchor="middle"
                fill={COLORS.textMuted}
                fontSize={8}
                fontWeight="600"
              >
                MAPA DE PARQUEADEROS · SENA · {new Date().toLocaleDateString("es-CO")}
              </text>
            </g>
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            padding: "10px 0 4px",
            borderTop: `1px solid ${COLORS.border}`,
            flexWrap: "wrap",
          }}
        >
          {(Object.entries(CELDA_CONFIG) as [CeldaEstado, typeof CELDA_CONFIG["libre"]][]).map(([key, cfg]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 16,
                  height: 10,
                  borderRadius: 3,
                  background: cfg.mapFill,
                  border: `1.5px solid ${cfg.mapStroke}`,
                }}
              />
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textSoft }}>{cfg.label}</span>
            </div>
          ))}
          <div style={{ width: 1, height: 14, background: COLORS.border }} />
          <span style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 500 }}>
            {parqueaderos.length} parqueadero{parqueaderos.length !== 1 ? "s" : ""} · Zoom: {(zoom * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    );
  }
);

ParkingMap.displayName = "ParkingMap";

interface FormModalProps {
  title: string;
  onSubmit: () => void;
  onClose: () => void;
  submitLabel: string;
  form: { nombre: string; total: number; bloque: string; tipo: string };
  setForm: React.Dispatch<
    React.SetStateAction<{ nombre: string; total: number; bloque: string; tipo: string }>
  >;
}

const FormModalContent = memo(({ title, onSubmit, onClose, submitLabel, form, setForm }: FormModalProps) => {
  return (
    <>
      <div
        style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: COLORS.textMuted,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            Parqueaderos
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: COLORS.text, margin: 0 }}>{title}</h2>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            border: `1px solid ${COLORS.border}`,
            background: COLORS.bg,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.textSoft,
          }}
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Nombre del parqueadero</label>
          <input
            style={inputStyle}
            placeholder="Ej. CARRIL 02 — ZONA NORTE"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
            onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Bloque</label>
            <input
              style={inputStyle}
              placeholder="Ej. B"
              value={form.bloque}
              onChange={(e) => setForm((f) => ({ ...f, bloque: e.target.value }))}
              onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            />
          </div>
          <div>
            <label style={labelStyle}>Número de celdas</label>
            <input
              type="number"
              min={1}
              max={50}
              style={inputStyle}
              value={form.total}
              onChange={(e) =>
                setForm((f) => ({ ...f, total: parseInt(e.target.value) || 1 }))
              }
              onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Tipo</label>
          <select
            style={{ ...inputStyle, appearance: "none" }}
            value={form.tipo}
            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
          >
            <option>General</option>
            <option>Motos</option>
            <option>Visitantes</option>
            <option>Docentes</option>
            <option>Administrativos</option>
          </select>
        </div>
      </div>

      <div
        style={{
          padding: "14px 24px 20px",
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={onClose}
          style={{
            height: 42,
            padding: "0 20px",
            borderRadius: 12,
            border: `1.5px solid ${COLORS.border}`,
            background: COLORS.surface,
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.textSoft,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          style={{
            height: 42,
            padding: "0 24px",
            borderRadius: 12,
            border: "none",
            background: COLORS.primary,
            fontSize: 13,
            fontWeight: 800,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {submitLabel}
        </button>
      </div>
    </>
  );
});

FormModalContent.displayName = "FormModalContent";

export default function Parqueaderos() {
  const [view, setView] = useState<"cards" | "map">("map");
  const [parqueaderos, setParqueaderos] = useState<Parqueadero[]>([
    {
      id: 1,
      nombre: "CARRIL 01 — ZONA CENTRAL",
      bloque: "A",
      tipo: "General",
      total: 12,
      celdas: [
        { codigo: "A01", estado: "libre" },
        { codigo: "A02", estado: "ocupado", placa: "ABC123", conductor: "Carlos Ramirez" },
        { codigo: "A03", estado: "libre" },
        { codigo: "A04", estado: "sena" },
        { codigo: "A05", estado: "libre" },
        { codigo: "A06", estado: "ocupado", placa: "XYZ987", conductor: "Laura Torres" },
        { codigo: "A07", estado: "libre" },
        { codigo: "A08", estado: "libre" },
        { codigo: "A09", estado: "ocupado", placa: "DEF456", conductor: "Andres Perez" },
        { codigo: "A10", estado: "libre" },
        { codigo: "A11", estado: "sena" },
        { codigo: "A12", estado: "libre" },
      ],
    },
    {
      id: 2,
      nombre: "CARRIL 02 — ZONA NORTE",
      bloque: "B",
      tipo: "Motos",
      total: 10,
      celdas: [
        { codigo: "B01", estado: "libre" },
        { codigo: "B02", estado: "ocupado", placa: "MOT001", conductor: "Maria Gomez" },
        { codigo: "B03", estado: "libre" },
        { codigo: "B04", estado: "libre" },
        { codigo: "B05", estado: "sena" },
        { codigo: "B06", estado: "ocupado", placa: "MOT002", conductor: "Daniel Castro" },
        { codigo: "B07", estado: "libre" },
        { codigo: "B08", estado: "libre" },
        { codigo: "B09", estado: "libre" },
        { codigo: "B10", estado: "ocupado", placa: "MOT003", conductor: "Sofia Herrera" },
      ],
    },
    {
      id: 3,
      nombre: "CARRIL 03 — ZONA SUR",
      bloque: "C",
      tipo: "Visitantes",
      total: 8,
      celdas: [
        { codigo: "C01", estado: "ocupado", placa: "VIS001", conductor: "Roberto Diaz" },
        { codigo: "C02", estado: "libre" },
        { codigo: "C03", estado: "sena" },
        { codigo: "C04", estado: "libre" },
        { codigo: "C05", estado: "ocupado", placa: "VIS002", conductor: "Patricia Luna" },
        { codigo: "C06", estado: "libre" },
        { codigo: "C07", estado: "libre" },
        { codigo: "C08", estado: "libre" },
      ],
    },
  ]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [ingresoOpen, setIngresoOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [parqueaderoSeleccionado, setParqueaderoSeleccionado] = useState<Parqueadero | null>(null);
  const [deletingParqueadero, setDeletingParqueadero] = useState<Parqueadero | null>(null);
  const [celdaSeleccionada, setCeldaSeleccionada] = useState<{
    parqueaderoId: number;
    codigo: string;
  } | null>(null);

  const [form, setForm] = useState({ nombre: "", total: 10, bloque: "D", tipo: "General" });
  const [vehiculoForm, setVehiculoForm] = useState({ placa: "", conductor: "" });

  const videoRef = useRef<HTMLVideoElement>(null);

  const conductores = [
    "Carlos Ramirez",
    "Laura Torres",
    "Andres Perez",
    "Maria Gomez",
    "Daniel Castro",
    "Sofia Herrera",
    "Roberto Diaz",
    "Patricia Luna",
  ];

  const stats = useMemo(() => {
    const todas = parqueaderos.flatMap((p) => p.celdas);
    return {
      disponibles: todas.filter((c) => c.estado === "libre").length,
      ocupados: todas.filter((c) => c.estado === "ocupado").length,
      reservados: todas.filter((c) => c.estado === "sena").length,
      total: todas.length,
    };
  }, [parqueaderos]);

  useEffect(() => {
    if (scannerOpen) iniciarCamara();
    return () => {
      if (scannerOpen) cerrarCamara();
    };
  }, [scannerOpen]);

  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  const cerrarCamara = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach((t) => t.stop());
  };

  const tomarFoto = () => {
    setVehiculoForm((v) => ({ ...v, placa: "ABC123" }));
    cerrarCamara();
    setScannerOpen(false);
  };

  const handleCreate = useCallback(() => {
    if (!form.nombre.trim()) {
      alert("El nombre es requerido");
      return;
    }
    const nuevo: Parqueadero = {
      id: Date.now(),
      nombre: sanitizeText(form.nombre.trim()),
      bloque: form.bloque.toUpperCase(),
      tipo: form.tipo,
      total: form.total,
      celdas: Array.from({ length: form.total }).map((_, i) => ({
        codigo: `${form.bloque}${String(i + 1).padStart(2, "0")}`,
        estado: "libre",
      })),
    };
    setParqueaderos((p) => [...p, nuevo]);
    setCreateOpen(false);
    setForm({ nombre: "", total: 10, bloque: "D", tipo: "General" });
  }, [form]);

  const openEdit = useCallback((p: Parqueadero) => {
    setParqueaderoSeleccionado(p);
    setForm({
      nombre: p.nombre,
      total: p.total,
      bloque: p.bloque,
      tipo: p.tipo,
    });
    setEditOpen(true);
  }, []);

  const handleEdit = useCallback(() => {
    if (!parqueaderoSeleccionado) return;
    if (!form.nombre.trim()) {
      alert("El nombre es requerido");
      return;
    }
    setParqueaderos((prev) =>
      prev.map((p) =>
        p.id === parqueaderoSeleccionado.id
          ? { ...p, nombre: sanitizeText(form.nombre.trim()), total: form.total }
          : p
      )
    );
    setEditOpen(false);
  }, [parqueaderoSeleccionado, form]);

  const handleDelete = useCallback(() => {
    if (!deletingParqueadero) return;
    setParqueaderos((p) => p.filter((x) => x.id !== deletingParqueadero.id));
    setConfirmOpen(false);
    setDeletingParqueadero(null);
  }, [deletingParqueadero]);

  const handleClickCelda = useCallback((parqueaderoId: number, celda: Celda) => {
    if (celda.estado !== "libre") return;
    setCeldaSeleccionada({ parqueaderoId, codigo: celda.codigo });
    setVehiculoForm({ placa: "", conductor: "" });
    setIngresoOpen(true);
  }, []);

  const registrarVehiculo = useCallback(() => {
    if (!vehiculoForm.placa.trim() || !vehiculoForm.conductor || !celdaSeleccionada) {
      alert("Completa todos los campos");
      return;
    }

    const placaSanitized = sanitizeText(vehiculoForm.placa.trim().toUpperCase());
    const conductorSanitized = sanitizeText(vehiculoForm.conductor.trim());

    setParqueaderos((prev) =>
      prev.map((parq) => {
        if (parq.id !== celdaSeleccionada.parqueaderoId) return parq;
        return {
          ...parq,
          celdas: parq.celdas.map((c) =>
            c.codigo !== celdaSeleccionada.codigo
              ? c
              : {
                  ...c,
                  estado: "ocupado",
                  placa: placaSanitized,
                  conductor: conductorSanitized,
                }
          ),
        };
      })
    );
    setIngresoOpen(false);
  }, [vehiculoForm, celdaSeleccionada]);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, padding: "16px" }}>
      <style>{`
        @media (min-width: 640px) {
          .park-hero { padding: 28px 32px !important; }
          .park-stats { grid-template-columns: repeat(4, 1fr) !important; }
          .park-hero-row { flex-direction: row !important; align-items: center !important; }
          .park-btn-new { width: auto !important; }
          .park-celdas { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .park-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .park-celdas { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (min-width: 1280px) {
          .park-celdas-lg { grid-template-columns: repeat(6, 1fr) !important; }
        }
        .park-celda-btn:disabled { cursor: default !important; }
      `}</style>

      <div
        className="park-hero"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
          borderRadius: 24,
          padding: "20px 20px",
          marginBottom: 16,
          boxShadow: `0 12px 40px rgba(47,143,0,.25)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,.06)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: 80,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,.04)",
            pointerEvents: "none",
          }}
        />

        <div
          className="park-hero-row"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 20,
            position: "relative",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,.15)",
                borderRadius: 99,
                padding: "5px 12px",
                marginBottom: 10,
              }}
            >
              <Shield size={12} color="rgba(255,255,255,.85)" />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,.85)",
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                }}
              >
                Gestión SENA
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Panel de Parqueaderos
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,.75)" }}>
              Gestión de celdas vehiculares en tiempo real
            </p>
          </div>
          <button
            className="park-btn-new"
            onClick={() => setCreateOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 44,
              padding: "0 20px",
              borderRadius: 14,
              background: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 800,
              color: COLORS.primaryDark,
              boxShadow: "0 4px 14px rgba(0,0,0,.12)",
              width: "100%",
            }}
          >
            <Plus size={16} />
            Nuevo Parqueadero
          </button>
        </div>

        <div className="park-stats" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          <StatPill label="Disponibles" value={stats.disponibles} dot="#4CAF50" />
          <StatPill label="Ocupados" value={stats.ocupados} dot="#EF4444" />
          <StatPill label="Reservados" value={stats.reservados} dot="#F59E0B" />
          <StatPill label="Total" value={stats.total} dot="rgba(255,255,255,.6)" />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(Object.entries(CELDA_CONFIG) as [CeldaEstado, typeof CELDA_CONFIG["libre"]][]).map(([key, cfg]) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: COLORS.surface,
                borderRadius: 99,
                padding: "5px 12px",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dotColor }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSoft }}>{cfg.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>
            {parqueaderos.length} parqueadero{parqueaderos.length !== 1 ? "s" : ""}
          </span>

          <div
            style={{
              display: "flex",
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              overflow: "hidden",
              background: COLORS.surface,
            }}
          >
            <button
              onClick={() => setView("map")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 14px",
                border: "none",
                background: view === "map" ? COLORS.primary : "transparent",
                color: view === "map" ? "#fff" : COLORS.textSoft,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all .2s",
              }}
              aria-label="Vista mapa"
            >
              <MapIcon size={13} />
              Mapa
            </button>
            <button
              onClick={() => setView("cards")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "7px 14px",
                border: "none",
                borderLeft: `1px solid ${COLORS.border}`,
                background: view === "cards" ? COLORS.primary : "transparent",
                color: view === "cards" ? "#fff" : COLORS.textSoft,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all .2s",
              }}
              aria-label="Vista tarjetas"
            >
              <LayoutGrid size={13} />
              Tarjetas
            </button>
          </div>
        </div>
      </div>

      {view === "map" && <ParkingMap parqueaderos={parqueaderos} onCellClick={handleClickCelda} />}

      {view === "cards" && (
        <div className="park-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {parqueaderos.map((parqueadero) => {
            const libres = parqueadero.celdas.filter((c) => c.estado === "libre").length;
            const ocupados = parqueadero.celdas.filter((c) => c.estado === "ocupado").length;
            const pct = Math.round((ocupados / parqueadero.celdas.length) * 100);
            return (
              <div
                key={parqueadero.id}
                style={{
                  background: COLORS.surface,
                  borderRadius: 20,
                  border: `1px solid ${COLORS.border}`,
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,.04)",
                }}
              >
                <div
                  style={{
                    padding: "16px 18px 14px",
                    borderBottom: `1px solid ${COLORS.border}`,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          background: COLORS.primaryLight,
                          border: `1px solid ${COLORS.primaryBorder}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <ParkingCircle size={16} color={COLORS.primary} />
                      </div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: 14,
                          fontWeight: 900,
                          color: COLORS.text,
                          letterSpacing: ".01em",
                        }}
                      >
                        {sanitizeText(parqueadero.nombre)}
                      </h2>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                      {[
                        { dot: "#4CAF50", label: `${libres} libres` },
                        { dot: "#EF4444", label: `${ocupados} ocupados` },
                        {
                          dot: "#F59E0B",
                          label: `${parqueadero.celdas.filter((c) => c.estado === "sena").length} SENA`,
                        },
                      ].map((s) => (
                        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: s.dot,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSoft }}>
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div
                        style={{
                          height: 4,
                          borderRadius: 99,
                          background: COLORS.border,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: pct > 80 ? "#EF4444" : pct > 50 ? "#F59E0B" : COLORS.primary,
                            borderRadius: 99,
                            transition: "width .3s ease",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: COLORS.textMuted,
                          marginTop: 3,
                          fontWeight: 600,
                        }}
                      >
                        {pct}% de ocupación
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => openEdit(parqueadero)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        border: `1px solid ${COLORS.border}`,
                        background: COLORS.bg,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: COLORS.textSoft,
                      }}
                      aria-label={`Editar ${sanitizeText(parqueadero.nombre)}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingParqueadero(parqueadero)}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        border: `1px solid ${COLORS.dangerBorder}`,
                        background: COLORS.dangerBg,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: COLORS.danger,
                      }}
                      aria-label={`Eliminar ${sanitizeText(parqueadero.nombre)}`}
                      onClick={() => {
                        setDeletingParqueadero(parqueadero);
                        setConfirmOpen(true);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div
                  className="park-celdas park-celdas-lg"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 8,
                    padding: 16,
                  }}
                >
                  {parqueadero.celdas.map((celda) => (
                    <CeldaCard
                      key={celda.codigo}
                      celda={celda}
                      onClick={() => handleClickCelda(parqueadero.id, celda)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)}>
        <FormModalContent
          title="Nuevo Parqueadero"
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
          submitLabel="Crear Parqueadero"
          form={form}
          setForm={setForm}
        />
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <FormModalContent
          title="Editar Parqueadero"
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
          submitLabel="Guardar Cambios"
          form={form}
          setForm={setForm}
        />
      </Modal>

      <Modal open={ingresoOpen} onClose={() => setIngresoOpen(false)} maxW={480}>
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: COLORS.textMuted,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Celda {celdaSeleccionada?.codigo}
            </div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: COLORS.text }}>
              Registrar Vehículo
            </h2>
          </div>
          <button
            onClick={() => setIngresoOpen(false)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.bg,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.textSoft,
            }}
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Matrícula</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={vehiculoForm.placa}
                onChange={(e) => setVehiculoForm((v) => ({ ...v, placa: e.target.value.toUpperCase() }))}
                placeholder="ABC123"
                style={{
                  ...inputStyle,
                  flex: 1,
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: ".06em",
                }}
                onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
                onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
              />
              <button
                onClick={() => setScannerOpen(true)}
                style={{
                  height: 48,
                  padding: "0 16px",
                  borderRadius: 12,
                  border: "none",
                  background: COLORS.text,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                }}
                aria-label="Escanear matrícula"
              >
                <Camera size={16} />
              </button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Conductor</label>
            <select
              value={vehiculoForm.conductor}
              onChange={(e) => setVehiculoForm((v) => ({ ...v, conductor: e.target.value }))}
              style={{ ...inputStyle, appearance: "none" }}
            >
              <option value="">Seleccionar conductor…</option>
              {conductores.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
          <button
            onClick={() => setIngresoOpen(false)}
            style={{
              flex: 1,
              height: 46,
              borderRadius: 12,
              border: `1.5px solid ${COLORS.border}`,
              background: COLORS.surface,
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.textSoft,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={registrarVehiculo}
            disabled={!vehiculoForm.placa.trim() || !vehiculoForm.conductor}
            style={{
              flex: 2,
              height: 46,
              borderRadius: 12,
              border: "none",
              background:
                vehiculoForm.placa.trim() && vehiculoForm.conductor ? COLORS.primary : COLORS.border,
              fontSize: 13,
              fontWeight: 800,
              color: "#fff",
              cursor: vehiculoForm.placa.trim() && vehiculoForm.conductor ? "pointer" : "default",
              transition: "background .2s",
            }}
          >
            Registrar Vehículo
          </button>
        </div>
      </Modal>

      <Modal open={scannerOpen} onClose={() => { cerrarCamara(); setScannerOpen(false); }} maxW={720}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: COLORS.text }}>
              Escanear Matrícula
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.textMuted }}>
              Simulación de captura
            </p>
          </div>
          <button
            onClick={() => { cerrarCamara(); setScannerOpen(false); }}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.bg,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.textSoft,
            }}
            aria-label="Cerrar escáner"
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ position: "relative", background: "#000", aspectRatio: "16/9" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "55%",
                maxWidth: 300,
                aspectRatio: "3/1",
                border: `3px solid ${COLORS.primary}`,
                borderRadius: 16,
                boxShadow: "0 0 0 9999px rgba(0,0,0,.5)",
              }}
            />
          </div>
          {[
            ["0", "0"],
            ["0", "auto"],
            ["auto", "0"],
            ["auto", "auto"],
          ].map(([t, r], i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: t === "0" ? 16 : "auto",
                bottom: t === "auto" ? 16 : "auto",
                left: r === "0" ? 16 : "auto",
                right: r === "auto" ? 16 : "auto",
                width: 20,
                height: 20,
                borderTop: t === "0" ? `3px solid ${COLORS.primary}` : "none",
                borderBottom: t === "auto" ? `3px solid ${COLORS.primary}` : "none",
                borderLeft: r === "0" ? `3px solid ${COLORS.primary}` : "none",
                borderRight: r === "auto" ? `3px solid ${COLORS.primary}` : "none",
                borderRadius: 3,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "14px 20px 20px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => { cerrarCamara(); setScannerOpen(false); }}
            style={{
              height: 44,
              padding: "0 24px",
              borderRadius: 12,
              border: `1.5px solid ${COLORS.border}`,
              background: COLORS.surface,
              fontSize: 13,
              fontWeight: 700,
              color: COLORS.textSoft,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={tomarFoto}
            style={{
              height: 44,
              padding: "0 28px",
              borderRadius: 12,
              border: "none",
              background: COLORS.primary,
              fontSize: 13,
              fontWeight: 800,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Camera size={15} />
            Tomar Foto
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onConfirm={handleDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setDeletingParqueadero(null);
        }}
        title="Eliminar Parqueadero"
        message={`¿Estás seguro de eliminar el parqueadero "${sanitizeText(deletingParqueadero?.nombre || '')}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}