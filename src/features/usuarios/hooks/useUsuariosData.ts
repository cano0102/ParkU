import { useMemo } from "react";
import { useUsuarios, useCreateUsuario, useUpdateUsuario } from "./useUsuarios";
import type { Usuario } from "@/services/api/usuarios";
import type { Conductor } from "@/services/api/conductores";
import { useRoles } from "@/features/roles";
import { useConductores, useCreateConductor, useUpdateConductor } from "@/features/conductores";
import { nombreDeRol, ROLES } from "@/services/core/roles";
import { useFotos } from "@/hooks/useFotos";

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

  /**
   * Documento de identidad por usuario. La cuenta (`usuario`) NO tiene columnas de
   * documento en la API real: ese dato de persona vive en el `conductor` vinculado
   * por `usuario_id` (ver el encabezado de services/api/usuarios.ts y de
   * services/api/conductores.ts). Se resuelve desde ahí en vez de duplicarlo en la
   * cuenta; un usuario sin conductor vinculado simplemente no tiene documento aún.
   */
  const { data: conductores = [] } = useConductores();
  const documentoPorUsuarioId = useMemo(
    () =>
      new Map(
        conductores
          .filter((c) => c.usuarioId && c.numeroDocumento)
          .map((c) => [c.usuarioId, { tipo: c.tipoDocumento, numero: c.numeroDocumento }])
      ),
    [conductores]
  );
  const documentoDe = (usuarioId: string) => documentoPorUsuarioId.get(usuarioId) ?? null;

  const conductorPorUsuarioId = useMemo(
    () => new Map(conductores.filter((c) => c.usuarioId).map((c) => [c.usuarioId, c])),
    [conductores]
  );
  const conductorDeUsuario = (usuarioId: string) => conductorPorUsuarioId.get(usuarioId) ?? null;

  const createConductorMutation = useCreateConductor();
  const updateConductorMutation = useUpdateConductor();

  /**
   * Persiste el documento de una cuenta de Comunidad SENA. Como `usuario` no tiene columnas
   * de documento, se escribe en el `conductor` vinculado: se actualiza si esa cuenta ya
   * tiene uno, y si no, se crea con `usuario_id` apuntando a ella. Al actualizar solo se
   * tocan documento y tipo de usuario — nombre/correo/teléfono del conductor pueden haber
   * sido editados desde su propio módulo y no deben pisarse desde aquí.
   */
  const guardarDocumentoDeUsuario = async (
    usuarioId: string,
    datos: {
      tipoDocumento: string;
      numeroDocumento: string;
      tipoUsuarioId: string;
      nombre: string;
      correo: string;
      numeroTelefonico: string;
    }
  ) => {
    const existente = conductorPorUsuarioId.get(usuarioId);
    const tipoDocumento = datos.tipoDocumento as Conductor["tipoDocumento"];

    if (existente) {
      await updateConductorMutation.mutateAsync({
        id: existente.id,
        data: {
          tipoDocumento,
          numeroDocumento: datos.numeroDocumento,
          tipoUsuarioId: datos.tipoUsuarioId,
        },
      });
      return;
    }

    await createConductorMutation.mutateAsync({
      usuarioId,
      tipoDocumento,
      numeroDocumento: datos.numeroDocumento,
      nombre: datos.nombre,
      correo: datos.correo,
      numeroTelefonico: datos.numeroTelefonico,
      tipoUsuarioId: datos.tipoUsuarioId,
      direccion: "",
      tipoUsuarioNombre: "",
      regionalFormacion: "",
      centroFormacion: "",
      programaFormacion: "",
      vigencia: "",
      movilidadReducida: false,
      tipoDiscapacidad: "",
      estado: "activo",
    });
  };

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
    usuarios, roles, addUsuario, updateUsuario, totalActivos, totalInactivos, nombreDeRolReal,
    idUltimoAdminActivo, isLoading, documentoDe, fotoDe, guardarFotoUsuario,
    conductores, conductorDeUsuario, guardarDocumentoDeUsuario,
  };
}

export type UsuariosData = ReturnType<typeof useUsuariosData>;
