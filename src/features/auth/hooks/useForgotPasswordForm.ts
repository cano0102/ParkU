import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { TIPOS_DOCUMENTO, NUMERO_DOCUMENTO_MAX, validarNumeroDocumento } from "@/utils/validation";

// Corrección: antes solo se aceptaban correos "@sena.edu.co", pero el sistema
// también registra usuarios externos válidos (p. ej. "@ext.com") que quedaban
// sin forma de recuperar su contraseña. Se usa el mismo formato general que Login.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Formulario de recuperación: verifica la identidad de la persona con datos que ya tiene
 * el sistema (correo, tipo/número de documento y nombre) -- sin enviar nada por correo ni
 * SMS. Si los datos coinciden con una cuenta (`POST /auth/verificar-identidad`), el backend
 * entrega un token de recuperación en la misma respuesta y se navega directo a la pantalla
 * de nueva contraseña con ese token. Si no coinciden, el backend lo dice explícitamente
 * (a diferencia del flujo por correo, aquí no hay forma de responder "puede que sí, puede
 * que no": es el precio de no depender de un canal externo). */
export function useForgotPasswordForm() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<string>(TIPOS_DOCUMENTO[0]);
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { verificarIdentidad } = useAuth();

  // Validación en tiempo real: se recalcula en cada cambio; la visibilidad
  // de cada mensaje se controla con `touched` (ver el componente del formulario).
  const errors = useMemo(() => {
    const newErrors: { correo?: string; numeroDocumento?: string; nombre?: string } = {};
    const correoTrim = correo.trim().toLowerCase();

    if (!correoTrim) {
      newErrors.correo = "El correo electrónico es obligatorio";
    } else if (!EMAIL_REGEX.test(correoTrim)) {
      newErrors.correo = "Ingresa un correo electrónico válido";
    }

    if (!numeroDocumento.trim()) {
      newErrors.numeroDocumento = "El número de documento es obligatorio";
    } else if (!validarNumeroDocumento(numeroDocumento)) {
      newErrors.numeroDocumento = "Ingresa un número de documento válido";
    }

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre completo es obligatorio";
    }

    return newErrors;
  }, [correo, numeroDocumento, nombre]);

  const validateForm = (): boolean => {
    setTouched({ correo: true, numeroDocumento: true, nombre: true });
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
      const token = await verificarIdentidad({ correo, tipoDocumento, numeroDocumento, nombre });
      navigate(`/reset-password?token=${encodeURIComponent(token)}`);
    } catch (error) {
      toast.error(error instanceof Error && error.message ? error.message : "No se pudo verificar tu identidad. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCorreoChange = (e: React.ChangeEvent<HTMLInputElement>) => setCorreo(e.target.value);
  const handleTipoDocumentoChange = (value: string) => setTipoDocumento(value);
  // Solo dígitos y como mucho diez: el mismo formato que valida validarNumeroDocumento.
  const handleNumeroDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNumeroDocumento(e.target.value.replace(/\D/g, "").slice(0, NUMERO_DOCUMENTO_MAX));
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value);

  const handleBlur = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const visibleErrors = {
    correo: touched.correo ? errors.correo : undefined,
    numeroDocumento: touched.numeroDocumento ? errors.numeroDocumento : undefined,
    nombre: touched.nombre ? errors.nombre : undefined,
  };

  return {
    correo, tipoDocumento, numeroDocumento, nombre,
    loading, errors: visibleErrors,
    handleSubmit, handleCorreoChange, handleTipoDocumentoChange, handleNumeroDocumentoChange, handleNombreChange, handleBlur,
  };
}
