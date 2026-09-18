import { describe, it, expect, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useEnCurso } from './useEnCurso';

describe('useEnCurso', () => {
  it('bloquea un segundo clic mientras la acción anterior sigue en curso, y libera al terminar', async () => {
    let terminar!: () => void;
    const accion = vi.fn(() => new Promise<void>((resolve) => { terminar = resolve; }));
    const { result } = renderHook(() => useEnCurso(accion));

    expect(result.current[1]).toBe(false);
    act(() => { void result.current[0](); });
    act(() => { void result.current[0](); });
    act(() => { void result.current[0](); });

    expect(accion).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current[1]).toBe(true));

    await act(async () => { terminar(); });
    await waitFor(() => expect(result.current[1]).toBe(false));

    // Terminada la primera, se puede volver a ejecutar.
    act(() => { void result.current[0](); });
    expect(accion).toHaveBeenCalledTimes(2);
  });

  it('una acción que falla también libera el botón (el aviso lo da quien la llama)', async () => {
    const accion = vi.fn(() => Promise.reject(new Error('rechazada por el backend')));
    const { result } = renderHook(() => useEnCurso(accion));

    await act(async () => { await result.current[0](); });

    expect(result.current[1]).toBe(false);
    act(() => { void result.current[0](); });
    expect(accion).toHaveBeenCalledTimes(2);
  });

  it('una acción síncrona (cerrar el diálogo y ya) no deja nada en curso', () => {
    const accion = vi.fn();
    const { result } = renderHook(() => useEnCurso(accion));

    act(() => { void result.current[0](); });
    act(() => { void result.current[0](); });

    expect(accion).toHaveBeenCalledTimes(2);
    expect(result.current[1]).toBe(false);
  });

  it('pasa los argumentos a la acción (el motivo del rechazo, por ejemplo)', () => {
    const accion = vi.fn((motivo: string) => { void motivo; });
    const { result } = renderHook(() => useEnCurso(accion));

    act(() => { void result.current[0]('sin cupo'); });

    expect(accion).toHaveBeenCalledWith('sin cupo');
  });
});
