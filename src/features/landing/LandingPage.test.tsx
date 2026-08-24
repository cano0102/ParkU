import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SenaLanding from './LandingPage';

const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

function renderLanding() {
  return render(
    <MemoryRouter>
      <SenaLanding />
    </MemoryRouter>,
  );
}

describe('SenaLanding', () => {
  afterEach(() => {
    navigateMock.mockClear();
  });

  it('renderiza sin errores y muestra el contenido estático clave', () => {
    renderLanding();

    expect(screen.getAllByText('ParkU').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Sistema Institucional SENA')).toBeInTheDocument();
    expect(screen.getByText('Plataforma Oficial SENA')).toBeInTheDocument();
    const heroHeading = screen.getByRole('heading', { level: 1 });
    expect(heroHeading.textContent).toContain('Gestión');
    expect(heroHeading.textContent).toContain('Inteligente');
    expect(heroHeading.textContent).toContain('de Parqueaderos');
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acceder al sistema/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();

    // Los enlaces de navegación aparecen tanto en el navbar como en el footer.
    expect(screen.getAllByRole('button', { name: 'Beneficios' }).length).toBeGreaterThanOrEqual(2);
  });

  it('el botón "Ingresar" del navbar navega a /login', async () => {
    const user = userEvent.setup();
    renderLanding();

    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('el botón "Acceder al Sistema" del hero navega a /login', async () => {
    const user = userEvent.setup();
    renderLanding();

    await user.click(screen.getByRole('button', { name: /acceder al sistema/i }));

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('el botón "Iniciar Sesión" del CTA final navega a /login', async () => {
    const user = userEvent.setup();
    renderLanding();

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
