import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('muestra las iniciales cuando la persona no tiene foto registrada', () => {
    render(<Avatar nombre="Laura Gómez Ruiz" />);

    expect(screen.getByText('LG')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('muestra la foto cuando la hay, con un alt que identifica a la persona', () => {
    render(<Avatar nombre="Laura Gómez" foto="data:image/jpeg;base64,abc" size={64} radius={999} />);

    const img = screen.getByRole('img', { name: 'Foto de Laura Gómez' });
    expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,abc');
    expect(screen.queryByText('LG')).not.toBeInTheDocument();
  });

  it('acepta tamaño de letra y estilos propios de la pantalla que lo usa', () => {
    render(<Avatar nombre="Ana Martínez" fontSize={20} style={{ boxShadow: '0 3px 10px #000' }} />);

    const avatar = screen.getByTitle('Ana Martínez');
    expect(avatar).toHaveStyle({ fontSize: '20px', boxShadow: '0 3px 10px #000' });
  });
});
