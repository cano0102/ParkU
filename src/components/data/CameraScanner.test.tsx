import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CameraScanner } from './CameraScanner';

describe('CameraScanner', () => {
  it('no renderiza nada cuando open es false', () => {
    render(
      <CameraScanner open={false} onClose={() => {}} icon={<span>icon</span>} eyebrow="OCR" title="Escanear Placa">
        <p>Contenido de captura</p>
      </CameraScanner>
    );
    expect(screen.queryByText('Contenido de captura')).not.toBeInTheDocument();
  });

  it('renderiza título, eyebrow y children cuando open es true', () => {
    render(
      <CameraScanner open={true} onClose={() => {}} icon={<span>icon</span>} eyebrow="OCR" title="Escanear Placa">
        <p>Contenido de captura</p>
      </CameraScanner>
    );
    expect(screen.getByText('OCR')).toBeInTheDocument();
    expect(screen.getByText('Escanear Placa')).toBeInTheDocument();
    expect(screen.getByText('Contenido de captura')).toBeInTheDocument();
  });

  it('llama a onClose al hacer click en el botón de cerrar', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <CameraScanner open={true} onClose={onClose} icon={<span>icon</span>} eyebrow="OCR" title="Escanear Placa">
        <p>Contenido</p>
      </CameraScanner>
    );
    await user.click(screen.getByLabelText('Cerrar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
