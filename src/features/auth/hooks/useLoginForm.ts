import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBER_KEY = "parku_remembered_email";

interface ValidationErrors {
  email?: string;
  password?: string;
}

/** Estado, validación en vivo (email/password) y envío del formulario de login. */
export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({ email: false, password: false });

  const navigate = useNavigate();
  const { login } = useAuth();
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Precarga el correo recordado
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
    emailInputRef.current?.focus();
  }, []);

  const validateEmail = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) {
      setErrors((prev) => ({ ...prev, email: "El correo electrónico es obligatorio" }));
      return false;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setErrors((prev) => ({ ...prev, email: "Ingresa un correo electrónico válido" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: undefined }));
    return true;
  };

  const validatePassword = (value: string): boolean => {
    if (!value) {
      setErrors((prev) => ({ ...prev, password: "La contraseña es obligatoria" }));
      return false;
    }
    if (value.length < 6) {
      setErrors((prev) => ({ ...prev, password: "La contraseña debe tener al menos 6 caracteres" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, password: undefined }));
    return true;
  };

  // Validaciones en tiempo real
  useEffect(() => {
    if (touched.email) validateEmail(email);
    if (touched.password) validatePassword(password);
  }, [email, password, touched]);

  const validateForm = (): boolean => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    setTouched({ email: true, password: true });
    return isEmailValid && isPasswordValid;
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") validateEmail(email);
    else validatePassword(password);
  };

  const handlePasswordKeyEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState && e.getModifierState("CapsLock"));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    const trimmedEmail = email.trim();
    setLoading(true);

    try {
      await login(trimmedEmail, password);

      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, trimmedEmail);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }

      toast.success("¡Bienvenido! Redirigiendo...");
      navigate("/app/dashboard");
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);

      const errorCode = error?.code;
      let mensaje = "Ocurrió un error inesperado. Intenta de nuevo.";

      switch (errorCode) {
        case "auth/user-not-found":
          mensaje = "No existe una cuenta con este correo.";
          break;
        case "auth/wrong-password":
          mensaje = "Contraseña incorrecta. Verifica tus credenciales.";
          break;
        case "auth/invalid-credential":
          mensaje = "Correo o contraseña incorrectos.";
          break;
        case "auth/invalid-email":
          mensaje = "El formato del correo no es válido.";
          break;
        case "auth/user-disabled":
          mensaje = "Esta cuenta ha sido deshabilitada. Contacta al administrador.";
          break;
        case "auth/too-many-requests":
          mensaje = "Demasiados intentos fallidos. Intenta más tarde.";
          break;
        case "auth/network-request-failed":
          mensaje = "Error de conexión. Verifica tu red e intenta de nuevo.";
          break;
        default:
          mensaje = error?.message || mensaje;
      }

      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const isEmailFormatValid = EMAIL_REGEX.test(email.trim());
  const isPasswordFormatValid = password.length >= 6;
  const isFormValid = isEmailFormatValid && isPasswordFormatValid;

  return {
    email, setEmail, password, setPassword, rememberMe, setRememberMe,
    showPassword, setShowPassword, capsLockOn, loading, errors, touched,
    emailInputRef, handleBlur, handlePasswordKeyEvent, handleLogin, isFormValid,
  };
}
