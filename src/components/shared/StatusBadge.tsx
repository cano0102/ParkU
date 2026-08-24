import { theme } from '../../styles/theme';

const C = theme;

interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

/** Pastilla con punto de estado (activo/inactivo), patrón repetido en las páginas CRUD. */
export function StatusBadge({ active, activeLabel = 'Activo', inactiveLabel = 'Inactivo' }: StatusBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        background: active ? 'rgba(57,169,0,.1)' : 'rgba(239,68,68,.08)',
        color: active ? '#166534' : '#B91C1C',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: active ? C.primary : '#EF4444',
          flexShrink: 0,
        }}
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
