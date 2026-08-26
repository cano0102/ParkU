import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { existeCorreo, existeDocumento, existeNumero } from "@/services/api/auth";
import { filtrarTelefono, quitarDigitos } from "@/utils/validation";
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
  // Errores de disponibilidad (correo/número ya registrados) — se consultan
  // al backend aparte de `errors` porque requieren una llamada de red, no se
  // pueden derivar solo del `form` como el resto de la validación.
  const [asyncErrors, setAsyncErrors] = useState<{ correo?: string; numero?: string; identificacion?: string }>({});
  const [checkingCorreo, setCheckingCorreo] = useState(false);
  const [checkingNumero, setCheckingNumero] = useState(false);
  const [checkingDocumento, setCheckingDocumento] = useState(false);
  const correoCheckId = useRef(0);
  const numeroCheckId = useRef(0);
  const documentoCheckId = useRef(0);

  const navigate = useNavigate();
  const { register } = useAuth();

  const set = (field: keyof FormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty((d) => ({ ...d, [field]: true }));
    // El resultado de disponibilidad ya consultado quedó obsoleto: se vuelve
    // a pedir tras la próxima pausa (ver el efecto de abajo).
    if (field === "correo" || field === "numero") {
      setAsyncErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // tipoDocumento e identificacion comparten un solo chequeo (documento =
    // tipo + número), así que cualquiera de los dos invalida el resultado.
    if (field === "tipoDocumento" || field === "identificacion") {
      setAsyncErrors((prev) => ({ ...prev, identificacion: undefined }));
    }
  };

  const setNombre = (raw: string) => {
    set("nombre", quitarDigitos(raw));
  };

  const setTelefono = (raw: string) => {
    set("numero", filtrarTelefono(raw));
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
  // ni a que intente enviar el formulario. De paso, si correo/número ya
  // pasan su propia validación de formato, chequea contra el backend si ya
  // están registrados (también en tiempo real, no solo al enviar).
  useEffect(() => {
    const timer = setTimeout(() => {
      setTouched((prev) => ({ ...prev, ...dirty }));

      const syncErrors = validate(form);

      if (dirty.correo && !syncErrors.correo) {
        const id = ++correoCheckId.current;
        const correo = form.correo.trim();
        setCheckingCorreo(true);
        existeCorreo(correo)
          .then((existe) => {
            if (id !== correoCheckId.current) return; // respuesta obsoleta
            setAsyncErrors((prev) => ({ ...prev, correo: existe ? "Este correo ya está registrado" : undefined }));
          })
          .catch(() => {})
          .finally(() => {
            if (id === correoCheckId.current) setCheckingCorreo(false);
          });
      }

      if (dirty.numero && !syncErrors.numero) {
        const id = ++numeroCheckId.current;
        const numero = form.numero.trim();
        setCheckingNumero(true);
        existeNumero(numero)
          .then((existe) => {
            if (id !== numeroCheckId.current) return;
            setAsyncErrors((prev) => ({ ...prev, numero: existe ? "Este número ya está registrado" : undefined }));
          })
          .catch(() => {})
          .finally(() => {
            if (id === numeroCheckId.current) setCheckingNumero(false);
          });
      }

      // El documento depende de dos campos (tipo + número): cualquiera de
      // los dos que haya cambiado dispara el chequeo.
      if ((dirty.identificacion || dirty.tipoDocumento) && !syncErrors.identificacion && form.tipoDocumento) {
        const id = ++documentoCheckId.current;
        const tipoDocumento = form.tipoDocumento;
        const identificacion = form.identificacion.trim();
        setCheckingDocumento(true);
        existeDocumento(tipoDocumento, identificacion)
          .then((existe) => {
            if (id !== documentoCheckId.current) return;
            setAsyncErrors((prev) => ({ ...prev, identificacion: existe ? "Este documento ya está registrado" : undefined }));
          })
          .catch(() => {})
          .finally(() => {
            if (id === documentoCheckId.current) setCheckingDocumento(false);
          });
      }
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

    // Ya sabemos (por el chequeo en tiempo real) que el correo o el número
    // están en uso: no hace falta esperar la respuesta del servidor para
    // avisar. `asyncErrors` puede tener claves con valor `undefined` (se
    // limpian así, no se borran, para no reordenar el objeto), por eso se
    // filtran con Boolean en vez de mirar Object.keys.
    const hayErrores = Object.values(nextErrors).some(Boolean) || Object.values(asyncErrors).some(Boolean);

    if (hayErrores) {
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

  const err = (field: keyof ValidationErrors) => {
    if (!touched[field]) return undefined;
    if (field === "correo") return errors.correo ?? asyncErrors.correo;
    if (field === "numero") return errors.numero ?? asyncErrors.numero;
    if (field === "identificacion") return errors.identificacion ?? asyncErrors.identificacion;
    return errors[field];
  };

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
    checkingCorreo,
    checkingNumero,
    checkingDocumento,
    handleBlur,
    handleSubmit,
    err,
  };
}
