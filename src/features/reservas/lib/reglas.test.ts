import { describe, it, expect } from 'vitest';
import {
  validarFranja, estaATiempoDeCancelar, horaMinimaDeInicio, horaMinimaDeFin, franjaSugerida,
  rangoDeHoraInicio, rangoDeHoraFin, ajustarFranja,
} from './reglas';

// Un "ahora" fijo para que las pruebas no dependan de la hora a la que se ejecuten.
const AHORA = new Date('2026-09-10T11:00:00');
const HOY = '2026-09-10';
const MANANA = '2026-09-11';
const VENTANA = { desde: '05:00', hasta: '21:00' };

describe('reglas de tiempo de una reserva', () => {
  describe('horaMinimaDeInicio', () => {
    it('para hoy, es dos horas después de ahora', () => {
      // El caso del enunciado: si son las 8:00, lo más pronto que se puede reservar es 10:00.
      expect(horaMinimaDeInicio(HOY, new Date('2026-09-10T08:00:00'))).toBe('10:00');
      expect(horaMinimaDeInicio(HOY, AHORA)).toBe('13:00');
    });

    it('redondea hacia arriba a los siguientes 5 minutos', () => {
      expect(horaMinimaDeInicio(HOY, new Date('2026-09-10T11:02:00'))).toBe('13:05');
    });

    it('para un día futuro no limita nada', () => {
      expect(horaMinimaDeInicio(MANANA, AHORA)).toBeUndefined();
    });
  });

  it('horaMinimaDeFin es una hora después del inicio', () => {
    expect(horaMinimaDeFin('12:00')).toBe('13:00');
  });

  it('la franja sugerida ya cumple las reglas', () => {
    const sugerida = franjaSugerida(AHORA);
    expect(sugerida).toEqual({ fechaReserva: HOY, horaInicio: '13:00', horaFin: '14:00' });
    expect(validarFranja(sugerida, AHORA)).toBeNull();
  });

  describe('validarFranja', () => {
    it('acepta una franja con la anticipación y la duración justas', () => {
      expect(validarFranja({ fechaReserva: HOY, horaInicio: '13:00', horaFin: '14:00' }, AHORA)).toBeNull();
    });

    it('rechaza una hora que ya pasó', () => {
      expect(validarFranja({ fechaReserva: HOY, horaInicio: '10:00', horaFin: '12:00' }, AHORA)).toMatch(/ya pasó/);
    });

    it('rechaza reservar con menos de dos horas de anticipación', () => {
      const aviso = validarFranja({ fechaReserva: HOY, horaInicio: '12:00', horaFin: '14:00' }, AHORA);
      expect(aviso).toMatch(/2 horas de anticipación/);
      expect(aviso).toContain('13:00');
    });

    it('rechaza una reserva de menos de una hora', () => {
      const aviso = validarFranja({ fechaReserva: HOY, horaInicio: '15:00', horaFin: '15:30' }, AHORA);
      expect(aviso).toMatch(/al menos 1 hora/);
      expect(aviso).toContain('16:00');
    });

    it('rechaza que la hora de fin sea anterior a la de inicio', () => {
      expect(validarFranja({ fechaReserva: HOY, horaInicio: '16:00', horaFin: '15:00' }, AHORA)).toMatch(/posterior/);
    });

    it('rechaza empezar después de las 19:30, aunque quepa antes del cierre', () => {
      const aviso = validarFranja({ fechaReserva: MANANA, horaInicio: '19:45', horaFin: '21:00' }, AHORA);
      expect(aviso).toMatch(/no puede empezar después de las 19:30/);
    });

    it('pero sí acepta terminar a la hora de cierre', () => {
      expect(validarFranja({ fechaReserva: MANANA, horaInicio: '19:30', horaFin: '21:00' }, AHORA)).toBeNull();
    });

    it('no limita la anticipación de un día futuro', () => {
      expect(validarFranja({ fechaReserva: MANANA, horaInicio: '06:00', horaFin: '08:00' }, AHORA)).toBeNull();
    });
  });

  describe('rango que admite cada campo', () => {
    it('para hoy, la hora de inicio empieza con la anticipación mínima', () => {
      expect(rangoDeHoraInicio(HOY, VENTANA, AHORA).min).toBe('13:00');
    });

    it('para un día futuro empieza cuando abre el parqueadero', () => {
      expect(rangoDeHoraInicio(MANANA, VENTANA, AHORA).min).toBe('05:00');
    });

    it('la última hora de inicio es la hora máxima, no el cierre menos una hora', () => {
      expect(rangoDeHoraInicio(MANANA, VENTANA, AHORA).max).toBe('19:30');
    });

    it('la hora de fin va desde una hora después del inicio hasta el cierre', () => {
      expect(rangoDeHoraFin('12:00', VENTANA)).toEqual({ min: '13:00', max: '21:00' });
    });

    it('admite cualquier minuto, no solo cuartos de hora', () => {
      const franja = { fechaReserva: HOY, horaInicio: '14:07', horaFin: '15:23' };
      expect(ajustarFranja(franja, VENTANA, AHORA)).toEqual(franja);
      expect(validarFranja(franja, AHORA)).toBeNull();
    });

    describe('ajustarFranja', () => {
      it('deja la franja como está si ya se puede elegir', () => {
        const franja = { fechaReserva: HOY, horaInicio: '14:00', horaFin: '16:00' };
        expect(ajustarFranja(franja, VENTANA, AHORA)).toEqual(franja);
      });

      it('mueve a la primera hora posible lo que quedó en el pasado', () => {
        // Pasar la reserva de mañana a hoy deja las 06:00 fuera de lo elegible.
        const ajustada = ajustarFranja({ fechaReserva: HOY, horaInicio: '06:00', horaFin: '08:00' }, VENTANA, AHORA);
        expect(ajustada).toEqual({ fechaReserva: HOY, horaInicio: '13:00', horaFin: '14:00' });
      });

      it('empuja la hora de fin cuando deja de cumplir la duración mínima', () => {
        const ajustada = ajustarFranja({ fechaReserva: HOY, horaInicio: '15:00', horaFin: '15:30' }, VENTANA, AHORA);
        expect(ajustada.horaFin).toBe('16:00');
      });

      it('al mover el inicio, el fin lo sigue conservando la hora de margen', () => {
        // Este era el fallo: se cambiaba la hora de inicio y la de fin se quedaba donde
        // estaba, con menos de una hora entre las dos.
        const ajustada = ajustarFranja({ fechaReserva: MANANA, horaInicio: '18:45', horaFin: '13:00' }, VENTANA, AHORA);
        expect(ajustada).toEqual({ fechaReserva: MANANA, horaInicio: '18:45', horaFin: '19:45' });
      });

      it('no deja pasar de la hora máxima de inicio', () => {
        const ajustada = ajustarFranja({ fechaReserva: MANANA, horaInicio: '20:30', horaFin: '21:00' }, VENTANA, AHORA);
        expect(ajustada.horaInicio).toBe('19:30');
        expect(validarFranja(ajustada, AHORA)).toBeNull();
      });
    });
  });

  describe('estaATiempoDeCancelar', () => {
    it('sí, si falta más de media hora', () => {
      expect(estaATiempoDeCancelar({ fechaReserva: HOY, horaInicio: '12:00' }, AHORA)).toBe(true);
    });

    it('justo en el límite todavía cuenta', () => {
      expect(estaATiempoDeCancelar({ fechaReserva: HOY, horaInicio: '11:30' }, AHORA)).toBe(true);
    });

    it('no, si ya falta menos de media hora', () => {
      expect(estaATiempoDeCancelar({ fechaReserva: HOY, horaInicio: '11:20' }, AHORA)).toBe(false);
    });

    it('no, si la reserva ya empezó', () => {
      expect(estaATiempoDeCancelar({ fechaReserva: HOY, horaInicio: '10:00' }, AHORA)).toBe(false);
    });
  });
});
