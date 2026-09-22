import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { createAppBackends } from "@/test/appFakeApi";
import { createTestQueryClient } from "@/test/queryWrapper";
import { AuthProvider } from "@/context/AuthContext";
import { MainLayout } from "./MainLayout";

const apiFetchMock = vi.hoisted(() => vi.fn());
vi.mock("@/services/core/http", () => ({ apiFetch: apiFetchMock, AUTH_EXPIRED_EVENT: "parku:auth-expired" }));

/* Caso real: una cuenta que era Conductor (rol 3) y a la que un administrador le cambia el rol
   a uno creado a medida ("Asesor", id 4) con solo "Registrar salidas". Al recargar, la API
   (/auth/verificar) ya responde con el rol y los permisos nuevos: el menú tiene que mostrar
   solo Entrada / Salida, nada de lo del conductor. */
describe("MainLayout — rol creado a medida", () => {
  afterEach(() => localStorage.clear());

  it("tras cambiarle el rol a Asesor, el menú solo muestra el módulo que le dieron", async () => {
    const backend = createAppBackends().apiFetch;
    apiFetchMock.mockImplementation(async (path: string, opts?: { method?: string }) => {
      if (path === "/auth/verificar") {
        return {
          success: true, message: "",
          data: { usuario: { id: 4, correo: "marcela@sena.edu.co", nombre: "Marcela Alvarez", rol: 4, rol_nombre: "Asesor", estado: "ACTIVO", permisos: ["salida.gestionar"] } },
        };
      }
      return backend(path, opts);
    });

    // Sesión guardada de cuando todavía era Conductor.
    localStorage.setItem("parkuToken", "fake-token-4");
    localStorage.setItem("parkUUser", JSON.stringify({ id: "4", correo: "marcela@sena.edu.co", nombre: "Marcela Alvarez", numero: "", rol: 3 }));

    render(
      <MemoryRouter>
        <QueryClientProvider client={createTestQueryClient()}>
          <AuthProvider>
            <MainLayout />
          </AuthProvider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.queryByText("Mis Vehículos")).not.toBeInTheDocument());
    expect(screen.getByText("Entrada / Salida")).toBeInTheDocument();
    for (const label of ["Dashboard", "Parqueaderos", "Reservas", "Incidentes", "Roles", "Usuarios", "Conductores"]) {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    }
    expect(screen.getAllByText("Asesor").length).toBeGreaterThan(0);
  });
});
