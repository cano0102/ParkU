´´´´tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useReducer,
  useCallback,
  useState,
  memo,
} from "react";
import {
  Car,
  Plus,
  Pencil,
  Trash2,
  X,
  Camera,
  ParkingCircle,
  Shield,
  LayoutGrid,
  Map as MapIcon,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Zap,
  Clock,
  LogOut,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ScanLine,
  Hand,
} from "lucide-react";
import { createWorker } from "tesseract.js";

/* ============================================================
   TEMA / CONSTANTES
============================================================ */

const COLORS = {
  primary: "#39A900",
  primaryDark: "#2D7D00",
  primaryLight: "#B3E6A1",
  primaryPale: "#EAF7E6",
  background: "#F5F7F8",
  surface: "#FFFFFF",
  text: "#000000",
  textLight: "#64748B",
  border: "#E2E8F0",
  dark: "#000000",
  danger: "#EF4444",
  dangerBg: "#FEE2E2",
  dangerBorder: "#FECACA",
  success: "#16A34A",
  successBg: "#DCFCE7",
  info: "#3B82F6",
  infoBg: "#EFF6FF",
  amber: "#F59E0B",
  amberBg: "#FEF3C7",
};

// Paleta exclusiva del mapa (vista aérea tipo "plano de asfalto")
const MAP_THEME = {
  asphalt: "#22262b",
  asphaltPanel: "#2a2f35",
  road: "#34393f",
  roadLine: "#f4f4f4",
  laneTextDim: "rgba(244,244,244,.35)",
  panelBorder: "rgba(255,255,255,.08)",
  textBright: "#f4f4f4",
  textDim: "rgba(244,244,244,.62)",
};

type CeldaEstado = "libre" | "ocupado" | "sena";

interface Celda {
  codigo: string;
  estado: CeldaEstado;
  placa?: string;
  conductor?: string;
  fechaIngreso?: string;
  horaIngreso?: string;
  timestampIngreso?: number;
}

interface Parqueadero {
  id: number;
  nombre: string;
  total: number;
  celdas: Celda[];
  bloque: string;
  tipo: string;
}

interface CeldaConfigItem {
  bg: string;
  border: string;
  text: string;
  label: string;
  dotColor: string;
  mapFill: string;
  mapStroke: string;
}

const CELDA_CONFIG: Record<CeldaEstado, CeldaConfigItem> = {
  libre: {
    bg: "#F0FBE8",
    border: "#A8D888",
    text: "#2F6B00",
    label: "Libre",
    dotColor: "#4CAF50",
    mapFill: "#1f2a22",
    mapStroke: "#4CAF50",
  },
  ocupado: {
    bg: "#1A1A1A",
    border: "#EF4444",
    text: "#FFFFFF",
    label: "Ocupado",
    dotColor: "#EF4444",
    mapFill: "#2c1414",
    mapStroke: "#EF4444",
  },
  sena: {
    bg: "#FFFBEB",
    border: "#FCD34D",
    text: "#78350F",
    label: "SENA",
    dotColor: "#F59E0B",
    mapFill: "#332a10",
    mapStroke: "#F59E0B",
  },
};

const TIPOS_PARQUEADERO = ["General", "Motos", "Visitantes", "Docentes", "Administrativos"] as const;

const CONDUCTORES_SUGERIDOS = [
  "Carlos Ramirez",
  "Laura Torres",
  "Andres Perez",
  "Maria Gomez",
  "Daniel Castro",
  "Sofia Herrera",
  "Roberto Diaz",
  "Patricia Luna",
];

/* ============================================================
   UTILIDADES
============================================================ */

// Carros: ABC123  |  Motos: ABC12D  |  Diplomático/otros: AAA11A
const PLACA_REGEX = /^[A-Z]{3}\d{2}[A-Z0-9]$/;

const validarPlacaColombiana = (placa: string): boolean => PLACA_REGEX.test(placa.trim().toUpperCase());

const limpiarTextoOCR = (raw: string): string => {
  const soloAlfanum = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (let i = 0; i <= soloAlfanum.length - 6; i++) {
    const candidato = soloAlfanum.slice(i, i + 6);
    if (PLACA_REGEX.test(candidato)) return candidato;
  }
  return soloAlfanum.slice(0, 6);
};

const normalizarTexto = (texto: string, maxLen = 60): string => texto.trim().replace(/\s+/g, " ").slice(0, maxLen);

const formatearFechaHora = (ts: number): { fecha: string; hora: string } => {
  const d = new Date(ts);
  return {
    fecha: d.toLocaleDateString("es-CO"),
    hora: d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
  };
};

const formatearDuracion = (ts: number): string => {
  const totalMin = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/** Genera/recalcula las celdas de un parqueadero a partir de bloque + total,
 *  preservando el estado de las celdas anteriores por posición cuando existe. */
const regenerarCeldas = (bloque: string, total: number, anteriores: Celda[] = []): Celda[] =>
  Array.from({ length: total }, (_, i) => {
    const codigo = `${bloque.toUpperCase()}${String(i + 1).padStart(2, "0")}`;
    const previa = anteriores[i];
    if (previa) return { ...previa, codigo };
    return { codigo, estado: "libre" as CeldaEstado };
  });

/** Celdas que se perderían (con vehículo o reservadas) si se reduce el total. */
const celdasComprometidasAlReducir = (celdas: Celda[], nuevoTotal: number): Celda[] =>
  celdas.slice(nuevoTotal).filter((c) => c.estado !== "libre");

/* ============================================================
   ESTADO GLOBAL (useReducer)
============================================================ */

type ModalKey = "create" | "edit" | "ingreso" | "info" | "scanner" | "confirmDelete" | "confirmLiberar" | null;

interface FormParqueadero {
  nombre: string;
  total: number;
  bloque: string;
  tipo: string;
}

interface VehiculoForm {
  placa: string;
  conductor: string;
}

interface ToastItem {
  id: number;
  tone: "success" | "danger" | "info";
  message: string;
}

interface State {
  view: "cards" | "map";
  parqueaderos: Parqueadero[];
  activeModal: ModalKey;
  parqueaderoEditandoId: number | null;
  parqueaderoEliminandoId: number | null;
  celdaActiva: { parqueaderoId: number; codigo: string } | null;
  form: FormParqueadero;
  formError: string | null;
  vehiculoForm: VehiculoForm;
  placaError: string | null;
  ocrLoading: boolean;
  ocrError: string | null;
  ocrSuccessFlash: boolean;
  camaraLista: boolean;
  toasts: ToastItem[];
}

type Action =
  | { type: "SET_VIEW"; view: "cards" | "map" }
  | { type: "OPEN_MODAL"; modal: ModalKey }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_FORM"; form: Partial<FormParqueadero> }
  | { type: "RESET_FORM"; form: FormParqueadero }
  | { type: "SET_FORM_ERROR"; error: string | null }
  | { type: "CREATE_PARQUEADERO"; parqueadero: Parqueadero }
  | { type: "EDIT_PARQUEADERO"; id: number; nombre: string; tipo: string; bloque: string; total: number }
  | { type: "REQUEST_DELETE"; id: number }
  | { type: "CONFIRM_DELETE" }
  | { type: "OPEN_EDIT"; parqueadero: Parqueadero }
  | { type: "SELECT_CELDA"; parqueaderoId: number; codigo: string; estado: CeldaEstado }
  | { type: "SET_VEHICULO_FORM"; form: Partial<VehiculoForm> }
  | { type: "SET_PLACA_ERROR"; error: string | null }
  | { type: "REGISTRAR_VEHICULO"; placa: string; conductor: string }
  | { type: "REQUEST_LIBERAR" }
  | { type: "CONFIRM_LIBERAR" }
  | { type: "OCR_START" }
  | { type: "OCR_ERROR"; error: string }
  | { type: "OCR_SUCCESS"; placa: string }
  | { type: "CAMERA_READY" }
  | { type: "ADD_TOAST"; toast: ToastItem }
  | { type: "DISMISS_TOAST"; id: number };

const initialParqueaderos: Parqueadero[] = [
  {
    id: 1,
    nombre: "CARRIL 01 — ZONA CENTRAL",
    bloque: "A",
    tipo: "General",
    total: 12,
    celdas: [
      { codigo: "A01", estado: "libre" },
      { codigo: "A02", estado: "ocupado", placa: "ABC123", conductor: "Carlos Ramirez", timestampIngreso: Date.now() - 1000 * 60 * 95, ...formatearFechaHora(Date.now() - 1000 * 60 * 95) },
      { codigo: "A03", estado: "libre" },
      { codigo: "A04", estado: "sena" },
      { codigo: "A05", estado: "libre" },
      { codigo: "A06", estado: "ocupado", placa: "XYZ987", conductor: "Laura Torres", timestampIngreso: Date.now() - 1000 * 60 * 40, ...formatearFechaHora(Date.now() - 1000 * 60 * 40) },
      { codigo: "A07", estado: "libre" },
      { codigo: "A08", estado: "libre" },
      { codigo: "A09", estado: "ocupado", placa: "DEF456", conductor: "Andres Perez", timestampIngreso: Date.now() - 1000 * 60 * 12, ...formatearFechaHora(Date.now() - 1000 * 60 * 12) },
      { codigo: "A10", estado: "libre" },
      { codigo: "A11", estado: "sena" },
      { codigo: "A12", estado: "libre" },
    ],
  },
  {
    id: 2,
    nombre: "CARRIL 02 — ZONA NORTE",
    bloque: "B",
    tipo: "Motos",
    total: 10,
    celdas: [
      { codigo: "B01", estado: "libre" },
      { codigo: "B02", estado: "ocupado", placa: "MOT01D", conductor: "Maria Gomez", timestampIngreso: Date.now() - 1000 * 60 * 20, ...formatearFechaHora(Date.now() - 1000 * 60 * 20) },
      { codigo: "B03", estado: "libre" },
      { codigo: "B04", estado: "libre" },
      { codigo: "B05", estado: "sena" },
      { codigo: "B06", estado: "ocupado", placa: "MOT02D", conductor: "Daniel Castro", timestampIngreso: Date.now() - 1000 * 60 * 65, ...formatearFechaHora(Date.now() - 1000 * 60 * 65) },
      { codigo: "B07", estado: "libre" },
      { codigo: "B08", estado: "libre" },
      { codigo: "B09", estado: "libre" },
      { codigo: "B10", estado: "ocupado", placa: "MOT03D", conductor: "Sofia Herrera", timestampIngreso: Date.now() - 1000 * 60 * 5, ...formatearFechaHora(Date.now() - 1000 * 60 * 5) },
    ],
  },
  {
    id: 3,
    nombre: "CARRIL 03 — ZONA SUR",
    bloque: "C",
    tipo: "Visitantes",
    total: 8,
    celdas: [
      { codigo: "C01", estado: "ocupado", placa: "VIS001", conductor: "Roberto Diaz", timestampIngreso: Date.now() - 1000 * 60 * 200, ...formatearFechaHora(Date.now() - 1000 * 60 * 200) },
      { codigo: "C02", estado: "libre" },
      { codigo: "C03", estado: "sena" },
      { codigo: "C04", estado: "libre" },
      { codigo: "C05", estado: "ocupado", placa: "VIS002", conductor: "Patricia Luna", timestampIngreso: Date.now() - 1000 * 60 * 30, ...formatearFechaHora(Date.now() - 1000 * 60 * 30) },
      { codigo: "C06", estado: "libre" },
      { codigo: "C07", estado: "libre" },
      { codigo: "C08", estado: "libre" },
    ],
  },
];

const initialForm: FormParqueadero = { nombre: "", total: 10, bloque: "D", tipo: "General" };

const initialState: State = {
  view: "map",
  parqueaderos: initialParqueaderos,
  activeModal: null,
  parqueaderoEditandoId: null,
  parqueaderoEliminandoId: null,
  celdaActiva: null,
  form: initialForm,
  formError: null,
  vehiculoForm: { placa: "", conductor: "" },
  placaError: null,
  ocrLoading: false,
  ocrError: null,
  ocrSuccessFlash: false,
  camaraLista: false,
  toasts: [],
};

let toastSeq = 1;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.view };

    case "OPEN_MODAL":
      return {
        ...state,
        activeModal: action.modal,
        formError: null,
        placaError: null,
        ocrError: null,
        ocrSuccessFlash: false,
        camaraLista: action.modal === "scanner" ? false : state.camaraLista,
      };

    case "CLOSE_MODAL":
      return { ...state, activeModal: null };

    case "SET_FORM":
      return { ...state, form: { ...state.form, ...action.form }, formError: null };

    case "RESET_FORM":
      return { ...state, form: action.form, formError: null };

    case "SET_FORM_ERROR":
      return { ...state, formError: action.error };

    case "CREATE_PARQUEADERO":
      return {
        ...state,
        parqueaderos: [...state.parqueaderos, action.parqueadero],
        activeModal: null,
        form: initialForm,
        toasts: [...state.toasts, { id: toastSeq++, tone: "success", message: `Parqueadero "${action.parqueadero.nombre}" creado.` }],
      };

    case "OPEN_EDIT":
      return {
        ...state,
        parqueaderoEditandoId: action.parqueadero.id,
        form: {
          nombre: action.parqueadero.nombre,
          total: action.parqueadero.total,
          bloque: action.parqueadero.bloque,
          tipo: action.parqueadero.tipo,
        },
        activeModal: "edit",
        formError: null,
      };

    case "EDIT_PARQUEADERO":
      return {
        ...state,
        parqueaderos: state.parqueaderos.map((p) => {
          if (p.id !== action.id) return p;
          const celdas = regenerarCeldas(action.bloque, action.total, p.celdas);
          return { ...p, nombre: action.nombre, tipo: action.tipo, bloque: action.bloque.toUpperCase(), total: action.total, celdas };
        }),
        activeModal: null,
        parqueaderoEditandoId: null,
        toasts: [...state.toasts, { id: toastSeq++, tone: "success", message: "Parqueadero actualizado." }],
      };

    case "REQUEST_DELETE":
      return { ...state, parqueaderoEliminandoId: action.id, activeModal: "confirmDelete" };

    case "CONFIRM_DELETE":
      return {
        ...state,
        parqueaderos: state.parqueaderos.filter((p) => p.id !== state.parqueaderoEliminandoId),
        activeModal: null,
        parqueaderoEliminandoId: null,
        toasts: [...state.toasts, { id: toastSeq++, tone: "info", message: "Parqueadero eliminado." }],
      };

    case "SELECT_CELDA": {
      const modal: ModalKey = action.estado === "ocupado" ? "info" : "ingreso";
      return {
        ...state,
        celdaActiva: { parqueaderoId: action.parqueaderoId, codigo: action.codigo },
        vehiculoForm: { placa: "", conductor: "" },
        placaError: null,
        activeModal: modal,
      };
    }

    case "SET_VEHICULO_FORM":
      return { ...state, vehiculoForm: { ...state.vehiculoForm, ...action.form }, placaError: null };

    case "SET_PLACA_ERROR":
      return { ...state, placaError: action.error };

    case "REGISTRAR_VEHICULO": {
      if (!state.celdaActiva) return state;
      const now = Date.now();
      const { fecha, hora } = formatearFechaHora(now);
      return {
        ...state,
        parqueaderos: state.parqueaderos.map((parq) => {
          if (parq.id !== state.celdaActiva!.parqueaderoId) return parq;
          return {
            ...parq,
            celdas: parq.celdas.map((c) =>
              c.codigo !== state.celdaActiva!.codigo
                ? c
                : {
                    ...c,
                    estado: "ocupado",
                    placa: action.placa,
                    conductor: action.conductor,
                    fechaIngreso: fecha,
                    horaIngreso: hora,
                    timestampIngreso: now,
                  }
            ),
          };
        }),
        activeModal: null,
        placaError: null,
        toasts: [...state.toasts, { id: toastSeq++, tone: "success", message: `Vehículo ${action.placa} registrado en ${state.celdaActiva.codigo}.` }],
      };
    }

    case "REQUEST_LIBERAR":
      return { ...state, activeModal: "confirmLiberar" };

    case "CONFIRM_LIBERAR": {
      if (!state.celdaActiva) return state;
      const codigo = state.celdaActiva.codigo;
      return {
        ...state,
        parqueaderos: state.parqueaderos.map((parq) => {
          if (parq.id !== state.celdaActiva!.parqueaderoId) return parq;
          return {
            ...parq,
            celdas: parq.celdas.map((c) =>
              c.codigo !== state.celdaActiva!.codigo ? c : { codigo: c.codigo, estado: "libre" as CeldaEstado }
            ),
          };
        }),
        activeModal: null,
        celdaActiva: null,
        toasts: [...state.toasts, { id: toastSeq++, tone: "info", message: `Celda ${codigo} liberada.` }],
      };
    }

    case "OCR_START":
      return { ...state, ocrLoading: true, ocrError: null, ocrSuccessFlash: false };

    case "OCR_ERROR":
      return { ...state, ocrLoading: false, ocrError: action.error };

    case "OCR_SUCCESS":
      return {
        ...state,
        ocrLoading: false,
        ocrError: null,
        ocrSuccessFlash: true,
        vehiculoForm: { ...state.vehiculoForm, placa: action.placa },
      };

    case "CAMERA_READY":
      return { ...state, camaraLista: true };

    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };

    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    default:
      return state;
  }
}

/* ============================================================
   ESTILOS COMPARTIDOS
============================================================ */

const inputStyle: React.CSSProperties = {
  height: 48,
  width: "100%",
  borderRadius: 12,
  border: `1.5px solid ${COLORS.border}`,
  padding: "0 16px",
  fontSize: 14,
  fontWeight: 500,
  color: COLORS.text,
  background: COLORS.surface,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: COLORS.textLight,
  marginBottom: 6,
  textTransform: "uppercase",
  letterSpacing: ".06em",
};

const btnPrimary: React.CSSProperties = {
  height: 46,
  borderRadius: 12,
  border: "none",
  background: COLORS.primary,
  fontSize: 13,
  fontWeight: 800,
  color: "#fff",
  cursor: "pointer",
  transition: "background 0.15s ease",
};

const btnSecondary: React.CSSProperties = {
  height: 46,
  borderRadius: 12,
  border: `1.5px solid ${COLORS.border}`,
  background: COLORS.surface,
  fontSize: 13,
  fontWeight: 700,
  color: COLORS.textLight,
  cursor: "pointer",
  transition: "border-color 0.15s ease, background 0.15s ease",
};

const iconBtnStyle: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: COLORS.textLight,
  transition: "border-color 0.15s ease, background 0.15s ease",
};

/* ============================================================
   COMPONENTES BASE: Modal / ConfirmDialog / StatPill / Banner / Toasts
============================================================ */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxW?: number;
}

const Modal = memo(({ open, onClose, children, maxW = 480 }: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.[0]?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        ref={panelRef}
        style={{
          width: "100%",
          maxWidth: maxW,
          background: COLORS.surface,
          borderRadius: 24,
          boxShadow: "0 24px 60px rgba(0,0,0,.18)",
          overflow: "hidden",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
});
Modal.displayName = "Modal";

const ModalHeader = memo(
  ({ eyebrow, title, onClose }: { eyebrow?: string; title: string; onClose: () => void }) => (
    <div
      style={{
        padding: "20px 24px 16px",
        borderBottom: `1px solid ${COLORS.border}`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textLight, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {eyebrow}
          </div>
        )}
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: COLORS.text }}>{title}</h2>
      </div>
      <button onClick={onClose} style={iconBtnStyle} aria-label="Cerrar">
        <X size={16} />
      </button>
    </div>
  )
);
ModalHeader.displayName = "ModalHeader";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
}

const ConfirmDialog = memo(({ open, onConfirm, onCancel, title, message, confirmLabel = "Eliminar" }: ConfirmDialogProps) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,.45)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{ width: "100%", maxWidth: 420, background: COLORS.surface, borderRadius: 24, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.18)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-title" style={{ fontSize: 18, fontWeight: 900, color: COLORS.text, margin: 0 }}>
          {title}
        </h3>
        <p style={{ fontSize: 14, color: COLORS.textLight, marginTop: 8, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={btnSecondary}>
            Cancelar
          </button>
          <button onClick={onConfirm} style={{ ...btnPrimary, background: COLORS.danger, padding: "0 24px" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
});
ConfirmDialog.displayName = "ConfirmDialog";

const Banner = memo(({ tone, message }: { tone: "danger" | "info"; message: string }) => {
  const isDanger = tone === "danger";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 10,
        background: isDanger ? COLORS.dangerBg : COLORS.infoBg,
        border: `1px solid ${isDanger ? COLORS.dangerBorder : COLORS.info}33`,
      }}
    >
      <AlertCircle size={14} color={isDanger ? COLORS.danger : COLORS.info} style={{ marginTop: 1, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: isDanger ? COLORS.danger : COLORS.info, fontWeight: 600 }}>{message}</span>
    </div>
  );
});
Banner.displayName = "Banner";

const StatPill = memo(({ label, value, dot }: { label: string; value: number | string; dot: string }) => (
  <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 16, padding: "14px 18px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,.2)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.75)", letterSpacing: ".1em", textTransform: "uppercase" }}>{label}</span>
    </div>
    <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{value}</div>
  </div>
));
StatPill.displayName = "StatPill";

const TOAST_TONE: Record<ToastItem["tone"], { bg: string; border: string; text: string }> = {
  success: { bg: "#0f2e1a", border: "#1f7a3f", text: "#bdf2cf" },
  danger: { bg: "#3a1414", border: "#b13434", text: "#ffd0d0" },
  info: { bg: "#10202f", border: "#2c5c82", text: "#bfe1ff" },
};

const ToastStack = memo(({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) => {
  if (toasts.length === 0) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 400,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => {
        const tone = TOAST_TONE[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className="park-toast"
            style={{
              pointerEvents: "auto",
              maxWidth: 420,
              width: "100%",
              background: tone.bg,
              border: `1px solid ${tone.border}`,
              color: tone.text,
              borderRadius: 14,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 10px 30px rgba(0,0,0,.35)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {t.tone === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Cerrar aviso"
              style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer", opacity: 0.7, padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
});
ToastStack.displayName = "ToastStack";

/* ============================================================
   TARJETA DE CELDA (vista tarjetas)
============================================================ */

const CeldaCard = memo(({ celda, onClick }: { celda: Celda; onClick: () => void }) => {
  const cfgClaro = {
    libre: { bg: "#F0FBE8", border: "#A8D888", text: "#2F6B00" },
    ocupado: { bg: "#1A1A1A", border: "#EF4444", text: "#FFFFFF" },
    sena: { bg: "#FFFBEB", border: "#FCD34D", text: "#78350F" },
  }[celda.estado];
  const label = CELDA_CONFIG[celda.estado].label;
  return (
    <button
      onClick={onClick}
      disabled={celda.estado === "sena"}
      className="park-celda-btn"
      style={{
        background: cfgClaro.bg,
        border: `2px ${celda.estado === "libre" ? "dashed" : "solid"} ${cfgClaro.border}`,
        borderRadius: 16,
        padding: "10px 8px",
        cursor: celda.estado === "sena" ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        minHeight: 100,
        transition: "transform .15s, box-shadow .15s",
        outline: "none",
        width: "100%",
      }}
      onMouseEnter={(e) => {
        if (celda.estado !== "sena") {
          e.currentTarget.style.transform = "scale(1.04)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(57,169,0,.18)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
      aria-label={`Celda ${celda.codigo} - ${label}`}
    >
      <span style={{ fontSize: 12, fontWeight: 900, color: cfgClaro.text, letterSpacing: ".05em" }}>{celda.codigo}</span>
      <Car size={22} color={cfgClaro.text} strokeWidth={celda.estado === "ocupado" ? 2.2 : 1.6} />
      {celda.estado === "ocupado" ? (
        <div style={{ textAlign: "center", maxWidth: "100%" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: cfgClaro.text }}>{celda.placa}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)", marginTop: 1, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {celda.conductor}
          </div>
        </div>
      ) : (
        <span style={{ fontSize: 9, fontWeight: 700, color: cfgClaro.text, textTransform: "uppercase", letterSpacing: ".08em", opacity: 0.75 }}>{label}</span>
      )}
    </button>
  );
});
CeldaCard.displayName = "CeldaCard";

/* ============================================================
   MAPA DE PARQUEADEROS — vista aérea estilo plano de asfalto
============================================================ */

const CarTopIcon = memo(({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => {
  const bw = w * 0.6;
  const bh = h * 0.82;
  const bx = x + (w - bw) / 2;
  const by = y + (h - bh) / 2;
  return (
    <g pointerEvents="none">
      <rect x={bx} y={by} width={bw} height={bh} rx={bw * 0.34} fill="#ced4d9" stroke="#8a9298" strokeWidth="0.6" />
      <rect x={bx + bw * 0.14} y={by + bh * 0.16} width={bw * 0.72} height={bh * 0.3} rx={bw * 0.16} fill="#52606b" opacity="0.9" />
      <circle cx={bx + 1.2} cy={by + bh * 0.16} r="0.9" fill="#ffe082" />
      <circle cx={bx + bw - 1.2} cy={by + bh * 0.16} r="0.9" fill="#ffe082" />
      <circle cx={bx + 1.2} cy={by + bh * 0.86} r="0.9" fill="#ef4444" />
      <circle cx={bx + bw - 1.2} cy={by + bh * 0.86} r="0.9" fill="#ef4444" />
    </g>
  );
});
CarTopIcon.displayName = "CarTopIcon";

function renderSenal(x: number, y: number, label: string, color: string, apunta: "izq" | "der") {
  const w = 50;
  const h = 22;
  const points =
    apunta === "der"
      ? `${x - w / 2},${y - h / 2} ${x + w / 2 - 7},${y - h / 2} ${x + w / 2},${y} ${x + w / 2 - 7},${y + h / 2} ${x - w / 2},${y + h / 2}`
      : `${x + w / 2},${y - h / 2} ${x - w / 2 + 7},${y - h / 2} ${x - w / 2},${y} ${x - w / 2 + 7},${y + h / 2} ${x + w / 2},${y + h / 2}`;
  return (
    <g key={label}>
      <polygon points={points} fill={color} filter="url(#parkShadow)" />
      <text x={x - (apunta === "der" ? 4 : -4)} y={y + 3.5} textAnchor="middle" fontSize={8} fontWeight={800} fill="#fff" letterSpacing="0.4">
        {label}
      </text>
    </g>
  );
}

interface CeldaPos extends Celda {
  x: number;
  y: number;
}

interface FilaLayout {
  celdas: CeldaPos[];
  esCarril: boolean;
  y: number;
}

interface LotLayout {
  pq: Parqueadero;
  filas: FilaLayout[];
  lotTop: number;
  lotHeight: number;
  ancho: number;
  celdasPorFila: number;
  libres: number;
  ocupados: number;
  senaCount: number;
  pct: number;
}

const SPACE_W = 46;
const SPACE_H = 27;
const GAP_X = 3;
const ROW_GAP = 6;
const LANE_H = 42;
const PADDING = 56;
const SECTION_GAP = 44;
const ROAD_Y = 14;
const ROAD_H = 38;
const HEADER_BLOCK = 58;

const ParkingMap = memo(
  ({ parqueaderos, onCellClick }: { parqueaderos: Parqueadero[]; onCellClick: (parqueaderoId: number, celda: Celda) => void }) => {
    const [zoom, setZoom] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [hoverInfo, setHoverInfo] = useState<{ celda: Celda; pqNombre: string; clientX: number; clientY: number } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const panRef = useRef({ active: false, dragged: false, x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

    const lotLayouts: LotLayout[] = useMemo(() => {
      let cursorY = ROAD_Y + ROAD_H + 30;
      return parqueaderos.map((pq) => {
        const celdasPorFila = Math.max(3, Math.ceil(Math.sqrt(Math.max(pq.total, 1) * 1.7)));
        const filasTotal = Math.max(1, Math.ceil(pq.total / celdasPorFila));
        const filasPorSeccion = Math.min(filasTotal, 4);
        const secciones = Math.ceil(filasTotal / filasPorSeccion);

        const filas: FilaLayout[] = [];
        let idx = 0;
        let y = cursorY + HEADER_BLOCK;

        for (let s = 0; s < secciones; s++) {
          for (let f = 0; f < filasPorSeccion && idx < pq.total; f++) {
            const fila: CeldaPos[] = [];
            for (let c = 0; c < celdasPorFila && idx < pq.total; c++) {
              fila.push({ ...pq.celdas[idx], x: PADDING + c * (SPACE_W + GAP_X), y });
              idx++;
            }
            filas.push({ celdas: fila, esCarril: false, y });
            y += SPACE_H + ROW_GAP;
          }
          if (s < secciones - 1 && idx < pq.total) {
            filas.push({ celdas: [], esCarril: true, y });
            y += LANE_H;
          }
        }

        const lotTop = cursorY;
        const lotHeight = y - cursorY + 14;
        const libres = pq.celdas.filter((c) => c.estado === "libre").length;
        const ocupados = pq.celdas.filter((c) => c.estado === "ocupado").length;
        const senaCount = pq.celdas.filter((c) => c.estado === "sena").length;
        const pct = pq.celdas.length ? Math.round((ocupados / pq.celdas.length) * 100) : 0;
        const ancho = PADDING + celdasPorFila * (SPACE_W + GAP_X) + PADDING - 20;

        const layout: LotLayout = { pq, filas, lotTop, lotHeight, ancho, celdasPorFila, libres, ocupados, senaCount, pct };
        cursorY = lotTop + lotHeight + SECTION_GAP;
        return layout;
      });
    }, [parqueaderos]);

    const totalWidth = useMemo(() => Math.max(...lotLayouts.map((l) => l.ancho + 40), 480), [lotLayouts]);
    const totalHeight = useMemo(() => {
      if (lotLayouts.length === 0) return ROAD_Y + ROAD_H + 80;
      const last = lotLayouts[lotLayouts.length - 1];
      return last.lotTop + last.lotHeight + 40;
    }, [lotLayouts]);

    // Zoom con rueda + Ctrl/Cmd (deja la rueda normal para hacer scroll del lienzo)
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const handler = (e: WheelEvent) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        setZoom((z) => Math.max(0.5, Math.min(2.2, +(z + (e.deltaY > 0 ? -0.1 : 0.1)).toFixed(2))));
      };
      el.addEventListener("wheel", handler, { passive: false });
      return () => el.removeEventListener("wheel", handler);
    }, []);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      if (!el) return;
      panRef.current = { active: true, dragged: false, x: e.clientX, y: e.clientY, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
      setIsDragging(true);
      el.setPointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      const el = scrollRef.current;
      const state = panRef.current;
      if (!state.active || !el) return;
      const dx = e.clientX - state.x;
      const dy = e.clientY - state.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) state.dragged = true;
      el.scrollLeft = state.scrollLeft - dx;
      el.scrollTop = state.scrollTop - dy;
    }, []);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      panRef.current.active = false;
      setIsDragging(false);
      scrollRef.current?.releasePointerCapture(e.pointerId);
    }, []);

    const handleCellActivate = useCallback(
      (parqueaderoId: number, celda: Celda) => {
        if (panRef.current.dragged) return;
        if (celda.estado === "sena") return;
        onCellClick(parqueaderoId, celda);
      },
      [onCellClick]
    );

    return (
      <div style={{ position: "relative", width: "100%", borderRadius: 20, border: `1px solid ${COLORS.border}`, overflow: "hidden", background: MAP_THEME.asphalt, boxShadow: "0 2px 16px rgba(0,0,0,.08)" }}>
        {/* Controles flotantes */}
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { icon: <ZoomIn size={16} />, label: "Acercar", action: () => setZoom((z) => Math.min(2.2, +(z + 0.2).toFixed(2))) },
            { icon: <ZoomOut size={16} />, label: "Alejar", action: () => setZoom((z) => Math.max(0.5, +(z - 0.2).toFixed(2))) },
            {
              icon: <Maximize2 size={14} />,
              label: "Reiniciar vista",
              action: () => {
                setZoom(1);
                scrollRef.current?.scrollTo({ left: 0, top: 0 });
              },
            },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.action}
              aria-label={b.label}
              title={b.label}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,.18)",
                background: "rgba(20,22,25,.65)",
                backdropFilter: "blur(6px)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,.3)",
              }}
            >
              {b.icon}
            </button>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            zIndex: 10,
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(20,22,25,.65)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,0,0,.3)",
          }}
          title="Norte"
        >
          <Navigation size={17} color={COLORS.primaryLight} />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 5,
            background: "rgba(20,22,25,.65)",
            backdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,.18)",
            borderRadius: 99,
            padding: "5px 10px",
            color: "rgba(255,255,255,.7)",
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          <Hand size={12} />
          Arrastra para mover · Ctrl + rueda para zoom
        </div>

        {/* Lienzo */}
        <div
          ref={scrollRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className={`park-map-scroll${isDragging ? " dragging" : ""}`}
          style={{ overflow: "auto", maxHeight: "calc(100vh - 320px)", minHeight: 420 }}
        >
          <svg
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            style={{ width: totalWidth * zoom, height: totalHeight * zoom, display: "block" }}
          >
            <defs>
              <pattern id="parkAsphaltDots" width="22" height="22" patternUnits="userSpaceOnUse">
                <rect width="22" height="22" fill={MAP_THEME.asphalt} />
                <circle cx="4" cy="6" r="0.6" fill="rgba(255,255,255,.04)" />
                <circle cx="15" cy="14" r="0.5" fill="rgba(255,255,255,.035)" />
                <circle cx="9" cy="19" r="0.5" fill="rgba(255,255,255,.03)" />
              </pattern>
              <pattern id="parkSenaHatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <rect width="7" height="7" fill={CELDA_CONFIG.sena.mapFill} />
                <line x1="0" y1="0" x2="0" y2="7" stroke={CELDA_CONFIG.sena.mapStroke} strokeWidth="2.4" opacity="0.55" />
              </pattern>
              <filter id="parkShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodOpacity="0.35" />
              </filter>
              <filter id="parkGlow">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="parkRoadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3a4047" />
                <stop offset="100%" stopColor="#2c3137" />
              </linearGradient>
            </defs>

            <rect width={totalWidth} height={totalHeight} fill="url(#parkAsphaltDots)" />

            {/* Vía principal */}
            <rect x={0} y={ROAD_Y} width={totalWidth} height={ROAD_H} fill="url(#parkRoadGrad)" />
            <line x1={0} y1={ROAD_Y + ROAD_H / 2} x2={totalWidth} y2={ROAD_Y + ROAD_H / 2} stroke="#f5c344" strokeWidth="2" strokeDasharray="10,8" opacity="0.65" />
            {renderSenal(PADDING + 6, ROAD_Y + ROAD_H / 2, "ENTRADA", COLORS.primary, "der")}
            {renderSenal(totalWidth - PADDING - 6, ROAD_Y + ROAD_H / 2, "SALIDA", COLORS.danger, "izq")}

            {lotLayouts.map((layout) => {
              const { pq, filas, lotTop, lotHeight, ancho, celdasPorFila, libres, ocupados, senaCount, pct } = layout;
              const headerColor = pct > 80 ? COLORS.danger : pct > 50 ? COLORS.amber : COLORS.primary;
              const ribbonX = 28;
              const ribbonY = lotTop - 4;
              const ribbonW = ancho - 16;
              const ribbonH = 32;
              const donutCx = ribbonX + ribbonW - 22;
              const donutCy = ribbonY + ribbonH / 2;
              const r = 12;
              const circunferencia = 2 * Math.PI * r;
              const dash = (pct / 100) * circunferencia;

              return (
                <g key={pq.id}>
                  {/* Panel del lote */}
                  <rect x={20} y={lotTop - 14} width={ancho} height={lotHeight + 14} rx="16" fill={MAP_THEME.asphaltPanel} stroke={MAP_THEME.panelBorder} strokeWidth="1" />

                  {/* Carril de acceso lateral */}
                  <rect x={PADDING - 9} y={lotTop + HEADER_BLOCK - 6} width={9} height={lotHeight - HEADER_BLOCK - 4} fill="url(#parkRoadGrad)" rx="2" />
                  <text x={PADDING - 4.5} y={lotTop + HEADER_BLOCK + 14} textAnchor="middle" fill={MAP_THEME.laneTextDim} fontSize={9}>↓</text>

                  {/* Cinta de encabezado */}
                  <rect x={ribbonX} y={ribbonY} width={ribbonW} height={ribbonH} rx="11" fill={headerColor} filter="url(#parkShadow)" />
                  <text x={ribbonX + 14} y={ribbonY + 13} fill="#fff" fontSize={11} fontWeight="900" letterSpacing="0.02em">
                    {pq.nombre.toUpperCase()}
                  </text>
                  <text x={ribbonX + 14} y={ribbonY + 25} fill="rgba(255,255,255,.85)" fontSize={8} fontWeight="600">
                    BLOQUE {pq.bloque.toUpperCase()} · {pq.tipo.toUpperCase()}
                  </text>

                  <circle cx={donutCx} cy={donutCy} r={r} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="3.4" />
                  <circle
                    cx={donutCx}
                    cy={donutCy}
                    r={r}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${circunferencia}`}
                    transform={`rotate(-90 ${donutCx} ${donutCy})`}
                  />
                  <text x={donutCx} y={donutCy + 3} textAnchor="middle" fontSize={7.5} fontWeight="900" fill="#fff">
                    {pct}%
                  </text>

                  {/* Subtítulo con conteos */}
                  <text x={ribbonX} y={ribbonY + ribbonH + 13} fill={MAP_THEME.textDim} fontSize={9} fontWeight="600">
                    <tspan fill={CELDA_CONFIG.libre.dotColor}>● </tspan>
                    {libres} libres &nbsp;&nbsp;
                    <tspan fill={CELDA_CONFIG.ocupado.dotColor}>● </tspan>
                    {ocupados} ocupados &nbsp;&nbsp;
                    {senaCount > 0 && (
                      <>
                        <tspan fill={CELDA_CONFIG.sena.dotColor}>● </tspan>
                        {senaCount} SENA
                      </>
                    )}
                  </text>

                  {filas.map((fila, fIdx) =>
                    fila.esCarril ? (
                      <g key={`carril-${fIdx}`}>
                        <rect x={PADDING - 4} y={fila.y - 4} width={celdasPorFila * (SPACE_W + GAP_X) + 8} height={LANE_H - 6} fill="url(#parkRoadGrad)" rx="4" />
                        <line
                          x1={PADDING}
                          y1={fila.y + LANE_H / 2 - 8}
                          x2={PADDING + celdasPorFila * (SPACE_W + GAP_X)}
                          y2={fila.y + LANE_H / 2 - 8}
                          stroke="#f5c344"
                          strokeWidth="1.4"
                          strokeDasharray="6,5"
                          opacity="0.55"
                        />
                        <text x={PADDING + (celdasPorFila * (SPACE_W + GAP_X)) / 2} y={fila.y + LANE_H / 2 - 2} textAnchor="middle" fill={MAP_THEME.laneTextDim} fontSize={11}>
                          ← carril de circulación →
                        </text>
                      </g>
                    ) : (
                      <g key={`fila-${fIdx}`}>
                        {fila.celdas.map((celda) => {
                          const cfg = CELDA_CONFIG[celda.estado];
                          const cellKey = `${pq.id}-${celda.codigo}`;
                          const esLibre = celda.estado === "libre";
                          const esOcupado = celda.estado === "ocupado";
                          const esSena = celda.estado === "sena";
                          return (
                            <g
                              key={cellKey}
                              className="park-map-cell"
                              role={esSena ? undefined : "button"}
                              tabIndex={esSena ? -1 : 0}
                              aria-label={`Celda ${celda.codigo}, ${cfg.label}${esOcupado ? `, placa ${celda.placa}` : ""}`}
                              onClick={() => handleCellActivate(pq.id, celda)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleCellActivate(pq.id, celda);
                                }
                              }}
                              onMouseMove={(e) => {
                                if (!esLibre) setHoverInfo({ celda, pqNombre: pq.nombre, clientX: e.clientX, clientY: e.clientY });
                              }}
                              onMouseLeave={() => setHoverInfo(null)}
                              style={{ cursor: esSena ? "default" : "pointer", outline: "none" }}
                            >
                              <rect
                                x={celda.x}
                                y={celda.y}
                                width={SPACE_W}
                                height={SPACE_H}
                                rx="4"
                                fill={esSena ? "url(#parkSenaHatch)" : cfg.mapFill}
                                stroke={cfg.mapStroke}
                                strokeWidth={esLibre ? 1.3 : 1.6}
                                strokeDasharray={esLibre ? "3,3" : undefined}
                              />
                              <text x={celda.x + 4} y={celda.y + 8} fill={MAP_THEME.textDim} fontSize={6.5} fontWeight="800">
                                {celda.codigo}
                              </text>

                              {esLibre && (
                                <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 6} textAnchor="middle" fontSize={15} fontWeight="900" fill="rgba(255,255,255,.14)">
                                  P
                                </text>
                              )}

                              {esOcupado && (
                                <>
                                  <CarTopIcon x={celda.x} y={celda.y + 3} w={SPACE_W} h={SPACE_H - 8} />
                                  <rect x={celda.x + SPACE_W * 0.18} y={celda.y + SPACE_H - 7.5} width={SPACE_W * 0.64} height={6} rx="1.4" fill="#fafafa" stroke="#1a1a1a" strokeWidth="0.5" />
                                  <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H - 3} textAnchor="middle" fontSize={4.4} fontWeight="800" fill="#111" fontFamily="monospace" letterSpacing="0.3">
                                    {celda.placa}
                                  </text>
                                </>
                              )}

                              {esSena && (
                                <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 3} textAnchor="middle" fontSize={7} fontWeight="900" fill="#fcd34d">
                                  SENA
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    )
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Tooltip flotante */}
        {hoverInfo && (
          <div
            style={{
              position: "fixed",
              left: hoverInfo.clientX + 14,
              top: hoverInfo.clientY + 14,
              zIndex: 500,
              pointerEvents: "none",
              background: "rgba(15,17,20,.95)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 12,
              padding: "10px 14px",
              color: "#fff",
              boxShadow: "0 10px 30px rgba(0,0,0,.4)",
              minWidth: 160,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.55)", textTransform: "uppercase", letterSpacing: ".05em" }}>
              {hoverInfo.celda.codigo} · {hoverInfo.pqNombre}
            </div>
            {hoverInfo.celda.estado === "ocupado" ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 900, marginTop: 4 }}>{hoverInfo.celda.placa}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.75)" }}>{hoverInfo.celda.conductor}</div>
                {hoverInfo.celda.timestampIngreso && (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.55)", marginTop: 3 }}>
                    Ingreso hace {formatearDuracion(hoverInfo.celda.timestampIngreso)}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4, color: "#fcd34d" }}>Celda reservada SENA</div>
            )}
          </div>
        )}

        {/* Leyenda */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            padding: "10px 12px",
            background: COLORS.surface,
            borderTop: `1px solid ${COLORS.border}`,
            flexWrap: "wrap",
          }}
        >
          {(Object.entries(CELDA_CONFIG) as [CeldaEstado, CeldaConfigItem][]).map(([key, cfg]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 10, borderRadius: 3, background: cfg.mapFill, border: `1.5px solid ${cfg.mapStroke}` }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textLight }}>{cfg.label}</span>
            </div>
          ))}
          <div style={{ width: 1, height: 14, background: COLORS.border }} />
          <span style={{ fontSize: 10, color: COLORS.textLight, fontWeight: 500 }}>
            {parqueaderos.length} parqueadero{parqueaderos.length !== 1 ? "s" : ""} · Zoom {(zoom * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    );
  }
);
ParkingMap.displayName = "ParkingMap";

/* ============================================================
   FORMULARIO PARQUEADERO (crear/editar)
============================================================ */

interface FormModalProps {
  title: string;
  modo: "create" | "edit";
  onSubmit: () => void;
  onClose: () => void;
  submitLabel: string;
  form: FormParqueadero;
  formError: string | null;
  onChange: (patch: Partial<FormParqueadero>) => void;
}

const FormModalContent = memo(({ title, modo, onSubmit, onClose, submitLabel, form, formError, onChange }: FormModalProps) => (
  <>
    <ModalHeader eyebrow="Parqueaderos" title={title} onClose={onClose} />
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
      {formError && <Banner tone="danger" message={formError} />}
      <div>
        <label style={labelStyle}>Nombre del parqueadero</label>
        <input
          style={inputStyle}
          placeholder="Ej. CARRIL 02 — ZONA NORTE"
          value={form.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
          onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Bloque</label>
          <input
            style={inputStyle}
            placeholder="Ej. B"
            maxLength={2}
            value={form.bloque}
            onChange={(e) => onChange({ bloque: e.target.value.toUpperCase() })}
            onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
            onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
          />
        </div>
        <div>
          <label style={labelStyle}>Número de celdas</label>
          <input
            type="number"
            min={1}
            max={60}
            style={inputStyle}
            value={form.total}
            onChange={(e) => onChange({ total: Math.max(1, Math.min(60, parseInt(e.target.value, 10) || 1)) })}
            onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
            onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Tipo</label>
        <select style={{ ...inputStyle, appearance: "none" }} value={form.tipo} onChange={(e) => onChange({ tipo: e.target.value })}>
          {TIPOS_PARQUEADERO.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      {modo === "edit" && (
        <div style={{ fontSize: 11, color: COLORS.textLight, lineHeight: 1.5 }}>
          Si cambias el bloque o reduces el número de celdas, los códigos se reorganizan. No se puede reducir por debajo de las celdas
          que tengan vehículo o estén reservadas.
        </div>
      )}
    </div>
    <div style={{ padding: "14px 24px 20px", display: "flex", gap: 10, justifyContent: "flex-end" }}>
      <button onClick={onClose} style={btnSecondary}>
        Cancelar
      </button>
      <button onClick={onSubmit} style={{ ...btnPrimary, padding: "0 24px" }}>
        {submitLabel}
      </button>
    </div>
  </>
));
FormModalContent.displayName = "FormModalContent";

/* ============================================================
   OCR — preprocesamiento de imagen + worker persistente
============================================================ */

function preprocesarFrame(video: HTMLVideoElement): string {
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    throw new Error("La cámara aún no está lista, intenta de nuevo.");
  }

  const fuente = document.createElement("canvas");
  fuente.width = video.videoWidth;
  fuente.height = video.videoHeight;
  const fctx = fuente.getContext("2d");
  if (!fctx) throw new Error("No se pudo crear el contexto de canvas.");
  fctx.drawImage(video, 0, 0);

  // Recorta la franja central donde debe ubicarse la matrícula (guía en pantalla)
  const cropW = fuente.width * 0.55;
  const cropH = fuente.height * 0.3;
  const cropX = (fuente.width - cropW) / 2;
  const cropY = (fuente.height - cropH) / 2;

  const ESCALA = 2; // mejora la resolución efectiva para el OCR
  const recorte = document.createElement("canvas");
  recorte.width = cropW * ESCALA;
  recorte.height = cropH * ESCALA;
  const rctx = recorte.getContext("2d");
  if (!rctx) throw new Error("No se pudo crear el contexto de recorte.");
  rctx.imageSmoothingEnabled = true;
  rctx.drawImage(fuente, cropX, cropY, cropW, cropH, 0, 0, recorte.width, recorte.height);

  const imgData = rctx.getImageData(0, 0, recorte.width, recorte.height);
  const data = imgData.data;

  // Umbral adaptativo según el brillo promedio del recorte (mejor que un valor fijo)
  let suma = 0;
  const grises = new Float32Array(data.length / 4);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const gris = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    grises[p] = gris;
    suma += gris;
  }
  const media = suma / grises.length;
  const umbral = media * 0.92;

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const bin = grises[p] > umbral ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = bin;
  }
  rctx.putImageData(imgData, 0, 0);

  return recorte.toDataURL("image/png");
}

function useOcrPlaca() {
  const workerRef = useRef<any>(null);
  const initPromiseRef = useRef<Promise<any> | null>(null);

  const obtenerWorker = useCallback(async () => {
    if (workerRef.current) return workerRef.current;
    if (!initPromiseRef.current) {
      initPromiseRef.current = (async () => {
        const worker = await createWorker("eng");
        await worker.setParameters({
          tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
          tessedit_pageseg_mode: "7",
        });
        workerRef.current = worker;
        return worker;
      })();
    }
    return initPromiseRef.current;
  }, []);

  const liberarWorker = useCallback(async () => {
    const worker = workerRef.current;
    workerRef.current = null;
    initPromiseRef.current = null;
    if (worker) {
      try {
        await worker.terminate();
      } catch {
        /* noop */
      }
    }
  }, []);

  const reconocer = useCallback(
    async (video: HTMLVideoElement): Promise<string> => {
      const imageData = preprocesarFrame(video);
      const worker = await obtenerWorker();
      const { data } = await worker.recognize(imageData);
      const limpio = limpiarTextoOCR(data.text || "");
      if (!validarPlacaColombiana(limpio)) {
        throw new Error(`No se detectó una matrícula válida (lectura: "${limpio || "vacío"}"). Ajusta el encuadre o ingrésala manualmente.`);
      }
      return limpio;
    },
    [obtenerWorker]
  );

  return { reconocer, liberarWorker };
}

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */

export default function Parqueaderos() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [, forceTick] = useReducer((c: number) => c + 1, 0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { reconocer, liberarWorker } = useOcrPlaca();

  // Refresca los contadores de "tiempo estacionado" cada minuto
  useEffect(() => {
    const id = setInterval(() => forceTick(), 60000);
    return () => clearInterval(id);
  }, []);

  // Libera el worker de OCR al desmontar el módulo
  useEffect(() => () => {
    liberarWorker();
  }, [liberarWorker]);

  // Auto-cierre de notificaciones
  useEffect(() => {
    if (state.toasts.length === 0) return;
    const timers = state.toasts.map((t) =>
      setTimeout(() => dispatch({ type: "DISMISS_TOAST", id: t.id }), 4200)
    );
    return () => timers.forEach(clearTimeout);
  }, [state.toasts]);

  const stats = useMemo(() => {
    const todas = state.parqueaderos.flatMap((p) => p.celdas);
    const disponibles = todas.filter((c) => c.estado === "libre").length;
    const ocupados = todas.filter((c) => c.estado === "ocupado").length;
    const reservados = todas.filter((c) => c.estado === "sena").length;
    const total = todas.length;
    return {
      disponibles,
      ocupados,
      reservados,
      total,
      pctOcupacion: total > 0 ? Math.round((ocupados / total) * 100) : 0,
    };
  }, [state.parqueaderos]);

  const celdaActiva = useMemo(() => {
    if (!state.celdaActiva) return null;
    const parq = state.parqueaderos.find((p) => p.id === state.celdaActiva!.parqueaderoId);
    return parq?.celdas.find((c) => c.codigo === state.celdaActiva!.codigo) ?? null;
  }, [state.celdaActiva, state.parqueaderos]);

  const parqueaderoActivo = useMemo(() => {
    if (!state.celdaActiva) return null;
    return state.parqueaderos.find((p) => p.id === state.celdaActiva!.parqueaderoId) ?? null;
  }, [state.celdaActiva, state.parqueaderos]);

  const cerrarCamara = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const iniciarCamara = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      dispatch({ type: "OCR_ERROR", error: "Este navegador no permite acceder a la cámara aquí. Usa un sitio con HTTPS o ingresa la matrícula manualmente." });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      try {
        // Algunos equipos (ej. portátiles sin cámara trasera) no soportan facingMode "environment"
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        dispatch({ type: "OCR_ERROR", error: "No se pudo acceder a la cámara. Verifica los permisos del navegador o ingresa la matrícula manualmente." });
      }
    }
  }, []);

  useEffect(() => {
    if (state.activeModal === "scanner") {
      iniciarCamara();
    } else {
      cerrarCamara();
    }
    return () => cerrarCamara();
  }, [state.activeModal, iniciarCamara, cerrarCamara]);

  const handleCapturarYReconocer = useCallback(async () => {
    if (!videoRef.current) return;
    dispatch({ type: "OCR_START" });
    try {
      const placa = await reconocer(videoRef.current);
      dispatch({ type: "OCR_SUCCESS", placa });
      cerrarCamara();
      setTimeout(() => dispatch({ type: "OPEN_MODAL", modal: "ingreso" }), 500);
    } catch (err) {
      dispatch({ type: "OCR_ERROR", error: err instanceof Error ? err.message : "Ocurrió un error al procesar la imagen." });
    }
  }, [reconocer, cerrarCamara]);

  const handleCreate = useCallback(() => {
    const nombre = normalizarTexto(state.form.nombre);
    const bloque = state.form.bloque.trim().toUpperCase();
    if (!nombre) return dispatch({ type: "SET_FORM_ERROR", error: "El nombre del parqueadero es obligatorio." });
    if (!/^[A-Z0-9]{1,2}$/.test(bloque)) return dispatch({ type: "SET_FORM_ERROR", error: "El bloque debe tener 1 o 2 letras/números (ej. A, B2)." });
    if (state.parqueaderos.some((p) => p.bloque === bloque)) return dispatch({ type: "SET_FORM_ERROR", error: `Ya existe un parqueadero con el bloque "${bloque}".` });

    dispatch({
      type: "CREATE_PARQUEADERO",
      parqueadero: {
        id: Date.now(),
        nombre,
        bloque,
        tipo: state.form.tipo,
        total: state.form.total,
        celdas: regenerarCeldas(bloque, state.form.total),
      },
    });
  }, [state.form, state.parqueaderos]);

  const handleEdit = useCallback(() => {
    if (!state.parqueaderoEditandoId) return;
    const nombre = normalizarTexto(state.form.nombre);
    const bloque = state.form.bloque.trim().toUpperCase();
    if (!nombre) return dispatch({ type: "SET_FORM_ERROR", error: "El nombre del parqueadero es obligatorio." });
    if (!/^[A-Z0-9]{1,2}$/.test(bloque)) return dispatch({ type: "SET_FORM_ERROR", error: "El bloque debe tener 1 o 2 letras/números (ej. A, B2)." });
    if (state.parqueaderos.some((p) => p.bloque === bloque && p.id !== state.parqueaderoEditandoId)) {
      return dispatch({ type: "SET_FORM_ERROR", error: `Ya existe otro parqueadero con el bloque "${bloque}".` });
    }

    const actual = state.parqueaderos.find((p) => p.id === state.parqueaderoEditandoId);
    if (actual) {
      const comprometidas = celdasComprometidasAlReducir(actual.celdas, state.form.total);
      if (comprometidas.length > 0) {
        const codigos = comprometidas.map((c) => c.codigo).join(", ");
        return dispatch({ type: "SET_FORM_ERROR", error: `No puedes reducir a ${state.form.total} celdas: ${codigos} tienen vehículo o están reservadas.` });
      }
    }

    dispatch({
      type: "EDIT_PARQUEADERO",
      id: state.parqueaderoEditandoId,
      nombre,
      tipo: state.form.tipo,
      bloque,
      total: state.form.total,
    });
  }, [state.parqueaderoEditandoId, state.form, state.parqueaderos]);

  const handleClickCelda = useCallback((parqueaderoId: number, celda: Celda) => {
    if (celda.estado === "sena") return;
    dispatch({ type: "SELECT_CELDA", parqueaderoId, codigo: celda.codigo, estado: celda.estado });
  }, []);

  const placaDuplicada = useCallback(
    (placa: string): boolean => {
      const norm = placa.trim().toUpperCase();
      return state.parqueaderos.some((p) => p.celdas.some((c) => c.estado === "ocupado" && c.placa === norm));
    },
    [state.parqueaderos]
  );

  const registrarVehiculo = useCallback(() => {
    if (!state.celdaActiva) return;
    const placaNorm = state.vehiculoForm.placa.trim().toUpperCase();
    const conductorNorm = normalizarTexto(state.vehiculoForm.conductor, 60);

    if (!placaNorm || !conductorNorm) {
      dispatch({ type: "SET_PLACA_ERROR", error: "Completa todos los campos." });
      return;
    }
    if (conductorNorm.length < 3) {
      dispatch({ type: "SET_PLACA_ERROR", error: "Ingresa el nombre completo del conductor." });
      return;
    }
    if (!validarPlacaColombiana(placaNorm)) {
      dispatch({ type: "SET_PLACA_ERROR", error: "Formato de matrícula inválido. Usa ABC123, ABC12D o AAA11A." });
      return;
    }
    if (placaDuplicada(placaNorm)) {
      dispatch({ type: "SET_PLACA_ERROR", error: "Esta matrícula ya está registrada en otra celda." });
      return;
    }

    dispatch({ type: "REGISTRAR_VEHICULO", placa: placaNorm, conductor: conductorNorm });
  }, [state.celdaActiva, state.vehiculoForm, placaDuplicada]);

  const asignarAutomaticamente = useCallback(() => {
    for (const parq of state.parqueaderos) {
      const celda = parq.celdas.find((c) => c.estado === "libre");
      if (celda) {
        dispatch({ type: "SELECT_CELDA", parqueaderoId: parq.id, codigo: celda.codigo, estado: "libre" });
        return;
      }
    }
    dispatch({ type: "ADD_TOAST", toast: { id: toastSeq++, tone: "info", message: "No hay celdas libres disponibles en ningún parqueadero." } });
  }, [state.parqueaderos]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div style={{ minHeight: "100vh", background: COLORS.background, padding: "16px" }}>
      <style>{`
        @media (min-width: 640px) {
          .park-hero { padding: 28px 32px !important; }
          .park-stats { grid-template-columns: repeat(5, 1fr) !important; }
          .park-hero-row { flex-direction: row !important; align-items: center !important; }
          .park-btn-new { width: auto !important; }
          .park-celdas { grid-template-columns: repeat(4, 1fr) !important; }
          .park-actions-row { flex-direction: row !important; width: auto !important; }
        }
        @media (min-width: 1024px) {
          .park-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .park-celdas { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (min-width: 1280px) {
          .park-celdas-lg { grid-template-columns: repeat(6, 1fr) !important; }
        }
        .park-celda-btn:disabled { cursor: default !important; }
        .park-map-scroll { cursor: grab; }
        .park-map-scroll.dragging { cursor: grabbing; }
        .park-map-cell { transition: transform .12s ease, filter .12s ease; transform-box: fill-box; transform-origin: center; }
        .park-map-cell:hover, .park-map-cell:focus-visible { transform: scale(1.08); filter: drop-shadow(0 3px 6px rgba(0,0,0,.5)); }
        .park-map-cell:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }
        .park-toast { animation: park-toast-in .2s ease; }
        @keyframes park-toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* ---------- HERO / STATS ---------- */}
      <div
        className="park-hero"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
          borderRadius: 24,
          padding: "20px 20px",
          marginBottom: 16,
          boxShadow: `0 12px 40px rgba(57,169,0,.25)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, right: 80, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }} />

        <div className="park-hero-row" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20, position: "relative" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.15)", borderRadius: 99, padding: "5px 12px", marginBottom: 10 }}>
              <Shield size={12} color="rgba(255,255,255,.85)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.85)", letterSpacing: ".06em", textTransform: "uppercase" }}>Gestión SENA</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>Panel de Parqueaderos</h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "rgba(255,255,255,.75)" }}>Gestión de celdas vehiculares en tiempo real</p>
          </div>
          <div className="park-actions-row" style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            <button
              onClick={asignarAutomaticamente}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: 44, padding: "0 20px", borderRadius: 14, background: "rgba(255,255,255,.18)", border: "1.5px solid rgba(255,255,255,.4)", cursor: "pointer", fontSize: 13, fontWeight: 800, color: "#fff", width: "100%" }}
            >
              <Zap size={16} />
              Asignar automáticamente
            </button>
            <button
              className="park-btn-new"
              onClick={() => dispatch({ type: "RESET_FORM", form: initialForm })}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, height: 44, padding: "0 20px", borderRadius: 14, background: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 800, color: COLORS.primaryDark, boxShadow: "0 4px 14px rgba(0,0,0,.12)", width: "100%" }}
            >
              <Plus size={16} />
              Nuevo Parqueadero
            </button>
          </div>
        </div>

        <div className="park-stats" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          <StatPill label="Disponibles" value={stats.disponibles} dot="#4CAF50" />
          <StatPill label="Ocupados" value={stats.ocupados} dot="#EF4444" />
          <StatPill label="Reservados" value={stats.reservados} dot="#F59E0B" />
          <StatPill label="% Ocupación" value={`${stats.pctOcupacion}%`} dot="#60A5FA" />
          <StatPill label="Total" value={stats.total} dot="rgba(255,255,255,.6)" />
        </div>
      </div>

      {/* ---------- LEYENDA + TOGGLE VISTA ---------- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(Object.entries(CELDA_CONFIG) as [CeldaEstado, CeldaConfigItem][]).map(([key, cfg]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6, background: COLORS.surface, borderRadius: 99, padding: "5px 12px", border: `1px solid ${COLORS.border}` }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.dotColor }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textLight }}>{cfg.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: COLORS.textLight, fontWeight: 500 }}>
            {state.parqueaderos.length} parqueadero{state.parqueaderos.length !== 1 ? "s" : ""}
          </span>
          <div style={{ display: "flex", borderRadius: 10, border: `1px solid ${COLORS.border}`, overflow: "hidden", background: COLORS.surface }}>
            <button
              onClick={() => dispatch({ type: "SET_VIEW", view: "map" })}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", border: "none", background: state.view === "map" ? COLORS.primary : "transparent", color: state.view === "map" ? "#fff" : COLORS.textLight, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              aria-label="Vista mapa"
            >
              <MapIcon size={13} />
              Mapa
            </button>
            <button
              onClick={() => dispatch({ type: "SET_VIEW", view: "cards" })}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", border: "none", borderLeft: `1px solid ${COLORS.border}`, background: state.view === "cards" ? COLORS.primary : "transparent", color: state.view === "cards" ? "#fff" : COLORS.textLight, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              aria-label="Vista tarjetas"
            >
              <LayoutGrid size={13} />
              Tarjetas
            </button>
          </div>
        </div>
      </div>

      {/* ---------- VISTA MAPA / TARJETAS ---------- */}
      {state.view === "map" && <ParkingMap parqueaderos={state.parqueaderos} onCellClick={handleClickCelda} />}

      {state.view === "cards" && (
        <div className="park-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {state.parqueaderos.map((parqueadero) => {
            const libres = parqueadero.celdas.filter((c) => c.estado === "libre").length;
            const ocupados = parqueadero.celdas.filter((c) => c.estado === "ocupado").length;
            const pct = parqueadero.celdas.length ? Math.round((ocupados / parqueadero.celdas.length) * 100) : 0;
            return (
              <div key={parqueadero.id} style={{ background: COLORS.surface, borderRadius: 20, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
                <div style={{ padding: "16px 18px 14px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: COLORS.primaryPale, border: `1px solid ${COLORS.primaryLight}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <ParkingCircle size={16} color={COLORS.primary} />
                      </div>
                      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: COLORS.text }}>{parqueadero.nombre}</h2>
                    </div>
                    <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                      {[
                        { dot: "#4CAF50", label: `${libres} libres` },
                        { dot: "#EF4444", label: `${ocupados} ocupados` },
                        { dot: "#F59E0B", label: `${parqueadero.celdas.filter((c) => c.estado === "sena").length} SENA` },
                      ].map((s) => (
                        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textLight }}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div style={{ height: 4, borderRadius: 99, background: COLORS.border, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? COLORS.danger : pct > 50 ? COLORS.amber : COLORS.primary, borderRadius: 99, transition: "width .3s ease" }} />
                      </div>
                      <div style={{ fontSize: 10, color: COLORS.textLight, marginTop: 3, fontWeight: 600 }}>{pct}% de ocupación</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => dispatch({ type: "OPEN_EDIT", parqueadero })} style={iconBtnStyle} aria-label={`Editar ${parqueadero.nombre}`}>
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => dispatch({ type: "REQUEST_DELETE", id: parqueadero.id })}
                      style={{ ...iconBtnStyle, border: `1px solid ${COLORS.dangerBorder}`, background: COLORS.dangerBg, color: COLORS.danger }}
                      aria-label={`Eliminar ${parqueadero.nombre}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="park-celdas park-celdas-lg" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, padding: 16 }}>
                  {parqueadero.celdas.map((celda) => (
                    <CeldaCard key={celda.codigo} celda={celda} onClick={() => handleClickCelda(parqueadero.id, celda)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- MODAL CREAR ---------- */}
      <Modal open={state.activeModal === "create"} onClose={() => dispatch({ type: "CLOSE_MODAL" })}>
        <FormModalContent
          title="Nuevo Parqueadero"
          modo="create"
          onClose={() => dispatch({ type: "CLOSE_MODAL" })}
          onSubmit={handleCreate}
          submitLabel="Crear Parqueadero"
          form={state.form}
          formError={state.formError}
          onChange={(patch) => dispatch({ type: "SET_FORM", form: patch })}
        />
      </Modal>

      {/* ---------- MODAL EDITAR ---------- */}
      <Modal open={state.activeModal === "edit"} onClose={() => dispatch({ type: "CLOSE_MODAL" })}>
        <FormModalContent
          title="Editar Parqueadero"
          modo="edit"
          onClose={() => dispatch({ type: "CLOSE_MODAL" })}
          onSubmit={handleEdit}
          submitLabel="Guardar Cambios"
          form={state.form}
          formError={state.formError}
          onChange={(patch) => dispatch({ type: "SET_FORM", form: patch })}
        />
      </Modal>

      {/* ---------- MODAL INGRESO VEHÍCULO ---------- */}
      <Modal open={state.activeModal === "ingreso"} onClose={() => dispatch({ type: "CLOSE_MODAL" })} maxW={480}>
        <ModalHeader eyebrow={`Celda ${state.celdaActiva?.codigo ?? ""}`} title="Registrar Vehículo" onClose={() => dispatch({ type: "CLOSE_MODAL" })} />
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Matrícula</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={state.vehiculoForm.placa}
                onChange={(e) => dispatch({ type: "SET_VEHICULO_FORM", form: { placa: e.target.value.toUpperCase() } })}
                placeholder="ABC123"
                maxLength={6}
                style={{ ...inputStyle, flex: 1, fontSize: 18, fontWeight: 900, letterSpacing: ".06em", borderColor: state.placaError ? COLORS.danger : COLORS.border }}
                onFocus={(e) => (e.target.style.borderColor = state.placaError ? COLORS.danger : COLORS.primary)}
                onBlur={(e) => (e.target.style.borderColor = state.placaError ? COLORS.danger : COLORS.border)}
                aria-invalid={!!state.placaError}
              />
              <button
                onClick={() => dispatch({ type: "OPEN_MODAL", modal: "scanner" })}
                style={{ height: 48, padding: "0 16px", borderRadius: 12, border: "none", background: COLORS.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "#fff" }}
                aria-label="Escanear matrícula"
              >
                <Camera size={16} />
              </button>
            </div>
            <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 6 }}>Formatos válidos: ABC123, ABC12D, AAA11A</div>
            {state.placaError && <div style={{ marginTop: 8 }}><Banner tone="danger" message={state.placaError} /></div>}
          </div>
          <div>
            <label style={labelStyle}>Conductor</label>
            <input
              list="conductores-sugeridos"
              value={state.vehiculoForm.conductor}
              onChange={(e) => dispatch({ type: "SET_VEHICULO_FORM", form: { conductor: e.target.value } })}
              placeholder="Nombre completo"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
              onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
            />
            <datalist id="conductores-sugeridos">
              {CONDUCTORES_SUGERIDOS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>
        <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
          <button onClick={() => dispatch({ type: "CLOSE_MODAL" })} style={{ ...btnSecondary, flex: 1 }}>
            Cancelar
          </button>
          <button
            onClick={registrarVehiculo}
            disabled={!state.vehiculoForm.placa.trim() || !state.vehiculoForm.conductor.trim()}
            style={{
              ...btnPrimary,
              flex: 2,
              background: state.vehiculoForm.placa.trim() && state.vehiculoForm.conductor.trim() ? COLORS.primary : COLORS.border,
              cursor: state.vehiculoForm.placa.trim() && state.vehiculoForm.conductor.trim() ? "pointer" : "default",
            }}
          >
            Registrar Vehículo
          </button>
        </div>
      </Modal>

      {/* ---------- MODAL INFO CELDA OCUPADA ---------- */}
      <Modal open={state.activeModal === "info"} onClose={() => dispatch({ type: "CLOSE_MODAL" })} maxW={420}>
        <ModalHeader eyebrow={`Celda ${state.celdaActiva?.codigo ?? ""} · ${parqueaderoActivo?.nombre ?? ""}`} title="Vehículo Estacionado" onClose={() => dispatch({ type: "CLOSE_MODAL" })} />
        {celdaActiva && (
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: COLORS.background, borderRadius: 14, padding: "16px 18px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.text, letterSpacing: ".08em" }}>{celdaActiva.placa}</div>
              <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 4, fontWeight: 600 }}>{celdaActiva.conductor}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: COLORS.background, borderRadius: 12, padding: "10px 12px" }}>
                <div style={labelStyle}>Ingreso</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>
                  {celdaActiva.fechaIngreso} · {celdaActiva.horaIngreso}
                </div>
              </div>
              <div style={{ background: COLORS.background, borderRadius: 12, padding: "10px 12px" }}>
                <div style={labelStyle}>
                  <Clock size={10} style={{ display: "inline", marginRight: 4, verticalAlign: "-1px" }} />
                  Tiempo
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>
                  {celdaActiva.timestampIngreso ? formatearDuracion(celdaActiva.timestampIngreso) : "—"}
                </div>
              </div>
            </div>
            <button
              onClick={() => dispatch({ type: "REQUEST_LIBERAR" })}
              style={{ height: 46, borderRadius: 12, border: "none", background: COLORS.danger, fontSize: 13, fontWeight: 800, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <LogOut size={16} />
              Registrar Salida / Liberar Celda
            </button>
          </div>
        )}
      </Modal>

      {/* ---------- MODAL ESCÁNER OCR ---------- */}
      <Modal open={state.activeModal === "scanner"} onClose={() => dispatch({ type: "OPEN_MODAL", modal: "ingreso" })} maxW={720}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: COLORS.primaryPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ScanLine size={17} color={COLORS.primary} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: COLORS.text }}>Escanear Matrícula</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.textLight }}>Reconocimiento óptico de caracteres (OCR)</p>
            </div>
          </div>
          <button onClick={() => dispatch({ type: "OPEN_MODAL", modal: "ingreso" })} style={iconBtnStyle} aria-label="Cerrar escáner">
            <X size={16} />
          </button>
        </div>
        <div style={{ position: "relative", background: "#000", aspectRatio: "16/9" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => dispatch({ type: "CAMERA_READY" })}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: "55%", maxWidth: 300, aspectRatio: "3/1", border: `3px solid ${COLORS.primary}`, borderRadius: 16, boxShadow: "0 0 0 9999px rgba(0,0,0,.5)" }} />
          </div>
          {!state.camaraLista && !state.ocrError && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Loader2 size={26} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Iniciando cámara…</span>
            </div>
          )}
          {state.ocrLoading && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <Loader2 size={28} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Analizando matrícula…</span>
            </div>
          )}
          {state.ocrSuccessFlash && !state.ocrLoading && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(57,169,0,.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <CheckCircle2 size={32} color="#fff" />
              <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>Matrícula detectada: {state.vehiculoForm.placa}</span>
            </div>
          )}
        </div>
        {state.ocrError && (
          <div style={{ margin: "14px 20px 0" }}>
            <Banner tone="danger" message={state.ocrError} />
          </div>
        )}
        <div style={{ display: "flex", gap: 10, padding: "14px 20px 20px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => dispatch({ type: "OPEN_MODAL", modal: "ingreso" })} style={{ ...btnSecondary, padding: "0 24px" }}>
            Ingresar manualmente
          </button>
          <button
            onClick={handleCapturarYReconocer}
            disabled={state.ocrLoading || !state.camaraLista}
            style={{
              ...btnPrimary,
              padding: "0 28px",
              cursor: state.ocrLoading || !state.camaraLista ? "default" : "pointer",
              opacity: state.ocrLoading || !state.camaraLista ? 0.6 : 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Camera size={15} />
            {state.ocrLoading ? "Procesando…" : "Capturar y Leer"}
          </button>
        </div>
      </Modal>

      {/* ---------- CONFIRMACIONES ---------- */}
      <ConfirmDialog
        open={state.activeModal === "confirmDelete"}
        onConfirm={() => dispatch({ type: "CONFIRM_DELETE" })}
        onCancel={() => dispatch({ type: "CLOSE_MODAL" })}
        title="Eliminar Parqueadero"
        message="¿Estás seguro de eliminar este parqueadero? Esta acción no se puede deshacer."
      />

      <ConfirmDialog
        open={state.activeModal === "confirmLiberar"}
        onConfirm={() => dispatch({ type: "CONFIRM_LIBERAR" })}
        onCancel={() => dispatch({ type: "OPEN_MODAL", modal: "info" })}
        title="Liberar Celda"
        message={`¿Confirmas la salida del vehículo ${celdaActiva?.placa || ""}? La celda quedará disponible.`}
        confirmLabel="Liberar"
      />

      <ToastStack toasts={state.toasts} onDismiss={(id) => dispatch({ type: "DISMISS_TOAST", id })} />
    </div>
  );
}
´´´