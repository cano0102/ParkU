import { describe, it, expect } from 'vitest';
import { sanitizeText, getInitials, getAvatarGradient } from './format';

describe('utils/format', () => {
  describe('sanitizeText', () => {
    it('escapa etiquetas HTML', () => {
      expect(sanitizeText('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('deja intacto el texto plano', () => {
      expect(sanitizeText('Carlos López')).toBe('Carlos López');
    });

    it('escapa comillas y ampersands', () => {
      expect(sanitizeText('Tom & Jerry "amigos"')).toBe('Tom &amp; Jerry "amigos"');
    });
  });

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
