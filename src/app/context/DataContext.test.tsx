import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { DataProvider, useData } from './DataContext';

const wrapper = ({ children }: { children: React.ReactNode }) => <DataProvider>{children}</DataProvider>;

describe('DataContext - CRUD de usuarios', () => {
  it('parte de los usuarios de demo precargados', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    expect(result.current.usuarios.length).toBeGreaterThan(0);
  });

  it('agrega un usuario nuevo y le asigna id', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const countBefore = result.current.usuarios.length;

    let newId = '';
    act(() => {
      newId = result.current.addUsuario({
        correo: 'test@sena.edu.co',
        password: 'Pass1234',
        nombre: 'Usuario de Prueba',
        numero: '3000000000',
        rol: '2',
        tipoDocumento: 'CC',
        identificacion: '999999999',
        estado: 'activo',
      });
    });

    expect(newId).toBeTruthy();
    expect(result.current.usuarios.length).toBe(countBefore + 1);
    expect(result.current.usuarios.find((u) => u.id === newId)?.correo).toBe('test@sena.edu.co');
  });

  it('actualiza un usuario existente', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const target = result.current.usuarios[0];

    act(() => {
      result.current.updateUsuario(target.id, { estado: 'inactivo' });
    });

    expect(result.current.usuarios.find((u) => u.id === target.id)?.estado).toBe('inactivo');
  });

  it('elimina un usuario', () => {
    const { result } = renderHook(() => useData(), { wrapper });
    const countBefore = result.current.usuarios.length;
    const target = result.current.usuarios[0];

    act(() => {
      result.current.deleteUsuario(target.id);
    });

    expect(result.current.usuarios.length).toBe(countBefore - 1);
    expect(result.current.usuarios.find((u) => u.id === target.id)).toBeUndefined();
  });
});

describe('DataContext - celdas deterministas', () => {
  it('genera siempre la misma distribución de estados entre montajes', () => {
    const { result: first } = renderHook(() => useData(), { wrapper });
    const { result: second } = renderHook(() => useData(), { wrapper });

    const estadosFirst = first.current.celdas.map((c) => c.estado);
    const estadosSecond = second.current.celdas.map((c) => c.estado);

    expect(estadosFirst).toEqual(estadosSecond);
  });
});
