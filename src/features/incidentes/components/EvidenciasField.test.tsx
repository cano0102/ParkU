import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EvidenciasField } from "./EvidenciasField";

/* jsdom no implementa las URL de objeto (son del navegador real): las miniaturas piden una
   por cada archivo, así que se sustituyen por una cualquiera. */
beforeAll(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});

const foto = (nombre: string, tipo = "image/jpeg", mb = 1) =>
  new File([new ArrayBuffer(mb * 1024 * 1024)], nombre, { type: tipo });

const subir = (archivos: File[]) => {
  const input = screen.getByLabelText("Agregar evidencias");
  fireEvent.change(input, { target: { files: archivos } });
};

describe("EvidenciasField", () => {
  it("acepta varias imágenes de una vez", () => {
    const onChange = vi.fn();
    render(<EvidenciasField archivos={[]} onChange={onChange} />);

    subir([foto("golpe.jpg"), foto("otra.png", "image/png")]);

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: "golpe.jpg" }),
      expect.objectContaining({ name: "otra.png" }),
    ]);
  });

  it("deja seguir agregando de una en una hasta el máximo", () => {
    const onChange = vi.fn();
    render(<EvidenciasField archivos={[foto("una.jpg")]} onChange={onChange} />);

    // Con una ya elegida el botón invita a añadir otra, no a empezar de cero.
    expect(screen.getByText("Otra más")).toBeInTheDocument();
    subir([foto("dos.jpg")]);

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: "una.jpg" }),
      expect.objectContaining({ name: "dos.jpg" }),
    ]);
  });

  it("con tres ya elegidas no ofrece agregar más", () => {
    render(<EvidenciasField archivos={[foto("1.jpg"), foto("2.jpg"), foto("3.jpg")]} onChange={vi.fn()} />);

    expect(screen.queryByText("Otra más")).not.toBeInTheDocument();
    expect(screen.getByText(/3 de 3/)).toBeInTheDocument();
  });

  /* El aviso que se pidió, palabra por palabra: es lo que le dice a la persona por qué su
     cuarta foto no entró. */
  it("avisa al intentar pasar de tres, y guarda las que sí caben", () => {
    const onChange = vi.fn();
    render(<EvidenciasField archivos={[foto("1.jpg"), foto("2.jpg")]} onChange={onChange} />);

    subir([foto("3.jpg"), foto("4.jpg")]);

    expect(screen.getByText("Solo puedes agregar un máximo de 3 imágenes.")).toBeInTheDocument();
    // La tercera sí entra; la cuarta se descarta.
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: "1.jpg" }),
      expect.objectContaining({ name: "2.jpg" }),
      expect.objectContaining({ name: "3.jpg" }),
    ]);
  });

  it("rechaza lo que el backend no acepta, diciendo qué archivo es", () => {
    const onChange = vi.fn();
    render(<EvidenciasField archivos={[]} onChange={onChange} />);

    subir([foto("contrato.pdf", "application/pdf")]);

    expect(screen.getByText(/"contrato\.pdf" no es una imagen/)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("rechaza una imagen demasiado pesada antes de intentar subirla", () => {
    const onChange = vi.fn();
    render(<EvidenciasField archivos={[]} onChange={onChange} />);

    subir([foto("enorme.jpg", "image/jpeg", 16)]);

    expect(screen.getByText(/"enorme\.jpg" pesa más de 15 MB/)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("se puede quitar una antes de enviar", () => {
    const onChange = vi.fn();
    render(<EvidenciasField archivos={[foto("una.jpg"), foto("dos.jpg")]} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Quitar una.jpg"));

    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: "dos.jpg" })]);
  });

  it("las ya guardadas cuentan para el máximo", () => {
    render(
      <EvidenciasField
        archivos={[]}
        onChange={vi.fn()}
        existentes={[
          { id: "1", url: "/u/1.jpg", tipo: "foto", descripcion: "" },
          { id: "2", url: "/u/2.jpg", tipo: "foto", descripcion: "" },
          { id: "3", url: "/u/3.jpg", tipo: "foto", descripcion: "" },
        ]}
      />
    );

    expect(screen.getByText(/3 de 3/)).toBeInTheDocument();
    expect(screen.queryByText("Otra más")).not.toBeInTheDocument();
  });

  it("en solo lectura se miran, no se tocan", () => {
    render(
      <EvidenciasField
        archivos={[]}
        onChange={vi.fn()}
        existentes={[{ id: "1", url: "/u/1.jpg", tipo: "foto", descripcion: "" }]}
        soloLectura
      />
    );

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.queryByText("Otra más")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Agregar evidencias")).not.toBeInTheDocument();
  });
});
