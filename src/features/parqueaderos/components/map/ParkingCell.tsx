import type { Celda } from "@/services/api/celdas";
import { CELDA_CONFIG, CeldaPos, estaFueraDeHorarioOperacion, getTipoCeldaConfig, Ocupante, SPACE_W, SPACE_H } from "../../lib/helpers";
import { MAP_THEME, HighFiCarSVG, HighFiMotoSVG } from "./MapVisuals";
import type { HoverInfo } from "./useParkingMapInteraction";

interface ParkingCellProps {
  celda: CeldaPos;
  pqNombre: string;
  tipoPq: string;
  matches: boolean;
  tieneIncidente: boolean;
  ocupante: Ocupante | null;
  onPointerDown: (e: React.PointerEvent<SVGGElement>, celda: Celda) => void;
  onHover: (info: HoverInfo) => void;
  onHoverLeave: () => void;
}

/** Una celda del plano: relleno por estado, franja/insignia de tipo, silueta del vehículo si está ocupada. */
export function ParkingCell({ celda, pqNombre, tipoPq, matches: m, tieneIncidente, ocupante, onPointerDown, onHover, onHoverLeave }: ParkingCellProps) {
  const cfg = CELDA_CONFIG[celda.estado];
  const tipoCfg = getTipoCeldaConfig(celda.tipo);
  const TipoIcon = tipoCfg.icon;
  const estaOcupada = celda.estado === "no_disponible" && ocupante !== null;
  const esMoto = celda.tipo === "moto";
  // Mismo indicador que ya existe en la vista tabla (ParqueaderosTable.tsx, "⏰ Fuera de
  // horario"), adaptado al vocabulario visual del plano SVG: reutiliza el mismo helper
  // canónico `estaFueraDeHorarioOperacion()` en vez de reimplementar el cálculo.
  const fueraDeHorario = estaOcupada && estaFueraDeHorarioOperacion();

  return (
    <g
      onPointerDown={(e) => onPointerDown(e, celda)}
      onMouseMove={(e) => onHover({ celda, pqNombre, tipoPq, clientX: e.clientX, clientY: e.clientY })}
      onMouseLeave={onHoverLeave}
      style={{ cursor: "pointer" }}
    >
      {m && <rect x={celda.x - 3} y={celda.y - 3} width={SPACE_W + 6} height={SPACE_H + 6} rx="7" fill="none" stroke="#FBBF24" strokeWidth="4.5" filter="url(#glow)" />}
      <rect
        x={celda.x} y={celda.y} width={SPACE_W} height={SPACE_H} rx="5"
        fill={celda.estado === "reservada" ? "url(#resH)" : cfg.mapFill}
        stroke={m ? "#F59E0B" : fueraDeHorario ? "#DC2626" : cfg.mapStroke}
        strokeWidth={m ? 2.2 : fueraDeHorario ? 1.8 : celda.estado === "disponible" ? 1.1 : 0.9}
        strokeOpacity={m ? 1 : fueraDeHorario ? 1 : celda.estado === "disponible" ? 0.85 : 0.55}
        strokeDasharray={celda.estado === "disponible" ? "3,2" : undefined}
      >
        {fueraDeHorario && <title>Sigue ocupada fuera del horario permitido — considera generar un incidente</title>}
      </rect>
      {/* Franja lateral de color según TIPO de celda (carro/moto/m.reducida) — visible en cualquier estado */}
      <rect x={celda.x} y={celda.y} width={4} height={SPACE_H} rx="2" fill={tipoCfg.accent} opacity={0.9} />
      {/* Insignia con icono del tipo (esquina superior derecha): solo cuando no hay
          silueta de vehículo dibujada, que ya comunica el tipo por su forma. */}
      {!estaOcupada && (
        <g transform={`translate(${celda.x + SPACE_W - 15},${celda.y + 2.5})`}>
          <rect width="14" height="14" rx="4" fill={tipoCfg.accent} stroke="#fff" strokeWidth=".6" opacity=".9" />
          <TipoIcon x={2.5} y={2.5} width={9} height={9} color="#fff" strokeWidth={3} />
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
          opacity={0.4}
          strokeWidth={2.2}
        />
      )}
      {estaOcupada && ocupante && (
        esMoto
          ? <HighFiMotoSVG x={celda.x} y={celda.y} w={SPACE_W} h={SPACE_H} placa={ocupante.vehiculo.placa || "···"} />
          : <HighFiCarSVG x={celda.x} y={celda.y} w={SPACE_W} h={SPACE_H} placa={ocupante.vehiculo.placa || "···"} />
      )}
      {/* Insignia de "fuera de horario" (mismo aviso que ParqueaderosTable.tsx): ocupa la
          misma esquina que la insignia de tipo, que ya está oculta mientras la celda está
          ocupada (la silueta del vehículo comunica el tipo por su forma). */}
      {fueraDeHorario && (
        <g transform={`translate(${celda.x + SPACE_W - 15},${celda.y + 2.5})`} pointerEvents="none">
          <title>Sigue ocupada fuera del horario permitido — considera generar un incidente</title>
          <rect width="14" height="14" rx="4" fill="#DC2626" stroke="#fff" strokeWidth=".6" />
          <text x="7" y="10.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">!</text>
        </g>
      )}
      {celda.estado === "no_disponible" && !ocupante && (
        <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 8} textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#FBBF24">Sin datos</text>
      )}
      {celda.estado === "reservada" && <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 8} textAnchor="middle" fontSize="7.5" fontWeight="850" fill="#FCD34D" opacity={0.95}>RESERVA</text>}
      {celda.estado === "mantenimiento" && <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 8} textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#CBD5E1" opacity={0.9}>MANT.</text>}
      {/* Aviso de incidente/novedad abierto sobre esta celda — esquina opuesta a la insignia de
          tipo para no chocar con ella (ni con la de "fuera de horario", que solo aparece cuando
          está ocupada); un incidente puede reportarse con la celda en cualquier estado. */}
      {tieneIncidente && (
        <g transform={`translate(${celda.x - 5},${celda.y - 5})`} pointerEvents="none">
          <title>Tiene un incidente abierto reportado</title>
          <circle r="7" fill="#0F172A" stroke="#fff" strokeWidth="1.4" />
          <text textAnchor="middle" dominantBaseline="central" y="0.5" fontSize="9" fontWeight="900" fill="#FBBF24">!</text>
        </g>
      )}
    </g>
  );
}
