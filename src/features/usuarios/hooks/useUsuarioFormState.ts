import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Usuario } from "@/services/api/usuarios";
import { ROLES } from "@/services/core/roles";
import { USUARIOS_PROTEGIDOS, emptyForm, type FormState } from "../lib/helpers";
import type { UsuariosData } from "./useUsuariosData";

/** El diálogo de crear/editar usuario (con detección de duplicados) y el toggle de estado. */
export function useUsuarioFormState(
  data: Pick<UsuariosData, "usuarios" | "addUsuario" | "updateUsuario" | "conductorDeUsuario" | "guardarDocumentoDeUsuario">
) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formInitial, setFormInitial] = useState<FormState>(emptyForm());

  const openCreate = useCallback(() => {
    setEditingUsuario(null);
    setFormInitial(emptyForm());
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((u: Usuario) => {
    if (USUARIOS_PROTEGIDOS.includes(u.correo)) {
      toast.error("Este usuario está protegido y no se puede editar.");
      return;
    }
    setEditingUsuario(u);
    // El documento no está en la cuenta: se precarga desde el conductor vinculado
    // (useUsuariosData) para que editar sin tocarlo no lo borre.
    const conductor = data.conductorDeUsuario(u.id);
    setFormInitial({
      correo: u.correo,
      // Se deja vacío a propósito: el hint del formulario dice
      // "vacío = sin cambios", así que no debe pre-cargarse la
      // contraseña real (ver handleSave, que omite este campo si llega vacío).
      password: "",
      confirmPassword: "",
      nombre: u.nombre,
      numero: u.numero,
      rol: String(u.rol),
      estado: u.estado,
      tipoDocumento: conductor?.tipoDocumento ?? "CC",
      numeroDocumento: conductor?.numeroDocumento ?? "",
      tipoUsuarioId: conductor?.tipoUsuarioId ?? "",
    });
    setDialogOpen(true);
  }, [data]);

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

      // El rol se guarda tal como se eligió: antes, cualquier rol distinto de los 3 fijos
      // (uno creado desde la pantalla de Roles) se sustituía por Conductor al guardar, así
      // que "el rol seleccionado" no se mantenía.
      const payload = { ...form, rol: Number(form.rol) } as Omit<Usuario, "id">;

      // Misma protección que handleToggleEstado, pero para el otro camino que puede dejar
      // al sistema sin Admin: editar el rol o el estado del único Admin activo desde este
      // formulario en vez de usar el botón de activar/desactivar.
      if (
        editingUsuario &&
        editingUsuario.estado === "activo" &&
        editingUsuario.rol === ROLES.ADMIN &&
        (payload.rol !== ROLES.ADMIN || payload.estado !== "activo")
      ) {
        const adminsActivos = data.usuarios.filter((x) => x.rol === ROLES.ADMIN && x.estado === "activo");
        if (adminsActivos.length <= 1) {
          toast.error("No puedes quitarle el rol de Administrador ni desactivar al único administrador activo del sistema.");
          return;
        }
      }

      try {
        let usuarioId = editingUsuario?.id ?? null;

        if (editingUsuario) {
          // Corrección: si el campo de contraseña se deja vacío al editar,
          // no debe sobreescribir la contraseña existente (así lo indica
          // el hint "vacío = sin cambios" del formulario) — y de todas formas
          // la API rechaza un PUT que incluya contraseña (ver services/api/usuarios.ts).
          const { password, ...rest } = payload;
          void password;
          await data.updateUsuario(editingUsuario.id, rest);
        } else {
          const creado = await data.addUsuario(payload);
          usuarioId = creado.id;
        }

        toast.success(editingUsuario ? "Usuario actualizado correctamente" : "Usuario creado correctamente");

        // El documento se guarda en el `conductor` vinculado (la tabla `usuario` no tiene
        // esas columnas) y requiere `tipoUsuarioId`, que es FK obligatoria de ese modelo.
        // Va en su PROPIO try: la cuenta ya está creada en el backend, así que si este paso
        // falla no puede propagarse como si hubiera fallado todo — se avisa exactamente qué
        // quedó pendiente, en vez de dejar creer que no se creó nada.
        if (usuarioId && form.numeroDocumento.trim() && form.tipoUsuarioId) {
          try {
            await data.guardarDocumentoDeUsuario(usuarioId, {
              tipoDocumento: form.tipoDocumento,
              numeroDocumento: form.numeroDocumento.trim(),
              tipoUsuarioId: form.tipoUsuarioId,
              nombre: payload.nombre,
              correo: payload.correo,
              numeroTelefonico: payload.numero,
            });
          } catch (error) {
            console.error("Error saving user document:", error);
            const motivo = error instanceof Error && error.message ? `: ${error.message}` : ".";
            toast.error(`La cuenta se guardó, pero el documento no${motivo} Puedes registrarlo desde el módulo Conductores.`);
          }
        } else if (usuarioId && form.numeroDocumento.trim() && !form.tipoUsuarioId) {
          toast.error("La cuenta se guardó, pero el documento no: falta el tipo de usuario (no se pudo cargar su catálogo).");
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
      // El único Admin activo que quede no se puede desactivar — dejaría al sistema sin
      // nadie que pueda administrarlo. Se revalida en vivo (no es una lista fija de correos
      // como USUARIOS_PROTEGIDOS): cualquier Admin puede quedar en esta situación según cómo
      // estén activados/desactivados los demás en este momento.
      if (u.estado === "activo" && u.rol === ROLES.ADMIN) {
        const adminsActivos = data.usuarios.filter((x) => x.rol === ROLES.ADMIN && x.estado === "activo");
        if (adminsActivos.length <= 1) {
          toast.error("No puedes desactivar al único administrador activo del sistema.");
          return;
        }
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
