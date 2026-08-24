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
