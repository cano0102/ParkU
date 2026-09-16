import {
  validarTelefono,
  validarPassword,
  validarCorreo,
  validarNombrePersona,
  validarNumeroDocumento,
  NUMERO_DOCUMENTO_MIN,
  NUMERO_DOCUMENTO_MAX,
} from "@/utils/validation";

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

  return nextErrors;
}
