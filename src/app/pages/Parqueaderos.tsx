import React, { useEffect, useMemo, useRef, useReducer, useCallback, memo } from "react";
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
} from "lucide-react";
import { createWorker } from "tesseract.js";

/* ============================================================
   TEMA / CONSTANTES (paleta de la landing page)
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
  info: "#3B82F6",
  infoBg: "#EFF6FF",
  amber: "#F59E0B",
  amberBg: "#FEF3C7",
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
    mapFill: "#D4EDC8",
    mapStroke: "#7BC35A",
  },
  ocupado: {
    bg: "#1A1A1A",
    border: "#EF4444",
    text: "#FFFFFF",
    label: "Ocupado",
    dotColor: "#EF4444",
    mapFill: "#2D2D2D",
    mapStroke: "#EF4444",
  },
  sena: {
    bg: "#FFFBEB",
    border: "#FCD34D",
    text: "#78350F",
    label: "SENA",
    dotColor: "#F59E0B",
    mapFill: "#FDE68A",
    mapStroke: "#F59E0B",
  },
};

const TIPOS_PARQUEADERO = ["General", "Motos", "Visitantes", "Docentes", "Administrativos"] as const;

const CONDUCTORES_DEMO = [
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

const PLACA_REGEX = /^[A-Z]{3}\d{2}[A-Z0-9]$/;

const validarPlacaColombiana = (placa: string): boolean => PLACA_REGEX.test(placa.trim().toUpperCase());

const limpiarTextoOCR = (raw: string): string => {
  const onlyAlnum = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (let i = 0; i <= onlyAlnum.length - 6; i++) {
    const candidate = onlyAlnum.slice(i, i + 6);
    if (PLACA_REGEX.test(candidate)) return candidate;
  }
  return onlyAlnum.slice(0, 6);
};

const sanitizeText = (text: string): string => {
  if (!text) return "";
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
};

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

const generarCeldas = (bloque: string, total: number): Celda[] =>
  Array.from({ length: total }, (_, i) => ({
    codigo: `${bloque.toUpperCase()}${String(i + 1).padStart(2, "0")}`,
    estado: "libre" as CeldaEstado,
  }));

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

interface State {
  view: "cards" | "map";
  parqueaderos: Parqueadero[];
  activeModal: ModalKey;
  parqueaderoEditandoId: number | null;
  parqueaderoEliminandoId: number | null;
  celdaActiva: { parqueaderoId: number; codigo: string } | null;
  form: FormParqueadero;
  vehiculoForm: VehiculoForm;
  placaError: string | null;
  ocrLoading: boolean;
  ocrError: string | null;
  ocrSuccessFlash: boolean;
}

type Action =
  | { type: "SET_VIEW"; view: "cards" | "map" }
  | { type: "OPEN_MODAL"; modal: ModalKey }
  | { type: "CLOSE_MODAL" }
  | { type: "SET_FORM"; form: Partial<FormParqueadero> }
  | { type: "RESET_FORM"; form: FormParqueadero }
  | { type: "CREATE_PARQUEADERO"; parqueadero: Parqueadero }
  | { type: "EDIT_PARQUEADERO"; id: number; nombre: string; total: number }
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
  | { type: "OCR_SUCCESS"; placa: string };

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
      { codigo: "B02", estado: "ocupado", placa: "MOT001", conductor: "Maria Gomez", timestampIngreso: Date.now() - 1000 * 60 * 20, ...formatearFechaHora(Date.now() - 1000 * 60 * 20) },
      { codigo: "B03", estado: "libre" },
      { codigo: "B04", estado: "libre" },
      { codigo: "B05", estado: "sena" },
      { codigo: "B06", estado: "ocupado", placa: "MOT002", conductor: "Daniel Castro", timestampIngreso: Date.now() - 1000 * 60 * 65, ...formatearFechaHora(Date.now() - 1000 * 60 * 65) },
      { codigo: "B07", estado: "libre" },
      { codigo: "B08", estado: "libre" },
      { codigo: "B09", estado: "libre" },
      { codigo: "B10", estado: "ocupado", placa: "MOT003", conductor: "Sofia Herrera", timestampIngreso: Date.now() - 1000 * 60 * 5, ...formatearFechaHora(Date.now() - 1000 * 60 * 5) },
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
  vehiculoForm: { placa: "", conductor: "" },
  placaError: null,
  ocrLoading: false,
  ocrError: null,
  ocrSuccessFlash: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_VIEW":
      return { ...state, view: action.view };

    case "OPEN_MODAL":
      return { ...state, activeModal: action.modal, placaError: null, ocrError: null };

    case "CLOSE_MODAL":
      return { ...state, activeModal: null };

    case "SET_FORM":
      return { ...state, form: { ...state.form, ...action.form } };

    case "RESET_FORM":
      return { ...state, form: action.form };

    case "CREATE_PARQUEADERO":
      return {
        ...state,
        parqueaderos: [...state.parqueaderos, action.parqueadero],
        activeModal: null,
        form: initialForm,
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
      };

    case "EDIT_PARQUEADERO":
      return {
        ...state,
        parqueaderos: state.parqueaderos.map((p) =>
          p.id === action.id ? { ...p, nombre: sanitizeText(action.nombre), total: action.total } : p
        ),
        activeModal: null,
        parqueaderoEditandoId: null,
      };

    case "REQUEST_DELETE":
      return { ...state, parqueaderoEliminandoId: action.id, activeModal: "confirmDelete" };

    case "CONFIRM_DELETE":
      return {
        ...state,
        parqueaderos: state.parqueaderos.filter((p) => p.id !== state.parqueaderoEliminandoId),
        activeModal: null,
        parqueaderoEliminandoId: null,
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
      };
    }

    case "REQUEST_LIBERAR":
      return { ...state, activeModal: "confirmLiberar" };

    case "CONFIRM_LIBERAR": {
      if (!state.celdaActiva) return state;
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

    default:
      return state;
  }
}

/* ============================================================
   ESTILOS COMPARTIDOS (actualizados)
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
   COMPONENTES BASE: Modal / ConfirmDialog / StatPill / Banner
============================================================ */

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxW?: number;
}

const Modal = memo(({ open, onClose, children, maxW = 480 }: ModalProps) => {
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
      const focusable = document.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable[0]?.focus();
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
      onClick={(e) => {
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
      <div>
        {eyebrow && (
          <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textLight, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 2 }}>
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
      onClick={onCancel}
    >
      <div
        style={{ width: "100%", maxWidth: 420, background: COLORS.surface, borderRadius: 24, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.18)" }}
        onClick={(e) => e.stopPropagation()}
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

/* ============================================================
   TARJETA DE CELDA (vista tarjetas)
============================================================ */

const CeldaCard = memo(({ celda, onClick }: { celda: Celda; onClick: () => void }) => {
  const cfg = CELDA_CONFIG[celda.estado];
  return (
    <button
      onClick={onClick}
      disabled={celda.estado === "sena"}
      className="park-celda-btn"
      style={{
        background: cfg.bg,
        border: `2px ${celda.estado === "libre" ? "dashed" : "solid"} ${cfg.border}`,
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
      aria-label={`Celda ${celda.codigo} - ${cfg.label}`}
    >
      <span style={{ fontSize: 12, fontWeight: 900, color: cfg.text, letterSpacing: ".05em" }}>{celda.codigo}</span>
      <Car size={22} color={cfg.text} strokeWidth={celda.estado === "ocupado" ? 2.2 : 1.6} />
      {celda.estado === "ocupado" ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: cfg.text }}>{celda.placa}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,.6)", marginTop: 1, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {celda.conductor}
          </div>
        </div>
      ) : (
        <span style={{ fontSize: 9, fontWeight: 700, color: cfg.text, textTransform: "uppercase", letterSpacing: ".08em", opacity: 0.75 }}>{cfg.label}</span>
      )}
    </button>
  );
});
CeldaCard.displayName = "CeldaCard";

/* ============================================================
   MAPA DE PARQUEADEROS (SVG)
============================================================ */

const ParkingMap = memo(
  ({ parqueaderos, onCellClick }: { parqueaderos: Parqueadero[]; onCellClick: (parqueaderoId: number, celda: Celda) => void }) => {
    const [zoom, setZoom] = React.useState(1);
    const [hoveredCell, setHoveredCell] = React.useState<string | null>(null);
    const [selectedCell, setSelectedCell] = React.useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const SPACE_W = 44;
    const SPACE_H = 24;
    const LANE_H = 36;
    const GAP_X = 4;
    const PADDING = 60;
    const SECTION_GAP = 28;
    const ROAD_W = 50;

    const lotLayouts = useMemo(() => {
      let currentY = PADDING;
      return parqueaderos.map((pq) => {
        const celdasPerRow = Math.ceil(Math.sqrt(pq.total * 1.6));
        const numRows = Math.ceil(pq.total / celdasPerRow);
        const rowsPerSection = Math.min(numRows, 4);
        const numSections = Math.ceil(numRows / rowsPerSection);

        const rows: { cells: (Celda & { x: number; y: number })[]; isLane: boolean; y: number }[] = [];
        let cellIndex = 0;
        let yOffset = currentY;

        for (let sec = 0; sec < numSections; sec++) {
          for (let row = 0; row < rowsPerSection && cellIndex < pq.total; row++) {
            const rowCells: (Celda & { x: number; y: number })[] = [];
            for (let col = 0; col < celdasPerRow && cellIndex < pq.total; col++) {
              rowCells.push({ ...pq.celdas[cellIndex], x: PADDING + col * (SPACE_W + GAP_X), y: yOffset });
              cellIndex++;
            }
            rows.push({ cells: rowCells, isLane: false, y: yOffset });
            yOffset += SPACE_H + 4;
          }
          if (sec < numSections - 1 && cellIndex < pq.total) {
            rows.push({ cells: [], isLane: true, y: yOffset });
            yOffset += LANE_H;
          }
        }

        const lotHeight = yOffset - currentY + SPACE_H + 10;
        const lotY = currentY;
        const libres = pq.celdas.filter((c) => c.estado === "libre").length;
        const ocupados = pq.celdas.filter((c) => c.estado === "ocupado").length;
        const senaCount = pq.celdas.filter((c) => c.estado === "sena").length;
        const pctOcupacion = Math.round((ocupados / pq.celdas.length) * 100);

        const layout = { pq, rows, lotHeight, lotY, celdasPerRow, libres, ocupados, senaCount, pctOcupacion };
        currentY = lotY + lotHeight + SECTION_GAP + 20;
        return layout;
      });
    }, [parqueaderos]);

    const totalWidth = useMemo(
      () => Math.max(...parqueaderos.map((pq) => PADDING + Math.ceil(Math.sqrt(pq.total * 1.6)) * (SPACE_W + GAP_X) + PADDING), 400),
      [parqueaderos]
    );

    const totalHeight = useMemo(() => {
      if (lotLayouts.length === 0) return PADDING * 2;
      const last = lotLayouts[lotLayouts.length - 1];
      return last.lotY + last.lotHeight + PADDING;
    }, [lotLayouts]);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      const handler = (e: WheelEvent) => {
        e.preventDefault();
        setZoom((z) => Math.max(0.5, Math.min(2, z + (e.deltaY > 0 ? -0.1 : 0.1))));
      };
      el.addEventListener("wheel", handler, { passive: false });
      return () => el.removeEventListener("wheel", handler);
    }, []);

    const handleCellClick = useCallback(
      (parqueaderoId: number, celda: Celda, cellKey: string) => {
        if (celda.estado === "sena") return;
        onCellClick(parqueaderoId, celda);
        setSelectedCell((prev) => (prev === cellKey ? null : cellKey));
      },
      [onCellClick]
    );

    return (
      <div ref={containerRef} style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: 20, border: `1px solid ${COLORS.border}`, background: "#FAFCF8" }}>
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { icon: <ZoomIn size={16} color={COLORS.textLight} />, label: "Acercar", action: () => setZoom((z) => Math.min(2, z + 0.2)) },
            { icon: <ZoomOut size={16} color={COLORS.textLight} />, label: "Alejar", action: () => setZoom((z) => Math.max(0.5, z - 0.2)) },
            { icon: <Maximize2 size={14} color={COLORS.textLight} />, label: "Reiniciar zoom", action: () => setZoom(1) },
          ].map((b) => (
            <button
              key={b.label}
              onClick={b.action}
              aria-label={b.label}
              style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${COLORS.border}`, background: COLORS.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}
            >
              {b.icon}
            </button>
          ))}
        </div>

        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, width: 40, height: 40, borderRadius: "50%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
          <Navigation size={18} color={COLORS.primary} />
        </div>

        <div style={{ overflow: "auto", maxHeight: "calc(100vh - 320px)", cursor: "grab" }}>
          <svg viewBox={`0 0 ${totalWidth} ${totalHeight}`} style={{ width: totalWidth, height: totalHeight, transform: `scale(${zoom})`, transformOrigin: "top left", display: "block" }}>
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E8EDE4" strokeWidth="0.5" />
              </pattern>
              <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
              </filter>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#D4CFC4" />
                <stop offset="50%" stopColor="#DDD8CF" />
                <stop offset="100%" stopColor="#D4CFC4" />
              </linearGradient>
            </defs>

            <rect width={totalWidth} height={totalHeight} fill="url(#grid)" />
            <rect x={0} y={PADDING - 20} width={totalWidth} height={ROAD_W} fill="url(#roadGrad)" rx="2" />
            <line x1={0} y1={PADDING - 20 + ROAD_W / 2} x2={totalWidth} y2={PADDING - 20 + ROAD_W / 2} stroke="#FFF" strokeWidth="2" strokeDasharray="8,6" opacity="0.6" />

            <g transform={`translate(${PADDING + 10}, ${PADDING - 20 + ROAD_W / 2 - 6})`}>
              <rect x={-22} y={-10} width={44} height={20} rx={10} fill={COLORS.primary} />
              <text x={0} y={4} textAnchor="middle" fill="#fff" fontSize={8} fontWeight="800">
                ENTRADA
              </text>
              <polygon points="-16,-4 -10,0 -16,4" fill="#fff" />
            </g>

            <g transform={`translate(${totalWidth - PADDING - 10}, ${PADDING - 20 + ROAD_W / 2 - 6})`}>
              <rect x={-22} y={-10} width={44} height={20} rx={10} fill={COLORS.danger} />
              <text x={0} y={4} textAnchor="middle" fill="#fff" fontSize={8} fontWeight="800">
                SALIDA
              </text>
              <polygon points="10,-4 16,0 10,4" fill="#fff" />
            </g>

            {lotLayouts.map((layout, idx) => {
              const { pq, rows, lotHeight, lotY, celdasPerRow, libres, ocupados, senaCount, pctOcupacion } = layout;
              const lotWidth = PADDING + celdasPerRow * (SPACE_W + GAP_X) + PADDING;
              const headerColor = pctOcupacion > 80 ? COLORS.danger : pctOcupacion > 50 ? COLORS.amber : COLORS.primary;

              return (
                <g key={pq.id}>
                  <rect x={20} y={lotY - 10} width={lotWidth - 20} height={lotHeight + 10} fill="#FFFFFF" stroke={COLORS.border} strokeWidth="1.5" rx="16" filter="url(#shadow)" />
                  <rect x={20} y={lotY - 10} width={lotWidth - 20} height={32} fill={headerColor} rx="16" />
                  <text x={lotWidth / 2} y={lotY + 8} textAnchor="middle" fill="#fff" fontSize={11} fontWeight="800">
                    {sanitizeText(pq.nombre).toUpperCase()} · {pctOcupacion}% OCUPADO
                  </text>
                  <text x={lotWidth - 80} y={lotY + 8} textAnchor="end" fill="rgba(255,255,255,.8)" fontSize={8} fontWeight="600">
                    {libres} libres · {ocupados} ocup. {senaCount > 0 ? `· ${senaCount} SENA` : ""}
                  </text>
                  <text x={30} y={lotY + 42} fill={COLORS.textLight} fontSize={8} fontWeight="700">
                    BLOQUE: {pq.bloque.toUpperCase()} · ZONA {pq.tipo.toUpperCase()}
                  </text>
                  <rect x={PADDING - 8} y={lotY + 20} width={8} height={lotHeight - 30} fill="url(#roadGrad)" rx="2" />
                  <text x={PADDING - 4} y={lotY + 40} textAnchor="middle" fill={COLORS.textLight} fontSize={10}>↑</text>
                  <text x={PADDING - 4} y={lotY + lotHeight - 20} textAnchor="middle" fill={COLORS.textLight} fontSize={10}>↓</text>

                  {rows.map((row, rowIdx) =>
                    row.isLane ? (
                      <g key={`lane-${rowIdx}`}>
                        <rect x={PADDING - 4} y={row.y - 4} width={celdasPerRow * (SPACE_W + GAP_X) + 8} height={LANE_H - 4} fill="url(#roadGrad)" rx="3" />
                        <line x1={PADDING} y1={row.y + LANE_H / 2 - 6} x2={PADDING + celdasPerRow * (SPACE_W + GAP_X)} y2={row.y + LANE_H / 2 - 6} stroke="#FFF" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                        <text x={PADDING + (celdasPerRow * (SPACE_W + GAP_X)) / 2} y={row.y + LANE_H / 2 - 2} textAnchor="middle" fill={COLORS.textLight} fontSize={12} opacity="0.5">
                          ← →
                        </text>
                      </g>
                    ) : (
                      <g key={`row-${rowIdx}`}>
                        <rect x={PADDING - 4} y={row.y - 3} width={celdasPerRow * (SPACE_W + GAP_X) + 8} height={SPACE_H + 6} fill="#FAFCF8" rx="3" />
                        {row.cells.map((celda) => {
                          const cfg = CELDA_CONFIG[celda.estado];
                          const cellKey = `${pq.id}-${celda.codigo}`;
                          const isHovered = hoveredCell === cellKey;
                          const isSelected = selectedCell === cellKey;
                          return (
                            <g
                              key={celda.codigo}
                              onClick={() => handleCellClick(pq.id, celda, cellKey)}
                              onMouseEnter={() => setHoveredCell(cellKey)}
                              onMouseLeave={() => setHoveredCell(null)}
                              style={{ cursor: celda.estado === "sena" ? "default" : "pointer" }}
                            >
                              <rect
                                x={celda.x}
                                y={celda.y}
                                width={SPACE_W}
                                height={SPACE_H}
                                fill={cfg.mapFill}
                                stroke={isSelected ? COLORS.primary : isHovered ? cfg.dotColor : cfg.mapStroke}
                                strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1}
                                rx="4"
                                filter={isSelected ? "url(#glow)" : undefined}
                              />
                              <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 - 2} textAnchor="middle" fill={cfg.text} fontSize={9} fontWeight="800">
                                {celda.codigo}
                              </text>
                              {celda.estado === "ocupado" && (
                                <>
                                  <rect x={celda.x + 14} y={celda.y + SPACE_H / 2 + 1} width={SPACE_W - 28} height={7} rx="3" fill="#444" opacity="0.8" />
                                  <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H - 2} textAnchor="middle" fill="#FF6B6B" fontSize={6.5} fontWeight="800" letterSpacing="0.5">
                                    {celda.placa}
                                  </text>
                                </>
                              )}
                              {celda.estado === "libre" && (
                                <rect x={celda.x + 2} y={celda.y + 2} width={SPACE_W - 4} height={SPACE_H - 4} fill="none" stroke="#4CAF50" strokeWidth="0.5" strokeDasharray="2,2" rx="2" opacity="0.4" />
                              )}
                              {celda.estado === "sena" && (
                                <text x={celda.x + SPACE_W / 2} y={celda.y + SPACE_H / 2 + 2} textAnchor="middle" fill="#78350F" fontSize={7} fontWeight="900">
                                  SENA
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    )
                  )}

                  <g opacity="0.3">
                    <circle cx={lotWidth - 10} cy={lotY + lotHeight / 2} r={8} fill="#4CAF50" />
                    <circle cx={lotWidth - 16} cy={lotY + lotHeight / 2 - 6} r={5} fill="#388E3C" />
                    <circle cx={lotWidth - 6} cy={lotY + lotHeight / 2 + 7} r={4} fill="#388E3C" />
                  </g>
                </g>
              );
            })}

            <g>
              <rect x={PADDING} y={totalHeight - PADDING + 10} width={totalWidth - PADDING * 2} height={28} fill="#F0F4ED" rx="8" stroke={COLORS.border} strokeWidth="1" />
              <text x={totalWidth / 2} y={totalHeight - PADDING + 28} textAnchor="middle" fill={COLORS.textLight} fontSize={8} fontWeight="600">
                MAPA DE PARQUEADEROS · SENA · {new Date().toLocaleDateString("es-CO")}
              </text>
            </g>
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 20, padding: "10px 0 4px", borderTop: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
          {(Object.entries(CELDA_CONFIG) as [CeldaEstado, CeldaConfigItem][]).map(([key, cfg]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 16, height: 10, borderRadius: 3, background: cfg.mapFill, border: `1.5px solid ${cfg.mapStroke}` }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.textLight }}>{cfg.label}</span>
            </div>
          ))}
          <div style={{ width: 1, height: 14, background: COLORS.border }} />
          <span style={{ fontSize: 10, color: COLORS.textLight, fontWeight: 500 }}>
            {parqueaderos.length} parqueadero{parqueaderos.length !== 1 ? "s" : ""} · Zoom: {(zoom * 100).toFixed(0)}%
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
  onSubmit: () => void;
  onClose: () => void;
  submitLabel: string;
  form: FormParqueadero;
  onChange: (patch: Partial<FormParqueadero>) => void;
}

const FormModalContent = memo(({ title, onSubmit, onClose, submitLabel, form, onChange }: FormModalProps) => (
  <>
    <ModalHeader eyebrow="Parqueaderos" title={title} onClose={onClose} />
    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
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
            value={form.bloque}
            onChange={(e) => onChange({ bloque: e.target.value })}
            onFocus={(e) => (e.target.style.borderColor = COLORS.primary)}
            onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
          />
        </div>
        <div>
          <label style={labelStyle}>Número de celdas</label>
          <input
            type="number"
            min={1}
            max={50}
            style={inputStyle}
            value={form.total}
            onChange={(e) => onChange({ total: parseInt(e.target.value) || 1 })}
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
   HOOK DE OCR (Tesseract.js + preprocesamiento)
============================================================ */

function preprocesarFrame(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto de canvas");

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const cropW = canvas.width * 0.55;
  const cropH = canvas.height * (1 / 3);
  const cropX = (canvas.width - cropW) / 2;
  const cropY = (canvas.height - cropH) / 2;

  const cropped = document.createElement("canvas");
  cropped.width = cropW;
  cropped.height = cropH;
  const cctx = cropped.getContext("2d");
  if (!cctx) throw new Error("No se pudo crear el contexto de recorte");
  cctx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

  const imgData = cctx.getImageData(0, 0, cropped.width, cropped.height);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const bin = gray > 130 ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = bin;
  }
  cctx.putImageData(imgData, 0, 0);

  return cropped.toDataURL("image/png");
}

function useOcrPlaca() {
  const procesar = useCallback(async (video: HTMLVideoElement): Promise<string> => {
    if (!video || video.videoWidth === 0) {
      throw new Error("La cámara aún no está lista, intenta de nuevo.");
    }
    const imageData = preprocesarFrame(video);
    const worker = await createWorker("eng");
    try {
      const { data } = await worker.recognize(imageData);
      const limpio = limpiarTextoOCR(data.text || "");
      if (!validarPlacaColombiana(limpio)) {
        throw new Error(`No se detectó una matrícula válida (lectura: "${limpio || "vacío"}"). Intenta de nuevo o escribe manualmente.`);
      }
      return limpio;
    } finally {
      await worker.terminate();
    }
  }, []);

  return { procesar };
}

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */

export default function Parqueaderos() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [, forceTick] = useReducer((c: number) => c + 1, 0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { procesar } = useOcrPlaca();

  useEffect(() => {
    const id = setInterval(() => forceTick(), 60000);
    return () => clearInterval(id);
  }, []);

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      dispatch({ type: "OCR_ERROR", error: "No se pudo acceder a la cámara. Verifica los permisos del navegador." });
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
      const placa = await procesar(videoRef.current);
      dispatch({ type: "OCR_SUCCESS", placa });
      cerrarCamara();
      setTimeout(() => dispatch({ type: "OPEN_MODAL", modal: "ingreso" }), 450);
    } catch (err) {
      dispatch({ type: "OCR_ERROR", error: err instanceof Error ? err.message : "Ocurrió un error al procesar la imagen." });
    }
  }, [procesar, cerrarCamara]);

  const handleCreate = useCallback(() => {
    if (!state.form.nombre.trim()) {
      dispatch({ type: "SET_PLACA_ERROR", error: null });
      alert("El nombre es requerido");
      return;
    }
    dispatch({
      type: "CREATE_PARQUEADERO",
      parqueadero: {
        id: Date.now(),
        nombre: sanitizeText(state.form.nombre.trim()),
        bloque: state.form.bloque.toUpperCase(),
        tipo: state.form.tipo,
        total: state.form.total,
        celdas: generarCeldas(state.form.bloque, state.form.total),
      },
    });
  }, [state.form]);

  const handleEdit = useCallback(() => {
    if (!state.parqueaderoEditandoId) return;
    if (!state.form.nombre.trim()) {
      alert("El nombre es requerido");
      return;
    }
    dispatch({ type: "EDIT_PARQUEADERO", id: state.parqueaderoEditandoId, nombre: state.form.nombre, total: state.form.total });
  }, [state.parqueaderoEditandoId, state.form]);

  const handleClickCelda = useCallback((parqueaderoId: number, celda: Celda) => {
    if (celda.estado === "sena") return;
    dispatch({ type: "SELECT_CELDA", parqueaderoId, codigo: celda.codigo, estado: celda.estado });
  }, []);

  const placaDuplicada = useCallback(
    (parqueaderoId: number, placa: string): boolean => {
      const parq = state.parqueaderos.find((p) => p.id === parqueaderoId);
      if (!parq) return false;
      const norm = placa.trim().toUpperCase();
      return parq.celdas.some((c) => c.estado === "ocupado" && c.placa === norm);
    },
    [state.parqueaderos]
  );

  const registrarVehiculo = useCallback(() => {
    if (!state.celdaActiva) return;
    const placaNorm = state.vehiculoForm.placa.trim().toUpperCase();

    if (!placaNorm || !state.vehiculoForm.conductor) {
      dispatch({ type: "SET_PLACA_ERROR", error: "Completa todos los campos" });
      return;
    }
    if (!validarPlacaColombiana(placaNorm)) {
      dispatch({ type: "SET_PLACA_ERROR", error: "Formato de matrícula inválido. Usa ABC123, ABC12D o AAA11A." });
      return;
    }
    if (placaDuplicada(state.celdaActiva.parqueaderoId, placaNorm)) {
      dispatch({ type: "SET_PLACA_ERROR", error: "Esta matrícula ya está registrada en otra celda de este parqueadero." });
      return;
    }

    dispatch({
      type: "REGISTRAR_VEHICULO",
      placa: sanitizeText(placaNorm),
      conductor: sanitizeText(state.vehiculoForm.conductor.trim()),
    });
  }, [state.celdaActiva, state.vehiculoForm, placaDuplicada]);

  const asignarAutomaticamente = useCallback(() => {
    for (const parq of state.parqueaderos) {
      const celda = parq.celdas.find((c) => c.estado === "libre");
      if (celda) {
        dispatch({ type: "SELECT_CELDA", parqueaderoId: parq.id, codigo: celda.codigo, estado: "libre" });
        return;
      }
    }
    alert("No hay celdas libres disponibles en ningún parqueadero.");
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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* ---------- HERO / STATS (rediseñado con la nueva paleta) ---------- */}
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
              onClick={() => dispatch({ type: "RESET_FORM", form: initialForm }) || dispatch({ type: "OPEN_MODAL", modal: "create" })}
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
            const pct = Math.round((ocupados / parqueadero.celdas.length) * 100);
            return (
              <div key={parqueadero.id} style={{ background: COLORS.surface, borderRadius: 20, border: `1px solid ${COLORS.border}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
                <div style={{ padding: "16px 18px 14px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: COLORS.primaryPale, border: `1px solid ${COLORS.primaryLight}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <ParkingCircle size={16} color={COLORS.primary} />
                      </div>
                      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: COLORS.text }}>{sanitizeText(parqueadero.nombre)}</h2>
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
                    <button onClick={() => dispatch({ type: "OPEN_EDIT", parqueadero })} style={iconBtnStyle} aria-label={`Editar ${sanitizeText(parqueadero.nombre)}`}>
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => dispatch({ type: "REQUEST_DELETE", id: parqueadero.id })}
                      style={{ ...iconBtnStyle, border: `1px solid ${COLORS.dangerBorder}`, background: COLORS.dangerBg, color: COLORS.danger }}
                      aria-label={`Eliminar ${sanitizeText(parqueadero.nombre)}`}
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
          onClose={() => dispatch({ type: "CLOSE_MODAL" })}
          onSubmit={handleCreate}
          submitLabel="Crear Parqueadero"
          form={state.form}
          onChange={(patch) => dispatch({ type: "SET_FORM", form: patch })}
        />
      </Modal>

      {/* ---------- MODAL EDITAR ---------- */}
      <Modal open={state.activeModal === "edit"} onClose={() => dispatch({ type: "CLOSE_MODAL" })}>
        <FormModalContent
          title="Editar Parqueadero"
          onClose={() => dispatch({ type: "CLOSE_MODAL" })}
          onSubmit={handleEdit}
          submitLabel="Guardar Cambios"
          form={state.form}
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
            <select
              value={state.vehiculoForm.conductor}
              onChange={(e) => dispatch({ type: "SET_VEHICULO_FORM", form: { conductor: e.target.value } })}
              style={{ ...inputStyle, appearance: "none" }}
            >
              <option value="">Seleccionar conductor…</option>
              {CONDUCTORES_DEMO.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
          <button onClick={() => dispatch({ type: "CLOSE_MODAL" })} style={{ ...btnSecondary, flex: 1 }}>
            Cancelar
          </button>
          <button
            onClick={registrarVehiculo}
            disabled={!state.vehiculoForm.placa.trim() || !state.vehiculoForm.conductor}
            style={{
              ...btnPrimary,
              flex: 2,
              background: state.vehiculoForm.placa.trim() && state.vehiculoForm.conductor ? COLORS.primary : COLORS.border,
              cursor: state.vehiculoForm.placa.trim() && state.vehiculoForm.conductor ? "pointer" : "default",
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
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: COLORS.text }}>Escanear Matrícula</h2>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.textLight }}>Reconocimiento óptico de caracteres (OCR)</p>
          </div>
          <button onClick={() => dispatch({ type: "OPEN_MODAL", modal: "ingreso" })} style={iconBtnStyle} aria-label="Cerrar escáner">
            <X size={16} />
          </button>
        </div>
        <div style={{ position: "relative", background: "#000", aspectRatio: "16/9" }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: "55%", maxWidth: 300, aspectRatio: "3/1", border: `3px solid ${COLORS.primary}`, borderRadius: 16, boxShadow: "0 0 0 9999px rgba(0,0,0,.5)" }} />
          </div>
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
        <div style={{ display: "flex", gap: 10, padding: "14px 20px 20px", justifyContent: "center" }}>
          <button onClick={() => dispatch({ type: "OPEN_MODAL", modal: "ingreso" })} style={{ ...btnSecondary, padding: "0 24px" }}>
            Cancelar
          </button>
          <button
            onClick={handleCapturarYReconocer}
            disabled={state.ocrLoading}
            style={{
              ...btnPrimary,
              padding: "0 28px",
              cursor: state.ocrLoading ? "default" : "pointer",
              opacity: state.ocrLoading ? 0.7 : 1,
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
    </div>
  );
}