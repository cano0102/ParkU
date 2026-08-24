import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { theme } from '../../styles/theme';

const C = theme;

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
  style?: React.CSSProperties;
}

export function FormField({ label, children, hint, error, style }: FormFieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: C.textLight }}>{hint}</span>}
      </div>
      {children}
      {error && (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10.5,
            fontWeight: 600,
            color: '#DC2626',
          }}
        >
          <AlertCircle size={11} /> {error}
        </span>
      )}
    </div>
  );
}
