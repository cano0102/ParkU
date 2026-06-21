import React, {
  useEffect,
  useMemo,
  useRef,
  useReducer,
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
  Navigation,
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
  Filter,
  History,
  Download,
  Upload,
  Info,
  RotateCcw,
  BookOpen,
  Eye,
  Sparkles,
  MapPin,
} from "lucide-react";
import { createWorker } from "tesseract.js";

/* ============================================================
   PALETA — idéntica al módulo Reservas
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
};

/* ============================================================
   TIPOS
============================================================ */
export type CeldaEstado = "libre" | "ocupado" | "sena";

export interface Celda {
  codigo: string;
  estado: CeldaEstado;
  placa?: string;
  conductor?: string;
  fechaIngreso?: string;
  horaIngreso?: string;
  timestampIngreso?: number;
  esOficial?: boolean;
}

export interface Parqueadero {
  id: number;
  nombre: string;
  total: number;
  celdas: Celda[];
  bloque: string;
  tipo: "General" | "Motos" | "Visitantes" | "Docentes" | "Administrativos";
}

export interface TicketSalida {
  id: string;
  placa: string;
  conductor: string;
  parqueaderoNombre: string;
  bloque: string;
  celdaCodigo: string;
  fechaIngreso: string;
  horaIngreso: string;
  timestampIngreso: number;
  fechaSalida: string;
  horaSalida: string;
  timestampSalida: number;
  duracionMinutos: number;
  esOficial: boolean;
}

export interface FormParqueadero {
  nombre: string;
  total: number;
  bloque: string;
  tipo: Parqueadero["tipo"];
}

export interface VehiculoForm {
  placa: string;
  conductor: string;
  esOficial: boolean;
}

export interface ToastItem {
  id: number;
  tone: "success" | "danger" | "info";
  message: string;
}

export interface State {
  parqueaderos: Parqueadero[];
  historial: TicketSalida[];
  toasts: ToastItem[];
}

export type Action =
  | { type: "INITIALIZE"; parqueaderos: Parqueadero[]; historial: TicketSalida[] }
  | { type: "CREATE_PARQUEADERO"; parqueadero: Parqueadero }
  | { type: "EDIT_PARQUEADERO"; id: number; nombre: string; tipo: Parqueadero["tipo"]; bloque: string; total: number }
  | { type: "DELETE_PARQUEADERO"; id: number }
  | { type: "REGISTRAR_VEHICULO"; parqueaderoId: number; codigo: string; placa: string; conductor: string; esOficial: boolean }
  | { type: "EDITAR_VEHICULO"; parqueaderoId: number; codigo: string; placa: string; conductor: string; esOficial: boolean }
  | { type: "LIBERAR_CELDA_DIRECTO"; parqueaderoId: number; codigo: string; ticket: TicketSalida }
  | { type: "TOGGLE_RESERVA_SENA"; parqueaderoId: number; codigo: string }
  | { type: "CLEAR_HISTORIAL" }
  | { type: "IMPORT_STATE"; parqueaderos: Parqueadero[]; historial: TicketSalida[] }
  | { type: "ADD_TOAST"; tone: "success" | "danger" | "info"; message: string }
  | { type: "DISMISS_TOAST"; id: number };

export interface CeldaPos extends Celda { x: number; y: number; }
export interface FilaLayout { celdas: CeldaPos[]; esCarril: boolean; y: number; }
export interface LotLayout {
  pq: Parqueadero; filas: FilaLayout[]; lotTop: number; lotHeight: number;
  ancho: number; celdasPorFila: number; libres: number; ocupados: number;
  senaCount: number; pct: number;
}

/* ============================================================
   CONSTANTES
============================================================ */
export const LOCAL_STORAGE_KEY = "sena_parq_datos_v7";
export const HISTORIAL_STORAGE_KEY = "sena_parq_hist_v7";

export const CELDA_CONFIG = {
  libre:   { bg:"#F0FBE8", border:"#A8D888", text:"#2F6B00", label:"Disponible",      dotColor:"#4CAF50", mapFill:"#1f2a22", mapStroke:"#4CAF50" },
  ocupado: { bg:"#1A1A1A", border:"#EF4444", text:"#ffffff", label:"Ocupado",         dotColor:"#EF4444", mapFill:"#2c1414", mapStroke:"#EF4444" },
  sena:    { bg:"#FFFBEB", border:"#FCD34D", text:"#78350F", label:"Reservado SENA",  dotColor:"#F59E0B", mapFill:"#332a10", mapStroke:"#F59E0B" },
};

export const TIPOS_PARQUEADERO = ["General","Motos","Visitantes","Docentes","Administrativos"] as const;

export const CONDUCTORES_SUGERIDOS = [
  "Andrés Felipe Montoya","Claudia Patricia Restrepo","Juan Carlos Gómez",
  "María Camila Torres","Diego Alejandro Castro","Sofía Elena Herrera",
  "Luis Fernando Díaz","Paula Andrea Luna",
];

export const PLACAS_DEMO = [
  { placa:"KLO234", conductor:"Carlos Mario Ruiz",      tipo:"Carro", rol:"Docente" },
  { placa:"MHX75E", conductor:"Liliana Patricia Castro", tipo:"Moto",  rol:"Estudiante" },
  { placa:"SNA012", conductor:"Oficial CEET SENA",       tipo:"Carro", rol:"Oficial" },
  { placa:"VIP789", conductor:"Héctor Fabio Jurado",     tipo:"Carro", rol:"Visitante" },
];

/* SVG medidas */
const SPACE_W=46,SPACE_H=28,GAP_X=4,ROW_GAP=6,LANE_H=40,PADDING=50,
      SECTION_GAP=45,ROAD_Y=16,ROAD_H=38,HEADER_BLOCK=58;

/* ============================================================
   UTILS
============================================================ */
export const PLACA_REGEX = /^[A-Z]{3}\d{2,3}[A-Z0-9]?$/;
export const validarPlacaColombiana = (p:string) => PLACA_REGEX.test(p.trim().toUpperCase());

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
export const formatearFechaHora=(ts:number)=>{
  const d=new Date(ts);
  return { fechaIngreso:d.toLocaleDateString("es-CO"), horaIngreso:d.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}) };
};
export const formatearDuracion=(ts:number)=>{
  const m=Math.max(0,Math.floor((Date.now()-ts)/60000));
  const h=Math.floor(m/60); const min=m%60;
  return h>0?`${h}h ${min}m`:`${min}m`;
};
export const regenerarCeldas=(bloque:string,total:number,anteriores:Celda[]=[]):Celda[]=>
  Array.from({length:total},(_,i)=>{
    const codigo=`${bloque.toUpperCase()}${String(i+1).padStart(2,"0")}`;
    const p=anteriores.find(c=>c.codigo===codigo)||anteriores[i];
    return p?{...p,codigo}:{codigo,estado:"libre" as CeldaEstado};
  });
export const celdasComprometidasAlReducir=(celdas:Celda[],nuevoTotal:number)=>
  celdas.slice(nuevoTotal).filter(c=>c.estado!=="libre");
export const crearCeldasIniciales=(
  bloque:string, total:number,
  ocupadas:Record<number,{placa:string;conductor:string;esOficial?:boolean}>,
  senas:number[]
):Celda[]=>{
  return Array.from({length:total},(_,i)=>{
    const num=i+1;
    const codigo=`${bloque}${String(num).padStart(2,"0")}`;
    if(ocupadas[num]){
      const {placa,conductor,esOficial}=ocupadas[num];
      const ts=Date.now()-1000*60*(num*30+15);
      return {codigo,estado:"ocupado" as CeldaEstado,placa,conductor,esOficial:!!esOficial,timestampIngreso:ts,...formatearFechaHora(ts)};
    }
    return {codigo,estado:(senas.includes(num)?"sena":"libre") as CeldaEstado};
  });
};

/* ============================================================
   DATOS INICIALES
============================================================ */
export const initialParqueaderos: Parqueadero[] = [
  { id:1, nombre:"CARRIL 01 — ADMINISTRACIÓN", bloque:"A", tipo:"Administrativos", total:10,
    celdas:crearCeldasIniciales("A",10,{2:{placa:"FGH456",conductor:"Andrés Felipe Montoya"},5:{placa:"SNA911",conductor:"Instructor Carlos Mario",esOficial:true}},[3,7]) },
  { id:2, nombre:"CARRIL 02 — ZONA MOTOS", bloque:"M", tipo:"Motos", total:12,
    celdas:crearCeldasIniciales("M",12,{2:{placa:"XYZ56D",conductor:"María Camila Torres"},5:{placa:"KLT92C",conductor:"Diego Alejandro Castro"}},[6]) },
  { id:3, nombre:"CARRIL 03 — DOCENTES Y VISITAS", bloque:"D", tipo:"Docentes", total:8,
    celdas:crearCeldasIniciales("D",8,{1:{placa:"JDK221",conductor:"Claudia Patricia Restrepo"},5:{placa:"VIP002",conductor:"Paula Andrea Luna"}},[4]) },
];

export const loadParqueaderos=():Parqueadero[]=>{ try{ const s=localStorage.getItem(LOCAL_STORAGE_KEY); return s?JSON.parse(s):initialParqueaderos; }catch{ return initialParqueaderos; } };
export const loadHistorial=():TicketSalida[]=>{ try{ const s=localStorage.getItem(HISTORIAL_STORAGE_KEY); return s?JSON.parse(s):[]; }catch{ return []; } };

/* ============================================================
   REDUCER
============================================================ */
let toastSeq=1;
export function rootReducer(state:State,action:Action):State{
  switch(action.type){
    case "INITIALIZE": return {...state,parqueaderos:action.parqueaderos,historial:action.historial};
    case "CREATE_PARQUEADERO":{ const u=[...state.parqueaderos,action.parqueadero]; localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(u)); return {...state,parqueaderos:u,toasts:[...state.toasts,{id:toastSeq++,tone:"success",message:`Parqueadero "${action.parqueadero.nombre}" creado.`}]}; }
    case "EDIT_PARQUEADERO":{ const u=state.parqueaderos.map(p=>p.id!==action.id?p:{...p,nombre:action.nombre,tipo:action.tipo,bloque:action.bloque.toUpperCase(),total:action.total,celdas:regenerarCeldas(action.bloque,action.total,p.celdas)}); localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(u)); return {...state,parqueaderos:u,toasts:[...state.toasts,{id:toastSeq++,tone:"success",message:"Parqueadero actualizado."}]}; }
    case "DELETE_PARQUEADERO":{ const u=state.parqueaderos.filter(p=>p.id!==action.id); localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(u)); return {...state,parqueaderos:u,toasts:[...state.toasts,{id:toastSeq++,tone:"info",message:"Parqueadero eliminado."}]}; }
    case "REGISTRAR_VEHICULO":{ const obj=state.parqueaderos.find(p=>p.id===action.parqueaderoId)?.celdas.find(c=>c.codigo===action.codigo); if(!obj||obj.estado==="ocupado") return state; const now=Date.now(); const fh=formatearFechaHora(now); const u=state.parqueaderos.map(p=>p.id!==action.parqueaderoId?p:{...p,celdas:p.celdas.map(c=>c.codigo!==action.codigo?c:{...c,estado:"ocupado" as CeldaEstado,placa:action.placa,conductor:action.conductor,...fh,timestampIngreso:now,esOficial:action.esOficial})}); localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(u)); return {...state,parqueaderos:u,toasts:[...state.toasts,{id:toastSeq++,tone:"success",message:`Vehículo ${action.placa} registrado.`}]}; }
    case "EDITAR_VEHICULO":{ const u=state.parqueaderos.map(p=>p.id!==action.parqueaderoId?p:{...p,celdas:p.celdas.map(c=>c.codigo!==action.codigo?c:{...c,placa:action.placa,conductor:action.conductor,esOficial:action.esOficial})}); localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(u)); return {...state,parqueaderos:u,toasts:[...state.toasts,{id:toastSeq++,tone:"success",message:"Datos actualizados."}]}; }
    case "LIBERAR_CELDA_DIRECTO":{ const u=state.parqueaderos.map(p=>p.id!==action.parqueaderoId?p:{...p,celdas:p.celdas.map(c=>c.codigo!==action.codigo?c:{codigo:c.codigo,estado:"libre" as CeldaEstado})}); const h=[action.ticket,...state.historial]; localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(u)); localStorage.setItem(HISTORIAL_STORAGE_KEY,JSON.stringify(h)); return {...state,parqueaderos:u,historial:h,toasts:[...state.toasts,{id:toastSeq++,tone:"info",message:`Celda ${action.codigo} liberada.`}]}; }
    case "TOGGLE_RESERVA_SENA":{ const u=state.parqueaderos.map(p=>p.id!==action.parqueaderoId?p:{...p,celdas:p.celdas.map(c=>c.codigo!==action.codigo?c:{codigo:c.codigo,estado:(c.estado==="sena"?"libre":"sena") as CeldaEstado})}); localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(u)); return {...state,parqueaderos:u,toasts:[...state.toasts,{id:toastSeq++,tone:"info",message:"Estado reconfigurado."}]}; }
    case "CLEAR_HISTORIAL":{ localStorage.removeItem(HISTORIAL_STORAGE_KEY); return {...state,historial:[],toasts:[...state.toasts,{id:toastSeq++,tone:"info",message:"Historial vaciado."}]}; }
    case "IMPORT_STATE":{ localStorage.setItem(LOCAL_STORAGE_KEY,JSON.stringify(action.parqueaderos)); localStorage.setItem(HISTORIAL_STORAGE_KEY,JSON.stringify(action.historial)); return {...state,parqueaderos:action.parqueaderos,historial:action.historial,toasts:[...state.toasts,{id:toastSeq++,tone:"success",message:"Copia restaurada."}]}; }
    case "ADD_TOAST": return {...state,toasts:[...state.toasts,{id:toastSeq++,tone:action.tone,message:action.message}]};
    case "DISMISS_TOAST": return {...state,toasts:state.toasts.filter(t=>t.id!==action.id)};
    default: return state;
  }
}

/* ============================================================
   OCR
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
export function extraerDatosDocumento(texto:string){
  const limpio=texto.replace(/\r/g,"").replace(/\t/g," ");
  const lineas=limpio.split("\n").map(l=>l.trim()).filter(Boolean);
  const mayus=limpio.toUpperCase();
  const esTarjeta=/TARJETA\s*DE\s*PROPIEDAD|PROPIETARIO|LICENCIA\s*DE\s*TR[AÁ]NSITO|MINTRANSPORTE|RUNT/.test(mayus);
  let placa="";
  const idx=lineas.findIndex(l=>/PLACA/i.test(l));
  if(idx!==-1){ const ctx=`${lineas[idx]} ${lineas[idx+1]||""}`; placa=limpiarTextoOCR(ctx.replace(/PLACA/gi," ")); }
  if(!placa||!validarPlacaColombiana(placa)) placa=limpiarTextoOCR(mayus);
  let conductor="";
  const idxP=lineas.findIndex(l=>/PROPIETARIO|NOMBRE\s*Y\s*APELLIDOS|NOMBRE\s*DEL\s*PROPIETARIO/i.test(l));
  if(idxP!==-1){ const ml=lineas[idxP].split(/[:#-]/).slice(1).join(" ").trim(); const cand=ml&&/[A-ZÁÉÍÓÚÑ]{3,}/.test(ml)?ml:lineas[idxP+1]||""; conductor=cand.replace(/[^A-ZÁÉÍÓÚÑ\s]/gi," ").replace(/\s+/g," ").trim(); }
  const modelo=limpio.match(/\b(19|20)\d{2}\b/)?.[0]||"";
  const servicio=mayus.includes("PARTICULAR")?"PARTICULAR":mayus.includes("PUBLICO")||mayus.includes("PÚBLICO")?"PUBLICO":"";
  const color=mayus.match(/(BLANCO|NEGRO|GRIS|ROJO|AZUL|VERDE|PLATA|AMARILLO|NARANJA)/)?.[0]||"";
  return { placa, conductor:normalizarTexto(conductor,60), modelo, servicio, color, esTarjetaPropiedad:esTarjeta, textoCompleto:limpio };
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
   COMPONENTES UI BASE — estilo Reservas
============================================================ */

/* Modal */
const Modal=memo(({open,onClose,children,maxWidth=680}:{open:boolean;onClose:()=>void;children:React.ReactNode;maxWidth?:number})=>{
  useEffect(()=>{ if(!open) return; const h=(e:KeyboardEvent)=>{ if(e.key==="Escape") onClose(); }; window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[open,onClose]);
  if(!open) return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",background:"rgba(15,23,42,.45)",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div role="dialog" aria-modal="true"
        style={{width:"100%",maxWidth,maxHeight:"92vh",overflowY:"auto",borderRadius:24,background:"#fff",border:`1px solid ${C.border}`,boxShadow:"0 20px 55px rgba(15,23,42,.12)",animation:"modalIn .18s ease"}}
        onClick={e=>e.stopPropagation()}>
        {children}
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
});
Modal.displayName="Modal";

/* Modal header */
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

/* Confirm dialog */
const ConfirmDialog=memo(({open,onConfirm,onCancel,title,message,confirmLabel="Confirmar",tone="danger"}:{open:boolean;onConfirm:()=>void;onCancel:()=>void;title:string;message:string;confirmLabel?:string;tone?:"danger"|"success"|"info"})=>{
  if(!open) return null;
  const btnBg=tone==="danger"?C.danger:C.primary;
  return(
    <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",background:"rgba(15,23,42,.45)",backdropFilter:"blur(4px)"}} onClick={onCancel}>
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

/* Toast stack */
const ToastStack=memo(({toasts,onDismiss}:{toasts:ToastItem[];onDismiss:(id:number)=>void})=>{
  if(!toasts.length) return null;
  const tone={
    success:{bg:"#16290a",border:"#2D7D00",text:"#EAF7E6"},
    danger:{bg:"#3a1414",border:"#b13434",text:"#ffd0d0"},
    info:{bg:"#10202f",border:"#2c5c82",text:"#bfe1ff"},
  };
  return(
    <div style={{position:"fixed",bottom:16,right:16,zIndex:3000,display:"flex",flexDirection:"column",gap:8,width:"min(380px,calc(100vw - 32px))",pointerEvents:"none"}}>
      {toasts.map(t=>{
        const s=tone[t.tone];
        return(
          <div key={t.id} style={{pointerEvents:"auto",display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:14,border:`1px solid ${s.border}`,background:s.bg,color:s.text,boxShadow:"0 10px 30px rgba(0,0,0,.25)",fontFamily:"inherit"}}>
            {t.tone==="success"?<CheckCircle2 size={16} color={C.primaryLight}/>:<AlertCircle size={16}/>}
            <span style={{flex:1,fontSize:12,fontWeight:700,lineHeight:1.4}}>{t.message}</span>
            <button onClick={()=>onDismiss(t.id)} style={{background:"transparent",border:"none",color:"inherit",cursor:"pointer",opacity:.7,padding:2}}><X size={14}/></button>
          </div>
        );
      })}
    </div>
  );
});
ToastStack.displayName="ToastStack";

/* Banner */
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

/* Badge de estado */
const EstadoBadge=memo(({estado}:{estado:CeldaEstado})=>{
  const cfg=CELDA_CONFIG[estado];
  return(
    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:999,fontSize:10,fontWeight:700,background:cfg.bg,color:cfg.text,border:`1px solid ${cfg.border}`}}>
      <span style={{width:6,height:6,borderRadius:"50%",background:cfg.dotColor}}/>
      {cfg.label}
    </span>
  );
});
EstadoBadge.displayName="EstadoBadge";

/* ============================================================
   SVG — plano de parqueaderos (sin cambios funcionales)
============================================================ */
const MAP_THEME={
  asphalt:"#22262b",asphaltPanel:"#2a2f35",road:"#34393f",
  panelBorder:"rgba(255,255,255,.08)",textBright:"#f4f4f4",textDim:"rgba(244,244,244,.62)",
};

const HighFiCarSVG=memo(({x,y,w,h,placa}:{x:number;y:number;w:number;h:number;placa:string})=>{
  const color= getCarColor(placa);
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

const ParkingMap=memo(({parqueaderos,onCellClick,cellMatchesSearch}:{parqueaderos:Parqueadero[];onCellClick:(id:number,c:Celda)=>void;cellMatchesSearch:(c:Celda)=>boolean})=>{
  const [zoom,setZoom]=useState(1);
  const [pan,setPan]=useState({x:0,y:0});
  const [isDragging,setIsDragging]=useState(false);
  const [hover,setHover]=useState<{celda:Celda;pqNombre:string;tipoPq:string;clientX:number;clientY:number}|null>(null);
  const dragRef=useRef({x:0,y:0});
  const panRef=useRef({dragged:false,startX:0,startY:0});

  const lots:LotLayout[]=useMemo(()=>{
    let cy=ROAD_Y+ROAD_H+40;
    return parqueaderos.map(pq=>{
      const cpf=Math.max(4,Math.ceil(Math.sqrt(Math.max(pq.total,1)*1.6)));
      const ft=Math.max(1,Math.ceil(pq.total/cpf));
      const fps=Math.min(ft,4); const sec=Math.ceil(ft/fps);
      const filas:FilaLayout[]=[];
      let idx=0; let y=cy+HEADER_BLOCK;
      for(let s=0;s<sec;s++){
        for(let f=0;f<fps&&idx<pq.total;f++){
          const fila:CeldaPos[]=[];
          for(let c=0;c<cpf&&idx<pq.total;c++){ fila.push({...pq.celdas[idx],x:PADDING+c*(SPACE_W+GAP_X),y}); idx++; }
          filas.push({celdas:fila,esCarril:false,y}); y+=SPACE_H+ROW_GAP;
        }
        if(s<sec-1&&idx<pq.total){ filas.push({celdas:[],esCarril:true,y}); y+=LANE_H; }
      }
      const lotTop=cy,lotHeight=y-cy+16;
      const libres=pq.celdas.filter(c=>c.estado==="libre").length;
      const ocupados=pq.celdas.filter(c=>c.estado==="ocupado").length;
      const senaCount=pq.celdas.filter(c=>c.estado==="sena").length;
      const pct=pq.celdas.length?Math.round(ocupados/pq.celdas.length*100):0;
      const ancho=PADDING+cpf*(SPACE_W+GAP_X)+PADDING-20;
      cy=lotTop+lotHeight+SECTION_GAP;
      return {pq,filas,lotTop,lotHeight,ancho,celdasPorFila:cpf,libres,ocupados,senaCount,pct};
    });
  },[parqueaderos]);

  const totalW=useMemo(()=>Math.max(...lots.map(l=>l.ancho+45),600),[lots]);
  const totalH=useMemo(()=>lots.length?lots[lots.length-1].lotTop+lots[lots.length-1].lotHeight+50:ROAD_Y+ROAD_H+100,[lots]);

  const handlePD=(e:React.PointerEvent<HTMLDivElement>)=>{ if(e.button!==0) return; setIsDragging(true); panRef.current={dragged:false,startX:e.clientX,startY:e.clientY}; dragRef.current={x:e.clientX-pan.x,y:e.clientY-pan.y}; e.currentTarget.setPointerCapture(e.pointerId); };
  const handlePM=(e:React.PointerEvent<HTMLDivElement>)=>{ if(!isDragging) return; const dx=e.clientX-panRef.current.startX,dy=e.clientY-panRef.current.startY; if(Math.abs(dx)>4||Math.abs(dy)>4) panRef.current.dragged=true; setPan({x:e.clientX-dragRef.current.x,y:e.clientY-dragRef.current.y}); };
  const handlePU=(e:React.PointerEvent<HTMLDivElement>)=>{ setIsDragging(false); e.currentTarget.releasePointerCapture(e.pointerId); };
  const activate=useCallback((pqId:number,celda:Celda)=>{ if(panRef.current.dragged) return; onCellClick(pqId,celda); },[onCellClick]);

  return(
    <div style={{position:"relative",width:"100%",overflow:"hidden",borderRadius:16,border:`1px solid ${C.border}`,background:MAP_THEME.asphalt,boxShadow:"0 2px 8px rgba(15,23,42,.05)"}}>
      <div style={{position:"absolute",top:12,right:12,zIndex:10,display:"flex",flexDirection:"column",gap:6}}>
        {[{icon:<ZoomIn size={16}/>,act:()=>setZoom(z=>Math.min(2.5,z+.15))},{icon:<ZoomOut size={16}/>,act:()=>setZoom(z=>Math.max(.4,z-.15))},{icon:<Maximize2 size={15}/>,act:()=>{setZoom(1);setPan({x:0,y:0});}}].map((b,i)=>(
          <button key={i} onClick={b.act} style={{width:36,height:36,borderRadius:10,border:"1px solid rgba(255,255,255,.18)",background:"rgba(20,22,25,.75)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>{b.icon}</button>
        ))}
      </div>
      <div style={{position:"absolute",top:12,left:12,zIndex:10,width:38,height:38,borderRadius:"50%",border:"1px solid rgba(255,255,255,.18)",background:"rgba(20,22,25,.75)",display:"flex",alignItems:"center",justifyContent:"center",color:C.primaryLight}}><Navigation size={17}/></div>
      <div onPointerDown={handlePD} onPointerMove={handlePM} onPointerUp={handlePU} onPointerLeave={handlePU} style={{width:"100%",minHeight:480,overflow:"hidden",cursor:isDragging?"grabbing":"grab"}}>
        <svg viewBox={`0 0 ${totalW} ${totalH}`} style={{transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,width:totalW,height:totalH}}>
          <defs>
            <pattern id="asp" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill={MAP_THEME.asphalt}/></pattern>
            <pattern id="senaH" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill={CELDA_CONFIG.sena.mapFill}/><line x1="0" y1="0" x2="0" y2="8" stroke={CELDA_CONFIG.sena.mapStroke} strokeWidth="2.5" opacity=".6"/></pattern>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <linearGradient id="roadG" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#2D3748"/><stop offset="100%" stopColor="#1A202C"/></linearGradient>
            <linearGradient id="grassG" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#065F46"/><stop offset="100%" stopColor="#064E3B"/></linearGradient>
          </defs>
          <rect width={totalW} height={totalH} fill="url(#asp)"/>
          <rect x={10} y={10} width={36} height={totalH-20} rx="6" fill="url(#grassG)" opacity=".4"/>
          <rect x={totalW-46} y={10} width={36} height={totalH-20} rx="6" fill="url(#grassG)" opacity=".4"/>
          <rect x={PADDING-10} y={ROAD_Y} width={totalW-PADDING*2+20} height={ROAD_H} fill="url(#roadG)" rx="4"/>
          <line x1={PADDING} y1={ROAD_Y+ROAD_H/2} x2={totalW-PADDING} y2={ROAD_Y+ROAD_H/2} stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="8,8" opacity=".5"/>
          <g transform={`translate(${PADDING+10},${ROAD_Y+ROAD_H/2+3.5})`}><rect x="-8" y="-9" width="58" height="18" rx="4" fill={C.primary}/><text textAnchor="middle" x="21" y="3" fontSize="8" fontWeight="900" fill="#fff">ENTRADA</text></g>
          <g transform={`translate(${totalW-PADDING-50},${ROAD_Y+ROAD_H/2+3.5})`}><rect x="-8" y="-9" width="58" height="18" rx="4" fill={C.danger}/><text textAnchor="middle" x="21" y="3" fontSize="8" fontWeight="900" fill="#fff">SALIDA</text></g>

          {lots.map(({pq,celdasPorFila,libres,ocupados,senaCount,pct,filas,lotTop,lotHeight,ancho})=>{
            const hc=pct>=90?C.danger:pct>=50?C.amber:C.primary;
            return(
              <g key={pq.id}>
                <rect x={PADDING-20} y={lotTop-12} width={ancho-PADDING+40} height={lotHeight+12} rx="14" fill={MAP_THEME.asphaltPanel} stroke={MAP_THEME.panelBorder} strokeWidth="1.5"/>
                <rect x={PADDING-10} y={lotTop-6} width={ancho-PADDING+10} height={34} rx="8" fill={hc}/>
                <text x={PADDING+2} y={lotTop+10} fill="#fff" fontSize="10.5" fontWeight="900">{pq.nombre.toUpperCase()}</text>
                <text x={PADDING+2} y={lotTop+22} fill="rgba(255,255,255,.8)" fontSize="7.5" fontWeight="bold">BLOQUE {pq.bloque}</text>
                <g transform={`translate(${PADDING-10},${lotTop+47})`}>
                  <circle cx="5" cy="-2.5" r="3.5" fill={CELDA_CONFIG.libre.dotColor}/><text x="13" y="1" fill={MAP_THEME.textDim} fontSize="8.5" fontWeight="bold">{libres} libres</text>
                  <circle cx="70" cy="-2.5" r="3.5" fill={CELDA_CONFIG.ocupado.dotColor}/><text x="78" y="1" fill={MAP_THEME.textDim} fontSize="8.5" fontWeight="bold">{ocupados} ocupados</text>
                  {senaCount>0&&<g transform="translate(145,0)"><circle cx="5" cy="-2.5" r="3.5" fill={CELDA_CONFIG.sena.dotColor}/><text x="13" y="1" fill={MAP_THEME.textDim} fontSize="8.5" fontWeight="bold">{senaCount} SENA</text></g>}
                </g>
                {filas.map((fila,fi)=>fila.esCarril?(
                  <g key={`c-${fi}`}><rect x={PADDING-8} y={fila.y-4} width={celdasPorFila*(SPACE_W+GAP_X)+16} height={LANE_H-8} fill="url(#roadG)" rx="4"/><line x1={PADDING} y1={fila.y+LANE_H/2-4} x2={PADDING+celdasPorFila*(SPACE_W+GAP_X)-GAP_X} y2={fila.y+LANE_H/2-4} stroke="#F5C344" strokeWidth="1.2" strokeDasharray="6,5" opacity=".4"/></g>
                ):(
                  <g key={`f-${fi}`}>
                    {fila.celdas.map(celda=>{
                      const cfg=CELDA_CONFIG[celda.estado];
                      const m=cellMatchesSearch(celda);
                      return(
                        <g key={`${pq.id}-${celda.codigo}`} onClick={()=>activate(pq.id,celda)} onMouseMove={e=>setHover({celda,pqNombre:pq.nombre,tipoPq:pq.tipo,clientX:e.clientX,clientY:e.clientY})} onMouseLeave={()=>setHover(null)} style={{cursor:"pointer"}}>
                          {m&&<rect x={celda.x-3} y={celda.y-3} width={SPACE_W+6} height={SPACE_H+6} rx="6" fill="none" stroke="#FBBF24" strokeWidth="4.5" filter="url(#glow)"/>}
                          <rect x={celda.x} y={celda.y} width={SPACE_W} height={SPACE_H} rx="3.5" fill={celda.estado==="sena"?"url(#senaH)":cfg.mapFill} stroke={m?"#F59E0B":cfg.mapStroke} strokeWidth={m?2.2:celda.estado==="libre"?1.2:1.6} strokeDasharray={celda.estado==="libre"?"3,2":undefined}/>
                          <text x={celda.x+4.5} y={celda.y+8} fill={m?"#FFF":MAP_THEME.textDim} fontSize="6.8" fontWeight="900">{celda.codigo}</text>
                          {celda.estado==="libre"&&<text x={celda.x+SPACE_W/2} y={celda.y+SPACE_H/2+5.5} textAnchor="middle" fontSize="16" fontWeight="900" fill="rgba(255,255,255,.08)">P</text>}
                          {celda.estado==="ocupado"&&<HighFiCarSVG x={celda.x} y={celda.y} w={SPACE_W} h={SPACE_H} placa={celda.placa||"SENA"}/>}
                          {celda.estado==="sena"&&<text x={celda.x+SPACE_W/2} y={celda.y+SPACE_H/2+3} textAnchor="middle" fontSize="7.5" fontWeight="950" fill="#FCD34D">SENA</text>}
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
      {hover&&(
        <div style={{position:"fixed",left:hover.clientX+16,top:hover.clientY+16,zIndex:100,pointerEvents:"none",width:208,borderRadius:14,border:"1px solid rgba(255,255,255,.12)",background:"rgba(15,17,20,.95)",padding:12,color:"#fff",boxShadow:"0 10px 30px rgba(0,0,0,.35)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,.08)",paddingBottom:6,marginBottom:8}}>
            <span style={{fontFamily:"monospace",fontSize:12,fontWeight:900,color:C.primaryLight}}>{hover.celda.codigo}</span>
            <span style={{fontSize:9,fontWeight:800,color:"rgba(255,255,255,.45)",textTransform:"uppercase"}}>{hover.tipoPq}</span>
          </div>
          {hover.celda.estado==="ocupado"?(
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <span style={{fontFamily:"monospace",fontSize:13,fontWeight:900,background:"rgba(255,255,255,.08)",padding:"2px 6px",borderRadius:6}}>{hover.celda.placa}</span>
                {hover.celda.esOficial&&<span style={{fontSize:8,fontWeight:900,color:C.primaryLight,border:`1px solid ${C.primary}`,borderRadius:4,padding:"1px 4px"}}>OFICIAL</span>}
              </div>
              <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.75)",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{hover.celda.conductor}</div>
              {hover.celda.timestampIngreso&&(
                <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid rgba(255,255,255,.08)",fontSize:9,fontWeight:700,color:"rgba(255,255,255,.55)"}}>
                  <div>Estadía: {formatearDuracion(hover.celda.timestampIngreso)}</div>
                </div>
              )}
            </div>
          ):<div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,.7)"}}>{hover.celda.estado==="sena"?"Reservado SENA":"Celda libre"}</div>}
        </div>
      )}
    </div>
  );
});
ParkingMap.displayName="ParkingMap";

/* ============================================================
   VISTA TABLA DE PARQUEADEROS (estilo Reservas)
============================================================ */
const ParqueaderosTable=memo(({parqueaderos,onEdit,onDelete,onCellClick,cellMatchesSearch,searchQuery}:{
  parqueaderos:Parqueadero[];onEdit:(p:Parqueadero)=>void;onDelete:(id:number)=>void;
  onCellClick:(id:number,c:Celda)=>void;cellMatchesSearch:(c:Celda)=>boolean;searchQuery:string;
})=>{
  const [expandedId,setExpandedId]=useState<number|null>(null);

  return(
    <div style={{borderRadius:16,border:`1px solid ${C.border}`,background:"#fff",overflow:"hidden",boxShadow:"0 2px 8px rgba(15,23,42,.05)"}}>
      {/* header */}
      <div style={{display:"grid",gridTemplateColumns:"minmax(200px,1fr) 120px 100px 80px 80px 80px 90px",background:"#F8FAF8",borderBottom:`1px solid ${C.border}`,padding:"12px 16px",fontSize:11,fontWeight:800,color:C.textLight,textTransform:"uppercase",letterSpacing:.5}}>
        <div>Parqueadero</div><div>Tipo</div><div>Ocupación</div><div>Libres</div><div>Ocupadas</div><div>SENA</div><div style={{textAlign:"right"}}>Acciones</div>
      </div>
      <div style={{maxHeight:"calc(100vh - 420px)",overflowY:"auto"}}>
        {parqueaderos.length===0?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 24px",color:C.textLight}}>
            <Car size={36} color={C.border} style={{marginBottom:12}}/>
            <p style={{fontWeight:600,fontSize:13}}>No se encontraron parqueaderos</p>
          </div>
        ):parqueaderos.map(pq=>{
          const libres=pq.celdas.filter(c=>c.estado==="libre").length;
          const ocupados=pq.celdas.filter(c=>c.estado==="ocupado").length;
          const senas=pq.celdas.filter(c=>c.estado==="sena").length;
          const pct=pq.celdas.length?Math.round(ocupados/pq.celdas.length*100):0;
          const pctColor=pct>=90?C.danger:pct>=50?C.amber:C.primary;
          const isExpanded=expandedId===pq.id;
          return(
            <React.Fragment key={pq.id}>
              <div
                style={{display:"grid",gridTemplateColumns:"minmax(200px,1fr) 120px 100px 80px 80px 80px 90px",padding:"14px 16px",borderBottom:`1px solid ${C.border}`,alignItems:"center",fontSize:12,transition:"background .15s",cursor:"pointer",background:isExpanded?"#F8FAF8":"#fff"}}
                onMouseEnter={e=>(e.currentTarget.style.background="#F8FAF8")}
                onMouseLeave={e=>(e.currentTarget.style.background=isExpanded?"#F8FAF8":"#fff")}
              >
                {/* nombre */}
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:C.primaryPale,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <MapPin size={16} color={C.primary}/>
                  </div>
                  <div>
                    <div style={{fontWeight:800,color:C.text}}>{pq.nombre}</div>
                    <div style={{fontSize:10,color:C.textLight}}>Bloque {pq.bloque} · {pq.total} celdas</div>
                  </div>
                </div>
                {/* tipo */}
                <div><span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"2px 8px",borderRadius:8,background:"#F1F5F9",fontSize:11,fontWeight:600,color:C.textLight}}>{pq.tipo}</span></div>
                {/* ocupacion */}
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{flex:1,height:6,borderRadius:999,background:"#E2E8F0",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${pct}%`,background:pctColor,borderRadius:999,transition:"width .3s"}}/>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,color:pctColor,minWidth:28}}>{pct}%</span>
                  </div>
                </div>
                {/* libres */}
                <div style={{fontWeight:700,color:C.primary}}>{libres}</div>
                {/* ocupadas */}
                <div style={{fontWeight:700,color:C.danger}}>{ocupados}</div>
                {/* sena */}
                <div style={{fontWeight:700,color:C.amber}}>{senas}</div>
                {/* acciones */}
                <div style={{display:"flex",justifyContent:"flex-end",gap:6}}>
                  <button title="Ver celdas" onClick={e=>{e.stopPropagation();setExpandedId(isExpanded?null:pq.id);}}
                    style={{width:28,height:28,borderRadius:7,border:"none",background:"transparent",color:C.textLight,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
                    onMouseEnter={e=>(e.currentTarget.style.background="#F1F5F9")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <Eye size={13}/>
                  </button>
                  <button title="Editar" onClick={e=>{e.stopPropagation();onEdit(pq);}}
                    style={{width:28,height:28,borderRadius:7,border:"none",background:"transparent",color:C.textLight,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
                    onMouseEnter={e=>(e.currentTarget.style.background="#F1F5F9")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <Pencil size={13}/>
                  </button>
                  <button title="Eliminar" onClick={e=>{e.stopPropagation();onDelete(pq.id);}}
                    style={{width:28,height:28,borderRadius:7,border:"none",background:"transparent",color:C.danger,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
                    onMouseEnter={e=>(e.currentTarget.style.background="#FEE2E2")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              </div>
              {/* celdas expandidas */}
              {isExpanded&&(
                <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,background:"#FAFBFC"}}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:8}}>
                    {pq.celdas.map(celda=>{
                      const cfg=CELDA_CONFIG[celda.estado];
                      const matched=cellMatchesSearch(celda);
                      return(
                        <button key={celda.codigo} onClick={()=>onCellClick(pq.id,celda)}
                          style={{padding:"8px 10px",borderRadius:10,border:`2px ${celda.estado==="libre"?"dashed":"solid"} ${matched?"#F59E0B":cfg.border}`,background:cfg.bg,color:cfg.text,cursor:"pointer",textAlign:"left",fontFamily:"inherit",outline:"none",boxShadow:matched?"0 0 0 3px rgba(245,158,11,.25)":undefined}}>
                          <div style={{fontSize:10,fontWeight:900,letterSpacing:1,marginBottom:4}}>{celda.codigo}</div>
                          {celda.estado==="ocupado"&&<div style={{fontFamily:"monospace",fontSize:9,fontWeight:700,background:"rgba(255,255,255,.15)",padding:"1px 4px",borderRadius:4,marginBottom:2}}>{celda.placa}</div>}
                          <div style={{display:"flex",alignItems:"center",gap:3}}>
                            <span style={{width:5,height:5,borderRadius:"50%",background:cfg.dotColor,flexShrink:0}}/>
                            <span style={{fontSize:8,fontWeight:700,opacity:.8}}>{cfg.label}</span>
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
      {parqueaderos.length>0&&(
        <div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,background:"#F8FAF8",fontSize:11,color:C.textLight}}>
          Mostrando <strong>{parqueaderos.length}</strong> parqueadero{parqueaderos.length!==1?"s":""}
        </div>
      )}
    </div>
  );
});
ParqueaderosTable.displayName="ParqueaderosTable";

/* ============================================================
   LISTA VEHÍCULOS ACTIVOS (sidebar)
============================================================ */
const ActiveVehiclesList=memo(({parqueaderos,onSelectCell,searchQuery}:{parqueaderos:Parqueadero[];onSelectCell:(id:number,c:Celda)=>void;searchQuery:string})=>{
  const activos=useMemo(()=>{
    const list:any[]=[];
    parqueaderos.forEach(pq=>pq.celdas.forEach(c=>c.estado==="ocupado"&&list.push({pqId:pq.id,pqNombre:pq.nombre,tipoPq:pq.tipo,celda:c})));
    return list.sort((a,b)=>(b.celda.timestampIngreso||0)-(a.celda.timestampIngreso||0));
  },[parqueaderos]);
  const filtered=useMemo(()=>{
    if(!searchQuery.trim()) return activos;
    const q=searchQuery.toLowerCase();
    return activos.filter(v=>v.celda.placa?.toLowerCase().includes(q)||v.celda.conductor?.toLowerCase().includes(q)||v.celda.codigo.toLowerCase().includes(q));
  },[activos,searchQuery]);
  return(
    <div style={{borderRadius:16,border:`1px solid ${C.border}`,background:"#fff",overflow:"hidden",boxShadow:"0 2px 8px rgba(15,23,42,.05)"}}>
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,background:"#F8FAF8",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <Car size={15} color={C.primary}/>
          <span style={{fontSize:12,fontWeight:800,color:C.text,textTransform:"uppercase",letterSpacing:.5}}>Vehículos Activos</span>
        </div>
        <span style={{padding:"2px 8px",borderRadius:999,background:C.primaryPale,color:C.primaryDark,fontSize:10,fontWeight:800}}>{activos.length}</span>
      </div>
      <div style={{maxHeight:400,overflowY:"auto"}}>
        {filtered.length>0?filtered.map(({pqId,pqNombre,tipoPq,celda})=>(
          <div key={`${pqId}-${celda.codigo}`} onClick={()=>onSelectCell(pqId,celda)}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",transition:"background .15s"}}
            onMouseEnter={e=>(e.currentTarget.style.background="#F8FAF8")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
            <div style={{minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <span style={{fontFamily:"monospace",fontSize:11,fontWeight:800,background:"#F1F5F9",color:C.text,padding:"1px 6px",borderRadius:6,border:`1px solid ${C.border}`}}>{celda.placa}</span>
                <span style={{fontSize:9,fontWeight:700,color:C.textLight}}>Celda {celda.codigo}</span>
                {celda.esOficial&&<span style={{fontSize:8,fontWeight:800,background:C.primaryPale,color:C.primaryDark,padding:"1px 4px",borderRadius:4}}>OFICIAL</span>}
              </div>
              <div style={{fontSize:11,fontWeight:600,color:C.text,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:150}}>{celda.conductor}</div>
              <div style={{fontSize:9,color:C.textLight,marginTop:1,maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pqNombre}</div>
            </div>
            {celda.timestampIngreso&&(
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{display:"flex",alignItems:"center",gap:3,justifyContent:"flex-end",fontSize:10,fontWeight:600,color:C.textLight}}><Clock size={8}/>{formatearDuracion(celda.timestampIngreso)}</div>
              </div>
            )}
          </div>
        )):(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 16px",color:C.textLight}}>
            <Info size={20} color={C.border} style={{marginBottom:8}}/>
            <span style={{fontSize:12,fontWeight:600}}>No hay vehículos activos</span>
          </div>
        )}
      </div>
    </div>
  );
});
ActiveVehiclesList.displayName="ActiveVehiclesList";

/* ============================================================
   HISTORIAL
============================================================ */
const HistoryPanel=memo(({historial,onClear,onImport,parqueaderos}:{historial:TicketSalida[];onClear:()=>void;onImport:(c:string)=>void;parqueaderos:Parqueadero[]})=>{
  const [query,setQuery]=useState("");
  const stats=useMemo(()=>({
    total:historial.length,
    avgDuration:historial.length?Math.round(historial.reduce((a,t)=>a+t.duracionMinutos,0)/historial.length):0,
    oficiales:historial.filter(t=>t.esOficial).length,
  }),[historial]);
  const filtered=useMemo(()=>{ if(!query.trim()) return historial; const q=query.toLowerCase(); return historial.filter(t=>t.placa.toLowerCase().includes(q)||t.conductor.toLowerCase().includes(q)||t.celdaCodigo.toLowerCase().includes(q)); },[historial,query]);
  const handleExport=()=>{ const d="data:text/json;charset=utf-8,"+encodeURIComponent(JSON.stringify({parqueaderos,historial})); const a=document.createElement("a"); a.setAttribute("href",d); a.setAttribute("download","respaldo_parqueadero_sena.json"); a.click(); };
  const handleFile=(e:React.ChangeEvent<HTMLInputElement>)=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=ev=>onImport(ev.target?.result as string); r.readAsText(f); };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12}}>
        {[{label:"Salidas",value:`${stats.total} vehs`},{label:"Estadía Promedio",value:`${stats.avgDuration} min`},{label:"Oficiales Exentos",value:stats.oficiales}].map(s=>(
          <div key={s.label} style={{borderRadius:12,border:`1px solid ${C.border}`,background:"#fff",padding:16,boxShadow:"0 2px 8px rgba(15,23,42,.05)"}}>
            <div style={{fontSize:10,fontWeight:800,color:C.textLight,textTransform:"uppercase",letterSpacing:.5}}>{s.label}</div>
            <div style={{fontSize:22,fontWeight:900,color:C.text,marginTop:4}}>{s.value}</div>
          </div>
        ))}
      </div>
      {/* topbar */}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{flex:1,position:"relative",minWidth:200}}>
          <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.textLight}}/>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar placa, conductor..." style={{width:"100%",padding:"10px 14px 10px 36px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,background:"#fff",fontFamily:"inherit",outline:"none"}}/>
          {query&&<button onClick={()=>setQuery("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.textLight}}><X size={14}/></button>}
        </div>
        <button onClick={handleExport} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",borderRadius:11,border:`1px solid ${C.border}`,background:"#fff",fontSize:12,fontWeight:700,color:C.textLight,cursor:"pointer",fontFamily:"inherit"}}><Download size={14}/>Exportar</button>
        <label style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",borderRadius:11,border:`1px solid ${C.border}`,background:"#fff",fontSize:12,fontWeight:700,color:C.textLight,cursor:"pointer"}}>
          <Upload size={14}/>Importar<input type="file" accept=".json" onChange={handleFile} style={{display:"none"}}/>
        </label>
        {historial.length>0&&<button onClick={onClear} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",borderRadius:11,border:`1px solid ${C.dangerBorder}`,background:C.dangerBg,fontSize:12,fontWeight:700,color:C.danger,cursor:"pointer",fontFamily:"inherit"}}><RotateCcw size={14}/>Vaciar</button>}
      </div>
      {/* tabla */}
      <div style={{borderRadius:16,border:`1px solid ${C.border}`,background:"#fff",overflow:"hidden",boxShadow:"0 2px 8px rgba(15,23,42,.05)"}}>
        <div style={{display:"grid",gridTemplateColumns:"100px minmax(140px,1fr) minmax(120px,1fr) 120px 120px 80px",background:"#F8FAF8",borderBottom:`1px solid ${C.border}`,padding:"12px 16px",fontSize:11,fontWeight:800,color:C.textLight,textTransform:"uppercase",letterSpacing:.5}}>
          <div>Placa</div><div>Conductor</div><div>Ubicación</div><div>Ingreso</div><div>Salida</div><div>Estadía</div>
        </div>
        <div style={{maxHeight:"calc(100vh - 520px)",overflowY:"auto"}}>
          {filtered.length>0?filtered.map(t=>(
            <div key={t.id} style={{display:"grid",gridTemplateColumns:"100px minmax(140px,1fr) minmax(120px,1fr) 120px 120px 80px",padding:"12px 16px",borderBottom:`1px solid ${C.border}`,alignItems:"center",fontSize:12,transition:"background .15s"}}
              onMouseEnter={e=>(e.currentTarget.style.background="#F8FAF8")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
              <div><span style={{fontFamily:"monospace",fontSize:11,fontWeight:800,background:"#F1F5F9",color:C.text,padding:"2px 6px",borderRadius:6,border:`1px solid ${C.border}`}}>{t.placa}</span></div>
              <div style={{fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.conductor}</div>
              <div><span style={{fontWeight:700,color:C.text}}>{t.celdaCodigo}</span><div style={{fontSize:9,color:C.textLight,marginTop:1}}>{t.parqueaderoNombre}</div></div>
              <div style={{color:C.textLight,fontSize:11}}>{t.fechaIngreso}<div style={{fontSize:9}}>{t.horaIngreso}</div></div>
              <div style={{color:C.textLight,fontSize:11}}>{t.fechaSalida}<div style={{fontSize:9}}>{t.horaSalida}</div></div>
              <div style={{fontWeight:600,color:C.textLight}}>{t.duracionMinutos} min</div>
            </div>
          )):(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 24px",color:C.textLight}}>
              <History size={36} color={C.border} style={{marginBottom:12}}/>
              <p style={{fontWeight:600,fontSize:13}}>Caja vacía</p>
            </div>
          )}
        </div>
        {filtered.length>0&&<div style={{padding:"10px 16px",borderTop:`1px solid ${C.border}`,background:"#F8FAF8",fontSize:11,color:C.textLight}}>Mostrando <strong>{filtered.length}</strong> de <strong>{historial.length}</strong> registros</div>}
      </div>
    </div>
  );
});
HistoryPanel.displayName="HistoryPanel";

/* ============================================================
   TICKET MODAL
============================================================ */
const TicketModal=memo(({open,ticket,onConfirm,onCancel}:{open:boolean;ticket:TicketSalida|null;onConfirm:()=>void;onCancel:()=>void})=>{
  if(!open||!ticket) return null;
  return(
    <Modal open={open} onClose={onCancel} maxWidth={400}>
      <ModalHeader eyebrow="Salida de Vehículo" title="Ticket de Salida" icon={<Shield size={18} color={C.primary}/>} onClose={onCancel}/>
      <div style={{padding:"1.4rem 1.8rem",background:"#F8FAFC"}}>
        <div style={{background:"#fff",border:`1px solid ${C.border}`,boxShadow:"0 2px 8px rgba(15,23,42,.06)",padding:"1.2rem",borderRadius:12,fontFamily:"monospace",fontSize:12,color:C.text}}>
          <div style={{textAlign:"center",marginBottom:12}}>
            <Shield style={{margin:"0 auto 4px",display:"block"}} size={28} color={C.primary}/>
            <div style={{fontWeight:900,fontSize:14,fontFamily:"inherit"}}>PARQUEADERO SENA</div>
            <div style={{fontSize:9,color:C.textLight,fontWeight:700}}>CEET - Centro de Electricidad</div>
          </div>
          <div style={{borderTop:`1px dashed ${C.border}`,margin:"10px 0"}}/>
          {[["PLACA:",ticket.placa],["CONDUCTOR:",ticket.conductor],["CELDA:",`${ticket.celdaCodigo} (${ticket.bloque})`]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span>{k}</span><span style={{fontWeight:700}}>{v}</span></div>
          ))}
          <div style={{borderTop:`1px dashed ${C.border}`,margin:"10px 0"}}/>
          {[["INGRESO:",ticket.fechaIngreso],["SALIDA:",ticket.fechaSalida],["ESTADÍA:",`${ticket.duracionMinutos} min`]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:11}}><span>{k}</span><span>{v}</span></div>
          ))}
          <div style={{borderTop:`1px dashed ${C.border}`,margin:"10px 0"}}/>
          {ticket.esOficial?(
            <div style={{borderRadius:8,background:C.primaryPale,border:`1px solid ${C.primaryLight}`,padding:"8px 10px",textAlign:"center",color:C.primaryDark,fontWeight:800}}>VEHÍCULO OFICIAL EXENTO</div>
          ):(
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",background:"#F8FAFC",padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`}}>
              <span style={{color:C.textLight,fontFamily:"sans-serif",fontWeight:700}}>Duración:</span>
              <span style={{fontSize:16,fontWeight:900,fontFamily:"monospace"}}>{ticket.duracionMinutos} minutos</span>
            </div>
          )}
        </div>
      </div>
      <div style={{display:"flex",gap:10,borderTop:`1px solid ${C.border}`,padding:"1rem 1.8rem",background:"#fff"}}>
        <button onClick={onCancel} style={{flex:1,padding:"10px 16px",borderRadius:12,border:`1px solid ${C.border}`,background:"#fff",fontSize:13,fontWeight:700,color:C.text,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
        <button onClick={onConfirm} style={{flex:1,padding:"10px 16px",borderRadius:12,border:"none",background:C.primary,fontSize:13,fontWeight:800,color:"#fff",cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 18px rgba(57,169,0,.22)"}}>Confirmar Salida</button>
      </div>
    </Modal>
  );
});
TicketModal.displayName="TicketModal";

/* ============================================================
   SMART ASSIGN MODAL
============================================================ */
const SmartAssignModal=memo(({open,parqueaderos,onClose,onAssign,openScanner,scannedPlate}:{open:boolean;parqueaderos:Parqueadero[];onClose:()=>void;onAssign:(pqId:number,codigo:string,placa:string,conductor:string,esOficial:boolean)=>void;openScanner:()=>void;scannedPlate?:string})=>{
  const [placa,setPlaca]=useState("");
  const [conductor,setConductor]=useState("");
  const [tipoVehiculo,setTipoVehiculo]=useState<"Carro"|"Moto">("Carro");
  const [rol,setRol]=useState<"Estudiante"|"Docente"|"Administrativo"|"Visitante"|"Oficial">("Estudiante");
  const [recomendacion,setRecomendacion]=useState<any>(null);
  useEffect(()=>{ if(scannedPlate) setPlaca(scannedPlate); },[scannedPlate]);
  useEffect(()=>{
    if(!open) return;
    let tipo:Parqueadero["tipo"]="General";
    if(tipoVehiculo==="Moto") tipo="Motos";
    else if(rol==="Docente") tipo="Docentes";
    else if(rol==="Administrativo") tipo="Administrativos";
    else if(rol==="Visitante") tipo="Visitantes";
    let found:any=null;
    for(const pq of parqueaderos.filter(p=>p.tipo===tipo)){ const c=pq.celdas.find(c=>c.estado==="libre"); if(c){found={pq,celda:c,motivo:`Zona preferencial ${pq.tipo} disponible.`};break;} }
    if(!found&&tipoVehiculo==="Carro"){ for(const pq of parqueaderos.filter(p=>p.tipo==="General")){ const c=pq.celdas.find(c=>c.estado==="libre"); if(c){found={pq,celda:c,motivo:"Zona preferencial ocupada. Asignada zona General."};break;} } }
    if(!found){ for(const pq of parqueaderos){ const c=pq.celdas.find(c=>c.estado==="libre"); if(c){found={pq,celda:c,motivo:`No hay cupo en la zona preferencial. Celda disponible en ${pq.tipo}.`};break;} } }
    setRecomendacion(found?{parqueaderoId:found.pq.id,parqueaderoNombre:found.pq.nombre,codigo:found.celda.codigo,bloque:found.pq.bloque,tipoPq:found.pq.tipo,motivo:found.motivo}:null);
  },[open,tipoVehiculo,rol,parqueaderos]);
  const valid=validarPlacaColombiana(placa)&&conductor.trim().length>=3&&recomendacion!==null;
  return(
    <Modal open={open} onClose={onClose} maxWidth={560}>
      <ModalHeader eyebrow="Asistente Virtual" title="Asignación Inteligente" icon={<Sparkles size={18} color={C.primary}/>} onClose={onClose}/>
      <div style={{padding:"1.4rem 1.8rem",maxHeight:"65vh",overflowY:"auto",display:"flex",flexDirection:"column",gap:14}}>
        <Banner tone="info" message="El sistema buscará la celda óptima libre según el perfil y tipo de vehículo."/>
        {/* placa */}
        <div>
          <label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Placa del Vehículo *</label>
          <div style={{display:"flex",gap:8}}>
            <input value={placa} onChange={e=>setPlaca(e.target.value.toUpperCase())} placeholder="ABC123" style={{flex:1,padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"monospace",fontWeight:700,outline:"none",background:"#F8FAFC"}}/>
            <button onClick={openScanner} style={{display:"flex",alignItems:"center",gap:6,padding:"11px 16px",borderRadius:11,border:"none",background:C.text,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}><Camera size={14}/>Escanear</button>
          </div>
        </div>
        {/* conductor */}
        <div>
          <label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Nombre Conductor *</label>
          <input list="smart-drivers" value={conductor} onChange={e=>setConductor(e.target.value)} placeholder="Nombre completo" style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,outline:"none",fontFamily:"inherit",background:"#F8FAFC"}}/>
          <datalist id="smart-drivers">{CONDUCTORES_SUGERIDOS.map(c=><option key={c} value={c}/>)}</datalist>
        </div>
        {/* tipo + rol */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Vehículo</label>
            <div style={{display:"flex",borderRadius:11,border:`1px solid ${C.border}`,overflow:"hidden"}}>
              {(["Carro","Moto"] as const).map(t=>(
                <button key={t} onClick={()=>setTipoVehiculo(t)} style={{flex:1,padding:"10px 8px",fontSize:12,fontWeight:700,border:"none",background:tipoVehiculo===t?C.primary:"#fff",color:tipoVehiculo===t?"#fff":C.textLight,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Rol</label>
            <select value={rol} onChange={e=>setRol(e.target.value as any)} style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:"#F8FAFC",outline:"none"}}>
              <option value="Estudiante">Estudiante</option><option value="Docente">Docente</option><option value="Administrativo">Administrativo</option><option value="Visitante">Visitante</option><option value="Oficial">Oficial SENA</option>
            </select>
          </div>
        </div>
        {/* recomendacion */}
        {recomendacion?(
          <div style={{borderRadius:11,border:`1px solid ${C.border}`,background:"#F8FAFC",padding:"12px 14px"}}>
            <div style={{fontSize:10,fontWeight:800,color:C.textLight,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Asignación Sugerida</div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
              <div style={{width:40,height:40,borderRadius:10,background:C.primaryPale,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontWeight:900,fontSize:13,color:C.primaryDark}}>{recomendacion.codigo}</div>
              <div><div style={{fontWeight:800,color:C.text,fontSize:13}}>{recomendacion.parqueaderoNombre}</div><div style={{fontSize:10,color:C.textLight}}>{recomendacion.tipoPq} · Bloque {recomendacion.bloque}</div></div>
            </div>
            <div style={{padding:"8px 10px",borderRadius:9,background:"#fff",border:`1px solid ${C.border}`,fontSize:11,color:C.textLight}}>💡 {recomendacion.motivo}</div>
          </div>
        ):<Banner tone="danger" message="No hay celdas libres disponibles para esta categoría."/>}
      </div>
      <div style={{display:"flex",gap:10,borderTop:`1px solid ${C.border}`,padding:"1rem 1.8rem"}}>
        <button onClick={onClose} style={{flex:1,padding:"10px 16px",borderRadius:12,border:`1px solid ${C.border}`,background:"#fff",fontSize:13,fontWeight:700,color:C.text,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
        <button disabled={!valid} onClick={()=>{if(!recomendacion)return;const eo=rol==="Oficial"||placa.toUpperCase().startsWith("SNA");onAssign(recomendacion.parqueaderoId,recomendacion.codigo,placa.toUpperCase(),normalizarTexto(conductor),eo);setPlaca("");setConductor("");onClose();}}
          style={{flex:1,padding:"10px 16px",borderRadius:12,border:"none",background:valid?C.primary:"#E2E8F0",fontSize:13,fontWeight:800,color:valid?"#fff":C.textLight,cursor:valid?"pointer":"not-allowed",fontFamily:"inherit",boxShadow:valid?"0 6px 18px rgba(57,169,0,.22)":undefined}}>
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
export default function Parqueaderos(){
  const [state,dispatch]=useReducer(rootReducer,undefined,()=>({parqueaderos:loadParqueaderos(),historial:loadHistorial(),toasts:[] as ToastItem[]}));
  const [activeTab,setActiveTab]=useState<"map"|"table"|"history">("table");
  const [openModal,setOpenModal]=useState<"create"|"edit"|"ingreso"|"info"|"scanner"|"smartAssign"|"confirmDelete"|"confirmLiberar"|"confirmClearHistory"|null>(null);
  const [pqEditId,setPqEditId]=useState<number|null>(null);
  const [pqDeleteId,setPqDeleteId]=useState<number|null>(null);
  const [celdaCoords,setCeldaCoords]=useState<{parqueaderoId:number;codigo:string}|null>(null);
  const [search,setSearch]=useState("");
  const [filterTipo,setFilterTipo]=useState("Todos");
  const [pqForm,setPqForm]=useState<FormParqueadero>({nombre:"",total:10,bloque:"A",tipo:"General"});
  const [formError,setFormError]=useState<string|null>(null);
  const [vehiculoForm,setVehiculoForm]=useState<VehiculoForm>({placa:"",conductor:"",esOficial:false});
  const [placaError,setPlacaError]=useState<string|null>(null);
  const [ocrLoading,setOcrLoading]=useState(false);
  const [ocrError,setOcrError]=useState<string|null>(null);
  const [ocrFlash,setOcrFlash]=useState(false);
  const [camaraLista,setCamaraLista]=useState(false);
  const [scannerOrigin,setScannerOrigin]=useState<"ingreso"|"smartAssign"|null>(null);
  const [scannedPlate,setScannedPlate]=useState<string|undefined>(undefined);
  const [activeTicket,setActiveTicket]=useState<TicketSalida|null>(null);
  const [,tick]=useReducer((c:number)=>c+1,0);

  const videoRef=useRef<HTMLVideoElement>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const {reconocer,reconocerLicencia,liberarWorker}=useOcrPlaca();

  useEffect(()=>{ const i=setInterval(()=>tick(),30000); return()=>clearInterval(i); },[]);
  useEffect(()=>{ if(!state.toasts.length) return; const ts=state.toasts.map(t=>setTimeout(()=>dispatch({type:"DISMISS_TOAST",id:t.id}),5000)); return()=>ts.forEach(clearTimeout); },[state.toasts]);

  const cerrarCamara=useCallback(()=>{ streamRef.current?.getTracks().forEach(t=>t.stop()); streamRef.current=null; setCamaraLista(false); },[]);
  const iniciarCamara=useCallback(async()=>{
    if(!navigator.mediaDevices?.getUserMedia){ setOcrError("Cámara no compatible. Usa HTTPS."); return; }
    setOcrError(null);
    try{ const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}}}); streamRef.current=s; if(videoRef.current) videoRef.current.srcObject=s; }
    catch{ try{ const s=await navigator.mediaDevices.getUserMedia({video:true}); streamRef.current=s; if(videoRef.current) videoRef.current.srcObject=s; }catch{ setOcrError("No se pudo iniciar la cámara."); } }
  },[]);
  useEffect(()=>{ if(openModal==="scanner") iniciarCamara(); else cerrarCamara(); return()=>cerrarCamara(); },[openModal,iniciarCamara,cerrarCamara]);
  useEffect(()=>()=>{ liberarWorker(); },[liberarWorker]);

  const stats=useMemo(()=>{ const all=state.parqueaderos.flatMap(p=>p.celdas); const t=all.length,o=all.filter(c=>c.estado==="ocupado").length,l=all.filter(c=>c.estado==="libre").length,s=all.filter(c=>c.estado==="sena").length; return {total:t,ocupadas:o,libres:l,sena:s,pct:t?Math.round(o/t*100):0}; },[state.parqueaderos]);

  const celdaActiva=useMemo(()=>{ if(!celdaCoords) return null; return state.parqueaderos.find(p=>p.id===celdaCoords.parqueaderoId)?.celdas.find(c=>c.codigo===celdaCoords.codigo)??null; },[celdaCoords,state.parqueaderos]);
  const parqueaderoActivo=useMemo(()=>{ if(!celdaCoords) return null; return state.parqueaderos.find(p=>p.id===celdaCoords.parqueaderoId)??null; },[celdaCoords,state.parqueaderos]);
  const cellMatchesSearch=useCallback((celda:Celda)=>{ if(!search.trim()) return false; const q=search.toLowerCase(); return !!(celda.placa?.toLowerCase().includes(q)||celda.conductor?.toLowerCase().includes(q)||celda.codigo.toLowerCase().includes(q)); },[search]);

  const filteredPqs=useMemo(()=>state.parqueaderos.map(pq=>{ if(filterTipo!=="Todos"&&pq.tipo!==filterTipo) return null; let celdas=pq.celdas; if(search.trim()){ const q=search.toLowerCase(); celdas=pq.celdas.filter(c=>c.codigo.toLowerCase().includes(q)||c.placa?.toLowerCase().includes(q)||c.conductor?.toLowerCase().includes(q)); } return {...pq,celdas}; }).filter((p):p is Parqueadero=>p!==null&&p.celdas.length>0),[state.parqueaderos,filterTipo,search]);

  const handleCellClick=useCallback((pqId:number,celda:Celda)=>{ setCeldaCoords({parqueaderoId:pqId,codigo:celda.codigo}); setPlacaError(null); if(celda.estado==="ocupado"){ setVehiculoForm({placa:celda.placa||"",conductor:celda.conductor||"",esOficial:!!celda.esOficial}); setOpenModal("info"); }else if(celda.estado==="sena"){ setVehiculoForm({placa:"",conductor:"",esOficial:true}); setOpenModal("info"); }else{ setVehiculoForm({placa:"",conductor:"",esOficial:false}); setOpenModal("ingreso"); } },[]);

  const handleCreate=()=>{ const nombre=normalizarTexto(pqForm.nombre); const bloque=pqForm.bloque.trim().toUpperCase(); if(!nombre) return setFormError("El nombre es obligatorio."); if(!/^[A-Z0-9]{1,2}$/.test(bloque)) return setFormError("El bloque debe ser 1-2 caracteres."); if(state.parqueaderos.some(p=>p.bloque===bloque)) return setFormError(`Ya existe el bloque "${bloque}".`); dispatch({type:"CREATE_PARQUEADERO",parqueadero:{id:Date.now(),nombre,bloque,tipo:pqForm.tipo,total:pqForm.total,celdas:regenerarCeldas(bloque,pqForm.total)}}); setOpenModal(null); };
  const handleEdit=()=>{ if(!pqEditId) return; const nombre=normalizarTexto(pqForm.nombre); const bloque=pqForm.bloque.trim().toUpperCase(); if(!nombre) return setFormError("El nombre es obligatorio."); if(!/^[A-Z0-9]{1,2}$/.test(bloque)) return setFormError("El bloque debe ser 1-2 caracteres."); if(state.parqueaderos.some(p=>p.bloque===bloque&&p.id!==pqEditId)) return setFormError(`Ya existe el bloque "${bloque}".`); const actual=state.parqueaderos.find(p=>p.id===pqEditId); if(actual&&celdasComprometidasAlReducir(actual.celdas,pqForm.total).length>0) return setFormError("No se puede reducir: celdas finales ocupadas/reservadas."); dispatch({type:"EDIT_PARQUEADERO",id:pqEditId,nombre,tipo:pqForm.tipo,bloque,total:pqForm.total}); setOpenModal(null); setPqEditId(null); };
  const handleDelete=()=>{ if(pqDeleteId){dispatch({type:"DELETE_PARQUEADERO",id:pqDeleteId});setOpenModal(null);setPqDeleteId(null);} };
  const registrarVehiculo=()=>{ if(!celdaCoords) return; const p=vehiculoForm.placa.trim().toUpperCase(); const con=normalizarTexto(vehiculoForm.conductor,60); if(!p||!con) return setPlacaError("Completa todos los campos."); if(!validarPlacaColombiana(p)) return setPlacaError("Formato de placa inválido."); if(state.parqueaderos.some(pq=>pq.celdas.some(c=>c.estado==="ocupado"&&c.placa===p&&!(pq.id===celdaCoords.parqueaderoId&&c.codigo===celdaCoords.codigo)))) return setPlacaError("Este vehículo ya está estacionado en otra celda."); const eo=vehiculoForm.esOficial||p.startsWith("SNA")||p.startsWith("OFI"); dispatch({type:"REGISTRAR_VEHICULO",parqueaderoId:celdaCoords.parqueaderoId,codigo:celdaCoords.codigo,placa:p,conductor:con,esOficial:eo}); setOpenModal(null); };
  const guardarEdicion=()=>{ if(!celdaCoords) return; const p=vehiculoForm.placa.trim().toUpperCase(); const con=normalizarTexto(vehiculoForm.conductor,60); if(!p||!con||!validarPlacaColombiana(p)) return setPlacaError("Datos incorrectos."); if(state.parqueaderos.some(pq=>pq.celdas.some(c=>c.estado==="ocupado"&&c.placa===p&&!(pq.id===celdaCoords.parqueaderoId&&c.codigo===celdaCoords.codigo)))) return setPlacaError("Placa ya registrada en otra celda."); dispatch({type:"EDITAR_VEHICULO",parqueaderoId:celdaCoords.parqueaderoId,codigo:celdaCoords.codigo,placa:p,conductor:con,esOficial:vehiculoForm.esOficial}); setOpenModal(null); };
  const cerrarScanner=useCallback(()=>setOpenModal(scannerOrigin==="smartAssign"?"smartAssign":"ingreso"),[scannerOrigin]);
  const handleRequestLiberar=()=>{ if(!celdaActiva||!parqueaderoActivo||!celdaCoords) return; const now=Date.now(); const fh=formatearFechaHora(now); const dur=Math.max(1,Math.floor((now-(celdaActiva.timestampIngreso||now))/60000)); const ticket:TicketSalida={id:`${celdaActiva.codigo}-${now}`,placa:celdaActiva.placa||"N/A",conductor:celdaActiva.conductor||"Desconocido",parqueaderoNombre:parqueaderoActivo.nombre,bloque:parqueaderoActivo.bloque,celdaCodigo:celdaActiva.codigo,fechaIngreso:celdaActiva.fechaIngreso||fh.fechaIngreso,horaIngreso:celdaActiva.horaIngreso||fh.horaIngreso,timestampIngreso:celdaActiva.timestampIngreso||now,fechaSalida:fh.fechaIngreso,horaSalida:fh.horaIngreso,timestampSalida:now,duracionMinutos:dur,esOficial:!!celdaActiva.esOficial}; setActiveTicket(ticket); setOpenModal("confirmLiberar"); };
  const handleConfirmarSalida=()=>{ if(!activeTicket||!celdaCoords) return; dispatch({type:"LIBERAR_CELDA_DIRECTO",parqueaderoId:celdaCoords.parqueaderoId,codigo:celdaCoords.codigo,ticket:activeTicket}); setOpenModal(null); setActiveTicket(null); };
  const handleToggleSena=()=>{ if(celdaCoords){dispatch({type:"TOGGLE_RESERVA_SENA",parqueaderoId:celdaCoords.parqueaderoId,codigo:celdaCoords.codigo});setOpenModal(null);} };
  const handleCaptureOcr=async()=>{ if(!videoRef.current) return; setOcrLoading(true); setOcrError(null); try{ const d=await reconocer(videoRef.current); setOcrFlash(true); setTimeout(()=>setOcrFlash(false),1200); setVehiculoForm(prev=>({...prev,placa:d.placa,conductor:d.conductor||prev.conductor})); dispatch({type:"ADD_TOAST",tone:"success",message:`Placa detectada: ${d.placa}`}); if(scannerOrigin==="smartAssign"){setScannedPlate(d.placa);cerrarCamara();setOpenModal("smartAssign");}else{cerrarCamara();setOpenModal("ingreso");} }catch(e){ setOcrError(e instanceof Error?e.message:"Error al escanear."); }finally{setOcrLoading(false);} };
  const handleFileOCR=async(e:React.ChangeEvent<HTMLInputElement>)=>{ const f=e.target.files?.[0]; if(!f) return; setOcrLoading(true); setOcrError(null); try{ const reader=new FileReader(); reader.onload=async ev=>{ try{ const url=await preprocesarImagenArchivo(ev.target?.result as string); const d=await reconocerLicencia(url); setOcrFlash(true); setTimeout(()=>setOcrFlash(false),1200); setVehiculoForm(prev=>({...prev,placa:d.placa,conductor:d.conductor||prev.conductor})); dispatch({type:"ADD_TOAST",tone:"success",message:`Placa detectada: ${d.placa}`}); if(scannerOrigin==="smartAssign"){setScannedPlate(d.placa);setOpenModal("smartAssign");}else{setOpenModal("ingreso");} }catch(err){setOcrError(err instanceof Error?err.message:"No se reconoció la placa.");} finally{setOcrLoading(false);} }; reader.readAsDataURL(f); }catch{setOcrError("No se pudo procesar la imagen.");setOcrLoading(false);} };
  const handleSimOCR=(p:string,con:string,rol:string)=>{ setOcrLoading(true); setTimeout(()=>{setOcrLoading(false);setOcrFlash(true);setTimeout(()=>{setOcrFlash(false);setVehiculoForm({placa:p,conductor:con,esOficial:rol==="Oficial"});if(scannerOrigin==="smartAssign"){setScannedPlate(p);setOpenModal("smartAssign");}else{setOpenModal("ingreso");}},1000);},800); };
  const handleSmartAssign=(pqId:number,codigo:string,placa:string,conductor:string,esOficial:boolean)=>{ dispatch({type:"REGISTRAR_VEHICULO",parqueaderoId:pqId,codigo,placa,conductor,esOficial}); setScannedPlate(undefined); };
  const handleImport=(content:string)=>{ try{ const p=JSON.parse(content); if(p.parqueaderos&&Array.isArray(p.parqueaderos)){dispatch({type:"IMPORT_STATE",parqueaderos:p.parqueaderos,historial:Array.isArray(p.historial)?p.historial:[]});}else{dispatch({type:"ADD_TOAST",tone:"danger",message:"Formato inválido."});} }catch{dispatch({type:"ADD_TOAST",tone:"danger",message:"Error al leer el archivo."});} };

  const activeFilters=[search,filterTipo!=="Todos"?filterTipo:""].filter(Boolean).length;

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap');
        .pq-root *{ box-sizing:border-box; font-family:'Montserrat',sans-serif; }
        input:focus,select:focus,textarea:focus{ outline:none; border-color:${C.primary} !important; box-shadow:0 0 0 3px rgba(57,169,0,.12); }
        ::-webkit-scrollbar{ width:5px; }
        ::-webkit-scrollbar-track{ background:transparent; }
        ::-webkit-scrollbar-thumb{ background:#CBD5E1; border-radius:99px; }
      `}</style>

      <div className="pq-root" style={{display:"flex",flexDirection:"column",gap:16}}>

        {/* ── HERO ── */}
        <div style={{position:"relative",overflow:"hidden",borderRadius:20,background:"linear-gradient(135deg,#39A900,#2D7D00)",padding:"1.4rem 1.6rem",color:"#fff"}}>
          <div style={{position:"absolute",width:250,height:250,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}/>
          <div style={{position:"relative",zIndex:2,display:"flex",flexWrap:"wrap",gap:16,alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.2)",padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>
                <Shield size={11}/> Gestión Institucional SENA
              </div>
              <h1 style={{fontSize:"clamp(1.6rem,3vw,2.2rem)",fontWeight:900,lineHeight:1,marginBottom:4}}>Gestión de Parqueaderos</h1>
              <p style={{fontSize:12,color:"rgba(255,255,255,.8)",lineHeight:1.5}}>Registro óptico automatizado, celdas de cortesía institucional y reportes de ocupación en tiempo real.</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,minWidth:280}}>
              {[
                {label:"Disponibles",value:stats.libres,dot:CELDA_CONFIG.libre.dotColor},
                {label:"Ocupadas",value:stats.ocupadas,dot:CELDA_CONFIG.ocupado.dotColor},
                {label:"Reservas SENA",value:stats.sena,dot:CELDA_CONFIG.sena.dotColor},
                {label:"Ocupación",value:`${stats.pct}%`,dot:"#94A3B8"},
              ].map(s=>(
                <div key={s.label} style={{background:"rgba(255,255,255,.12)",border:"1px solid rgba(255,255,255,.2)",borderRadius:12,padding:"8px 10px",textAlign:"center"}}>
                  <div style={{fontSize:8,fontWeight:700,letterSpacing:1,color:"rgba(255,255,255,.65)",textTransform:"uppercase",marginBottom:2,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:s.dot}}/>{s.label}
                  </div>
                  <div style={{fontSize:20,fontWeight:900,lineHeight:1}}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TOPBAR ── */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{flex:1,position:"relative",minWidth:200}}>
            <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.textLight}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por placa, celda, conductor..." style={{width:"100%",padding:"10px 14px 10px 36px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,background:"#fff",fontFamily:"inherit"}}/>
            {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.textLight}}><X size={14}/></button>}
          </div>

          <select value={filterTipo} onChange={e=>setFilterTipo(e.target.value)} style={{padding:"10px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,background:"#fff",fontFamily:"inherit",cursor:"pointer"}}>
            <option value="Todos">Todos los tipos</option>
            {TIPOS_PARQUEADERO.map(t=><option key={t} value={t}>{t}</option>)}
          </select>

          {/* Tabs */}
          <div style={{display:"flex",borderRadius:11,border:`1px solid ${C.border}`,overflow:"hidden",background:"#fff"}}>
            {([{id:"table",label:"Lista",icon:<LayoutGrid size={14}/>},{id:"map",label:"Plano",icon:<MapIcon size={14}/>},{id:"history",label:"Historial",icon:<History size={14}/>}] as const).map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",fontSize:12,fontWeight:700,border:"none",background:activeTab===t.id?C.primary:"transparent",color:activeTab===t.id?"#fff":C.textLight,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {activeFilters>0&&<button onClick={()=>{setSearch("");setFilterTipo("Todos");}} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",borderRadius:11,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",color:C.textLight,fontSize:12,fontFamily:"inherit"}}><X size={14}/>Limpiar</button>}

          <button onClick={()=>setOpenModal("smartAssign")} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",borderRadius:11,border:`1px solid ${C.border}`,background:"#fff",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            <Zap size={14} color="#F59E0B"/>Asignación Inteligente
          </button>
          <button onClick={()=>{setPqForm({nombre:"",total:10,bloque:"A",tipo:"General"});setFormError(null);setOpenModal("create");}} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",borderRadius:11,border:"none",background:C.primary,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 14px rgba(57,169,0,.25)"}}>
            <Plus size={15}/>Nuevo Parqueadero
          </button>
        </div>

        {activeFilters>0&&<p style={{fontSize:11,color:C.textLight}}>Mostrando <strong>{filteredPqs.length}</strong> resultado{filteredPqs.length!==1?"s":""}</p>}

        {/* ── CONTENIDO SEGÚN TAB ── */}
        {activeTab==="table"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16,alignItems:"start"}}>
            <ParqueaderosTable
              parqueaderos={filteredPqs}
              onEdit={pq=>{setPqEditId(pq.id);setPqForm({nombre:pq.nombre,total:pq.total,bloque:pq.bloque,tipo:pq.tipo});setFormError(null);setOpenModal("edit");}}
              onDelete={id=>{setPqDeleteId(id);setOpenModal("confirmDelete");}}
              onCellClick={handleCellClick}
              cellMatchesSearch={cellMatchesSearch}
              searchQuery={search}
            />
            <ActiveVehiclesList parqueaderos={state.parqueaderos} onSelectCell={handleCellClick} searchQuery={search}/>
          </div>
        )}

        {activeTab==="map"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16,alignItems:"start"}}>
            <ParkingMap parqueaderos={state.parqueaderos} onCellClick={handleCellClick} cellMatchesSearch={cellMatchesSearch}/>
            <ActiveVehiclesList parqueaderos={state.parqueaderos} onSelectCell={handleCellClick} searchQuery={search}/>
          </div>
        )}

        {activeTab==="history"&&<HistoryPanel historial={state.historial} onClear={()=>setOpenModal("confirmClearHistory")} onImport={handleImport} parqueaderos={state.parqueaderos}/>}
      </div>

      {/* ══ MODALES ══ */}

      {/* Crear parqueadero */}
      <Modal open={openModal==="create"} onClose={()=>setOpenModal(null)}>
        <ModalHeader eyebrow="Registro de Zona" title="Nuevo Parqueadero" icon={<Sparkles size={18} color={C.primary}/>} onClose={()=>setOpenModal(null)}/>
        <div style={{padding:"1.4rem 1.8rem",display:"flex",flexDirection:"column",gap:14}}>
          {formError&&<Banner tone="danger" message={formError}/>}
          <div><label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Nombre *</label><input value={pqForm.nombre} onChange={e=>setPqForm(p=>({...p,nombre:e.target.value}))} placeholder="Ej: CARRIL 04" style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:"#F8FAFC"}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Bloque *</label><input value={pqForm.bloque} onChange={e=>setPqForm(p=>({...p,bloque:e.target.value.toUpperCase()}))} maxLength={2} style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:"#F8FAFC"}}/></div>
            <div><label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Capacidad *</label><input type="number" min={1} max={40} value={pqForm.total} onChange={e=>setPqForm(p=>({...p,total:Math.max(1,Math.min(40,parseInt(e.target.value,10)||1))}))} style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:"#F8FAFC"}}/></div>
          </div>
          <div><label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Categoría</label><select value={pqForm.tipo} onChange={e=>setPqForm(p=>({...p,tipo:e.target.value as any}))} style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:"#F8FAFC"}}>{TIPOS_PARQUEADERO.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",padding:"1rem 1.8rem",borderTop:`1px solid ${C.border}`}}>
          <button onClick={()=>setOpenModal(null)} style={{padding:"10px 20px",borderRadius:12,border:`1px solid ${C.border}`,background:"#fff",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
          <button onClick={handleCreate} style={{padding:"10px 24px",borderRadius:12,border:"none",background:C.primary,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 18px rgba(57,169,0,.22)"}}>Crear Parqueadero</button>
        </div>
      </Modal>

      {/* Editar parqueadero */}
      <Modal open={openModal==="edit"} onClose={()=>setOpenModal(null)}>
        <ModalHeader eyebrow="Editar Zona" title="Editar Parqueadero" icon={<Pencil size={18} color={C.primary}/>} onClose={()=>setOpenModal(null)}/>
        <div style={{padding:"1.4rem 1.8rem",display:"flex",flexDirection:"column",gap:14}}>
          {formError&&<Banner tone="danger" message={formError}/>}
          <div><label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Nombre *</label><input value={pqForm.nombre} onChange={e=>setPqForm(p=>({...p,nombre:e.target.value}))} style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:"#F8FAFC"}}/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Bloque *</label><input value={pqForm.bloque} onChange={e=>setPqForm(p=>({...p,bloque:e.target.value.toUpperCase()}))} maxLength={2} style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:"#F8FAFC"}}/></div>
            <div><label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Capacidad *</label><input type="number" min={1} max={40} value={pqForm.total} onChange={e=>setPqForm(p=>({...p,total:Math.max(1,Math.min(40,parseInt(e.target.value,10)||1))}))} style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:"#F8FAFC"}}/></div>
          </div>
          <div><label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Categoría</label><select value={pqForm.tipo} onChange={e=>setPqForm(p=>({...p,tipo:e.target.value as any}))} style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:"#F8FAFC"}}>{TIPOS_PARQUEADERO.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",padding:"1rem 1.8rem",borderTop:`1px solid ${C.border}`}}>
          <button onClick={()=>setOpenModal(null)} style={{padding:"10px 20px",borderRadius:12,border:`1px solid ${C.border}`,background:"#fff",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
          <button onClick={handleEdit} style={{padding:"10px 24px",borderRadius:12,border:"none",background:C.primary,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 18px rgba(57,169,0,.22)"}}>Guardar Cambios</button>
        </div>
      </Modal>

      {/* Registrar vehículo */}
      <Modal open={openModal==="ingreso"} onClose={()=>setOpenModal(null)}>
        <ModalHeader eyebrow={`Celda ${celdaCoords?.codigo??""}`} title="Registrar Vehículo" icon={<Car size={18} color={C.primary}/>} onClose={()=>setOpenModal(null)}/>
        <div style={{padding:"1.4rem 1.8rem",display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Placa *</label>
            <div style={{display:"flex",gap:8}}>
              <input value={vehiculoForm.placa} onChange={e=>setVehiculoForm(p=>({...p,placa:e.target.value.toUpperCase()}))} placeholder="ABC123" maxLength={7} style={{flex:1,padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"monospace",fontWeight:700,background:"#F8FAFC"}}/>
              <button onClick={()=>{setScannerOrigin("ingreso");setOpenModal("scanner");}} style={{display:"flex",alignItems:"center",gap:6,padding:"11px 14px",borderRadius:11,border:"none",background:C.text,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}><Camera size={14}/>OCR</button>
            </div>
            {placaError&&<p style={{fontSize:11,color:C.danger,marginTop:6,fontWeight:700}}>{placaError}</p>}
          </div>
          <div>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:C.text,marginBottom:6}}>Conductor *</label>
            <input list="drivers" value={vehiculoForm.conductor} onChange={e=>setVehiculoForm(p=>({...p,conductor:e.target.value}))} placeholder="Nombre completo" style={{width:"100%",padding:"11px 14px",borderRadius:11,border:`1px solid ${C.border}`,fontSize:13,fontFamily:"inherit",background:"#F8FAFC"}}/>
            <datalist id="drivers">{CONDUCTORES_SUGERIDOS.map(c=><option key={c} value={c}/>)}</datalist>
          </div>
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",borderRadius:11,border:`1px solid ${C.border}`,background:"#F8FAFC",cursor:"pointer"}}>
            <input type="checkbox" checked={vehiculoForm.esOficial} onChange={e=>setVehiculoForm(p=>({...p,esOficial:e.target.checked}))} style={{width:16,height:16,accentColor:C.primary}}/>
            <div><div style={{fontSize:12,fontWeight:800,color:C.text}}>Oficial SENA</div><div style={{fontSize:10,color:C.textLight}}>Vehículo institucional</div></div>
          </label>
          <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
            <button onClick={handleToggleSena} style={{width:"100%",padding:"10px",borderRadius:11,border:`1px dashed ${C.amberBg}`,background:C.amberBg,color:"#92400E",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🔒 Reservar celda para el SENA</button>
          </div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",padding:"1rem 1.8rem",borderTop:`1px solid ${C.border}`}}>
          <button onClick={()=>setOpenModal(null)} style={{padding:"10px 20px",borderRadius:12,border:`1px solid ${C.border}`,background:"#fff",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Cancelar</button>
          <button disabled={!vehiculoForm.placa.trim()||!vehiculoForm.conductor.trim()} onClick={registrarVehiculo} style={{padding:"10px 24px",borderRadius:12,border:"none",background:vehiculoForm.placa.trim()&&vehiculoForm.conductor.trim()?C.primary:"#E2E8F0",color:vehiculoForm.placa.trim()&&vehiculoForm.conductor.trim()?"#fff":C.textLight,fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:vehiculoForm.placa.trim()&&vehiculoForm.conductor.trim()?"0 6px 18px rgba(57,169,0,.22)":undefined}}>Registrar Vehículo</button>
        </div>
      </Modal>

      {/* Info celda */}
      <Modal open={openModal==="info"} onClose={()=>setOpenModal(null)} maxWidth={480}>
        <div style={{background:`linear-gradient(135deg,${C.primary},${C.primaryDark})`,borderRadius:"24px 24px 0 0",padding:"1.6rem 1.8rem",color:"#fff",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,.07)",top:-80,right:-60}}/>
          <div style={{position:"relative",zIndex:2,display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
            <div style={{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center"}}><Car size={24}/></div>
            <button onClick={()=>setOpenModal(null)} style={{width:32,height:32,borderRadius:9,background:"rgba(255,255,255,.15)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={15}/></button>
          </div>
          <div style={{marginTop:14}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:"rgba(255,255,255,.7)",textTransform:"uppercase"}}>Celda {celdaCoords?.codigo}</div>
            <h2 style={{fontSize:22,fontWeight:900,lineHeight:1,marginTop:2}}>{celdaActiva?.estado==="ocupado"?celdaActiva.placa:celdaActiva?.estado==="sena"?"Reservada SENA":"Celda Libre"}</h2>
            {celdaActiva?.estado==="ocupado"&&<p style={{fontSize:12,color:"rgba(255,255,255,.75)",marginTop:4}}>{celdaActiva.conductor}</p>}
            <div style={{marginTop:10}}><EstadoBadge estado={celdaActiva?.estado||"libre"}/></div>
          </div>
        </div>

        <div style={{padding:"1.4rem 1.8rem",display:"flex",flexDirection:"column",gap:10}}>
          {celdaActiva?.estado==="sena"?(
            <>
              <div style={{padding:"12px 14px",borderRadius:11,background:C.amberBg,border:`1px solid ${C.amberBg}`,fontSize:12,color:"#92400E",fontWeight:600}}>Celda reservada exclusivamente para vehículos institucionales SENA.</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={handleToggleSena} style={{flex:1,padding:"10px",borderRadius:11,border:`1px solid ${C.border}`,background:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",color:C.text}}>🔓 Liberar</button>
                <button onClick={()=>{setVehiculoForm({placa:"",conductor:"",esOficial:true});setOpenModal("ingreso");}} style={{flex:1,padding:"10px",borderRadius:11,border:"none",background:C.text,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Estacionar Oficial</button>
              </div>
            </>
          ):celdaActiva?.estado==="ocupado"?(
            <>
              {[
                {icon:Car,label:"Placa",value:<span style={{fontFamily:"monospace",fontWeight:900}}>{celdaActiva.placa}{celdaActiva.esOficial&&<span style={{marginLeft:6,fontSize:9,background:C.primaryPale,color:C.primaryDark,padding:"1px 6px",borderRadius:4}}>OFICIAL</span>}</span>},
                {icon:MapPin,label:"Parqueadero",value:parqueaderoActivo?.nombre},
                {icon:Clock,label:"Ingreso",value:`${celdaActiva.fechaIngreso} ${celdaActiva.horaIngreso}`},
                {icon:Clock,label:"Estadía",value:celdaActiva.timestampIngreso?formatearDuracion(celdaActiva.timestampIngreso):"—"},
              ].map((r,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:11,background:"#F8FAFC",border:`1px solid ${C.border}`}}>
                  <r.icon size={14} color={C.textLight}/>
                  <div><div style={{fontSize:9,fontWeight:700,color:C.textLight,textTransform:"uppercase",letterSpacing:.5}}>{r.label}</div><div style={{fontSize:13,fontWeight:600,color:C.text}}>{r.value}</div></div>
                </div>
              ))}
              {/* edición inline */}
              <details style={{borderRadius:11,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                <summary style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:C.textLight,cursor:"pointer",background:"#F8FAFC"}}>Editar datos del vehículo</summary>
                <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:10,borderTop:`1px solid ${C.border}`}}>
                  <input value={vehiculoForm.placa} onChange={e=>setVehiculoForm(p=>({...p,placa:e.target.value.toUpperCase()}))} placeholder="Placa" style={{padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"monospace",fontWeight:700,background:"#F8FAFC"}}/>
                  <input value={vehiculoForm.conductor} onChange={e=>setVehiculoForm(p=>({...p,conductor:e.target.value}))} placeholder="Conductor" style={{padding:"9px 12px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:12,fontFamily:"inherit",background:"#F8FAFC"}}/>
                  <div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={guardarEdicion} style={{padding:"8px 14px",borderRadius:9,border:"none",background:C.text,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Guardar</button></div>
                </div>
              </details>
              <div style={{display:"flex",gap:8,paddingTop:4}}>
                <button onClick={handleToggleSena} style={{flex:1,padding:"10px",borderRadius:11,border:`1px solid ${C.border}`,background:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",color:C.text}}>🔒 Reservar</button>
                <button onClick={handleRequestLiberar} style={{flex:2,padding:"10px",borderRadius:11,border:"none",background:C.danger,color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 14px rgba(239,68,68,.25)"}}>Registrar Salida</button>
              </div>
            </>
          ):null}
        </div>
      </Modal>

      {/* Scanner OCR */}
      <Modal open={openModal==="scanner"} onClose={cerrarScanner} maxWidth={560}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1.4rem 1.8rem",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:38,height:38,borderRadius:10,background:C.primaryPale,display:"flex",alignItems:"center",justifyContent:"center"}}><ScanLine size={18} color={C.primary}/></div>
            <div>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:C.primary,textTransform:"uppercase"}}>Reconocimiento Óptico</div>
              <h2 style={{fontSize:18,fontWeight:900,color:C.text,lineHeight:1,margin:0}}>Escanear Placa</h2>
            </div>
          </div>
          <button onClick={cerrarScanner} style={{width:34,height:34,borderRadius:9,border:`1px solid ${C.border}`,background:"#fff",cursor:"pointer",color:C.textLight,display:"flex",alignItems:"center",justifyContent:"center"}}><X size={16}/></button>
        </div>
        <div style={{position:"relative",background:"#000",aspectRatio:"16/9",overflow:"hidden"}}>
          <video ref={videoRef} autoPlay playsInline muted onLoadedMetadata={()=>setCamaraLista(true)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div style={{width:"90%",maxWidth:560,aspectRatio:"16/9",border:`3px solid ${C.primary}`,borderRadius:12,boxShadow:`0 0 0 9999px rgba(15,23,42,.65)`}}/>
          </div>
          {!camaraLista&&!ocrError&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(15,23,42,.9)",color:"#fff"}}><Loader2 size={28} color={C.primary} style={{animation:"spin 1s linear infinite"}}/><span style={{fontSize:12,fontWeight:700}}>Iniciando cámara...</span></div>}
          {ocrLoading&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(15,23,42,.85)",color:"#fff"}}><Loader2 size={28} color={C.primary} style={{animation:"spin 1s linear infinite"}}/><span style={{fontSize:12,fontWeight:700,marginTop:8}}>Analizando matrícula...</span></div>}
          {ocrFlash&&<div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(57,169,0,.9)",color:"#fff"}}><CheckCircle2 size={36}/><span style={{fontSize:13,fontWeight:800,marginTop:8}}>¡Detectada!</span></div>}
        </div>
        {ocrError&&<div style={{padding:"12px 1.8rem",background:C.dangerBg,borderBottom:`1px solid ${C.dangerBorder}`}}><Banner tone="danger" message={ocrError}/></div>}
        <div style={{padding:"1rem 1.8rem",display:"flex",flexDirection:"column",gap:12,background:"#F8FAFC",borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
            <label style={{display:"flex",alignItems:"center",gap:6,padding:"10px 14px",borderRadius:11,border:`1px solid ${C.border}`,background:"#fff",fontSize:12,fontWeight:700,color:C.textLight,cursor:"pointer"}}>
              <Upload size={14}/>Cargar foto<input type="file" accept="image/*" onChange={handleFileOCR} style={{display:"none"}}/>
            </label>
            <button onClick={handleCaptureOcr} disabled={ocrLoading||!camaraLista} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 18px",borderRadius:11,border:"none",background:C.primary,color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 14px rgba(57,169,0,.25)"}}>
              <Camera size={15}/>Capturar
            </button>
          </div>
          <div>
            <div style={{fontSize:9,fontWeight:800,color:C.textLight,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Matrículas de prueba</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {PLACAS_DEMO.map(d=>(
                <button key={d.placa} onClick={()=>handleSimOCR(d.placa,d.conductor,d.rol)} disabled={ocrLoading} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${C.border}`,background:"#fff",fontSize:11,fontWeight:700,color:C.text,cursor:"pointer",fontFamily:"monospace"}}>
                  {d.placa} <span style={{fontFamily:"sans-serif",color:C.textLight,fontSize:9}}>({d.rol})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </Modal>

      <SmartAssignModal open={openModal==="smartAssign"} parqueaderos={state.parqueaderos} onClose={()=>{setOpenModal(null);setScannedPlate(undefined);setScannerOrigin(null);}} onAssign={handleSmartAssign} openScanner={()=>{setScannerOrigin("smartAssign");setOpenModal("scanner");}} scannedPlate={scannedPlate}/>
      <TicketModal open={openModal==="confirmLiberar"} ticket={activeTicket} onConfirm={handleConfirmarSalida} onCancel={()=>{setOpenModal("info");setActiveTicket(null);}}/>
      <ConfirmDialog open={openModal==="confirmDelete"} onConfirm={handleDelete} onCancel={()=>{setOpenModal(null);setPqDeleteId(null);}} title="Eliminar Parqueadero" message="¿Estás seguro de eliminar este parqueadero? Se perderán todas sus celdas y datos asociados." confirmLabel="Eliminar"/>
      <ConfirmDialog open={openModal==="confirmClearHistory"} onConfirm={()=>{dispatch({type:"CLEAR_HISTORIAL"});setOpenModal(null);}} onCancel={()=>setOpenModal(null)} title="Vaciar Historial" message="¿Confirmas que deseas vaciar el historial de salidas? Esta acción no se puede revertir." confirmLabel="Vaciar"/>
      <ToastStack toasts={state.toasts} onDismiss={id=>dispatch({type:"DISMISS_TOAST",id})}/>
    </>
  );
}

function getCarColor(placa: string) {
  // Deterministically pick a color for a car based on its plate string.
  // This provides consistent coloring across renders without external state.
  const palette = [
    "#0EA5A4", // teal
    "#06B6D4", // cyan
    "#7C3AED", // violet
    "#6366F1", // indigo
    "#EF4444", // red
    "#FB923C", // orange
    "#F59E0B", // amber
    "#10B981", // green
    "#3B82F6", // blue
    "#EC4899", // pink
    "#64748B", // slate
  ];

  if (!placa) return palette[0];

  // simple hash: sum char codes
  let h = 0;
  for (let i = 0; i < placa.length; i++) h = (h + placa.charCodeAt(i) * (i + 1)) >>> 0;
  return palette[h % palette.length];
}
