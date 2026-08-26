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
 * egreso de vehículos, asignación inteligente, incidentes) siguen vetadas
 * para Conductor vía `celdas`/`asignaciones`/`entradaSalida`/`incidentes`.
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
    vehiculos: false,
    // Solo lectura del mapa/disponibilidad de celdas + reservar una: ve la sección de
    // Parqueaderos, pero sin `celdas`/`asignaciones`/`entradaSalida`/`incidentes` no puede
    // crear/editar parqueaderos, registrar ingresos/egresos, usar asignación inteligente ni
    // reportar incidentes (esas acciones están gateadas en la UI por esos permisos, no por
    // este). Ver ParqueaderosPage.tsx / CeldaInfoModal.tsx.
    parqueaderos: true,
    celdas: false,
    asignaciones: false,
    entradaSalida: false,
    reservas: true,
    incidentes: false,
    reconocimientoPlacas: false,
  },
};

export const PERMISOS_VACIOS: PermisosRol = {
  dashboard: false,
  roles: false,
  usuarios: false,
  conductores: false,
  vehiculos: false,
  parqueaderos: false,
  celdas: false,
  asignaciones: false,
  entradaSalida: false,
  reservas: false,
  incidentes: false,
  reconocimientoPlacas: false,
};

export function esRolId(valor: unknown): valor is RolId {
  return valor === ROLES.ADMIN || valor === ROLES.VIGILANTE || valor === ROLES.CONDUCTOR;
}

export function permisosDeRol(rolId: number | null | undefined): PermisosRol | null {
  return esRolId(rolId) ? PERMISOS_POR_ROL[rolId] : null;
}

const NOMBRES_ROL: Record<RolId, string> = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.VIGILANTE]: 'Vigilante',
  [ROLES.CONDUCTOR]: 'Conductor',
};

export function nombreDeRol(rolId: number | null | undefined): string {
  return esRolId(rolId) ? NOMBRES_ROL[rolId] : 'Desconocido';
}
