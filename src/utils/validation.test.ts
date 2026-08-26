import { describe, it, expect } from 'vitest';
import {
  validarPlacaColombiana, validarPlacaCarro, validarPlacaMoto,
  validarPlacaPorTipo, tipoVehiculoDesdePlaca, esPlacaOficial,
  NOMBRE_MIN, NOMBRE_MAX, PASSWORD_MIN, PASSWORD_MAX,
  TELEFONO_REGEX, validarTelefono, EMAIL_REGEX,
} from './validation';

describe('utils/validation — placas', () => {
  it('valida placa de carro (3 letras + 3 números)', () => {
    expect(validarPlacaColombiana('ABC123')).toBe(true);
    expect(validarPlacaCarro('ABC123')).toBe(true);
  });

  it('valida placa de moto con letra final', () => {
    expect(validarPlacaColombiana('ABC12D')).toBe(true);
    expect(validarPlacaMoto('ABC12D')).toBe(true);
  });

  it('valida placa de moto antigua sin letra final (5 caracteres)', () => {
    expect(validarPlacaMoto('ABC12')).toBe(true);
    expect(validarPlacaColombiana('ABC12')).toBe(true);
  });

  it('rechaza formatos inválidos', () => {
    expect(validarPlacaColombiana('AB123')).toBe(false);
    expect(validarPlacaColombiana('12ABCD')).toBe(false);
    expect(validarPlacaColombiana('')).toBe(false);
  });

  it('normaliza minúsculas y espacios antes de validar', () => {
    expect(validarPlacaColombiana(' abc123 ')).toBe(true);
  });

  describe('tipoVehiculoDesdePlaca', () => {
    it('detecta carro', () => {
      expect(tipoVehiculoDesdePlaca('ABC123')).toBe('carro');
    });
    it('detecta moto', () => {
      expect(tipoVehiculoDesdePlaca('ABC12D')).toBe('moto');
      expect(tipoVehiculoDesdePlaca('ABC12')).toBe('moto');
    });
    it('devuelve null si no coincide con ningún formato', () => {
      expect(tipoVehiculoDesdePlaca('XYZ')).toBeNull();
    });
  });

  describe('validarPlacaPorTipo', () => {
    it('exige formato de carro para celdas de carro', () => {
      expect(validarPlacaPorTipo('ABC123', 'carro')).toBe(true);
      expect(validarPlacaPorTipo('ABC12D', 'carro')).toBe(false);
    });
    it('exige formato de moto para celdas de moto', () => {
      expect(validarPlacaPorTipo('ABC12D', 'moto')).toBe(true);
      expect(validarPlacaPorTipo('ABC123', 'moto')).toBe(false);
    });
    it('acepta ambos formatos en movilidad reducida', () => {
      expect(validarPlacaPorTipo('ABC123', 'movilidad reducida')).toBe(true);
      expect(validarPlacaPorTipo('ABC12D', 'movilidad reducida')).toBe(true);
    });
  });

  describe('esPlacaOficial', () => {
    it('reconoce prefijos SNA y OFI', () => {
      expect(esPlacaOficial('SNA012')).toBe(true);
      expect(esPlacaOficial('OFI345')).toBe(true);
    });
    it('rechaza otras placas', () => {
      expect(esPlacaOficial('ABC123')).toBe(false);
    });
  });
});

describe('utils/validation — campos de usuario', () => {
  it('expone los límites de nombre y contraseña', () => {
    expect(NOMBRE_MIN).toBe(3);
    expect(NOMBRE_MAX).toBe(100);
    expect(PASSWORD_MIN).toBe(8);
    expect(PASSWORD_MAX).toBe(64);
  });

  describe('TELEFONO_REGEX', () => {
    it('acepta números de 7 a 15 dígitos con separadores comunes', () => {
      expect(TELEFONO_REGEX.test('3001234567')).toBe(true);
      expect(TELEFONO_REGEX.test('(300) 123-4567')).toBe(true);
    });
    it('rechaza teléfonos demasiado cortos', () => {
      expect(TELEFONO_REGEX.test('123')).toBe(false);
    });
  });

  describe('validarTelefono', () => {
    it('acepta un celular colombiano de 10 dígitos, con o sin separadores', () => {
      expect(validarTelefono('3001234567')).toBe(true);
      expect(validarTelefono('(300) 123-4567')).toBe(true);
    });
    it('rechaza un relleno de dígitos repetidos que no es un teléfono real', () => {
      expect(validarTelefono('0000000000')).toBe(false);
    });
    it('rechaza menos o más de 10 dígitos', () => {
      expect(validarTelefono('300123456')).toBe(false);
      expect(validarTelefono('30012345678')).toBe(false);
    });
    it('rechaza un número que empiece en 0', () => {
      expect(validarTelefono('0123456789')).toBe(false);
    });
  });

  describe('EMAIL_REGEX', () => {
    it('acepta correos válidos', () => {
      expect(EMAIL_REGEX.test('admin@sena.edu.co')).toBe(true);
    });
    it('rechaza correos sin dominio', () => {
      expect(EMAIL_REGEX.test('admin@')).toBe(false);
      expect(EMAIL_REGEX.test('admin')).toBe(false);
    });
  });
});
