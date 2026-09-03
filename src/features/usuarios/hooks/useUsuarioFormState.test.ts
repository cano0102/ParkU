import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import type { Usuario } from '@/services/api/usuarios';
import { ROLES } from '@/services/core/roles';
import { useUsuarioFormState } from './useUsuarioFormState';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

afterEach(() => vi.clearAllMocks());

/** El hook también recibe el acceso al conductor vinculado (documento de la cuenta); estos
 *  tests no lo ejercitan, así que se pasan stubs neutros. */
const documentoStubs = () => ({ conductorDeUsuario: () => null, guardarDocumentoDeUsuario: vi.fn() });

const baseUsuario = (over: Partial<Usuario>): Usuario => ({
  id: '1', correo: 'x@sena.edu.co', password: '', nombre: 'X', numero: '', rol: ROLES.CONDUCTOR, estado: 'activo', ...over,
});

const formConductor = {
  correo: 'nuevo@sena.edu.co', password: 'Pass1234', nombre: 'Nuevo Conductor', numero: '3101234567',
  rol: String(ROLES.CONDUCTOR), estado: 'activo' as const,
  tipoDocumento: 'CC', numeroDocumento: '1001234567', tipoUsuarioId: '1',
};

describe('useUsuarioFormState — documento de la cuenta', () => {
  it('guarda el documento en el conductor vinculado al crear una cuenta de Comunidad SENA', async () => {
    const addUsuario = vi.fn().mockResolvedValue(baseUsuario({ id: '77', correo: formConductor.correo }));
    const guardarDocumentoDeUsuario = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useUsuarioFormState({
        usuarios: [], addUsuario, updateUsuario: vi.fn(),
        conductorDeUsuario: () => null, guardarDocumentoDeUsuario,
      })
    );

    await act(async () => result.current.handleSave(formConductor));

    expect(addUsuario).toHaveBeenCalled();
    expect(guardarDocumentoDeUsuario).toHaveBeenCalledWith('77', {
      tipoDocumento: 'CC',
      numeroDocumento: '1001234567',
      tipoUsuarioId: '1',
      nombre: 'Nuevo Conductor',
      correo: 'nuevo@sena.edu.co',
      numeroTelefonico: '3101234567',
    });
  });

  it('no crea ningún conductor cuando la cuenta es de otro rol', async () => {
    const addUsuario = vi.fn().mockResolvedValue(baseUsuario({ id: '78' }));
    const guardarDocumentoDeUsuario = vi.fn();
    const { result } = renderHook(() =>
      useUsuarioFormState({
        usuarios: [], addUsuario, updateUsuario: vi.fn(),
        conductorDeUsuario: () => null, guardarDocumentoDeUsuario,
      })
    );

    await act(async () =>
      result.current.handleSave({ ...formConductor, rol: String(ROLES.VIGILANTE), numeroDocumento: '' })
    );

    expect(addUsuario).toHaveBeenCalled();
    expect(guardarDocumentoDeUsuario).not.toHaveBeenCalled();
  });
});

describe('useUsuarioFormState — protección dinámica del único Admin activo', () => {
  it('bloquea desactivar a un Admin cuyo correo NO está en la lista fija, si es el único Admin activo', async () => {
    // A diferencia de USUARIOS_PROTEGIDOS (lista fija de correos), esta regla se recalcula en
    // vivo: cualquier Admin puede quedar protegido según cómo estén los demás en este momento.
    const unicoAdmin = baseUsuario({ id: '9', correo: 'nuevo.admin@empresa.com', rol: ROLES.ADMIN, estado: 'activo' });
    const usuarios = [unicoAdmin, baseUsuario({ id: '2', correo: 'v@sena.edu.co', rol: ROLES.VIGILANTE })];
    const updateUsuario = vi.fn().mockResolvedValue(unicoAdmin);
    const { result } = renderHook(() => useUsuarioFormState({ usuarios, addUsuario: vi.fn(), updateUsuario, ...documentoStubs() }));

    await act(async () => result.current.handleToggleEstado(unicoAdmin));

    expect(updateUsuario).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('único administrador activo'));
  });

  it('permite desactivar a un Admin si hay otro Admin activo', async () => {
    const admin1 = baseUsuario({ id: '9', correo: 'admin1@empresa.com', rol: ROLES.ADMIN, estado: 'activo' });
    const admin2 = baseUsuario({ id: '10', correo: 'admin2@empresa.com', rol: ROLES.ADMIN, estado: 'activo' });
    const updateUsuario = vi.fn().mockResolvedValue(admin1);
    const { result } = renderHook(() => useUsuarioFormState({ usuarios: [admin1, admin2], addUsuario: vi.fn(), updateUsuario, ...documentoStubs() }));

    await act(async () => result.current.handleToggleEstado(admin1));

    expect(updateUsuario).toHaveBeenCalledWith('9', { estado: 'inactivo' });
  });

  it('no bloquea activar a un Admin ya inactivo, aunque sea el único Admin del sistema', async () => {
    const adminInactivo = baseUsuario({ id: '9', correo: 'admin@empresa.com', rol: ROLES.ADMIN, estado: 'inactivo' });
    const updateUsuario = vi.fn().mockResolvedValue(adminInactivo);
    const { result } = renderHook(() => useUsuarioFormState({ usuarios: [adminInactivo], addUsuario: vi.fn(), updateUsuario, ...documentoStubs() }));

    await act(async () => result.current.handleToggleEstado(adminInactivo));

    expect(updateUsuario).toHaveBeenCalledWith('9', { estado: 'activo' });
  });

  it('no aplica la protección de Admin a otros roles (Vigilante/Conductor) aunque sea el único activo', async () => {
    const vigilanteUnico = baseUsuario({ id: '2', correo: 'v@sena.edu.co', rol: ROLES.VIGILANTE, estado: 'activo' });
    const updateUsuario = vi.fn().mockResolvedValue(vigilanteUnico);
    const { result } = renderHook(() => useUsuarioFormState({ usuarios: [vigilanteUnico], addUsuario: vi.fn(), updateUsuario, ...documentoStubs() }));

    await act(async () => result.current.handleToggleEstado(vigilanteUnico));

    expect(updateUsuario).toHaveBeenCalledWith('2', { estado: 'inactivo' });
  });
});
