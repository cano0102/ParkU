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
