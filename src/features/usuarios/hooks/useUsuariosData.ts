import { useMemo } from "react";
import { useUsuarios, useCreateUsuario, useUpdateUsuario } from "./useUsuarios";
import type { Usuario } from "@/services/api/usuarios";
import { useRoles } from "@/features/roles";
import { nombreDeRol } from "@/services/core/roles";

/** Queries, mutaciones y totales de la página de Usuarios. */
export function useUsuariosData() {
  const { data: usuarios = [] } = useUsuarios();
  const { data: roles = [] } = useRoles();
  const createUsuarioMutation = useCreateUsuario();
  const updateUsuarioMutation = useUpdateUsuario();
  const addUsuario = (data: Omit<Usuario, "id">) => createUsuarioMutation.mutate(data);
  const updateUsuario = (id: string, data: Partial<Omit<Usuario, "id">>) =>
    updateUsuarioMutation.mutate({ id, data });

  const totalActivos = useMemo(() => usuarios.filter((u) => u.estado === "activo").length, [usuarios]);
  const totalInactivos = useMemo(() => usuarios.filter((u) => u.estado === "inactivo").length, [usuarios]);
  const uniqueRoles = useMemo(() => Array.from(new Set(usuarios.map((u) => nombreDeRol(u.rol)))), [usuarios]);

  return { usuarios, roles, addUsuario, updateUsuario, totalActivos, totalInactivos, uniqueRoles };
}

export type UsuariosData = ReturnType<typeof useUsuariosData>;
