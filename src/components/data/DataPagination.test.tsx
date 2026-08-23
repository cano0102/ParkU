import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataPagination } from './DataPagination';

describe('DataPagination', () => {
  it('muestra el rango de items visibles y el total', () => {
    render(
      <DataPagination
        currentPage={2}
        totalPages={3}
        itemsPerPage={10}
        totalItems={25}
        itemsPerPageOptions={[10, 20]}
        entityLabel="Conductores"
        onPageChange={() => {}}
        onItemsPerPageChange={() => {}}
      />
    );
    expect(screen.getByText('11–20')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('no renderiza los controles de página cuando solo hay una página', () => {
    render(
      <DataPagination
        currentPage={1}
        totalPages={1}
        itemsPerPage={10}
        totalItems={5}
        itemsPerPageOptions={[10, 20]}
        entityLabel="Conductores"
        onPageChange={() => {}}
        onItemsPerPageChange={() => {}}
      />
    );
    expect(screen.queryByText('Siguiente →')).not.toBeInTheDocument();
  });

  it('deshabilita "Anterior" en la primera página y "Siguiente" en la última', () => {
    render(
      <DataPagination
        currentPage={1}
        totalPages={3}
        itemsPerPage={10}
        totalItems={25}
        itemsPerPageOptions={[10, 20]}
        entityLabel="Conductores"
        onPageChange={() => {}}
        onItemsPerPageChange={() => {}}
      />
    );
    expect(screen.getByText('← Anterior')).toBeDisabled();
    expect(screen.getByText('Siguiente →')).not.toBeDisabled();
  });

  it('llama a onPageChange con el número de página clicado', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DataPagination
        currentPage={1}
        totalPages={3}
        itemsPerPage={10}
        totalItems={25}
        itemsPerPageOptions={[10, 20]}
        entityLabel="Conductores"
        onPageChange={onPageChange}
        onItemsPerPageChange={() => {}}
      />
    );
    await user.click(screen.getByText('2'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('llama a onItemsPerPageChange al cambiar el selector', async () => {
    const onItemsPerPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DataPagination
        currentPage={1}
        totalPages={1}
        itemsPerPage={10}
        totalItems={5}
        itemsPerPageOptions={[10, 20]}
        entityLabel="Conductores"
        onPageChange={() => {}}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    );
    await user.selectOptions(screen.getByLabelText('Conductores por página'), '20');
    expect(onItemsPerPageChange).toHaveBeenCalledWith(20);
  });
});
