export interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: {
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
  };
  estado: 'activo' | 'inactivo';
}

/** Clasifica a la persona dueña de la cuenta, independiente del rol de
 * permisos (Administrador/Vigilante/rol base): un usuario con el rol base
 * puede ser, entre otros, visitante, estudiante, docente o administrativo. */
export type TipoUsuario = 'visitante' | 'estudiante' | 'docente' | 'administrativo' | 'otro';

export interface Usuario {
  id: string;
  correo: string;
  password: string;
  nombre: string;
  numero: string;
  rol: string;
  tipoUsuario: TipoUsuario;
  tipoDocumento: string;
  identificacion: string;
  estado: 'activo' | 'inactivo';
  foto?: string;
}
