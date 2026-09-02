import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRoles, useCreateRol, useUpdateRol, useRemoveRol } from "./useRoles";
import type { Rol } from "@/services/api/roles";
import { ROLES_PROTEGIDOS, emptyForm, type FormState } from "../lib/helpers";
import { initialPermisos } from "../lib/permisos";

/** Estado y handlers de la página de Roles: filtrado, modales y mutaciones. */
export function useRolesPage() {
  const { data: roles = [], isLoading } = useRoles();
  const createRolMutation = useCreateRol();
  const updateRolMutation = useUpdateRol();
  const removeRolMutation = useRemoveRol();
  // `mutateAsync` (no `.mutate`): quien llama necesita el `await`/try-catch para no
  // mostrar un toast de "éxito" ni cerrar su diálogo cuando la mutación en realidad falla.
  const addRol = useCallback((data: Omit<Rol, "id">) => createRolMutation.mutateAsync(data), [createRolMutation]);
  const updateRol = useCallback(
    (id: string, data: Partial<Rol>) => updateRolMutation.mutateAsync({ id, data }),
    [updateRolMutation]
  );
  const removeRol = useCallback((id: string) => removeRolMutation.mutateAsync(id), [removeRolMutation]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [viewingRol, setViewingRol] = useState<Rol | null>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [formInitial, setFormInitial] = useState<FormState>(emptyForm());
  const [rolAEliminar, setRolAEliminar] = useState<Rol | null>(null);

  const filteredRoles = useMemo(
    () =>
      roles.filter((r) => {
        const matchSearch = r.nombre.toLowerCase().includes(search.toLowerCase());
        const matchEstado = filterEstado === "todos" || r.estado === filterEstado;
        return matchSearch && matchEstado;
      }),
    [roles, search, filterEstado]
  );

  const stats = useMemo(
    () => ({
      activos: roles.filter((r) => r.estado === "activo").length,
      protegidos: ROLES_PROTEGIDOS.length,
      total: roles.length,
      permisos: Object.keys(initialPermisos).length,
    }),
    [roles]
  );

  const openCreate = useCallback(() => {
    setEditingRol(null);
    setFormInitial(emptyForm());
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((rol: Rol) => {
    setEditingRol(rol);
    setFormInitial({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      permisos: { ...rol.permisos },
      estado: rol.estado,
    });
    setViewOpen(false);
    setDialogOpen(true);
  }, []);

  const openView = useCallback((rol: Rol) => {
    setViewingRol(rol);
    setViewOpen(true);
  }, []);

  const handleToggleEstado = useCallback(
    async (rol: Rol) => {
      if ((ROLES_PROTEGIDOS as readonly string[]).includes(rol.nombre)) {
        toast.error("Este rol está protegido y no puede deshabilitarse");
        return;
      }
      const nuevoEstado = rol.estado === "activo" ? "inactivo" : "activo";
      try {
        await updateRol(rol.id, {
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          permisos: rol.permisos,
          estado: nuevoEstado,
        });
        toast.success(
          nuevoEstado === "activo" ? "Rol habilitado correctamente" : "Rol deshabilitado correctamente"
        );
      } catch (error) {
        // El toast de error ya lo muestra el manejador centralizado de mutaciones
        // (services/core/queryFactory.ts).
        console.error("Error toggling role state:", error);
      }
    },
    [updateRol]
  );

  // El botón "Eliminar" ni siquiera se muestra para un rol protegido (ver RoleCard.tsx), pero
  // se revalida aquí también por si acaso — no depender solo de que el botón esté oculto.
  const handleDeleteRequest = useCallback((rol: Rol) => {
    if ((ROLES_PROTEGIDOS as readonly string[]).includes(rol.nombre)) {
      toast.error("Este rol está protegido y no puede eliminarse");
      return;
    }
    setRolAEliminar(rol);
  }, []);

  const confirmDeleteRol = useCallback(async () => {
    if (!rolAEliminar) return;
    try {
      await removeRol(rolAEliminar.id);
      toast.success(`Rol "${rolAEliminar.nombre}" eliminado.`);
      setRolAEliminar(null);
    } catch (error) {
      // El toast de error (incl. "existen usuarios asociados" si el backend lo rechaza así)
      // ya lo muestra useRemoveRol — no se duplica aquí.
      console.error("Error deleting rol:", error);
    }
  }, [rolAEliminar, removeRol]);

  const handleSave = useCallback(
    async (data: FormState) => {
      try {
        if (editingRol) {
          await updateRol(editingRol.id, data);
          toast.success("Rol actualizado correctamente");
        } else {
          await addRol(data);
          toast.success("Rol creado correctamente");
        }
        setDialogOpen(false);
      } catch (error) {
        console.error("Error saving role:", error);
      }
    },
    [editingRol, addRol, updateRol]
  );

  return {
    roles,
    isLoading,
    dialogOpen,
    setDialogOpen,
    viewOpen,
    setViewOpen,
    editingRol,
    viewingRol,
    search,
    setSearch,
    filterEstado,
    setFilterEstado,
    formInitial,
    filteredRoles,
    stats,
    openCreate,
    openEdit,
    openView,
    handleToggleEstado,
    handleSave,
    rolAEliminar,
    setRolAEliminar,
    handleDeleteRequest,
    confirmDeleteRol,
  };
}
