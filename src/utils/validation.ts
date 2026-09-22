/**
 * Validaciones compartidas entre features. Antes vivían en
 * `features/parqueaderos/lib/helpers.ts` (validación de placas) y
 * `features/usuarios/lib/helpers.ts` (validación de campos de usuario), pero ya
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
export const PASSWORD_MAX = 16;
/**
 * Requisitos REALES de la API para una contraseña, comprobados contra
 * `POST /api/auth/registro`, que responde 400 con estos mismos mensajes:
 * mínimo 8 caracteres, y al menos una mayúscula, una minúscula y un número.
 *
 * El front solo validaba la longitud, así que una contraseña como "clave123"
 * pasaba el formulario y el backend la rechazaba al enviar — el usuario veía un
 * error de validación y la cuenta no llegaba a crearse. Devuelve el mensaje a
 * mostrar, o `null` si la contraseña es válida.
 */
export const PASSWORD_REQUISITOS = `${PASSWORD_MIN}-${PASSWORD_MAX} caracteres`;
/** Detalle de los requisitos, para mostrar bajo el campo (no cabe bien junto al label). */
export const PASSWORD_AYUDA = "Debe incluir mayúscula, minúscula y número.";

export const validarPassword = (valor: string): string | null => {
  if (valor.length < PASSWORD_MIN) return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`;
  if (valor.length > PASSWORD_MAX) return `La contraseña no puede superar ${PASSWORD_MAX} caracteres`;
  if (!/[A-Z]/.test(valor)) return "La contraseña debe tener al menos una mayúscula";
  if (!/[a-z]/.test(valor)) return "La contraseña debe tener al menos una minúscula";
  if (!/[0-9]/.test(valor)) return "La contraseña debe tener al menos un número";
  return null;
};

export const TELEFONO_REGEX = /^[0-9()+\-\s]{7,15}$/;

/** Un teléfono colombiano son 10 dígitos exactos: ese es el tope del campo. */
export const TELEFONO_MAX = 10;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Colombia (numeración unificada a 10 dígitos desde 2021): valida que, ignorando
 *  espacios/paréntesis/guiones que el usuario haya usado para separar el número,
 *  queden exactamente 10 dígitos y no empiece en 0 (ningún indicativo ni celular
 *  real arranca así). `TELEFONO_REGEX` por sí sola solo exigía "7 a 15 caracteres
 *  entre dígitos y separadores", lo que aceptaba como válido cualquier relleno de
 *  dígitos repetidos (p. ej. "0000000000") sin que fuera un teléfono real. */
export const validarTelefono = (valor: string): boolean => {
  const soloDigitos = valor.replace(/\D/g, "");
  return /^[1-9]\d{9}$/.test(soloDigitos);
};

/** Quita dígitos de un campo de nombre de persona a medida que se escribe (nombres no llevan números). */
export const quitarDigitos = (valor: string): string => valor.replace(/[0-9]/g, "");

/**
 * Filtra un campo de teléfono a medida que se escribe: solo dígitos, y como mucho los diez
 * que tiene un número colombiano. Antes admitía separadores (espacios, guiones, paréntesis)
 * y hasta 15 caracteres, lo que dejaba escribir cosas que `validarTelefono` iba a rechazar
 * después — ahora el campo solo deja teclear lo que de verdad se puede guardar.
 */
export const filtrarTelefono = (valor: string): string => valor.replace(/\D/g, "").slice(0, TELEFONO_MAX);

/** Tipos de documento reales (ENUM `conductor.tipo_documento` en la API) — un
 *  valor fuera de este set no corresponde a ningún conductor posible. */
export const TIPOS_DOCUMENTO = ["CC", "CE", "TI", "PASAPORTE", "PEP", "NIT"] as const;

/** Un documento de identidad colombiano (CC/CE/TI/PEP/NIT) va de 6 a 10 dígitos — el campo ya
 *  solo admite dígitos (ver DatosConductorFields.tsx), así que lo único que falta acotar es la
 *  longitud: fuera de ese rango casi con certeza es un error de tecleo (un dígito de más o de
 *  menos), no un documento real. */
export const NUMERO_DOCUMENTO_MIN = 6;
export const NUMERO_DOCUMENTO_MAX = 10;
export const NUMERO_DOCUMENTO_REGEX = /^[0-9]{6,10}$/;
export const validarNumeroDocumento = (valor: string): boolean => NUMERO_DOCUMENTO_REGEX.test(valor.trim());

/* ============================================================
   TEXTO LIBRE: LIMPIEZA Y LÍMITES
============================================================ */

/**
 * Deja un texto listo para validar y guardar: sin espacios sobrantes, sin caracteres de
 * control ni invisibles (que llegan al pegar desde otros programas y rompen búsquedas y
 * comparaciones) y, si se indica, recortado a `max`. NO escapa HTML: React ya escapa al
 * pintar, y el backend es quien decide cómo almacena.
 */
export const limpiarTexto = (valor: string, max?: number): string => {
  // eslint-disable-next-line no-control-regex -- justamente se quieren quitar los de control.
  const limpio = valor.replace(/[\x00-\x1F\x7F\u200B-\u200D\uFEFF]/g, "").replace(/\s+/g, " ").trim();
  return max ? limpio.slice(0, max) : limpio;
};

/** Correo: el tope es el de la columna en la API (VARCHAR(100)). */
export const CORREO_MAX = 100;
export const validarCorreo = (valor: string, obligatorio = true): string | null => {
  const correo = valor.trim();
  if (!correo) return obligatorio ? "El correo es obligatorio" : null;
  if (correo.length > CORREO_MAX) return `El correo no puede superar ${CORREO_MAX} caracteres`;
  if (!EMAIL_REGEX.test(correo)) return "Ingresa un correo electrónico válido";
  return null;
};

/** Nombre de persona: letras (con tildes/ñ/ü), espacios, apóstrofo, guion y punto. Nada de
 *  dígitos ni símbolos: un "Juan<script>" o un "1234" no es un nombre de nadie. */
export const NOMBRE_PERSONA_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ'.\- ]*$/;
export const validarNombrePersona = (valor: string): string | null => {
  const nombre = limpiarTexto(valor);
  if (!nombre) return "El nombre es obligatorio";
  if (nombre.length < NOMBRE_MIN) return `El nombre debe tener al menos ${NOMBRE_MIN} caracteres`;
  if (nombre.length > NOMBRE_MAX) return `El nombre no puede superar ${NOMBRE_MAX} caracteres`;
  if (!NOMBRE_PERSONA_REGEX.test(nombre)) return "El nombre solo puede tener letras, espacios, apóstrofos o guiones";
  return null;
};

/* ============================================================
   VEHÍCULO
============================================================ */
export const MARCA_MAX = 40;
export const LINEA_MAX = 40;
export const COLOR_MAX = 30;
export const DESCRIPCION_VEHICULO_MAX = 200;
/** En Colombia el "modelo" de un vehículo ES su año; antes de 1950 no circula nada con placa
 *  vigente y el año que viene es lo más lejos que se matricula. */
export const MODELO_ANIO_MIN = 1950;
export const modeloAnioMax = () => new Date().getFullYear() + 1;
export const validarModeloVehiculo = (valor: string): string | null => {
  const modelo = valor.trim();
  if (!modelo) return null;
  const anio = Number(modelo);
  if (!/^\d{4}$/.test(modelo) || anio < MODELO_ANIO_MIN || anio > modeloAnioMax()) {
    return `El modelo es el año del vehículo: entre ${MODELO_ANIO_MIN} y ${modeloAnioMax()}`;
  }
  return null;
};

/** "La marca es obligatoria" / "El color es obligatorio": la concordancia la decide el artículo
 *  con el que llega la etiqueta. */
const obligatorioSegun = (etiqueta: string) => (/^la /i.test(etiqueta) ? "obligatoria" : "obligatorio");

/** Marca, línea y color son texto corto: letras, dígitos y algún separador ("Mercedes-Benz",
 *  "Boxer 150", "Gris plata"). Sin símbolos raros ni saltos de línea. */
export const TEXTO_CORTO_REGEX = /^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ][A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ.\-/&() ]*$/;
export const validarTextoCorto = (valor: string, etiqueta: string, max: number, obligatorio: boolean): string | null => {
  const texto = limpiarTexto(valor);
  if (!texto) return obligatorio ? `${etiqueta} es ${obligatorioSegun(etiqueta)}` : null;
  if (texto.length > max) return `${etiqueta} no puede superar ${max} caracteres`;
  if (!TEXTO_CORTO_REGEX.test(texto)) return `${etiqueta} tiene caracteres no permitidos`;
  return null;
};

/* ============================================================
   TEXTO LARGO: MOTIVOS Y DESCRIPCIONES
============================================================ */
/** Un motivo o descripción de una sola palabra no le sirve a quien lo lee para decidir. */
export const MOTIVO_MIN = 5;
export const MOTIVO_MAX = 250;
export const DESCRIPCION_MIN = 10;
export const DESCRIPCION_MAX = 500;

export const validarTextoLargo = (
  valor: string,
  etiqueta: string,
  { min, max, obligatorio = true }: { min: number; max: number; obligatorio?: boolean },
): string | null => {
  const texto = limpiarTexto(valor);
  if (!texto) return obligatorio ? `${etiqueta} es ${obligatorioSegun(etiqueta)}` : null;
  if (texto.length < min) return `${etiqueta} debe tener al menos ${min} caracteres`;
  if (texto.length > max) return `${etiqueta} no puede superar ${max} caracteres`;
  return null;
};
