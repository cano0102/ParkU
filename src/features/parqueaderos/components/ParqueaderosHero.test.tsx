import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParqueaderosHero } from "./ParqueaderosHero";

describe("ParqueaderosHero", () => {
  it("muestra los conteos de ocupados y disponibles", () => {
    render(
      <ParqueaderosHero
        stats={{ libres: 12, ocupadas: 8, mantenimiento: 2 }}
      />,
    );

    expect(screen.getByText("Disponibles")).toBeInTheDocument();
    expect(screen.getByText("Ocupadas")).toBeInTheDocument();
    expect(screen.queryByText("En mantenimiento")).not.toBeInTheDocument();
    expect(screen.queryByText("Reservadas")).not.toBeInTheDocument();
    expect(screen.queryByText("Ocupación")).not.toBeInTheDocument();
  });
});
