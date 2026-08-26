import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Usuario } from "@/services/api/usuarios";
import { esRolId, ROLES } from "@/services/core/roles";
import { USUARIOS_PROTEGIDOS, emptyForm, type FormState } from "../lib/helpers";
import type { UsuariosData } from "./useUsuariosData";

/** El diálogo de crear/editar usuario (con detección de duplicados) y el toggle de estado. */
export function useUsuarioFormState(data: Pick<UsuariosData, "usuarios" | "addUsuario" | "updateUsuario">) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formInitial, setFormInitial] = useState<FormState>(emptyForm());

  const openCreate = useCallback(() => {
    setEditingUsuario(null);
    setFormInitial(emptyForm());
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((u: Usuario) => {
    setEditingUsuario(u);
    setFormInitial({
      correo: u.correo,
      // Se deja vacío a propósito: el hint del formulario dice
      // "vacío = sin cambios", así que no debe pre-cargarse la
      // contraseña real (ver handleSave, que omite este campo si llega vacío).
      password: "",
      nombre: u.nombre,
      rol: String(u.rol),
      estado: u.estado,
    });
    setDialogOpen(true);
  }, []);

  // Corrección: evita registrar dos usuarios con el mismo correo
  const encontrarDuplicado = useCallback(
    (form: FormState, excludeId?: string) => {
      const correoNuevo = form.correo.trim().toLowerCase();
      return data.usuarios.find(
        (u) => u.id !== excludeId && u.correo.trim().toLowerCase() === correoNuevo
      );
    },
    [data.usuarios]
  );

  const handleSave = useCallback(
    async (form: FormState) => {
      const duplicado = encontrarDuplicado(form, editingUsuario?.id);
      if (duplicado) {
        toast.error("Ya existe un usuario registrado con ese correo");
        return;
      }

      const rolId = Number(form.rol);
      const payload = {
        ...form,
        rol: esRolId(rolId) ? rolId : ROLES.CONDUCTOR,
      } as Omit<Usuario, "id">;

      try {
        if (editingUsuario) {
          // Corrección: si el campo de contraseña se deja vacío al editar,
          // no debe sobreescribir la contraseña existente (así lo indica
          // el hint "vacío = sin cambios" del formulario) — y de todas formas
          // la API rechaza un PUT que incluya contraseña (ver services/api/usuarios.ts).
          const { password, ...rest } = payload;
          void password;
          await data.updateUsuario(editingUsuario.id, rest);
          toast.success("Usuario actualizado correctamente");
        } else {
          await data.addUsuario(payload);
          toast.success("Usuario creado correctamente");
        }
        setDialogOpen(false);
      } catch (error) {
        // El toast de error ya lo muestra el manejador centralizado de mutaciones
        // (services/core/queryFactory.ts); aquí solo evitamos cerrar el diálogo o
        // mostrar un falso "éxito" cuando la mutación en realidad falló.
        console.error("Error saving user:", error);
      }
    },
    [editingUsuario, data, encontrarDuplicado]
  );

  const handleToggleEstado = useCallback(
    async (u: Usuario) => {
      if (USUARIOS_PROTEGIDOS.includes(u.correo)) {
        toast.error("Este usuario está protegido");
        return;
      }
      try {
        await data.updateUsuario(u.id, { estado: u.estado === "activo" ? "inactivo" : "activo" });
        toast.success(`Usuario ${u.estado === "activo" ? "desactivado" : "activado"} correctamente`);
      } catch (error) {
        console.error("Error toggling user status:", error);
      }
    },
    [data]
  );

  return { dialogOpen, setDialogOpen, editingUsuario, formInitial, openCreate, openEdit, handleSave, handleToggleEstado };
}
