import { describe, it, expect } from 'vitest';
import type { Celda } from '@/services/api/celdas';
import { estaFueraDeHorarioOperacion, HORA_OPERACION_INICIO, HORA_OPERACION_FIN, evaluarEliminacionParqueadero, superaEstadiaLimite, ESTADIA_ALERTA_HORAS } from './helpers';

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
