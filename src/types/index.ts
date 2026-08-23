/**
 * Tipos de dominio centralizados. Antes vivían dentro de `services/_db.ts`
 * (que ya los concentraba en un solo archivo); moverlos aquí es continuidad,
 * no un cambio de criterio — solo les da una capa propia y reutilizable sin
 * depender del store interno de services/.
 */

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

export interface Usuario {
  id: string;
  correo: string;
  password: string;
  nombre: string;
  numero: string;
  rol: string;
  tipoDocumento: string;
  identificacion: string;
  estado: 'activo' | 'inactivo';
  foto?: string;
}

export interface Parqueadero {
  id: string;
  nombre: string;
  direccion: string;
  capacidad: number;
  horaInicio: string;
  horaFin: string;
  celdasCarros: number;
  celdasMotos: number;
  celdasMovilidadReducida: number;
  descripcion: string;
  estado: 'activo' | 'inactivo';
  tipo: string;
  bloque: string;
}

export interface Celda {
  id: string;
  parqueaderoId: string;
  numero: string;
  tipo: 'carro' | 'moto' | 'movilidad reducida';
  estado: 'disponible' | 'no_disponible' | 'reservada' | 'mantenimiento';
  ocupada: boolean;
  nombre: string;
}

export interface Conductor {
  id: string;
  usuarioId: string;
  nombre: string;
  tipoConductor: 'aprendiz' | 'instructor' | 'administrativo' | 'coordinador' | 'visitante';
  centroFormacion: string;
  discapacidad: boolean;
  tipoDiscapacidad?: string;
  estado: 'activo' | 'inactivo';
  tipo: 'docente' | 'administrativo' | 'visitante';
  email: string;
}

export interface Vehiculo {
  id: string;
  conductorId: string;
  placa: string;
  tipo: 'carro' | 'moto';
  marca: string;
  modelo: string;
  año: number;
  color: string;
  descripcion: string;
  estado: 'activo' | 'inactivo';
  parqueaderoId: string;
  celdaId: string;
  fechaEntrada: string;
}

export interface ControlSalida {
  id: string;
  vehiculoId: string;
  celdaId: string;
  fechaEntrada: string;
  fechaSalida?: string;
  estado: 'en_parqueadero' | 'finalizado';
}

export interface Reserva {
  id: string;
  vehiculoId: string;
  celdaId: string;
  fechaReserva: string;
  horaInicio: string;
  horaFin: string;
  estado: 'pendiente' | 'activa' | 'completada' | 'cancelada';
}

export interface Movimiento {
  id: string;
  placa: string;
  tipo: 'entrada' | 'salida';
  fecha: string;
  parqueaderoId: string;
  conductorNombre: string;
}

export interface Incidente {
  id: string;
  descripcion: string;
  parqueaderoId: string;
  celdaId?: string;
  celdaNumero?: string;
  vehiculo?: string;
  conductor?: string;
  evidencia?: string;
  fecha: string;
  estado: 'pendiente' | 'resuelto';
  asignadoA?: string;
  notasResolucion?: string;
}
