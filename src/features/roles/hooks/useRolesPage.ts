import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRoles, useCreateRol, useUpdateRol } from "./useRoles";
import type { Rol } from "@/services/api/roles";
import { ROLES_PROTEGIDOS, emptyForm, type FormState } from "../lib/helpers";
import { initialPermisos } from "../lib/permisos";

/** Estado y handlers de la página de Roles: filtrado, modales y mutaciones. */
export function useRolesPage() {
  const { data: roles = [] } = useRoles();
  const createRolMutation = useCreateRol();
  const updateRolMutation = useUpdateRol();
  const addRol = useCallback((data: Omit<Rol, "id">) => createRolMutation.mutate(data), [createRolMutation]);
  const updateRol = useCallback(
    (id: string, data: Partial<Rol>) => updateRolMutation.mutate({ id, data }),
    [updateRolMutation]
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<Rol | null>(null);
  const [viewingRol, setViewingRol] = useState<Rol | null>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [formInitial, setFormInitial] = useState<FormState>(emptyForm());

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
    (rol: Rol) => {
      if (ROLES_PROTEGIDOS.includes(rol.nombre as any)) {
        toast.error("Este rol está protegido y no puede deshabilitarse");
        return;
      }
      try {
        const nuevoEstado = rol.estado === "activo" ? "inactivo" : "activo";
        updateRol(rol.id, {
          nombre: rol.nombre,
          descripcion: rol.descripcion,
          permisos: rol.permisos,
          estado: nuevoEstado,
        });
        toast.success(
          nuevoEstado === "activo" ? "Rol habilitado correctamente" : "Rol deshabilitado correctamente"
        );
      } catch (error) {
        toast.error("Error al cambiar el estado del rol");
        console.error("Error toggling role state:", error);
      }
    },
    [updateRol]
  );

  const handleSave = useCallback(
    (data: FormState) => {
      try {
        if (editingRol) {
          updateRol(editingRol.id, data);
          toast.success("Rol actualizado correctamente");
        } else {
          addRol(data);
          toast.success("Rol creado correctamente");
        }
        setDialogOpen(false);
      } catch (error) {
        toast.error("Error al guardar el rol");
        console.error("Error saving role:", error);
      }
    },
    [editingRol, addRol, updateRol]
  );

  return {
    roles,
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
  };
}
