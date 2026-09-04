import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Rol } from "@/services/api/roles";
import { type FormState } from "../lib/helpers";

interface UseRolFormArgs {
  initial: FormState;
  /** Recibe también los ids de permiso marcados, que se guardan en `rol_permiso`. */
  onSave: (data: FormState, permisoIds: string[]) => void;
  existingRoles: Rol[];
  editingRolId?: string | null;
  /** Permisos que el rol ya tiene guardados (vacío al crear); precargan la selección. */
  permisosGuardados?: Set<string>;
}

/** Estado y validación en vivo del formulario de rol (crear/editar). */
export function useRolForm({ initial, onSave, existingRoles, editingRolId = null, permisosGuardados }: UseRolFormArgs) {
  const [form, setForm] = useState<FormState>(initial);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<Set<string>>(new Set());
  const [nombreError, setNombreError] = useState<string>("");
  const [nombreTocado, setNombreTocado] = useState(false);

  useEffect(() => {
    setForm(initial);
    setNombreError("");
    setNombreTocado(false);
  }, [initial]);

  // Al abrir (o cuando termina de cargar el rol que se edita) la selección parte de lo que
  // el backend ya tiene guardado para ese rol; un rol nuevo empieza sin nada marcado.
  useEffect(() => {
    setPermisosSeleccionados(new Set(permisosGuardados ?? []));
  }, [permisosGuardados]);

  const togglePermiso = useCallback((permisoId: string) => {
    setPermisosSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(permisoId)) next.delete(permisoId);
      else next.add(permisoId);
      return next;
    });
  }, []);

  const toggleModulo = useCallback((permisoIds: string[], marcar: boolean) => {
    setPermisosSeleccionados((prev) => {
      const next = new Set(prev);
      for (const id of permisoIds) {
        if (marcar) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

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
      const sanitizedName = rawName;
      onSave({ ...form, nombre: sanitizedName }, [...permisosSeleccionados]);
    },
    [form, onSave, existingRoles, editingRolId, permisosSeleccionados]
  );

  return {
    form,
    permisosSeleccionados,
    togglePermiso,
    toggleModulo,
    setDescripcion,
    setEstado,
    nombreErrorVisible,
    formInvalido,
    handleNombreChange,
    markNombreTocado,
    handleSubmit,
  };
}
