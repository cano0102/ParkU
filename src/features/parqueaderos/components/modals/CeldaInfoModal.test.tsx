import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Reserva } from "@/services/api/reservas";
import { CeldaInfoModal } from "./CeldaInfoModal";
import { agendaDeCelda } from "../../lib/agendaCelda";

const celdaDisponible: Celda = {
  id: "1",
  parqueaderoId: "1",
  numero: "C-001",
  tipo: "carro",
  usabilidad: "general",
  estado: "disponible",
  ocupada: false,
  observaciones: "",
};

const parqueaderoActivo: Parqueadero = {
  id: "1",
  nombre: "PQ-1",
  ubicacion: "Bloque A",
  acceso: "regional",
  capacidadMaxima: 10,
  horaInicio: "05:00",
  horaFin: "21:00",
  estado: "activo",
  zona: "",
  piso: "",
  descripcion: "",
  tipo: "general",
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

/* Las reservas se construyen relativas al reloj: lo que se prueba es justamente la distancia
   entre "ahora" y la reserva, así que una fecha fija dejaría de tocar la regla mañana. */
function reservaEn(
  desdeMin: number,
  duracionMin: number,
  over: Partial<Reserva> = {},
): Reserva {
  const hhmm = (min: number) => {
    const d = new Date(Date.now() + min * 60000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const inicio = new Date(Date.now() + desdeMin * 60000);
  const fecha = `${inicio.getFullYear()}-${String(inicio.getMonth() + 1).padStart(2, "0")}-${String(inicio.getDate()).padStart(2, "0")}`;
  return {
    id: "r1",
    tipoReserva: "visitante",
    vehiculoId: "v1",
    celdaId: "1",
    conductorId: "c1",
    motivo: "",
    fechaReserva: fecha,
    horaInicio: hhmm(desdeMin),
    horaFin: hhmm(desdeMin + duracionMin),
    estado: "activa",
    motivoRechazo: "",
    ...over,
  };
}

describe("CeldaInfoModal — botón Reservar Celda", () => {
  // `onReservarCelda` dispara `handleCrearReserva` (useReservaCelda.ts), que crea la reserva y
  // la ACTIVA de inmediato sin pasar por aprobación — antes este botón no verificaba ningún
  // permiso, así que cualquier rol (incluido Comunidad SENA) podía saltarse el flujo normal de
  // solicitud pendiente. Ver hallazgo 🔴 N3 del informe de auditoría.
  it('se muestra cuando el rol tiene el permiso "celdas" (Admin/Vigilante)', () => {
    render(<CeldaInfoModal {...baseProps(true)} />);
    expect(
      screen.getByText("Reservar Celda", { exact: false }),
    ).toBeInTheDocument();
  });

  it('NO se muestra cuando el rol no tiene el permiso "celdas" (Comunidad SENA)', () => {
    render(<CeldaInfoModal {...baseProps(false)} />);
    expect(
      screen.queryByText("Reservar Celda", { exact: false }),
    ).not.toBeInTheDocument();
  });
});

describe("CeldaInfoModal — solicitar la celda (rol Conductor)", () => {
  it("ofrece solicitarla a quien puede reservar pero no gestionar celdas", async () => {
    const onSolicitarReserva = vi.fn();
    render(
      <CeldaInfoModal
        {...baseProps(false)}
        canSolicitarReserva
        onSolicitarReserva={onSolicitarReserva}
      />,
    );

    const boton = screen.getByText("Solicitar esta celda", { exact: false });
    expect(boton).toBeInTheDocument();
    boton.click();
    expect(onSolicitarReserva).toHaveBeenCalled();
  });

  it("no la ofrece si no se pasa la acción (Admin: ese ya tiene Reservar Celda)", () => {
    render(<CeldaInfoModal {...baseProps(true)} />);
    expect(
      screen.queryByText("Solicitar esta celda", { exact: false }),
    ).not.toBeInTheDocument();
  });

  it("a quien no puede estacionar no le dice que la celda es para estacionar", () => {
    render(
      <CeldaInfoModal
        {...baseProps(false)}
        canSolicitarReserva
        onSolicitarReserva={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Celda disponible: puedes solicitarla", {
        exact: false,
      }),
    ).toBeInTheDocument();
  });
});

describe("CeldaInfoModal — la agenda de la celda", () => {
  /* Reloj congelado a media mañana. Las reservas de estas pruebas se construyen a partir de
     "ahora" (es la distancia hasta la reserva lo que se comprueba), y con el reloj real la
     franja se salía del día en cuanto la suite corría de tarde: una reserva de las 23:24 a
     las 00:24 queda, sobre una sola fecha, terminando ANTES de empezar. */
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-03-10T10:00:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const props = (reservas: Reserva[]) => ({
    ...baseProps(false),
    canRegistrarIngreso: true,
    agenda: agendaDeCelda("1", reservas),
    agendaDetallada: reservas.map((r) => ({
      id: r.id,
      placa: "ABC123",
      conductor: "María Gómez",
    })),
  });

  it("lista las reservas de la celda, no solo la que la retiene ahora", () => {
    render(
      <CeldaInfoModal
        {...props([reservaEn(180, 60), reservaEn(300, 60, { id: "r2" })])}
      />,
    );

    expect(screen.getByText("Reservas de esta celda")).toBeInTheDocument();
    expect(screen.getAllByText("ABC123 · María Gómez")).toHaveLength(2);
  });

  /* El compromiso que se adquiere al ocupar una celda que ya tiene dueño más tarde: se
     acepta antes de abrir el asistente, no después de llenarlo. */
  it("pide confirmar el desalojo antes de estacionar cuando hay una reserva por delante", () => {
    const onEstacionarVehiculo = vi.fn();
    render(
      <CeldaInfoModal
        {...props([reservaEn(240, 60)])}
        onEstacionarVehiculo={onEstacionarVehiculo}
      />,
    );

    fireEvent.click(screen.getByText("Estacionar Vehículo"));
    expect(onEstacionarVehiculo).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        /debes asegurar que el vehículo salga máximo 30 min antes de la reserva/,
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Entiendo, estacionar"));
    expect(onEstacionarVehiculo).toHaveBeenCalled();
  });

  it("no pide confirmar nada si la celda no tiene ninguna reserva por delante", () => {
    const onEstacionarVehiculo = vi.fn();
    render(
      <CeldaInfoModal
        {...props([])}
        onEstacionarVehiculo={onEstacionarVehiculo}
      />,
    );

    fireEvent.click(screen.getByText("Estacionar Vehículo"));
    expect(onEstacionarVehiculo).toHaveBeenCalled();
  });

  it("no deja estacionar cuando la reserva está tan cerca que no da tiempo a desalojar", () => {
    render(<CeldaInfoModal {...props([reservaEn(60, 60)])} />);

    expect(screen.getByText("Estacionar Vehículo")).toBeDisabled();
    expect(
      screen.getByText(/no da tiempo a usarla y desalojarla/),
    ).toBeInTheDocument();
  });

  /* Ese bloqueo es para los demás: quien reservó puede llegar antes de su hora, y tiene que
     poder entrar sin pelearse con un aviso pensado para protegerlo a él. */
  it("ofrece estacionar al vehículo que tiene la reserva, aunque falte poco para su hora", () => {
    const onEstacionarReservado = vi.fn();
    render(
      <CeldaInfoModal
        {...props([reservaEn(60, 60)])}
        vehiculoReservado={{
          id: "v1",
          conductorId: "c1",
          conductorNombre: "María Gómez",
          placa: "ABC123",
          tipo: "carro",
          marca: "Mazda",
          linea: "",
          modelo: 2021,
          color: "Gris",
          descripcion: "",
          estado: "activo",
        }}
        onEstacionarReservado={onEstacionarReservado}
      />,
    );

    fireEvent.click(screen.getByText(/Estacionar ABC123/));
    expect(onEstacionarReservado).toHaveBeenCalled();
  });

  /* El aviso que pidió el vigilante: 50 minutos antes de la reserva (veinte antes del plazo
     máximo de salida) para que le dé tiempo de contactar al conductor. */
  it("avisa de desalojar la celda ocupada cuando la reserva se acerca", () => {
    const ocupada: Celda = {
      ...celdaDisponible,
      estado: "no_disponible",
      ocupada: true,
    };
    render(
      <CeldaInfoModal {...props([reservaEn(45, 60)])} celdaActiva={ocupada} />,
    );

    expect(
      screen.getByText(/Contacta al conductor para que retire el vehículo/),
    ).toBeInTheDocument();
  });

  /* Cancelar no puede depender de que la reserva ya haya empezado: si solo se ofrece con la
     celda retenida, una reserva de la tarde no hay forma de cancelarla en toda la mañana. */
  it("deja cancelar la reserva que viene, con la celda todavía libre", () => {
    const onCancelarReserva = vi.fn();
    const reserva = reservaEn(240, 60);
    render(
      <CeldaInfoModal
        {...props([reserva])}
        onCancelarReserva={onCancelarReserva}
      />,
    );

    fireEvent.click(screen.getByLabelText("Cancelar la reserva de las 14:00"));
    expect(onCancelarReserva).toHaveBeenCalledWith(reserva);
  });

  /* Con varias reservas el mismo día hay que poder elegir cuál se cancela: cancelar "la de la
     celda" tocaba siempre la primera, que casi nunca es la que se quiere quitar. */
  it("cancela la reserva que se eligió, no la primera de la lista", () => {
    const onCancelarReserva = vi.fn();
    const temprana = reservaEn(180, 60);
    const tardia = reservaEn(300, 60, { id: "r2" });
    render(
      <CeldaInfoModal
        {...props([temprana, tardia])}
        onCancelarReserva={onCancelarReserva}
      />,
    );

    fireEvent.click(screen.getByLabelText("Cancelar la reserva de las 15:00"));
    expect(onCancelarReserva).toHaveBeenCalledWith(tardia);
  });

  it("sin reservas por delante no ofrece cancelar nada", () => {
    render(<CeldaInfoModal {...props([])} />);
    expect(
      screen.queryByLabelText(/Cancelar la reserva/),
    ).not.toBeInTheDocument();
  });

  /* Quien no registra ingresos (Comunidad SENA desde el plano) ve la agenda, pero no la toca. */
  it("no ofrece cancelar a quien solo puede mirar", () => {
    render(
      <CeldaInfoModal
        {...props([reservaEn(240, 60)])}
        canRegistrarIngreso={false}
      />,
    );

    expect(screen.getByText("Reservas de esta celda")).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Cancelar la reserva/),
    ).not.toBeInTheDocument();
  });
});

describe("CeldaInfoModal — ajuste manual de estado", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-03-10T10:00:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const props = (reservas: Reserva[]) => ({
    ...baseProps(true),
    canRegistrarIngreso: true,
    agenda: agendaDeCelda("1", reservas),
    onSetEstadoManual: vi.fn(),
  });

  /* El estado de la celda y la agenda son cosas distintas: ponerla en disponible a mano no
     cancela ninguna reserva. Antes esto se bloqueaba, y una celda marcada a mano se quedaba
     así mientras existiera cualquier reserva por delante. */
  it("deja cambiar el estado aunque la celda tenga una reserva por delante", () => {
    const p = props([reservaEn(240, 60)]);
    render(
      <CeldaInfoModal
        {...p}
        celdaActiva={{ ...celdaDisponible, estado: "reservada" }}
      />,
    );

    fireEvent.click(screen.getByText("Disponible"));
    expect(p.onSetEstadoManual).toHaveBeenCalledWith("disponible");
  });

  it("avisa de que ese cambio no cancela la reserva", () => {
    render(<CeldaInfoModal {...props([reservaEn(240, 60)])} />);
    expect(
      screen.getByText(/cambiar el estado a mano no la cancela/),
    ).toBeInTheDocument();
  });

  /* Lo que sí sigue bloqueando es un vehículo dentro: eso no es un estado, es un hecho. */
  it("no deja tocar el estado de una celda con un vehículo dentro", () => {
    const ocupada: Celda = {
      ...celdaDisponible,
      estado: "no_disponible",
      ocupada: true,
    };
    render(
      <CeldaInfoModal
        {...props([])}
        celdaActiva={ocupada}
        ocupanteActivo={{
          vehiculo: {
            id: "v1",
            conductorId: "c1",
            conductorNombre: "María",
            placa: "ABC123",
            tipo: "carro",
            marca: "",
            linea: "",
            modelo: 2020,
            color: "",
            descripcion: "",
            estado: "activo",
          },
          conductor: undefined,
          esOficial: false,
          controlId: "cs1",
          fechaEntrada: new Date().toISOString(),
        }}
      />,
    );

    expect(
      screen.getByText(/Debe registrarse la salida del vehículo/),
    ).toBeInTheDocument();
    expect(screen.queryByText("Disponible")).not.toBeInTheDocument();
  });
});

/* Reportar no depende de que la celda esté ocupada ni del rol que gestiona el parqueadero:
   quien ve la celda tiene que poder decir que algo pasa con ella. */
describe("CeldaInfoModal — reportar sobre una celda libre", () => {
  it("ofrece reportar a quien tiene el permiso, con la celda vacía", () => {
    const onReportarIncidente = vi.fn();
    render(
      <CeldaInfoModal
        {...baseProps(false)}
        canReportarIncidentes
        onReportarIncidente={onReportarIncidente}
      />,
    );

    fireEvent.click(screen.getByText(/Reportar/));
    expect(onReportarIncidente).toHaveBeenCalled();
  });

  it("no lo ofrece a quien no tiene ese permiso", () => {
    render(
      <CeldaInfoModal {...baseProps(false)} canReportarIncidentes={false} />,
    );
    expect(screen.queryByText(/Reportar/)).not.toBeInTheDocument();
  });

  it("no deja acumular reportes sobre lo mismo", () => {
    const onReportarIncidente = vi.fn();
    render(
      <CeldaInfoModal
        {...baseProps(false)}
        canReportarIncidentes
        incidenteAbiertoExiste
        onReportarIncidente={onReportarIncidente}
      />,
    );

    expect(screen.getByText(/Ya reportado/)).toBeDisabled();
    fireEvent.click(screen.getByText(/Ya reportado/));
    expect(onReportarIncidente).not.toHaveBeenCalled();
  });
});
