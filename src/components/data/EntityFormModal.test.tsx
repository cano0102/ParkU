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

  it('deja el botón de envío clicable cuando isValid es false, para poder revelar los errores al intentar enviar', async () => {
    // A propósito NO se deshabilita por `isValid` (a diferencia de una versión anterior):
    // cada handler de dominio (handleCreate/handleSave/...) ya valida antes de llamar a la
    // API y marca todos los campos como "tocados" para mostrar sus errores — deshabilitar el
    // botón le quitaría al usuario la forma más simple de descubrir qué falta al hacer clic
    // en un formulario recién abierto y vacío.
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <EntityFormModal
        icon={<span>icon</span>}
        eyebrow="Registro"
        title="Nuevo conductor"
        onSubmit={onSubmit}
        onCancel={() => {}}
        isValid={false}
        submitLabel="Guardar"
      >
        <div />
      </EntityFormModal>
    );
    const boton = screen.getByText('Guardar');
    expect(boton).not.toBeDisabled();
    await user.click(boton);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('deshabilita el botón mientras la mutación está en curso, evitando un doble envío', async () => {
    let resolveSubmit: () => void = () => {};
    const onSubmit = vi.fn(() => new Promise<void>((resolve) => { resolveSubmit = resolve; }));
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
    const boton = screen.getByText('Guardar');
    await user.click(boton);
    expect(screen.getByText('Guardando…')).toBeDisabled();

    // Un segundo clic mientras la primera mutación sigue en vuelo no debe disparar una segunda.
    await user.click(screen.getByText('Guardando…'));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    resolveSubmit();
    expect(await screen.findByText('Guardar')).not.toBeDisabled();
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
