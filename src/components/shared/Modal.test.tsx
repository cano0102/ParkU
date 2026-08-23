import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';
import { ConfirmDialog } from './ConfirmDialog';

describe('Modal', () => {
  it('no renderiza nada cuando open es false', () => {
    render(
      <Modal open={false} onClose={() => {}}>
        <p>Contenido del modal</p>
      </Modal>
    );
    expect(screen.queryByText('Contenido del modal')).not.toBeInTheDocument();
  });

  it('renderiza el contenido y el rol dialog cuando open es true', () => {
    render(
      <Modal open={true} onClose={() => {}}>
        <p>Contenido del modal</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Contenido del modal')).toBeInTheDocument();
  });

  it('llama a onClose al presionar Escape', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Contenido del modal</p>
      </Modal>
    );

    await user.keyboard('{Escape}');
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});

describe('ConfirmDialog', () => {
  it('llama a onCancel al hacer click en Cancelar', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        open={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        title="Eliminar registro"
        message="¿Estás seguro?"
      />
    );

    await user.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('llama a onConfirm al hacer click en el botón de confirmación', async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        open={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        title="Eliminar registro"
        message="¿Estás seguro?"
        confirmLabel="Eliminar"
      />
    );

    await user.click(screen.getByText('Eliminar'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
