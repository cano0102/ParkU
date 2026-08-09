import { Modal } from './Modal';
import { theme } from '../../theme';

const C = theme;

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'danger' | 'success' | 'info';
}

const TONE_BG: Record<NonNullable<ConfirmDialogProps['tone']>, string> = {
  danger: C.danger,
  success: C.success,
  info: C.info,
};

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Eliminar',
  tone = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} maxWidth={420} title={title}>
      <div style={{ padding: '1.8rem' }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: '#fff',
              color: C.text,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: TONE_BG[tone],
              color: '#fff',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
