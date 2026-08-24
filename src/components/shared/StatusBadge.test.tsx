import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('muestra la etiqueta activa por defecto cuando active es true', () => {
    render(<StatusBadge active={true} />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('muestra la etiqueta inactiva por defecto cuando active es false', () => {
    render(<StatusBadge active={false} />);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('acepta etiquetas personalizadas', () => {
    render(<StatusBadge active={true} activeLabel="Habilitado" inactiveLabel="Deshabilitado" />);
    expect(screen.getByText('Habilitado')).toBeInTheDocument();
  });

  it('usa la etiqueta inactiva personalizada cuando active es false', () => {
    render(<StatusBadge active={false} activeLabel="Habilitado" inactiveLabel="Deshabilitado" />);
    expect(screen.getByText('Deshabilitado')).toBeInTheDocument();
  });
});
