import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('utils/cn', () => {
  it('une clases simples con espacios', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('ignora valores falsy', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('resuelve conflictos de Tailwind quedándose con la última clase', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('soporta objetos condicionales', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });
});
