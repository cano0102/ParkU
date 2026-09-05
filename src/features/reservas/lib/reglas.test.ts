import { describe, it, expect } from 'vitest';
import {
  validarFranja, estaATiempoDeCancelar, horaMinimaDeInicio, horaMinimaDeFin, franjaSugerida,
  opcionesDeHoraInicio, opcionesDeHoraFin, ajustarFranja,
} from './reglas';

// Un "ahora" fijo para que las pruebas no dependan de la hora a la que se ejecuten.
const AHORA = new Date('2026-09-10T11:00:00');
const HOY = '2026-09-10';

describe('reglas de tiempo de una reserva', () => {
  describe('horaMinimaDeInicio', () => {
    it('para hoy, es media hora después de ahora', () => {
      expect(horaMinimaDeInicio(HOY, AHORA)).toBe('11:30');
    });

    it('redondea hacia arriba a los siguientes 5 minutos', () => {
      expect(horaMinimaDeInicio(HOY, new Date('2026-09-10T11:02:00'))).toBe('11:35');
    });

    it('para un día futuro no limita nada', () => {
      expect(horaMinimaDeInicio('2026-09-11', AHORA)).toBeUndefined();
    });
  });

  it('horaMinimaDeFin es una hora después del inicio', () => {
    expect(horaMinimaDeFin('12:00')).toBe('13:00');
  });

  it('la franja sugerida ya cumple las reglas', () => {
    const sugerida = franjaSugerida(AHORA);
    expect(sugerida).toEqual({ fechaReserva: HOY, horaInicio: '11:30', horaFin: '12:30' });
    expect(validarFranja(sugerida, AHORA)).toBeNull();
  });

  describe('validarFranja', () => {
    it('acepta el caso del ejemplo: a las 11:00 se puede reservar de 12:00 a 13:00', () => {
      expect(validarFranja({ fechaReserva: HOY, horaInicio: '12:00', horaFin: '13:00' }, AHORA)).toBeNull();
    });

    it('rechaza una hora que ya pasó', () => {
      const aviso = validarFranja({ fechaReserva: HOY, horaInicio: '10:00', horaFin: '12:00' }, AHORA);
      expect(aviso).toMatch(/ya pasó/);
    });

    it('rechaza reservar con menos de media hora de anticipación', () => {
      // A las 11:00, una reserva que empieza a las 11:20 llega tarde por 10 minutos.
      const aviso = validarFranja({ fechaReserva: HOY, horaInicio: '11:20', horaFin: '13:00' }, AHORA);
      expect(aviso).toMatch(/30 minutos de anticipación/);
      expect(aviso).toContain('11:30');
    });

    it('acepta justo en el límite de la anticipación', () => {
      expect(validarFranja({ fechaReserva: HOY, horaInicio: '11:30', horaFin: '12:30' }, AHORA)).toBeNull();
    });

    it('rechaza una reserva de menos de una hora', () => {
      const aviso = validarFranja({ fechaReserva: HOY, horaInicio: '12:00', horaFin: '12:30' }, AHORA);
      expect(aviso).toMatch(/al menos 1 hora/);
      expect(aviso).toContain('13:00');
    });

    it('rechaza que la hora de fin sea anterior a la de inicio', () => {
      const aviso = validarFranja({ fechaReserva: HOY, horaInicio: '13:00', horaFin: '12:00' }, AHORA);
      expect(aviso).toMatch(/posterior/);
    });

    it('no limita la anticipación de un día futuro', () => {
      expect(validarFranja({ fechaReserva: '2026-09-11', horaInicio: '06:00', horaFin: '08:00' }, AHORA)).toBeNull();
    });
  });

  describe('horas que se pueden elegir', () => {
    const VENTANA = { desde: '05:00', hasta: '21:00' };

    it('para hoy empieza en la primera hora con la anticipación mínima', () => {
      const horas = opcionesDeHoraInicio(HOY, VENTANA, AHORA);
      expect(horas[0]).toBe('11:30');
      expect(horas).not.toContain('11:00');
      expect(horas).not.toContain('11:15');
    });

    it('para un día futuro empieza cuando abre el parqueadero', () => {
      expect(opcionesDeHoraInicio('2026-09-11', VENTANA, AHORA)[0]).toBe('05:00');
    });

    it('la última hora de inicio deja sitio a la duración mínima antes del cierre', () => {
      const horas = opcionesDeHoraInicio('2026-09-11', VENTANA, AHORA);
      expect(horas[horas.length - 1]).toBe('20:00');
    });

    it('las horas de fin empiezan una hora después del inicio y llegan hasta el cierre', () => {
      const horas = opcionesDeHoraFin('12:00', VENTANA);
      expect(horas[0]).toBe('13:00');
      expect(horas[horas.length - 1]).toBe('21:00');
      expect(horas).not.toContain('12:30');
    });

    it('sin hora de inicio no hay horas de fin que ofrecer', () => {
      expect(opcionesDeHoraFin('', VENTANA)).toEqual([]);
    });

    describe('ajustarFranja', () => {
      it('deja la franja como está si ya se puede elegir', () => {
        const franja = { fechaReserva: HOY, horaInicio: '12:00', horaFin: '14:00' };
        expect(ajustarFranja(franja, VENTANA, AHORA)).toEqual(franja);
      });

      it('mueve a la primera hora posible lo que quedó en el pasado', () => {
        // Pasar la reserva de mañana a hoy deja las 06:00 fuera de lo elegible.
        const ajustada = ajustarFranja({ fechaReserva: HOY, horaInicio: '06:00', horaFin: '08:00' }, VENTANA, AHORA);
        expect(ajustada).toEqual({ fechaReserva: HOY, horaInicio: '11:30', horaFin: '12:30' });
      });

      it('empuja la hora de fin cuando deja de cumplir la duración mínima', () => {
        const ajustada = ajustarFranja({ fechaReserva: HOY, horaInicio: '15:00', horaFin: '15:30' }, VENTANA, AHORA);
        expect(ajustada.horaFin).toBe('16:00');
      });

      it('lo que devuelve siempre pasa la validación', () => {
        const ajustada = ajustarFranja({ fechaReserva: HOY, horaInicio: '06:00', horaFin: '06:10' }, VENTANA, AHORA);
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
