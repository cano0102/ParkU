import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntityFormModal } from './EntityFormModal';

describe('EntityFormModal', () => {
  it('renderiza título, eyebrow y children', () => {
    render(
      <EntityFormModal
        icon={<span>icon</span>}
        eyebrow="Registro"
        title="Nuevo conductor"
        onSubmit={() => {}}
        onCancel={() => {}}
        isValid={true}
        submitLabel="Guardar"
      >
        <input aria-label="Nombre" />
      </EntityFormModal>
    );
    expect(screen.getByText('Registro')).toBeInTheDocument();
    expect(screen.getByText('Nuevo conductor')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
  });

  it('deshabilita el botón de envío cuando isValid es false', () => {
    render(
      <EntityFormModal
        icon={<span>icon</span>}
        eyebrow="Registro"
        title="Nuevo conductor"
        onSubmit={() => {}}
        onCancel={() => {}}
        isValid={false}
        submitLabel="Guardar"
      >
        <div />
      </EntityFormModal>
    );
    expect(screen.getByText('Guardar')).toBeDisabled();
  });

  it('llama a onSubmit al enviar el formulario cuando es válido', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <EntityFormModal
        icon={<span>icon</span>}
        eyebrow="Registro"
        title="Nuevo conductor"
        onSubmit={onSubmit}
        onCancel={() => {}}
        isValid={true}
        submitLabel="Guardar"
      >
        <div />
      </EntityFormModal>
    );
    await user.click(screen.getByText('Guardar'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('llama a onCancel al hacer click en Cancelar o en el botón de cerrar', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <EntityFormModal
        icon={<span>icon</span>}
        eyebrow="Registro"
        title="Nuevo conductor"
        onSubmit={() => {}}
        onCancel={onCancel}
        isValid={true}
        submitLabel="Guardar"
      >
        <div />
      </EntityFormModal>
    );
    await user.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.click(screen.getByLabelText('Cerrar formulario'));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('muestra el mensaje de validación solo cuando showValidationMessage es true y no es válido', () => {
    const { rerender } = render(
      <EntityFormModal
        icon={<span>icon</span>}
        eyebrow="Registro"
        title="Nuevo conductor"
        onSubmit={() => {}}
        onCancel={() => {}}
        isValid={false}
        submitLabel="Guardar"
        showValidationMessage={false}
      >
        <div />
      </EntityFormModal>
    );
    expect(screen.queryByText('Revisa los campos marcados')).not.toBeInTheDocument();

    rerender(
      <EntityFormModal
        icon={<span>icon</span>}
        eyebrow="Registro"
        title="Nuevo conductor"
        onSubmit={() => {}}
        onCancel={() => {}}
        isValid={false}
        submitLabel="Guardar"
        showValidationMessage={true}
      >
        <div />
      </EntityFormModal>
    );
    expect(screen.getByText('Revisa los campos marcados')).toBeInTheDocument();
  });
});
