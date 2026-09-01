import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Conductores } from "./ConductoresPage";
import { createTestQueryClient } from "@/test/queryWrapper";
import { createAppBackends } from "@/test/appFakeApi";

// Igual que UsuariosPage.test.tsx / ParqueaderosPage.test.tsx: mockea `apiFetch` contra el
// backend falso compartido. Esta suite estuvo en `.skip` con un comentario que describía un
// cuelgue indefinido del proceso — pero esta suite nunca instalaba este mock (a diferencia de
// sus hermanas), así que cada `apiFetch` real caía en el guard de red de `src/test/setup.ts`
// (que lanza un error sincrónico) en vez de resolver contra datos semilla. Investigado de
// nuevo en esta sesión: quitar el `.skip` y correr la suite tal cual NO cuelga (termina en
// ~12s) — simplemente falla las 5 pruebas porque nunca hay datos que mostrar. El cuelgue
// original documentado puede haber sido real en un estado anterior del código (p. ej. antes
// del fix de referencias estables `EMPTY_CONDUCTORES/EMPTY_USUARIOS/EMPTY_VEHICULOS` en
// useConductoresData.ts, que sí describe un bucle infinito de render con exactamente este
// componente), pero no es reproducible ahora. La causa raíz real de por qué la suite nunca
// pasó era más simple: le faltaba este mock, y además varias aserciones apuntaban a datos
// ("Sofía Castillo", "Ingeniería", el placeholder de UsuarioVinculadoField) que no existen en
// el seed compartido de `@/test/appFakeApi` — quedaron desalineadas de un mock anterior.
const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/services/core/http", () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: "parku:auth-expired" }));

apiFetchMock.mockImplementation(createAppBackends().apiFetch);

function renderConductores() {
  const client = createTestQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <Conductores />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("features/conductores", () => {
  it("renderiza la lista con datos semilla reales (conductores y vehículos)", async () => {
    renderConductores();

    await waitFor(() => expect(screen.getAllByText("Carlos López M.").length).toBeGreaterThan(0));
    expect(screen.getAllByText("ABC123").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pedro Ruiz G.").length).toBeGreaterThan(0);
  });

  it("filtra la lista al escribir en el buscador", async () => {
    const user = userEvent.setup();
    renderConductores();
    await waitFor(() => expect(screen.getAllByText("Carlos López M.").length).toBeGreaterThan(0));

    const search = screen.getByLabelText("Buscar conductores");
    await user.type(search, "Pedro");

    await waitFor(() => expect(screen.getAllByText("Pedro Ruiz G.").length).toBeGreaterThan(0));
    expect(screen.queryByText("Carlos López M.")).not.toBeInTheDocument();
  });

  it("alterna entre vista de cuadrícula y de lista", async () => {
    const user = userEvent.setup();
    renderConductores();
    await waitFor(() => expect(screen.getAllByText("Carlos López M.").length).toBeGreaterThan(0));

    // En vista de lista aparecen los encabezados de columna del DataList.
    await user.click(screen.getByRole("button", { name: "Lista" }));
    await waitFor(() => expect(screen.getByText("Centro de formación")).toBeInTheDocument());
    expect(screen.getByText("Vehículo(s)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cuadrícula" }));
    await waitFor(() => expect(screen.queryByText("Centro de formación")).not.toBeInTheDocument());
  });

  it("abre el modal de creación al hacer clic en Nuevo Conductor", async () => {
    const user = userEvent.setup();
    renderConductores();
    await waitFor(() => expect(screen.getAllByText("Carlos López M.").length).toBeGreaterThan(0));

    await user.click(screen.getByRole("button", { name: /Nuevo Conductor/ }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Nuevo Conductor")).toBeInTheDocument();
    expect(within(dialog).getByPlaceholderText("Buscar por nombre o correo...")).toBeInTheDocument();
    expect(within(dialog).getByPlaceholderText("Ej: ABC123")).toBeInTheDocument();
  });

  it("abre el detalle de un conductor al hacer clic en Ver detalles", async () => {
    const user = userEvent.setup();
    renderConductores();
    await waitFor(() => expect(screen.getAllByText("Carlos López M.").length).toBeGreaterThan(0));

    await user.click(screen.getByRole("button", { name: "Ver detalles de Carlos López M." }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Carlos López M." })).toBeInTheDocument();
    expect(within(dialog).getByText("Administración")).toBeInTheDocument();
  });
});
