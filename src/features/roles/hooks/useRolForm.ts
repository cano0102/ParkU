import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { PermisoCatalogo, Rol } from "@/services/api/roles";
import { type FormState } from "../lib/helpers";

/**
 * El backend identifica "dashboard" con el permiso `reportes.consultar`
 * (ver vista v_rol_permisos_front en la base). No usar id ni moduloNombre:
 * el id es un serial que cambia según el seed y el módulo agrupa más cosas.
 */
const PERMISO_DASHBOARD = "reportes.consultar";

interface UseRolFormArgs {
  initial: FormState;
  /** Recibe también los ids de permiso marcados, que se guardan en `rol_permiso`. */
  onSave: (data: FormState, permisoIds: string[]) => void;
  existingRoles: Rol[];
  editingRolId?: string | null;
  /** Permisos que el rol ya tiene guardados (vacío al crear); precargan la selección. */
  permisosGuardados?: Set<string>;
  /** Catálogo completo, necesario para distinguir los permisos válidos (excluye dashboard). */
  permisosCatalogo: PermisoCatalogo[];
}

/** Estado y validación en vivo del formulario de rol (crear/editar). */
export function useRolForm({
  initial,
  onSave,
  existingRoles,
  editingRolId = null,
  permisosGuardados,
  permisosCatalogo,
}: UseRolFormArgs) {
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

  // --- Validación de permisos (aplica a crear y editar) -------------------
  // Un rol debe tener al menos un permiso, y ese permiso no puede ser dashboard.
  const idsPermisosValidos = useMemo(
    () =>
      new Set(
        permisosCatalogo
          .filter((p) => p.nombre !== PERMISO_DASHBOARD)
          .map((p) => p.id)
      ),
    [permisosCatalogo]
  );

  const permisosValidosSeleccionados = useMemo(
    () => [...permisosSeleccionados].filter((id) => idsPermisosValidos.has(id)),
    [permisosSeleccionados, idsPermisosValidos]
  );

  const faltaPermisoValido = permisosValidosSeleccionados.length === 0;
  const permisosError = faltaPermisoValido
    ? "Selecciona al menos un permiso distinto de Dashboard"
    : "";

  // --- Nombre -------------------------------------------------------------
  const handleNombreChange = useCallback(
    (value: string) => {
      setForm((f) => ({ ...f, nombre: value }));
      const trimmed = value.trim().toLowerCase();
      const duplicado = existingRoles.some(
        (r) => r.id !== editingRolId && r.nombre.trim().toLowerCase() === trimmed
      );
      setNombreError(
        !trimmed
          ? "El nombre es obligatorio"
          : duplicado
            ? "Ya existe un rol con este nombre"
            : ""
      );
    },
    [existingRoles, editingRolId]
  );

  const markNombreTocado = useCallback(() => setNombreTocado(true), []);

  const nombreErrorVisible = nombreTocado ? nombreError : "";
  const formInvalido = !form.nombre.trim() || !!nombreError || faltaPermisoValido;

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

      // Guard extra por si el botón llegara a habilitarse con la validación saltada.
      if (faltaPermisoValido) {
        toast.error("Selecciona al menos un permiso distinto de Dashboard");
        return;
      }

      onSave({ ...form, nombre: rawName }, [...permisosSeleccionados]);
    },
    [form, onSave, existingRoles, editingRolId, permisosSeleccionados, faltaPermisoValido]
  );

  return {
    form,
    permisosSeleccionados,
    togglePermiso,
    toggleModulo,
    setDescripcion,
    setEstado,
    nombreErrorVisible,
    permisosError,
    formInvalido,
    handleNombreChange,
    markNombreTocado,
    handleSubmit,
  };
}