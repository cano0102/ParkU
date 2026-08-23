import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataGrid } from './DataGrid';

interface Item { id: string; nombre: string }

const items: Item[] = [
  { id: '1', nombre: 'Uno' },
  { id: '2', nombre: 'Dos' },
];

describe('DataGrid', () => {
  it('renderiza una tarjeta por cada item usando renderCard', () => {
    render(
      <DataGrid
        items={items}
        getKey={(i) => i.id}
        renderCard={(i) => <div>{i.nombre}</div>}
      />
    );
    expect(screen.getByText('Uno')).toBeInTheDocument();
    expect(screen.getByText('Dos')).toBeInTheDocument();
  });

  it('no renderiza tarjetas cuando la lista está vacía', () => {
    const { container } = render(
      <DataGrid items={[]} getKey={(i: Item) => i.id} renderCard={(i: Item) => <div className="card">{i.nombre}</div>} />
    );
    expect(container.querySelectorAll('.card').length).toBe(0);
  });

  it('aplica gridTemplateColumns y gap personalizados', () => {
    const { container } = render(
      <DataGrid
        items={items}
        getKey={(i) => i.id}
        renderCard={(i) => <div>{i.nombre}</div>}
        gridTemplateColumns="repeat(3,1fr)"
        gap={20}
      />
    );
    const grid = container.querySelector('.data-grid') as HTMLElement;
    expect(grid.style.gridTemplateColumns).toBe('repeat(3,1fr)');
    expect(grid.style.gap).toBe('20px');
  });
});
