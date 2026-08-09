import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { theme } from '../../theme';

const C = theme;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
  /** Título accesible para lectores de pantalla; no se renderiza visualmente (el header visible va en `children`). */
  title?: string;
}

const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export function Modal({ open, onClose, children, maxWidth = 640, title = 'Diálogo' }: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15,23,42,.45)',
            backdropFilter: 'blur(4px)',
            animation: 'shared-modal-fade .15s ease',
          }}
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100% - 2rem)',
            maxWidth,
            maxHeight: '92vh',
            overflowY: 'auto',
            borderRadius: 24,
            background: '#fff',
            border: `1px solid ${C.border}`,
            boxShadow: '0 20px 55px rgba(15,23,42,.12)',
            zIndex: 1001,
            outline: 'none',
            animation: 'shared-modal-in .18s ease',
          }}
        >
          <DialogPrimitive.Title style={srOnly}>{title}</DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
        <style>{`
          @keyframes shared-modal-fade { from { opacity: 0 } to { opacity: 1 } }
          @keyframes shared-modal-in {
            from { opacity: 0; transform: translate(-50%, -46%) scale(.97); }
            to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          }
        `}</style>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
