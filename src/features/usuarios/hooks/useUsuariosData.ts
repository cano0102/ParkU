import { useMemo } from "react";
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useRemoveUsuario } from "./useUsuarios";
import type { Usuario } from "@/services/api/usuarios";
import type { Conductor } from "@/services/api/conductores";
import { useRoles } from "@/features/roles";
import { useConductores } from "@/features/conductores";
import { nombreDeRol, ROLES } from "@/services/core/roles";
import { useFotos } from "@/hooks/useFotos";

/** Queries, mutaciones y totales de la página de Usuarios. */
export function useUsuariosData() {
  const { data: usuarios = [], isLoading } = useUsuarios();
  const { data: roles = [] } = useRoles();
  const createUsuarioMutation = useCreateUsuario();
  const updateUsuarioMutation = useUpdateUsuario();
  const removeUsuarioMutation = useRemoveUsuario();
  // `mutateAsync` (no `.mutate`): quien llama necesita el `await`/try-catch para no
  // mostrar un toast de "éxito" ni cerrar su diálogo cuando la mutación en realidad falla.
  const addUsuario = (data: Omit<Usuario, "id">) => createUsuarioMutation.mutateAsync(data);
  const updateUsuario = (id: string, data: Partial<Omit<Usuario, "id">>) =>
    updateUsuarioMutation.mutateAsync({ id, data });
  // Borrado real: la fila desaparece de la tabla `usuario` (DELETE /api/usuarios/:id). El
  // backend se lleva lo que era solo de la cuenta, suelta al conductor -- que sobrevive con
  // su documento y sus vehículos -- y responde 409 si la cuenta tiene actividad que quedaría
  // sin autor.
  const removeUsuario = (id: string) => removeUsuarioMutation.mutateAsync(id);

  /**
   * Documento de identidad: se lee de la PROPIA cuenta. `usuario` ya tiene columnas
   * `tipo_documento`/`numero_documento` (migración 002 del backend); antes no las tenía y
   * había que ir a buscarlo al conductor vinculado.
   */
  const documentoDe = (usuarioId: string) => {
    const u = usuarios.find((x) => x.id === usuarioId);
    return u?.numeroDocumento ? { tipo: u.tipoDocumento ?? "CC", numero: u.numeroDocumento } : null;
  };

  // La lista de conductores se sigue cargando, pero solo para AVISAR de documentos
  // repetidos en el formulario (useUsuarioForm) — ya no para guardar nada.
  const { data: conductores = [] } = useConductores();

  const conductorPorUsuarioId = useMemo(
    () => new Map(conductores.filter((c) => c.usuarioId).map((c) => [c.usuarioId, c])),
    [conductores]
  );
  const conductorDeUsuario = (usuarioId: string) => conductorPorUsuarioId.get(usuarioId) ?? null;

  // Esta pantalla YA NO crea ni edita conductores. Aquí vivía `guardarDocumentoDeUsuario`,
  // que tras guardar la cuenta hacía un POST /api/conductores para dejar ahí el documento
  // (la cuenta no tenía dónde guardarlo). El efecto era que crear un usuario hacía aparecer
  // un conductor que nadie pidió, y esa cuenta quedaba "ya vinculada" y desaparecía del
  // selector del módulo Conductores. Con el documento en la propia cuenta, el rodeo sobra:
  // viaja en el mismo POST/PUT de /api/usuarios (ver services/api/usuarios.ts).
  //
  // El perfil de conductor se crea donde de verdad corresponde: al registrarse uno mismo
  // (POST /api/auth/registro), al darlo de alta en Conductores, o al registrar su vehículo
  // para parquearlo.

  /**
   * Foto de perfil por cuenta. Tampoco es una columna de `usuario` en la API real (igual que
   * el documento), pero a diferencia de aquel no hay ninguna otra tabla donde vivir: se
   * guarda en este navegador (services/core/fotosPerfil.ts), en la MISMA llave que usa la
   * pantalla de Perfil — así, la foto que alguien se puso en su propio perfil es la que
   * aparece aquí para su cuenta, sin pedírsela de nuevo a un Admin.
   */
  const { fotoDe, guardarFoto: guardarFotoUsuario } = useFotos("usuario");

  const totalActivos = useMemo(() => usuarios.filter((u) => u.estado === "activo").length, [usuarios]);
  const totalInactivos = useMemo(() => usuarios.filter((u) => u.estado === "inactivo").length, [usuarios]);
  /**
   * Nombre del rol resuelto contra los roles REALES del backend (`/api/roles`), no contra la
   * tabla estática de los 3 roles fijos: así un rol creado desde la pantalla de Roles se
   * muestra con su nombre (antes salía "Desconocido") y un rol renombrado deja de mostrarse
   * con el nombre viejo. `nombreDeRol` queda solo como respaldo mientras la lista carga.
   */
  const nombreDeRolReal = (rolId: number) =>
    roles.find((r) => r.id === String(rolId))?.nombre ?? nombreDeRol(rolId);

  // El sistema siempre debe quedar con al menos un Admin activo — si solo queda uno, ese es
  // el único que no se puede desactivar (evita que el equipo se quede sin nadie que pueda
  // administrar el sistema). `null` si hay más de un Admin activo (nadie está protegido así).
  const idUltimoAdminActivo = useMemo(() => {
    const adminsActivos = usuarios.filter((u) => u.rol === ROLES.ADMIN && u.estado === "activo");
    return adminsActivos.length === 1 ? adminsActivos[0].id : null;
  }, [usuarios]);

  return {
    usuarios, roles, addUsuario, updateUsuario, removeUsuario, totalActivos, totalInactivos, nombreDeRolReal,
    idUltimoAdminActivo, isLoading, documentoDe, fotoDe, guardarFotoUsuario,
    conductores, conductorDeUsuario,
  };
}

export type UsuariosData = ReturnType<typeof useUsuariosData>;
