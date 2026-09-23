import {
  validarTelefono,
  validarPassword,
  validarCorreo,
  validarNombrePersona,
  validarNumeroDocumento,
  NUMERO_DOCUMENTO_MIN,
  NUMERO_DOCUMENTO_MAX,
} from "@/utils/validation";
import {
  validarPlacaColombiana, validarPlacaPorTipo, tipoVehiculoDesdePlaca,
} from "@/features/conductores";
import type { Vehiculo } from "@/services/api/vehiculos";

export interface FormState {
  nombre: string;
  correo: string;
  numero: string;
  tipoDocumento: string;
  identificacion: string;
  /** Perfil SENA del conductor que se crea con el registro (catálogo del backend). */
  tipoUsuarioId: string;
  password: string;
  confirmPassword: string;
  aceptaTerminos: boolean;
  // Vehículo propio: obligatorio para poder registrarse (ver auth.controller.js::register en
  // el backend, que rechaza el registro completo sin él).
  vehiculoTipo: Vehiculo["tipo"];
  vehiculoPlaca: string;
  vehiculoMarca: string;
  vehiculoLinea: string;
  vehiculoModelo: string;
  vehiculoColor: string;
  vehiculoDescripcion: string;
}

export const emptyForm = (): FormState => ({
  nombre: "",
  correo: "",
  numero: "",
  tipoDocumento: "CC",
  identificacion: "",
  tipoUsuarioId: "",
  password: "",
  confirmPassword: "",
  aceptaTerminos: false,
  vehiculoTipo: "carro",
  vehiculoPlaca: "",
  vehiculoMarca: "",
  vehiculoLinea: "",
  vehiculoModelo: "",
  vehiculoColor: "",
  vehiculoDescripcion: "",
});

export interface ValidationErrors {
  nombre?: string;
  correo?: string;
  numero?: string;
  identificacion?: string;
  tipoUsuarioId?: string;
  password?: string;
  confirmPassword?: string;
  aceptaTerminos?: string;
  vehiculoPlaca?: string;
  vehiculoMarca?: string;
  vehiculoModelo?: string;
  vehiculoColor?: string;
}

/**
 * @param exigirTipoUsuario - Solo se exige elegir un tipo de usuario si su catálogo llegó a
 *   cargar. Si el endpoint falla, obligar a elegir una opción que no existe dejaría el
 *   formulario permanentemente inválido y nadie podría registrarse.
 */
export function validate(f: FormState, exigirTipoUsuario = false): ValidationErrors {
  const nextErrors: ValidationErrors = {};
  const numero = f.numero.trim();
  const identificacion = f.identificacion.trim();

  // Mismas reglas que Usuarios/Conductores/Perfil (utils/validation.ts): longitud, solo
  // letras en el nombre, correo con formato y tope de la columna.
  const errorNombre = validarNombrePersona(f.nombre);
  if (errorNombre) nextErrors.nombre = errorNombre;

  const errorCorreo = validarCorreo(f.correo);
  if (errorCorreo) nextErrors.correo = errorCorreo;

  // El teléfono es OPCIONAL (igual que en el backend y en el resto de formularios): mucha
  // gente no lo da, y bloquear el registro por eso no protege nada. Si se escribe, sí tiene
  // que ser válido -- un número a medias sería peor que ninguno.
  if (numero && !validarTelefono(numero)) {
    nextErrors.numero = "Ingresa un número de teléfono colombiano válido (10 dígitos)";
  }

  if (!identificacion) {
    nextErrors.identificacion = "El número de identificación es obligatorio";
  } else if (!validarNumeroDocumento(identificacion)) {
    nextErrors.identificacion = `El número de identificación debe tener entre ${NUMERO_DOCUMENTO_MIN} y ${NUMERO_DOCUMENTO_MAX} dígitos`;
  }

  // Los requisitos REALES de la API (longitud + mayúscula + minúscula + número): antes solo
  // se miraba la longitud y el backend rechazaba el registro al enviar.
  if (!f.password) {
    nextErrors.password = "La contraseña es obligatoria";
  } else {
    const errorPassword = validarPassword(f.password);
    if (errorPassword) nextErrors.password = errorPassword;
  }

  if (!f.confirmPassword) {
    nextErrors.confirmPassword = "Confirma tu contraseña";
  } else if (f.confirmPassword !== f.password) {
    nextErrors.confirmPassword = "Las contraseñas no coinciden";
  }

  if (exigirTipoUsuario && !f.tipoUsuarioId) {
    nextErrors.tipoUsuarioId = "Selecciona tu tipo de usuario";
  }

  if (!f.aceptaTerminos) {
    nextErrors.aceptaTerminos = "Debes aceptar los términos para continuar";
  }

  // Vehículo propio, obligatorio: sin él no se puede crear la cuenta (regla de negocio,
  // reflejada también en el backend -- ver auth.controller.js::register).
  const vehiculoPlaca = f.vehiculoPlaca.trim().toUpperCase();
  if (!vehiculoPlaca) {
    nextErrors.vehiculoPlaca = "La placa del vehículo es obligatoria";
  } else if (!validarPlacaColombiana(vehiculoPlaca)) {
    nextErrors.vehiculoPlaca = "Formato de placa inválido. Usa ABC123 (carro) o ABC12D / ABC12 (moto).";
  } else if (
    (f.vehiculoTipo === "carro" || f.vehiculoTipo === "moto") &&
    !validarPlacaPorTipo(vehiculoPlaca, f.vehiculoTipo)
  ) {
    const tipoDetectado = tipoVehiculoDesdePlaca(vehiculoPlaca);
    nextErrors.vehiculoPlaca = `Seleccionaste "${f.vehiculoTipo}", pero la placa tiene formato de ${tipoDetectado}.`;
  }

  if (!f.vehiculoMarca.trim()) nextErrors.vehiculoMarca = "La marca del vehículo es obligatoria";
  if (!f.vehiculoColor.trim()) nextErrors.vehiculoColor = "El color del vehículo es obligatorio";

  const vehiculoModelo = f.vehiculoModelo.trim();
  if (vehiculoModelo) {
    const anio = Number(vehiculoModelo);
    const anioMaximo = new Date().getFullYear() + 1;
    if (!Number.isInteger(anio) || anio < 1950 || anio > anioMaximo) {
      nextErrors.vehiculoModelo = `El modelo es el año del vehículo: entre 1950 y ${anioMaximo}`;
    }
  }

  return nextErrors;
}
