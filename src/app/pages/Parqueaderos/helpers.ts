import { Car, Bike, Accessibility } from "lucide-react";
import type { Celda, Parqueadero, Vehiculo, Conductor } from "../../context/DataContext";

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
export const SPACE_W=46,SPACE_H=28,GAP_X=4,ROW_GAP=6,LANE_H=40,PADDING=50,
      SECTION_GAP=45,ROAD_Y=16,ROAD_H=38,HEADER_BLOCK=58;

/* ============================================================
   UTILS
============================================================ */
/* Placas colombianas — formatos vigentes (Resolución RUNT):
   · Automóviles / camperos / camionetas / servicio público: 3 letras + 3 números  → ABC123
   · Motocicletas: 3 letras + 2 números + 1 letra final                            → ABC12D
   Ambos formatos tienen siempre 6 caracteres; se validan por separado para poder
   detectar el tipo de vehículo a partir de la placa y para poder exigir que la
   placa capturada coincida con el tipo de celda (carro/moto) donde se registra. */
export const PLACA_CARRO_REGEX = /^[A-Z]{3}[0-9]{3}$/;
export const PLACA_MOTO_REGEX  = /^[A-Z]{3}[0-9]{2}[A-Z]$/;
export const PLACA_REGEX = /^([A-Z]{3}[0-9]{3}|[A-Z]{3}[0-9]{2}[A-Z])$/;

export const validarPlacaColombiana = (p:string) => PLACA_REGEX.test(p.trim().toUpperCase());
export const validarPlacaCarro = (p:string) => PLACA_CARRO_REGEX.test(p.trim().toUpperCase());
export const validarPlacaMoto  = (p:string) => PLACA_MOTO_REGEX.test(p.trim().toUpperCase());

/** Determina si una placa válida corresponde a carro o a moto según su formato. */
export const tipoVehiculoDesdePlaca = (p:string): "carro" | "moto" | null => {
  const v = p.trim().toUpperCase();
  if (PLACA_CARRO_REGEX.test(v)) return "carro";
  if (PLACA_MOTO_REGEX.test(v))  return "moto";
  return null;
};

/** Valida una placa exigiendo que su formato coincida con el tipo de celda/vehículo.
 *  Las celdas de movilidad reducida aceptan tanto formato de carro como de moto. */
export const validarPlacaPorTipo = (p:string, tipo:"carro"|"moto"|"movilidad reducida"): boolean => {
  const v = p.trim().toUpperCase();
  if (tipo === "carro") return PLACA_CARRO_REGEX.test(v);
  if (tipo === "moto")  return PLACA_MOTO_REGEX.test(v);
  return PLACA_CARRO_REGEX.test(v) || PLACA_MOTO_REGEX.test(v);
};

export const esPlacaOficial = (placa:string) => /^(SNA|OFI)/.test(placa.trim().toUpperCase());

const l2d:Record<string,string>={O:"0",I:"1",S:"5",B:"8",Z:"2",G:"6",D:"0",Q:"0"};
const d2l:Record<string,string>={"0":"O","1":"I","5":"S","8":"B","2":"Z","6":"G"};
/* Corrige un carácter mal leído por el OCR según la posición esperada:
   letra (primeras 3), dígito (posiciones 4-5) o letra final (moto, posición 6). */
const corregirCaracter=(c:string,esperaLetra:boolean)=>{
  if(esperaLetra&&/[0-9]/.test(c)) return d2l[c]||c;
  if(!esperaLetra&&/[A-Z]/.test(c)) return l2d[c]||c;
  return c;
};
/* Intenta corregir un token de 6 caracteres probando AMBOS formatos posibles
   (carro: LLLDDD, moto: LLLDDL), ya que el OCR no sabe de antemano cuál es. */
const intentarCorregirPlaca=(s:string):string|null=>{
  if(s.length!==6) return null;
  if(PLACA_REGEX.test(s)) return s;
  const ch=s.split("");
  const comoCarro=ch.map((c,i)=>corregirCaracter(c,i<3)).join("");
  if(PLACA_CARRO_REGEX.test(comoCarro)) return comoCarro;
  const comoMoto=ch.map((c,i)=>corregirCaracter(c,i<3||i===5)).join("");
  if(PLACA_MOTO_REGEX.test(comoMoto)) return comoMoto;
  return null;
};
const intentarTokenComoPlaca=(tok:string)=>{
  const l=tok.toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(l.length!==6) return null;
  if(PLACA_REGEX.test(l)) return l;
  return intentarCorregirPlaca(l);
};
export const limpiarTextoOCR=(raw:string)=>{
  const tokens=raw.toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
  for(const t of tokens){ const c=intentarTokenComoPlaca(t); if(c) return c; }
  for(let i=0;i<tokens.length-1;i++){ const c=intentarTokenComoPlaca(tokens[i]+tokens[i+1]); if(c) return c; }
  return "";
};
export const normalizarTexto=(t:string,max=60)=>t.trim().replace(/\s+/g," ").slice(0,max);
/** Nombre de conductor válido: al menos nombre y apellido (2 palabras), solo letras. */
export const validarNombreConductor=(n:string)=>{
  const t=normalizarTexto(n,60);
  return t.length>=3 && /^[A-ZÁÉÍÓÚÑÜ]+(\s[A-ZÁÉÍÓÚÑÜ]+)+$/i.test(t);
};
export const horaAMinutos=(hhmm:string)=>{ const [h,m]=hhmm.split(":").map(Number); return h*60+(m||0); };
export const formatearFechaHora=(iso:string)=>{
  const d=new Date(iso);
  return { fecha:d.toLocaleDateString("es-CO"), hora:d.toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}) };
};
export const formatearDuracion=(iso:string)=>{
  const m=Math.max(0,Math.floor((Date.now()-new Date(iso).getTime())/60000));
  const h=Math.floor(m/60); const min=m%60;
  return h>0?`${h}h ${min}m`:`${min}m`;
};

/* ============================================================
   VALIDACIÓN DEL FORMULARIO DE PARQUEADERO (crear / editar)
============================================================ */
export const NOMBRE_PQ_MAX = 60;
export const BLOQUE_PQ_MAX = 15;
export const DIRECCION_PQ_MAX = 120;
export const DESCRIPCION_PQ_MAX = 200;
/* Letras (con tildes/ñ), números, espacios y guiones; debe empezar con letra o número. */
export const BLOQUE_PQ_REGEX = /^[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9\s-]*$/;

/** Valida el formulario de creación/edición de un parqueadero.
 *  `excludeId` es el id del parqueadero que se está editando (para no chocar consigo mismo),
 *  o null cuando se está creando uno nuevo. Devuelve el mensaje de error o null si es válido. */
export function validarFormParqueadero(form: FormParqueadero, parqueaderos: Parqueadero[], excludeId: string | null): string | null {
  const nombre = normalizarTexto(form.nombre, NOMBRE_PQ_MAX);
  const bloque = form.bloque.trim();
  if (!nombre) return "El nombre es obligatorio.";
  if (nombre.length < 3) return "El nombre debe tener al menos 3 caracteres.";
  if (!bloque) return "El bloque es obligatorio.";
  if (bloque.length > BLOQUE_PQ_MAX || !BLOQUE_PQ_REGEX.test(bloque)) return "El bloque solo puede tener letras, números, espacios y guiones (máx. 15 caracteres).";
  if (parqueaderos.some(p => p.id !== excludeId && p.nombre.trim().toLowerCase() === nombre.toLowerCase())) return `Ya existe un parqueadero llamado "${nombre}".`;
  if (parqueaderos.some(p => p.id !== excludeId && p.bloque.trim().toLowerCase() === bloque.toLowerCase())) return `Ya existe el bloque "${bloque}".`;
  if (!form.horaInicio || !form.horaFin) return "Debes definir la hora de apertura y de cierre.";
  if (horaAMinutos(form.horaFin) <= horaAMinutos(form.horaInicio)) return "La hora de cierre debe ser posterior a la hora de apertura.";
  const capacidad = form.celdasCarros + form.celdasMotos + form.celdasMovilidadReducida;
  if (capacidad <= 0) return "Debe definir al menos una celda (carro, moto o movilidad reducida).";
  if (form.direccion.trim().length > DIRECCION_PQ_MAX) return `La dirección no puede superar ${DIRECCION_PQ_MAX} caracteres.`;
  if (form.descripcion.trim().length > DESCRIPCION_PQ_MAX) return `La descripción no puede superar ${DESCRIPCION_PQ_MAX} caracteres.`;
  return null;
}
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
export interface Ocupante {
  vehiculo: Vehiculo;
  conductor?: Conductor;
  esOficial: boolean;
  controlId: string;
  fechaEntrada: string;
}
