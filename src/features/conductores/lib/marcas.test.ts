import { describe, it, expect } from 'vitest';
import { sugerirMarcas, marcasDe, MARCAS_CARRO, MARCAS_MOTO } from './marcas';
import { TIPOS_VEHICULO } from './helpers';

describe('marcas sugeridas', () => {
  it('a una moto no le ofrece marcas de carro', () => {
    const sugeridas = sugerirMarcas('moto', '');
    expect(sugeridas).not.toContain('Chevrolet');
    expect(marcasDe('moto')).toBe(MARCAS_MOTO);
    expect(marcasDe('carro')).toBe(MARCAS_CARRO);
  });

  it('filtra por lo que se lleva escrito', () => {
    expect(sugerirMarcas('carro', 'maz')).toContain('Mazda');
    expect(sugerirMarcas('carro', 'maz')).not.toContain('Toyota');
    expect(sugerirMarcas('moto', 'yam')).toEqual(['Yamaha']);
  });

  it('ignora tildes y mayúsculas', () => {
    // Quien escribe "citroen" en el teclado del celular debe encontrar "Citroën".
    expect(sugerirMarcas('carro', 'citroen')).toContain('Citroën');
    expect(sugerirMarcas('carro', 'CHEVRO')).toContain('Chevrolet');
  });

  it('pone primero las que EMPIEZAN por lo escrito', () => {
    // "Honda" empieza por "hon"; ninguna otra debería colarse antes.
    expect(sugerirMarcas('moto', 'hon')[0]).toBe('Honda');
  });

  it('con el campo vacío ofrece las primeras, sin desbordar la lista', () => {
    expect(sugerirMarcas('carro', '')).toHaveLength(8);
    expect(sugerirMarcas('carro', '', 3)).toHaveLength(3);
  });

  it('una marca que no está en la lista simplemente no sugiere nada', () => {
    // El campo es texto libre: la lista solo ayuda, no encierra.
    expect(sugerirMarcas('carro', 'Zzyzx')).toEqual([]);
  });

  it('solo se pueden registrar carros y motos', () => {
    expect([...TIPOS_VEHICULO]).toEqual(['carro', 'moto']);
  });
});
