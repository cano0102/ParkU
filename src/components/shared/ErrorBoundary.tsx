import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { theme } from '../../styles/theme';

const C = theme;

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: C.bg,
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: '100%',
            textAlign: 'center',
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: '32px 28px',
            boxShadow: '0 20px 55px rgba(15,23,42,.08)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              margin: '0 auto 16px',
              borderRadius: 14,
              background: C.dangerBg,
              border: `1px solid ${C.dangerBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={24} color={C.danger} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 6 }}>
            Ocurrió un error inesperado
          </div>
          <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 20, lineHeight: 1.5 }}>
            La aplicación encontró un problema y no puede continuar en esta vista. Puedes intentar recargar la página.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              width: '100%',
              height: 40,
              borderRadius: 10,
              border: 'none',
              background: C.primary,
              color: '#fff',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
}
