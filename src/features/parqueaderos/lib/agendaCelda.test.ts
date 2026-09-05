import { describe, it, expect } from "vitest";
import type { Reserva } from "@/services/api/reservas";
import {
  agendaDeCelda, puedeEstacionarEn, avisoDeCelda,
  MARGEN_SALIDA_ANTES_MINUTOS,
} from "./agendaCelda";

const AHORA = new Date("2026-03-10T10:00:00");
const HOY = "2026-03-10";

const reserva = (over: Partial<Reserva> & Pick<Reserva, "id" | "horaInicio" | "horaFin">): Reserva => ({
  tipoReserva: "visitante",
  vehiculoId: "v1",
  celdaId: "c1",
  conductorId: "cd1",
  motivo: "",
  fechaReserva: HOY,
  estado: "activa",
  motivoRechazo: "",
  ...over,
});

describe("agendaDeCelda", () => {
  it("ordena las reservas vivas de la celda y descarta las de otras celdas", () => {
    const agenda = agendaDeCelda("c1", [
      reserva({ id: "2", horaInicio: "16:00", horaFin: "18:00" }),
      reserva({ id: "1", horaInicio: "13:00", horaFin: "15:00" }),
      reserva({ id: "3", horaInicio: "13:00", horaFin: "15:00", celdaId: "c9" }),
    ], AHORA);
    expect(agenda.reservas.map((r) => r.id)).toEqual(["1", "2"]);
  });

  it("deja fuera lo cancelado, lo rechazado y lo que ya terminó", () => {
    const agenda = agendaDeCelda("c1", [
      reserva({ id: "1", horaInicio: "13:00", horaFin: "15:00", estado: "cancelada" }),
      reserva({ id: "2", horaInicio: "13:00", horaFin: "15:00", estado: "rechazada" }),
      reserva({ id: "3", horaInicio: "07:00", horaFin: "09:00" }),
    ], AHORA);
    expect(agenda.reservas).toEqual([]);
  });

  it("una solicitud pendiente aparece en el panel pero no es la reserva que manda", () => {
    const agenda = agendaDeCelda("c1", [
      reserva({ id: "1", horaInicio: "13:00", horaFin: "15:00", estado: "pendiente" }),
    ], AHORA);
    expect(agenda.reservas).toHaveLength(1);
    expect(agenda.proxima).toBeNull();
  });

  it("distingue la reserva vigente de la próxima y calcula el plazo de salida", () => {
    const agenda = agendaDeCelda("c1", [
      reserva({ id: "1", horaInicio: "09:30", horaFin: "10:30" }),
      reserva({ id: "2", horaInicio: "13:00", horaFin: "15:00" }),
    ], AHORA);
    expect(agenda.vigente?.id).toBe("1");
    expect(agenda.proxima?.id).toBe("2");
    expect(agenda.minutosParaProxima).toBe(180);
    expect(agenda.horaLimiteSalida?.getHours()).toBe(12);
    expect(agenda.horaLimiteSalida?.getMinutes()).toBe(60 - MARGEN_SALIDA_ANTES_MINUTOS);
  });
});

describe("puedeEstacionarEn", () => {
  it("con una reserva en curso solo entra el vehículo de esa reserva", () => {
    const agenda = agendaDeCelda("c1", [
      reserva({ id: "1", horaInicio: "09:30", horaFin: "10:30", vehiculoId: "v7" }),
    ], AHORA);
    expect(puedeEstacionarEn(agenda, "v7").puede).toBe(true);
    const otro = puedeEstacionarEn(agenda, "v1");
    expect(otro.puede).toBe(false);
    expect(otro.motivo).toContain("10:30");
  });

  it("no deja ocupar la celda si la próxima reserva está a menos de dos horas", () => {
    const agenda = agendaDeCelda("c1", [
      reserva({ id: "1", horaInicio: "11:30", horaFin: "13:00", vehiculoId: "v7" }),
    ], AHORA);
    const permiso = puedeEstacionarEn(agenda, "v1");
    expect(permiso.puede).toBe(false);
    expect(permiso.motivo).toContain("11:30");
  });

  it("quien tiene la próxima reserva sí puede llegar antes", () => {
    const agenda = agendaDeCelda("c1", [
      reserva({ id: "1", horaInicio: "11:30", horaFin: "13:00", vehiculoId: "v7" }),
    ], AHORA);
    expect(puedeEstacionarEn(agenda, "v7").puede).toBe(true);
  });

  it("con la reserva más lejos deja estacionar, avisando hasta qué hora", () => {
    const agenda = agendaDeCelda("c1", [
      reserva({ id: "1", horaInicio: "15:00", horaFin: "17:00", vehiculoId: "v7" }),
    ], AHORA);
    const permiso = puedeEstacionarEn(agenda, "v1");
    expect(permiso.puede).toBe(true);
    expect(permiso.confirmacion?.aviso).toContain("30 min antes de la reserva");
    expect(permiso.confirmacion?.detalle).toContain("14:30");
  });

  it("sin reservas por delante no hay nada que confirmar", () => {
    const permiso = puedeEstacionarEn(agendaDeCelda("c1", [], AHORA), "v1");
    expect(permiso).toEqual({ puede: true });
  });
});

describe("avisoDeCelda", () => {
  const conProxima = (horaInicio: string) =>
    agendaDeCelda("c1", [reserva({ id: "1", horaInicio, horaFin: "23:00" })], AHORA);

  it("avisa de desalojo 50 minutos antes de la reserva, cuando la celda está ocupada", () => {
    expect(avisoDeCelda(conProxima("10:50"), true)?.titulo).toContain("10:20");
    expect(avisoDeCelda(conProxima("11:00"), true)).toBeNull();
  });

  it("pasado el plazo de salida el aviso pasa a urgente", () => {
    expect(avisoDeCelda(conProxima("10:50"), true)?.tono).toBe("atencion");
    expect(avisoDeCelda(conProxima("10:20"), true)?.tono).toBe("urgente");
  });

  it("no avisa de desalojo si la celda está vacía: no hay a quién sacar", () => {
    expect(avisoDeCelda(conProxima("10:30"), false)).toBeNull();
  });

  it("durante una reserva avisa 30 minutos antes de la siguiente", () => {
    const encadenadas = agendaDeCelda("c1", [
      reserva({ id: "1", horaInicio: "09:00", horaFin: "10:25" }),
      reserva({ id: "2", horaInicio: "10:25", horaFin: "12:00" }),
    ], AHORA);
    expect(avisoDeCelda(encadenadas, false)?.titulo).toContain("10:25");

    const lejana = agendaDeCelda("c1", [
      reserva({ id: "1", horaInicio: "09:00", horaFin: "11:00" }),
      reserva({ id: "2", horaInicio: "11:00", horaFin: "12:00" }),
    ], AHORA);
    expect(avisoDeCelda(lejana, false)).toBeNull();
  });
});
