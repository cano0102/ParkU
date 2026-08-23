/**
 * Validaciones compartidas entre features. Antes vivían en
 * `features/parqueaderos/helpers.ts` (validación de placas) y
 * `features/usuarios/helpers.ts` (validación de campos de usuario), pero ya
 * eran importadas cruzado por otras features (`conductores`, `auth`,
 * `perfil`) — se centralizan aquí para que ese cruce sea contra una capa
 * compartida en vez de feature-a-feature.
 */

/* Placas colombianas — formatos vigentes (Resolución RUNT):
   · Automóviles / camperos / camionetas / servicio público: 3 letras + 3 números  → ABC123 (6 caracteres)
   · Motocicletas: 3 letras + 2 números + letra final opcional                     → ABC12D (6) o ABC12 (5, formato antiguo/gastado)
   No todas las motos tienen la letra final vigente: muchas placas antiguas o desgastadas
   solo muestran 3 letras + 2 números. Se admite ese formato de 5 caracteres para moto sin
   perder la distinción con carro, ya que una placa de carro siempre tiene 6 caracteres y
   termina en número, mientras que una placa de moto de 6 caracteres siempre termina en letra. */
export const PLACA_CARRO_REGEX = /^[A-Z]{3}[0-9]{3}$/;
export const PLACA_MOTO_REGEX = /^[A-Z]{3}[0-9]{2}[A-Z]?$/;
export const PLACA_REGEX = /^([A-Z]{3}[0-9]{3}|[A-Z]{3}[0-9]{2}[A-Z]?)$/;

export const validarPlacaColombiana = (p: string) => PLACA_REGEX.test(p.trim().toUpperCase());
export const validarPlacaCarro = (p: string) => PLACA_CARRO_REGEX.test(p.trim().toUpperCase());
export const validarPlacaMoto = (p: string) => PLACA_MOTO_REGEX.test(p.trim().toUpperCase());

/** Determina si una placa válida corresponde a carro o a moto según su formato. */
export const tipoVehiculoDesdePlaca = (p: string): "carro" | "moto" | null => {
  const v = p.trim().toUpperCase();
  if (PLACA_CARRO_REGEX.test(v)) return "carro";
  if (PLACA_MOTO_REGEX.test(v)) return "moto";
  return null;
};

/** Valida una placa exigiendo que su formato coincida con el tipo de celda/vehículo.
 *  Las celdas de movilidad reducida aceptan tanto formato de carro como de moto. */
export const validarPlacaPorTipo = (p: string, tipo: "carro" | "moto" | "movilidad reducida"): boolean => {
  const v = p.trim().toUpperCase();
  if (tipo === "carro") return PLACA_CARRO_REGEX.test(v);
  if (tipo === "moto") return PLACA_MOTO_REGEX.test(v);
  return PLACA_CARRO_REGEX.test(v) || PLACA_MOTO_REGEX.test(v);
};

export const esPlacaOficial = (placa: string) => /^(SNA|OFI)/.test(placa.trim().toUpperCase());

/* ============================================================
   VALIDACIÓN DE CAMPOS DE USUARIO
============================================================ */
export const NOMBRE_MIN = 3;
export const NOMBRE_MAX = 100;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;
export const TELEFONO_REGEX = /^[0-9()+\-\s]{7,15}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
