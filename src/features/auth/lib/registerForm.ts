import {
  NOMBRE_MIN,
  NOMBRE_MAX,
  PASSWORD_MIN,
  PASSWORD_MAX,
  validarTelefono,
  EMAIL_REGEX,
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
  const nombre = f.nombre.trim();
  const correo = f.correo.trim();
  const numero = f.numero.trim();
  const identificacion = f.identificacion.trim();

  if (!nombre) {
    nextErrors.nombre = "El nombre es obligatorio";
  } else if (nombre.length < NOMBRE_MIN) {
    nextErrors.nombre = `El nombre debe tener al menos ${NOMBRE_MIN} caracteres`;
  } else if (nombre.length > NOMBRE_MAX) {
    nextErrors.nombre = `El nombre no puede superar ${NOMBRE_MAX} caracteres`;
  }

  if (!correo) {
    nextErrors.correo = "El correo electrónico es obligatorio";
  } else if (!EMAIL_REGEX.test(correo)) {
    nextErrors.correo = "Ingresa un correo electrónico válido";
  }

  // El teléfono es OPCIONAL (igual que en el backend y en el resto de formularios): mucha
  // gente no lo da, y bloquear el registro por eso no protege nada. Si se escribe, sí tiene
  // que ser válido -- un número a medias sería peor que ninguno.
  if (numero && !validarTelefono(numero)) {
    nextErrors.numero = "Ingresa un número de teléfono colombiano válido (10 dígitos)";
  }

  if (!identificacion) {
    nextErrors.identificacion = "El número de identificación es obligatorio";
  } else if (identificacion.length < 6) {
    nextErrors.identificacion = "El número de identificación debe tener al menos 6 dígitos";
  }

  if (!f.password) {
    nextErrors.password = "La contraseña es obligatoria";
  } else if (f.password.length < PASSWORD_MIN || f.password.length > PASSWORD_MAX) {
    nextErrors.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`;
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
