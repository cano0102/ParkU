import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import {
  Car,
  Plus,
  Pencil,
  Trash2,
  X,
  Camera,
  Shield,
  LayoutGrid,
  Map as MapIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Zap,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ScanLine,
  Search,
  Upload,
  Info,
  Eye,
  Sparkles,
  MapPin,
  Wrench,
  AlertTriangle,
  FileText,
  Calendar,
  UserCircle2,
  Image as ImageIcon,
  Bike,
  Accessibility,
} from "lucide-react";
import { createWorker } from "tesseract.js";
import { toast } from "sonner";
import { useData, Celda, Parqueadero, Vehiculo, Conductor } from "../../../context/DataContext";

/* ============================================================
   PALETA
============================================================ */
const C = {
  primary:     "#39A900",
  primaryDark: "#2D7D00",
  primaryLight:"#B3E6A1",
  primaryPale: "#EAF7E6",
  text:        "#0F172A",
  textLight:   "#64748B",
  border:      "#E2E8F0",
  bg:          "#F5F7F8",
  danger:      "#EF4444",
  dangerBg:    "#FEE2E2",
  dangerBorder:"#FECACA",
  success:     "#16A34A",
  successBg:   "#DCFCE7",
  info:        "#3B82F6",
  infoBg:      "#EFF6FF",
  amber:       "#F59E0B",
  amberBg:     "#FEF3C7",
  slate:       "#94A3B8",
  slateBg:     "#F1F5F9",
};

/* ============================================================
   TIPOS LOCALES DE UI
============================================================ */
export interface FormParqueadero {
  nombre: string;
  bloque: string;
  tipo: string;
  direccion: string;
  horaInicio: string;
  horaFin: string;
  celdasCarros: number;
  celdasMotos: number;
  celdasMovilidadReducida: number;
  descripcion: string;
}

export interface VehiculoForm {
  placa: string;
  conductor: string;
  esOficial: boolean;
}

export interface IncidenteForm {
  descripcion: string;
  asignadoA: string;
  notasResolucion: string;
  evidencia: string; // base64 o URL de objeto
}

export interface CeldaPos extends Celda { x: number; y: number; }
export interface FilaLayout { celdas: CeldaPos[]; esCarril: boolean; y: number; }
export interface LotLayout {
  pq: Parqueadero; filas: FilaLayout[]; lotTop: number; lotHeight: number;
  ancho: number; celdasPorFila: number; libres: number; ocupados: number;
  reservadas: number; mantenimiento: number; pct: number;
}

/* ============================================================
   CONSTANTES
============================================================ */
export const CELDA_CONFIG = {
  disponible:    { bg:"#F0FBE8", border:"#A8D888", text:"#2F6B00", label:"Disponible",    dotColor:"#4CAF50", mapFill:"#1f2a22", mapStroke:"#4CAF50" },
  no_disponible: { bg:"#1A1A1A", border:"#EF4444", text:"#ffffff", label:"Ocupado",       dotColor:"#EF4444", mapFill:"#2c1414", mapStroke:"#EF4444" },
  reservada:     { bg:"#FFFBEB", border:"#FCD34D", text:"#78350F", label:"Reservada",     dotColor:"#F59E0B", mapFill:"#332a10", mapStroke:"#F59E0B" },
  mantenimiento: { bg:"#F1F5F9", border:"#94A3B8", text:"#334155", label:"Mantenimiento", dotColor:"#94A3B8", mapFill:"#23262b", mapStroke:"#94A3B8" },
} as const;

/* Configuración visual por TIPO DE VEHÍCULO de la celda (carro / moto / movilidad reducida).
   Esto es independiente del estado (disponible/ocupada/etc.) y se usa para que, tanto en el
   plano como en la lista, sea inmediato distinguir qué celdas son de carro y cuáles de moto. */
export const TIPO_CELDA_CONFIG = {
  carro: {
    label: "Carro",
    shortLabel: "Carro",
    icon: Car,
    accent: "#3B82F6",      // azul
    accentSoft: "#DBEAFE",
    accentDark: "#1D4ED8",
  },
  moto: {
    label: "Moto",
    shortLabel: "Moto",
    icon: Bike,
    accent: "#F97316",      // naranja
    accentSoft: "#FFEDD5",
    accentDark: "#C2410C",
  },
  "movilidad reducida": {
    label: "Movilidad Reducida",
    shortLabel: "M. Reducida",
    icon: Accessibility,
    accent: "#8B5CF6",      // violeta
    accentSoft: "#EDE9FE",
    accentDark: "#6D28D9",
  },
} as const;

export const getTipoCeldaConfig = (tipo: string) =>
  (TIPO_CELDA_CONFIG as Record<string, typeof TIPO_CELDA_CONFIG["carro"]>)[tipo] || TIPO_CELDA_CONFIG.carro;

export const TIPOS_PARQUEADERO = ["general","motos","visitantes","docentes","administrativos"] as const;
export const capitalizar = (s:string) => s.charAt(0).toUpperCase() + s.slice(1);

export const CONDUCTORES_SUGERIDOS = [
  "Andrés Felipe Montoya","Claudia Patricia Restrepo","Juan Carlos Gómez",
  "María Camila Torres","Diego Alejandro Castro","Sofía Elena Herrera",
  "Luis Fernando Díaz","Paula Andrea Luna",
];

export const PLACAS_DEMO = [
  { placa:"KLO234", conductor:"Carlos Mario Ruiz",      tipo:"carro", rol:"Docente" },
  { placa:"MHX75E", conductor:"Liliana Patricia Castro", tipo:"moto",  rol:"Estudiante" },
  { placa:"SNA012", conductor:"Oficial CEET SENA",       tipo:"carro", rol:"Oficial" },
  { placa:"VIP789", conductor:"Héctor Fabio Jurado",     tipo:"carro", rol:"Visitante" },
];

/* SVG medidas */
const SPACE_W=46,SPACE_H=28,GAP_X=4,ROW_GAP=6,LANE_H=40,PADDING=50,
      SECTION_GAP=45,ROAD_Y=16,ROAD_H=38,HEADER_BLOCK=58;

/* ============================================================
   UTILS
============================================================ */
export const PLACA_REGEX = /^[A-Z]{3}\d{2,3}[A-Z0-9]?$/;
export const validarPlacaColombiana = (p:string) => PLACA_REGEX.test(p.trim().toUpperCase());
export const esPlacaOficial = (placa:string) => /^(SNA|OFI)/.test(placa.trim().toUpperCase());

const corregirCaracter=(c:string,esperaLetra:boolean)=>{
  const l2d:Record<string,string>={O:"0",I:"1",S:"5",B:"8",Z:"2",G:"6"};
  const d2l:Record<string,string>={"0":"O","1":"I","5":"S","8":"B","2":"Z","6":"G"};
  if(esperaLetra&&/[0-9]/.test(c)) return d2l[c]||c;
  if(!esperaLetra&&/[A-Z]/.test(c)) return l2d[c]||c;
  return c;
};
const intentarCorregirPlaca=(s:string)=>{
  if(s.length<5) return s;
  const ch=s.split("");
  for(let i=0;i<Math.min(ch.length,5);i++) ch[i]=corregirCaracter(ch[i],i<3);
  return ch.join("");
};
const intentarTokenComoPlaca=(tok:string)=>{
  const l=tok.toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(l.length!==5&&l.length!==6) return null;
  if(PLACA_REGEX.test(l)) return l;
  const c=intentarCorregirPlaca(l);
  return PLACA_REGEX.test(c)?c:null;
};
export const limpiarTextoOCR=(raw:string)=>{
  const tokens=raw.toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
  for(const t of tokens){ const c=intentarTokenComoPlaca(t); if(c) return c; }
  for(let i=0;i<tokens.length-1;i++){ const c=intentarTokenComoPlaca(tokens[i]+tokens[i+1]); if(c) return c; }
  return "";
};
export const normalizarTexto=(t:string,max=60)=>t.trim().replace(/\s+/g," ").slice(0,max);
export const formatearFechaHora=(iso:string)=>{
  const d=new Date(iso);
  return { fecha:d.toLocaleDateString("es-CO"), hora:d.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}) };
};
export const formatearDuracion=(iso:string)=>{
  const m=Math.max(0,Math.floor((Date.now()-new Date(iso).getTime())/60000));
  const h=Math.floor(m/60); const min=m%60;
  return h>0?`${h}h ${min}m`:`${min}m`;
};
export function extraerDatosDocumento(texto:string){
  const limpio=texto.replace(/\r/g,"").replace(/\t/g," ");
  const lineas=limpio.split("\n").map(l=>l.trim()).filter(Boolean);
  const mayus=limpio.toUpperCase();
  let placa="";
  const idx=lineas.findIndex(l=>/PLACA/i.test(l));
  if(idx!==-1){ const ctx=`${lineas[idx]} ${lineas[idx+1]||""}`; placa=limpiarTextoOCR(ctx.replace(/PLACA/gi," ")); }
  if(!placa||!validarPlacaColombiana(placa)) placa=limpiarTextoOCR(mayus);
  let conductor="";
  const idxP=lineas.findIndex(l=>/PROPIETARIO|NOMBRE\s*Y\s*APELLIDOS|NOMBRE\s*DEL\s*PROPIETARIO/i.test(l));
  if(idxP!==-1){ const ml=lineas[idxP].split(/[:#-]/).slice(1).join(" ").trim(); const cand=ml&&/[A-ZÁÉÍÓÚÑ]{3,}/.test(ml)?ml:lineas[idxP+1]||""; conductor=cand.replace(/[^A-ZÁÉÍÓÚÑ\s]/gi," ").replace(/\s+/g," ").trim(); }
  return { placa, conductor:normalizarTexto(conductor,60), textoCompleto:limpio };
}

/* ============================================================
   DERIVAR OCUPANTE DE UNA CELDA
============================================================ */
interface Ocupante { 
  vehiculo: Vehiculo; 
  conductor?: Conductor; 
  esOficial: boolean; 
  controlId: string; 
  fechaEntrada: string; 
}

/* ============================================================
   REDUCER OCR
============================================================ */
function calcularUmbralOtsu(hist:number[],total:number):number{
  let sum=0; for(let i=0;i<256;i++) sum+=i*hist[i];
  let sumB=0,pesoB=0,maxV=0,umbral=127;
  for(let t=0;t<256;t++){
    pesoB+=hist[t]; if(!pesoB) continue;
    const pesoF=total-pesoB; if(!pesoF) break;
    sumB+=t*hist[t];
    const mB=sumB/pesoB,mF=(sum-sumB)/pesoF;
    const v=pesoB*pesoF*(mB-mF)*(mB-mF);
    if(v>maxV){maxV=v;umbral=t;}
  }
  return umbral;
}
function preprocesarDocumento(video:HTMLVideoElement):string{
  if(!video.videoWidth||!video.videoHeight) throw new Error("Cámara no lista.");
  const src=document.createElement("canvas"); src.width=video.videoWidth; src.height=video.videoHeight;
  const ctx=src.getContext("2d"); if(!ctx) throw new Error("Canvas falló.");
  ctx.drawImage(video,0,0);
  const escala=2.4; const dest=document.createElement("canvas");
  dest.width=Math.round(src.width*escala); dest.height=Math.round(src.height*escala);
  const dctx=dest.getContext("2d"); if(!dctx) throw new Error("Canvas OCR falló.");
  dctx.imageSmoothingEnabled=true; dctx.imageSmoothingQuality="high";
  dctx.drawImage(src,0,0,src.width,src.height,0,0,dest.width,dest.height);
  const img=dctx.getImageData(0,0,dest.width,dest.height); const d=img.data;
  const gr=new Uint8ClampedArray(d.length/4); const hist=new Array(256).fill(0);
  for(let i=0,p=0;i<d.length;i+=4,p++){ const g=Math.round(d[i]*.299+d[i+1]*.587+d[i+2]*.114); gr[p]=g; hist[g]++; }
  const u=calcularUmbralOtsu(hist,gr.length);
  for(let p=0,i=0;p<gr.length;p++,i+=4){ const v=gr[p]>u?255:0; d[i]=v;d[i+1]=v;d[i+2]=v; }
  dctx.putImageData(img,0,0); return dest.toDataURL("image/png");
}
function preprocesarImagenArchivo(dataUrl:string):Promise<string>{
  return new Promise((res,rej)=>{
    const img=new Image();
    img.onload=()=>{
      try{
        const escala=img.width<900?2.4:1.4;
        const dest=document.createElement("canvas");
        dest.width=Math.round(img.width*escala); dest.height=Math.round(img.height*escala);
        const dctx=dest.getContext("2d"); if(!dctx) return rej(new Error("Canvas OCR falló."));
        dctx.imageSmoothingEnabled=true; dctx.imageSmoothingQuality="high";
        dctx.drawImage(img,0,0,dest.width,dest.height);
        const imgD=dctx.getImageData(0,0,dest.width,dest.height); const d=imgD.data;
        const gr=new Uint8ClampedArray(d.length/4); const hist=new Array(256).fill(0);
        for(let i=0,p=0;i<d.length;i+=4,p++){ const g=Math.round(d[i]*.299+d[i+1]*.587+d[i+2]*.114); gr[p]=g; hist[g]++; }
        const u=calcularUmbralOtsu(hist,gr.length);
        for(let p=0,i=0;p<gr.length;p++,i+=4){ const v=gr[p]>u?255:0; d[i]=v;d[i+1]=v;d[i+2]=v; }
        dctx.putImageData(imgD,0,0); res(dest.toDataURL("image/png"));
      }catch(e){ rej(e); }
    };
    img.onerror=()=>rej(new Error("No se pudo cargar la imagen.")); img.src=dataUrl;
  });
}
function useOcrPlaca(){
  const workerRef=useRef<any>(null); const initRef=useRef<Promise<any>|null>(null);
  const getWorker=useCallback(async()=>{
    if(workerRef.current) return workerRef.current;
    if(!initRef.current){ initRef.current=createWorker("spa").then(async(w:any)=>{ try{ await w.setParameters({tessedit_char_whitelist:"ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑ0123456789 .:-/"}); }catch{} workerRef.current=w; return w; }); }
    return initRef.current;
  },[]);
  const procesarImagen=useCallback(async(url:string)=>{ const w=await getWorker(); const {data}=await w.recognize(url); const r=extraerDatosDocumento(data.text||""); if(!r.placa||!validarPlacaColombiana(r.placa)) throw new Error("No se detectó una placa válida."); return r; },[getWorker]);
  const reconocer=useCallback(async(video:HTMLVideoElement)=>procesarImagen(preprocesarDocumento(video)),[procesarImagen]);
  const reconocerLicencia=useCallback(async(url:string)=>procesarImagen(url),[procesarImagen]);
  const liberarWorker=useCallback(async()=>{ try{ if(workerRef.current) await workerRef.current.terminate(); }catch{}finally{ workerRef.current=null; initRef.current=null; } },[]);
  return {reconocer,reconocerLicencia,liberarWorker};
}

/* ============================================================
   COMPONENTES UI BASE
============================================================ */
const Modal = memo(({open,onClose,children,maxWidth=680}:{open:boolean;onClose:()=>void;children:React.ReactNode;maxWidth?:number})=>{
  useEffect(()=>{
    if(!open) return;
    const h=(e:KeyboardEvent)=>{ if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[open,onClose]);

  if(!open) return null;

  return(
    <div
      style={{
        position:"fixed",top:0,left:0,right:0,bottom:0,
        zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",
        padding:"1rem",background:"rgba(15,23,42,.45)",backdropFilter:"blur(4px)",
        pointerEvents:"auto",
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width:"100%",maxWidth,maxHeight:"92vh",overflowY:"auto",
          borderRadius:24,background:"#fff",border:`1px solid ${C.border}`,
          boxShadow:"0 20px 55px rgba(15,23,42,.12)",
          animation:"modalIn .18s ease",position:"relative",pointerEvents:"auto",
        }}
        onClick={e=>e.stopPropagation()}
      >
        {children}
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
});
Modal.displayName="Modal";

const ModalHeader=memo(({icon,eyebrow,title,onClose}:{icon?:React.ReactNode;eyebrow?:string;title:string;onClose:()=>void})=>(
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

const ConfirmDialog=memo(({open,onConfirm,onCancel,title,message,confirmLabel="Confirmar",tone="danger"}:{open:boolean;onConfirm:()=>void;onCancel:()=>void;title:string;message:string;confirmLabel?:string;tone?:"danger"|"success"|"info"})=>{
  if(!open) return null;
  const btnBg=tone==="danger"?C.danger:C.primary;
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",background:"rgba(15,23,42,.45)",backdropFilter:"blur(4px)"}} onClick={onCancel}>
      <div style={{width:"100%",maxWidth:400,borderRadius:20,background:"#fff",border:`1px solid ${C.border}`,boxShadow:"0 20px 55px rgba(15,23,42,.12)",padding:"1.8rem"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:44,height:44,borderRadius:12,background:tone==="danger"?C.dangerBg:C.primaryPale,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
          <Trash2 size={20} color={btnBg}/>
        </div>
        <h3 style={{fontSize:16,fontWeight:800,color:C.text,margin:0}}>{title}</h3>
        <p style={{fontSize:12,color:C.textLight,marginTop:8,lineHeight:1.5,marginBottom:20}}>{message}</p>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
          <button onClick={onCancel} style={{padding:"9px 16px",borderRadius:10,border:`1px solid ${C.border}`,background:"#fff",fontSize:13,fontWeight:700,color:C.text,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
          <button onClick={onConfirm} style={{padding:"9px 16px",borderRadius:10,border:"none",background:btnBg,fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:"inherit"}}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
});
ConfirmDialog.displayName="ConfirmDialog";

const Banner=memo(({tone,message}:{tone:"danger"|"info"|"success";message:string})=>{
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

const EstadoBadge=memo(({estado}:{estado:Celda["estado"]})=>{
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
const TipoBadge=memo(({tipo,size="sm"}:{tipo:string;size?:"sm"|"md"})=>{
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

/* ============================================================
   SVG — MAPA
============================================================ */
const MAP_THEME={
  asphalt:"#22262b",asphaltPanel:"#2a2f35",road:"#34393f",
  panelBorder:"rgba(255,255,255,.08)",textBright:"#f4f4f4",textDim:"rgba(244,244,244,.62)",
};

function getCarColor(placa: string) {
  const palette = [
    "#0EA5A4","#06B6D4","#7C3AED","#6366F1","#EF4444",
    "#FB923C","#F59E0B","#10B981","#3B82F6","#EC4899","#64748B",
  ];
  if (!placa) return palette[0];
  let h = 0;
  for (let i = 0; i < placa.length; i++) h = (h + placa.charCodeAt(i) * (i + 1)) >>> 0;
  return palette[h % palette.length];
}

const HighFiCarSVG=memo(({x,y,w,h,placa}:{x:number;y:number;w:number;h:number;placa:string})=>{
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
      <rect x={bx+bw*.25} y={by+bh-4.5} width={bw*.5} height={3.2} rx=".5" fill="#FDE047" stroke="#0F172A" strokeWidth=".4"/>
      <text x={bx+bw/2} y={by+bh-2} textAnchor="middle" fontSize="2.4" fontWeight="bold" fill="#000" fontFamily="monospace">{placa.slice(0,6)}</text>
    </g>
  );
});
HighFiCarSVG.displayName="HighFiCarSVG";

/* Silueta de moto/scooter en alta fidelidad para celdas ocupadas de tipo "moto".
   Se dibuja en vertical (de frente), coherente con la orientación de la celda. */
const HighFiMotoSVG=memo(({x,y,w,h,placa}:{x:number;y:number;w:number;h:number;placa:string})=>{
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
      <text x={bx+bw/2} y={by+bh/2+1.6} textAnchor="middle" fontSize="2" fontWeight="bold" fill="#000" fontFamily="monospace">{placa.slice(0,5)}</text>
    </g>
  );
});
HighFiMotoSVG.displayName="HighFiMotoSVG";

/* ============================================================
   PARKING MAP
============================================================ */
const ParkingMap = memo(({ parqueaderos, celdas, getOcupante, onCellClick, cellMatchesSearch }: {
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
        display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "calc(100% - 120px)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(20,22,25,.8)", border: "1px solid rgba(255,255,255,.14)",
          borderRadius: 11, padding: "6px 10px", backdropFilter: "blur(3px)",
        }}>
          {Object.entries(TIPO_CELDA_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: cfg.accent, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} />
                <Icon size={11} color={cfg.accent} strokeWidth={2.5} />
                <span style={{ fontSize: 9.5, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>{cfg.shortLabel}</span>
              </div>
            );
          })}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "rgba(20,22,25,.8)", border: "1px solid rgba(255,255,255,.14)",
          borderRadius: 11, padding: "6px 10px", backdropFilter: "blur(3px)",
        }}>
          {Object.entries(CELDA_CONFIG).map(([key, cfg]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dotColor, flexShrink: 0 }} />
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "rgba(255,255,255,.85)", whiteSpace: "nowrap" }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { icon: <ZoomIn size={16} />,   act: () => setZoom(z => Math.min(2.5, z + .15)) },
          { icon: <ZoomOut size={16} />,  act: () => setZoom(z => Math.max(.4,  z - .15)) },
          { icon: <Maximize2 size={15}/>, act: () => { setZoom(1); setPan({ x: 0, y: 0 }); } },
        ].map((b, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); b.act(); }}
            style={{ width:36, height:36, borderRadius:10, border:"1px solid rgba(255,255,255,.18)", background:"rgba(20,22,25,.75)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
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
            <pattern id="resH" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill={CELDA_CONFIG.reservada.mapFill} />
              <line x1="0" y1="0" x2="0" y2="8" stroke={CELDA_CONFIG.reservada.mapStroke} strokeWidth="2.5" opacity=".6" />
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

          {lots.map(({ pq, celdasPorFila, libres, ocupados, reservadas, mantenimiento, pct, filas, lotTop, lotHeight, ancho }) => {
            const hc = pct >= 90 ? C.danger : pct >= 50 ? C.amber : C.primary;
            return (
              <g key={pq.id}>
                <rect x={PADDING - 20} y={lotTop - 12} width={ancho - PADDING + 40} height={lotHeight + 12} rx="14" fill={MAP_THEME.asphaltPanel} stroke={MAP_THEME.panelBorder} strokeWidth="1.5" />
                <rect x={PADDING - 10} y={lotTop - 6} width={ancho - PADDING + 10} height={34} rx="8" fill={hc} />
                <text x={PADDING + 2} y={lotTop + 10} fill="#fff" fontSize="10.5" fontWeight="900">{pq.nombre.toUpperCase()}</text>
                <text x={PADDING + 2} y={lotTop + 22} fill="rgba(255,255,255,.8)" fontSize="7.5" fontWeight="bold">BLOQUE {pq.bloque}</text>
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
                          {m && <rect x={celda.x - 3} y={celda.y - 3} width={SPACE_W + 6} height={SPACE_H + 6} rx="6" fill="none" stroke="#FBBF24" strokeWidth="4.5" filter="url(#glow)" />}
                          <rect
                            x={celda.x} y={celda.y} width={SPACE_W} height={SPACE_H} rx="3.5"
                            fill={celda.estado === "reservada" ? "url(#resH)" : cfg.mapFill}
                            stroke={m ? "#F59E0B" : cfg.mapStroke}
                            strokeWidth={m ? 2.2 : celda.estado === "disponible" ? 1.2 : 1.6}
                            strokeDasharray={celda.estado === "disponible" ? "3,2" : undefined}
                          />
                          {/* Franja lateral de color según TIPO de celda (carro/moto/m.reducida) — visible en cualquier estado */}
                          <rect x={celda.x} y={celda.y} width={3.4} height={SPACE_H} rx="1.6" fill={tipoCfg.accent} opacity={.95} />
                          {/* Insignia con icono del tipo, esquina superior derecha */}
                          <g transform={`translate(${celda.x + SPACE_W - 10.5},${celda.y + 1.5})`}>
                            <rect width="9.5" height="9.5" rx="2.5" fill={tipoCfg.accent} opacity=".92"/>
                            <TipoIcon x={1.4} y={1.4} width={6.7} height={6.7} color="#fff" strokeWidth={3}/>
                          </g>
                          <text x={celda.x + 6.5} y={celda.y + 8} fill={m ? "#FFF" : MAP_THEME.textDim} fontSize="6.8" fontWeight="900">{celda.numero}</text>
                          {celda.estado === "disponible" && !estaOcupada && (
                            <TipoIcon
                              x={celda.x + SPACE_W / 2 - 6.5}
                              y={celda.y + SPACE_H / 2 - 5}
                              width={13}
                              height={13}
                              color={tipoCfg.accent}
                              opacity={.32}
                              strokeWidth={2}
                            />
                          )}
                          {estaOcupada && ocupante && (
                            esMoto
                              ? <HighFiMotoSVG x={celda.x} y={celda.y} w={SPACE_W} h={SPACE_H} placa={ocupante.vehiculo.placa || "···"} />
                              : <HighFiCarSVG  x={celda.x} y={celda.y} w={SPACE_W} h={SPACE_H} placa={ocupante.vehiculo.placa || "···"} />
                          )}
                          {celda.estado === "no_disponible" && !ocupante && (
                            <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 3} textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#EF4444">⚠️ ERROR</text>
                          )}
                          {celda.estado === "reservada"      && <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 3} textAnchor="middle" fontSize="7" fontWeight="950" fill="#FCD34D">RESERVA</text>}
                          {celda.estado === "mantenimiento"  && <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 3} textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#CBD5E1">MANT.</text>}
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
               hover.celda.estado === "no_disponible" ? "⚠️ Error: celda marcada ocupada sin vehículo" :
               "Celda libre"}
            </div>
          )}
        </div>
      );})()}
    </div>
  );
});

ParkingMap.displayName = "ParkingMap";

/* ============================================================
   VISTA TABLA
============================================================ */
const ParqueaderosTable = memo(({ parqueaderos, celdas, getOcupante, onEdit, onDelete, onCellClick, cellMatchesSearch }: {
  parqueaderos: Parqueadero[];
  celdas: Celda[];
  getOcupante: (celdaId: string) => Ocupante | null;
  onEdit: (p: Parqueadero) => void;
  onDelete: (id: string) => void;
  onCellClick: (c: Celda) => void;
  cellMatchesSearch: (c: Celda) => boolean;
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)" }}>
      <div className="pq-table-header">
        <div>Parqueadero</div><div>Tipo</div><div>Ocupación</div><div>Libres</div><div>Ocupadas</div><div>Reservadas</div><div style={{ textAlign: "right" }}>Acciones</div>
      </div>
      <div>
        {parqueaderos.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", color: C.textLight }}>
            <Car size={36} color={C.border} style={{ marginBottom: 12 }} />
            <p style={{ fontWeight: 600, fontSize: 13 }}>No se encontraron parqueaderos</p>
          </div>
        ) : parqueaderos.map(pq => {
          const celdasPq  = celdas.filter(c => c.parqueaderoId === pq.id);
          const libres    = celdasPq.filter(c => c.estado === "disponible").length;
          const ocupados  = celdasPq.filter(c => c.estado === "no_disponible").length;
          const reservas  = celdasPq.filter(c => c.estado === "reservada").length;
          const pct       = celdasPq.length ? Math.round(ocupados / celdasPq.length * 100) : 0;
          const pctColor  = pct >= 90 ? C.danger : pct >= 50 ? C.amber : C.primary;
          const isExpanded = expandedId === pq.id;

          // Desglose de celdas libres por tipo de vehículo, para distinguir carro vs moto de un vistazo
          const libresPorTipo = Object.keys(TIPO_CELDA_CONFIG).reduce<Record<string, number>>((acc, tipo) => {
            acc[tipo] = celdasPq.filter(c => c.tipo === tipo && c.estado === "disponible").length;
            return acc;
          }, {});

          return (
            <React.Fragment key={pq.id}>
              <div
                className="pq-table-row"
                style={{ background: isExpanded ? "#F8FAF8" : "#fff" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F8FAF8")}
                onMouseLeave={e => (e.currentTarget.style.background = isExpanded ? "#F8FAF8" : "#fff")}
                onClick={() => setExpandedId(isExpanded ? null : pq.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primaryPale, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MapPin size={16} color={C.primary} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: C.text }}>{pq.nombre}</div>
                    <div style={{ fontSize: 10, color: C.textLight, marginBottom: 3 }}>Bloque {pq.bloque} · {celdasPq.length} celdas</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {Object.entries(TIPO_CELDA_CONFIG).map(([tipo, cfg]) => {
                        const total = celdasPq.filter(c => c.tipo === tipo).length;
                        if (!total) return null;
                        const Icon = cfg.icon;
                        return (
                          <span key={tipo} title={`${cfg.label}: ${libresPorTipo[tipo]} libres de ${total}`}
                            style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 6px", borderRadius: 999, background: cfg.accentSoft, color: cfg.accentDark, fontSize: 9, fontWeight: 800 }}>
                            <Icon size={9} strokeWidth={2.5} />{libresPorTipo[tipo]}/{total}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div><span className="pq-cell-label">Tipo</span><span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 8, background: "#F1F5F9", fontSize: 11, fontWeight: 600, color: C.textLight }}>{capitalizar(pq.tipo)}</span></div>
                <div>
                  <span className="pq-cell-label">Ocupación</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, width: "100%" }}>
                    <div style={{ flex: 1, height: 6, borderRadius: 999, background: "#E2E8F0", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pctColor, borderRadius: 999, transition: "width .3s" }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: pctColor, minWidth: 28 }}>{pct}%</span>
                  </div>
                </div>
                <div><span className="pq-cell-label">Libres</span><span style={{ fontWeight: 700, color: C.primary }}>{libres}</span></div>
                <div><span className="pq-cell-label">Ocupadas</span><span style={{ fontWeight: 700, color: C.danger }}>{ocupados}</span></div>
                <div><span className="pq-cell-label">Reservadas</span><span style={{ fontWeight: 700, color: C.amber }}>{reservas}</span></div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                  <button title="Ver celdas" onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : pq.id); }}
                    style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: C.textLight, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F1F5F9")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Eye size={13} />
                  </button>
                  <button title="Editar" onClick={e => { e.stopPropagation(); onEdit(pq); }}
                    style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: C.textLight, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F1F5F9")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Pencil size={13} />
                  </button>
                  <button title="Eliminar" onClick={e => { e.stopPropagation(); onDelete(pq.id); }}
                    style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", color: C.danger, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#FEE2E2")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {isExpanded && (
                <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, background: "#FAFBFC" }}>
                  <div style={{ display: "flex", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
                    {Object.entries(TIPO_CELDA_CONFIG).map(([tipo, cfg]) => {
                      const total = celdasPq.filter(c => c.tipo === tipo).length;
                      if (!total) return null;
                      const Icon = cfg.icon;
                      return (
                        <div key={tipo} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 20, height: 20, borderRadius: 6, background: cfg.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon size={12} color="#fff" strokeWidth={2.5} />
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{cfg.label}: <strong style={{ color: cfg.accentDark }}>{total}</strong> celdas</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 8 }}>
                    {celdasPq.map(celda => {
                      const cfg = CELDA_CONFIG[celda.estado];
                      const tipoCfg = getTipoCeldaConfig(celda.tipo);
                      const TipoIcon = tipoCfg.icon;
                      const matched = cellMatchesSearch(celda);
                      const ocupante = celda.estado === "no_disponible" ? getOcupante(celda.id) : null;
                      const estaOcupada = celda.estado === "no_disponible" && ocupante !== null;
                      return (
                        <button key={celda.id} onClick={() => onCellClick(celda)}
                          style={{ position: "relative", padding: "8px 10px 8px 12px", borderRadius: 10, border: `2px ${celda.estado === "disponible" ? "dashed" : "solid"} ${matched ? "#F59E0B" : cfg.border}`, borderLeft: `4px solid ${tipoCfg.accent}`, background: cfg.bg, color: cfg.text, cursor: "pointer", textAlign: "left", fontFamily: "inherit", outline: "none", boxShadow: matched ? "0 0 0 3px rgba(245,158,11,.25)" : undefined }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>{celda.numero}</span>
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 5, background: tipoCfg.accent, flexShrink: 0 }}>
                              <TipoIcon size={10} color="#fff" strokeWidth={2.5} />
                            </span>
                          </div>
                          {estaOcupada && ocupante && (
                            <div style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, background: "rgba(255,255,255,.15)", padding: "1px 4px", borderRadius: 4, marginBottom: 2 }}>{ocupante.vehiculo.placa}</div>
                          )}
                          {celda.estado === "no_disponible" && !ocupante && (
                            <div style={{ fontSize: 8, color: C.danger, fontWeight: 700, marginBottom: 2 }}>⚠️ Error</div>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dotColor, flexShrink: 0 }} />
                            <span style={{ fontSize: 8, fontWeight: 700, opacity: .8 }}>{cfg.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {parqueaderos.length > 0 && (
        <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, background: "#F8FAF8", fontSize: 11, color: C.textLight }}>
          Mostrando <strong>{parqueaderos.length}</strong> parqueadero{parqueaderos.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
});
ParqueaderosTable.displayName="ParqueaderosTable";

/* ============================================================
   LISTA VEHÍCULOS ACTIVOS
============================================================ */
const ActiveVehiclesList = memo(({ celdas, parqueaderos, getOcupante, onSelectCell, searchQuery }: {
  celdas: Celda[];
  parqueaderos: Parqueadero[];
  getOcupante: (celdaId: string) => Ocupante | null;
  onSelectCell: (c: Celda) => void;
  searchQuery: string;
}) => {
  const activos = useMemo(() => {
    const list: { celda: Celda; pqNombre: string; ocupante: Ocupante }[] = [];
    celdas.forEach(c => {
      if (c.estado !== "no_disponible") return;
      const ocupante = getOcupante(c.id);
      if (!ocupante) return;
      const pq = parqueaderos.find(p => p.id === c.parqueaderoId);
      list.push({ celda: c, pqNombre: pq?.nombre || "—", ocupante });
    });
    return list.sort((a, b) => new Date(b.ocupante.fechaEntrada).getTime() - new Date(a.ocupante.fechaEntrada).getTime());
  }, [celdas, parqueaderos, getOcupante]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return activos;
    const q = searchQuery.toLowerCase();
    return activos.filter(v => v.ocupante.vehiculo.placa.toLowerCase().includes(q) || v.ocupante.conductor?.nombre.toLowerCase().includes(q) || v.celda.numero.toLowerCase().includes(q));
  }, [activos, searchQuery]);

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 2px 8px rgba(15,23,42,.05)" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: "#F8FAF8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Car size={15} color={C.primary} />
          <span style={{ fontSize: 12, fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: .5 }}>Vehículos Activos</span>
        </div>
        <span style={{ padding: "2px 8px", borderRadius: 999, background: C.primaryPale, color: C.primaryDark, fontSize: 10, fontWeight: 800 }}>{activos.length}</span>
      </div>
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {filtered.length > 0 ? filtered.map(({ celda, pqNombre, ocupante }) => {
          const tipoCfg = getTipoCeldaConfig(celda.tipo);
          const TipoIcon = tipoCfg.icon;
          return (
          <div key={celda.id} onClick={() => onSelectCell(celda)}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${C.border}`, borderLeft: `3px solid ${tipoCfg.accent}`, cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F8FAF8")} onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 5, background: tipoCfg.accentSoft, flexShrink: 0 }}>
                  <TipoIcon size={11} color={tipoCfg.accentDark} strokeWidth={2.5} />
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, background: "#F1F5F9", color: C.text, padding: "1px 6px", borderRadius: 6, border: `1px solid ${C.border}` }}>{ocupante.vehiculo.placa}</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: C.textLight }}>Celda {celda.numero}</span>
                {ocupante.esOficial && <span style={{ fontSize: 8, fontWeight: 800, background: C.primaryPale, color: C.primaryDark, padding: "1px 4px", borderRadius: 4 }}>OFICIAL</span>}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.text, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>{ocupante.conductor?.nombre || "—"}</div>
              <div style={{ fontSize: 9, color: C.textLight, marginTop: 1, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pqNombre}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end", fontSize: 10, fontWeight: 600, color: C.textLight }}><Clock size={8} />{formatearDuracion(ocupante.fechaEntrada)}</div>
            </div>
          </div>
        );}) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 16px", color: C.textLight }}>
            <Info size={20} color={C.border} style={{ marginBottom: 8 }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>No hay vehículos activos</span>
          </div>
        )}
      </div>
    </div>
  );
});
ActiveVehiclesList.displayName="ActiveVehiclesList";

/* ============================================================
   SMART ASSIGN MODAL
============================================================ */
const SmartAssignModal = memo(({ open, parqueaderos, celdas, onClose, onAssign, openScanner, scannedPlate }: {
  open: boolean;
  parqueaderos: Parqueadero[];
  celdas: Celda[];
  onClose: () => void;
  onAssign: (celda: Celda, placa: string, conductor: string, esOficial: boolean) => void;
  openScanner: () => void;
  scannedPlate?: string;
}) => {
  const [placa, setPlaca] = useState("");
  const [conductor, setConductor] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState<"carro" | "moto">("carro");
  const [rol, setRol] = useState<"Estudiante" | "Docente" | "Administrativo" | "Visitante" | "Oficial">("Estudiante");
  const [recomendacion, setRecomendacion] = useState<{ celda: Celda; pq: Parqueadero; motivo: string } | null>(null);

  useEffect(() => { if (scannedPlate) setPlaca(scannedPlate); }, [scannedPlate]);

  useEffect(() => {
    if (!open) return;
    let tipoPref = "general";
    if (rol === "Docente") tipoPref = "docentes";
    else if (rol === "Administrativo") tipoPref = "administrativos";
    else if (rol === "Visitante") tipoPref = "visitantes";
    if (tipoVehiculo === "moto") tipoPref = "motos";

    let found: { celda: Celda; pq: Parqueadero; motivo: string } | null = null;
    const buscarEn = (pqs: Parqueadero[], motivoBase: string) => {
      for (const pq of pqs) {
        const libre = celdas.find(c => c.parqueaderoId === pq.id && c.estado === "disponible" && c.tipo === tipoVehiculo);
        if (libre) return { celda: libre, pq, motivo: motivoBase };
      }
      return null;
    };
    found = buscarEn(parqueaderos.filter(p => p.tipo === tipoPref && p.estado === "activo"), `Zona preferencial ${tipoPref} disponible.`);
    if (!found) found = buscarEn(parqueaderos.filter(p => p.tipo === "general" && p.estado === "activo"), "Zona preferencial ocupada. Asignada zona general.");
    if (!found) found = buscarEn(parqueaderos.filter(p => p.estado === "activo"), "No hay cupo en la zona preferencial. Celda disponible en otra zona.");
    setRecomendacion(found);
  }, [open, tipoVehiculo, rol, parqueaderos, celdas]);

  const valid = validarPlacaColombiana(placa) && conductor.trim().length >= 3 && recomendacion !== null;

  return (
    <Modal open={open} onClose={onClose} maxWidth={560}>
      <ModalHeader eyebrow="Asistente Virtual" title="Asignación Inteligente" icon={<Sparkles size={18} color={C.primary} />} onClose={onClose} />
      <div style={{ padding: "1.4rem 1.8rem", maxHeight: "65vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <Banner tone="info" message="El sistema buscará la celda óptima libre según el perfil y tipo de vehículo." />
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Placa del Vehículo *</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} placeholder="ABC123" style={{ flex: 1, padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "monospace", fontWeight: 700, outline: "none", background: "#F8FAFC" }} />
            <button onClick={openScanner} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 16px", borderRadius: 11, border: "none", background: C.text, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Camera size={14} />Escanear</button>
          </div>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Nombre Conductor *</label>
          <input list="smart-drivers" value={conductor} onChange={e => setConductor(e.target.value)} placeholder="Nombre completo" style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, outline: "none", fontFamily: "inherit", background: "#F8FAFC" }} />
          <datalist id="smart-drivers">{CONDUCTORES_SUGERIDOS.map(c => <option key={c} value={c} />)}</datalist>
        </div>
        <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Vehículo</label>
            <div style={{ display: "flex", borderRadius: 11, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              {(["carro", "moto"] as const).map(t => {
                const cfg = getTipoCeldaConfig(t);
                const Icon = cfg.icon;
                const active = tipoVehiculo === t;
                return (
                  <button key={t} onClick={() => setTipoVehiculo(t)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 8px", fontSize: 12, fontWeight: 700, border: "none", background: active ? cfg.accent : "#fff", color: active ? "#fff" : C.textLight, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                    <Icon size={13} strokeWidth={2.5}/>{capitalizar(t)}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Rol</label>
            <select value={rol} onChange={e => setRol(e.target.value as any)} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC", outline: "none" }}>
              <option value="Estudiante">Estudiante</option>
              <option value="Docente">Docente</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Visitante">Visitante</option>
              <option value="Oficial">Oficial SENA</option>
            </select>
          </div>
        </div>
        {recomendacion ? (
          <div style={{ borderRadius: 11, border: `1px solid ${C.border}`, background: "#F8FAFC", padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Asignación Sugerida</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: getTipoCeldaConfig(recomendacion.celda.tipo).accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace", fontWeight: 900, fontSize: 13, color: getTipoCeldaConfig(recomendacion.celda.tipo).accentDark }}>{recomendacion.celda.numero}</div>
              <div><div style={{ fontWeight: 800, color: C.text, fontSize: 13 }}>{recomendacion.pq.nombre}</div><div style={{ fontSize: 10, color: C.textLight }}>{capitalizar(recomendacion.pq.tipo)} · Bloque {recomendacion.pq.bloque}</div></div>
            </div>
            <div style={{ padding: "8px 10px", borderRadius: 9, background: "#fff", border: `1px solid ${C.border}`, fontSize: 11, color: C.textLight }}>💡 {recomendacion.motivo}</div>
          </div>
        ) : <Banner tone="danger" message="No hay celdas libres disponibles para esta categoría." />}
      </div>
      <div style={{ display: "flex", gap: 10, borderTop: `1px solid ${C.border}`, padding: "1rem 1.8rem" }}>
        <button onClick={onClose} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", fontSize: 13, fontWeight: 700, color: C.text, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
        <button disabled={!valid} onClick={() => {
          if (!recomendacion) return;
          const eo = rol === "Oficial" || esPlacaOficial(placa);
          onAssign(recomendacion.celda, placa.toUpperCase(), normalizarTexto(conductor), eo);
          setPlaca(""); setConductor(""); onClose();
        }} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "none", background: valid ? C.primary : "#E2E8F0", fontSize: 13, fontWeight: 800, color: valid ? "#fff" : C.textLight, cursor: valid ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: valid ? "0 6px 18px rgba(57,169,0,.22)" : undefined }}>
          Confirmar Asignación
        </button>
      </div>
    </Modal>
  );
});
SmartAssignModal.displayName="SmartAssignModal";

/* ============================================================
   APP PRINCIPAL
============================================================ */
export default function Parqueaderos() {
  const {
    parqueaderos, addParqueadero, updateParqueadero, deleteParqueadero,
    celdas, addCelda, updateCelda, deleteCelda,
    conductores, addConductor,
    vehiculos, addVehiculo,
    controlesSalida, addControlSalida, updateControlSalida, deleteControlSalida,
    reservas, addReserva, updateReserva, deleteReserva,
    addIncidente,
  } = useData();

  const [activeTab, setActiveTab]   = useState<"map" | "table">("table");
  const [openModal, setOpenModal]   = useState<"create"|"edit"|"ingreso"|"info"|"scanner"|"smartAssign"|"confirmDelete"|"incidente"|"reserva"|null>(null);
  const [pqEditId, setPqEditId]     = useState<string | null>(null);
  const [pqDeleteId, setPqDeleteId] = useState<string | null>(null);
  const [celdaSeleccionadaId, setCeldaSeleccionadaId] = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  const [pqForm, setPqForm]         = useState<FormParqueadero>({ nombre: "", bloque: "A", tipo: "general", direccion: "", horaInicio: "06:00", horaFin: "22:00", celdasCarros: 8, celdasMotos: 2, celdasMovilidadReducida: 1, descripcion: "" });
  const [formError, setFormError]   = useState<string | null>(null);
  const [vehiculoForm, setVehiculoForm] = useState<VehiculoForm>({ placa: "", conductor: "", esOficial: false });
  const [incidenteForm, setIncidenteForm] = useState<IncidenteForm>({ descripcion: "", asignadoA: "", notasResolucion: "", evidencia: "" });
  const [incidenteError, setIncidenteError] = useState<string | null>(null);
  const [placaError, setPlacaError] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError]     = useState<string | null>(null);
  const [ocrFlash, setOcrFlash]     = useState(false);
  const [camaraLista, setCamaraLista] = useState(false);
  const [scannerOrigin, setScannerOrigin] = useState<"ingreso"|"smartAssign"|null>(null);
  const [scannedPlate, setScannedPlate]   = useState<string | undefined>(undefined);
  const [, forceTick] = useState(0);
  
  // Estado para el formulario de reserva
  const [reservaForm, setReservaForm] = useState({
    vehiculoId: "",
    parqueaderoId: "",
    celdaId: "",
    fechaReserva: new Date().toISOString().split("T")[0],
    horaInicio: "08:00",
    horaFin: "18:00",
    estado: "pendiente" as "pendiente" | "activa" | "completada" | "cancelada",
  });
  const [reservaError, setReservaError] = useState<string | null>(null);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { reconocer, reconocerLicencia, liberarWorker } = useOcrPlaca();

  // Manejador para subir evidencia en incidentes
  const handleIncidenteFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setIncidenteForm(prev => ({ ...prev, evidencia: ev.target?.result as string || '' }));
    };
    reader.readAsDataURL(file);
  }, []);

  const removeIncidenteEvidencia = useCallback(() => {
    setIncidenteForm(prev => ({ ...prev, evidencia: '' }));
  }, []);

  useEffect(() => { const i = setInterval(() => forceTick(t => t + 1), 30000); return () => clearInterval(i); }, []);

  const cerrarCamara = useCallback(() => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; setCamaraLista(false); }, []);
  const iniciarCamara = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setOcrError("Cámara no compatible. Usa HTTPS."); return; }
    setOcrError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } });
      streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s;
    } catch {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s;
      } catch { setOcrError("No se pudo iniciar la cámara."); }
    }
  }, []);
  useEffect(() => { if (openModal === "scanner") iniciarCamara(); else cerrarCamara(); return () => cerrarCamara(); }, [openModal, iniciarCamara, cerrarCamara]);
  useEffect(() => () => { liberarWorker(); }, [liberarWorker]);

  /* ── FUNCIÓN DE SINCRONIZACIÓN DE CELDAS ── */
  const sincronizarCeldasOcupadas = useCallback(() => {
    const celdasOcupadas = celdas.filter(c => c.estado === "no_disponible");
    let corregidas = 0;

    celdasOcupadas.forEach(celda => {
      const controlActivo = controlesSalida.find(cs => cs.celdaId === celda.id && cs.estado === "en_parqueadero");
      const vehiculoAsociado = vehiculos.find(v => v.celdaId === celda.id);

      if (!controlActivo && !vehiculoAsociado) {
        updateCelda(celda.id, { estado: "disponible", ocupada: false });
        corregidas++;
      }
    });

    if (corregidas > 0) {
      toast.success(`Se corrigieron ${corregidas} celdas inconsistentes.`);
    } else {
      toast.info("Todas las celdas están sincronizadas correctamente.");
    }
  }, [celdas, controlesSalida, vehiculos, updateCelda]);

  /* ── DERIVAR OCUPANTE DE UNA CELDA ── */
  const getOcupante = useCallback((celdaId: string): Ocupante | null => {
    // 1. Buscar control de salida activo
    const cs = controlesSalida.find(c => c.celdaId === celdaId && c.estado === "en_parqueadero");
    if (cs) {
      const vehiculo = vehiculos.find(v => v.id === cs.vehiculoId);
      if (vehiculo) {
        const conductor = conductores.find(c => c.id === vehiculo.conductorId);
        return { 
          vehiculo, 
          conductor, 
          esOficial: esPlacaOficial(vehiculo.placa), 
          controlId: cs.id, 
          fechaEntrada: cs.fechaEntrada 
        };
      }
    }

    // 2. Si no hay control activo, buscar vehículo asociado directamente a la celda
    const vehiculoEnCelda = vehiculos.find(v => v.celdaId === celdaId);
    if (vehiculoEnCelda) {
      const conductor = conductores.find(c => c.id === vehiculoEnCelda.conductorId);
      return {
        vehiculo: vehiculoEnCelda,
        conductor: conductor || undefined,
        esOficial: esPlacaOficial(vehiculoEnCelda.placa),
        controlId: "",
        fechaEntrada: vehiculoEnCelda.fechaEntrada || new Date().toISOString(),
      };
    }

    return null;
  }, [controlesSalida, vehiculos, conductores]);

  const stats = useMemo(() => {
    const t = celdas.length;
    const o = celdas.filter(c => c.estado === "no_disponible").length;
    const l = celdas.filter(c => c.estado === "disponible").length;
    const r = celdas.filter(c => c.estado === "reservada").length;
    return { total: t, ocupadas: o, libres: l, reservadas: r, pct: t ? Math.round(o / t * 100) : 0 };
  }, [celdas]);

  const celdaActiva      = useMemo(() => celdas.find(c => c.id === celdaSeleccionadaId) ?? null, [celdas, celdaSeleccionadaId]);
  const parqueaderoActivo = useMemo(() => celdaActiva ? parqueaderos.find(p => p.id === celdaActiva.parqueaderoId) ?? null : null, [celdaActiva, parqueaderos]);
  const ocupanteActivo   = useMemo(() => celdaActiva ? getOcupante(celdaActiva.id) : null, [celdaActiva, getOcupante]);

  const cellMatchesSearch = useCallback((celda: Celda) => {
    if (!search.trim()) return false;
    const q = search.toLowerCase();
    const ocupante = getOcupante(celda.id);
    return !!(celda.numero.toLowerCase().includes(q) || ocupante?.vehiculo.placa.toLowerCase().includes(q) || ocupante?.conductor?.nombre.toLowerCase().includes(q));
  }, [search, getOcupante]);

  const filteredPqs = useMemo(() => parqueaderos.filter(pq => filterTipo === "Todos" || pq.tipo === filterTipo), [parqueaderos, filterTipo]);
  const filteredCeldas = useMemo(() => {
    if (!search.trim()) return celdas;
    const q = search.toLowerCase();
    return celdas.filter(c => {
      const ocupante = getOcupante(c.id);
      return c.numero.toLowerCase().includes(q) || ocupante?.vehiculo.placa.toLowerCase().includes(q) || ocupante?.conductor?.nombre.toLowerCase().includes(q);
    });
  }, [celdas, search, getOcupante]);
  const filteredPqsConCeldas = useMemo(
    () => filteredPqs.filter(pq => filteredCeldas.some(c => c.parqueaderoId === pq.id) || !search.trim()),
    [filteredPqs, filteredCeldas, search]
  );

  const handleCellClick = useCallback((celda: Celda) => {
    setCeldaSeleccionadaId(celda.id);
    setPlacaError(null);
    setIncidenteError(null);
    // Resetear evidencia al abrir incidente
    setIncidenteForm(prev => ({ ...prev, evidencia: '' }));
    if (celda.estado === "no_disponible") {
      const ocupante = getOcupante(celda.id);
      setVehiculoForm({ 
        placa: ocupante?.vehiculo.placa || "", 
        conductor: ocupante?.conductor?.nombre || "", 
        esOficial: ocupante?.esOficial || false 
      });
      setOpenModal("info");
    } else if (celda.estado === "reservada") {
      setVehiculoForm({ placa: "", conductor: "", esOficial: true });
      setOpenModal("info");
    } else if (celda.estado === "mantenimiento") {
      toast.info("Esta celda está en mantenimiento y no puede usarse.");
    } else {
      setVehiculoForm({ placa: "", conductor: "", esOficial: false });
      setOpenModal("ingreso");
    }
  }, [getOcupante]);

  /* ── Función para abrir el modal de reserva desde una celda ── */
  const openReservaFromCelda = useCallback((celda: Celda) => {
    setCeldaSeleccionadaId(celda.id);
    setReservaForm(prev => ({
      ...prev,
      parqueaderoId: celda.parqueaderoId,
      celdaId: celda.id,
      fechaReserva: new Date().toISOString().split("T")[0],
      horaInicio: "08:00",
      horaFin: "18:00",
      estado: "pendiente",
    }));
    setReservaError(null);
    setOpenModal("reserva");
  }, []);

  /* ── Función para crear la reserva ── */
  const handleCrearReserva = useCallback(() => {
    if (!reservaForm.vehiculoId) {
      setReservaError("Selecciona un vehículo");
      return;
    }
    if (!reservaForm.celdaId) {
      setReservaError("Selecciona una celda");
      return;
    }
    if (!reservaForm.fechaReserva) {
      setReservaError("La fecha es requerida");
      return;
    }
    if (!reservaForm.horaInicio || !reservaForm.horaFin) {
      setReservaError("El horario es requerido");
      return;
    }

    // Validar que el horario sea válido
    const toMinutes = (hhmm: string) => {
      const [h, m] = hhmm.split(":").map(Number);
      return h * 60 + m;
    };
    if (toMinutes(reservaForm.horaFin) <= toMinutes(reservaForm.horaInicio)) {
      setReservaError("La hora de fin debe ser posterior a la hora de inicio");
      return;
    }

    try {
      // Verificar que no haya conflicto de horario en la misma celda
      const conflicto = reservas.find(r => {
        if (r.celdaId !== reservaForm.celdaId) return false;
        if (r.fechaReserva !== reservaForm.fechaReserva) return false;
        if (r.estado === "cancelada") return false;
        const rInicio = toMinutes(r.horaInicio);
        const rFin = toMinutes(r.horaFin);
        const inicio = toMinutes(reservaForm.horaInicio);
        const fin = toMinutes(reservaForm.horaFin);
        return inicio < rFin && fin > rInicio;
      });

      if (conflicto) {
        const vehiculo = vehiculos.find(v => v.id === conflicto.vehiculoId);
        setReservaError(`La celda ya está reservada de ${conflicto.horaInicio} a ${conflicto.horaFin} (vehículo ${vehiculo?.placa || "—"})`);
        return;
      }

      const { parqueaderoId, ...payload } = reservaForm;
      addReserva(payload);
      toast.success(`Reserva creada para la celda ${celdaActiva?.numero}`);
      setOpenModal(null);
      setReservaError(null);
      setReservaForm(prev => ({ ...prev, vehiculoId: "", horaInicio: "08:00", horaFin: "18:00" }));
    } catch (error) {
      setReservaError("Error al crear la reserva");
      console.error(error);
    }
  }, [reservaForm, addReserva, celdaActiva, reservas, vehiculos]);

  const capacidadForm = pqForm.celdasCarros + pqForm.celdasMotos + pqForm.celdasMovilidadReducida;

  const handleCreate = () => {
    const nombre = normalizarTexto(pqForm.nombre);
    const bloque = pqForm.bloque.trim();
    if (!nombre) return setFormError("El nombre es obligatorio.");
    if (!bloque) return setFormError("El bloque es obligatorio.");
    if (parqueaderos.some(p => p.bloque.toLowerCase() === bloque.toLowerCase())) return setFormError(`Ya existe el bloque "${bloque}".`);
    if (capacidadForm <= 0) return setFormError("Debe definir al menos una celda.");
    addParqueadero({
      nombre, bloque, tipo: pqForm.tipo, direccion: pqForm.direccion, descripcion: pqForm.descripcion,
      horaInicio: pqForm.horaInicio, horaFin: pqForm.horaFin,
      celdasCarros: pqForm.celdasCarros, celdasMotos: pqForm.celdasMotos, celdasMovilidadReducida: pqForm.celdasMovilidadReducida,
      capacidad: capacidadForm, estado: "activo",
    });
    toast.success(`Parqueadero "${nombre}" creado.`);
    setOpenModal(null);
  };

  const handleEdit = () => {
    if (!pqEditId) return;
    const actual = parqueaderos.find(p => p.id === pqEditId);
    if (!actual) return;
    const nombre = normalizarTexto(pqForm.nombre);
    const bloque = pqForm.bloque.trim();
    if (!nombre) return setFormError("El nombre es obligatorio.");
    if (!bloque) return setFormError("El bloque es obligatorio.");
    if (parqueaderos.some(p => p.bloque.toLowerCase() === bloque.toLowerCase() && p.id !== pqEditId)) return setFormError(`Ya existe el bloque "${bloque}".`);
    if (capacidadForm <= 0) return setFormError("Debe definir al menos una celda.");

    const celdasPq = celdas.filter(c => c.parqueaderoId === pqEditId);
    const tiposMap: { tipo: Celda["tipo"]; prefix: string; anterior: number; nuevo: number }[] = [
      { tipo: "carro", prefix: "C", anterior: actual.celdasCarros, nuevo: pqForm.celdasCarros },
      { tipo: "moto", prefix: "M", anterior: actual.celdasMotos, nuevo: pqForm.celdasMotos },
      { tipo: "movilidad reducida", prefix: "MR", anterior: actual.celdasMovilidadReducida, nuevo: pqForm.celdasMovilidadReducida },
    ];

    for (const t of tiposMap) {
      if (t.nuevo < t.anterior) {
        const delTipo = celdasPq.filter(c => c.tipo === t.tipo);
        const sobrantes = delTipo.slice(t.nuevo);
        if (sobrantes.some(c => c.estado === "no_disponible" || c.estado === "reservada")) {
          return setFormError(`No se puede reducir ${t.tipo}: hay celdas ocupadas o reservadas en el rango a eliminar.`);
        }
      }
    }

    for (const t of tiposMap) {
      const delTipo = celdasPq.filter(c => c.tipo === t.tipo);
      if (t.nuevo < t.anterior) {
        delTipo.slice(t.nuevo).forEach(c => deleteCelda(c.id));
      } else if (t.nuevo > t.anterior) {
        for (let i = t.anterior; i < t.nuevo; i++) {
          addCelda({
            parqueaderoId: pqEditId,
            numero: `${t.prefix}-${String(i + 1).padStart(3, "0")}`,
            tipo: t.tipo, estado: "disponible", ocupada: false,
            nombre: `${nombre}-${t.prefix}${i + 1}`,
          });
        }
      }
    }

    updateParqueadero(pqEditId, {
      nombre, bloque, tipo: pqForm.tipo, direccion: pqForm.direccion, descripcion: pqForm.descripcion,
      horaInicio: pqForm.horaInicio, horaFin: pqForm.horaFin,
      celdasCarros: pqForm.celdasCarros, celdasMotos: pqForm.celdasMotos, celdasMovilidadReducida: pqForm.celdasMovilidadReducida,
      capacidad: capacidadForm,
    });
    toast.success("Parqueadero actualizado.");
    setOpenModal(null); setPqEditId(null);
  };

  const handleDelete = () => {
    if (!pqDeleteId) return;
    const celdasPq = celdas.filter(c => c.parqueaderoId === pqDeleteId);
    celdasPq.forEach(c => {
      controlesSalida.filter(cs => cs.celdaId === c.id).forEach(cs => deleteControlSalida(cs.id));
    });
    deleteParqueadero(pqDeleteId);
    toast.info("Parqueadero eliminado.");
    setOpenModal(null); setPqDeleteId(null);
  };

  const resolverConductor = useCallback((nombre: string, tipo: Conductor["tipo"]): string => {
    const existente = conductores.find(c => c.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
    if (existente) return existente.id;
    return addConductor({
      usuarioId: "", nombre, tipoConductor: "aprendiz", centroFormacion: "",
      discapacidad: false, estado: "activo", tipo, email: "",
    });
  }, [conductores, addConductor]);

  const resolverVehiculo = useCallback((placa: string, conductorId: string, tipo: "carro" | "moto", parqueaderoId: string, celdaId: string, fechaEntrada: string): string => {
    const existente = vehiculos.find(v => v.placa === placa);
    if (existente) return existente.id;
    return addVehiculo({
      conductorId, placa, tipo, marca: "", modelo: "", año: new Date().getFullYear(), color: "",
      descripcion: "", estado: "activo", parqueaderoId, celdaId, fechaEntrada,
    });
  }, [vehiculos, addVehiculo]);

  const tipoConductorDesdeParqueadero = (tipoPq: string): Conductor["tipo"] => {
    if (tipoPq === "docentes") return "docente";
    if (tipoPq === "administrativos") return "administrativo";
    return "visitante";
  };

  const registrarEnCelda = (celda: Celda, placaRaw: string, conductorRaw: string, esOficial: boolean) => {
    const placa = placaRaw.trim().toUpperCase();
    const conductorNombre = normalizarTexto(conductorRaw, 60);
    if (!placa || !conductorNombre) { setPlacaError("Completa todos los campos."); return false; }
    if (!validarPlacaColombiana(placa)) { setPlacaError("Formato de placa inválido."); return false; }
    const yaActivo = controlesSalida.some(cs => cs.estado === "en_parqueadero" && cs.celdaId !== celda.id && vehiculos.find(v => v.id === cs.vehiculoId)?.placa === placa);
    if (yaActivo) { setPlacaError("Este vehículo ya está estacionado en otra celda."); return false; }

    const pq = parqueaderos.find(p => p.id === celda.parqueaderoId);
    const tipoConductor = tipoConductorDesdeParqueadero(pq?.tipo || "");
    const conductorId = resolverConductor(conductorNombre, tipoConductor);
    const fechaEntrada = new Date().toISOString().slice(0, 16);
    const vehiculoTipo: "carro" | "moto" = celda.tipo === "moto" ? "moto" : "carro";
    const vehiculoId = resolverVehiculo(placa, conductorId, vehiculoTipo, celda.parqueaderoId, celda.id, fechaEntrada);

    addControlSalida({ vehiculoId, celdaId: celda.id, fechaEntrada, estado: "en_parqueadero" });
    updateCelda(celda.id, { estado: "no_disponible", ocupada: true });
    toast.success(`Vehículo ${placa} registrado.`);
    return true;
  };

  const registrarVehiculo = () => {
    if (!celdaActiva) return;
    if (registrarEnCelda(celdaActiva, vehiculoForm.placa, vehiculoForm.conductor, vehiculoForm.esOficial)) {
      setOpenModal(null);
    }
  };

  const handleRequestLiberar = () => {
    if (!celdaActiva) return;
    const ocupante = getOcupante(celdaActiva.id);
    if (ocupante && ocupante.controlId) {
      updateControlSalida(ocupante.controlId, { 
        fechaSalida: new Date().toISOString().slice(0, 16), 
        estado: "finalizado" 
      });
    }
    const vehiculoEnCelda = vehiculos.find(v => v.celdaId === celdaActiva.id);
    if (vehiculoEnCelda) {
      // Si tu DataContext permite actualizar vehículos, actualiza la celdaId
      // updateVehiculo(vehiculoEnCelda.id, { celdaId: null });
    }
    updateCelda(celdaActiva.id, { estado: "disponible", ocupada: false });
    toast.info(`Celda ${celdaActiva.numero} liberada.`);
    setOpenModal(null);
  };

  const handleToggleReserva = () => {
    if (!celdaActiva) return;
    const nuevoEstado: Celda["estado"] = celdaActiva.estado === "reservada" ? "disponible" : "reservada";
    updateCelda(celdaActiva.id, { estado: nuevoEstado });
    toast.info(nuevoEstado === "reservada" ? "Celda reservada." : "Reserva liberada.");
    setOpenModal(null);
  };

  const cerrarScanner = useCallback(() => setOpenModal(scannerOrigin === "smartAssign" ? "smartAssign" : "ingreso"), [scannerOrigin]);

  const handleCaptureOcr = async () => {
    if (!videoRef.current) return;
    setOcrLoading(true); setOcrError(null);
    try {
      const d = await reconocer(videoRef.current);
      setOcrFlash(true); setTimeout(() => setOcrFlash(false), 1200);
      setVehiculoForm(prev => ({ ...prev, placa: d.placa, conductor: d.conductor || prev.conductor }));
      toast.success(`Placa detectada: ${d.placa}`);
      if (scannerOrigin === "smartAssign") { setScannedPlate(d.placa); cerrarCamara(); setOpenModal("smartAssign"); }
      else { cerrarCamara(); setOpenModal("ingreso"); }
    } catch (e) { setOcrError(e instanceof Error ? e.message : "Error al escanear."); }
    finally { setOcrLoading(false); }
  };

  const handleFileOCR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setOcrLoading(true); setOcrError(null);
    try {
      const reader = new FileReader();
      reader.onload = async ev => {
        try {
          const url = await preprocesarImagenArchivo(ev.target?.result as string);
          const d = await reconocerLicencia(url);
          setOcrFlash(true); setTimeout(() => setOcrFlash(false), 1200);
          setVehiculoForm(prev => ({ ...prev, placa: d.placa, conductor: d.conductor || prev.conductor }));
          toast.success(`Placa detectada: ${d.placa}`);
          if (scannerOrigin === "smartAssign") { setScannedPlate(d.placa); setOpenModal("smartAssign"); }
          else { setOpenModal("ingreso"); }
        } catch (err) { setOcrError(err instanceof Error ? err.message : "No se reconoció la placa."); }
        finally { setOcrLoading(false); }
      };
      reader.readAsDataURL(f);
    } catch { setOcrError("No se pudo procesar la imagen."); setOcrLoading(false); }
  };

  const handleSimOCR = (p: string, con: string, rol: string) => {
    setOcrLoading(true);
    setTimeout(() => {
      setOcrLoading(false); setOcrFlash(true);
      setTimeout(() => {
        setOcrFlash(false);
        setVehiculoForm({ placa: p, conductor: con, esOficial: rol === "Oficial" });
        if (scannerOrigin === "smartAssign") { setScannedPlate(p); setOpenModal("smartAssign"); }
        else { setOpenModal("ingreso"); }
      }, 1000);
    }, 800);
  };

  const handleSmartAssign = (celda: Celda, placa: string, conductorNombre: string, esOficial: boolean) => {
    registrarEnCelda(celda, placa, conductorNombre, esOficial);
    setScannedPlate(undefined);
  };

  /* ── REGISTRAR INCIDENTE (con evidencia) ── */
  const registrarIncidente = useCallback(() => {
    if (!celdaActiva || !ocupanteActivo) return;
    const { descripcion, asignadoA, notasResolucion, evidencia } = incidenteForm;
    if (!descripcion.trim()) {
      setIncidenteError("La descripción del incidente es obligatoria.");
      return;
    }

    const incidenteData = {
      descripcion: descripcion.trim(),
      parqueaderoId: celdaActiva.parqueaderoId,
      celdaId: celdaActiva.id,
      celdaNumero: celdaActiva.numero,
      vehiculo: ocupanteActivo.vehiculo.placa,
      conductor: ocupanteActivo.conductor?.nombre || "",
      asignadoA: asignadoA.trim() || undefined,
      notasResolucion: notasResolucion.trim() || undefined,
      evidencia: evidencia || undefined,
      fecha: new Date().toISOString(),
      estado: "pendiente" as const,
    };

    addIncidente(incidenteData);
    setIncidenteForm({ descripcion: "", asignadoA: "", notasResolucion: "", evidencia: "" });
    setIncidenteError(null);
    setOpenModal(null);
    toast.success("Incidente registrado correctamente.");
  }, [celdaActiva, ocupanteActivo, incidenteForm, addIncidente]);

  const activeFilters = [search, filterTipo !== "Todos" ? filterTipo : ""].filter(Boolean).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .pq-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        input:focus,select:focus,textarea:focus{ outline:none; border-color:${C.primary} !important; box-shadow:0 0 0 3px rgba(57,169,0,.12); }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }

        .pq-hero-banner{ display:flex; flex-wrap:wrap; gap:16px; align-items:center; justify-content:space-between; }
        .pq-hero-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; min-width:280px; }

        .pq-topbar{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
        .pq-search-wrap{ flex:1; position:relative; min-width:200px; }
        .pq-view-toggle{ display:flex; border-radius:11px; border:1px solid ${C.border}; overflow:hidden; background:#fff; }

        .pq-content-grid{ display:grid; grid-template-columns:1fr 280px; gap:16px; align-items:start; }

        .pq-table-header{ display:grid; grid-template-columns:minmax(200px,1fr) 120px 100px 80px 80px 80px 90px; background:#F8FAF8; border-bottom:1px solid ${C.border}; padding:12px 16px; font-size:11px; font-weight:800; color:${C.textLight}; text-transform:uppercase; letter-spacing:.5px; }
        .pq-table-row{ display:grid; grid-template-columns:minmax(200px,1fr) 120px 100px 80px 80px 80px 90px; padding:14px 16px; border-bottom:1px solid ${C.border}; align-items:center; font-size:12px; transition:background .15s; cursor:pointer; }
        .pq-cell-label{ display:none; }

        @media (max-width: 1024px){
          .pq-content-grid{ grid-template-columns:1fr; }
        }

        @media (max-width: 860px){
          .pq-hero-stats{ grid-template-columns:repeat(2,1fr); min-width:0; width:100%; }
          .pq-table-header, .pq-table-row{ grid-template-columns:minmax(140px,1fr) 100px 90px 60px 60px 60px 80px; gap:6px; }
        }

        @media (max-width: 720px){
          .pq-topbar > .pq-search-wrap{ order:1; min-width:100%; }
          .pq-topbar > select{ order:2; flex:1; min-width:140px; }
          .pq-view-toggle{ order:3; flex:1; }
          .pq-view-toggle button{ flex:1; justify-content:center; }
          .pq-topbar > button{ order:4; flex:1; justify-content:center; }
        }

        @media (max-width: 640px){
          .pq-hero-stats{ grid-template-columns:repeat(2,1fr); }
          .pq-table-header{ display:none; }
          .pq-table-row{
            grid-template-columns:1fr !important;
            gap:10px; padding:14px 16px;
            border:1px solid ${C.border}; border-radius:14px;
            margin:0 0 10px 0; border-bottom:1px solid ${C.border};
            box-shadow:0 1px 4px rgba(15,23,42,.04);
          }
          .pq-table-row > div{ display:flex; flex-direction:column; align-items:flex-start !important; }
          .pq-table-row > div:last-child{ flex-direction:row; align-items:center !important; justify-content:flex-end !important; padding-top:6px; border-top:1px dashed ${C.border}; margin-top:4px; }
          .pq-cell-label{ display:block; font-size:9px; font-weight:800; letter-spacing:.5px; text-transform:uppercase; color:${C.textLight}; margin-bottom:3px; }
          .pq-modal-two-col{ grid-template-columns:1fr !important; }
        }
      `}</style>

      <div className="pq-root" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── HERO ── */}
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 20, background: "linear-gradient(135deg,#39A900,#2D7D00)", padding: "1.4rem 1.6rem", color: "#fff" }}>
          <div style={{ position: "absolute", width: 250, height: 250, borderRadius: "50%", background: "rgba(255,255,255,.07)", top: -80, right: -60 }} />
          <div className="pq-hero-banner" style={{ position: "relative", zIndex: 2 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.2)", padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                <Shield size={11} /> Gestión Institucional SENA
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>Gestión de Parqueaderos</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>Registro óptico automatizado, celdas de cortesía institucional y reportes de ocupación en tiempo real.</p>
            </div>
            <div className="pq-hero-stats">
              {[
                { label: "Disponibles",   value: stats.libres,    dot: CELDA_CONFIG.disponible.dotColor },
                { label: "Ocupadas",      value: stats.ocupadas,  dot: CELDA_CONFIG.no_disponible.dotColor },
                { label: "Reservadas",    value: stats.reservadas, dot: CELDA_CONFIG.reservada.dotColor },
                { label: "Ocupación",     value: `${stats.pct}%`, dot: "#94A3B8" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: 12, padding: "8px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: "rgba(255,255,255,.65)", textTransform: "uppercase", marginBottom: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />{s.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TOPBAR ── */}
        <div className="pq-topbar">
          <div className="pq-search-wrap">
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textLight }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por placa, celda, conductor..." style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, background: "#fff", fontFamily: "inherit" }} />
            {search && <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.textLight }}><X size={14} /></button>}
          </div>

          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={{ padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, background: "#fff", fontFamily: "inherit", cursor: "pointer" }}>
            <option value="Todos">Todos los tipos</option>
            {TIPOS_PARQUEADERO.map(t => <option key={t} value={t}>{capitalizar(t)}</option>)}
          </select>

          <div className="pq-view-toggle">
            {([{ id: "table", label: "Lista", icon: <LayoutGrid size={14} /> }, { id: "map", label: "Plano", icon: <MapIcon size={14} /> }] as const).map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", fontSize: 12, fontWeight: 700, border: "none", background: activeTab === t.id ? C.primary : "transparent", color: activeTab === t.id ? "#fff" : C.textLight, cursor: "pointer", fontFamily: "inherit", transition: "all .15s" }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* BOTÓN DE SINCRONIZACIÓN */}
          <button 
            onClick={sincronizarCeldasOcupadas}
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 6, 
              padding: "10px 14px", 
              borderRadius: 11, 
              border: `1px solid ${C.dangerBorder}`, 
              background: C.dangerBg, 
              color: C.danger, 
              fontSize: 12, 
              fontWeight: 700, 
              cursor: "pointer", 
              fontFamily: "inherit" 
            }}
          >
            <Wrench size={14} /> Sincronizar Celdas
          </button>

          {activeFilters > 0 && <button onClick={() => { setSearch(""); setFilterTipo("Todos"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", color: C.textLight, fontSize: 12, fontFamily: "inherit" }}><X size={14} />Limpiar</button>}

          <button onClick={() => setOpenModal("smartAssign")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            <Zap size={14} color="#F59E0B" />Asignación Inteligente
          </button>
          <button onClick={() => { setPqForm({ nombre: "", bloque: "", tipo: "general", direccion: "", horaInicio: "06:00", horaFin: "22:00", celdasCarros: 8, celdasMotos: 2, celdasMovilidadReducida: 1, descripcion: "" }); setFormError(null); setOpenModal("create"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(57,169,0,.25)" }}>
            <Plus size={15} />Nuevo Parqueadero
          </button>
        </div>

        {activeFilters > 0 && <p style={{ fontSize: 11, color: C.textLight }}>Mostrando <strong>{filteredPqsConCeldas.length}</strong> resultado{filteredPqsConCeldas.length !== 1 ? "s" : ""}</p>}

        {/* ── CONTENIDO POR TAB ── */}
        {activeTab === "table" && (
          <div className="pq-content-grid">
            <ParqueaderosTable
              parqueaderos={filteredPqsConCeldas}
              celdas={search.trim() ? filteredCeldas : celdas}
              getOcupante={getOcupante}
              onEdit={pq => {
                setPqEditId(pq.id);
                setPqForm({ nombre: pq.nombre, bloque: pq.bloque, tipo: pq.tipo, direccion: pq.direccion, horaInicio: pq.horaInicio, horaFin: pq.horaFin, celdasCarros: pq.celdasCarros, celdasMotos: pq.celdasMotos, celdasMovilidadReducida: pq.celdasMovilidadReducida, descripcion: pq.descripcion });
                setFormError(null); setOpenModal("edit");
              }}
              onDelete={id => { setPqDeleteId(id); setOpenModal("confirmDelete"); }}
              onCellClick={handleCellClick}
              cellMatchesSearch={cellMatchesSearch}
            />
            <ActiveVehiclesList celdas={celdas} parqueaderos={parqueaderos} getOcupante={getOcupante} onSelectCell={handleCellClick} searchQuery={search} />
          </div>
        )}

        {activeTab === "map" && (
          <div className="pq-content-grid">
            <ParkingMap parqueaderos={filteredPqsConCeldas} celdas={celdas} getOcupante={getOcupante} onCellClick={handleCellClick} cellMatchesSearch={cellMatchesSearch} />
            <ActiveVehiclesList celdas={celdas} parqueaderos={parqueaderos} getOcupante={getOcupante} onSelectCell={handleCellClick} searchQuery={search} />
          </div>
        )}
      </div>

      {/* ══ MODALES ══ */}

      {/* ── MODAL CREAR / EDITAR ── */}
      <Modal open={openModal === "create" || openModal === "edit"} onClose={() => setOpenModal(null)}>
        <ModalHeader eyebrow={openModal === "edit" ? "Editar Zona" : "Registro de Zona"} title={openModal === "edit" ? "Editar Parqueadero" : "Nuevo Parqueadero"} icon={openModal === "edit" ? <Pencil size={18} color={C.primary} /> : <Sparkles size={18} color={C.primary} />} onClose={() => setOpenModal(null)} />
        <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 14 }}>
          {formError && <Banner tone="danger" message={formError} />}
          <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Nombre *</label><input value={pqForm.nombre} onChange={e => setPqForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: PQ-8 Bloque D" style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
          <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Bloque *</label><input value={pqForm.bloque} onChange={e => setPqForm(p => ({ ...p, bloque: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
            <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Categoría</label><select value={pqForm.tipo} onChange={e => setPqForm(p => ({ ...p, tipo: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }}>{TIPOS_PARQUEADERO.map(t => <option key={t} value={t}>{capitalizar(t)}</option>)}</select></div>
          </div>
          <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Dirección</label><input value={pqForm.direccion} onChange={e => setPqForm(p => ({ ...p, direccion: e.target.value }))} placeholder="Ej: Calle 100 # 50-30" style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
          <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Hora apertura</label><input type="time" value={pqForm.horaInicio} onChange={e => setPqForm(p => ({ ...p, horaInicio: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
            <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Hora cierre</label><input type="time" value={pqForm.horaFin} onChange={e => setPqForm(p => ({ ...p, horaFin: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Celdas por tipo</label>
            <div className="pq-modal-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div>
                <span style={{ fontSize: 10, color: C.textLight, fontWeight: 700 }}>Carros</span>
                <input type="number" min={0} max={60} value={pqForm.celdasCarros} onChange={e => setPqForm(p => ({ ...p, celdasCarros: Math.max(0, Math.min(60, parseInt(e.target.value, 10) || 0)) }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} />
              </div>
              <div>
                <span style={{ fontSize: 10, color: C.textLight, fontWeight: 700 }}>Motos</span>
                <input type="number" min={0} max={60} value={pqForm.celdasMotos} onChange={e => setPqForm(p => ({ ...p, celdasMotos: Math.max(0, Math.min(60, parseInt(e.target.value, 10) || 0)) }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} />
              </div>
              <div>
                <span style={{ fontSize: 10, color: C.textLight, fontWeight: 700 }}>M. reducida</span>
                <input type="number" min={0} max={60} value={pqForm.celdasMovilidadReducida} onChange={e => setPqForm(p => ({ ...p, celdasMovilidadReducida: Math.max(0, Math.min(60, parseInt(e.target.value, 10) || 0)) }))} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} />
              </div>
            </div>
            <p style={{ fontSize: 10, color: C.textLight, marginTop: 6 }}>Capacidad total: <strong>{capacidadForm}</strong> celdas</p>
          </div>
          <div><label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Descripción</label><input value={pqForm.descripcion} onChange={e => setPqForm(p => ({ ...p, descripcion: e.target.value }))} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} /></div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "1rem 1.8rem", borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <button onClick={() => setOpenModal(null)} style={{ padding: "10px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button onClick={openModal === "edit" ? handleEdit : handleCreate} style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 18px rgba(57,169,0,.22)" }}>{openModal === "edit" ? "Guardar Cambios" : "Crear Parqueadero"}</button>
        </div>
      </Modal>

      {/* ── MODAL REGISTRAR VEHÍCULO ── */}
      <Modal open={openModal === "ingreso"} onClose={() => setOpenModal(null)}>
        <ModalHeader eyebrow={`Celda ${celdaActiva?.numero ?? ""}`} title="Registrar Vehículo" icon={<Car size={18} color={C.primary} />} onClose={() => setOpenModal(null)} />
        <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Placa *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={vehiculoForm.placa} onChange={e => setVehiculoForm(p => ({ ...p, placa: e.target.value.toUpperCase() }))} placeholder="ABC123" maxLength={7} style={{ flex: 1, padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "monospace", fontWeight: 700, background: "#F8FAFC" }} />
              <button onClick={() => { setScannerOrigin("ingreso"); setOpenModal("scanner"); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 14px", borderRadius: 11, border: "none", background: C.text, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}><Camera size={14} />OCR</button>
            </div>
            {placaError && <p style={{ fontSize: 11, color: C.danger, marginTop: 6, fontWeight: 700 }}>{placaError}</p>}
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Conductor *</label>
            <input list="drivers" value={vehiculoForm.conductor} onChange={e => setVehiculoForm(p => ({ ...p, conductor: e.target.value }))} placeholder="Nombre completo" style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.border}`, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC" }} />
            <datalist id="drivers">{CONDUCTORES_SUGERIDOS.map(c => <option key={c} value={c} />)}</datalist>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#F8FAFC", cursor: "pointer" }}>
            <input type="checkbox" checked={vehiculoForm.esOficial} onChange={e => setVehiculoForm(p => ({ ...p, esOficial: e.target.checked }))} style={{ width: 16, height: 16, accentColor: C.primary }} />
            <div><div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>Oficial SENA</div><div style={{ fontSize: 10, color: C.textLight }}>Vehículo institucional</div></div>
          </label>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
            <button onClick={handleToggleReserva} style={{ width: "100%", padding: "10px", borderRadius: 11, border: `1px dashed ${C.amberBg}`, background: C.amberBg, color: "#92400E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🔒 Reservar esta celda</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "1rem 1.8rem", borderTop: `1px solid ${C.border}`, flexWrap: "wrap" }}>
          <button onClick={() => setOpenModal(null)} style={{ padding: "10px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button disabled={!vehiculoForm.placa.trim() || !vehiculoForm.conductor.trim()} onClick={registrarVehiculo}
            style={{ padding: "10px 24px", borderRadius: 12, border: "none", background: vehiculoForm.placa.trim() && vehiculoForm.conductor.trim() ? C.primary : "#E2E8F0", color: vehiculoForm.placa.trim() && vehiculoForm.conductor.trim() ? "#fff" : C.textLight, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: vehiculoForm.placa.trim() && vehiculoForm.conductor.trim() ? "0 6px 18px rgba(57,169,0,.22)" : undefined }}>
            Registrar Vehículo
          </button>
        </div>
      </Modal>

      {/* ── MODAL INFO CELDA ── */}
      <Modal open={openModal === "info"} onClose={() => setOpenModal(null)} maxWidth={480}>
        <div style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDark})`, borderRadius: "24px 24px 0 0", padding: "1.6rem 1.8rem", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.07)", top: -80, right: -60 }} />
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,.18)", display: "flex", alignItems: "center", justifyContent: "center" }}><Car size={24} /></div>
            <button onClick={() => setOpenModal(null)} style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,.15)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "rgba(255,255,255,.7)", textTransform: "uppercase" }}>Celda {celdaActiva?.numero}</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, lineHeight: 1, marginTop: 2 }}>{celdaActiva?.estado === "no_disponible" && ocupanteActivo ? ocupanteActivo.vehiculo.placa : celdaActiva?.estado === "reservada" ? "Reservada" : "Celda Libre"}</h2>
            {celdaActiva?.estado === "no_disponible" && ocupanteActivo && <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 4 }}>{ocupanteActivo.conductor?.nombre || "—"}</p>}
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>{celdaActiva && <EstadoBadge estado={celdaActiva.estado} />}{celdaActiva && <TipoBadge tipo={celdaActiva.tipo} />}</div>
          </div>
        </div>
        <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 10 }}>
          {celdaActiva?.estado === "reservada" ? (
            <>
              <div style={{ padding: "12px 14px", borderRadius: 11, background: C.amberBg, border: `1px solid ${C.amberBg}`, fontSize: 12, color: "#92400E", fontWeight: 600 }}>Celda reservada para uso institucional.</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={handleToggleReserva} style={{ flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: C.text }}>🔓 Liberar Reserva</button>
                <button onClick={() => { setVehiculoForm({ placa: "", conductor: "", esOficial: true }); setOpenModal("ingreso"); }} style={{ flex: 1, padding: "10px", borderRadius: 11, border: "none", background: C.text, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Estacionar Oficial</button>
              </div>
            </>
          ) : celdaActiva?.estado === "no_disponible" && ocupanteActivo ? (
            <>
              {[
                { icon: Car,    label: "Placa",        value: <span style={{ fontFamily: "monospace", fontWeight: 900 }}>{ocupanteActivo.vehiculo.placa}{ocupanteActivo.esOficial && <span style={{ marginLeft: 6, fontSize: 9, background: C.primaryPale, color: C.primaryDark, padding: "1px 6px", borderRadius: 4 }}>OFICIAL</span>}</span> },
                { icon: MapPin, label: "Parqueadero",  value: parqueaderoActivo?.nombre },
                { icon: Clock,  label: "Ingreso",      value: `${formatearFechaHora(ocupanteActivo.fechaEntrada).fecha} ${formatearFechaHora(ocupanteActivo.fechaEntrada).hora}` },
                { icon: Clock,  label: "Estadía",      value: formatearDuracion(ocupanteActivo.fechaEntrada) },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 11, background: "#F8FAFC", border: `1px solid ${C.border}` }}>
                  <r.icon size={14} color={C.textLight} />
                  <div><div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: .5 }}>{r.label}</div><div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.value}</div></div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, paddingTop: 4, flexWrap: "wrap" }}>
                <button onClick={handleRequestLiberar} style={{ flex: 1, padding: "10px", borderRadius: 11, border: "none", background: C.danger, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(239,68,68,.25)" }}>Liberar Celda</button>
                <button 
                  onClick={() => setOpenModal("incidente")}
                  style={{ flex: 1, padding: "10px", borderRadius: 11, border: `2px solid ${C.primary}`, background: "transparent", color: C.primary, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}
                >
                  <AlertTriangle size={14} style={{ marginRight: 4 }} />
                  Reportar Incidente
                </button>
              </div>
            </>
          ) : celdaActiva?.estado === "disponible" ? (
            <>
              <div style={{ padding: "12px 14px", borderRadius: 11, background: C.primaryPale, border: `1px solid ${C.primaryLight}`, fontSize: 12, color: C.primaryDark, fontWeight: 600 }}>
                ✅ Celda disponible para estacionar.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => { setVehiculoForm({ placa: "", conductor: "", esOficial: false }); setOpenModal("ingreso"); }} style={{ flex: 1, padding: "10px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(57,169,0,.25)" }}>Estacionar Vehículo</button>
                <button 
                  onClick={() => {
                    if (celdaActiva) {
                      openReservaFromCelda(celdaActiva);
                      setOpenModal(null);
                    }
                  }} 
                  style={{ flex: 1, padding: "10px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", color: C.text }}
                >
                  📅 Reservar Celda
                </button>
              </div>
            </>
          ) : null}
        </div>
      </Modal>

      {/* ── MODAL RESERVA ── */}
      <Modal open={openModal === "reserva"} onClose={() => setOpenModal(null)} maxWidth={680}>
        <div>
          <div
            style={{
              padding: "1.4rem 1.8rem",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "rgba(57,169,0,.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Calendar size={18} color={C.primary} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>
                  Reserva de celda
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                  Reservar Celda {celdaActiva?.numero || ""}
                </h2>
              </div>
            </div>
            <button
              onClick={() => setOpenModal(null)}
              aria-label="Cerrar"
              style={{
                width: 34, height: 34, borderRadius: 9,
                border: `1px solid ${C.border}`,
                background: "#fff", cursor: "pointer", color: C.textLight,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: "1.4rem 1.8rem", maxHeight: "65vh", overflowY: "auto" }}>
            {reservaError && <Banner tone="danger" message={reservaError} />}
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="vehiculoReserva" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Vehículo *
                </label>
                <select
                  id="vehiculoReserva"
                  value={reservaForm.vehiculoId}
                  onChange={(e) => setReservaForm(prev => ({ ...prev, vehiculoId: e.target.value }))}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                >
                  <option value="">Seleccionar vehículo...</option>
                  {vehiculos.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.placa} — {v.marca} {v.modelo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="fechaReserva" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Fecha de reserva *
                </label>
                <input
                  id="fechaReserva"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={reservaForm.fechaReserva}
                  onChange={(e) => setReservaForm(prev => ({ ...prev, fechaReserva: e.target.value }))}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                />
              </div>

              <div>
                <label htmlFor="horaInicioReserva" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Hora de inicio *
                </label>
                <input
                  id="horaInicioReserva"
                  type="time"
                  value={reservaForm.horaInicio}
                  onChange={(e) => setReservaForm(prev => ({ ...prev, horaInicio: e.target.value }))}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                />
              </div>

              <div>
                <label htmlFor="horaFinReserva" style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                  Hora de fin *
                </label>
                <input
                  id="horaFinReserva"
                  type="time"
                  value={reservaForm.horaFin}
                  onChange={(e) => setReservaForm(prev => ({ ...prev, horaFin: e.target.value }))}
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 11,
                    border: `1px solid ${C.border}`, fontSize: 13, outline: "none",
                    fontFamily: "inherit", background: "#F8FAFC",
                  }}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 12px", borderRadius: 11,
                  background: "#F8FAFC", border: `1px solid ${C.border}`,
                }}>
                  <MapPin size={14} color={C.primary} />
                  <span style={{ fontSize: 12, color: C.text }}>
                    Reservando para: <strong>Celda {celdaActiva?.numero}</strong> · 
                    {parqueaderoActivo && ` ${parqueaderoActivo.nombre}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "1rem 1.8rem",
              borderTop: `1px solid ${C.border}`,
              display: "flex", gap: 10, justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => setOpenModal(null)}
              style={{
                padding: "10px 20px", borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: "#fff", color: C.text,
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleCrearReserva}
              disabled={!reservaForm.vehiculoId || !reservaForm.fechaReserva || !reservaForm.horaInicio || !reservaForm.horaFin}
              style={{
                padding: "10px 24px", borderRadius: 12,
                border: "none", 
                background: reservaForm.vehiculoId && reservaForm.fechaReserva && reservaForm.horaInicio && reservaForm.horaFin 
                  ? C.primary 
                  : "#E2E8F0",
                color: reservaForm.vehiculoId && reservaForm.fechaReserva && reservaForm.horaInicio && reservaForm.horaFin 
                  ? "#fff" 
                  : C.textLight,
                fontSize: 13, fontWeight: 800, 
                cursor: reservaForm.vehiculoId && reservaForm.fechaReserva && reservaForm.horaInicio && reservaForm.horaFin 
                  ? "pointer" 
                  : "not-allowed",
                fontFamily: "inherit",
                boxShadow: reservaForm.vehiculoId && reservaForm.fechaReserva && reservaForm.horaInicio && reservaForm.horaFin 
                  ? "0 6px 18px rgba(57,169,0,.22)" 
                  : undefined,
              }}
            >
              📅 Crear Reserva
            </button>
          </div>
        </div>
      </Modal>

      {/* ── MODAL INCIDENTE (con evidencia) ── */}
      <Modal open={openModal === "incidente"} onClose={() => setOpenModal(null)} maxWidth={520}>
        <ModalHeader 
          eyebrow={`Celda ${celdaActiva?.numero ?? ""} · ${ocupanteActivo?.vehiculo.placa || ""}`} 
          title="Registrar Incidente" 
          icon={<AlertTriangle size={18} color={C.primary} />}
          onClose={() => setOpenModal(null)} 
        />
        <div style={{ padding: "1.4rem 1.8rem", display: "flex", flexDirection: "column", gap: 14 }}>
          {incidenteError && <Banner tone="danger" message={incidenteError} />}
          
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Descripción del incidente *</label>
            <textarea
              rows={3}
              value={incidenteForm.descripcion}
              onChange={(e) => setIncidenteForm(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe el incidente o novedad en la celda..."
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 11,
                border: `1px solid ${C.border}`,
                fontSize: 13,
                fontFamily: "inherit",
                background: "#F8FAFC",
                resize: "vertical",
                minHeight: 80,
                outline: "none",
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Asignar a (opcional)</label>
            <input
              type="text"
              value={incidenteForm.asignadoA}
              onChange={(e) => setIncidenteForm(prev => ({ ...prev, asignadoA: e.target.value }))}
              placeholder="Nombre del responsable"
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 11,
                border: `1px solid ${C.border}`,
                fontSize: 13,
                fontFamily: "inherit",
                background: "#F8FAFC",
                outline: "none",
              }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>Notas de resolución (opcional)</label>
            <textarea
              rows={2}
              value={incidenteForm.notasResolucion}
              onChange={(e) => setIncidenteForm(prev => ({ ...prev, notasResolucion: e.target.value }))}
              placeholder="¿Qué acciones se deben tomar o se tomaron?"
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 11,
                border: `1px solid ${C.border}`,
                fontSize: 13,
                fontFamily: "inherit",
                background: "#F8FAFC",
                resize: "vertical",
                outline: "none",
              }}
            />
          </div>

          {/* Evidencia fotográfica */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6 }}>
              Evidencia fotográfica (opcional)
            </label>
            <div style={{
              borderRadius: 11, border: `2px dashed ${C.border}`,
              background: "#F8FAFC", overflow: "hidden",
              transition: "border-color .2s",
            }}>
              <input
                type="file"
                id="evidenciaIncidente"
                accept="image/*"
                onChange={handleIncidenteFileChange}
                style={{ display: "none" }}
              />
              {incidenteForm.evidencia ? (
                <div style={{ padding: "12px", textAlign: "center", position: "relative" }}>
                  <button
                    onClick={removeIncidenteEvidencia}
                    aria-label="Quitar evidencia"
                    style={{
                      position: "absolute", top: 8, right: 8,
                      width: 24, height: 24, borderRadius: 7,
                      border: "none", background: "rgba(15,23,42,.55)",
                      color: "#fff", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X size={13} />
                  </button>
                  <img
                    src={incidenteForm.evidencia}
                    alt="Evidencia del incidente"
                    style={{ maxHeight: 120, margin: "0 auto", borderRadius: 8 }}
                  />
                  <p style={{ fontSize: 11, color: C.primary, marginTop: 8 }}>Evidencia cargada ✓</p>
                </div>
              ) : (
                <label htmlFor="evidenciaIncidente" style={{ cursor: "pointer", display: "block" }}>
                  <div style={{ padding: "16px", textAlign: "center" }}>
                    <Upload size={32} color={C.textLight} style={{ margin: "0 auto 8px" }} />
                    <p style={{ fontSize: 12, color: C.textLight }}>Toca para cargar imagen de evidencia</p>
                    <p style={{ fontSize: 10, color: C.textLight, marginTop: 4 }}>Formatos: JPG, PNG, GIF</p>
                  </div>
                </label>
              )}
            </div>
          </div>
          
          <div style={{ fontSize: 12, color: C.textLight, background: C.bg, padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: C.text }}>Información automática:</div>
            <div>Vehículo: <strong>{ocupanteActivo?.vehiculo.placa || "No registrado"}</strong></div>
            <div>Conductor: <strong>{ocupanteActivo?.conductor?.nombre || "No registrado"}</strong></div>
            <div>Parqueadero: <strong>{parqueaderoActivo?.nombre || "No registrado"}</strong></div>
            <div>Celda: <strong>{celdaActiva?.numero || "No registrada"}</strong></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "1rem 1.8rem", borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => { setOpenModal(null); setIncidenteError(null); setIncidenteForm(prev => ({ ...prev, evidencia: '' })); }} style={{ padding: "10px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "#fff", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
          <button
            onClick={registrarIncidente}
            style={{
              padding: "10px 24px",
              borderRadius: 12,
              border: "none",
              background: incidenteForm.descripcion.trim() ? C.primary : "#E2E8F0",
              color: incidenteForm.descripcion.trim() ? "#fff" : C.textLight,
              fontSize: 13,
              fontWeight: 800,
              cursor: incidenteForm.descripcion.trim() ? "pointer" : "not-allowed",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: incidenteForm.descripcion.trim() ? "0 6px 18px rgba(57,169,0,.22)" : undefined,
            }}
          >
            <FileText size={16} />
            Registrar Incidente
          </button>
        </div>
      </Modal>

      {/* ── MODAL ESCÁNER OCR ── */}
      <Modal open={openModal === "scanner"} onClose={cerrarScanner} maxWidth={440}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.4rem 1.8rem", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: C.primaryPale, display: "flex", alignItems: "center", justifyContent: "center" }}><ScanLine size={18} color={C.primary} /></div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: C.primary, textTransform: "uppercase" }}>Reconocimiento Óptico</div>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, lineHeight: 1, margin: 0 }}>Escanear Placa</h2>
            </div>
          </div>
          <button onClick={cerrarScanner} style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${C.border}`, background: "#fff", cursor: "pointer", color: C.textLight, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
        </div>
        <div style={{ position: "relative", background: "#000", aspectRatio: "4/3", maxHeight: 320, overflow: "hidden" }}>
          <video ref={videoRef} autoPlay playsInline muted onLoadedMetadata={() => setCamaraLista(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: "78%", maxWidth: 300, aspectRatio: "3/1", border: `3px solid ${C.primary}`, borderRadius: 10, boxShadow: `0 0 0 9999px rgba(15,23,42,.65)` }} />
          </div>
          {!camaraLista && !ocrError && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(15,23,42,.9)", color: "#fff" }}><Loader2 size={28} color={C.primary} style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 12, fontWeight: 700 }}>Iniciando cámara...</span></div>}
          {ocrLoading && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,.85)", color: "#fff" }}><Loader2 size={28} color={C.primary} style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 12, fontWeight: 700, marginTop: 8 }}>Analizando matrícula...</span></div>}
          {ocrFlash && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(57,169,0,.9)", color: "#fff" }}><CheckCircle2 size={36} /><span style={{ fontSize: 13, fontWeight: 800, marginTop: 8 }}>¡Detectada!</span></div>}
        </div>
        {ocrError && <div style={{ padding: "12px 1.8rem", background: C.dangerBg, borderBottom: `1px solid ${C.dangerBorder}` }}><Banner tone="danger" message={ocrError} /></div>}
        <div style={{ padding: "1rem 1.8rem", display: "flex", flexDirection: "column", gap: 12, background: "#F8FAFC", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 11, border: `1px solid ${C.border}`, background: "#fff", fontSize: 12, fontWeight: 700, color: C.textLight, cursor: "pointer" }}>
              <Upload size={14} />Cargar foto<input type="file" accept="image/*" onChange={handleFileOCR} style={{ display: "none" }} />
            </label>
            <button onClick={handleCaptureOcr} disabled={ocrLoading || !camaraLista} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 11, border: "none", background: C.primary, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(57,169,0,.25)" }}>
              <Camera size={15} />Capturar
            </button>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: C.textLight, textTransform: "uppercase", letterSpacing: .5, marginBottom: 8 }}>Matrículas de prueba</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {PLACAS_DEMO.map(d => (
                <button key={d.placa} onClick={() => handleSimOCR(d.placa, d.conductor, d.rol)} disabled={ocrLoading}
                  style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "#fff", fontSize: 11, fontWeight: 700, color: C.text, cursor: "pointer", fontFamily: "monospace" }}>
                  {d.placa} <span style={{ fontFamily: "sans-serif", color: C.textLight, fontSize: 9 }}>({d.rol})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </Modal>

      {/* ── SMART ASSIGN MODAL ── */}
      <SmartAssignModal open={openModal === "smartAssign"} parqueaderos={parqueaderos} celdas={celdas} onClose={() => { setOpenModal(null); setScannedPlate(undefined); setScannerOrigin(null); }} onAssign={handleSmartAssign} openScanner={() => { setScannerOrigin("smartAssign"); setOpenModal("scanner"); }} scannedPlate={scannedPlate} />

      {/* ── CONFIRM DIALOGS ── */}
      <ConfirmDialog open={openModal === "confirmDelete"} onConfirm={handleDelete} onCancel={() => { setOpenModal(null); setPqDeleteId(null); }} title="Eliminar Parqueadero" message="¿Estás seguro de eliminar este parqueadero? Se perderán todas sus celdas y los registros de entrada/salida asociados." confirmLabel="Eliminar" />
    </>
  );
}