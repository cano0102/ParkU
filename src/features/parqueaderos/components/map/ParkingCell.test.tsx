import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { CeldaPos } from "../../lib/helpers";
import { ParkingCell } from "./ParkingCell";

const celda: CeldaPos = {
  id: "1", parqueaderoId: "1", numero: "C-001", tipo: "carro", usabilidad: "general",
  estado: "disponible", ocupada: false, observaciones: "", x: 0, y: 0,
};

const pintar = (props: Partial<React.ComponentProps<typeof ParkingCell>> = {}) =>
  render(
    <svg>
      <ParkingCell
        celda={celda}
        pqNombre="PQ-1"
        tipoPq="general"
        matches={false}
        tieneIncidente={false}
        ocupante={null}
        onPointerDown={vi.fn()}
        onHover={vi.fn()}
        onHoverLeave={vi.fn()}
        {...props}
      />
    </svg>,
  );

describe("ParkingCell — reservas", () => {
  /* El estado "reservada" solo lo pone una persona a mano: ninguna reserva lo produce desde
     que apartan una franja y no la celda entera. Se señala como lo que es —una celda en un
     estado que no corresponde a nada— igual que una ocupada sin vehículo. */
  it("marca como avería la celda puesta en reservada a mano", () => {
    pintar({ celda: { ...celda, estado: "reservada" } });
    expect(screen.getByText("Sin reserva")).toBeInTheDocument();
  });

  it("una celda normal no dice nada de eso", () => {
    pintar();
    expect(screen.queryByText("Sin reserva")).not.toBeInTheDocument();
  });

  it("muestra la hora de la próxima reserva sobre la celda", () => {
    pintar({ marcaReserva: { aviso: null, proximaHora: "15:00", enCurso: false } });
    expect(screen.getByText("15:00")).toBeInTheDocument();
  });

  it("con una reserva en curso y ninguna después, lo dice sin hora", () => {
    pintar({ marcaReserva: { aviso: null, proximaHora: null, enCurso: true } });
    expect(screen.getByText("RES")).toBeInTheDocument();
  });

  it("el aviso de desalojo llega hasta la celda del plano", () => {
    pintar({
      marcaReserva: {
        aviso: { tono: "urgente", titulo: "Debe desalojar antes de las 14:30", detalle: "…" },
        proximaHora: "15:00",
        enCurso: false,
      },
    });
    expect(screen.getByText("Debe desalojar antes de las 14:30")).toBeInTheDocument();
  });
});
