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
  tipoUsuario: "" | "visitante" | "estudiante" | "docente" | "administrativo" | "otro";
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
  tipoUsuario: "",
  password: "",
  confirmPassword: "",
  aceptaTerminos: false,
});

export interface ValidationErrors {
  nombre?: string;
  correo?: string;
  numero?: string;
  identificacion?: string;
  tipoUsuario?: string;
  password?: string;
  confirmPassword?: string;
  aceptaTerminos?: string;
}

export function validate(f: FormState): ValidationErrors {
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

  if (!numero) {
    nextErrors.numero = "El teléfono es obligatorio";
  } else if (!validarTelefono(numero)) {
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

  if (!f.tipoUsuario) {
    nextErrors.tipoUsuario = "Selecciona cómo te identificas";
  }

  if (!f.aceptaTerminos) {
    nextErrors.aceptaTerminos = "Debes aceptar los términos para continuar";
  }

  return nextErrors;
}
