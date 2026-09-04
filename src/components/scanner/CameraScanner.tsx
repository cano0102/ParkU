import type { ReactNode } from "react";
import { IconX as X } from "@tabler/icons-react";
import { theme } from "@/styles/theme";
import { Modal } from "@/components/shared";

const COLORS = theme;

export interface CameraScannerProps {
  open: boolean;
  onClose: () => void;
  icon: ReactNode;
  eyebrow: string;
  title: string;
  maxWidth?: number;
  /** El contenido de captura en sí (video+canvas para OCR, o el componente
   * de la librería de QR) — cada modo de escaneo es demasiado distinto para
   * forzarlo a una forma común, así que vive fuera de este shell. */
  children: ReactNode;
}

/**
 * Modal-chrome compartido por los flujos de cámara (reconocimiento de placa
 * por OCR y lectura de QR de cédula): mismo encabezado con ícono+título y
 * botón de cerrar, mismo `Modal` de base. Antes esta cabecera vivía
 * duplicada — una vez dentro de ScannerModal.tsx y otra vez, con otro
 * estilo, inline en UsuarioFormModal.tsx envolviendo a ScannerQR.
 */
export function CameraScanner({ open, onClose, icon, eyebrow, title, maxWidth = 440, children }: CameraScannerProps) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={maxWidth}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.4rem 1.8rem",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: COLORS.primaryPale,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: COLORS.primary, textTransform: "uppercase" }}>
              {eyebrow}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: COLORS.text, lineHeight: 1, margin: 0 }}>{title}</h2>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            border: `1px solid ${COLORS.border}`,
            background: "#fff",
            cursor: "pointer",
            color: COLORS.textLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>

      {children}
    </Modal>
  );
}
