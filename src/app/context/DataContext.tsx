import React, { createContext, useContext, useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════
// TIPOS COMPLETOS
// ═══════════════════════════════════════════════════════

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
  /* campos extra para el dashboard */
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
  /* alias para el dashboard */
  nombre: string;
}

export interface Conductor {
  id: string;
  usuarioId: string;
  nombre: string;
  tipoConductor: 'aprendiz' | 'instructor';
  centroFormacion: string;
  discapacidad: boolean;
  tipoDiscapacidad?: string;
  estado: 'activo' | 'inactivo';
  /* alias para el dashboard */
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
  /* campos extra para dashboard */
  parqueaderoId: string;
  celdaId: string;
  fechaEntrada: string;
}

export interface AsignacionCelda {
  id: string;
  celdaId: string;
  vehiculoId: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: 'activa' | 'finalizada';
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

/* ═══════════════════════════════════════════════════════
   CONTEXT TYPE
   ═══════════════════════════════════════════════════════ */
interface DataContextType {
  roles: Rol[];
  addRol: (rol: Omit<Rol, 'id'>) => void;
  updateRol: (id: string, rol: Partial<Rol>) => void;
  deleteRol: (id: string) => void;

  usuarios: Usuario[];
  addUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;

  parqueaderos: Parqueadero[];
  addParqueadero: (parqueadero: Omit<Parqueadero, 'id'>) => void;
  updateParqueadero: (id: string, parqueadero: Partial<Parqueadero>) => void;
  deleteParqueadero: (id: string) => void;

  celdas: Celda[];
  addCelda: (celda: Omit<Celda, 'id'>) => void;
  updateCelda: (id: string, celda: Partial<Celda>) => void;
  deleteCelda: (id: string) => void;

  conductores: Conductor[];
  addConductor: (conductor: Omit<Conductor, 'id'>) => void;
  updateConductor: (id: string, conductor: Partial<Conductor>) => void;
  deleteConductor: (id: string) => void;

  vehiculos: Vehiculo[];
  addVehiculo: (vehiculo: Omit<Vehiculo, 'id'>) => void;
  updateVehiculo: (id: string, vehiculo: Partial<Vehiculo>) => void;
  deleteVehiculo: (id: string) => void;

  asignaciones: AsignacionCelda[];
  addAsignacion: (asignacion: Omit<AsignacionCelda, 'id'>) => void;
  updateAsignacion: (id: string, asignacion: Partial<AsignacionCelda>) => void;
  deleteAsignacion: (id: string) => void;

  controlesSalida: ControlSalida[];
  addControlSalida: (control: Omit<ControlSalida, 'id'>) => void;
  updateControlSalida: (id: string, control: Partial<ControlSalida>) => void;
  deleteControlSalida: (id: string) => void;

  reservas: Reserva[];
  addReserva: (reserva: Omit<Reserva, 'id'>) => void;
  updateReserva: (id: string, reserva: Partial<Reserva>) => void;
  deleteReserva: (id: string) => void;

  movimientos: Movimiento[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/* ═══════════════════════════════════════════════════════
   DATOS INICIALES
   ═══════════════════════════════════════════════════════ */
const initialRoles: Rol[] = [
  {
    id: '1', nombre: 'Administrador', descripcion: 'Acceso total al sistema',
    permisos: { dashboard: true, roles: true, usuarios: true, conductores: true, vehiculos: true, parqueaderos: true, celdas: true, asignaciones: true, entradaSalida: true, reservas: true, incidentes: true, reconocimientoPlacas: true },
    estado: 'activo'
  },
  {
    id: '2', nombre: 'Operador', descripcion: 'Gestión de entradas y salidas',
    permisos: { dashboard: true, roles: false, usuarios: false, conductores: true, vehiculos: true, parqueaderos: false, celdas: true, asignaciones: true, entradaSalida: true, reservas: true, incidentes: true, reconocimientoPlacas: true },
    estado: 'activo'
  },
  {
    id: '3', nombre: 'Usuario', descripcion: 'Acceso básico',
    permisos: { dashboard: true, roles: false, usuarios: false, conductores: false, vehiculos: false, parqueaderos: false, celdas: false, asignaciones: false, entradaSalida: false, reservas: true, incidentes: false, reconocimientoPlacas: false },
    estado: 'activo'
  },
];

const initialUsuarios: Usuario[] = [
  { id: '1', correo: 'admin@parku.edu', password: 'admin123', nombre: 'Juan Pérez', numero: '3001234567', rol: 'Administrador', tipoDocumento: 'CC', identificacion: '1234567890', estado: 'activo' },
  { id: '2', correo: 'operador@parku.edu', password: 'operador123', nombre: 'María González', numero: '3009876543', rol: 'Operador', tipoDocumento: 'CC', identificacion: '0987654321', estado: 'activo' },
];

const initialParqueaderos: Parqueadero[] = [
  { id: '1', nombre: 'PQ-1 Torre A', direccion: 'Calle 100 # 50-30', capacidad: 25, horaInicio: '06:00', horaFin: '22:00', celdasCarros: 15, celdasMotos: 5, celdasMovilidadReducida: 5, descripcion: 'Torre A - Docentes', estado: 'activo', tipo: 'docentes', bloque: 'Torre A' },
  { id: '2', nombre: 'PQ-2 Torre B', direccion: 'Carrera 50 # 105-20', capacidad: 20, horaInicio: '07:00', horaFin: '20:00', celdasCarros: 12, celdasMotos: 5, celdasMovilidadReducida: 3, descripcion: 'Torre B - Docentes', estado: 'activo', tipo: 'docentes', bloque: 'Torre B' },
  { id: '3', nombre: 'PQ-3 Administrativo', direccion: 'Av. 68 # 45-10', capacidad: 18, horaInicio: '06:00', horaFin: '21:00', celdasCarros: 12, celdasMotos: 4, celdasMovilidadReducida: 2, descripcion: 'Edificio Admin', estado: 'activo', tipo: 'administrativos', bloque: 'Edificio Admin' },
  { id: '4', nombre: 'PQ-4 Visitantes', direccion: 'Recepción Principal', capacidad: 15, horaInicio: '07:00', horaFin: '19:00', celdasCarros: 10, celdasMotos: 3, celdasMovilidadReducida: 2, descripcion: 'Zona visitantes', estado: 'activo', tipo: 'visitantes', bloque: 'Recepción' },
  { id: '5', nombre: 'PQ-5 Motos Norte', direccion: 'Zona Norte', capacidad: 35, horaInicio: '06:00', horaFin: '22:00', celdasCarros: 0, celdasMotos: 30, celdasMovilidadReducida: 5, descripcion: 'Parqueadero motos zona norte', estado: 'activo', tipo: 'motos', bloque: 'Zona Norte' },
  { id: '6', nombre: 'PQ-6 Motos Sur', direccion: 'Zona Sur', capacidad: 30, horaInicio: '06:00', horaFin: '22:00', celdasCarros: 0, celdasMotos: 26, celdasMovilidadReducida: 4, descripcion: 'Parqueadero motos zona sur', estado: 'activo', tipo: 'motos', bloque: 'Zona Sur' },
  { id: '7', nombre: 'PQ-7 Bloque C', direccion: 'Torre C', capacidad: 12, horaInicio: '07:00', horaFin: '20:00', celdasCarros: 8, celdasMotos: 2, celdasMovilidadReducida: 2, descripcion: 'En mantenimiento', estado: 'inactivo', tipo: 'docentes', bloque: 'Torre C' },
];

const initialCeldas: Celda[] = [];
(function generateCeldas() {
  let idx = 0;
  for (const pq of initialParqueaderos) {
    const total = pq.celdasCarros + pq.celdasMotos + pq.celdasMovilidadReducida;
    for (let i = 0; i < total; i++) {
      const prefix = i < pq.celdasCarros ? 'C' : i < pq.celdasCarros + pq.celdasMotos ? 'M' : 'MR';
      let estado: Celda['estado'] = 'disponible';
      if (pq.estado === 'inactivo') {
        estado = 'mantenimiento';
      } else {
        const r = Math.random();
        if (r < 0.65) estado = 'no_disponible';
        else if (r < 0.75) estado = 'reservada';
      }
      initialCeldas.push({
        id: `c${idx++}`,
        parqueaderoId: pq.id,
        numero: `${prefix}-${String(i + 1).padStart(3, '0')}`,
        tipo: i < pq.celdasCarros ? 'carro' : i < pq.celdasCarros + pq.celdasMotos ? 'moto' : 'movilidad reducida',
        estado,
        ocupada: estado === 'no_disponible',
        nombre: `${pq.nombre}-${prefix}${i + 1}`,
      });
    }
  }
})();

const initialConductores: Conductor[] = [
  { id: '1', usuarioId: '1', nombre: 'Carlos López M.', tipoConductor: 'instructor', centroFormacion: 'Ingeniería', discapacidad: false, estado: 'activo', tipo: 'docente', email: 'carlos.lopez@sena.edu.co' },
  { id: '2', usuarioId: '2', nombre: 'Ana Martínez R.', tipoConductor: 'aprendiz', centroFormacion: 'Administración', discapacidad: false, estado: 'activo', tipo: 'administrativo', email: 'ana.martinez@sena.edu.co' },
  { id: '3', usuarioId: '1', nombre: 'Pedro Ruiz G.', tipoConductor: 'instructor', centroFormacion: 'Diseño', discapacidad: false, estado: 'activo', tipo: 'docente', email: 'pedro.ruiz@sena.edu.co' },
  { id: '4', usuarioId: '2', nombre: 'María Díaz P.', tipoConductor: 'aprendiz', centroFormacion: 'Gestión Empresarial', discapacidad: false, estado: 'activo', tipo: 'visitante', email: 'maria.diaz@ext.com' },
  { id: '5', usuarioId: '1', nombre: 'Jorge Silva T.', tipoConductor: 'instructor', centroFormacion: 'Informática', discapacidad: false, estado: 'activo', tipo: 'administrativo', email: 'jorge.silva@sena.edu.co' },
  { id: '6', usuarioId: '2', nombre: 'Laura Gómez H.', tipoConductor: 'aprendiz', centroFormacion: 'Ingeniería', discapacidad: false, estado: 'activo', tipo: 'docente', email: 'laura.gomez@sena.edu.co' },
  { id: '7', usuarioId: '1', nombre: 'Diego Herrera F.', tipoConductor: 'instructor', centroFormacion: 'Electricidad', discapacidad: false, estado: 'activo', tipo: 'administrativo', email: 'diego.herrera@sena.edu.co' },
  { id: '8', usuarioId: '2', nombre: 'Sofía Castillo', tipoConductor: 'aprendiz', centroFormacion: 'Diseño Gráfico', discapacidad: true, tipoDiscapacidad: 'Visual', estado: 'activo', tipo: 'visitante', email: 'sofia.cast@ext.com' },
  { id: '9', usuarioId: '1', nombre: 'Andrés Morales', tipoConductor: 'instructor', centroFormacion: 'Mecánica', discapacidad: false, estado: 'activo', tipo: 'docente', email: 'andres.morales@sena.edu.co' },
  { id: '10', usuarioId: '2', nombre: 'Camila Rodríguez', tipoConductor: 'aprendiz', centroFormacion: 'Contabilidad', discapacidad: false, estado: 'activo', tipo: 'administrativo', email: 'camila.rodriguez@sena.edu.co' },
];

const initialVehiculos: Vehiculo[] = [
  { id: 'v1', conductorId: '1', placa: 'ABC123', tipo: 'carro', marca: 'Toyota', modelo: 'Corolla', año: 2020, color: 'Blanco', descripcion: 'Sedán 4 puertas', estado: 'activo', parqueaderoId: '1', celdaId: 'c0', fechaEntrada: '2025-06-20T07:15' },
  { id: 'v2', conductorId: '2', placa: 'DEF456', tipo: 'carro', marca: 'Chevrolet', modelo: 'Spark', año: 2019, color: 'Rojo', descripcion: 'Compacto', estado: 'activo', parqueaderoId: '3', celdaId: 'c45', fechaEntrada: '2025-06-20T07:45' },
  { id: 'v3', conductorId: '3', placa: 'GHI789', tipo: 'carro', marca: 'Renault', modelo: 'Logan', año: 2021, color: 'Gris', descripcion: 'Sedán', estado: 'activo', parqueaderoId: '2', celdaId: 'c25', fechaEntrada: '2025-06-20T08:10' },
  { id: 'v4', conductorId: '4', placa: 'JKL012', tipo: 'carro', marca: 'Mazda', modelo: '3', año: 2022, color: 'Azul', descripcion: 'Hatchback', estado: 'activo', parqueaderoId: '4', celdaId: 'c63', fechaEntrada: '2025-06-20T08:30' },
  { id: 'v5', conductorId: '5', placa: 'MNO345', tipo: 'carro', marca: 'Kia', modelo: 'Rio', año: 2020, color: 'Negro', descripcion: 'Sedán', estado: 'activo', parqueaderoId: '1', celdaId: 'c1', fechaEntrada: '2025-06-20T08:55' },
  { id: 'v6', conductorId: '6', placa: 'PQR678', tipo: 'carro', marca: 'Hyundai', modelo: 'Accent', año: 2021, color: 'Plateado', descripcion: 'Sedán', estado: 'activo', parqueaderoId: '2', celdaId: 'c26', fechaEntrada: '2025-06-20T09:10' },
  { id: 'v7', conductorId: '7', placa: 'STU901', tipo: 'moto', marca: 'Yamaha', modelo: 'FZ 25', año: 2022, color: 'Negro', descripcion: 'Moto deportiva', estado: 'activo', parqueaderoId: '5', celdaId: 'c78', fechaEntrada: '2025-06-20T06:50' },
  { id: 'v8', conductorId: '8', placa: 'VWX234', tipo: 'moto', marca: 'Suzuki', modelo: 'GN 125', año: 2021, color: 'Rojo', descripcion: 'Moto clásica', estado: 'activo', parqueaderoId: '5', celdaId: 'c79', fechaEntrada: '2025-06-20T07:00' },
  { id: 'v9', conductorId: '9', placa: 'YZA567', tipo: 'moto', marca: 'Honda', modelo: 'CB 190', año: 2023, color: 'Azul', descripcion: 'Moto street', estado: 'activo', parqueaderoId: '6', celdaId: 'c113', fechaEntrada: '2025-06-20T07:20' },
  { id: 'v10', conductorId: '10', placa: 'BCD890', tipo: 'moto', marca: 'Bajaj', modelo: 'Pulsar NS 200', año: 2022, color: 'Blanco', descripcion: 'Moto deportiva', estado: 'activo', parqueaderoId: '6', celdaId: 'c114', fechaEntrada: '2025-06-20T07:40' },
  { id: 'v11', conductorId: '1', placa: 'EFG123', tipo: 'moto', marca: 'KTM', modelo: 'Duke 200', año: 2023, color: 'Naranja', descripcion: 'Moto naked', estado: 'activo', parqueaderoId: '5', celdaId: 'c80', fechaEntrada: '2025-06-20T08:00' },
  { id: 'v12', conductorId: '3', placa: 'HIJ456', tipo: 'moto', marca: 'TVS', modelo: 'Apache RTR 200', año: 2022, color: 'Negro', descripcion: 'Moto deportiva', estado: 'activo', parqueaderoId: '6', celdaId: 'c115', fechaEntrada: '2025-06-20T08:25' },
];

const initialControlesSalida: ControlSalida[] = [
  { id: 'cs1', vehiculoId: 'v1', celdaId: 'c0', fechaEntrada: '2025-06-20T07:15', estado: 'en_parqueadero' },
  { id: 'cs2', vehiculoId: 'v2', celdaId: 'c45', fechaEntrada: '2025-06-20T07:45', estado: 'en_parqueadero' },
  { id: 'cs3', vehiculoId: 'v3', celdaId: 'c25', fechaEntrada: '2025-06-20T08:10', estado: 'en_parqueadero' },
  { id: 'cs4', vehiculoId: 'v4', celdaId: 'c63', fechaEntrada: '2025-06-20T08:30', estado: 'en_parqueadero' },
  { id: 'cs5', vehiculoId: 'v5', celdaId: 'c1', fechaEntrada: '2025-06-20T08:55', estado: 'en_parqueadero' },
  { id: 'cs6', vehiculoId: 'v6', celdaId: 'c26', fechaEntrada: '2025-06-20T09:10', estado: 'en_parqueadero' },
  { id: 'cs7', vehiculoId: 'v7', celdaId: 'c78', fechaEntrada: '2025-06-20T06:50', estado: 'en_parqueadero' },
  { id: 'cs8', vehiculoId: 'v8', celdaId: 'c79', fechaEntrada: '2025-06-20T07:00', estado: 'en_parqueadero' },
  { id: 'cs9', vehiculoId: 'v9', celdaId: 'c113', fechaEntrada: '2025-06-20T07:20', estado: 'en_parqueadero' },
  { id: 'cs10', vehiculoId: 'v10', celdaId: 'c114', fechaEntrada: '2025-06-20T07:40', estado: 'en_parqueadero' },
  { id: 'cs11', vehiculoId: 'v11', celdaId: 'c80', fechaEntrada: '2025-06-20T08:00', estado: 'en_parqueadero' },
  { id: 'cs12', vehiculoId: 'v12', celdaId: 'c115', fechaEntrada: '2025-06-20T08:25', estado: 'en_parqueadero' },
];

const initialMovimientos: Movimiento[] = [
  { id: 'm1', placa: 'ABC123', tipo: 'entrada', fecha: '2025-06-20T07:15', parqueaderoId: '1', conductorNombre: 'Carlos López M.' },
  { id: 'm2', placa: 'STU901', tipo: 'entrada', fecha: '2025-06-20T06:50', parqueaderoId: '5', conductorNombre: 'Diego Herrera F.' },
  { id: 'm3', placa: 'VWX234', tipo: 'entrada', fecha: '2025-06-20T07:00', parqueaderoId: '5', conductorNombre: 'Sofía Castillo' },
  { id: 'm4', placa: 'DEF456', tipo: 'entrada', fecha: '2025-06-20T07:45', parqueaderoId: '3', conductorNombre: 'Ana Martínez R.' },
  { id: 'm5', placa: 'GHI789', tipo: 'entrada', fecha: '2025-06-20T08:10', parqueaderoId: '2', conductorNombre: 'Pedro Ruiz G.' },
  { id: 'm6', placa: 'JKL012', tipo: 'entrada', fecha: '2025-06-20T08:30', parqueaderoId: '4', conductorNombre: 'María Díaz P.' },
  { id: 'm7', placa: 'MNO345', tipo: 'entrada', fecha: '2025-06-20T08:55', parqueaderoId: '1', conductorNombre: 'Jorge Silva T.' },
  { id: 'm8', placa: 'PQR678', tipo: 'entrada', fecha: '2025-06-20T09:10', parqueaderoId: '2', conductorNombre: 'Laura Gómez H.' },
  { id: 'm9', placa: 'YZA567', tipo: 'entrada', fecha: '2025-06-20T07:20', parqueaderoId: '6', conductorNombre: 'Andrés Morales' },
  { id: 'm10', placa: 'BCD890', tipo: 'entrada', fecha: '2025-06-20T07:40', parqueaderoId: '6', conductorNombre: 'Camila Rodríguez' },
  { id: 'm11', placa: 'EFG123', tipo: 'entrada', fecha: '2025-06-20T08:00', parqueaderoId: '5', conductorNombre: 'Carlos López M.' },
  { id: 'm12', placa: 'HIJ456', tipo: 'entrada', fecha: '2025-06-20T08:25', parqueaderoId: '6', conductorNombre: 'Pedro Ruiz G.' },
  { id: 'm13', placa: 'XYZ999', tipo: 'salida', fecha: '2025-06-20T11:30', parqueaderoId: '1', conductorNombre: 'Roberto Díaz' },
  { id: 'm14', placa: 'LMN777', tipo: 'salida', fecha: '2025-06-20T12:00', parqueaderoId: '3', conductorNombre: 'Patricia Luna' },
  { id: 'm15', placa: 'QWE888', tipo: 'salida', fecha: '2025-06-20T12:45', parqueaderoId: '2', conductorNombre: 'Fernando Vega' },
  { id: 'm16', placa: 'RTY333', tipo: 'salida', fecha: '2025-06-20T13:15', parqueaderoId: '5', conductorNombre: 'Lucía Torres' },
];

/* ═══════════════════════════════════════════════════════
   PROVIDER
   ═══════════════════════════════════════════════════════ */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<Rol[]>(initialRoles);
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [parqueaderos, setParqueaderos] = useState<Parqueadero[]>(initialParqueaderos);
  const [celdas, setCeldas] = useState<Celda[]>(initialCeldas);
  const [conductores, setConductores] = useState<Conductor[]>(initialConductores);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(initialVehiculos);
  const [asignaciones, setAsignaciones] = useState<AsignacionCelda[]>([]);
  const [controlesSalida, setControlesSalida] = useState<ControlSalida[]>(initialControlesSalida);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [movimientos] = useState<Movimiento[]>(initialMovimientos);

  /* ── CRUD Roles ── */
  const addRol = (rol: Omit<Rol, 'id'>) => setRoles(prev => [...prev, { ...rol, id: Date.now().toString() }]);
  const updateRol = (id: string, rol: Partial<Rol>) => setRoles(prev => prev.map(r => r.id === id ? { ...r, ...rol } : r));
  const deleteRol = (id: string) => setRoles(prev => prev.filter(r => r.id !== id));

  /* ── CRUD Usuarios ── */
  const addUsuario = (usuario: Omit<Usuario, 'id'>) => setUsuarios(prev => [...prev, { ...usuario, id: Date.now().toString() }]);
  const updateUsuario = (id: string, usuario: Partial<Usuario>) => setUsuarios(prev => prev.map(u => u.id === id ? { ...u, ...usuario } : u));
  const deleteUsuario = (id: string) => setUsuarios(prev => prev.filter(u => u.id !== id));

  /* ── CRUD Parqueaderos ── */
  const addParqueadero = (parqueadero: Omit<Parqueadero, 'id'>) => {
    const newPq = { ...parqueadero, id: Date.now().toString() };
    setParqueaderos(prev => [...prev, newPq]);
    const newCeldas: Omit<Celda, 'id'>[] = [];
    let cnt = 1;
    for (let i = 0; i < parqueadero.celdasCarros; i++) newCeldas.push({ parqueaderoId: newPq.id, numero: `C-${String(cnt).padStart(3, '0')}`, tipo: 'carro', estado: 'disponible', ocupada: false, nombre: `${newPq.nombre}-C${cnt}` });
    for (let i = 0; i < parqueadero.celdasMotos; i++) newCeldas.push({ parqueaderoId: newPq.id, numero: `M-${String(cnt).padStart(3, '0')}`, tipo: 'moto', estado: 'disponible', ocupada: false, nombre: `${newPq.nombre}-M${cnt}` });
    for (let i = 0; i < parqueadero.celdasMovilidadReducida; i++) newCeldas.push({ parqueaderoId: newPq.id, numero: `MR-${String(cnt).padStart(3, '0')}`, tipo: 'movilidad reducida', estado: 'disponible', ocupada: false, nombre: `${newPq.nombre}-MR${cnt}` });
    setCeldas(prev => [...prev, ...newCeldas.map(c => ({ ...c, id: `${Date.now()}-${cnt++}` }))]);
  };
  const updateParqueadero = (id: string, parqueadero: Partial<Parqueadero>) => setParqueaderos(prev => prev.map(p => p.id === id ? { ...p, ...parqueadero } : p));
  const deleteParqueadero = (id: string) => { setParqueaderos(prev => prev.filter(p => p.id !== id)); setCeldas(prev => prev.filter(c => c.parqueaderoId !== id)); };

  /* ── CRUD Celdas ── */
  const addCelda = (celda: Omit<Celda, 'id'>) => setCeldas(prev => [...prev, { ...celda, id: Date.now().toString() }]);
  const updateCelda = (id: string, celda: Partial<Celda>) => setCeldas(prev => prev.map(c => c.id === id ? { ...c, ...celda } : c));
  const deleteCelda = (id: string) => setCeldas(prev => prev.filter(c => c.id !== id));

  /* ── CRUD Conductores ── */
  const addConductor = (conductor: Omit<Conductor, 'id'>) => setConductores(prev => [...prev, { ...conductor, id: Date.now().toString() }]);
  const updateConductor = (id: string, conductor: Partial<Conductor>) => setConductores(prev => prev.map(c => c.id === id ? { ...c, ...conductor } : c));
  const deleteConductor = (id: string) => setConductores(prev => prev.filter(c => c.id !== id));

  /* ── CRUD Vehículos ── */
  const addVehiculo = (vehiculo: Omit<Vehiculo, 'id'>) => setVehiculos(prev => [...prev, { ...vehiculo, id: Date.now().toString() }]);
  const updateVehiculo = (id: string, vehiculo: Partial<Vehiculo>) => setVehiculos(prev => prev.map(v => v.id === id ? { ...v, ...vehiculo } : v));
  const deleteVehiculo = (id: string) => setVehiculos(prev => prev.filter(v => v.id !== id));

  /* ── CRUD Asignaciones ── */
  const addAsignacion = (asignacion: Omit<AsignacionCelda, 'id'>) => setAsignaciones(prev => [...prev, { ...asignacion, id: Date.now().toString() }]);
  const updateAsignacion = (id: string, asignacion: Partial<AsignacionCelda>) => setAsignaciones(prev => prev.map(a => a.id === id ? { ...a, ...asignacion } : a));
  const deleteAsignacion = (id: string) => setAsignaciones(prev => prev.filter(a => a.id !== id));

  /* ── CRUD Control Salida ── */
  const addControlSalida = (control: Omit<ControlSalida, 'id'>) => setControlesSalida(prev => [...prev, { ...control, id: Date.now().toString() }]);
  const updateControlSalida = (id: string, control: Partial<ControlSalida>) => setControlesSalida(prev => prev.map(c => c.id === id ? { ...c, ...control } : c));
  const deleteControlSalida = (id: string) => setControlesSalida(prev => prev.filter(c => c.id !== id));

  /* ── CRUD Reservas ── */
  const addReserva = (reserva: Omit<Reserva, 'id'>) => setReservas(prev => [...prev, { ...reserva, id: Date.now().toString() }]);
  const updateReserva = (id: string, reserva: Partial<Reserva>) => setReservas(prev => prev.map(r => r.id === id ? { ...r, ...reserva } : r));
  const deleteReserva = (id: string) => setReservas(prev => prev.filter(r => r.id !== id));

  /* Movimientos se calculan automáticamente desde controlesSalida + vehiculos */
  const movimientosDerivados = useMemo((): Movimiento[] => {
    const movs: Movimiento[] = [...movimientos];
    for (const cs of controlesSalida) {
      const veh = vehiculos.find(v => v.id === cs.vehiculoId);
      const cond = conductores.find(c => c.id === veh?.conductorId);
      if (!veh || !cond) continue;
      movs.push({
        id: `mv-${cs.id}`,
        placa: veh.placa,
        tipo: cs.estado === 'en_parqueadero' ? 'entrada' : 'salida',
        fecha: cs.fechaEntrada,
        parqueaderoId: veh.parqueaderoId,
        conductorNombre: cond.nombre,
      });
      if (cs.fechaSalida) {
        movs.push({
          id: `mv-out-${cs.id}`,
          placa: veh.placa,
          tipo: 'salida',
          fecha: cs.fechaSalida,
          parqueaderoId: veh.parqueaderoId,
          conductorNombre: cond.nombre,
        });
      }
    }
    return movs;
  }, [movimientos, controlesSalida, vehiculos, conductores]);

  return (
    <DataContext.Provider value={{
      roles, addRol, updateRol, deleteRol,
      usuarios, addUsuario, updateUsuario, deleteUsuario,
      parqueaderos, addParqueadero, updateParqueadero, deleteParqueadero,
      celdas, addCelda, updateCelda, deleteCelda,
      conductores, addConductor, updateConductor, deleteConductor,
      vehiculos, addVehiculo, updateVehiculo, deleteVehiculo,
      asignaciones, addAsignacion, updateAsignacion, deleteAsignacion,
      controlesSalida, addControlSalida, updateControlSalida, deleteControlSalida,
      reservas, addReserva, updateReserva, deleteReserva,
      movimientos: movimientosDerivados,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
}
