import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { AvatarUploader } from './AvatarUploader';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const procesarFotoCuadrada = vi.hoisted(() => vi.fn());
vi.mock('@/utils/imagen', () => ({ procesarFotoCuadrada }));

afterEach(() => vi.clearAllMocks());

const archivo = () => new File(['imagen'], 'foto.png', { type: 'image/png' });

describe('AvatarUploader', () => {
  it('entrega la foto ya recortada al elegir un archivo', async () => {
    procesarFotoCuadrada.mockResolvedValue('data:image/jpeg;base64,recortada');
    const onChange = vi.fn();
    render(<AvatarUploader nombre="Laura Gómez" onChange={onChange} />);

    await userEvent.upload(screen.getByLabelText('Subir foto de Laura Gómez'), archivo());

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('data:image/jpeg;base64,recortada'));
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('avisa con el motivo exacto cuando la imagen no se puede usar', async () => {
    procesarFotoCuadrada.mockRejectedValue(new Error('La imagen no debe superar 5MB'));
    const onChange = vi.fn();
    render(<AvatarUploader nombre="Laura Gómez" onChange={onChange} />);

    await userEvent.upload(screen.getByLabelText('Subir foto de Laura Gómez'), archivo());

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('La imagen no debe superar 5MB'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('cae a un mensaje genérico si el fallo no trae uno propio', async () => {
    procesarFotoCuadrada.mockRejectedValue('fallo sin Error');
    render(<AvatarUploader nombre="Laura Gómez" onChange={vi.fn()} />);

    await userEvent.upload(screen.getByLabelText('Subir foto de Laura Gómez'), archivo());

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('No se pudo procesar la imagen'));
  });

  it('permite quitar la foto existente, y solo entonces ofrece ese botón', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<AvatarUploader nombre="Laura Gómez" onChange={onChange} />);
    expect(screen.queryByRole('button', { name: 'Quitar foto de Laura Gómez' })).not.toBeInTheDocument();

    rerender(<AvatarUploader nombre="Laura Gómez" foto="data:image/jpeg;base64,abc" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Quitar foto de Laura Gómez' }));

    expect(onChange).toHaveBeenCalledWith('');
  });

  it('deshabilitado no deja ni cambiar ni quitar la foto', async () => {
    const onChange = vi.fn();
    render(<AvatarUploader nombre="Laura Gómez" foto="data:image/jpeg;base64,abc" onChange={onChange} disabled />);

    expect(screen.getByLabelText('Cambiar foto de Laura Gómez')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Quitar foto de Laura Gómez' })).toBeDisabled();

    // Y si el diálogo de archivos se cierra sin elegir nada, no se procesa ni se avisa nada.
    screen.getByLabelText('Cambiar foto de Laura Gómez').dispatchEvent(new Event('change', { bubbles: true }));

    expect(procesarFotoCuadrada).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });
});
