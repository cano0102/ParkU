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
