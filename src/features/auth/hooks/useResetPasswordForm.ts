import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { validarPassword, PASSWORD_MIN, PASSWORD_MAX } from "@/utils/validation";

/** Formulario de nueva contraseña a partir de un token de recuperación de un solo uso. */
export function useResetPasswordForm() {
  const navigate = useNavigate();
  const { resetPasswordWithToken } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ password?: boolean; confirmPassword?: boolean }>({});

  // Mismos requisitos que exige la API al crear la cuenta (ver validarPassword): antes aquí
  // solo se miraba la longitud y el backend rechazaba la nueva contraseña al enviar.
  const errorPassword = password ? validarPassword(password) : "La contraseña es obligatoria";
  const passwordOk = errorPassword === null;
  const passwordLengthOk = password.length >= PASSWORD_MIN && password.length <= PASSWORD_MAX;
  const passwordComplejaOk = /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch = !!password && password === confirmPassword;
  const puedeEnviar = passwordOk && passwordsMatch;

  // Validación en tiempo real: se recalcula en cada cambio; la visibilidad
  // de cada mensaje se controla con `touched`.
  const errors = {
    password: errorPassword ?? undefined,
    confirmPassword: !confirmPassword
      ? "Confirma tu nueva contraseña"
      : !passwordsMatch
      ? "Las contraseñas no coinciden"
      : undefined,
  };

  const handleBlur = (field: "password" | "confirmPassword") => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const err = (field: "password" | "confirmPassword") => (touched[field] ? errors[field] : undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ password: true, confirmPassword: true });

    if (!token) {
      toast.error("Enlace inválido o expirado");
      return;
    }

    if (errorPassword) {
      toast.error(errorPassword);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const resultado = await resetPasswordWithToken(token, password);
    setLoading(false);

    if (!resultado.ok) {
      toast.error(resultado.message || "El enlace expiró o es inválido");
      return;
    }

    toast.success("Contraseña actualizada correctamente");
    navigate("/login");
  };

  return {
    password, setPassword, confirmPassword, setConfirmPassword,
    showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword,
    loading, passwordLengthOk, passwordComplejaOk, passwordsMatch, puedeEnviar, handleSubmit,
    err, handleBlur,
  };
}
