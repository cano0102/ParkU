import { memo } from "react";

export const MAP_THEME={
  asphalt:"#22262b",asphaltPanel:"#2a2f35",road:"#34393f",
  panelBorder:"rgba(255,255,255,.08)",textBright:"#f4f4f4",textDim:"rgba(244,244,244,.62)",
};

/* Paleta de carrocería (10 tonos) + su variante clara, usadas juntas para
   pintar cada vehículo con un degradado sutil (look "pulido") en vez de un
   relleno plano. Un mismo índice en ambos arreglos = el mismo color. */
export const CAR_PALETTE = [
  "#4C6EF5", "#12B886", "#F76707", "#7048E8", "#E64980",
  "#1098AD", "#F59F00", "#495057", "#2F9E44", "#E03131",
];
export const CAR_PALETTE_LIGHT = [
  "#8098FF", "#52DDB1", "#FFA352", "#A688FF", "#FF7FAE",
  "#4FD3EA", "#FFC559", "#78838F", "#63D678", "#FF6B6B",
];

function colorIndex(placa: string) {
  if (!placa) return 0;
  let h = 0;
  for (let i = 0; i < placa.length; i++) h = (h + placa.charCodeAt(i) * (i + 1)) >>> 0;
  return h % CAR_PALETTE.length;
}

/** @deprecated usar colorIndex + gradiente `url(#carG{n})`; se conserva para lo que solo necesite un color plano. */
export function getCarColor(placa: string) {
  return CAR_PALETTE[colorIndex(placa)];
}

/* Placa siempre visible debajo del vehículo (no solo al pasar el mouse): en una
   tablet en la caseta de vigilancia no hay hover, así que el guardia necesita
   poder identificar el carro con solo mirar el plano. */
function PlacaTag({ x, y, w, h, placa }: { x: number; y: number; w: number; h: number; placa: string }) {
  const pw = w * .86, ph = h * .3, px = x + (w - pw) / 2, py = y + h - ph - h * .04;
  return (
    <g pointerEvents="none">
      <rect x={px} y={py} width={pw} height={ph} rx={2.5} fill="#fff" opacity=".95" stroke="rgba(0,0,0,.3)" strokeWidth=".5" />
      <text x={x + w / 2} y={py + ph * .74} textAnchor="middle" fontSize={ph * .62} fontWeight="800" fill="#0F172A" fontFamily="monospace" letterSpacing=".3">
        {placa || "SIN PLACA"}
      </text>
    </g>
  );
}

/* Silueta de carro vista de planta (de arriba), con proporciones de sedán real
   (más largo que ancho), ruedas visibles en las 4 esquinas, parabrisas
   delantero/trasero que dejan ver el techo entre ambos, y luces para que se
   note el frente. Pensada para leerse como "un carro" incluso a tamaño de celda. */
export const HighFiCarSVG=memo(({x,y,w,h,placa}:{x:number;y:number;w:number;h:number;placa:string})=>{
  const idx=colorIndex(placa);
  const fill=`url(#carG${idx})`;
  const bw=14,bh=26,bx=x+(w-bw)/2,by=y+h*.045;
  const wheelW=3.6,wheelH=6.4;
  return(
    <g pointerEvents="none">
      {/* sombra */}
      <ellipse cx={bx+bw/2+.6} cy={by+bh+.5} rx={bw*.62} ry={2.1} fill="#000" opacity=".28"/>
      {/* ruedas, sobresaliendo del cuerpo a la altura de cada eje */}
      <rect x={bx-wheelW*.55} y={by+bh*.1} width={wheelW} height={wheelH} rx={wheelW*.35} fill="#111318" stroke="rgba(255,255,255,.12)" strokeWidth=".3"/>
      <rect x={bx+bw-wheelW*.45} y={by+bh*.1} width={wheelW} height={wheelH} rx={wheelW*.35} fill="#111318" stroke="rgba(255,255,255,.12)" strokeWidth=".3"/>
      <rect x={bx-wheelW*.55} y={by+bh*.62} width={wheelW} height={wheelH} rx={wheelW*.35} fill="#111318" stroke="rgba(255,255,255,.12)" strokeWidth=".3"/>
      <rect x={bx+bw-wheelW*.45} y={by+bh*.62} width={wheelW} height={wheelH} rx={wheelW*.35} fill="#111318" stroke="rgba(255,255,255,.12)" strokeWidth=".3"/>
      {/* carrocería */}
      <rect x={bx} y={by} width={bw} height={bh} rx={bw*.42} fill={fill} stroke="rgba(0,0,0,.4)" strokeWidth=".5"/>
      {/* parabrisas delantero */}
      <rect x={bx+bw*.14} y={by+bh*.08} width={bw*.72} height={bh*.22} rx={bw*.18} fill="#0B1220" opacity=".82"/>
      {/* techo (banda intermedia, un poco más clara que la carrocería) */}
      <rect x={bx+bw*.16} y={by+bh*.33} width={bw*.68} height={bh*.24} rx={bw*.14} fill="#fff" opacity=".1"/>
      {/* parabrisas trasero */}
      <rect x={bx+bw*.14} y={by+bh*.7} width={bw*.72} height={bh*.22} rx={bw*.18} fill="#0B1220" opacity=".82"/>
      {/* faros delanteros */}
      <rect x={bx+bw*.06} y={by-.4} width={bw*.24} height={1.6} rx=".7" fill="#FEF3C7"/>
      <rect x={bx+bw*.7} y={by-.4} width={bw*.24} height={1.6} rx=".7" fill="#FEF3C7"/>
      {/* stops traseros */}
      <rect x={bx+bw*.08} y={by+bh-1.1} width={bw*.2} height={1.5} rx=".6" fill="#EF4444"/>
      <rect x={bx+bw*.72} y={by+bh-1.1} width={bw*.2} height={1.5} rx=".6" fill="#EF4444"/>
      {/* brillo superior */}
      <rect x={bx+bw*.22} y={by+bh*.03} width={bw*.2} height={bh*.5} rx={bw*.1} fill="#fff" opacity=".14"/>
      <PlacaTag x={x} y={y} w={w} h={h} placa={placa} />
    </g>
  );
});
HighFiCarSVG.displayName="HighFiCarSVG";

/* Silueta de moto/scooter vista de planta: dos ruedas alineadas, tanque,
   manubrio y faros, coherente con la orientación vertical de la celda. */
export const HighFiMotoSVG=memo(({x,y,w,h,placa}:{x:number;y:number;w:number;h:number;placa:string})=>{
  const idx=colorIndex(placa);
  const fill=`url(#carG${idx})`;
  const bw=9,bh=27,bx=x+(w-bw)/2,by=y+h*.04;
  const wheelR=3.6;
  return(
    <g pointerEvents="none">
      {/* sombra */}
      <ellipse cx={bx+bw/2} cy={by+bh-1} rx={bw*.95} ry={1.7} fill="#000" opacity=".26"/>
      {/* rueda trasera */}
      <circle cx={bx+bw/2} cy={by+bh-wheelR+.6} r={wheelR} fill="#111318" stroke="rgba(255,255,255,.14)" strokeWidth=".35"/>
      <circle cx={bx+bw/2} cy={by+bh-wheelR+.6} r={wheelR*.4} fill="#3a3f47"/>
      {/* rueda delantera */}
      <circle cx={bx+bw/2} cy={by+wheelR-.6} r={wheelR*.94} fill="#111318" stroke="rgba(255,255,255,.14)" strokeWidth=".35"/>
      <circle cx={bx+bw/2} cy={by+wheelR-.6} r={wheelR*.36} fill="#3a3f47"/>
      {/* chasis/tanque */}
      <rect x={bx+bw*.22} y={by+bh*.27} width={bw*.56} height={bh*.5} rx={bw*.26} fill={fill} stroke="rgba(0,0,0,.4)" strokeWidth=".45"/>
      {/* asiento */}
      <rect x={bx+bw*.16} y={by+bh*.56} width={bw*.68} height={bh*.16} rx={bw*.18} fill="#111318" opacity=".85"/>
      {/* manubrio */}
      <rect x={bx-bw*.16} y={by+bh*.16} width={bw*1.32} height={bh*.05} rx={bh*.025} fill="#2b2f36"/>
      {/* faro delantero + stop trasero */}
      <rect x={bx+bw*.32} y={by-.5} width={bw*.36} height={1.3} rx=".5" fill="#FEF3C7"/>
      <rect x={bx+bw*.34} y={by+bh-1} width={bw*.32} height={1.1} rx=".45" fill="#EF4444"/>
      <PlacaTag x={x} y={y} w={w} h={h} placa={placa} />
    </g>
  );
});
HighFiMotoSVG.displayName="HighFiMotoSVG";
