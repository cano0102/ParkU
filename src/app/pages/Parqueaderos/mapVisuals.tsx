import { memo } from "react";

export const MAP_THEME={
  asphalt:"#22262b",asphaltPanel:"#2a2f35",road:"#34393f",
  panelBorder:"rgba(255,255,255,.08)",textBright:"#f4f4f4",textDim:"rgba(244,244,244,.62)",
};

export function getCarColor(placa: string) {
  const palette = [
    "#0EA5A4","#06B6D4","#7C3AED","#6366F1","#EF4444",
    "#FB923C","#F59E0B","#10B981","#3B82F6","#EC4899","#64748B",
  ];
  if (!placa) return palette[0];
  let h = 0;
  for (let i = 0; i < placa.length; i++) h = (h + placa.charCodeAt(i) * (i + 1)) >>> 0;
  return palette[h % palette.length];
}

export const HighFiCarSVG=memo(({x,y,w,h,placa}:{x:number;y:number;w:number;h:number;placa:string})=>{
  const color=getCarColor(placa);
  const bw=w*.54,bh=h*.8,bx=x+(w-bw)/2,by=y+(h-bh)/2;
  return(
    <g pointerEvents="none">
      <rect x={bx+1} y={by+1.5} width={bw} height={bh} rx={bw*.28} fill="#000" opacity=".25"/>
      <rect x={bx} y={by} width={bw} height={bh} rx={bw*.28} fill={color} stroke="#0F172A" strokeWidth=".8"/>
      <rect x={bx+bw*.08} y={by+bh*.18} width={bw*.84} height={bh*.58} rx={bw*.2} fill="#1E293B" opacity=".85"/>
      <path d={`M ${bx+bw*.14} ${by+bh*.26} L ${bx+bw*.86} ${by+bh*.26} Q ${bx+bw*.5} ${by+bh*.16} ${bx+bw*.14} ${by+bh*.26}`} fill="#94A3B8" opacity=".9"/>
      <path d={`M ${bx+bw*.16} ${by+bh*.68} L ${bx+bw*.84} ${by+bh*.68} Q ${bx+bw*.5} ${by+bh*.76} ${bx+bw*.16} ${by+bh*.68}`} fill="#94A3B8" opacity=".9"/>
      <rect x={bx+2.5} y={by-.2} width={2.5} height={1.2} rx=".5" fill="#FDE047"/>
      <rect x={bx+bw-5} y={by-.2} width={2.5} height={1.2} rx=".5" fill="#FDE047"/>
      <rect x={bx+2.2} y={by+bh-1} width={3} height={1.2} rx=".4" fill="#EF4444"/>
      <rect x={bx+bw-5.2} y={by+bh-1} width={3} height={1.2} rx=".4" fill="#EF4444"/>
      <rect x={bx+bw*.25} y={by+bh-4.8} width={bw*.5} height={3.6} rx=".5" fill="#FDE047" stroke="#0F172A" strokeWidth=".4"/>
      <text x={bx+bw/2} y={by+bh-2.2} textAnchor="middle" fontSize="2.7" fontWeight="bold" fill="#000" fontFamily="monospace">{placa.slice(0,6)}</text>
    </g>
  );
});
HighFiCarSVG.displayName="HighFiCarSVG";

/* Silueta de moto/scooter en alta fidelidad para celdas ocupadas de tipo "moto".
   Se dibuja en vertical (de frente), coherente con la orientación de la celda. */
export const HighFiMotoSVG=memo(({x,y,w,h,placa}:{x:number;y:number;w:number;h:number;placa:string})=>{
  const color=getCarColor(placa);
  const bw=w*.34,bh=h*.82,bx=x+(w-bw)/2,by=y+(h-bh)/2;
  return(
    <g pointerEvents="none">
      {/* sombra */}
      <ellipse cx={bx+bw/2} cy={by+bh-1} rx={bw*.7} ry={1.6} fill="#000" opacity=".28"/>
      {/* rueda trasera y delantera */}
      <circle cx={bx+bw/2} cy={by+bh-3} r={bw*.42} fill="#111" stroke="#374151" strokeWidth=".5"/>
      <circle cx={bx+bw/2} cy={by+3.2} r={bw*.4} fill="#111" stroke="#374151" strokeWidth=".5"/>
      {/* cuerpo / tanque */}
      <rect x={bx+bw*.18} y={by+bh*.28} width={bw*.64} height={bh*.44} rx={bw*.28} fill={color} stroke="#0F172A" strokeWidth=".6"/>
      {/* asiento */}
      <rect x={bx+bw*.12} y={by+bh*.55} width={bw*.76} height={bh*.16} rx={bw*.2} fill="#1E293B" opacity=".9"/>
      {/* manubrio */}
      <rect x={bx-bw*.12} y={by+bh*.1} width={bw*1.24} height={bh*.08} rx={bh*.04} fill="#334155"/>
      {/* espejo/faros */}
      <rect x={bx+bw*.3} y={by-.3} width={bw*.4} height={1.1} rx=".5" fill="#FDE047"/>
      <rect x={bx+bw*.32} y={by+bh-1.4} width={bw*.36} height={1} rx=".4" fill="#EF4444"/>
      <text x={bx+bw/2} y={by+bh/2+1.6} textAnchor="middle" fontSize="2.3" fontWeight="bold" fill="#000" fontFamily="monospace">{placa.slice(0,5)}</text>
    </g>
  );
});
HighFiMotoSVG.displayName="HighFiMotoSVG";
