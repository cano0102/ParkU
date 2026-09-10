import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { createAppBackends } from "@/test/appFakeApi";
import { AuthProvider } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { createTestQueryClient } from "@/test/queryWrapper";
import { Incidentes } from "./IncidentesPage";

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/services/core/http", () => ({
  apiFetch: apiFetchMock,
  AUTH_EXPIRED_EVENT: "parku:auth-expired",
  crearConRespaldo: async (
    path: string,
    body: unknown,
    fetchTodosCrudo: () => Promise<any[]>,
  ) => {
    const creado = await apiFetchMock(path, { method: "POST", body });
    if (creado) return creado;
    const todos = await fetchTodosCrudo();
    return todos.reduce((max: any, item: any) =>
      item.id > max.id ? item : max,
    );
  },
}));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

// Misma cadena que ConductorDashboard.test.tsx: conductoresSeed[0] (id 1) pertenece a
// usuario_id 2, y vehiculosSeed[0] (id 1) lo tiene como principal. incidentesSeed[0] ya
// está atado a vehiculo_id 1 en la semilla compartida — no hace falta declarar uno nuevo.
function renderComoComunidadSena() {
  localStorage.setItem("parkuToken", "fake-token-2");
  localStorage.setItem(
    "parkUUser",
    JSON.stringify({
      id: "2",
      correo: "ana.martinez@sena.edu.co",
      nombre: "Ana Martínez R.",
      numero: "",
      rol: ROLES.CONDUCTOR,
    }),
  );
  const client = createTestQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Incidentes />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe("features/incidentes — ConductorIncidentes (rol Comunidad SENA)", () => {
  it("bloquea el acceso a incidentes del parqueadero para el conductor", async () => {
    renderComoComunidadSena();

    expect(
      await screen.findByText(
        "No tienes permisos para consultar incidentes del parqueadero.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Reportar incidente/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Mis incidentes")).not.toBeInTheDocument();
  });

  it("no ofrece el flujo de creación de incidentes aunque la pantalla se abra por URL directa", async () => {
    const user = userEvent.setup();
    renderComoComunidadSena();

    expect(
      await screen.findByText(
        "No tienes permisos para consultar incidentes del parqueadero.",
      ),
    ).toBeInTheDocument();
    await user.click(
      screen.getByText(
        "No tienes permisos para consultar incidentes del parqueadero.",
      ),
    );

    expect(
      screen.queryByRole("heading", { level: 2, name: "Nuevo Incidente" }),
    ).not.toBeInTheDocument();
  });
});

describe("features/incidentes — ConductorIncidentes con el 403 real simulado (GET /novedades para Comunidad SENA)", () => {
  afterEach(() => {
    apiFetchMock.mockImplementation(createAppBackends().apiFetch);
  });

  it("no permite ni siquiera abrir el formulario aunque el backend simule un 403 para el rol conductor", async () => {
    apiFetchMock.mockImplementation(
      createAppBackends({ rolActual: ROLES.CONDUCTOR }).apiFetch,
    );
    renderComoComunidadSena();

    expect(
      await screen.findByText(
        "No tienes permisos para consultar incidentes del parqueadero.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Reportar incidente/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 2, name: "Nuevo Incidente" }),
    ).not.toBeInTheDocument();
  });
});
