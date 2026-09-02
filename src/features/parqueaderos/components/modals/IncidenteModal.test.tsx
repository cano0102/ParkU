import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Celda } from "@/services/api/celdas";
import type { Parqueadero } from "@/services/api/parqueaderos";
import type { Usuario } from "@/services/api/usuarios";
import { ROLES } from "@/services/core/roles";
import type { Ocupante, IncidenteForm } from "../../lib/helpers";
import { IncidenteModal } from "./IncidenteModal";

const celdaActiva: Celda = {
  id: "2", parqueaderoId: "1", numero: "C-002", tipo: "carro", usabilidad: "general",
  estado: "no_disponible", ocupada: true, observaciones: "",
};

const parqueaderoActivo: Parqueadero = {
  id: "1", nombre: "PQ-1 Torre A", ubicacion: "Bloque A", acceso: "regional", capacidadMaxima: 10,
  horaInicio: "05:00", horaFin: "21:00", estado: "activo", zona: "", piso: "", descripcion: "", tipo: "general",
};

const ocupanteActivo: Ocupante = {
  vehiculo: {
    id: "v1", conductorId: "c1", conductorNombre: "Pedro Ruiz G.", placa: "DEF456", tipo: "moto",
    marca: "Yamaha", linea: "", modelo: 2022, color: "Negro", descripcion: "", estado: "activo",
  },
  conductor: {
    id: "c1", usuarioId: "", tipoDocumento: "CC", numeroDocumento: "3456789012", nombre: "Pedro Ruiz G.",
    correo: "pedro@sena.edu.co", direccion: "", numeroTelefonico: "", tipoUsuarioId: "1", tipoUsuarioNombre: "",
    regionalFormacion: "", centroFormacion: "", programaFormacion: "", vigencia: "", movilidadReducida: false,
    tipoDiscapacidad: "", estado: "activo",
  },
  esOficial: false,
  controlId: "cs1",
  // Valor por defecto sin importancia — el test de estadía la sobrescribe con una fecha
  // calculada contra el reloj real (ver más abajo).
  fechaEntrada: "2026-01-01T00:00:00.000Z",
};

const vigilante: Usuario = {
  id: "u2", correo: "ana@sena.edu.co", password: "", nombre: "Ana Martínez R.", numero: "", rol: ROLES.VIGILANTE, estado: "activo",
};

const emptyForm = (): IncidenteForm => ({ descripcion: "", tipoNovedad: "otro", prioridad: "media", usuarioAsignadoId: "" });

function baseProps(overrides: Partial<Parameters<typeof IncidenteModal>[0]> = {}) {
  return {
    open: true,
    celdaActiva,
    ocupanteActivo,
    parqueaderoActivo,
    incidenteForm: emptyForm(),
    setIncidenteForm: vi.fn(),
    incidenteError: null,
    usuariosAsignables: [vigilante],
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    ...overrides,
  };
}

describe("IncidenteModal — información automática desde la celda", () => {
  it("muestra vehículo, conductor, documento, hora de entrada y tiempo de estadía sin pedirlos de nuevo", () => {
    // Real (no fake timers, para no arriesgar dejarlos pegados si una aserción de aquí falla):
    // se calcula una fechaEntrada exactamente 17h20m antes de "ahora" y se deja que el
    // componente use el reloj real — unos pocos ms de ejecución no cruzan el minuto redondeado.
    const haceRato = new Date(Date.now() - (17 * 60 + 20) * 60_000).toISOString();
    render(<IncidenteModal {...baseProps({ ocupanteActivo: { ...ocupanteActivo, fechaEntrada: haceRato } })} />);
    const infoCard = screen.getByTestId("incidente-info-automatica");

    expect(within(infoCard).getByText("DEF456", { exact: false })).toBeInTheDocument();
    expect(within(infoCard).getByText("Pedro Ruiz G.", { exact: false })).toBeInTheDocument();
    expect(within(infoCard).getByText("PQ-1 Torre A", { exact: false })).toBeInTheDocument();
    expect(within(infoCard).getByText("C-002", { exact: false })).toBeInTheDocument();
    expect(within(infoCard).getByText((_, el) => el?.textContent === "Documento: CC 3456789012")).toBeInTheDocument();
    expect(within(infoCard).getByText(/Hora de entrada:/)).toBeInTheDocument();
    expect(within(infoCard).getByText((_, el) => el?.textContent === "Tiempo de estadía: 17h 20m")).toBeInTheDocument();
  });

  it("no revienta si no hay ocupante (celda sin datos de vehículo)", () => {
    render(<IncidenteModal {...baseProps({ ocupanteActivo: null })} />);
    const infoCard = screen.getByTestId("incidente-info-automatica");
    expect(within(infoCard).getAllByText("No registrado", { exact: false }).length).toBeGreaterThan(0);
    expect(within(infoCard).queryByText(/Hora de entrada:/)).not.toBeInTheDocument();
  });
});

describe("IncidenteModal — tipo, prioridad y asignar a", () => {
  /** Envoltorio con estado real (no un mock inerte): así el <select> controlado sí refleja
   *  el cambio tras cada interacción, en vez de quedar congelado en el valor inicial. */
  function ControlledWrapper() {
    const [incidenteForm, setIncidenteForm] = useState<IncidenteForm>(emptyForm());
    return <IncidenteModal {...baseProps({ incidenteForm, setIncidenteForm })} />;
  }

  it("permite elegir tipo, prioridad y a qué Vigilante asignar (ya no quedan fijos)", async () => {
    const user = userEvent.setup();
    render(<ControlledWrapper />);

    await user.selectOptions(screen.getByLabelText("Tipo"), "danio");
    await user.selectOptions(screen.getByLabelText("Prioridad *"), "critica");
    await user.selectOptions(screen.getByLabelText("Asignar a"), "Ana Martínez R.");

    expect(screen.getByLabelText("Tipo")).toHaveValue("danio");
    expect(screen.getByLabelText("Prioridad *")).toHaveValue("critica");
    expect(screen.getByLabelText("Asignar a")).toHaveValue("u2");
  });

  it('muestra un aviso cuando no hay ningún Vigilante disponible para asignar', () => {
    render(<IncidenteModal {...baseProps({ usuariosAsignables: [] })} />);
    expect(screen.getByText(/Solo se puede asignar a un Vigilante/)).toBeInTheDocument();
  });
});
