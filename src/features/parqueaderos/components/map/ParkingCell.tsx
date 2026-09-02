import type { Celda } from "@/services/api/celdas";
import { CELDA_CONFIG, CeldaPos, estaFueraDeHorarioOperacion, getTipoCeldaConfig, Ocupante, SPACE_W, SPACE_H, superaEstadiaLimite } from "../../lib/helpers";
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
  // Mismo indicador que la vista tabla ("⚠️ +16h") — nunca para un ingreso "Oficial SENA"
  // (ver superaEstadiaLimite). Se ubica en la esquina inferior derecha, la única libre: la
  // superior izquierda ya la usa el aviso de incidente y la superior derecha la de "fuera de
  // horario"/tipo, y ambas pueden coincidir con esta al mismo tiempo.
  const estadiaLarga = estaOcupada && !!ocupante && superaEstadiaLimite(ocupante.fechaEntrada, ocupante.esOficial);

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
        fill={celda.estado === "reservada" ? "url(#resH)" : `url(#cellG-${celda.estado})`}
        stroke={m ? "#F59E0B" : fueraDeHorario ? "#DC2626" : cfg.mapStroke}
        strokeWidth={m ? 2.2 : fueraDeHorario ? 1.8 : celda.estado === "disponible" ? 1.1 : 0.9}
        strokeOpacity={m ? 1 : fueraDeHorario ? 1 : celda.estado === "disponible" ? 0.85 : 0.55}
      >
        {fueraDeHorario && <title>Sigue ocupada fuera del horario permitido — considera generar un incidente</title>}
      </rect>
      {/* Líneas pintadas del espacio (estilo demarcación real de parqueadero): un marco en
          "U" abierto por el frente (por donde entraría el vehículo) en vez del borde punteado
          que había antes — es lo que hace que una celda libre se lea como un espacio marcado
          sobre el pavimento y no como un simple recuadro de selección. */}
      {celda.estado === "disponible" && (
        <path
          d={`M ${celda.x + 5} ${celda.y + SPACE_H - 3}
              L ${celda.x + 5} ${celda.y + 5}
              L ${celda.x + SPACE_W - 5} ${celda.y + 5}
              L ${celda.x + SPACE_W - 5} ${celda.y + SPACE_H - 3}`}
          fill="none" stroke="#fff" strokeWidth="1.6" strokeOpacity=".55" strokeLinecap="round" strokeLinejoin="round"
        />
      )}
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
      {/* Número de celda: se dibuja AL FINAL (por encima del vehículo, si está ocupada) — antes
          quedaba tapado por la silueta del carro/moto, que se dibuja después en el orden del
          documento SVG. El contorno oscuro (paintOrder="stroke") lo hace legible encima de
          cualquier color de carrocería sin depender de una placa de fondo sólida. */}
      <text x={celda.x + 8} y={celda.y + 13} fontSize="9.5" fontWeight="900" letterSpacing=".2"
        fill={m ? "#FFF" : MAP_THEME.textBright} stroke="rgba(0,0,0,.6)" strokeWidth="2.6" strokeLinejoin="round" paintOrder="stroke"
      >{celda.numero}</text>
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
        <g transform={`translate(${celda.x + 1},${celda.y + 2.5})`} pointerEvents="none">
          <title>Tiene un incidente abierto reportado</title>
          <rect width="14" height="14" rx="4" fill="#F59E0B" stroke="#fff" strokeWidth=".6" />
          <text x="7" y="10.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="#111318">!</text>
        </g>
      )}
      {estadiaLarga && (
        <g transform={`translate(${celda.x + SPACE_W - 18},${celda.y + SPACE_H - 15})`} pointerEvents="none">
          <title>Lleva más de 16 horas estacionado — considera generar un incidente</title>
          <rect width="17" height="13" rx="3.5" fill="#DC2626" stroke="#fff" strokeWidth=".6" />
          <text x="8.5" y="9.8" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="#fff">16h</text>
        </g>
      )}
    </g>
  );
}
