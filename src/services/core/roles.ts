/**
 * Espejo de `src/config/roles.js` en la API real (Api-ParkU): los 3 roles son
 * fijos y cada endpoint protegido autoriza con `verificarRol([...])`
 * hardcodeado por ruta en el servidor — no hay una tabla de permisos
 * configurable que el backend consulte en vivo (existen `permiso`/
 * `rol_permiso`, pero el middleware que los usaría no está enchufado en
 * ninguna ruta todavía).
 *
 * Por eso `PERMISOS_POR_ROL` es una matriz estática en el frontend, no un
 * valor editable: reproduce exactamente los `verificarRol([...])` reales de
 * cada endpoint, campo a campo igual a los 3 roles que traía el mock
 * (Administrador/Vigilante/Comunidad SENA) — ver services/core/db.ts (ya
 * eliminado) para el origen de esos valores.
 *
 * Excepción deliberada: `CONDUCTOR.parqueaderos` se puso en `true` (el mock
 * lo traía en `false`) para que Comunidad SENA pueda ver el mapa/disponibilidad
 * y reservar una celda — de otro modo `reservas: true` no tiene forma de
 * usarse, ya que el único flujo de creación de reserva vive dentro de esta
 * página. Si el backend real todavía bloquea `GET /parqueaderos` o
 * `GET /celdas` para el rol Conductor, hay que habilitarlo ahí también; el
 * resto de acciones de esta pantalla (crear/editar parqueadero, ingreso/
 * egreso de vehículos, asignación inteligente) siguen vetadas para Conductor
 * vía `celdas`/`asignaciones`/`entradaSalida`. `incidentes` sí se habilitó
 * (HU 07.1.11-07.1.14, "Mis incidentes") — ver el comentario junto a ese
 * campo más abajo para el porqué es parcial hoy.
 */

export const ROLES = {
  ADMIN: 1,
  VIGILANTE: 2,
  CONDUCTOR: 3,
} as const;

export type RolId = (typeof ROLES)[keyof typeof ROLES];

export interface PermisosRol {
  dashboard: boolean;
  roles: boolean;
  usuarios: boolean;
  conductores: boolean;
  vehiculos: boolean;
  /** Autoservicio: "Mis Vehículos" (ver/crear/editar SUS PROPIOS vehículos). Distinto de
   *  `vehiculos`, que es la gestión administrativa de la flota de TODOS los conductores. */
  misVehiculos: boolean;
  parqueaderos: boolean;
  celdas: boolean;
  asignaciones: boolean;
  entradaSalida: boolean;
  reservas: boolean;
  incidentes: boolean;
  reconocimientoPlacas: boolean;
}

const TODO_PERMITIDO: PermisosRol = {
  dashboard: true,
  roles: true,
  usuarios: true,
  conductores: true,
  vehiculos: true,
  // "Mis Vehículos" es el autoservicio del Conductor (sus propios vehículos). El
  // Administrador gestiona la flota completa desde Conductores; esta pestaña no le sirve.
  misVehiculos: false,
  parqueaderos: true,
  celdas: true,
  asignaciones: true,
  entradaSalida: true,
  reservas: true,
  incidentes: true,
  reconocimientoPlacas: true,
};

export const PERMISOS_POR_ROL: Record<RolId, PermisosRol> = {
  [ROLES.ADMIN]: TODO_PERMITIDO,
  [ROLES.VIGILANTE]: {
    dashboard: true,
    roles: false,
    usuarios: false,
    conductores: true,
    vehiculos: true,
    misVehiculos: false,
    parqueaderos: true,
    celdas: true,
    asignaciones: true,
    entradaSalida: true,
    reservas: true,
    incidentes: true,
    reconocimientoPlacas: true,
  },
  [ROLES.CONDUCTOR]: {
    dashboard: true,
    roles: false,
    usuarios: false,
    conductores: false,
    // Habilita "Registrar mi vehículo" desde el Dashboard del conductor (ver
    // ConductorDashboard.tsx / useRegistrarVehiculoConductor). El backend real ya acepta
    // Conductor (rol 3) en `POST /vehiculos`, `PUT /vehiculos/:id` y
    // `POST /vehiculos/:id/conductores` (ver vehiculo.routes.js::verificarAcceso), forzando
    // el conductor_id al propio usuario.
    vehiculos: true,
    // Habilita "Mis Vehículos": el registro/gestión propia de vehículos del conductor.
    misVehiculos: true,
    // Solo lectura del mapa/disponibilidad de celdas + reservar una: ve la sección de
    // Parqueaderos, pero sin `celdas`/`asignaciones` no puede crear/editar parqueaderos ni
    // usar asignación inteligente. Sí puede abrir la pantalla de Entrada/Salida porque ese
    // flujo es donde consulta su propio acceso a la sede y registra su estado de ingreso/salida.
    parqueaderos: true,
    celdas: false,
    asignaciones: false,
    entradaSalida: true,
    reservas: true,
    // El conductor puede consultar y reportar incidentes de su propia operación dentro de la
    // aplicación, y también ver la vista de incidentes para gestionar su caso o novedad.
    incidentes: true,
    reconocimientoPlacas: false,
  },
};

export const PERMISOS_VACIOS: PermisosRol = {
  dashboard: false,
  roles: false,
  usuarios: false,
  conductores: false,
  vehiculos: false,
  misVehiculos: false,
  parqueaderos: false,
  celdas: false,
  asignaciones: false,
  entradaSalida: false,
  reservas: false,
  incidentes: false,
  reconocimientoPlacas: false,
};

export function normalizarRolId(valor: unknown): RolId | null {
  const rolesValidos = Object.values(ROLES) as RolId[];

  if (typeof valor === 'number' && Number.isInteger(valor)) {
    return rolesValidos.includes(valor as RolId) ? (valor as RolId) : null;
  }

  if (typeof valor === 'string') {
    const valorNormalizado = valor.trim();
    if (!valorNormalizado) return null;

    const num = Number(valorNormalizado);
    if (Number.isInteger(num) && rolesValidos.includes(num as RolId)) {
      return num as RolId;
    }

    const mapa: Record<string, RolId> = {
      admin: ROLES.ADMIN,
      administrador: ROLES.ADMIN,
      'administrador ': ROLES.ADMIN,
      vigilante: ROLES.VIGILANTE,
      conductor: ROLES.CONDUCTOR,
      comunidadsena: ROLES.CONDUCTOR,
      'comunidad sena': ROLES.CONDUCTOR,
    };

    const clave = valorNormalizado.toLowerCase();
    return mapa[clave] ?? null;
  }

  return null;
}

export function esRolId(valor: unknown): valor is RolId {
  return normalizarRolId(valor) !== null;
}

export function permisosDeRol(rolId: number | string | null | undefined): PermisosRol | null {
  const rol = normalizarRolId(rolId);
  return rol !== null ? PERMISOS_POR_ROL[rol] : null;
}

const NOMBRES_ROL: Record<RolId, string> = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.VIGILANTE]: 'Vigilante',
  [ROLES.CONDUCTOR]: 'Conductor',
};

export function nombreDeRol(rolId: number | string | null | undefined): string {
  const rol = normalizarRolId(rolId);
  return rol !== null ? NOMBRES_ROL[rol] : 'Desconocido';
}

/**
 * Qué vista habilita cada permiso REAL del backend (tabla `permiso`, catálogo en
 * GET /api/permisos). Es la traducción entre las dos vocabularios: el backend nombra
 * acciones sobre módulos ("reservas.gestionar") y esta interfaz nombra pantallas
 * ("reservas").
 *
 * Sin este mapa, marcar casillas en el editor de roles no cambiaba nada de lo que se ve:
 * el menú se decidía SOLO con la matriz estática de los tres roles del sistema, así que un
 * rol creado a medida entraba sin ninguna pestaña por muchos permisos que se le dieran.
 *
 * Cada permiso de `.gestionar` habilita también lo que su pantalla necesita para actuar
 * (crear celdas, asignar…). Un permiso que el backend añada y no esté aquí simplemente no
 * abre ninguna vista: no rompe nada, solo no se refleja hasta que se le dé su sitio.
 */
export const VISTAS_POR_PERMISO: Record<string, (keyof PermisosRol)[]> = {
  'configuracion.gestionar': ['roles'],
  'usuarios.consultar': ['usuarios'],
  'usuarios.gestionar': ['usuarios'],
  // Sin 'misVehiculos': esa pestaña es el autoservicio del rol Conductor, no algo que
  // abra gestionar conductores (un Vigilante o un rol a medida no tiene vehículos propios).
  'conductores.consultar': ['conductores', 'vehiculos'],
  'conductores.gestionar': ['conductores', 'vehiculos'],
  'parqueaderos.consultar': ['parqueaderos'],
  'parqueaderos.gestionar': ['parqueaderos', 'celdas', 'asignaciones'],
  // Ojo con estos dos: la pantalla de entradas/salidas no es un listado, es donde se
  // ESTACIONA y se da salida a un vehículo. Abrirla con un permiso de solo consulta le
  // ponía el botón "Estacionar Vehículo" a un Conductor (su rol tiene ingreso.consultar),
  // que es justo lo que no debe poder hacer: él solicita una reserva y el vigilante lo
  // ingresa. Por eso solo la abren los permisos de gestión.
  'ingreso.consultar': [],
  // El ingreso se registra desde el mapa de Parqueaderos (botón de estacionar sobre una
  // celda), así que este permiso también tiene que abrir esa pantalla.
  'ingreso.gestionar': ['entradaSalida', 'asignaciones', 'parqueaderos'],
  'salida.consultar': [],
  'salida.gestionar': ['entradaSalida'],
  'reservas.consultar': ['reservas'],
  'reservas.gestionar': ['reservas'],
  'novedades.consultar': ['incidentes'],
  'novedades.gestionar': ['incidentes', 'reconocimientoPlacas'],
  'reportes.consultar': ['dashboard'],
};

/**
 * Las vistas que puede abrir alguien, combinando lo que le da su ROL con lo que le dan sus
 * PERMISOS.
 *
 * - Administrador: todo, sin mirar la tabla (el backend le deja pasar igual, por rol).
 * - Los otros dos roles del sistema: parten de su matriz estática, porque el backend sigue
 *   autorizándolos por rol en muchas rutas (`verificarAcceso({ roles: [...] })`); los
 *   permisos solo pueden SUMAR.
 * - Cualquier rol creado a medida: parte de cero y ve exactamente lo que sus permisos digan.
 *
 * Un rol a medida NO recibe el Dashboard de regalo: solo lo ve si tiene `reportes.consultar`.
 * Así, un rol con solo "Registrar salidas" ve únicamente Entrada / Salida. A dónde se entra
 * tras iniciar sesión lo decide `rutaInicial`, que ya no asume que el Dashboard existe.
 *
 * @param rolId - Rol del usuario.
 * @param permisosBackend - Nombres de permiso tal como los devuelve la API (login,
 *   /auth/verificar y /auth/perfil los incluyen).
 */
export function permisosDeVistas(
  rolId: number | string | null | undefined,
  permisosBackend: readonly string[] = []
): PermisosRol {
  const rol = normalizarRolId(rolId);
  if (rol === ROLES.ADMIN) return { ...TODO_PERMITIDO };

  const vistas: PermisosRol = rol !== null
    ? { ...PERMISOS_POR_ROL[rol] }
    : { ...PERMISOS_VACIOS };

  for (const permiso of permisosBackend) {
    for (const vista of VISTAS_POR_PERMISO[permiso] ?? []) vistas[vista] = true;
  }
  return vistas;
}

/**
 * Orden en que se busca la pantalla de inicio: el mismo del menú lateral. Vive aquí (y no se
 * importa de layouts/lib/menu.ts) para que core no dependa de la capa de presentación.
 */
const RUTAS_POR_VISTA: [keyof PermisosRol, string][] = [
  ['dashboard', '/app/dashboard'],
  ['roles', '/app/roles'],
  ['usuarios', '/app/usuarios'],
  ['conductores', '/app/conductores'],
  ['parqueaderos', '/app/parqueaderos'],
  ['misVehiculos', '/app/mis-vehiculos'],
  ['entradaSalida', '/app/entrada-salida'],
  ['reservas', '/app/reservas'],
  ['incidentes', '/app/incidentes'],
];

/**
 * Primera pantalla que el usuario puede abrir: el Dashboard si lo tiene y, si no, el primer
 * módulo que sus permisos le den (un rol con solo "Registrar salidas" entra directo a
 * Entrada / Salida). Sin ningún módulo, su perfil — la única página que no exige permiso.
 */
export function rutaInicial(permisos: PermisosRol | null | undefined): string {
  const encontrada = RUTAS_POR_VISTA.find(([vista]) => permisos?.[vista]);
  return encontrada ? encontrada[1] : '/app/perfil';
}
