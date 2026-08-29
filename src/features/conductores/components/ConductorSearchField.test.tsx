import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Conductor } from '@/services/api/conductores';
import { ConductorSearchField } from './ConductorSearchField';

const conductores: Conductor[] = [
  {
    id: '1', usuarioId: '', tipoDocumento: 'CC', numeroDocumento: '2345678901', nombre: 'Carlos López M.',
    correo: 'carlos.lopez@sena.edu.co', direccion: '', numeroTelefonico: '', tipoUsuarioId: '1',
    tipoUsuarioNombre: 'Aprendiz', regionalFormacion: '', centroFormacion: '', programaFormacion: '',
    vigencia: '', movilidadReducida: false, tipoDiscapacidad: '', estado: 'activo',
  },
  {
    id: '2', usuarioId: '', tipoDocumento: 'CC', numeroDocumento: '3456789012', nombre: 'Pedro Ruiz G.',
    correo: 'pedro.ruiz@sena.edu.co', direccion: '', numeroTelefonico: '', tipoUsuarioId: '2',
    tipoUsuarioNombre: 'Instructor', regionalFormacion: '', centroFormacion: '', programaFormacion: '',
    vigencia: '', movilidadReducida: false, tipoDiscapacidad: '', estado: 'activo',
  },
];

function Wrapper({ onSelect }: { onSelect: (c: Conductor) => void }) {
  const [query, setQuery] = useState('');
  return (
    <ConductorSearchField
      conductores={conductores}
      query={query}
      onQueryChange={setQuery}
      onSelect={onSelect}
    />
  );
}

describe('ConductorSearchField', () => {
  it('no muestra ninguna sugerencia cuando el campo está vacío', () => {
    render(<Wrapper onSelect={vi.fn()} />);
    expect(screen.queryByText('Carlos López M.')).not.toBeInTheDocument();
    expect(screen.queryByText('Pedro Ruiz G.')).not.toBeInTheDocument();
    expect(screen.queryByText('No se encontró ningún conductor.')).not.toBeInTheDocument();
  });

  it('encuentra por documento', async () => {
    const user = userEvent.setup();
    render(<Wrapper onSelect={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/Buscar por documento/), '2345678901');
    expect(screen.getByText('Carlos López M.')).toBeInTheDocument();
    expect(screen.queryByText('Pedro Ruiz G.')).not.toBeInTheDocument();
  });

  it('encuentra por nombre', async () => {
    const user = userEvent.setup();
    render(<Wrapper onSelect={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/Buscar por documento/), 'pedro');
    expect(screen.getByText('Pedro Ruiz G.')).toBeInTheDocument();
    expect(screen.queryByText('Carlos López M.')).not.toBeInTheDocument();
  });

  it('encuentra por correo', async () => {
    const user = userEvent.setup();
    render(<Wrapper onSelect={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/Buscar por documento/), 'carlos.lopez@sena');
    expect(screen.getByText('Carlos López M.')).toBeInTheDocument();
  });

  it('muestra "no se encontró" cuando no hay coincidencias', async () => {
    const user = userEvent.setup();
    render(<Wrapper onSelect={vi.fn()} />);
    await user.type(screen.getByPlaceholderText(/Buscar por documento/), 'zzz-inexistente');
    expect(screen.getByText('No se encontró ningún conductor.')).toBeInTheDocument();
  });

  it('llama a onSelect con el conductor elegido', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Wrapper onSelect={onSelect} />);
    await user.type(screen.getByPlaceholderText(/Buscar por documento/), 'carlos');
    await user.click(screen.getByText('Carlos López M.'));
    expect(onSelect).toHaveBeenCalledWith(conductores[0]);
  });
});
