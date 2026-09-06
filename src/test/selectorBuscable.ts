import { screen, within } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";

type Usuario = ReturnType<typeof userEvent.setup>;

/**
 * Elige una opción en un {@link SelectorBuscable}: escribe para filtrar y pulsa la sugerencia.
 *
 * Los campos que antes eran un `select` ahora se buscan escribiendo, así que una prueba no
 * puede usar `selectOptions` con ellos. Esto encapsula los tres pasos (abrir si ya había algo
 * elegido, escribir, elegir) para que las pruebas sigan leyéndose como una intención y no como
 * una secuencia de clics.
 *
 * @param usuario  El `userEvent` de la prueba.
 * @param etiqueta El nombre del campo, tal cual se lee en pantalla ("Encargado", "Celda"…).
 * @param texto    Lo que se escribe para filtrar; también sirve para reconocer la opción.
 * @param opcion   El texto exacto de la sugerencia, si no coincide con `texto`.
 */
export async function elegirEnBuscador(
  usuario: Usuario,
  etiqueta: string,
  texto: string,
  opcion = texto,
) {
  // Con algo ya elegido el buscador está recogido: hay que abrirlo primero.
  const cambiar = screen.queryByRole("button", { name: `Cambiar ${etiqueta.toLowerCase()}` });
  if (cambiar) await usuario.click(cambiar);

  await usuario.type(screen.getByLabelText(etiqueta), texto);

  const lista = screen.getByRole("listbox", { name: `Sugerencias de ${etiqueta}` });
  await usuario.click(within(lista).getByText(opcion));
}
