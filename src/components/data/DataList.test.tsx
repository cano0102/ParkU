import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataList, type DataListColumn } from './DataList';

interface Item { id: string; nombre: string; edad: number }

const items: Item[] = [
  { id: '1', nombre: 'Ana', edad: 30 },
  { id: '2', nombre: 'Beto', edad: 25 },
];

const columns: DataListColumn<Item>[] = [
  { header: 'Nombre', render: (i) => i.nombre, width: '2fr' },
  { header: 'Edad', render: (i) => String(i.edad), width: '1fr', align: 'right' },
];

describe('DataList', () => {
  it('renderiza el header de cada columna', () => {
    render(<DataList items={items} getKey={(i) => i.id} columns={columns} />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Edad')).toBeInTheDocument();
  });

  it('renderiza una fila por cada item con el contenido de cada columna', () => {
    render(<DataList items={items} getKey={(i) => i.id} columns={columns} />);
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Beto')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('calcula grid-template-columns a partir de columns[].width', () => {
    const { container } = render(<DataList items={items} getKey={(i) => i.id} columns={columns} />);
    const styleTag = container.querySelector('style') as HTMLStyleElement;
    expect(styleTag.textContent).toContain('grid-template-columns: 2fr 1fr;');
  });

  it('no renderiza filas cuando la lista está vacía', () => {
    const { container } = render(<DataList items={[]} getKey={(i: Item) => i.id} columns={columns} />);
    expect(container.querySelectorAll('.data-list-row').length).toBe(0);
  });
});
