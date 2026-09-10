import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParqueaderosHero } from "./ParqueaderosHero";

describe("ParqueaderosHero", () => {
  it("muestra solo los conteos de ocupados, disponibles y mantenimiento", () => {
    render(
      <ParqueaderosHero
        stats={{ libres: 12, ocupadas: 8, mantenimiento: 2 }}
      />,
    );

    expect(screen.getByText("Disponibles")).toBeInTheDocument();
    expect(screen.getByText("Ocupadas")).toBeInTheDocument();
    expect(screen.getByText("En mantenimiento")).toBeInTheDocument();
    expect(screen.queryByText("Reservadas")).not.toBeInTheDocument();
    expect(screen.queryByText("Ocupación")).not.toBeInTheDocument();
  });
});
