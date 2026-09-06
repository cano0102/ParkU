import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelectorBuscable } from "./SelectorBuscable";

const opciones = [
  { id: "1", titulo: "PQ-1 Torre A", subtitulo: "Bloque A" },
  { id: "2", titulo: "PQ-2 Torre B", subtitulo: "Bloque B" },
];

const pintar = (props: Partial<React.ComponentProps<typeof SelectorBuscable>> = {}) =>
  render(
    <SelectorBuscable label="Parqueadero" opciones={opciones} valor="" onChange={vi.fn()} {...props} />,
  );

/* Un formulario que abre todas sus listas a la vez es una pared de opciones que nadie pidió:
   las sugerencias aparecen cuando la persona va al campo, o en cuanto escribe. */
describe("SelectorBuscable — cuándo sugiere", () => {
  it("no sugiere nada hasta que se va al campo", () => {
    pintar();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("sugiere al desplegar el campo", async () => {
    const user = userEvent.setup();
    pintar();

    await user.click(screen.getByLabelText("Parqueadero"));

    expect(await screen.findByText("PQ-1 Torre A")).toBeInTheDocument();
  });

  /* Con listas muy largas —la flota entera— abrirlas de golpe no ayuda: no se reconoce nada en
     las primeras filas. Ahí se espera a que se escriba. */
  it("con sugerirAlDesplegar=false solo aparece al escribir", async () => {
    const user = userEvent.setup();
    pintar({ sugerirAlDesplegar: false });

    await user.click(screen.getByLabelText("Parqueadero"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Parqueadero"), "Torre");
    expect(await screen.findByText("PQ-1 Torre A")).toBeInTheDocument();
  });

  it("filtra por lo que se escribe, mirando también el dato de apoyo", async () => {
    const user = userEvent.setup();
    pintar();

    await user.type(screen.getByLabelText("Parqueadero"), "Bloque B");

    expect(screen.getByText("PQ-2 Torre B")).toBeInTheDocument();
    expect(screen.queryByText("PQ-1 Torre A")).not.toBeInTheDocument();
  });

  it("al elegir, recoge la lista y deja lo elegido a la vista", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = pintar({ onChange });

    await user.click(screen.getByLabelText("Parqueadero"));
    await user.click(await screen.findByText("PQ-2 Torre B"));
    expect(onChange).toHaveBeenCalledWith("2");

    rerender(
      <SelectorBuscable label="Parqueadero" opciones={opciones} valor="2" onChange={onChange} />,
    );
    expect(screen.getByText("PQ-2 Torre B")).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cambiar parqueadero" })).toBeInTheDocument();
  });
});
