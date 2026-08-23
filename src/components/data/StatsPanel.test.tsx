import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsPanel } from './StatsPanel';

describe('StatsPanel', () => {
  it('renderiza título, descripción y eyebrow', () => {
    render(
      <StatsPanel
        eyebrowIcon={<span>icon</span>}
        eyebrowText="Gestión"
        title="Conductores"
        description="Administra conductores"
        metrics={[{ label: 'Total', value: 10 }]}
      />
    );
    expect(screen.getByText('Gestión')).toBeInTheDocument();
    expect(screen.getByText('Conductores')).toBeInTheDocument();
    expect(screen.getByText('Administra conductores')).toBeInTheDocument();
  });

  it('renderiza una métrica por cada entrada de metrics', () => {
    render(
      <StatsPanel
        eyebrowIcon={<span>icon</span>}
        eyebrowText="Gestión"
        title="Conductores"
        description="desc"
        metrics={[
          { label: 'Total', value: 10 },
          { label: 'Activos', value: 8 },
        ]}
      />
    );
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Activos')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
