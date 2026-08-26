import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { quitarDigitos } from "@/utils/validation";
import { emptyForm, validate, type FormState, type ValidationErrors } from "../lib/registerForm";

/** Tiempo de pausa sin escribir antes de revelar la validación de un campo. */
const VALIDATION_DEBOUNCE_MS = 600;

/** Estado, validación en vivo y envío del formulario de registro. */
export function useRegisterForm() {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [dirty, setDirty] = useState<Partial<Record<keyof FormState, boolean>>>({});

  const navigate = useNavigate();
  const { register } = useAuth();

  const set = (field: keyof FormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty((d) => ({ ...d, [field]: true }));
  };

  const setNombre = (raw: string) => {
    set("nombre", quitarDigitos(raw));
  };

  const setTelefono = (raw: string) => {
    set("numero", raw.replace(/[^0-9()+\-\s]/g, ""));
  };

  const setIdentificacion = (raw: string) => {
    set("identificacion", raw.replace(/[^0-9]/g, ""));
  };

  // Validación en tiempo real: se recalcula en cada cambio del formulario;
  // la visibilidad de cada mensaje se sigue controlando con `touched` (ver `err`).
  useEffect(() => {
    setErrors(validate(form));
  }, [form]);

  // Al dejar de escribir (pausa sin cambios), revela la validación de los
  // campos que el usuario ya editó — sin esperar a que salga del campo (blur)
  // ni a que intente enviar el formulario.
  useEffect(() => {
    const timer = setTimeout(() => {
      setTouched((prev) => ({ ...prev, ...dirty }));
    }, VALIDATION_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [form, dirty]);

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);
    setTouched({
      nombre: true,
      correo: true,
      numero: true,
      identificacion: true,
      tipoUsuario: true,
      password: true,
      confirmPassword: true,
      aceptaTerminos: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    setLoading(true);

    try {
      await register({
        correo: form.correo.trim(),
        password: form.password,
        nombre: form.nombre.trim(),
        numero: form.numero.trim(),
        tipoUsuario: (form.tipoUsuario || "otro") as "visitante" | "estudiante" | "docente" | "administrativo" | "otro",
        tipoDocumento: form.tipoDocumento,
        identificacion: form.identificacion.trim(),
      });

      toast.success("¡Cuenta creada correctamente! Bienvenido a ParkU.");
      navigate("/app/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "No se pudo crear la cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const err = (field: keyof ValidationErrors) => (touched[field] ? errors[field] : undefined);

  return {
    form,
    set,
    setNombre,
    setTelefono,
    setIdentificacion,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    errors,
    handleBlur,
    handleSubmit,
    err,
  };
}
