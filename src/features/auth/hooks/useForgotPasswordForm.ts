import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Corrección: antes solo se aceptaban correos "@sena.edu.co", pero el sistema
// también registra usuarios externos válidos (p. ej. "@ext.com") que quedaban
// sin forma de recuperar su contraseña. Se usa el mismo formato general que Login.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Formulario de recuperación: solo valida el FORMATO del correo (nunca si existe una cuenta
 * con ese valor) y genera un enlace de un solo uso (sin servidor de correo propio, se muestra
 * directamente en pantalla). Antes esto llamaba a `GET /usuarios` — el listado completo de
 * cuentas — desde esta pantalla pública sin sesión, solo para decirle a cualquier visitante si
 * un correo existía o no en el sistema (enumeración de cuentas, y de paso una fuga de PII si esa
 * ruta no exige auth estricta en el backend). `requestPasswordReset` ya está diseñado para no
 * revelar esto — devuelve un token solo fuera de producción y `null` en cualquier otro caso sin
 * distinguir "no existe" de "existe pero no se muestra" (ver services/api/auth.ts) — así que la
 * validación de existencia se elimina del todo en vez de duplicarla de forma insegura acá. */
export function useForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
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

    // Sin servidor de correo propio, el "envío" se simula: se genera un
    // enlace de recuperación real (token de un solo uso, 30 min de validez)
    // y se muestra directamente en pantalla en vez de despacharlo a un correo.
    setTimeout(async () => {
      // `null` no es un error: es el comportamiento normal en producción (el backend no
      // confirma si el correo existe, para no permitir enumerar cuentas) — tratarlo como un
      // fallo real revelaría por otra vía la misma información que se intenta ocultar
      // (un correo que "sí funciona" tendría link, uno que "falla" no existiría). Se avanza
      // igual a la pantalla de éxito en ambos casos; `ForgotPasswordSuccess` ya sabe ocultar
      // la caja del enlace cuando `resetLink` es `null`.
      const token = await requestPasswordReset(email);
      setLoading(false);
      setResetLink(token ? `${window.location.origin}/reset-password?token=${token}` : null);
      setEmailSent(true);
    }, 700);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const visibleErrors = touched ? errors : {};

  return { email, loading, emailSent, resetLink, errors: visibleErrors, handleSubmit, handleEmailChange, handleBlur };
}
