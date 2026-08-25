import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Usuario } from "@/services/api/usuarios";
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
      numero: u.numero,
      rol: u.rol,
      tipoUsuario: u.tipoUsuario,
      tipoDocumento: u.tipoDocumento,
      identificacion: u.identificacion,
      estado: u.estado,
    });
    setDialogOpen(true);
  }, []);

  // Corrección: evita registrar dos usuarios iguales (mismo correo o misma identificación)
  const encontrarDuplicado = useCallback(
    (form: FormState, excludeId?: string) => {
      const correoNuevo = form.correo.trim().toLowerCase();
      const idNuevo = form.identificacion.trim();
      return data.usuarios.find(
        (u) =>
          u.id !== excludeId &&
          (u.correo.trim().toLowerCase() === correoNuevo ||
            (idNuevo && u.identificacion.trim() === idNuevo))
      );
    },
    [data.usuarios]
  );

  const handleSave = useCallback(
    (form: FormState) => {
      try {
        const duplicado = encontrarDuplicado(form, editingUsuario?.id);
        if (duplicado) {
          const motivo =
            duplicado.correo.trim().toLowerCase() === form.correo.trim().toLowerCase()
              ? "Ya existe un usuario registrado con ese correo"
              : "Ya existe un usuario registrado con ese número de identificación";
          toast.error(motivo);
          return;
        }

        // El formulario valida que tipoUsuario no quede vacío antes de permitir
        // el envío (ver UsuarioFormModal); acá ya llega garantizado no-vacío.
        const payload = { ...form, tipoUsuario: form.tipoUsuario || "otro" } as Omit<Usuario, "id">;

        if (editingUsuario) {
          // Corrección: si el campo de contraseña se deja vacío al editar,
          // no debe sobreescribir la contraseña existente (así lo indica
          // el hint "vacío = sin cambios" del formulario).
          const { password, ...rest } = payload;
          data.updateUsuario(editingUsuario.id, password ? payload : rest);
          toast.success("Usuario actualizado correctamente");
        } else {
          data.addUsuario(payload);
          toast.success("Usuario creado correctamente");
        }
        setDialogOpen(false);
      } catch (error) {
        toast.error("Error al guardar el usuario");
        console.error("Error saving user:", error);
      }
    },
    [editingUsuario, data, encontrarDuplicado]
  );

  const handleToggleEstado = useCallback(
    (u: Usuario) => {
      if (USUARIOS_PROTEGIDOS.includes(u.correo)) {
        toast.error("Este usuario está protegido");
        return;
      }
      try {
        data.updateUsuario(u.id, { ...u, estado: u.estado === "activo" ? "inactivo" : "activo" });
        toast.success(`Usuario ${u.estado === "activo" ? "desactivado" : "activado"} correctamente`);
      } catch (error) {
        toast.error("Error al cambiar el estado");
        console.error("Error toggling user status:", error);
      }
    },
    [data]
  );

  return { dialogOpen, setDialogOpen, editingUsuario, formInitial, openCreate, openEdit, handleSave, handleToggleEstado };
}
