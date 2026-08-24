import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { createTestQueryClient, withQueryClient } from '@/test/queryWrapper';
import { ProtectedRoute } from './ProtectedRoute';

function renderProtected(permission?: 'roles' | 'usuarios' | 'dashboard', initialPath = '/app/protegido') {
  const client = createTestQueryClient();
  const Wrapper = withQueryClient(client);
  return render(
    <Wrapper>
      <MemoryRouter initialEntries={[initialPath]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<p>Pantalla de login</p>} />
            <Route
              path="/app/protegido"
              element={
                <ProtectedRoute permission={permission}>
                  <p>Contenido protegido</p>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </Wrapper>
  );
}

describe('routes/ProtectedRoute', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('redirige a /login cuando no hay sesión iniciada', () => {
    renderProtected();
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('renderiza el contenido cuando hay sesión y no se exige un permiso concreto', () => {
    localStorage.setItem('parkUUser', JSON.stringify({
      id: '4', correo: 'maria.diaz@ext.com', nombre: 'María Díaz P.', numero: '3104567890', rol: 'Comunidad SENA',
    }));
    renderProtected();
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('renderiza el contenido cuando el rol del usuario sí tiene el permiso exigido', async () => {
    localStorage.setItem('parkUUser', JSON.stringify({
      id: '1', correo: 'admin@sena.edu.co', nombre: 'Administrador ParkU', numero: '3101234567', rol: 'Administrador',
    }));
    renderProtected('roles');
    // hasPermission depende de useRoles() (React Query, asíncrono) — el primer
    // render puede mostrar "Acceso denegado" mientras los roles cargan.
    expect(await screen.findByText('Contenido protegido')).toBeInTheDocument();
  });

  it('muestra "Acceso denegado" cuando el rol del usuario no tiene el permiso exigido', async () => {
    localStorage.setItem('parkUUser', JSON.stringify({
      id: '4', correo: 'maria.diaz@ext.com', nombre: 'María Díaz P.', numero: '3104567890', rol: 'Comunidad SENA',
    }));
    renderProtected('roles');
    expect(await screen.findByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.getByText('Volver al Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });
});
