import React, { memo } from "react";
import { X, AlertCircle } from "lucide-react";
import type { Celda } from "../../context/DataContext";
import { theme } from "../../theme";
import { CELDA_CONFIG, getTipoCeldaConfig } from "./helpers";

const C = theme;

export const ModalHeader=memo(({icon,eyebrow,title,onClose}:{icon?:React.ReactNode;eyebrow?:string;title:string;onClose:()=>void})=>(
  <div style={{padding:"1.4rem 1.8rem",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
    <div style={{display:"flex",alignItems:"center",gap:12}}>
      {icon&&<div style={{width:38,height:38,borderRadius:10,background:C.primaryPale,display:"flex",alignItems:"center",justifyContent:"center"}}>{icon}</div>}
      <div>
        {eyebrow&&<div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:C.primary,textTransform:"uppercase"}}>{eyebrow}</div>}
        <h2 style={{fontSize:20,fontWeight:900,color:C.text,lineHeight:1,margin:0}}>{title}</h2>
      </div>
    </div>
    <button onClick={onClose} aria-label="Cerrar"
      style={{width:34,height:34,borderRadius:9,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",color:C.textLight,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <X size={16}/>
    </button>
  </div>
));
ModalHeader.displayName="ModalHeader";

export const Banner=memo(({tone,message}:{tone:"danger"|"info"|"success";message:string})=>{
  const s=tone==="danger"?{bg:C.dangerBg,border:C.dangerBorder,text:C.danger}
         :tone==="info"?{bg:C.infoBg,border:"#BFDBFE",text:C.info}
         :{bg:C.primaryPale,border:C.primaryLight,text:C.primaryDark};
  return(
    <div style={{display:"flex",alignItems:"flex-start",gap:8,padding:"10px 12px",borderRadius:11,border:`1px solid ${s.border}`,background:s.bg,color:s.text}}>
      <AlertCircle size={13} style={{marginTop:2,flexShrink:0}}/>
      <span style={{fontSize:12,fontWeight:600,lineHeight:1.45}}>{message}</span>
    </div>
  );
});
Banner.displayName="Banner";

export const EstadoBadge=memo(({estado}:{estado:Celda["estado"]})=>{
  const cfg=CELDA_CONFIG[estado];
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:999,fontSize:10,fontWeight:700,background:cfg.bg,color:cfg.text,border:`1px solid ${cfg.border}`}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:cfg.dotColor}}/>
      {cfg.label}
    </span>
  );
});
EstadoBadge.displayName="EstadoBadge";

/* Insignia reutilizable que muestra el TIPO de celda (carro / moto / movilidad reducida)
   con su propio icono y color, para usarse tanto en la tabla como en las tarjetas expandidas. */
export const TipoBadge=memo(({tipo,size="sm"}:{tipo:string;size?:"sm"|"md"})=>{
  const cfg=getTipoCeldaConfig(tipo);
  const Icon=cfg.icon;
  const iconSize=size==="sm"?10:12;
  const pad=size==="sm"?"2px 7px":"3px 9px";
  const font=size==="sm"?9.5:11;
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:pad,borderRadius:999,fontSize:font,fontWeight:800,background:cfg.accentSoft,color:cfg.accentDark,border:`1px solid ${cfg.accent}55`}}>
      <Icon size={iconSize} strokeWidth={2.5}/>
      {cfg.shortLabel}
    </span>
  );
});
TipoBadge.displayName="TipoBadge";
