import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { theme } from "@/theme";
import {
  Ocupante, LotLayout, FilaLayout,
  CELDA_CONFIG, TIPO_CELDA_CONFIG, getTipoCeldaConfig,
  SPACE_W, SPACE_H, GAP_X, ROW_GAP, LANE_H, PADDING, SECTION_GAP, ROAD_Y, ROAD_H,
  formatearDuracion,
} from "./helpers";
import { MAP_THEME, HighFiCarSVG, HighFiMotoSVG, CAR_PALETTE, CAR_PALETTE_LIGHT } from "./mapVisuals";

const C = theme;

/* ============================================================
   PARKING MAP
============================================================ */
export const ParkingMap = memo(({ parqueaderos, celdas, getOcupante, onCellClick, cellMatchesSearch }: {
  parqueaderos: Parqueadero[];
  celdas: Celda[];
  getOcupante: (celdaId: string) => Ocupante | null;
  onCellClick: (celda: Celda) => void;
  cellMatchesSearch: (c: Celda) => boolean;
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hover, setHover] = useState<{ celda: Celda; pqNombre: string; tipoPq: string; clientX: number; clientY: number } | null>(null);

  const dragOriginRef   = useRef({ x: 0, y: 0 });
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const isDraggedRef    = useRef(false);
  const pendingCellRef  = useRef<Celda | null>(null);

  const DRAG_THRESHOLD = 8;

  const lots = useMemo<LotLayout[]>(() => {
    const result: LotLayout[] = [];
    let currentTop = ROAD_Y + ROAD_H + 28;
    parqueaderos.forEach(pq => {
      const celdasPq = celdas.filter(c => c.parqueaderoId === pq.id);
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
      const libres        = celdasPq.filter(c => c.estado === "disponible").length;
      const ocupados      = celdasPq.filter(c => c.estado === "no_disponible").length;
      const reservadas    = celdasPq.filter(c => c.estado === "reservada").length;
      const mantenimiento = celdasPq.filter(c => c.estado === "mantenimiento").length;
      const pct           = celdasPq.length ? Math.round(ocupados / celdasPq.length * 100) : 0;
      const lotHeight = y - currentTop + 20;
      result.push({ pq, filas, lotTop: currentTop, lotHeight, ancho, celdasPorFila, libres, ocupados, reservadas, mantenimiento, pct });
      currentTop = y + SECTION_GAP;
    });
    return result;
  }, [parqueaderos, celdas]);

  const totalW = useMemo(() => {
    const maxAncho = lots.length ? Math.max(...lots.map(l => l.ancho)) : 0;
    return Math.max(960, maxAncho + PADDING);
  }, [lots]);

  const totalH = useMemo(() => {
    if (!lots.length) return ROAD_Y + ROAD_H + 80;
    return Math.max(ROAD_Y + ROAD_H + 80, lots[lots.length - 1].lotTop + lots[lots.length - 1].lotHeight + 20);
  }, [lots]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isDraggedRef.current   = false;
    pendingCellRef.current = null;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    dragOriginRef.current   = { x: pan.x, y: pan.y };
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
    isDraggedRef.current   = false;
    pendingCellRef.current = null;
  }, [onCellClick]);

  const handleCellPointerDown = useCallback((
    e: React.PointerEvent<SVGGElement>,
    celda: Celda
  ) => {
    e.stopPropagation();
    pendingCellRef.current = celda;
  }, []);

  return (
    <div style={{
      position: "relative", width: "100%", overflow: "hidden",
      borderRadius: 16, border: `1px solid ${C.border}`,
      background: MAP_THEME.asphalt, boxShadow: "0 2px 8px rgba(15,23,42,.05)"
    }}>
      {/* ── LEYENDA GLOBAL: tipo de celda + estado ── */}
      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 10,
        display: "flex", flexDirection: "column", gap: 6, maxWidth: "calc(100% - 120px)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", flexWrap: "wrap", gap: 3,
          background: "rgba(20,22,25,.85)", border: "1px solid rgba(255,255,255,.14)",
          borderRadius: 12, padding: "7px 11px", backdropFilter: "blur(4px)",
          boxShadow: "0 4px 14px rgba(0,0,0,.25)",
        }}>
          {Object.entries(TIPO_CELDA_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} style={{
                display: "flex", alignItems: "center", gap: 5,
                background: `${cfg.accent}26`, border: `1px solid ${cfg.accent}55`,
                borderRadius: 8, padding: "3px 8px 3px 6px", marginRight: 2,
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 5, background: cfg.accent,
                  display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon size={10} color="#fff" strokeWidth={2.75} />
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>{cfg.shortLabel}</span>
              </div>
            );
          })}
        </div>
        <div style={{
          display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10,
          background: "rgba(20,22,25,.85)", border: "1px solid rgba(255,255,255,.14)",
          borderRadius: 12, padding: "6px 11px", backdropFilter: "blur(4px)",
          boxShadow: "0 4px 14px rgba(0,0,0,.25)",
        }}>
          {Object.entries(CELDA_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dotColor, flexShrink: 0, boxShadow: `0 0 6px ${cfg.dotColor}99` }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.9)", whiteSpace: "nowrap" }}>{cfg.label}</span>
            </div>
          ))}
        </div>
        {/* Pista de uso: la placa ya se ve directamente sobre cada carro, pero
            tocar la celda abre el detalle completo (conductor, hora de ingreso, etc). */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
          background: "rgba(20,22,25,.85)", border: "1px solid rgba(255,255,255,.14)",
          borderRadius: 12, padding: "5px 10px", backdropFilter: "blur(4px)",
          boxShadow: "0 4px 14px rgba(0,0,0,.25)",
        }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,.75)", whiteSpace: "nowrap" }}>
            👆 Toca una celda para ver conductor, hora de ingreso y más detalles
          </span>
        </div>
      </div>

      {/* Fila horizontal (no columna) para no tapar verticalmente el carril "SALIDA" del plano */}
      <div style={{
        position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", gap: 6,
        background: "rgba(20,22,25,.85)", border: "1px solid rgba(255,255,255,.14)",
        borderRadius: 12, padding: 4, backdropFilter: "blur(4px)", boxShadow: "0 4px 14px rgba(0,0,0,.25)",
      }}>
        {[
          { icon: <ZoomIn size={15} />,   act: () => setZoom(z => Math.min(2.5, z + .15)), label: "Acercar" },
          { icon: <ZoomOut size={15} />,  act: () => setZoom(z => Math.max(.4,  z - .15)), label: "Alejar" },
          { icon: <Maximize2 size={14}/>, act: () => { setZoom(1); setPan({ x: 0, y: 0 }); }, label: "Restablecer vista" },
        ].map((b, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); b.act(); }} title={b.label} aria-label={b.label}
            style={{ width:30, height:30, borderRadius:8, border:"1px solid rgba(255,255,255,.14)", background:"rgba(255,255,255,.06)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
            {b.icon}
          </button>
        ))}
      </div>

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
          <defs>
            <pattern id="asp" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect width="30" height="30" fill={MAP_THEME.asphalt} />
            </pattern>
            <pattern id="resH" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill={CELDA_CONFIG.reservada.mapFill} />
              <line x1="0" y1="0" x2="0" y2="10" stroke={CELDA_CONFIG.reservada.mapStroke} strokeWidth="1.4" opacity=".4" />
            </pattern>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="roadG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2D3748" /><stop offset="100%" stopColor="#1A202C" />
            </linearGradient>
            <linearGradient id="grassG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#065F46" /><stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
            {/* Degradado por color de carrocería, para que carros y motos se vean con
                un poco de volumen/brillo en vez de un relleno plano. */}
            {CAR_PALETTE.map((base, i) => (
              <linearGradient key={i} id={`carG${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={CAR_PALETTE_LIGHT[i]} />
                <stop offset="100%" stopColor={base} />
              </linearGradient>
            ))}
          </defs>

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

          {lots.map(({ pq, celdasPorFila, libres, ocupados, reservadas, pct, filas, lotTop, lotHeight, ancho }) => {
            const hc = pct >= 90 ? C.danger : pct >= 50 ? C.amber : C.primary;
            // Composición de la zona por tipo de vehículo, para distinguir de un vistazo
            // qué parqueaderos son de carro, de moto o mixtos (celdas de movilidad reducida incluidas).
            const composicion = (
              [
                { t: "carro" as const, n: pq.celdasCarros },
                { t: "moto" as const, n: pq.celdasMotos },
                { t: "movilidad reducida" as const, n: pq.celdasMovilidadReducida },
              ]
            ).filter(x => x.n > 0);
            const chipW = 32, chipGap = 5;
            const chipsW = composicion.length * chipW + Math.max(0, composicion.length - 1) * chipGap;
            let chipX = ancho - chipsW;
            return (
              <g key={pq.id}>
                <rect x={PADDING - 20} y={lotTop - 12} width={ancho - PADDING + 40} height={lotHeight + 12} rx="14" fill={MAP_THEME.asphaltPanel} stroke={MAP_THEME.panelBorder} strokeWidth="1.5" />
                <rect x={PADDING - 10} y={lotTop - 6} width={ancho - PADDING + 10} height={34} rx="8" fill={hc} />
                <text x={PADDING + 2} y={lotTop + 10} fill="#fff" fontSize="10.5" fontWeight="900">{pq.nombre.toUpperCase()}</text>
                <text x={PADDING + 2} y={lotTop + 22} fill="rgba(255,255,255,.8)" fontSize="7.5" fontWeight="bold">BLOQUE {pq.bloque}</text>
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
                </g>

                {filas.map((fila, fi) => fila.esCarril ? (
                  <g key={`c-${fi}`}>
                    <rect x={PADDING - 8} y={fila.y - 4} width={celdasPorFila * (SPACE_W + GAP_X) + 16} height={LANE_H - 8} fill="url(#roadG)" rx="4" />
                    <line x1={PADDING} y1={fila.y + LANE_H / 2 - 4} x2={PADDING + celdasPorFila * (SPACE_W + GAP_X) - GAP_X} y2={fila.y + LANE_H / 2 - 4} stroke="#F5C344" strokeWidth="1.2" strokeDasharray="6,5" opacity=".4" />
                  </g>
                ) : (
                  <g key={`f-${fi}`}>
                    {fila.celdas.map(celda => {
                      const cfg = CELDA_CONFIG[celda.estado];
                      const tipoCfg = getTipoCeldaConfig(celda.tipo);
                      const TipoIcon = tipoCfg.icon;
                      const m = cellMatchesSearch(celda);
                      const ocupante = celda.estado === "no_disponible" ? getOcupante(celda.id) : null;

                      // Determinar si la celda está realmente ocupada
                      const estaOcupada = celda.estado === "no_disponible" && ocupante !== null;
                      const esMoto = celda.tipo === "moto";

                      return (
                        <g
                          key={celda.id}
                          onPointerDown={e => handleCellPointerDown(e, celda)}
                          onMouseMove={e => {
                            if (!isDraggedRef.current) {
                              setHover({ celda, pqNombre: pq.nombre, tipoPq: pq.tipo, clientX: e.clientX, clientY: e.clientY });
                            }
                          }}
                          onMouseLeave={() => setHover(null)}
                          style={{ cursor: "pointer" }}
                        >
                          {m && <rect x={celda.x - 3} y={celda.y - 3} width={SPACE_W + 6} height={SPACE_H + 6} rx="7" fill="none" stroke="#FBBF24" strokeWidth="4.5" filter="url(#glow)" />}
                          <rect
                            x={celda.x} y={celda.y} width={SPACE_W} height={SPACE_H} rx="5"
                            fill={celda.estado === "reservada" ? "url(#resH)" : cfg.mapFill}
                            stroke={m ? "#F59E0B" : cfg.mapStroke}
                            strokeWidth={m ? 2.2 : celda.estado === "disponible" ? 1.1 : .9}
                            strokeOpacity={m ? 1 : celda.estado === "disponible" ? .85 : .55}
                            strokeDasharray={celda.estado === "disponible" ? "3,2" : undefined}
                          />
                          {/* Franja lateral de color según TIPO de celda (carro/moto/m.reducida) — visible en cualquier estado */}
                          <rect x={celda.x} y={celda.y} width={4} height={SPACE_H} rx="2" fill={tipoCfg.accent} opacity={.9} />
                          {/* Insignia con icono del tipo (esquina superior derecha): solo cuando no hay
                              silueta de vehículo dibujada, que ya comunica el tipo por su forma. */}
                          {!estaOcupada && (
                            <g transform={`translate(${celda.x + SPACE_W - 15},${celda.y + 2.5})`}>
                              <rect width="14" height="14" rx="4" fill={tipoCfg.accent} stroke="#fff" strokeWidth=".6" opacity=".9"/>
                              <TipoIcon x={2.5} y={2.5} width={9} height={9} color="#fff" strokeWidth={3}/>
                            </g>
                          )}
                          {/* Número de celda: bien grande y siempre legible, es la primera referencia
                              que necesita el vigilante para orientar al conductor. */}
                          <text x={celda.x + 8} y={celda.y + 13} fill={m ? "#FFF" : MAP_THEME.textBright} fontSize="9.5" fontWeight="900">{celda.numero}</text>
                          {celda.estado === "disponible" && !estaOcupada && (
                            <TipoIcon
                              x={celda.x + SPACE_W / 2 - 10}
                              y={celda.y + SPACE_H / 2 - 10}
                              width={20}
                              height={20}
                              color={tipoCfg.accent}
                              opacity={.4}
                              strokeWidth={2.2}
                            />
                          )}
                          {estaOcupada && ocupante && (
                            esMoto
                              ? <HighFiMotoSVG x={celda.x} y={celda.y} w={SPACE_W} h={SPACE_H} placa={ocupante.vehiculo.placa || "···"} />
                              : <HighFiCarSVG  x={celda.x} y={celda.y} w={SPACE_W} h={SPACE_H} placa={ocupante.vehiculo.placa || "···"} />
                          )}
                          {celda.estado === "no_disponible" && !ocupante && (
                            <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 8} textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#FBBF24">Sin datos</text>
                          )}
                          {celda.estado === "reservada"      && <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 8} textAnchor="middle" fontSize="7.5" fontWeight="850" fill="#FCD34D" opacity={.95}>RESERVA</text>}
                          {celda.estado === "mantenimiento"  && <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 8} textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#CBD5E1" opacity={.9}>MANT.</text>}
                        </g>
                      );
                    })}
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {hover && (() => {
        const ocupante = hover.celda.estado === "no_disponible" ? getOcupante(hover.celda.id) : null;
        const estaOcupada = hover.celda.estado === "no_disponible" && ocupante !== null;
        const tipoCfg = getTipoCeldaConfig(hover.celda.tipo);
        const TipoIcon = tipoCfg.icon;

        return (
        <div style={{
          position: "fixed",
          left: Math.min(hover.clientX + 16, window.innerWidth - 224),
          top: Math.min(hover.clientY + 16, window.innerHeight - 200),
          zIndex: 100, pointerEvents: "none", width: 208,
          borderRadius: 14, border: "1px solid rgba(255,255,255,.12)",
          background: "rgba(15,17,20,.95)", padding: 12, color: "#fff",
          boxShadow: "0 10px 30px rgba(0,0,0,.35)"
        }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,.08)", paddingBottom:6, marginBottom:8 }}>
            <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:900, color:C.primaryLight }}>{hover.celda.numero}</span>
            <span style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,.45)", textTransform:"uppercase" }}>{hover.tipoPq}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:8 }}>
            <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:16, height:16, borderRadius:5, background:tipoCfg.accent }}>
              <TipoIcon size={10} color="#fff" strokeWidth={2.5}/>
            </span>
            <span style={{ fontSize:10, fontWeight:800, color:"rgba(255,255,255,.8)" }}>{tipoCfg.label}</span>
          </div>
          {estaOcupada && ocupante ? (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:900, background:"rgba(255,255,255,.08)", padding:"2px 6px", borderRadius:6 }}>{ocupante.vehiculo.placa}</span>
                {ocupante.esOficial && <span style={{ fontSize:8, fontWeight:900, color:C.primaryLight, border:`1px solid ${C.primary}`, borderRadius:4, padding:"1px 4px" }}>OFICIAL</span>}
              </div>
              <div style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.75)", marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{ocupante.conductor?.nombre || "—"}</div>
              <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid rgba(255,255,255,.08)", fontSize:9, fontWeight:700, color:"rgba(255,255,255,.55)" }}>
                <div>Estadía: {formatearDuracion(ocupante.fechaEntrada)}</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.7)" }}>
              {hover.celda.estado === "reservada" ? "Celda reservada" :
               hover.celda.estado === "mantenimiento" ? "En mantenimiento" :
               hover.celda.estado === "no_disponible" ? "Ocupada, sin datos de vehículo" :
               "Celda libre"}
            </div>
          )}
        </div>
      );})()}
    </div>
  );
});

ParkingMap.displayName = "ParkingMap";
