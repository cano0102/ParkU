import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { actualizarPerfil } from "@/services/api/usuarios";
import { EMAIL_REGEX, validarTelefono, validarNumeroDocumento } from "@/utils/validation";

/** Los campos de la cuenta que se editan desde el propio perfil. */
export interface PerfilForm {
  nombre: string;
  correo: string;
  numero: string;
  tipoDocumento: string;
  numeroDocumento: string;
}

export type CampoPerfil = keyof PerfilForm;

/** Datos de sesión que necesita el formulario. Todos opcionales: la pantalla monta el hook
 *  antes de comprobar que hay sesión, y una sesión guardada de antes puede venir incompleta. */
interface UsuarioDelPerfil {
  nombre?: string;
  correo?: string;
  numero?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
}

const desdeUsuario = (user: UsuarioDelPerfil): PerfilForm => ({
  nombre: user.nombre ?? "",
  correo: user.correo ?? "",
  // El teléfono y el documento son opcionales en toda la aplicación: una cuenta sin ellos
  // es válida, y sin este respaldo el .trim() de la validación tumbaba la pantalla entera.
  numero: user.numero ?? "",
  tipoDocumento: user.tipoDocumento || "CC",
  numeroDocumento: user.numeroDocumento ?? "",
});

/**
 * Edición del propio perfil, con validación en vivo.
 *
 * Guarda contra la API (PUT /api/usuarios/perfil) y no solo en este navegador: antes el
 * cambio vivía en localStorage, así que se perdía al volver a entrar y ni el módulo de
 * Usuarios ni el de Conductores lo veían nunca. Tras guardar se invalidan las dos listas
 * para que esas pantallas se refresquen solas — el backend sincroniza el conductor vinculado
 * dentro de la misma transacción.
 */
export function usePerfilForm(user: UsuarioDelPerfil) {
  const { updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [profileForm, setProfileForm] = useState<PerfilForm>(() => desdeUsuario(user));
  const [profileTouched, setProfileTouched] = useState<Partial<Record<CampoPerfil, boolean>>>({});

  const profileErrors: Record<CampoPerfil, string> = {
    nombre: profileForm.nombre.trim() ? "" : "El nombre no puede estar vacío",
    correo: !profileForm.correo.trim()
      ? "El correo no puede estar vacío"
      : EMAIL_REGEX.test(profileForm.correo.trim())
        ? ""
        : "Ingresa un correo electrónico válido",
    numero: profileForm.numero.trim() && !validarTelefono(profileForm.numero.trim())
      ? "Ingresa un número de teléfono colombiano válido (10 dígitos)"
      : "",
    tipoDocumento: "",
    // El documento puede faltar (hay cuentas creadas sin él), pero si se escribe debe valer.
    numeroDocumento: profileForm.numeroDocumento.trim() && !validarNumeroDocumento(profileForm.numeroDocumento)
      ? "El número de documento debe tener entre 6 y 10 dígitos"
      : "",
  };
  const primerError = Object.values(profileErrors).find(Boolean) ?? "";
  const profileInvalido = !!primerError;

  const markProfileTouched = (campo: CampoPerfil) => setProfileTouched((t) => ({ ...t, [campo]: true }));
  const setCampo = (campo: CampoPerfil, valor: string) => setProfileForm((f) => ({ ...f, [campo]: valor }));
  const errorDe = (campo: CampoPerfil) => (profileTouched[campo] ? profileErrors[campo] : "");

  const startEdit = () => {
    setProfileForm(desdeUsuario(user));
    setProfileTouched({});
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setProfileForm(desdeUsuario(user));
    setProfileTouched({});
  };

  const handleSaveProfile = async () => {
    setProfileTouched({ nombre: true, correo: true, numero: true, numeroDocumento: true });
    if (profileInvalido) {
      toast.error(primerError);
      return;
    }

    setGuardando(true);
    try {
      const guardado = await actualizarPerfil(profileForm);
      updateUser({
        nombre: guardado.nombre,
        correo: guardado.correo,
        numero: guardado.numero,
        tipoDocumento: guardado.tipoDocumento || undefined,
        numeroDocumento: guardado.numeroDocumento || undefined,
      });
      // Usuarios y Conductores leen esta misma cuenta desde la API. Sin invalidar sus listas
      // seguirían mostrando los datos viejos hasta que alguien recargara la página.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["usuarios"] }),
        queryClient.invalidateQueries({ queryKey: ["conductores"] }),
      ]);
      toast.success("Perfil actualizado");
      setEditMode(false);
    } catch (error) {
      // El backend responde con el motivo exacto (correo repetido, documento en uso…), que
      // es lo único útil que se puede mostrar aquí.
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el perfil");
    } finally {
      setGuardando(false);
    }
  };

  return {
    editMode, profileForm, setProfileForm, setCampo, profileTouched, profileErrors, profileInvalido,
    errorDe, guardando, markProfileTouched, startEdit, cancelEdit, handleSaveProfile,
  };
}
