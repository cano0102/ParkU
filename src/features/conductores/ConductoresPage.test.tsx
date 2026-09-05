import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Conductores } from "./ConductoresPage";
import { createTestQueryClient } from "@/test/queryWrapper";
import { createAppBackends } from "@/test/appFakeApi";
import { AuthProvider } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";

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

const SEED_ADMIN = {
  id: '1', correo: 'admin@sena.edu.co', nombre: 'Administrador ParkU', numero: '3101234567', rol: ROLES.ADMIN,
};

function renderConductores() {
  const client = createTestQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <Conductores />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("features/conductores", () => {
  beforeEach(() => {
    localStorage.setItem('parkuToken', 'fake-token-1');
    localStorage.setItem('parkUUser', JSON.stringify(SEED_ADMIN));
  });

  afterEach(() => {
    localStorage.clear();
  });

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

  it("al vincular una cuenta muestra sus datos y deja el correo no editable", async () => {
    const user = userEvent.setup();
    renderConductores();
    await waitFor(() => expect(screen.getAllByText("Carlos López M.").length).toBeGreaterThan(0));

    await user.click(screen.getByRole("button", { name: /Nuevo Conductor/ }));
    const dialog = await screen.findByRole("dialog");

    // Antes de vincular, el correo del conductor se escribe a mano.
    const correo = within(dialog).getByPlaceholderText("correo@sena.edu.co") as HTMLInputElement;
    expect(correo.readOnly).toBe(false);

    await user.type(within(dialog).getByPlaceholderText("Buscar por nombre o correo..."), "maria");
    await user.click(await within(dialog).findByText("María Díaz P."));

    // La cuenta rellena nombre, correo y teléfono, y su ficha resume lo que aporta.
    await waitFor(() => expect(correo.value).toBe("maria.diaz@ext.com"));
    expect((within(dialog).getByPlaceholderText("ej. María García López") as HTMLInputElement).value).toBe("María Díaz P.");
    expect(within(dialog).getByText("Conductor")).toBeInTheDocument();

    // Y el correo pasa a ser de solo lectura: se gestiona desde la cuenta, no aquí.
    expect(correo.readOnly).toBe(true);
    expect(within(dialog).getByText("Correo (de la cuenta vinculada)")).toBeInTheDocument();

    // Al quitar la vinculación vuelve a editarse, sin perder el resto del formulario.
    await user.click(within(dialog).getByLabelText("Quitar la cuenta vinculada"));
    await waitFor(() => expect(correo.readOnly).toBe(false));
    expect((within(dialog).getByPlaceholderText("ej. María García López") as HTMLInputElement).value).toBe("María Díaz P.");
  }, 20000);

  it("abre el modal de creación al hacer clic en Nuevo Conductor", async () => {
    const user = userEvent.setup();
    renderConductores();
    await waitFor(() => expect(screen.getAllByText("Carlos López M.").length).toBeGreaterThan(0));

    await user.click(screen.getByRole("button", { name: /Nuevo Conductor/ }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Nuevo Conductor")).toBeInTheDocument();
    expect(within(dialog).getByPlaceholderText("Buscar por nombre o correo...")).toBeInTheDocument();
    // El tipo de usuario va primero: de él depende si hace falta cuenta de acceso.
    expect(within(dialog).getByLabelText("Tipo de usuario")).toBeInTheDocument();
    // Y se puede crear la cuenta desde aquí mismo.
    expect(within(dialog).getByLabelText("No tengo usuario")).toBeInTheDocument();
    // El vehículo SÍ se registra al crear: dar de alta a alguien sin su vehículo deja el
    // trámite a medias. Al editar no aparece (se gestiona desde la tarjeta del vehículo).
    expect(within(dialog).getByPlaceholderText("Ej: ABC123")).toBeInTheDocument();
  });

  it("vincular un vehículo existente como copropietario lo muestra en la tarjeta del nuevo conductor", async () => {
    const user = userEvent.setup();
    renderConductores();
    await waitFor(() => expect(screen.getAllByText("Pedro Ruiz G.").length).toBeGreaterThan(0));

    // Pedro Ruiz G. (conductor 2) ya tiene DEF456 propio; vamos a vincularle también ABC123
    // (propiedad principal de Carlos López M.) como copropietario.
    await user.click(screen.getByRole("button", { name: "Agregar vehículo a Pedro Ruiz G." }));
    const dialog = await screen.findByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "Vincular existente" }));
    await user.click(await within(dialog).findByText(/ABC123/));
    await user.click(within(dialog).getByRole("button", { name: "Vincular Copropietario" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    // La tarjeta de Pedro ahora debe reflejar los 2 vehículos (el propio DEF456 + el
    // copropietario ABC123) — antes del fix, `getVehiculosConductor` solo filtraba por
    // `conductorId` (dueño principal) y el vínculo quedaba invisible en su propia tarjeta.
    await waitFor(() => {
      const tarjetaPedro = screen.getByText("Pedro Ruiz G.").closest(".conductor-card") as HTMLElement;
      expect(within(tarjetaPedro).getByText("2 vehículos")).toBeInTheDocument();
      expect(within(tarjetaPedro).getByText("ABC123")).toBeInTheDocument();
      expect(within(tarjetaPedro).getByText("DEF456")).toBeInTheDocument();
    });
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
