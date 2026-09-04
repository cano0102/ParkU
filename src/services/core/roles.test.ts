import { describe, it, expect } from 'vitest';
import { ROLES, permisosDeVistas, VISTAS_POR_PERMISO, PERMISOS_POR_ROL } from './roles';
import { menuItems } from '@/layouts/lib/menu';

/**
 * Los permisos que el backend concede a un rol tienen que abrir las pantallas
 * correspondientes. Antes el menú salía SOLO de la matriz estática de los tres roles del
 * sistema, así que un rol creado a medida entraba sin ninguna pestaña por muchas casillas
 * que se le marcaran en el editor de roles.
 */
describe('permisosDeVistas — de permisos del backend a pantallas', () => {
  const ROL_A_MEDIDA = 42;

  it('un rol a medida sin permisos solo ve el Dashboard', () => {
    const vistas = permisosDeVistas(ROL_A_MEDIDA, []);
    expect(vistas.dashboard).toBe(true);
    expect(vistas.usuarios).toBe(false);
    expect(vistas.reservas).toBe(false);
    expect(vistas.roles).toBe(false);
  });

  it('cada permiso abre su pantalla', () => {
    expect(permisosDeVistas(ROL_A_MEDIDA, ['reservas.consultar']).reservas).toBe(true);
    expect(permisosDeVistas(ROL_A_MEDIDA, ['usuarios.consultar']).usuarios).toBe(true);
    expect(permisosDeVistas(ROL_A_MEDIDA, ['conductores.consultar']).conductores).toBe(true);
    expect(permisosDeVistas(ROL_A_MEDIDA, ['novedades.consultar']).incidentes).toBe(true);
    expect(permisosDeVistas(ROL_A_MEDIDA, ['ingreso.gestionar']).entradaSalida).toBe(true);
    expect(permisosDeVistas(ROL_A_MEDIDA, ['salida.consultar']).entradaSalida).toBe(true);
    expect(permisosDeVistas(ROL_A_MEDIDA, ['configuracion.gestionar']).roles).toBe(true);
    expect(permisosDeVistas(ROL_A_MEDIDA, ['parqueaderos.consultar']).parqueaderos).toBe(true);
  });

  it('los permisos de gestión abren también lo que esa pantalla necesita para actuar', () => {
    const vistas = permisosDeVistas(ROL_A_MEDIDA, ['parqueaderos.gestionar']);
    expect(vistas.parqueaderos).toBe(true);
    expect(vistas.celdas).toBe(true);
    expect(vistas.asignaciones).toBe(true);
  });

  it('varios permisos se acumulan, y solo abren lo suyo', () => {
    const vistas = permisosDeVistas(ROL_A_MEDIDA, ['reservas.gestionar', 'novedades.consultar']);
    expect(vistas.reservas).toBe(true);
    expect(vistas.incidentes).toBe(true);
    expect(vistas.usuarios).toBe(false);
  });

  it('un permiso que la interfaz todavía no conoce no rompe nada', () => {
    const vistas = permisosDeVistas(ROL_A_MEDIDA, ['inventado.gestionar']);
    expect(vistas.dashboard).toBe(true);
    expect(vistas.usuarios).toBe(false);
  });

  it('el Administrador lo ve todo sin mirar la tabla', () => {
    const vistas = permisosDeVistas(ROLES.ADMIN, []);
    expect(Object.values(vistas).every(Boolean)).toBe(true);
  });

  it('los otros roles del sistema conservan su matriz y los permisos solo SUMAN', () => {
    // El backend sigue autorizándolos por rol en muchas rutas, así que quitarles lo que ya
    // tenían por no estar en `rol_permiso` los dejaría sin pantallas que sí pueden usar.
    const conductor = permisosDeVistas(ROLES.CONDUCTOR, []);
    expect(conductor).toEqual(PERMISOS_POR_ROL[ROLES.CONDUCTOR]);

    const conUsuarios = permisosDeVistas(ROLES.CONDUCTOR, ['usuarios.consultar']);
    expect(conUsuarios.usuarios).toBe(true);
    expect(conUsuarios.reservas).toBe(true); // lo que ya tenía sigue ahí
  });

  it('toda pantalla del menú se puede abrir con algún permiso', () => {
    // Si se añade una entrada al menú sin un permiso que la habilite, ningún rol a medida
    // podrá verla nunca: es justo lo que pasaba con Conductores.
    const habilitables = new Set(Object.values(VISTAS_POR_PERMISO).flat());
    const sinPermiso = menuItems.filter((item) => !habilitables.has(item.permission));
    expect(sinPermiso.map((i) => i.label)).toEqual([]);
  });
});
