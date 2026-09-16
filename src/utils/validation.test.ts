import { describe, it, expect } from 'vitest';
import {
  validarPlacaColombiana, validarPlacaCarro, validarPlacaMoto,
  validarPlacaPorTipo, tipoVehiculoDesdePlaca, esPlacaOficial,
  NOMBRE_MIN, NOMBRE_MAX, PASSWORD_MIN, PASSWORD_MAX,
  TELEFONO_REGEX, TELEFONO_MAX, filtrarTelefono, validarTelefono, EMAIL_REGEX, validarPassword } from './validation';

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
  it('expone los límites de nombre, contraseña y teléfono', () => {
    expect(NOMBRE_MIN).toBe(3);
    expect(NOMBRE_MAX).toBe(100);
    expect(PASSWORD_MIN).toBe(8);
    // Tope de la contraseña: es el que aplican como maxLength los formularios que la crean.
    expect(PASSWORD_MAX).toBe(16);
    // Un teléfono colombiano son 10 dígitos exactos.
    expect(TELEFONO_MAX).toBe(10);
  });

  describe('filtrarTelefono', () => {
    it('deja solo dígitos', () => {
      expect(filtrarTelefono('(300) 123-4567')).toBe('3001234567');
      expect(filtrarTelefono('300 abc 123')).toBe('300123');
    });

    it('no deja pasar de diez', () => {
      expect(filtrarTelefono('30012345678999')).toBe('3001234567');
      expect(filtrarTelefono('30012345678999')).toHaveLength(TELEFONO_MAX);
    });
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

  describe('validarPassword (mismos requisitos que la API)', () => {
    it('acepta una contraseña con longitud, mayúscula, minúscula y número', () => {
      expect(validarPassword('Pass1234')).toBeNull();
    });

    it('rechaza por longitud, por falta de mayúscula, de minúscula o de número', () => {
      expect(validarPassword('Ab1')).toBe('La contraseña debe tener al menos 8 caracteres');
      expect(validarPassword('clave123')).toBe('La contraseña debe tener al menos una mayúscula');
      expect(validarPassword('CLAVE123')).toBe('La contraseña debe tener al menos una minúscula');
      expect(validarPassword('ClaveSinNumero')).toBe('La contraseña debe tener al menos un número');
    });
  });

});

import {
  limpiarTexto, validarCorreo, validarNombrePersona, validarModeloVehiculo, validarTextoCorto, validarTextoLargo,
  CORREO_MAX, MARCA_MAX, MOTIVO_MIN, MOTIVO_MAX,
} from './validation';

describe('utils/validation — limpiarTexto', () => {
  it('quita espacios sobrantes, caracteres de control e invisibles', () => {
    expect(limpiarTexto('  Juan 	  Pérez​ ')).toBe('Juan Pérez');
  });
  it('recorta al máximo indicado', () => {
    expect(limpiarTexto('abcdefgh', 3)).toBe('abc');
  });
});

describe('utils/validation — validarCorreo', () => {
  it('acepta un correo válido y rechaza uno sin formato', () => {
    expect(validarCorreo('ana@sena.edu.co')).toBeNull();
    expect(validarCorreo('ana@')).not.toBeNull();
  });
  it('rechaza uno más largo que la columna', () => {
    expect(validarCorreo('a'.repeat(CORREO_MAX) + '@x.co')).toMatch(/superar/);
  });
  it('vacío solo es error cuando es obligatorio', () => {
    expect(validarCorreo('')).not.toBeNull();
    expect(validarCorreo('', false)).toBeNull();
  });
});

describe('utils/validation — validarNombrePersona', () => {
  it('acepta nombres con tildes, apóstrofos y guiones', () => {
    expect(validarNombrePersona("María José O'Neil-Pérez")).toBeNull();
  });
  it('rechaza vacío, muy corto, dígitos y símbolos', () => {
    expect(validarNombrePersona('')).toMatch(/obligatorio/);
    expect(validarNombrePersona('Al')).toMatch(/al menos/);
    expect(validarNombrePersona('Juan 123')).toMatch(/solo puede/);
    expect(validarNombrePersona('Juan <b>')).toMatch(/solo puede/);
  });
});

describe('utils/validation — vehículo', () => {
  it('el modelo es un año de 4 dígitos dentro del rango', () => {
    expect(validarModeloVehiculo('')).toBeNull();
    expect(validarModeloVehiculo('2020')).toBeNull();
    expect(validarModeloVehiculo('1900')).not.toBeNull();
    expect(validarModeloVehiculo('20')).not.toBeNull();
    expect(validarModeloVehiculo(String(new Date().getFullYear() + 2))).not.toBeNull();
  });
  it('texto corto: obligatoriedad, tope y caracteres', () => {
    expect(validarTextoCorto('Mercedes-Benz', 'La marca', MARCA_MAX, true)).toBeNull();
    expect(validarTextoCorto('', 'La marca', MARCA_MAX, true)).toBe('La marca es obligatoria');
    expect(validarTextoCorto('', 'La línea', MARCA_MAX, false)).toBeNull();
    expect(validarTextoCorto('x'.repeat(MARCA_MAX + 1), 'La marca', MARCA_MAX, true)).toMatch(/superar/);
    expect(validarTextoCorto('Rojo<script>', 'El color', MARCA_MAX, true)).toMatch(/no permitidos/);
  });
});

describe('utils/validation — validarTextoLargo', () => {
  it('exige un mínimo útil y respeta el tope', () => {
    const reglas = { min: MOTIVO_MIN, max: MOTIVO_MAX };
    expect(validarTextoLargo('Clase de 8 a 10', 'El motivo', reglas)).toBeNull();
    expect(validarTextoLargo('ok', 'El motivo', reglas)).toMatch(/al menos/);
    expect(validarTextoLargo('x'.repeat(MOTIVO_MAX + 1), 'El motivo', reglas)).toMatch(/superar/);
    expect(validarTextoLargo('', 'El motivo', reglas)).toMatch(/obligatorio/);
    expect(validarTextoLargo('', 'El motivo', { ...reglas, obligatorio: false })).toBeNull();
  });
});
