import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Usuario } from "@/services/api/usuarios";
import type { Conductor } from "@/services/api/conductores";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/services/core/roles";
import { validarNumeroDocumento } from "@/utils/validation";
import {
  FormState, NOMBRE_MIN, NOMBRE_MAX, EMAIL_REGEX, SUPER_ADMIN_CORREO, validarTelefono, validarPassword,
} from "../lib/helpers";

interface UseUsuarioFormArgs {
  initial: FormState;
  isEdit: boolean;
  roles: { id: string; nombre: string; estado?: "activo" | "inactivo" }[];
  usuarios: Usuario[];
  /** Conductores ya registrados, para detectar documentos duplicados sin ir al backend. */
  conductores: Conductor[];
  editingId: string | null;
  onSave: (data: FormState) => void;
}

/** Estado, validación en vivo y envío del formulario de usuario. */
export function useUsuarioForm({ initial, isEdit, roles, usuarios, conductores, editingId, onSave }: UseUsuarioFormArgs) {
  const [form, setForm] = useState<FormState>(initial);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  useEffect(() => {
    setForm(initial);
    setErrors({});
    setTouched({});
  }, [initial]);

  // Solo el súper admin real (SUPER_ADMIN_CORREO) puede asignarle el rol Administrador a
  // alguien — cualquier otro Admin gestionando usuarios ni siquiera ve esa opción en el
  // selector, así que no puede crear ni promover a otro Admin.
  const { user } = useAuth();
  const esSuperAdmin = user?.correo?.trim().toLowerCase() === SUPER_ADMIN_CORREO;

  // Solo se muestran roles activos en el selector (corrección: no mostrar roles desactivados)
  const rolesDisponibles = useMemo(() => {
    const activos = roles.filter((r) => r.estado !== "inactivo");
    return esSuperAdmin ? activos : activos.filter((r) => r.id !== String(ROLES.ADMIN));
  }, [roles, esSuperAdmin]);

  /** Documentos ya usados por OTRO conductor (el de la cuenta en edición se excluye, para que
   *  guardar sin cambiar el documento no choque consigo mismo). Mismo criterio que
   *  useConductorForm.ts, contra la lista ya cargada en vez de una consulta extra. */
  const documentosOcupados = useMemo(
    () =>
      new Set(
        conductores
          .filter((c) => !editingId || c.usuarioId !== editingId)
          .map((c) => `${c.tipoDocumento}|${c.numeroDocumento.trim()}`)
      ),
    [conductores, editingId]
  );

  // Los errores se recalculan en tiempo real vía el `useEffect` sobre `form` (ver más abajo),
  // así que aquí solo hace falta actualizar el valor del campo.
  const set = useCallback((k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  const validate = useCallback((f: FormState) => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    const nombre = f.nombre.trim();
    const correo = f.correo.trim();

    // Nombre completo: longitud mínima y máxima
    if (!nombre) {
      nextErrors.nombre = "El nombre es obligatorio";
    } else if (nombre.length < NOMBRE_MIN) {
      nextErrors.nombre = `El nombre debe tener al menos ${NOMBRE_MIN} caracteres`;
    } else if (nombre.length > NOMBRE_MAX) {
      nextErrors.nombre = `El nombre no puede superar ${NOMBRE_MAX} caracteres`;
    }

    // Correo: formato válido, y no repetido con otro usuario
    if (!correo) {
      nextErrors.correo = "El correo es obligatorio";
    } else if (!EMAIL_REGEX.test(correo)) {
      nextErrors.correo = "Ingresa un correo electrónico válido";
    } else if (usuarios.some((u) => u.id !== editingId && u.correo.trim().toLowerCase() === correo.toLowerCase())) {
      nextErrors.correo = "Ya existe un usuario registrado con este correo";
    }

    // Teléfono: opcional, pero si se escribe debe tener formato válido y no
    // estar ya en uso por otra cuenta (chequeo en vivo contra la lista ya
    // cargada — no hace falta ir al backend, a diferencia del registro
    // público que no tiene la lista completa disponible).
    const numero = f.numero.trim();
    if (numero) {
      if (!validarTelefono(numero)) {
        nextErrors.numero = "Ingresa un número de teléfono colombiano válido (10 dígitos)";
      } else if (usuarios.some((u) => u.id !== editingId && u.numero.trim() === numero)) {
        nextErrors.numero = "Ya existe una cuenta registrada con este número";
      }
    }

    // Rol obligatorio, y solo el súper admin puede asignar el rol Administrador (defensa
    // adicional: el selector ya oculta esa opción para cualquier otro usuario, pero esto
    // cubre el caso de editar a alguien que YA era Admin antes de que existiera esta regla).
    if (!f.rol) {
      nextErrors.rol = "Debe seleccionar un rol";
    } else if (f.rol === String(ROLES.ADMIN) && !esSuperAdmin) {
      nextErrors.rol = "Solo el súper administrador puede asignar el rol Administrador";
    }

    // Documento: obligatorio para toda cuenta, sin importar el rol. No es una columna de
    // `usuario`: se persiste en el `conductor` vinculado, y ese modelo exige además el tipo
    // de usuario (FK a /catalogos/tipos-usuario), que por eso también se pide aquí.
    const numeroDocumento = f.numeroDocumento.trim();
    if (!numeroDocumento) {
      nextErrors.numeroDocumento = "El número de documento es obligatorio";
    } else if (!validarNumeroDocumento(numeroDocumento)) {
      nextErrors.numeroDocumento = "El número de documento debe tener entre 6 y 10 dígitos.";
    } else if (documentosOcupados.has(`${f.tipoDocumento}|${numeroDocumento}`)) {
      nextErrors.numeroDocumento = "Ya existe otra persona registrada con este tipo y número de documento.";
    }
    if (!f.tipoUsuarioId) {
      nextErrors.tipoUsuarioId = "Selecciona un tipo de usuario";
    }

    // Contraseña: obligatoria al crear. Se validan aquí los MISMOS requisitos que exige la
    // API (longitud + mayúscula + minúscula + número, ver validarPassword en
    // @/utils/validation): antes solo se comprobaba la longitud, así que el formulario daba
    // por buena una contraseña que el backend rechazaba al enviar y la cuenta no se creaba.
    if (!isEdit && !f.password) {
      nextErrors.password = "La contraseña es obligatoria";
    } else if (f.password) {
      const errorPassword = validarPassword(f.password);
      if (errorPassword) nextErrors.password = errorPassword;
    }

    // Confirmación: solo aplica al crear (al editar no hay campo de contraseña, ver
    // CredencialesAccesoFields: la API no permite que un Admin cambie la de otra persona).
    if (!isEdit) {
      if (!f.confirmPassword) {
        nextErrors.confirmPassword = "Confirma la contraseña";
      } else if (f.confirmPassword !== f.password) {
        nextErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }

    return nextErrors;
  }, [isEdit, usuarios, editingId, esSuperAdmin, documentosOcupados]);

  // Validación en tiempo real: recalcula los errores en cada cambio del formulario;
  // la visibilidad de cada mensaje se sigue controlando con `touched` (ver `err`).
  useEffect(() => {
    setErrors(validate(form));
  }, [form, validate]);

  const markTouched = useCallback((k: keyof FormState) => {
    setTouched((t) => ({ ...t, [k]: true }));
  }, []);

  const err = useCallback((k: keyof FormState) => (touched[k] ? errors[k] : undefined), [touched, errors]);

  const handleSubmit = useCallback(() => {
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setTouched({
      nombre: true, correo: true, numero: true, rol: true,
      password: true, confirmPassword: true, numeroDocumento: true, tipoUsuarioId: true,
    });
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Revisa los campos marcados en rojo");
      return;
    }

    const sanitizedNombre = form.nombre.trim();
    const sanitizedCorreo = form.correo.trim().toLowerCase();
    onSave({ ...form, nombre: sanitizedNombre, correo: sanitizedCorreo });
  }, [form, onSave, validate]);

  return {
    form, set, showPass, setShowPass,
    rolesDisponibles, markTouched, err, handleSubmit,
    isValid: Object.keys(errors).length === 0,
  };
}
