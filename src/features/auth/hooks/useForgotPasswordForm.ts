import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useUsuarios } from "@/features/usuarios";
import { useAuth } from "@/context/AuthContext";

// Corrección: antes solo se aceptaban correos "@sena.edu.co", pero el sistema
// también registra usuarios externos válidos (p. ej. "@ext.com") que quedaban
// sin forma de recuperar su contraseña. Se usa el mismo formato general que Login.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Referencia estable: evita que `usuarios` cambie de identidad en cada
// render mientras la query sigue sin datos (lo que rearmaría cualquier
// efecto/memo que dependiera de ella).
const EMPTY_USUARIOS: { correo: string }[] = [];

/** Formulario de recuperación: valida el correo contra usuarios reales y genera un enlace
 * de un solo uso (sin servidor de correo propio, se muestra directamente en pantalla). */
export function useForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const { data: usuarios = EMPTY_USUARIOS } = useUsuarios();
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
    // Corrección: valida que el correo pertenezca a un usuario registrado en
    // el sistema, igual que lo hace el login (antes se simulaba éxito con
    // cualquier correo, aunque no existiera ninguna cuenta con ese valor).
    else if (!usuarios.some((u) => u.correo.trim().toLowerCase() === trimmed)) {
      newErrors.email = "No existe una cuenta registrada con este correo";
    }

    return newErrors;
  }, [email, usuarios]);

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
      const token = await requestPasswordReset(email);
      setLoading(false);

      if (!token) {
        toast.error("No se pudo generar el enlace. Intenta de nuevo.");
        return;
      }

      setResetLink(`${window.location.origin}/reset-password?token=${token}`);
      setEmailSent(true);
      toast.success("Enlace de recuperación generado");
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
