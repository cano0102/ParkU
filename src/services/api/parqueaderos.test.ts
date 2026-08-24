import { describe, it, expect } from 'vitest';
import * as parqueaderos from './parqueaderos';
import type { Parqueadero } from './parqueaderos';
import * as celdas from './celdas';
import { describeCrudContract } from '../../test/crudContract';

describe('services/parqueaderos', () => {
  it('trae los 7 parqueaderos semilla', async () => {
    const all = await parqueaderos.getAll();
    expect(all.length).toBe(7);
  });

  it('create genera en cascada las celdas del parqueadero (carros + motos + movilidad reducida)', async () => {
    const antesCeldas = await celdas.getAll();

    const creado = await parqueaderos.create({
      nombre: 'PQ Test Cascada',
      direccion: 'Calle de prueba',
      capacidad: 6,
      horaInicio: '06:00',
      horaFin: '20:00',
      celdasCarros: 3,
      celdasMotos: 2,
      celdasMovilidadReducida: 1,
      descripcion: 'Parqueadero creado en un test',
      estado: 'activo',
      tipo: 'docentes',
      bloque: 'Bloque Test',
    });

    const despuesCeldas = await celdas.getAll();
    const nuevasCeldas = despuesCeldas.filter((c) => c.parqueaderoId === creado.id);

    expect(despuesCeldas.length).toBe(antesCeldas.length + 6);
    expect(nuevasCeldas.filter((c) => c.tipo === 'carro').length).toBe(3);
    expect(nuevasCeldas.filter((c) => c.tipo === 'moto').length).toBe(2);
    expect(nuevasCeldas.filter((c) => c.tipo === 'movilidad reducida').length).toBe(1);
    expect(nuevasCeldas.every((c) => c.estado === 'disponible' && !c.ocupada)).toBe(true);
  });

  it('remove elimina en cascada todas las celdas del parqueadero', async () => {
    const creado = await parqueaderos.create({
      nombre: 'PQ Test Borrado',
      direccion: 'Calle de prueba',
      capacidad: 2,
      horaInicio: '06:00',
      horaFin: '20:00',
      celdasCarros: 2,
      celdasMotos: 0,
      celdasMovilidadReducida: 0,
      descripcion: 'Parqueadero creado en un test',
      estado: 'activo',
      tipo: 'docentes',
      bloque: 'Bloque Test',
    });

    expect((await celdas.getAll()).some((c) => c.parqueaderoId === creado.id)).toBe(true);

    await parqueaderos.remove(creado.id);

    expect(await parqueaderos.getById(creado.id)).toBeUndefined();
    expect((await celdas.getAll()).some((c) => c.parqueaderoId === creado.id)).toBe(false);
  });
});

describeCrudContract<Parqueadero>(
  'parqueaderos',
  parqueaderos,
  () => ({
    nombre: 'PQ Contrato CRUD',
    direccion: 'Calle de prueba',
    capacidad: 0,
    horaInicio: '06:00',
    horaFin: '20:00',
    celdasCarros: 0,
    celdasMotos: 0,
    celdasMovilidadReducida: 0,
    descripcion: 'Parqueadero de prueba',
    estado: 'activo',
    tipo: 'docentes',
    bloque: 'Bloque Test',
  }),
  () => ({ estado: 'inactivo' }),
);
