import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Corrección: antes solo se aceptaban correos "@sena.edu.co", pero el sistema
// también registra usuarios externos válidos (p. ej. "@ext.com") que quedaban
// sin forma de recuperar su contraseña. Se usa el mismo formato general que Login.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Formulario de recuperación: valida solo el FORMATO del correo (nunca si existe una cuenta)
 * y le pide al backend que envíe el enlace de un solo uso POR CORREO
 * (`POST /auth/recuperar-password`). El backend responde igual exista o no la cuenta, para no
 * permitir enumerar correos, así que la pantalla de éxito tampoco lo distingue: dice "si el
 * correo tiene una cuenta, te enviamos el enlace".
 *
 * Antes la pantalla de éxito decía que el enlace "se muestra aquí" porque no había servidor de
 * correo, pero el backend nunca devuelve el token: la persona se quedaba sin enlace y sin la
 * indicación de revisar su correo. Y si la petición fallaba (sin conexión, demasiados intentos
 * seguidos), el botón se quedaba en "Generando..." para siempre. */
export function useForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [touched, setTouched] = useState(false);
  const { requestPasswordReset } = useAuth();

  // Validación en tiempo real: se recalcula en cada cambio; la visibilidad
  // del mensaje se controla con `touched` (ver el componente del formulario).
  const errors = useMemo((): { email?: string } => {
    const newErrors: { email?: string } = {};
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      newErrors.email = "El correo electrónico es obligatorio";
    } else if (!EMAIL_REGEX.test(trimmed)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }

    return newErrors;
  }, [email]);

  const validateForm = (): boolean => {
    setTouched(true);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores del formulario");
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      setEmailSent(true);
    } catch (error) {
      // Un fallo real (red caída, 429 por demasiadas solicitudes seguidas, 500). No revela si
      // la cuenta existe: para un correo sin cuenta el backend responde 200 igual.
      toast.error(error instanceof Error && error.message ? error.message : "No se pudo enviar el enlace. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  /** Vuelve al formulario con el mismo correo, para pedir otro enlace. */
  const volverAEnviar = () => setEmailSent(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const visibleErrors = touched ? errors : {};

  return { email, loading, emailSent, errors: visibleErrors, handleSubmit, handleEmailChange, handleBlur, volverAEnviar };
}
