import { Car, Bike, Accessibility, Wind, Truck, Bus as BusIcon } from "lucide-react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero, TipoParqueadero, AccesoParqueadero } from "@/services/api/parqueaderos";
import type { Vehiculo } from "@/services/api/vehiculos";
import type { Conductor } from "@/services/api/conductores";
import {
  PLACA_CARRO_REGEX, PLACA_MOTO_REGEX, PLACA_REGEX,
  validarPlacaColombiana, validarPlacaCarro, validarPlacaMoto,
  validarPlacaPorTipo, tipoVehiculoDesdePlaca, esPlacaOficial,
} from "@/utils/validation";

export {
  PLACA_CARRO_REGEX, PLACA_MOTO_REGEX, PLACA_REGEX,
  validarPlacaColombiana, validarPlacaCarro, validarPlacaMoto,
  validarPlacaPorTipo, tipoVehiculoDesdePlaca, esPlacaOficial,
};

/* ============================================================
   TIPOS LOCALES DE UI
============================================================ */
export interface FormParqueadero {
  nombre: string;
  ubicacion: string;
  acceso: AccesoParqueadero;
  tipo: TipoParqueadero;
  capacidadMaxima: number;
  horaInicio: string;
  horaFin: string;
  zona: string;
  piso: string;
  descripcion: string;
  /** Cantidad de celdas por categoría. Al crear, se generan de una vez vía
   *  POST /celdas/parqueadero/:id/generar-lote. Al editar, se precargan con la cantidad
   *  ACTIVA real (ver useParqueaderoForm.ts#openEdit) y, al guardar, se reconcilian contra
   *  ese número — sube crea/reactiva celdas, baja desactiva solo las que estén libres (ver
   *  lib/celdasReconciliacion.ts). */
  celdasCarros: number;
  celdasMotos: number;
  celdasMovilidadReducida: number;
}

export interface VehiculoForm {
  placa: string;
  conductor: string;
  esOficial: boolean;
  marca: string;
  modelo: string;
  color: string;
}

export interface IncidenteForm {
  descripcion: string;
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
  inactiva:      { bg:"#F1F5F9", border:"#CBD5E1", text:"#475569", label:"Inactiva",      dotColor:"#94A3B8", mapFill:"#1c1f24", mapStroke:"#64748B" },
} as const;

/* Configuración visual por TIPO DE VEHÍCULO de la celda. `carro`/`moto`/`bicicleta`/`camion`/
   `bus` son los 5 valores reales de `Celda.tipo` en la API (antes solo estaban carro/moto
   mapeados aquí — una celda real de tipo "bicicleta", p. ej., cae al fallback de `carro` en
   getTipoCeldaConfig() y se ve/cuenta como si fuera de carro en todo el módulo: plano, tabla,
   tooltip, leyenda). `movilidad reducida` no es un `Celda.tipo` real (esa distinción vive en
   `Celda.usabilidad`) — se mantiene como bucket sintético para el chip de composición del
   plano (ver ParkingLot.tsx), que sí arma esa categoría a mano desde `usabilidad`. */
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
  bicicleta: {
    label: "Bicicleta",
    shortLabel: "Bici",
    icon: Wind,
    accent: "#10B981",      // verde
    accentSoft: "#D1FAE5",
    accentDark: "#047857",
  },
  camion: {
    label: "Camión",
    shortLabel: "Camión",
    icon: Truck,
    accent: "#8B5CF6",      // violeta
    accentSoft: "#EDE9FE",
    accentDark: "#6D28D9",
  },
  bus: {
    label: "Bus",
    shortLabel: "Bus",
    icon: BusIcon,
    accent: "#EF4444",      // rojo
    accentSoft: "#FEE2E2",
    accentDark: "#B91C1C",
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
  (TIPO_CELDA_CONFIG as unknown as Record<string, typeof TIPO_CELDA_CONFIG["carro"]>)[tipo] || TIPO_CELDA_CONFIG.carro;

export const TIPOS_PARQUEADERO: TipoParqueadero[] = ["general", "docentes", "administrativos", "aprendices", "visitantes", "motos", "vehiculo_sena"];
export const ACCESOS_PARQUEADERO: AccesoParqueadero[] = ["regional", "avenida_boyaca"];
export const capitalizar = (s:string) => s.charAt(0).toUpperCase() + s.slice(1);

export const CONDUCTORES_SUGERIDOS = [
  "Andrés Felipe Montoya","Claudia Patricia Restrepo","Juan Carlos Gómez",
  "María Camila Torres","Diego Alejandro Castro","Sofía Elena Herrera",
  "Luis Fernando Díaz","Paula Andrea Luna",
];

export const PLACAS_DEMO = [
  { placa:"KLO234", conductor:"Carlos Mario Ruiz",      tipo:"carro", rol:"Docente",    marca:"Chevrolet", modelo:"Spark GT", color:"Gris" },
  { placa:"MHX75E", conductor:"Liliana Patricia Castro", tipo:"moto",  rol:"Estudiante", marca:"Yamaha",    modelo:"FZ 25",    color:"Negro" },
  { placa:"SNA012", conductor:"Oficial CEET SENA",       tipo:"carro", rol:"Oficial",    marca:"Renault",   modelo:"Duster",   color:"Blanco" },
  { placa:"VIP789", conductor:"Héctor Fabio Jurado",     tipo:"carro", rol:"Visitante",  marca:"Mazda",     modelo:"3",        color:"Azul" },
];

/* SVG medidas
   Celdas un poco más grandes que antes (52x34 -> 60x42) para poder mostrar
   la placa siempre visible sobre el vehículo (no solo al pasar el mouse),
   clave para que un vigilante identifique carros de un vistazo o al tacto
   en una tablet, sin depender de hover. */
export const SPACE_W=60,SPACE_H=42,GAP_X=7,ROW_GAP=10,LANE_H=46,PADDING=50,
      SECTION_GAP=48,ROAD_Y=74,ROAD_H=38,HEADER_BLOCK=58;

/* ============================================================
   UTILS
============================================================ */
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
  if(l.length===6){
    if(PLACA_REGEX.test(l)) return l;
    return intentarCorregirPlaca(l);
  }
  // Moto sin letra final (formato antiguo/desgastado): solo se valida tal cual,
  // sin intentar corrección de caracteres ambiguos (serían 5 posiciones, no 6).
  if(l.length===5 && PLACA_MOTO_REGEX.test(l)) return l;
  return null;
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
export const UBICACION_PQ_MAX = 120;
export const DESCRIPCION_PQ_MAX = 200;

/** Valida el formulario de creación/edición de un parqueadero.
 *  `excludeId` es el id del parqueadero que se está editando (para no chocar consigo mismo),
 *  o null cuando se está creando uno nuevo — eso también decide qué se valida: al crear no
 *  se piden horarios (quedan con su valor por defecto, editables después) y en cambio se
 *  exige al menos una celda para generar; al editar es al revés.
 *  Devuelve el mensaje de error o null si es válido. */
export function validarFormParqueadero(form: FormParqueadero, parqueaderos: Parqueadero[], excludeId: string | null): string | null {
  const esCreacion = excludeId === null;
  const nombre = normalizarTexto(form.nombre, NOMBRE_PQ_MAX);
  const ubicacion = form.ubicacion.trim();
  if (!nombre) return "El nombre es obligatorio.";
  if (nombre.length < 3) return "El nombre debe tener al menos 3 caracteres.";
  if (!ubicacion) return "La ubicación es obligatoria.";
  if (parqueaderos.some(p => p.id !== excludeId && p.nombre.trim().toLowerCase() === nombre.toLowerCase())) return `Ya existe un parqueadero llamado "${nombre}".`;
  if (ubicacion.length > UBICACION_PQ_MAX) return `La ubicación no puede superar ${UBICACION_PQ_MAX} caracteres.`;

  if (esCreacion) {
    if (form.celdasCarros + form.celdasMotos + form.celdasMovilidadReducida <= 0) {
      return "Debes indicar al menos una celda (carro, moto o movilidad reducida) para generar.";
    }
    return null;
  }

  if (!form.horaInicio || !form.horaFin) return "Debes definir la hora de apertura y de cierre.";
  if (horaAMinutos(form.horaFin) <= horaAMinutos(form.horaInicio)) return "La hora de cierre debe ser posterior a la hora de apertura.";
  if (form.capacidadMaxima <= 0) return "La capacidad máxima debe ser mayor a cero.";
  if (form.descripcion.trim().length > DESCRIPCION_PQ_MAX) return `La descripción no puede superar ${DESCRIPCION_PQ_MAX} caracteres.`;
  return null;
}

export interface EvaluacionEliminacionParqueadero {
  eliminable: boolean;
  /** Motivo específico cuando no es eliminable — cuenta cada tipo de relación por separado
   *  para que el mensaje diga exactamente qué hay (no un "Error al eliminar" genérico). */
  motivo?: string;
}

/**
 * Decide si un parqueadero se puede eliminar físicamente (DELETE real) o si hay que
 * conservarlo (desactivarlo en su lugar) porque tiene relaciones que representan trazabilidad
 * real: celdas propias, ingresos/salidas, reservas (por sus celdas) o incidentes reportados.
 * Cualquiera de esas relaciones, aunque ya esté cerrada/histórica, bloquea el borrado físico —
 * es exactamente el dato que un DELETE en cascada perdería. Un parqueadero sin ninguna (p. ej.
 * uno recién creado cuya generación de celdas falló) sí se puede eliminar de verdad.
 */
export function evaluarEliminacionParqueadero(
  parqueaderoId: string,
  celdas: Celda[],
  controlesSalida: { parqueaderoId: string }[],
  reservas: { celdaId: string }[],
  incidentes: { parqueaderoId: string }[]
): EvaluacionEliminacionParqueadero {
  const celdasPq = celdas.filter((c) => c.parqueaderoId === parqueaderoId);
  const celdaIds = new Set(celdasPq.map((c) => c.id));
  const ingresosPq = controlesSalida.filter((r) => r.parqueaderoId === parqueaderoId);
  const reservasPq = reservas.filter((r) => celdaIds.has(r.celdaId));
  const incidentesPq = incidentes.filter((i) => i.parqueaderoId === parqueaderoId);

  if (!celdasPq.length && !ingresosPq.length && !reservasPq.length && !incidentesPq.length) {
    return { eliminable: true };
  }

  const partes: string[] = [];
  if (celdasPq.length) partes.push(`${celdasPq.length} celda(s)`);
  if (ingresosPq.length) partes.push(`${ingresosPq.length} registro(s) de ingreso/salida`);
  if (reservasPq.length) partes.push(`${reservasPq.length} reserva(s)`);
  if (incidentesPq.length) partes.push(`${incidentesPq.length} incidente(s)`);

  return {
    eliminable: false,
    motivo: `No se puede eliminar: tiene ${partes.join(", ")} asociados que deben conservarse por trazabilidad. Desactívalo en su lugar (columna Estado) para dejar de usarlo sin perder ese historial.`,
  };
}
/* Busca una línea etiquetada (p.ej. "MARCA: TOYOTA") y devuelve su valor: lo que sigue
   a la etiqueta en la misma línea o, si no hay nada ahí, el contenido de la línea siguiente
   (algunos documentos traen la etiqueta y el valor en renglones separados). */
const extraerCampoPorEtiqueta = (lineas: string[], etiquetaRegex: RegExp): string => {
  const idx = lineas.findIndex(l => etiquetaRegex.test(l));
  if (idx === -1) return "";
  const mismaLinea = lineas[idx].replace(etiquetaRegex, "").replace(/^[\s:#-]+/, "").trim();
  const candidato = (mismaLinea && /[A-ZÁÉÍÓÚÑ0-9]{2,}/i.test(mismaLinea)) ? mismaLinea : (lineas[idx + 1] || "");
  return normalizarTexto(candidato.replace(/[^A-ZÁÉÍÓÚÑ0-9\s-]/gi, " "), 40);
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
  /* MARCA y LÍNEA (nombre/versión del modelo, p.ej. "COROLLA") son campos estándar de la
     tarjeta de propiedad colombiana; "MODELO" en ese documento es el año, así que si no
     aparece LÍNEA se usa MODELO como respaldo en vez de dejar el campo vacío. */
  const marca = extraerCampoPorEtiqueta(lineas, /^MARCA\b/i);
  const modelo = extraerCampoPorEtiqueta(lineas, /^L[ÍI]NEA\b/i) || extraerCampoPorEtiqueta(lineas, /^MODELO\b/i);
  const color = extraerCampoPorEtiqueta(lineas, /^COLOR\b/i);
  return { placa, conductor:normalizarTexto(conductor,60), marca, modelo, color, textoCompleto:limpio };
}

/* ============================================================
   HORARIO GLOBAL DE OPERACIÓN
============================================================ */
/* Espejo del horario que debe validar el backend (05:00–21:00) en
   Api-ParkU/src/config/horarioOperacion.js — repos separados, sin paquete
   compartido, así que se duplica acá. El valor de apertura se corrigió de
   "04:00" a "05:00" (regla de negocio actualizada) — esto SOLO cambia el
   indicador visual y las validaciones de este repo; si el archivo del
   backend sigue en "04:00", hay que actualizarlo ahí también, porque es
   quien realmente bloquea crear reservas/ingresos fuera de esta ventana
   (acá antes solo se usaba para marcar celdas que quedaron ocupadas
   después de que cerró la ventana — ahora también para validar antes de
   enviar una reserva, ver useReservaCelda.ts/useSolicitarReserva.ts). */
export const HORA_OPERACION_INICIO = "05:00";
export const HORA_OPERACION_FIN = "21:00";

export const estaFueraDeHorarioOperacion = (fecha: Date = new Date()): boolean => {
  const hhmm = `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`;
  return hhmm < HORA_OPERACION_INICIO || hhmm > HORA_OPERACION_FIN;
};

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
