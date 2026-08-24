/**
 * Store en memoria compartido por todos los módulos de src/services/.
 *
 * No hay backend real detrás de estos dominios (ver services/firebase.ts para la
 * única integración con Firebase, que hoy solo cubre el SDK de Auth y no está
 * conectada a ningún flujo activo). Este archivo reemplaza los `useState` que
 * antes vivían dentro de DataContext: mismos datos semilla, mismo generador de
 * ids, misma reconciliación cruzada entre parqueaderos/celdas/vehículos/control
 * de salida para que el plano de parqueaderos nunca muestre una celda "ocupada"
 * sin un vehículo que dibujar.
 *
 * No se exporta fuera de services/ — cada módulo de dominio (roles.ts,
 * usuarios.ts, etc.) es la única puerta de entrada a estos datos.
 *
 * Los tipos de cada entidad viven en `@/types` (fuente única); aquí solo se
 * reimportan/reexportan para que cada módulo de dominio siga resolviéndolos
 * vía `./_db` sin tener que tocar sus imports.
 */

import type {
  Rol, Usuario, Parqueadero, Celda, Conductor, Vehiculo,
  ControlSalida, Reserva, Movimiento, Incidente,
} from '@/types';

export type {
  Rol, Usuario, Parqueadero, Celda, Conductor, Vehiculo,
  ControlSalida, Reserva, Movimiento, Incidente,
};

export const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/** Tabla en memoria mínima: get/set de un array, para que cada servicio de
 * dominio pueda apoyarse en `createCrudService` (ver _crud.ts) sin repetir
 * el mismo `useState`-a-mano en cada archivo. */
export class Table<T> {
  private items: T[];
  constructor(seed: T[]) {
    this.items = seed;
  }
  get = (): T[] => this.items;
  set = (next: T[]): void => {
    this.items = next;
  };
}

/* ═══════════════════════════════════════════════════════
   DATOS INICIALES (portados 1:1 desde DataContext.tsx)
   ═══════════════════════════════════════════════════════ */

const initialRoles: Rol[] = [
  {
    id: '1', nombre: 'Administrador', descripcion: 'Acceso total al sistema',
    permisos: { dashboard: true, roles: true, usuarios: true, conductores: true, vehiculos: true, parqueaderos: true, celdas: true, asignaciones: true, entradaSalida: true, reservas: true, incidentes: true, reconocimientoPlacas: true },
    estado: 'activo',
  },
  {
    id: '2', nombre: 'Vigilante', descripcion: 'Gestión de entradas y salidas',
    permisos: { dashboard: true, roles: false, usuarios: false, conductores: true, vehiculos: true, parqueaderos: true, celdas: true, asignaciones: true, entradaSalida: true, reservas: true, incidentes: true, reconocimientoPlacas: true },
    estado: 'activo',
  },
  {
    id: '3', nombre: 'Comunidad SENA', descripcion: 'Acceso básico (rol por defecto para quien se registra por su cuenta: visitantes, estudiantes, docentes o administrativos)',
    permisos: { dashboard: true, roles: false, usuarios: false, conductores: false, vehiculos: false, parqueaderos: false, celdas: false, asignaciones: false, entradaSalida: false, reservas: true, incidentes: false, reconocimientoPlacas: false },
    estado: 'activo',
  },
];

/* El campo `rol` contiene el NOMBRE del rol (p. ej. "Administrador"), no su id
   — así lo guarda UsuarioFormModal y así lo leen Usuarios y el login. */
const initialUsuarios: Usuario[] = [
  { id: '1', correo: 'admin@sena.edu.co', password: 'Pass1234', nombre: 'Administrador ParkU', numero: '3101234567', rol: 'Administrador', tipoUsuario: 'administrativo', tipoDocumento: 'CC', identificacion: '1234567890', estado: 'activo' },
  { id: '1', correo: 'carlos.lopez@sena.edu.co', password: 'Pass1234', nombre: 'Carlos López M.', numero: '3101234567', rol: 'Administrador', tipoUsuario: 'docente', tipoDocumento: 'CC', identificacion: '1234567890', estado: 'activo' },
  { id: '2', correo: 'ana.martinez@sena.edu.co', password: 'Pass1234', nombre: 'Ana Martínez R.', numero: '3102345678', rol: 'Vigilante', tipoUsuario: 'administrativo', tipoDocumento: 'CC', identificacion: '2345678901', estado: 'activo' },
  { id: '3', correo: 'pedro.ruiz@sena.edu.co', password: 'Pass1234', nombre: 'Pedro Ruiz G.', numero: '3103456789', rol: 'Vigilante', tipoUsuario: 'docente', tipoDocumento: 'CC', identificacion: '3456789012', estado: 'activo' },
  { id: '4', correo: 'maria.diaz@ext.com', password: 'Pass1234', nombre: 'María Díaz P.', numero: '3104567890', rol: 'Comunidad SENA', tipoUsuario: 'visitante', tipoDocumento: 'CC', identificacion: '4567890123', estado: 'activo' },
  { id: '5', correo: 'jorge.silva@sena.edu.co', password: 'Pass1234', nombre: 'Jorge Silva T.', numero: '3105678901', rol: 'Administrador', tipoUsuario: 'administrativo', tipoDocumento: 'CC', identificacion: '5678901234', estado: 'activo' },
  { id: '6', correo: 'laura.gomez@sena.edu.co', password: 'Pass1234', nombre: 'Laura Gómez H.', numero: '3106789012', rol: 'Vigilante', tipoUsuario: 'docente', tipoDocumento: 'CC', identificacion: '6789012345', estado: 'activo' },
  { id: '7', correo: 'diego.herrera@sena.edu.co', password: 'Pass1234', nombre: 'Diego Herrera F.', numero: '3107890123', rol: 'Vigilante', tipoUsuario: 'administrativo', tipoDocumento: 'CC', identificacion: '7890123456', estado: 'activo' },
  { id: '8', correo: 'sofia.castillo@ext.com', password: 'Pass1234', nombre: 'Sofía Castillo', numero: '3108901234', rol: 'Comunidad SENA', tipoUsuario: 'visitante', tipoDocumento: 'CC', identificacion: '8901234567', estado: 'activo' },
  { id: '9', correo: 'andres.morales@sena.edu.co', password: 'Pass1234', nombre: 'Andrés Morales', numero: '3109012345', rol: 'Administrador', tipoUsuario: 'docente', tipoDocumento: 'CC', identificacion: '9012345678', estado: 'activo' },
  { id: '10', correo: 'camila.rodriguez@sena.edu.co', password: 'Pass1234', nombre: 'Camila Rodríguez', numero: '3100123456', rol: 'Comunidad SENA', tipoUsuario: 'administrativo', tipoDocumento: 'CC', identificacion: '0123456789', estado: 'activo' },
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

/* PRNG determinista (seed -> [0,1)) para que los datos de demo no cambien en cada recarga */
const seededRatio = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

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
        const r = seededRatio(idx);
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
  { id: '3', usuarioId: '3', nombre: 'Pedro Ruiz G.', tipoConductor: 'instructor', centroFormacion: 'Diseño', discapacidad: false, estado: 'activo', tipo: 'docente', email: 'pedro.ruiz@sena.edu.co' },
  { id: '4', usuarioId: '4', nombre: 'María Díaz P.', tipoConductor: 'aprendiz', centroFormacion: 'Gestión Empresarial', discapacidad: false, estado: 'activo', tipo: 'visitante', email: 'maria.diaz@ext.com' },
  { id: '5', usuarioId: '5', nombre: 'Jorge Silva T.', tipoConductor: 'instructor', centroFormacion: 'Informática', discapacidad: false, estado: 'activo', tipo: 'administrativo', email: 'jorge.silva@sena.edu.co' },
  { id: '6', usuarioId: '6', nombre: 'Laura Gómez H.', tipoConductor: 'aprendiz', centroFormacion: 'Ingeniería', discapacidad: false, estado: 'activo', tipo: 'docente', email: 'laura.gomez@sena.edu.co' },
  { id: '7', usuarioId: '7', nombre: 'Diego Herrera F.', tipoConductor: 'instructor', centroFormacion: 'Electricidad', discapacidad: false, estado: 'activo', tipo: 'administrativo', email: 'diego.herrera@sena.edu.co' },
  { id: '8', usuarioId: '8', nombre: 'Sofía Castillo', tipoConductor: 'aprendiz', centroFormacion: 'Diseño Gráfico', discapacidad: true, tipoDiscapacidad: 'Visual', estado: 'activo', tipo: 'visitante', email: 'sofia.cast@ext.com' },
  { id: '9', usuarioId: '9', nombre: 'Andrés Morales', tipoConductor: 'instructor', centroFormacion: 'Mecánica', discapacidad: false, estado: 'activo', tipo: 'docente', email: 'andres.morales@sena.edu.co' },
  { id: '10', usuarioId: '10', nombre: 'Camila Rodríguez', tipoConductor: 'aprendiz', centroFormacion: 'Contabilidad', discapacidad: false, estado: 'activo', tipo: 'administrativo', email: 'camila.rodriguez@sena.edu.co' },
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

/* El generador aleatorio de initialCeldas no sabe qué celdas ya tienen asignado uno de los
   vehículos anteriores, así que puede marcarlas "disponible" o "reservada" aunque ya estén
   ocupadas. Se corrige aquí para que no quede un vehículo "fantasma" sin celda marcada. */
initialVehiculos.forEach((v) => {
  const celda = initialCeldas.find((c) => c.id === v.celdaId);
  if (celda && celda.estado !== 'no_disponible') {
    celda.estado = 'no_disponible';
    celda.ocupada = true;
  }
});

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

/* Completa cada celda "ocupada" restante (marcada así por el generador aleatorio, sin un
   vehículo real asociado) con un vehículo y control de salida sintéticos, para que el plano
   de parqueaderos nunca muestre una celda ocupada sin vehículo que dibujar. */
const LETRAS_PLACA = 'ABCDEFGHJKLMNPRSTUVXYZ';
const MARCAS_CARRO_DEMO = ['Chevrolet', 'Renault', 'Mazda', 'Kia', 'Toyota', 'Hyundai', 'Nissan', 'Ford'];
const MARCAS_MOTO_DEMO = ['Yamaha', 'Honda', 'Suzuki', 'Bajaj', 'AKT', 'TVS', 'KTM'];
const placasUsadas = new Set(initialVehiculos.map((v) => v.placa));
function generarPlacaSintetica(seed: number, esMoto: boolean): string {
  for (let intento = 0; intento < 50; intento++) {
    const s = seed + intento * 97;
    const letra = (n: number) => LETRAS_PLACA[Math.floor(seededRatio(s + n) * LETRAS_PLACA.length)];
    const digito = (n: number) => Math.floor(seededRatio(s + n + 50) * 10);
    const placa = esMoto
      ? `${letra(1)}${letra(2)}${letra(3)}${digito(4)}${digito(5)}${letra(6)}`
      : `${letra(1)}${letra(2)}${letra(3)}${digito(4)}${digito(5)}${digito(6)}`;
    if (!placasUsadas.has(placa)) { placasUsadas.add(placa); return placa; }
  }
  return `GEN${Math.floor(seededRatio(seed) * 900 + 100)}`;
}
initialCeldas
  .filter((c) => c.estado === 'no_disponible' && !initialVehiculos.some((v) => v.celdaId === c.id))
  .forEach((celda, i) => {
    const esMoto = celda.tipo === 'moto';
    const placa = generarPlacaSintetica(i * 131 + 17, esMoto);
    const marcas = esMoto ? MARCAS_MOTO_DEMO : MARCAS_CARRO_DEMO;
    const vehiculoId = `vg-${celda.id}`;
    const horasAtras = 1 + Math.floor(seededRatio(i * 53 + 3) * 8);
    const fechaEntrada = new Date(Date.now() - horasAtras * 3600000).toISOString().slice(0, 16);
    initialVehiculos.push({
      id: vehiculoId, conductorId: '', placa, tipo: esMoto ? 'moto' : 'carro',
      marca: marcas[i % marcas.length], modelo: '', año: 2018 + Math.floor(seededRatio(i * 71) * 7),
      color: '', descripcion: '', estado: 'activo',
      parqueaderoId: celda.parqueaderoId, celdaId: celda.id, fechaEntrada,
    });
    initialControlesSalida.push({
      id: `csg-${celda.id}`, vehiculoId, celdaId: celda.id, fechaEntrada, estado: 'en_parqueadero',
    });
  });

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

const initialIncidentes: Incidente[] = [
  {
    id: '1',
    descripcion: 'Vehículo mal estacionado bloqueando entrada',
    parqueaderoId: '1',
    celdaId: 'c0',
    celdaNumero: 'C-001',
    vehiculo: 'ABC123',
    conductor: 'Carlos López M.',
    fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'pendiente',
    asignadoA: 'Juan Pérez',
  },
  {
    id: '2',
    descripcion: 'Derrame de aceite con posible caída de vehículo',
    parqueaderoId: '3',
    celdaId: 'c45',
    celdaNumero: 'C-045',
    vehiculo: 'DEF456',
    conductor: 'Ana Martínez R.',
    fecha: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    estado: 'pendiente',
    asignadoA: 'Brandon Alexis',
  },
];

export const rolesTable = new Table<Rol>(initialRoles);
export const usuariosTable = new Table<Usuario>(initialUsuarios);
export const parqueaderosTable = new Table<Parqueadero>(initialParqueaderos);
export const celdasTable = new Table<Celda>(initialCeldas);
export const conductoresTable = new Table<Conductor>(initialConductores);
export const vehiculosTable = new Table<Vehiculo>(initialVehiculos);
export const controlSalidaTable = new Table<ControlSalida>(initialControlesSalida);
export const reservasTable = new Table<Reserva>([]);
export const incidentesTable = new Table<Incidente>(initialIncidentes);

/** Movimientos "base" (demo fija). El listado completo que se mostraba en el
 * Dashboard es 100% derivado de controlSalidaTable + vehiculosTable +
 * conductoresTable (ver el useMemo de movimientosDerivados en el antiguo
 * DataContext) — no tiene create/update/remove propios, así que no es un
 * servicio de dominio. La Fase 2 combina esta tabla con las otras tres en un
 * hook (useMovimientos) para reproducir exactamente ese cálculo. */
export const movimientosBaseTable = new Table<Movimiento>(initialMovimientos);
