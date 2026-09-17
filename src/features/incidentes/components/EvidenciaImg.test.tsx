import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EvidenciaImg } from "./EvidenciaImg";

// `archivos.ts` calcula su resolutor real una sola vez, a partir de `import.meta.env.VITE_API_URL`
// leído en tiempo de módulo — depende de que exista un `.env` local con esa variable, que no
// se versiona. Se mockea con una base explícita (igual que hace archivos.test.ts) para que esta
// prueba no dependa de la máquina donde corre.
vi.mock("@/services/core/archivos", async () => {
  const real = await vi.importActual<typeof import("@/services/core/archivos")>("@/services/core/archivos");
  return { ...real, ...real.crearResolutorDeArchivos("https://api-parku-e017.onrender.com/api") };
});

describe("EvidenciaImg", () => {
  it("empieza por el origen del servidor y, si falla, reintenta bajo la base de la API", () => {
    const onCargada = vi.fn();
    const onFallo = vi.fn();
    render(<EvidenciaImg url="/uploads/evidencias/a.jpg" alt="Evidencia 1" onCargada={onCargada} onFallo={onFallo} />);

    const img = screen.getByAltText("Evidencia 1") as HTMLImageElement;
    // Base de API mockeada arriba (ver vi.mock): la primera URL va sin /api.
    expect(img.src).toBe("https://api-parku-e017.onrender.com/uploads/evidencias/a.jpg");

    fireEvent.error(img);
    expect(img.src).toBe("https://api-parku-e017.onrender.com/api/uploads/evidencias/a.jpg");
    expect(onFallo).not.toHaveBeenCalled();

    fireEvent.load(img);
    expect(onCargada).toHaveBeenCalledWith("https://api-parku-e017.onrender.com/api/uploads/evidencias/a.jpg");
  });

  it("avisa del fallo solo cuando se agotaron todas las URLs candidatas", () => {
    const onFallo = vi.fn();
    render(<EvidenciaImg url="uploads/b.png" alt="Evidencia 2" onFallo={onFallo} />);

    const img = screen.getByAltText("Evidencia 2");
    fireEvent.error(img);
    expect(onFallo).not.toHaveBeenCalled();
    fireEvent.error(img);
    expect(onFallo).toHaveBeenCalledTimes(1);
  });

  it("no renderiza nada sin URL", () => {
    const { container } = render(<EvidenciaImg url="" alt="Nada" />);
    expect(container.querySelector("img")).toBeNull();
  });
});
