import type { Vehiculo } from "@/services/api/vehiculos";

/**
 * Marcas que más ruedan en Colombia, para sugerir mientras se escribe. Es una lista de
 * AYUDA, no un catálogo cerrado: el campo sigue aceptando cualquier texto, porque siempre
 * aparecerá una marca que no esté aquí y nadie debería quedarse sin poder registrar su
 * vehículo por eso.
 *
 * Van en el frontend a propósito: no son un dato del negocio (la tabla `vehiculo` guarda la
 * marca como texto libre), así que no justifican una tabla ni un endpoint.
 */
export const MARCAS_CARRO = [
  "Chevrolet", "Renault", "Mazda", "Toyota", "Nissan", "Kia", "Hyundai", "Suzuki", "Ford",
  "Volkswagen", "Honda", "Mitsubishi", "Peugeot", "Citroën", "Jeep", "Fiat", "BMW",
  "Mercedes-Benz", "Audi", "Subaru", "Chery", "JAC", "Changan", "BYD", "MG", "Great Wall",
  "Volvo", "Land Rover", "Dodge", "SsangYong", "Foton", "DFSK", "Škoda", "Mini", "Porsche",
] as const;

export const MARCAS_MOTO = [
  "Bajaj", "AKT", "Yamaha", "Honda", "Suzuki", "Victory", "TVS", "Hero", "KTM", "Kawasaki",
  "Benelli", "Royal Enfield", "Kymco", "CFMoto", "UM", "SYM", "Ducati", "BMW",
  "Harley-Davidson", "Vento", "Starker", "Ayco", "Aprilia", "Triumph", "Piaggio", "Auteco",
] as const;

/** Las marcas que tiene sentido sugerir para ese tipo de vehículo. */
export function marcasDe(tipo: Vehiculo["tipo"]): readonly string[] {
  if (tipo === "moto") return MARCAS_MOTO;
  if (tipo === "carro") return MARCAS_CARRO;
  // Los tipos históricos (bicicleta, camión, bus) ya no se registran; si aparece uno, se
  // ofrecen las de carro antes que dejar el campo sin ayuda.
  return MARCAS_CARRO;
}

/** Sin tildes y en minúsculas, para que "citroen" encuentre "Citroën". */
const normalizar = (texto: string) =>
  texto.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/**
 * Marcas sugeridas para lo que se lleva escrito. Con el campo vacío se ofrecen las primeras,
 * que es lo que hace útil el desplegable al entrar; con texto, las que lo contengan.
 * Se corta a 8: una lista más larga deja de leerse.
 */
export function sugerirMarcas(tipo: Vehiculo["tipo"], escrito: string, limite = 8): string[] {
  const q = normalizar(escrito);
  const todas = marcasDe(tipo);
  if (!q) return [...todas].slice(0, limite);
  const empiezan = todas.filter((m) => normalizar(m).startsWith(q));
  const contienen = todas.filter((m) => !normalizar(m).startsWith(q) && normalizar(m).includes(q));
  return [...empiezan, ...contienen].slice(0, limite);
}
