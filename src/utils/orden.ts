/**
 * Orden de los listados de gestión: lo creado más recientemente primero, para que un
 * registro recién dado de alta aparezca arriba y no haya que buscarlo al final de la lista.
 *
 * Se usa la fecha de creación que devuelva la API cuando está disponible. Si el backend no
 * la expone, se ordena por id descendente: en una tabla con id autoincremental un id mayor
 * significa dado de alta después, así que sigue siendo el dato del backend y no un
 * reordenamiento inventado en pantalla.
 */
export function compararPorRecientes(
  a: { id: string; fechaCreacion?: string },
  b: { id: string; fechaCreacion?: string },
): number {
  const fechaA = a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : NaN;
  const fechaB = b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : NaN;
  if (!Number.isNaN(fechaA) && !Number.isNaN(fechaB) && fechaA !== fechaB) {
    return fechaB - fechaA;
  }
  return Number(b.id) - Number(a.id);
}
