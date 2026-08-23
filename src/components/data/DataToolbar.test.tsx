import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataToolbar } from './DataToolbar';

const baseProps = {
  search: '',
  onSearchChange: vi.fn(),
  searchPlaceholder: 'Buscar...',
  searchAriaLabel: 'Buscar conductor',
  filters: [],
  viewMode: 'grid' as const,
  onViewModeChange: vi.fn(),
  createLabel: 'Nuevo Conductor',
  onCreate: vi.fn(),
};

describe('DataToolbar', () => {
  it('renderiza el input de búsqueda y el botón de crear', () => {
    render(<DataToolbar {...baseProps} />);
    expect(screen.getByLabelText('Buscar conductor')).toBeInTheDocument();
    expect(screen.getByText('Nuevo Conductor')).toBeInTheDocument();
  });

  it('llama a onSearchChange al escribir', async () => {
    const onSearchChange = vi.fn();
    const user = userEvent.setup();
    render(<DataToolbar {...baseProps} onSearchChange={onSearchChange} />);
    await user.type(screen.getByLabelText('Buscar conductor'), 'a');
    expect(onSearchChange).toHaveBeenCalledWith('a');
  });

  it('llama a onCreate al hacer click en el botón de crear', async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<DataToolbar {...baseProps} onCreate={onCreate} />);
    await user.click(screen.getByText('Nuevo Conductor'));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('llama a onViewModeChange al alternar entre grid y lista', async () => {
    const onViewModeChange = vi.fn();
    const user = userEvent.setup();
    render(<DataToolbar {...baseProps} onViewModeChange={onViewModeChange} />);
    await user.click(screen.getByLabelText('Lista'));
    expect(onViewModeChange).toHaveBeenCalledWith('list');
  });

  it('renderiza un <select> por cada filtro configurado', () => {
    render(
      <DataToolbar
        {...baseProps}
        filters={[
          { value: 'todos', onChange: vi.fn(), ariaLabel: 'Filtrar por tipo', options: [{ value: 'todos', label: 'Todos' }] },
        ]}
      />
    );
    expect(screen.getByLabelText('Filtrar por tipo')).toBeInTheDocument();
  });

  it('no muestra la barra de filtros activos si activeFiltersCount es 0', () => {
    render(<DataToolbar {...baseProps} activeFiltersBar={{ activeFiltersCount: 0, filteredCount: 5, onClearFilters: vi.fn() }} />);
    expect(screen.queryByText('Limpiar filtros')).not.toBeInTheDocument();
  });

  it('muestra la barra de filtros activos y llama a onClearFilters', async () => {
    const onClearFilters = vi.fn();
    const user = userEvent.setup();
    render(
      <DataToolbar
        {...baseProps}
        activeFiltersBar={{ activeFiltersCount: 1, filteredCount: 3, onClearFilters }}
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
    await user.click(screen.getByText('Limpiar filtros'));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });
});
