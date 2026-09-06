import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { createAppBackends } from "@/test/appFakeApi";
import { createTestQueryClient } from "@/test/queryWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { MainLayout } from "./MainLayout";

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/services/core/http", () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: "parku:auth-expired" }));
apiFetchMock.mockImplementation(createAppBackends().apiFetch);

function renderLayout() {
  // Sesión de administrador: sin usuario no hay permisos, y sin permisos el menú se queda
  // vacío — no habría dónde pintar el aviso.
  localStorage.setItem("parkuToken", "fake-token-1");
  localStorage.setItem(
    "parkUUser",
    JSON.stringify({ id: "1", correo: "admin@sena.edu.co", nombre: "Administrador ParkU", numero: "3101234567", rol: 1 }),
  );
  return render(
    <MemoryRouter>
      <QueryClientProvider client={createTestQueryClient()}>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

/* La señal del menú cruza cuatro componentes (usePendientes → MainLayout → Sidebar →
   SidebarNav → NavItem). Un eslabón suelto no se ve: el menú sigue pintándose igual, solo
   que sin avisar de nada. Por eso se comprueba montado entero, contra la API falsa. */
describe("MainLayout — avisos en el menú", () => {
  it("marca el módulo de Incidentes con los que están sin atender", async () => {
    renderLayout();

    // La API falsa trae dos novedades en estado PENDIENTE.
    await waitFor(() => expect(screen.getAllByText("2").length).toBeGreaterThan(0));
  });

  it("no marca los módulos que no tienen nada esperando", async () => {
    renderLayout();

    await screen.findByText("Incidentes");
    // Sin reservas pendientes en la semilla, Reservas no lleva señal: ni número dentro del
    // enlace ni el title que anuncia lo que espera.
    const reservas = screen.getByText("Reservas").closest("a")!;
    expect(reservas).not.toHaveAttribute("title");
    expect(reservas.textContent).toBe("Reservas");
  });
});
