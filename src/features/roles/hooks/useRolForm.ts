import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Rol } from "@/services/api/roles";
import { sanitizeText } from "@/utils/format";
import { type FormState } from "../lib/helpers";

interface UseRolFormArgs {
  initial: FormState;
  onSave: (data: FormState) => void;
  existingRoles: Rol[];
  editingRolId?: string | null;
}

/** Estado y validación en vivo del formulario de rol (crear/editar). */
export function useRolForm({ initial, onSave, existingRoles, editingRolId = null }: UseRolFormArgs) {
  const [form, setForm] = useState<FormState>(initial);
  const [nombreError, setNombreError] = useState<string>("");
  const [nombreTocado, setNombreTocado] = useState(false);

  useEffect(() => {
    setForm(initial);
    setNombreError("");
    setNombreTocado(false);
  }, [initial]);

  const handleNombreChange = useCallback(
    (value: string) => {
      setForm((f) => ({ ...f, nombre: value }));
      const trimmed = value.trim().toLowerCase();
      const duplicado = existingRoles.some(
        (r) => r.id !== editingRolId && r.nombre.trim().toLowerCase() === trimmed
      );
      setNombreError(!trimmed ? "El nombre es obligatorio" : duplicado ? "Ya existe un rol con este nombre" : "");
    },
    [existingRoles, editingRolId]
  );

  const markNombreTocado = useCallback(() => setNombreTocado(true), []);

  const nombreErrorVisible = nombreTocado ? nombreError : "";
  const formInvalido = !form.nombre.trim() || !!nombreError;

  const setDescripcion = useCallback((descripcion: string) => {
    setForm((f) => ({ ...f, descripcion }));
  }, []);

  const setEstado = useCallback((estado: "activo" | "inactivo") => {
    setForm((f) => ({ ...f, estado }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setNombreTocado(true);
      const rawName = form.nombre.trim();
      if (!rawName) {
        toast.error("El nombre es obligatorio");
        return;
      }
      const duplicado = existingRoles.some(
        (r) => r.id !== editingRolId && r.nombre.trim().toLowerCase() === rawName.toLowerCase()
      );
      if (duplicado) {
        setNombreError("Ya existe un rol con este nombre");
        toast.error("Ya existe un rol con este nombre");
        return;
      }
      const sanitizedName = sanitizeText(rawName);
      onSave({ ...form, nombre: sanitizedName });
    },
    [form, onSave, existingRoles, editingRolId]
  );

  return {
    form,
    setDescripcion,
    setEstado,
    nombreErrorVisible,
    formInvalido,
    handleNombreChange,
    markNombreTocado,
    handleSubmit,
  };
}
