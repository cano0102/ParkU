import React, { createContext, useContext, useState } from 'react';

// Tipos de datos
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
}

export interface Celda {
  id: string;
  parqueaderoId: string;
  numero: string;
  tipo: 'carro' | 'moto' | 'movilidad reducida';
  estado: 'disponible' | 'no_disponible' | 'reservada' | 'mantenimiento';
  ocupada: boolean;
}

export interface Conductor {
  id: string;
  usuarioId: string;
  tipoConductor: 'aprendiz' | 'instructor';
  centroFormacion: string;
  discapacidad: boolean;
  tipoDiscapacidad?: string;
  estado: 'activo' | 'inactivo';
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

interface DataContextType {
  // Roles
  roles: Rol[];
  addRol: (rol: Omit<Rol, 'id'>) => void;
  updateRol: (id: string, rol: Partial<Rol>) => void;
  deleteRol: (id: string) => void;
  
  // Usuarios
  usuarios: Usuario[];
  addUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  updateUsuario: (id: string, usuario: Partial<Usuario>) => void;
  deleteUsuario: (id: string) => void;
  
  // Parqueaderos
  parqueaderos: Parqueadero[];
  addParqueadero: (parqueadero: Omit<Parqueadero, 'id'>) => void;
  updateParqueadero: (id: string, parqueadero: Partial<Parqueadero>) => void;
  deleteParqueadero: (id: string) => void;
  
  // Celdas
  celdas: Celda[];
  addCelda: (celda: Omit<Celda, 'id'>) => void;
  updateCelda: (id: string, celda: Partial<Celda>) => void;
  deleteCelda: (id: string) => void;
  
  // Conductores
  conductores: Conductor[];
  addConductor: (conductor: Omit<Conductor, 'id'>) => void;
  updateConductor: (id: string, conductor: Partial<Conductor>) => void;
  deleteConductor: (id: string) => void;
  
  // Vehículos
  vehiculos: Vehiculo[];
  addVehiculo: (vehiculo: Omit<Vehiculo, 'id'>) => void;
  updateVehiculo: (id: string, vehiculo: Partial<Vehiculo>) => void;
  deleteVehiculo: (id: string) => void;
  
  // Asignaciones
  asignaciones: AsignacionCelda[];
  addAsignacion: (asignacion: Omit<AsignacionCelda, 'id'>) => void;
  updateAsignacion: (id: string, asignacion: Partial<AsignacionCelda>) => void;
  deleteAsignacion: (id: string) => void;
  
  // Control de Salida
  controlesSalida: ControlSalida[];
  addControlSalida: (control: Omit<ControlSalida, 'id'>) => void;
  updateControlSalida: (id: string, control: Partial<ControlSalida>) => void;
  deleteControlSalida: (id: string) => void;
  
  // Reservas
  reservas: Reserva[];
  addReserva: (reserva: Omit<Reserva, 'id'>) => void;
  updateReserva: (id: string, reserva: Partial<Reserva>) => void;
  deleteReserva: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Datos iniciales de ejemplo
const initialRoles: Rol[] = [
  {
    id: '1',
    nombre: 'Administrador',
    descripcion: 'Acceso total al sistema',
    permisos: {
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
      reconocimientoPlacas: true
    },
    estado: 'activo'
  },
  {
    id: '2',
    nombre: 'Operador',
    descripcion: 'Gestión de entradas y salidas',
    permisos: {
      dashboard: true,
      roles: false,
      usuarios: false,
      conductores: true,
      vehiculos: true,
      parqueaderos: false,
      celdas: true,
      asignaciones: true,
      entradaSalida: true,
      reservas: true,
      incidentes: true,
      reconocimientoPlacas: true
    },
    estado: 'activo'
  },
  {
    id: '3',
    nombre: 'Usuario',
    descripcion: 'Acceso básico',
    permisos: {
      dashboard: true,
      roles: false,
      usuarios: false,
      conductores: false,
      vehiculos: false,
      parqueaderos: false,
      celdas: false,
      asignaciones: false,
      entradaSalida: false,
      reservas: true,
      incidentes: false,
      reconocimientoPlacas: false
    },
    estado: 'activo'
  },
];

const initialUsuarios: Usuario[] = [
  { id: '1', correo: 'admin@parku.edu', password: 'admin123', nombre: 'Juan Pérez', numero: '3001234567', rol: 'Administrador', tipoDocumento: 'CC', identificacion: '1234567890', estado: 'activo' },
  { id: '2', correo: 'operador@parku.edu', password: 'operador123', nombre: 'María González', numero: '3009876543', rol: 'Operador', tipoDocumento: 'CC', identificacion: '0987654321', estado: 'activo' },
];

const initialParqueaderos: Parqueadero[] = [
  { id: '1', nombre: 'Parqueadero Central', direccion: 'Calle 100 # 50-30', capacidad: 150, horaInicio: '06:00', horaFin: '22:00', celdasCarros: 100, celdasMotos: 40, celdasMovilidadReducida: 10, descripcion: 'Parqueadero principal del campus', estado: 'activo' },
  { id: '2', nombre: 'Parqueadero Norte', direccion: 'Carrera 50 # 105-20', capacidad: 80, horaInicio: '07:00', horaFin: '20:00', celdasCarros: 50, celdasMotos: 25, celdasMovilidadReducida: 5, descripcion: 'Parqueadero edificio norte', estado: 'activo' },
];

const initialCeldas: Celda[] = [
  { id: '1', parqueaderoId: '1', numero: 'A-001', tipo: 'carro', estado: 'disponible', ocupada: false },
  { id: '2', parqueaderoId: '1', numero: 'A-002', tipo: 'carro', estado: 'no_disponible', ocupada: true },
  { id: '3', parqueaderoId: '1', numero: 'M-001', tipo: 'moto', estado: 'disponible', ocupada: false },
  { id: '4', parqueaderoId: '1', numero: 'MR-001', tipo: 'movilidad reducida', estado: 'disponible', ocupada: false },
];

const initialConductores: Conductor[] = [
  { id: '1', usuarioId: '1', tipoConductor: 'instructor', centroFormacion: 'Ingeniería', discapacidad: false, estado: 'activo' },
  { id: '2', usuarioId: '2', tipoConductor: 'aprendiz', centroFormacion: 'Administración', discapacidad: false, estado: 'activo' },
];

const initialVehiculos: Vehiculo[] = [
  { id: '1', conductorId: '1', placa: 'ABC123', tipo: 'carro', marca: 'Toyota', modelo: 'Corolla', año: 2020, color: 'Blanco', descripcion: 'Sedán 4 puertas', estado: 'activo' },
  { id: '2', conductorId: '2', placa: 'XYZ789', tipo: 'moto', marca: 'Yamaha', modelo: 'FZ', año: 2021, color: 'Negro', descripcion: 'Moto deportiva', estado: 'activo' },
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<Rol[]>(initialRoles);
  const [usuarios, setUsuarios] = useState<Usuario[]>(initialUsuarios);
  const [parqueaderos, setParqueaderos] = useState<Parqueadero[]>(initialParqueaderos);
  const [celdas, setCeldas] = useState<Celda[]>(initialCeldas);
  const [conductores, setConductores] = useState<Conductor[]>(initialConductores);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(initialVehiculos);
  const [asignaciones, setAsignaciones] = useState<AsignacionCelda[]>([]);
  const [controlesSalida, setControlesSalida] = useState<ControlSalida[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  // Funciones CRUD para Roles
  const addRol = (rol: Omit<Rol, 'id'>) => {
    const newRol = { ...rol, id: Date.now().toString() };
    setRoles([...roles, newRol]);
  };

  const updateRol = (id: string, rol: Partial<Rol>) => {
    setRoles(roles.map(r => r.id === id ? { ...r, ...rol } : r));
  };

  const deleteRol = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  // Funciones CRUD para Usuarios
  const addUsuario = (usuario: Omit<Usuario, 'id'>) => {
    const newUsuario = { ...usuario, id: Date.now().toString() };
    setUsuarios([...usuarios, newUsuario]);
  };

  const updateUsuario = (id: string, usuario: Partial<Usuario>) => {
    setUsuarios(usuarios.map(u => u.id === id ? { ...u, ...usuario } : u));
  };

  const deleteUsuario = (id: string) => {
    setUsuarios(usuarios.filter(u => u.id !== id));
  };

  // Funciones CRUD para Parqueaderos
  const addParqueadero = (parqueadero: Omit<Parqueadero, 'id'>) => {
    const newParqueadero = { ...parqueadero, id: Date.now().toString() };
    setParqueaderos([...parqueaderos, newParqueadero]);

    // Crear celdas automáticamente
    const newCeldas: Celda[] = [];
    let contador = 1;

    // Celdas para carros
    for (let i = 0; i < parqueadero.celdasCarros; i++) {
      newCeldas.push({
        id: `${Date.now()}-${contador}`,
        parqueaderoId: newParqueadero.id,
        numero: `C-${String(contador).padStart(3, '0')}`,
        tipo: 'carro',
        estado: 'disponible',
        ocupada: false
      });
      contador++;
    }

    // Celdas para motos
    for (let i = 0; i < parqueadero.celdasMotos; i++) {
      newCeldas.push({
        id: `${Date.now()}-${contador}`,
        parqueaderoId: newParqueadero.id,
        numero: `M-${String(contador).padStart(3, '0')}`,
        tipo: 'moto',
        estado: 'disponible',
        ocupada: false
      });
      contador++;
    }

    // Celdas para movilidad reducida
    for (let i = 0; i < parqueadero.celdasMovilidadReducida; i++) {
      newCeldas.push({
        id: `${Date.now()}-${contador}`,
        parqueaderoId: newParqueadero.id,
        numero: `MR-${String(contador).padStart(3, '0')}`,
        tipo: 'movilidad reducida',
        estado: 'disponible',
        ocupada: false
      });
      contador++;
    }

    if (newCeldas.length > 0) {
      setCeldas([...celdas, ...newCeldas]);
    }
  };

  const updateParqueadero = (id: string, parqueadero: Partial<Parqueadero>) => {
    setParqueaderos(parqueaderos.map(p => p.id === id ? { ...p, ...parqueadero } : p));
  };

  const deleteParqueadero = (id: string) => {
    setParqueaderos(parqueaderos.filter(p => p.id !== id));
  };

  // Funciones CRUD para Celdas
  const addCelda = (celda: Omit<Celda, 'id'>) => {
    const newCelda = { ...celda, id: Date.now().toString() };
    setCeldas([...celdas, newCelda]);
  };

  const updateCelda = (id: string, celda: Partial<Celda>) => {
    setCeldas(celdas.map(c => c.id === id ? { ...c, ...celda } : c));
  };

  const deleteCelda = (id: string) => {
    setCeldas(celdas.filter(c => c.id !== id));
  };

  // Funciones CRUD para Conductores
  const addConductor = (conductor: Omit<Conductor, 'id'>) => {
    const newConductor = { ...conductor, id: Date.now().toString() };
    setConductores([...conductores, newConductor]);
  };

  const updateConductor = (id: string, conductor: Partial<Conductor>) => {
    setConductores(conductores.map(c => c.id === id ? { ...c, ...conductor } : c));
  };

  const deleteConductor = (id: string) => {
    setConductores(conductores.filter(c => c.id !== id));
  };

  // Funciones CRUD para Vehículos
  const addVehiculo = (vehiculo: Omit<Vehiculo, 'id'>) => {
    const newVehiculo = { ...vehiculo, id: Date.now().toString() };
    setVehiculos([...vehiculos, newVehiculo]);
  };

  const updateVehiculo = (id: string, vehiculo: Partial<Vehiculo>) => {
    setVehiculos(vehiculos.map(v => v.id === id ? { ...v, ...vehiculo } : v));
  };

  const deleteVehiculo = (id: string) => {
    setVehiculos(vehiculos.filter(v => v.id !== id));
  };

  // Funciones CRUD para Asignaciones
  const addAsignacion = (asignacion: Omit<AsignacionCelda, 'id'>) => {
    const newAsignacion = { ...asignacion, id: Date.now().toString() };
    setAsignaciones([...asignaciones, newAsignacion]);
  };

  const updateAsignacion = (id: string, asignacion: Partial<AsignacionCelda>) => {
    setAsignaciones(asignaciones.map(a => a.id === id ? { ...a, ...asignacion } : a));
  };

  const deleteAsignacion = (id: string) => {
    setAsignaciones(asignaciones.filter(a => a.id !== id));
  };

  // Funciones CRUD para Control de Salida
  const addControlSalida = (control: Omit<ControlSalida, 'id'>) => {
    const newControl = { ...control, id: Date.now().toString() };
    setControlesSalida([...controlesSalida, newControl]);
  };

  const updateControlSalida = (id: string, control: Partial<ControlSalida>) => {
    setControlesSalida(controlesSalida.map(c => c.id === id ? { ...c, ...control } : c));
  };

  const deleteControlSalida = (id: string) => {
    setControlesSalida(controlesSalida.filter(c => c.id !== id));
  };

  // Funciones CRUD para Reservas
  const addReserva = (reserva: Omit<Reserva, 'id'>) => {
    const newReserva = { ...reserva, id: Date.now().toString() };
    setReservas([...reservas, newReserva]);
  };

  const updateReserva = (id: string, reserva: Partial<Reserva>) => {
    setReservas(reservas.map(r => r.id === id ? { ...r, ...reserva } : r));
  };

  const deleteReserva = (id: string) => {
    setReservas(reservas.filter(r => r.id !== id));
  };

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
