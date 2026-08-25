import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { QrCedulaPayload } from "@/services/api/qr";
import type { Usuario } from "@/services/api/usuarios";
import {
  FormState, NOMBRE_MIN, NOMBRE_MAX, PASSWORD_MIN, PASSWORD_MAX,
  TELEFONO_REGEX, EMAIL_REGEX, sanitizeText,
} from "../lib/helpers";

interface UseUsuarioFormArgs {
  initial: FormState;
  isEdit: boolean;
  roles: { id: string; nombre: string; estado?: "activo" | "inactivo" }[];
  usuarios: Usuario[];
  editingId: string | null;
  onSave: (data: FormState) => void;
}

/** Estado, validación en vivo y envío del formulario de usuario. */
export function useUsuarioForm({ initial, isEdit, roles, usuarios, editingId, onSave }: UseUsuarioFormArgs) {
  const [form, setForm] = useState<FormState>(initial);
  const [showPass, setShowPass] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  useEffect(() => {
    setForm(initial);
    setErrors({});
    setTouched({});
  }, [initial]);

  // Solo se muestran roles activos en el selector (corrección: no mostrar roles desactivados)
  const rolesDisponibles = useMemo(() => roles.filter((r) => r.estado !== "inactivo"), [roles]);

  // Los errores se recalculan en tiempo real vía el `useEffect` sobre `form` (ver más abajo),
  // así que aquí solo hace falta actualizar el valor del campo.
  const set = useCallback((k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  // Teléfono: solo permite dígitos, espacios, paréntesis, guiones y "+"
  const setTelefono = useCallback((raw: string) => {
    const filtrado = raw.replace(/[^0-9()+\-\s]/g, "");
    setForm((f) => ({ ...f, numero: filtrado }));
  }, []);

  // Maneja los datos obtenidos del QR
  const handleScanSuccess = useCallback((data: QrCedulaPayload) => {
    // Mapeo robusto de campos según la estructura típica de la cédula colombiana
    const identificacion = data.numeroDocumento ?? data.identificacion ?? data.documento ?? "";
    // Corrección: `??` tiene menor precedencia que `+`, así que
    // `data.nombres + " " + data.apellidos` se evaluaba primero, produciendo
    // el string "undefined undefined" (no null/undefined) cuando faltaba
    // alguno de los dos campos, y ese texto terminaba en el input de nombre.
    const nombreCompleto =
      data.nombreCompleto ??
      (data.nombres && data.apellidos ? `${data.nombres} ${data.apellidos}` : undefined) ??
      data.nombre ??
      "";
    const correo = data.correo ?? data.email ?? "";
    const telefonoCrudo = (data.telefono ?? data.celular ?? data.numero ?? "").toString();
    const tipoDoc = data.tipoDocumento ?? "CC";

    setForm((prev) => ({
      ...prev,
      identificacion: identificacion.toString(),
      nombre: nombreCompleto.toString(),
      correo: correo.toString(),
      numero: telefonoCrudo.replace(/[^0-9()+\-\s]/g, ""),
      tipoDocumento: tipoDoc.toString(),
    }));
    toast.success("Datos de la cédula cargados correctamente");
  }, []);

  const validate = useCallback((f: FormState) => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    const nombre = f.nombre.trim();
    const correo = f.correo.trim();
    const numero = f.numero.trim();
    const identificacion = f.identificacion.trim();

    // Número de identificación: obligatorio, solo dígitos (ya filtrados en el input), longitud mínima
    if (!identificacion) {
      nextErrors.identificacion = "El número de identificación es obligatorio";
    } else if (identificacion.length < 6) {
      nextErrors.identificacion = "Debe tener al menos 6 dígitos";
    } else if (usuarios.some((u) => u.id !== editingId && u.identificacion.trim() === identificacion)) {
      nextErrors.identificacion = "Ya existe un usuario registrado con este número de identificación";
    }

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

    // Teléfono: solo números (y separadores comunes), longitud razonable
    if (numero && !TELEFONO_REGEX.test(numero)) {
      nextErrors.numero = "El teléfono solo debe contener números (7 a 15 dígitos)";
    }

    // Rol obligatorio
    if (!f.rol) {
      nextErrors.rol = "Debe seleccionar un rol";
    }

    // Tipo de usuario obligatorio (visitante/estudiante/docente/administrativo/otro)
    if (!f.tipoUsuario) {
      nextErrors.tipoUsuario = "Debe seleccionar un tipo de usuario";
    }

    // Contraseña: obligatoria al crear; si se escribe (crear o editar), validar longitud
    if (!isEdit && !f.password) {
      nextErrors.password = "La contraseña es obligatoria";
    } else if (f.password && (f.password.length < PASSWORD_MIN || f.password.length > PASSWORD_MAX)) {
      nextErrors.password = `La contraseña debe tener entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres`;
    }

    return nextErrors;
  }, [isEdit, usuarios, editingId]);

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
    setTouched({ identificacion: true, nombre: true, correo: true, numero: true, rol: true, tipoUsuario: true, password: true });
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Revisa los campos marcados en rojo");
      return;
    }

    const sanitizedNombre = sanitizeText(form.nombre.trim());
    const sanitizedCorreo = sanitizeText(form.correo.trim().toLowerCase());
    onSave({ ...form, nombre: sanitizedNombre, correo: sanitizedCorreo, numero: form.numero.trim() });
  }, [form, onSave, validate]);

  return {
    form, set, setTelefono, showPass, setShowPass, showScanner, setShowScanner,
    rolesDisponibles, markTouched, err, handleSubmit, handleScanSuccess,
  };
}
