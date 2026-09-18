import { Modal } from './Modal';
import { theme } from '../../styles/theme';
import { useEnCurso } from '../../hooks/useEnCurso';

const C = theme;

interface ConfirmDialogProps {
  open: boolean;
  /** Si devuelve una promesa, el diálogo bloquea sus botones hasta que termine (ver useEnCurso). */
  onConfirm: () => void | Promise<unknown>;
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
  const [confirmar, enCurso] = useEnCurso(onConfirm);
  return (
    <Modal open={open} onClose={enCurso ? () => {} : onCancel} maxWidth={420} title={title}>
      <div style={{ padding: '1.8rem' }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: C.text, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.6, marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={enCurso}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: `1px solid ${C.border}`,
              background: '#fff',
              color: C.text,
              fontSize: 13,
              fontWeight: 700,
              cursor: enCurso ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={enCurso}
            aria-busy={enCurso}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: TONE_BG[tone],
              color: '#fff',
              fontSize: 13,
              fontWeight: 800,
              cursor: enCurso ? 'wait' : 'pointer',
              opacity: enCurso ? 0.7 : 1,
              fontFamily: 'inherit',
            }}
          >
            {enCurso ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
