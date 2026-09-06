import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { IconCalendar as Calendar } from "@tabler/icons-react";
import type { MenuItem } from "../lib/menu";
import { NavItem } from "./NavItem";

const item: MenuItem = {
  path: "/app/reservas", label: "Reservas", icon: Calendar, group: "operacion", permission: "reservas",
};

const pintar = (props: Partial<React.ComponentProps<typeof NavItem>> = {}) =>
  render(
    <MemoryRouter>
      <NavItem item={item} active={false} {...props} />
    </MemoryRouter>,
  );

/* La señal del menú es lo que hace que alguien entre a un módulo donde pasó algo: sin ella,
   una solicitud de reserva o un incidente solo se descubren entrando a mirar. */
describe("NavItem — pendientes del módulo", () => {
  it("muestra cuántos hay esperando", () => {
    pintar({ pendientes: 4 });
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("lo dice también en el title, para quien pasa el mouse", () => {
    pintar({ pendientes: 4 });
    expect(screen.getByRole("link")).toHaveAttribute("title", "Reservas — 4 sin atender");
  });

  it("corta el número en 99+ para que no rompa el ancho del menú", () => {
    pintar({ pendientes: 150 });
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("sin nada pendiente no pinta ninguna señal", () => {
    const { container } = pintar({ pendientes: 0, collapsed: true });
    expect(screen.queryByText("0")).not.toBeInTheDocument();
    expect(container.querySelector('span[style*="border-radius: 50%"]')).not.toBeInTheDocument();
  });

  /* Con el menú plegado no cabe el número, pero la señal no puede perderse: queda el punto. */
  it("plegado no muestra el número, pero sí que hay algo", () => {
    const { container } = pintar({ pendientes: 3, collapsed: true });
    expect(screen.queryByText("3")).not.toBeInTheDocument();
    expect(container.querySelector('span[style*="border-radius: 50%"]')).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("title", "Reservas — 3 sin atender");
  });
});
