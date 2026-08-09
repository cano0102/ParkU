import { theme } from '../theme';

const C = theme;

export function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.bg,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: `3px solid ${C.primaryBorder}`,
          borderTopColor: C.primary,
          animation: 'route-fallback-spin .7s linear infinite',
        }}
      />
      <style>{`
        @keyframes route-fallback-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
