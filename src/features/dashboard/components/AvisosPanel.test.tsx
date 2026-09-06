import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AvisosPanel } from "./AvisosPanel";

/* Estos avisos son el motivo de que alguien entre hoy a un módulo: si el número no aparece,
   una solicitud de reserva o un incidente se quedan esperando sin que nadie se entere. */
describe("AvisosPanel", () => {
  const props = {
    reservasPendientes: 0,
    incidentesPendientes: 0,
    novedadesPendientes: 0,
    onVerReservas: vi.fn(),
    onVerIncidentes: vi.fn(),
  };

  it("cada cosa pendiente va en su propio recuadro", () => {
    render(<AvisosPanel {...props} reservasPendientes={3} incidentesPendientes={2} />);

    expect(screen.getByText("3 solicitudes de reserva")).toBeInTheDocument();
    expect(screen.getByText("2 incidentes reportados")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("no inventa avisos: solo sale lo que de verdad está pendiente", () => {
    render(<AvisosPanel {...props} incidentesPendientes={1} />);

    expect(screen.getByText("1 incidente reportado")).toBeInTheDocument();
    expect(screen.queryByText(/solicitud/)).not.toBeInTheDocument();
  });

  it("cada aviso lleva a su módulo", () => {
    const onVerReservas = vi.fn();
    render(<AvisosPanel {...props} reservasPendientes={1} onVerReservas={onVerReservas} />);

    fireEvent.click(screen.getByText("1 solicitud de reserva"));
    expect(onVerReservas).toHaveBeenCalled();
  });

  it("cuando no hay nada pendiente lo dice, en vez de dejar un hueco", () => {
    render(<AvisosPanel {...props} />);

    expect(screen.getByText("Nada pendiente por revisar")).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
  /* Una avería y una observación de turno no se atienden igual: contarlas juntas hacía que un
     parqueadero con tres observaciones pareciera tener tres averías sin resolver. */
  it("cuenta las novedades aparte de los incidentes", () => {
    render(<AvisosPanel {...props} incidentesPendientes={2} novedadesPendientes={3} />);

    expect(screen.getByText("2 incidentes reportados")).toBeInTheDocument();
    expect(screen.getByText("3 novedades registradas")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("una novedad sola no se disfraza de incidente", () => {
    render(<AvisosPanel {...props} novedadesPendientes={1} />);

    expect(screen.getByText("1 novedad registrada")).toBeInTheDocument();
    expect(screen.queryByText(/incidente/)).not.toBeInTheDocument();
  });
});
