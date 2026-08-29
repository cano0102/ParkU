import { describe, it, expect } from 'vitest';
import { estaFueraDeHorarioOperacion, HORA_OPERACION_INICIO, HORA_OPERACION_FIN } from './helpers';

describe('estaFueraDeHorarioOperacion', () => {
  it(`es false a mitad del horario permitido (dentro de ${HORA_OPERACION_INICIO}–${HORA_OPERACION_FIN})`, () => {
    expect(estaFueraDeHorarioOperacion(new Date(2026, 0, 1, 12, 0))).toBe(false);
  });

  it('es false justo en el límite de apertura (04:00)', () => {
    expect(estaFueraDeHorarioOperacion(new Date(2026, 0, 1, 4, 0))).toBe(false);
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
