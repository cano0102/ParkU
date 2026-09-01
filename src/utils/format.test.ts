import { describe, it, expect } from 'vitest';
import { getInitials, getAvatarGradient } from './format';

describe('utils/format', () => {
  describe('getInitials', () => {
    it('toma la primera letra de las dos primeras palabras', () => {
      expect(getInitials('Carlos López Martínez')).toBe('CL');
    });

    it('funciona con un solo nombre', () => {
      expect(getInitials('Ana')).toBe('A');
    });

    it('devuelve mayúsculas', () => {
      expect(getInitials('ana maria')).toBe('AM');
    });
  });

  describe('getAvatarGradient', () => {
    it('devuelve siempre un par de colores hex', () => {
      const [from, to] = getAvatarGradient('Carlos');
      expect(from).toMatch(/^#[0-9A-F]{6}$/i);
      expect(to).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('es determinista para la misma cadena', () => {
      expect(getAvatarGradient('Ana')).toEqual(getAvatarGradient('Ana'));
    });

    it('no lanza con cadena vacía', () => {
      expect(() => getAvatarGradient('')).not.toThrow();
    });
  });
});
