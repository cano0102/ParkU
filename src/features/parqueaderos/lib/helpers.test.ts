import { describe, it, expect } from 'vitest';
import type { Celda } from '@/services/api/celdas';
import { estaFueraDeHorarioOperacion, HORA_OPERACION_INICIO, HORA_OPERACION_FIN, evaluarEliminacionParqueadero, superaEstadiaLimite, ESTADIA_ALERTA_HORAS, validarFormParqueadero, type FormParqueadero } from './helpers';

function celda(overrides: Partial<Celda>): Celda {
  return {
    id: 'id', parqueaderoId: '1', numero: 'C-001', tipo: 'carro', usabilidad: 'general',
    estado: 'disponible', ocupada: false, observaciones: '',
    ...overrides,
  };
}

describe('estaFueraDeHorarioOperacion', () => {
  it(`es false a mitad del horario permitido (dentro de ${HORA_OPERACION_INICIO}–${HORA_OPERACION_FIN})`, () => {
    expect(estaFueraDeHorarioOperacion(new Date(2026, 0, 1, 12, 0))).toBe(false);
  });

  it('es false justo en el límite de apertura (05:00)', () => {
    expect(estaFueraDeHorarioOperacion(new Date(2026, 0, 1, 5, 0))).toBe(false);
  });

  it('es true un minuto antes de que abra (04:59)', () => {
    expect(estaFueraDeHorarioOperacion(new Date(2026, 0, 1, 4, 59))).toBe(true);
  });

  it('es false justo en el límite de cierre (21:00)', () => {
    expect(estaFueraDeHorarioOperacion(new Date(2026, 0, 1, 21, 0))).toBe(false);
  });

  it('es true antes de que abra (madrugada, ej. 02:00)', () => {
    expect(estaFueraDeHorarioOperacion(new Date(2026, 0, 1, 2, 0))).toBe(true);
  });

  it('es true después de que cierre (noche, ej. 23:30)', () => {
    expect(estaFueraDeHorarioOperacion(new Date(2026, 0, 1, 23, 30))).toBe(true);
  });

  it('es true un minuto después del cierre (21:01)', () => {
    expect(estaFueraDeHorarioOperacion(new Date(2026, 0, 1, 21, 1))).toBe(true);
  });
});

describe('evaluarEliminacionParqueadero', () => {
  it('es eliminable cuando no tiene ninguna celda ni relación (p. ej. creación cuya generación de celdas falló)', () => {
    const r = evaluarEliminacionParqueadero('1', [], [], [], []);
    expect(r).toEqual({ eliminable: true });
  });

  it('no es eliminable si tiene celdas propias, aunque no tengan uso alguno', () => {
    const r = evaluarEliminacionParqueadero('1', [celda({ id: 'c1', parqueaderoId: '1' })], [], [], []);
    expect(r.eliminable).toBe(false);
    expect(r.motivo).toContain('1 celda(s)');
  });

  it('no es eliminable si tiene registros de ingreso/salida, aunque ya no tenga celdas activas', () => {
    const r = evaluarEliminacionParqueadero('1', [], [{ parqueaderoId: '1' }, { parqueaderoId: '1' }], [], []);
    expect(r.eliminable).toBe(false);
    expect(r.motivo).toContain('2 registro(s) de ingreso/salida');
  });

  it('no es eliminable si tiene una reserva sobre alguna de sus celdas', () => {
    const celdas = [celda({ id: 'c1', parqueaderoId: '1' })];
    const r = evaluarEliminacionParqueadero('1', celdas, [], [{ celdaId: 'c1' }], []);
    expect(r.eliminable).toBe(false);
    expect(r.motivo).toContain('1 celda(s)');
    expect(r.motivo).toContain('1 reserva(s)');
  });

  it('no es eliminable si tiene incidentes reportados', () => {
    const r = evaluarEliminacionParqueadero('1', [], [], [], [{ parqueaderoId: '1' }]);
    expect(r.eliminable).toBe(false);
    expect(r.motivo).toContain('1 incidente(s)');
  });

  it('ignora relaciones de OTROS parqueaderos al decidir', () => {
    const celdas = [celda({ id: 'c1', parqueaderoId: '2' })];
    const r = evaluarEliminacionParqueadero('1', celdas, [{ parqueaderoId: '2' }], [], [{ parqueaderoId: '2' }]);
    expect(r).toEqual({ eliminable: true });
  });

  it('el motivo sugiere desactivar en vez de eliminar', () => {
    const r = evaluarEliminacionParqueadero('1', [celda({ id: 'c1', parqueaderoId: '1' })], [], [], []);
    expect(r.motivo).toMatch(/desact/i);
  });
});

describe('superaEstadiaLimite', () => {
  const horasAtras = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

  it(`es false justo por debajo del umbral (${ESTADIA_ALERTA_HORAS - 0.1}h)`, () => {
    expect(superaEstadiaLimite(horasAtras(ESTADIA_ALERTA_HORAS - 0.1), false)).toBe(false);
  });

  it(`es true justo por encima del umbral (${ESTADIA_ALERTA_HORAS + 0.1}h)`, () => {
    expect(superaEstadiaLimite(horasAtras(ESTADIA_ALERTA_HORAS + 0.1), false)).toBe(true);
  });

  it('nunca es true para un ingreso marcado "Oficial SENA", sin importar cuánto tiempo lleve', () => {
    expect(superaEstadiaLimite(horasAtras(48), true)).toBe(false);
  });

  it('es false para una estadía corta (2h)', () => {
    expect(superaEstadiaLimite(horasAtras(2), false)).toBe(false);
  });
});

/* ============================================================
   validarFormParqueadero — capacidad máxima vs. celdas configuradas
============================================================ */
function form(overrides: Partial<FormParqueadero> = {}): FormParqueadero {
  return {
    nombre: 'PQ Nuevo', ubicacion: 'Bloque A', acceso: 'regional', tipo: 'general',
    capacidadMaxima: 10, horaInicio: '06:00', horaFin: '22:00', zona: '', piso: '', descripcion: '',
    estado: 'activo', celdasCarros: 2, celdasMotos: 1, celdasMovilidadReducida: 0,
    ...overrides,
  };
}

describe('validarFormParqueadero — capacidad máxima', () => {
  it('exige capacidad mayor a cero al crear', () => {
    expect(validarFormParqueadero(form({ capacidadMaxima: 0 }), [], null)).toMatch(/mayor a cero/);
  });

  it('acepta una configuración cuyas celdas caben en la capacidad', () => {
    expect(validarFormParqueadero(form({ capacidadMaxima: 10, celdasCarros: 5, celdasMotos: 5 }), [], null)).toBeNull();
  });

  it('rechaza al crear si las celdas indicadas superan la capacidad máxima', () => {
    const error = validarFormParqueadero(form({ capacidadMaxima: 5, celdasCarros: 4, celdasMotos: 4 }), [], null);
    expect(error).toMatch(/superan la capacidad máxima/);
  });

  it('al editar, no deja bajar la capacidad por debajo de las celdas que ya existen', () => {
    // En edición los campos de celdas vienen precargados con la cantidad ACTIVA real, así que
    // bajar la capacidad por debajo de esa suma es justo el caso "capacidad < celdas existentes".
    const error = validarFormParqueadero(form({ capacidadMaxima: 4, celdasCarros: 6, celdasMotos: 0 }), [], '1');
    expect(error).toMatch(/la capacidad máxima no puede ser menor/);
  });

  it('al editar, permite subir la capacidad dejando las celdas como están', () => {
    expect(validarFormParqueadero(form({ capacidadMaxima: 80, celdasCarros: 30, celdasMotos: 20 }), [], '1')).toBeNull();
  });
});
