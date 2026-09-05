import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import { CeldaInfoModal } from "./CeldaInfoModal";

const celdaDisponible: Celda = {
  id: "1", parqueaderoId: "1", numero: "C-001", tipo: "carro", usabilidad: "general",
  estado: "disponible", ocupada: false, observaciones: "",
};

const parqueaderoActivo: Parqueadero = {
  id: "1", nombre: "PQ-1", ubicacion: "Bloque A", acceso: "regional", capacidadMaxima: 10,
  horaInicio: "05:00", horaFin: "21:00", estado: "activo", zona: "", piso: "", descripcion: "", tipo: "general",
};

const noop = () => {};

/** Props mínimas comunes a los dos escenarios de abajo — solo lo que cambia entre ellos se pasa aparte. */
function baseProps(canManageCeldas: boolean) {
  return {
    open: true,
    celdaActiva: celdaDisponible,
    ocupanteActivo: null,
    reservaActiva: null,
    vehiculoReservado: null,
    parqueaderoActivo,
    onClose: noop,
    onCancelarReserva: noop,
    onEstacionarOficial: noop,
    onNavigateConductor: noop,
    onLiberar: noop,
    onReportarIncidente: noop,
    onEstacionarVehiculo: noop,
    onEstacionarReservado: noop,
    onReservarCelda: vi.fn(),
    canManageCeldas,
    canRegistrarIngreso: false,
    canReportarIncidentes: false,
  };
}

describe("CeldaInfoModal — botón Reservar Celda", () => {
  // `onReservarCelda` dispara `handleCrearReserva` (useReservaCelda.ts), que crea la reserva y
  // la ACTIVA de inmediato sin pasar por aprobación — antes este botón no verificaba ningún
  // permiso, así que cualquier rol (incluido Comunidad SENA) podía saltarse el flujo normal de
  // solicitud pendiente. Ver hallazgo 🔴 N3 del informe de auditoría.
  it('se muestra cuando el rol tiene el permiso "celdas" (Admin/Vigilante)', () => {
    render(<CeldaInfoModal {...baseProps(true)} />);
    expect(screen.getByText("Reservar Celda", { exact: false })).toBeInTheDocument();
  });

  it('NO se muestra cuando el rol no tiene el permiso "celdas" (Comunidad SENA)', () => {
    render(<CeldaInfoModal {...baseProps(false)} />);
    expect(screen.queryByText("Reservar Celda", { exact: false })).not.toBeInTheDocument();
  });
});

describe("CeldaInfoModal — solicitar la celda (rol Conductor)", () => {
  it("ofrece solicitarla a quien puede reservar pero no gestionar celdas", async () => {
    const onSolicitarReserva = vi.fn();
    render(
      <CeldaInfoModal {...baseProps(false)} canSolicitarReserva onSolicitarReserva={onSolicitarReserva} />
    );

    const boton = screen.getByText("Solicitar esta celda", { exact: false });
    expect(boton).toBeInTheDocument();
    boton.click();
    expect(onSolicitarReserva).toHaveBeenCalled();
  });

  it("no la ofrece si no se pasa la acción (Admin: ese ya tiene Reservar Celda)", () => {
    render(<CeldaInfoModal {...baseProps(true)} />);
    expect(screen.queryByText("Solicitar esta celda", { exact: false })).not.toBeInTheDocument();
  });

  it("a quien no puede estacionar no le dice que la celda es para estacionar", () => {
    render(<CeldaInfoModal {...baseProps(false)} canSolicitarReserva onSolicitarReserva={vi.fn()} />);
    expect(screen.getByText("Celda disponible: puedes solicitarla", { exact: false })).toBeInTheDocument();
  });
});
