import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { actualizarPerfil, comprobarDisponibilidad } from "@/services/api/usuarios";
import { EMAIL_REGEX, validarTelefono, validarNumeroDocumento } from "@/utils/validation";

/** Pausa sin teclear antes de preguntarle al backend. La misma que usa Conductores. */
const ESPERA_VALIDACION_MS = 500;

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
  /** Para excluir la propia cuenta de la comprobación de duplicados. */
  id?: string;
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
  /** Lo que solo el backend sabe: si el correo, el teléfono o el documento ya están en uso. */
  const [erroresRemotos, setErroresRemotos] = useState<Partial<Record<CampoPerfil, string>>>({});
  const [comprobando, setComprobando] = useState(false);
  const consultaId = useRef(0);

  const formatoErrors: Record<CampoPerfil, string> = {
    nombre: profileForm.nombre.trim() ? "" : "El nombre no puede estar vacío",
    correo: !profileForm.correo.trim()
      ? "El correo no puede estar vacío"
      : EMAIL_REGEX.test(profileForm.correo.trim())
        ? ""
        : "Ingresa un correo electrónico válido",
    numero: profileForm.numero.trim() && !validarTelefono(profileForm.numero.trim())
      ? "Ingresa un número de teléfono colombiano válido (10 dígitos)"
      : "",
    // Obligatorio: identifica a la persona en el parqueadero. Hay cuentas antiguas creadas
    // sin él, y justamente por eso el perfil pide completarlo antes de dejar guardar.
    tipoDocumento: profileForm.tipoDocumento.trim() ? "" : "El tipo de documento es obligatorio",
    numeroDocumento: !profileForm.numeroDocumento.trim()
      ? "El número de documento es obligatorio"
      : !validarNumeroDocumento(profileForm.numeroDocumento)
        ? "El número de documento debe tener entre 6 y 10 dígitos"
        : "",
  };

  /** El del formato manda; el del backend solo aparece si el formato ya está bien. */
  const profileErrors: Record<CampoPerfil, string> = { ...formatoErrors };
  for (const campo of ["correo", "numero", "numeroDocumento"] as const) {
    if (!profileErrors[campo] && erroresRemotos[campo]) profileErrors[campo] = erroresRemotos[campo]!;
  }

  const primerError = Object.values(profileErrors).find(Boolean) ?? "";
  const profileInvalido = !!primerError;

  const markProfileTouched = (campo: CampoPerfil) => setProfileTouched((t) => ({ ...t, [campo]: true }));
  /** Escribir ya cuenta como "tocado": así el aviso sale mientras se escribe, no al salir del campo. */
  const setCampo = (campo: CampoPerfil, valor: string) => {
    setProfileForm((f) => ({ ...f, [campo]: valor }));
    setProfileTouched((t) => (t[campo] ? t : { ...t, [campo]: true }));
    // El aviso del backend se refiere al valor anterior: se retira hasta que llegue el nuevo.
    setErroresRemotos((e) => (e[campo] ? { ...e, [campo]: undefined } : e));
  };
  const errorDe = (campo: CampoPerfil) => (profileTouched[campo] ? profileErrors[campo] : "");

  /**
   * Comprobación contra el backend mientras se escribe, igual que en Conductores: dice si el
   * correo, el teléfono o el documento ya están ocupados, tras una pausa sin teclear. La
   * propia cuenta se excluye, o el formulario se acusaría a sí mismo de duplicado.
   */
  useEffect(() => {
    if (!editMode) {
      setErroresRemotos({});
      setComprobando(false);
      return undefined;
    }
    const correo = profileForm.correo.trim();
    const telefono = profileForm.numero.trim();
    const documento = profileForm.numeroDocumento.trim();
    // Solo se pregunta por lo que ya tiene forma válida: preguntar por "juan@" no aporta nada.
    const mirarCorreo = !!correo && EMAIL_REGEX.test(correo);
    const mirarTelefono = !!telefono && validarTelefono(telefono);
    const mirarDocumento = validarNumeroDocumento(documento);
    if (!mirarCorreo && !mirarTelefono && !mirarDocumento) {
      setErroresRemotos({});
      return undefined;
    }

    const temporizador = setTimeout(async () => {
      const id = ++consultaId.current;
      setComprobando(true);
      try {
        const res = await comprobarDisponibilidad({
          correo: mirarCorreo ? correo : undefined,
          numeroTelefonico: mirarTelefono ? telefono : undefined,
          tipoDocumento: mirarDocumento ? profileForm.tipoDocumento : undefined,
          numeroDocumento: mirarDocumento ? documento : undefined,
          excluirUsuarioId: user.id,
        });
        if (id !== consultaId.current) return; // respuesta vieja
        setErroresRemotos({
          correo: res.correo?.disponible === false ? res.correo.motivo ?? undefined : undefined,
          numero: res.numero_telefonico?.disponible === false ? res.numero_telefonico.motivo ?? undefined : undefined,
          numeroDocumento: res.documento?.disponible === false ? res.documento.motivo ?? undefined : undefined,
        });
      } catch {
        // Sin red o sin permiso no se bloquea el formulario: el backend lo rechazará al
        // guardar y ahí sí se ve el motivo.
      } finally {
        if (id === consultaId.current) setComprobando(false);
      }
    }, ESPERA_VALIDACION_MS);

    return () => clearTimeout(temporizador);
  }, [editMode, profileForm.correo, profileForm.numero, profileForm.tipoDocumento, profileForm.numeroDocumento, user.id]);

  const startEdit = () => {
    setProfileForm(desdeUsuario(user));
    setProfileTouched({});
    setErroresRemotos({});
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setProfileForm(desdeUsuario(user));
    setProfileTouched({});
    setErroresRemotos({});
  };

  const handleSaveProfile = async () => {
    setProfileTouched({ nombre: true, correo: true, numero: true, tipoDocumento: true, numeroDocumento: true });
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
    errorDe, guardando, comprobando, markProfileTouched, startEdit, cancelEdit, handleSaveProfile,
  };
}
