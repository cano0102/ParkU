import { describe, it, expect } from 'vitest';
import type { Vehiculo } from '@/services/api/vehiculos';
import type { ControlSalida } from '@/services/api/controlSalida';
import type { Reserva } from '@/services/api/reservas';
import {
  vehiculoEstaParqueado, reservaActivaDe, vehiculoNoDisponible, otroVehiculoDelConductorEnUso,
  esDeConductor, vehiculosDeConductor,
} from './ocupacion';

/**
 * Las reglas que impiden reservar dos veces lo mismo. Se comprueban aquí, sobre las funciones
 * puras, porque son las que comparten los tres formularios (ingreso, reserva directa y
 * solicitud de reserva): si cambian sin querer, se rompe en los tres a la vez.
 */

const vehiculo = (id: string, placa: string, conductorId = 'c1'): Vehiculo => ({
  id, placa, tipo: 'carro', marca: 'Renault', linea: '', modelo: '2020', color: 'Blanco',
  descripcion: '', estado: 'activo', conductorId, conductorNombre: 'Ana', copropietarios: [],
} as unknown as Vehiculo);

const parqueado = (vehiculoId: string): ControlSalida => ({
  id: `cs-${vehiculoId}`, vehiculoId, estado: 'en_parqueadero',
} as unknown as ControlSalida);

const reserva = (vehiculoId: string, estado: Reserva['estado']): Reserva => ({
  id: `r-${vehiculoId}-${estado}`, vehiculoId, estado, celdaId: '1',
} as unknown as Reserva);

describe('cuándo un vehículo no está disponible', () => {
  it('lo está si no tiene nada encima', () => {
    expect(vehiculoNoDisponible(vehiculo('1', 'ABC123'), [], [])).toBeNull();
  });

  it('no se puede reservar un vehículo que ya está estacionado', () => {
    const aviso = vehiculoNoDisponible(vehiculo('1', 'ABC123'), [parqueado('1')], []);
    expect(aviso?.motivo).toMatch(/ya está estacionado/);
  });

  it('no se puede reservar dos veces el mismo vehículo: con una activa, no va otra', () => {
    const aviso = vehiculoNoDisponible(vehiculo('1', 'ABC123'), [], [reserva('1', 'activa')]);
    expect(aviso?.motivo).toMatch(/ya tiene una reserva activa/);
  });

  it('tampoco con una solicitud pendiente', () => {
    const aviso = vehiculoNoDisponible(vehiculo('1', 'ABC123'), [], [reserva('1', 'pendiente')]);
    expect(aviso?.motivo).toMatch(/pendiente/);
  });

  it('una reserva ya cancelada o terminada no bloquea nada', () => {
    const historial = [reserva('1', 'cancelada'), reserva('1', 'completada'), reserva('1', 'rechazada')];
    expect(vehiculoNoDisponible(vehiculo('1', 'ABC123'), [], historial)).toBeNull();
    expect(reservaActivaDe('1', historial)).toBeUndefined();
  });

  it('lo de otro vehículo no le afecta', () => {
    expect(vehiculoEstaParqueado('1', [parqueado('2')])).toBe(false);
    expect(vehiculoNoDisponible(vehiculo('1', 'ABC123'), [parqueado('2')], [reserva('2', 'activa')])).toBeNull();
  });
});

describe('qué vehículos son de un conductor', () => {
  // Al vincular un vehículo existente a otro conductor, su `conductorId` NO cambia: el
  // vínculo queda en `copropietarios`. Filtrar solo por `conductorId` dejaba al
  // copropietario sin ver su propio vehículo en los selectores de reserva y de ingreso.
  const conCopropietario = {
    ...vehiculo('9', 'COP999', 'c1'),
    copropietarios: [
      { id: 'c1', nombre: 'Ana', esPrincipal: true },
      { id: 'c2', nombre: 'Beto', esPrincipal: false },
    ],
  };

  it('cuenta el vehículo del que es dueño principal', () => {
    expect(esDeConductor(conCopropietario, 'c1')).toBe(true);
  });

  it('y también el que copropieta, aunque el conductorId sea de otro', () => {
    expect(conCopropietario.conductorId).not.toBe('c2');
    expect(esDeConductor(conCopropietario, 'c2')).toBe(true);
  });

  it('no cuenta el de un tercero', () => {
    expect(esDeConductor(conCopropietario, 'c3')).toBe(false);
  });

  it('la lista incluye los propios y los copropietados', () => {
    const flota = [vehiculo('1', 'ABC123', 'c2'), conCopropietario, vehiculo('3', 'JKL321', 'c3')];
    expect(vehiculosDeConductor(flota, 'c2').map((v) => v.placa)).toEqual(['ABC123', 'COP999']);
  });

  it('sin conductor no hay lista que devolver', () => {
    expect(vehiculosDeConductor([vehiculo('1', 'ABC123')], null)).toEqual([]);
  });
});

describe('un conductor solo usa un vehículo suyo a la vez', () => {
  const flota = [vehiculo('1', 'ABC123'), vehiculo('2', 'XYZ789')];

  it('si el otro está estacionado, este no se puede reservar', () => {
    const aviso = otroVehiculoDelConductorEnUso('c1', '1', flota, [parqueado('2')], []);
    expect(aviso?.motivo).toMatch(/otro vehículo en uso \(XYZ789\)/);
  });

  it('si el otro tiene reserva activa, tampoco', () => {
    const aviso = otroVehiculoDelConductorEnUso('c1', '1', flota, [], [reserva('2', 'activa')]);
    expect(aviso?.motivo).toMatch(/XYZ789/);
  });

  it('lo que tenga el vehículo que se está usando no cuenta como "otro"', () => {
    expect(otroVehiculoDelConductorEnUso('c1', '1', flota, [parqueado('1')], [reserva('1', 'activa')])).toBeNull();
  });

  it('los vehículos de otro conductor no bloquean', () => {
    const ajeno = [vehiculo('1', 'ABC123'), vehiculo('3', 'JKL321', 'c2')];
    expect(otroVehiculoDelConductorEnUso('c1', '1', ajeno, [parqueado('3')], [])).toBeNull();
  });
});
