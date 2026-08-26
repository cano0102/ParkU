import { useMemo } from "react";
import { useUsuarios, useCreateUsuario, useUpdateUsuario } from "./useUsuarios";
import type { Usuario } from "@/services/api/usuarios";
import { useRoles } from "@/features/roles";
import { nombreDeRol } from "@/services/core/roles";

/** Queries, mutaciones y totales de la página de Usuarios. */
export function useUsuariosData() {
  const { data: usuarios = [], isLoading } = useUsuarios();
  const { data: roles = [] } = useRoles();
  const createUsuarioMutation = useCreateUsuario();
  const updateUsuarioMutation = useUpdateUsuario();
  // `mutateAsync` (no `.mutate`): quien llama necesita el `await`/try-catch para no
  // mostrar un toast de "éxito" ni cerrar su diálogo cuando la mutación en realidad falla.
  const addUsuario = (data: Omit<Usuario, "id">) => createUsuarioMutation.mutateAsync(data);
  const updateUsuario = (id: string, data: Partial<Omit<Usuario, "id">>) =>
    updateUsuarioMutation.mutateAsync({ id, data });

  const totalActivos = useMemo(() => usuarios.filter((u) => u.estado === "activo").length, [usuarios]);
  const totalInactivos = useMemo(() => usuarios.filter((u) => u.estado === "inactivo").length, [usuarios]);
  const uniqueRoles = useMemo(() => Array.from(new Set(usuarios.map((u) => nombreDeRol(u.rol)))), [usuarios]);

  return { usuarios, roles, addUsuario, updateUsuario, totalActivos, totalInactivos, uniqueRoles, isLoading };
}

export type UsuariosData = ReturnType<typeof useUsuariosData>;
